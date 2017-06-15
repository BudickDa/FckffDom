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
		var classes = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : [];
		var ids = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : [];
		var children = arguments.length > 10 && arguments[10] !== undefined ? arguments[10] : [];

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

		if (!_lodash2.default.isArray(classes)) {
			throw new TypeError('Node.constructor() parameter classes must be an array.');
		}

		if (!_lodash2.default.isArray(ids)) {
			throw new TypeError('Node.constructor() parameter ids must be an array.');
		}

		if (!_lodash2.default.isArray(children)) {
			throw new TypeError('Node.constructor() parameter children must be an array.');
		}

		this._id = id;
		this._text = text;
		this._type = type;
		this._parent = parent;
		this._dom = dom;
		this._hash = _crypto2.default.createHash('md5').update(innterHTML).digest('hex');
		this._link = link;
		this._data = data;
		this._classes = classes;
		this._ids = ids;
		this._children = children;
	}

	_createClass(Node, [{
		key: 'id',
		value: function id() {
			return this.getId();
		}
	}, {
		key: 'getId',
		value: function getId() {
			return this._id;
		}
	}, {
		key: 'hash',
		value: function hash() {
			return this.getHash();
		}
	}, {
		key: 'getHash',
		value: function getHash() {
			return this._hash;
		}
	}, {
		key: 'text',
		value: function text() {
			return this.getText();
		}
	}, {
		key: 'getText',
		value: function getText() {
			var full = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

			if (this.isLeaf()) {
				return this._text;
			}
			return this.getChildren().map(function (node) {
				return node.getText(full);
			}).join('');
		}
	}, {
		key: 'link',
		value: function link() {
			return this.getLink();
		}
	}, {
		key: 'getLink',
		value: function getLink() {
			return this._link;
		}
	}, {
		key: 'hasLink',
		value: function hasLink() {
			return Boolean(this._link);
		}
	}, {
		key: 'type',
		value: function type() {
			return this.getType();
		}
	}, {
		key: 'getType',
		value: function getType() {
			return this._type;
		}
	}, {
		key: 'parent',
		value: function parent() {
			return this.getParent();
		}
	}, {
		key: 'getParent',
		value: function getParent() {
			return this._dom.getById(this._parent);
		}
	}, {
		key: '_parentId',
		value: function _parentId() {
			return this._getParentId;
		}
	}, {
		key: '_getParentId',
		value: function _getParentId() {
			return this._parent;
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
			return this._children;
		}
	}, {
		key: 'getCleaneval',
		value: function getCleaneval() {
			var tag = this.getType();
			if (tag === 'p') {
				return '<' + tag + '>' + this.getText() + '\n';
			}
			if (tag === 'h') {
				return '<' + tag + '>' + this.getText() + '\n';
			}
			if (tag === 'l') {
				return '<' + tag + '>' + this.getText() + '\n';
			}
			if (tag === 's') {
				return '<p>' + this.getText() + '\n';
			}
			if (this.isLeaf()) {
				return '<p>' + this.getText(true) + '\n';
			}
			return this.getChildren().map(function (childNode) {
				return childNode.getCleaneval();
			}).join('\n');
		}
	}, {
		key: 'getClasses',
		value: function getClasses() {
			return this._classes;
		}
	}, {
		key: 'getIds',
		value: function getIds() {
			return this._ids;
		}
	}, {
		key: 'isSelected',
		value: function isSelected(selector) {
			var cString = selector.match(/\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)(?![^\{]*\})/gi);
			var idString = selector.match(/#(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)(?![^\{]*\})/gi);
			var selectedClasses = [];
			var selectedIds = [];

			if (cString) {
				cString.forEach(function (c) {
					selectedClasses.push(c.replace('.', ''));
				});
			}
			if (idString) {
				idString.forEach(function (i) {
					selectedIds.push(i.replace('#', ''));
				});
			}

			for (var i in selectedIds) {
				var id = selectedIds[i];
				if (!_lodash2.default.includes(this._ids, id)) {
					return false;
				}
			}

			for (var _i in selectedClasses) {
				var c = selectedClasses[_i];
				if (!_lodash2.default.includes(this._classes, c)) {
					return false;
				}
			}

			return true;
		}
	}, {
		key: 'isLeaf',
		value: function isLeaf() {
			return this._children.length === 0;
		}
	}, {
		key: 'getClasses',
		value: function getClasses() {
			return this._classes;
		}
	}, {
		key: 'getIds',
		value: function getIds() {
			return this._ids;
		}
	}, {
		key: 'data',
		value: function data(key, value) {
			if (value) {
				this.setData(key, value);
			} else {
				return this.getData(key);
			}
		}
	}, {
		key: 'getData',
		value: function getData(key) {
			if (!key) {
				this._data;
			}
			return this._data[key];
		}
	}, {
		key: 'setData',
		value: function setData(key, value) {
			this._data[key] = value;
		}
	}, {
		key: 'remove',
		value: function remove() {
			this.getChildren().forEach(function (n) {
				n.remove();
			});
			this._dom.removeById(this.getId());
		}
	}, {
		key: '_getHtmlTag',
		value: function _getHtmlTag() {
			var tag = '';
			switch (this._type) {
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

			if (_lodash2.default.isEmpty(this._data)) {
				return '';
			}
			return ' ' + _lodash2.default.keys(this._data).map(function (key) {
				return 'data-' + key + '="' + _this._data[key] + '"';
			}).join(' ');
		}
	}, {
		key: '_getHtmlClosingTag',
		value: function _getHtmlClosingTag() {
			switch (this._type) {
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
	}, {
		key: 'type',
		get: function get() {
			return this.getType();
		}
	}, {
		key: 'parent',
		get: function get() {
			return this.getParent();
		}
	}, {
		key: 'classList',
		get: function get() {
			return this._classes;
		}
	}, {
		key: 'idList',
		get: function get() {
			return this._ids;
		}
	}]);

	return Node;
}();

exports.default = Node;