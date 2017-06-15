'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _node = require('./node');

var _node2 = _interopRequireDefault(_node);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FckffDOM = function () {
	function FckffDOM(html) {
		_classCallCheck(this, FckffDOM);

		if (html.indexOf('<body>') === -1) {
			html = '<body>' + html + '</body>';
		}
		var $ = _cheerio2.default.load(html);
		/**
   * Clean clutter out
   */
		$('style').remove();
		$('script').remove();
		$('getLink').remove();
		$('meta').remove();

		this._title = $('title').text();
		this._lastId = -1;
		this._nodes = [];

		this._body = this._traverse($, 'body');
	}

	/**
  * If innerHtml of a tag is mixed getText and nodes, put getText into span tags so order is kept.
  * @param $
  * @private
  */


	_createClass(FckffDOM, [{
		key: '_closeHtml',
		value: function _closeHtml($, element) {
			var html = $(element).html();
			if ($(element).children().length > 0) {
				$(element)[0].children.forEach(function (child) {
					if (child.type === 'text') {
						var cleanText = child.data.replace(/\t/gi, '').replace(/\n/gi, ' ').replace(/\s+/gi, ' ');
						if (cleanText.replace(/\s/gi, '').length > 0) {
							html = html.replace(child.data, '<span>' + cleanText + '</span>');
						}
					}
				});
			}
			return html;
		}
	}, {
		key: '_getNextId',
		value: function _getNextId() {
			this._lastId++;
			return this._lastId;
		}
	}, {
		key: '_traverse',
		value: function _traverse($, element) {
			var _this = this;

			var parentId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1;

			$(element).html(this._closeHtml($, element));
			var cNode = $(element);
			var childElements = cNode.children();

			var id = this._getNextId();

			/**
    * A node has only _text, if it has no children.
    * There is no mixture of elements and _text allowed.
    * _closeHtml takes care of this.
    * @type {string}
    */
			var text = '';
			var children = [];
			if (childElements.length === 0) {
				text = cNode.text();
			} else {
				children = _lodash2.default.map(childElements, function (el) {
					return _this._traverse($, el, id);
				});
			}

			var classes = [];
			if (cNode.attr('class')) {
				classes = cNode.attr('class').split(' ');
			}
			var ids = [];
			if (cNode.attr('id')) {
				ids = cNode.attr('id').split(' ');
			}

			var node = new _node2.default(id, text, FckffDOM._getType(cNode[0].name), cNode.html(), parentId, this, cNode.attr('href'), FckffDOM._getData(cNode[0].attribs), classes, ids, children);
			this._nodes[id] = node;
			return node;
		}
	}, {
		key: 'querySelector',
		value: function querySelector(selector) {
			return _lodash2.default.first(this.querySelectorAll(selector));
		}
	}, {
		key: 'querySelectorAll',
		value: function querySelectorAll(selector) {
			return this._nodes.filter(function (node) {
				return node.isSelected(selector);
			});
		}
	}, {
		key: 'getNodeById',
		value: function getNodeById(id) {
			return this._nodes.filter(function (node) {
				return node.isSelected(id);
			})[0];
		}
	}, {
		key: 'body',
		value: function body() {
			return this._body;
		}
	}, {
		key: 'findByText',
		value: function findByText(text) {}
	}, {
		key: 'title',
		value: function title() {
			return this._title;
		}
	}, {
		key: 'getById',
		value: function getById(id) {
			return this._nodes[id];
		}
	}, {
		key: 'getLinks',
		value: function getLinks() {
			return this._nodes.filter(function (node) {
				return node.hasLink();
			}).map(function (node) {
				return node.getLink();
			});
		}
	}, {
		key: 'text',
		value: function text() {
			var body = this.body();
			if (body) {
				return body.text();
			}
			return '';
		}
	}, {
		key: 'html',
		value: function html() {
			var body = this.body();
			if (body) {
				return body.html();
			}
			return '';
		}
	}, {
		key: 'cleaneval',
		value: function cleaneval() {
			var body = this.body();
			if (body) {
				return body.getCleaneval();
			}
			return '';
		}
	}, {
		key: 'removeById',
		value: function removeById(id) {
			var node = this.getById(id);
			if (node) {
				var parent = node.getParent();
				if (parent) {
					var parentChildren = parent.getChildren().filter(function (n) {
						return n.getId() !== id;
					});
					parent._children = parentChildren;
				}
			}
			this._nodes = this._nodes.filter(function (n) {
				return n.getId() !== id;
			});
		}
	}], [{
		key: '_getType',
		value: function _getType(name) {
			switch (name.toLowerCase()) {
				case 'li':
					return 'l';
				case 'p':
					return 'p';
				case 'span':
					return 's';
				case 'a':
					return 'a';
				case 'h1':
					return 'h';
				case 'h2':
					return 'h';
				case 'h3':
					return 'h';
				case 'h4':
					return 'h';
				case 'h5':
					return 'h';
				case 'h6':
					return 'h';
				default:
					return 'd';
			}
		}
	}, {
		key: '_getData',
		value: function _getData(attributes) {
			if (_lodash2.default.isEmpty(attributes)) {
				return {};
			}
			var keys = _lodash2.default.keys(attributes).filter(function (k) {
				return k.match(/data-/);
			});
			if (keys.length === 0) {
				return {};
			}
			var data = {};
			keys.forEach(function (k) {
				data[k.replace('data-', '')] = attributes[k];
			});
			return data;
		}
	}]);

	return FckffDOM;
}();

exports.default = FckffDOM;