'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _chance = require('chance');

var _chance2 = _interopRequireDefault(_chance);

var _fckffDom = require('./fckff-dom');

var _fckffDom2 = _interopRequireDefault(_fckffDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var chance = new _chance2.default();

var Node = function () {
	/**
  * Constructs a node
  * @param {number} id: Number that is unique within the Dom an can identify the node
  * @param {string} text: Text of the node, not of the children
  * @param {string} type: One of the five possible types: Heading (h), Paragraph (p), Anker (a), ListItem (l), Span (s), Box (d)
  * @param {string} innerHTML: HTML of the node, its md5 has is created to compare it quickly to other nodes.
  * @param {string} parent: IDs of the parent.
  * @param {string} link (optional): Every node can have a getLink. This can be usefull if this was a element with an event hanlder that routes to another page
  * @param {object} data (optional): plain old object. <span data-foo="bar" data-sense=42> becomes: {foo: 'bar', sense: 42}. You can use it to stores addional data in the dom.
  * @param {array} children (optional): IDs of the direct children.
  */
	function Node(id, text, type, innterHTML, parent, dom) {
		var link = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : '';
		var data = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : {};
		var children = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : [];

		_classCallCheck(this, Node);

		if (typeof id !== 'number') {
			throw new TypeError('Node.constructor() parameter id must be a number but is a ' + (typeof id === 'undefined' ? 'undefined' : _typeof(id)) + '\').');
		}
		if (typeof text !== 'string') {
			throw new TypeError('Node.constructor() parameter text must be a string but is a ' + (typeof text === 'undefined' ? 'undefined' : _typeof(text)) + '\').');
		}

		/**
   * There are only the following types allowed
   * h: Heading
   * p: Paragraph
   * a: Anker
   * l: List item
   * s: span
   * d: Box (div, nav, header, etc)
   */
		var allowedTypes = ['h', 's', 'p', 'a', 'l', 'd'];
		if (!_lodash2.default.includes(allowedTypes, type)) {
			throw new TypeError('Node.constructor() parameter type (\'' + type + '\') is not allowed.');
		}

		if (typeof innterHTML !== 'string') {
			throw new TypeError('Node.constructor() parameter innterHTML must be a string but is a ' + (typeof innterHTML === 'undefined' ? 'undefined' : _typeof(innterHTML)) + '\').');
		}

		if (typeof parent !== 'number') {
			throw new TypeError('Node.constructor() parameter parent must be a number but is a ' + (typeof parent === 'undefined' ? 'undefined' : _typeof(parent)) + '\').');
		}

		if (!dom instanceof _fckffDom2.default) {
			throw new TypeError('Node.constructor() parameter parent dom an instance of FckffDOM.');
		}

		if (typeof link !== 'string') {
			throw new TypeError('Node.constructor() parameter link must be a string but is a ' + (typeof link === 'undefined' ? 'undefined' : _typeof(link)) + '\').');
		}

		if (!_lodash2.default.isObject(data)) {
			throw new TypeError('Node.constructor() parameter data must be an object.');
		}

		if (!_lodash2.default.isArray(children)) {
			throw new TypeError('Node.constructor() parameter children must be an array.');
		}

		this.id = id;
		this.text = text;
		this.type = type;
		this.parent = parent;
		this.dom = dom;
		this.hash = _crypto2.default.createHash('md5').update(innterHTML).digest('hex');
		this.link = link;
		this.data = data;
		this.children = children;
	}

	_createClass(Node, [{
		key: 'getId',
		value: function getId() {
			return this.id;
		}
	}, {
		key: 'getText',
		value: function getText() {
			return this.text;
		}
	}, {
		key: 'getLink',
		value: function getLink() {
			return this.link;
		}

		/**
   * Alias of html() for consistencies sake.
   * html() is only there because I cannot be bothered to write three more letters.
   * @returns {*}
   */

	}, {
		key: 'getHtml',
		value: function getHtml() {
			return this.html();
		}
	}, {
		key: 'html',
		value: function html() {
			var children = this.getChildren();
			var content = children.length === 0 ? this.getText() : children.map(function (n) {
				return n.html();
			}).join('');
			return '' + this._getHtmlTag() + content + this._getHtmlClosingTag();
		}
	}, {
		key: 'getChildren',
		value: function getChildren() {
			return this.children;
		}
	}, {
		key: '_getHtmlTag',
		value: function _getHtmlTag() {
			var tag = '';
			switch (this.type) {
				case 'l':
					tag += 'li';
					break;
				case 'p':
					tag += 'p';
					break;
				case 's':
					tag += 'span';
					break;
				case 'a':
					if (this.getLink()) {
						tag += 'a href="' + this.getLink() + '"';
					} else {
						tag += 'a';
					}
					break;
				case 'h':
					tag += 'h1';
					break;
				default:
					tag += 'div';
					break;
			}
			return '<' + tag + this._getHtmlDataAttribute() + '>';
		}
	}, {
		key: '_getHtmlDataAttribute',
		value: function _getHtmlDataAttribute() {
			var _this = this;

			if (_lodash2.default.isEmpty(this.data)) {
				return '';
			}
			return ' ' + _lodash2.default.keys(this.data).map(function (key) {
				return 'data-' + key + '="' + _this.data[key] + '"';
			}).join(' ');
		}
	}, {
		key: '_getHtmlClosingTag',
		value: function _getHtmlClosingTag() {
			switch (this.type) {
				case 'l':
					return '</li>';
				case 'p':
					return '</p>';
				case 's':
					return '</span>';
				case 'a':
					return '</a>';
				case 'h':
					return '</h1>';
				default:
					return '</div>';
			}
		}
	}]);

	return Node;
}();

exports.default = Node;