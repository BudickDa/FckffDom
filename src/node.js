import _ from 'lodash';
import crypto from 'crypto';
import Chance from 'chance';
import FckffDOM from './fckff-dom';
const chance = new Chance();

export default class Node {
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
	constructor(id,
							text,
							type,
							innterHTML,
							parent,
							dom,
							link = '',
							data = {},
							classes = [],
							ids = [],
							children = []) {
		if (typeof id !== 'number') {
			throw new TypeError(`Node.constructor() parameter id must be a number but is a ${typeof id}').`);
		}
		if (typeof text !== 'string') {
			throw new TypeError(`Node.constructor() parameter text must be a string but is a ${typeof text}').`);
		}

		/**
		 * There are only the following types allowed
		 * h: Heading
		 * p: Paragraph
		 * a: Anker
		 * l: List item
		 * s: span
		 * d: Box (div, nav, header, etc)
		 * i: img (content is the url to source (native src attribute))
		 */
		const allowedTypes = ['h', 's', 'p', 'a', 'l', 'd', 'i'];
		if (!_.includes(allowedTypes, type)) {
			throw new TypeError(`Node.constructor() parameter type ('${type}') is not allowed.`);
		}

		if (typeof innterHTML !== 'string') {
			throw new TypeError(`Node.constructor() parameter innterHTML must be a string but is a ${typeof innterHTML}').`);
		}

		if (typeof parent !== 'number') {
			throw new TypeError(`Node.constructor() parameter parent must be a number but is a ${typeof parent}').`);
		}

		if (!dom instanceof FckffDOM) {
			throw new TypeError(`Node.constructor() parameter parent dom an instance of FckffDOM.`);
		}

		if (typeof link !== 'string') {
			throw new TypeError(`Node.constructor() parameter link must be a string but is a ${typeof link}').`);
		}

		if (!_.isObject(data)) {
			throw new TypeError(`Node.constructor() parameter data must be an object.`);
		}

		if (!_.isArray(classes)) {
			throw new TypeError(`Node.constructor() parameter classes must be an array.`);
		}

		if (!_.isArray(ids)) {
			throw new TypeError(`Node.constructor() parameter ids must be an array.`);
		}

		if (!_.isArray(children)) {
			throw new TypeError(`Node.constructor() parameter children must be an array.`);
		}

		this._id = id;
		this._text = text.replace(/\n|\t/gi, ' ').replace(/\s+/gi, ' ').trim();
		this._type = type
		this._parent = parent;
		this._dom = dom;
		this._hash = crypto.createHash('md5').update(innterHTML).digest('hex');
		this._link = link;
		this._data = data;
		this._classes = classes;
		this._ids = ids;
		this._children = children;

	}

	id() {
		return this.getId();
	}

	getId() {
		return this._id;
	}

	hash() {
		return this.getHash();
	}

	getHash() {
		return this._hash;
	}

	text() {
		return this.getText();
	}

	getText() {
    if(this.getType()==='i'){
      return '';
    }

		if (this.isLeaf()) {
			return this._text + ' ';
		}
		return this.getChildren().map(node => node.getText()).join('');
	}

	link() {
		return this.getLink();
	}

	getLink() {
		return this._link;
	}

	hasLink() {
		return Boolean(this._link);
	}


	get type() {
		return this.getType();
	}

	type() {
		return this.getType();
	}

	getType() {
		return this._type;
	}

	get parent() {
		return this.getParent();
	}

	parent() {
		return this.getParent();
	}

	getParent() {
		return this._dom.getById(this._parent);
	}

	_parentId() {
		return this._getParentId;
	}

	_getParentId() {
		return this._parent;
	}

	/**
	 * Alias of html() for consistencies sake.
	 * html() is only there because I cannot be bothered to write three more letters.
	 * @returns {*}
	 */
	getHtml() {
		return this.html();
	}

	html() {
		const children = this.getChildren();
		const content = children.length === 0 ? this.getText() : children.map(n => n.html()).join('');
		if(this._type==='i'){
			return `<img src="${content.trim()}"/>`;
		}
		return `${this._getHtmlTag()}${content.trim()}${this._getHtmlClosingTag()}`;
	}

	getSiblings() {
		if (this._parent === -1) {
			return [];
		}
		const parent = this.getParent();
		if (parent) {
			return parent.getChildren().filter(c => c.getId() !== this.getId());
		}
		return [];
	}

	getChildren() {
		return this._children;
	}

	getCleaneval(recursiv = false) {
		if(this.getType()==='i'){
			return '';
		}

		const cTags = ['p', 'h', 'l'];
		let text = '';
		const tag = this.getType();
		if (_.includes(cTags, tag)) {
			text = `<${tag}>`;
		}
		if (this.isLeaf()) {
			text += `${this._text.trim()} `;
		} else {
			text += this.getChildren().map(childNode => childNode.getCleaneval(true)).join('\n');
		}

		const startsWithTag = text.indexOf('<') === 0;

		if (!recursiv) {
			if (!startsWithTag) {
				return `<p>${text}`.trim();
			}
			return text.trim();
		}
		if (text.replace(/<p>|<l>|<h>|\s|\n|\t/gi, '').length === 0) {
			return '';
		}
		return text;
	}

	getClasses() {
		return this._classes;
	}

	getIds() {
		return this._ids;
	}

	isSelected(selector) {
		const cString = selector.match(/\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)(?![^\{]*\})/gi);
		const idString = selector.match(/#(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)(?![^\{]*\})/gi);
		const selectedClasses = [];
		const selectedIds = [];

		if (cString) {
			cString.forEach(c => {
				selectedClasses.push(c.replace('.', ''));
			});
		}
		if (idString) {
			idString.forEach(i => {
				selectedIds.push(i.replace('#', ''));
			});
		}

		for (let i in selectedIds){
			const id = selectedIds[i];
			if (!_.includes(this._ids, id)) {
				return false;
			}
		}

		for (let i in selectedClasses){
			const c = selectedClasses[i];
			if (!_.includes(this._classes, c)) {
				return false;
			}
		}

		return true;
	}

	isLeaf() {
		return this._children.length === 0;
	}

	get
	classList() {
		return this._classes;
	}

	getClasses() {
		return this._classes;
	}

	get
	idList() {
		return this._ids;
	}

	getIds() {
		return this._ids;
	}

	data(key, value) {
		if (value) {
			this.setData(key, value);
		} else {
			return this.getData(key);
		}
	}

	getData(key) {
		if (!key) {
			this._data;
		}
		return this._data[key];
	}

	setData(key, value) {
		this._data[key] = value;
	}

	remove(recursiv = false) {
		if (this._parent === -1) {
			this._dom._nodes = [this];
			this._children = [];
			this._text = '';
		} else {
			if (!recursiv) {
				const parent = this.getParent();
				if (parent) {
					parent._children = this.getParent()._children.filter(c => c.getId() !== this.getId());
				}
			}
			this.getChildren().forEach(n => {
				n.remove(true)
			});
			this._dom._nodes = this._dom._nodes.filter(n => n.getId() !== this.getId());
		}
		delete this;
	}

	_getHtmlTag() {
		let tag = '';
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
					tag += `a href="${this.getLink()}"`;
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
		return `<${tag}${this._getHtmlDataAttribute()}>`;
	}

	_getHtmlDataAttribute() {
		if (_.isEmpty(this._data)) {
			return '';
		}
		return ' ' + _.keys(this._data).map(key => {
				return `data-${key}="${this._data[key]}"`
			}).join(' ');
	}

	_getHtmlClosingTag() {
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
}
