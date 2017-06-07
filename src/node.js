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
	constructor(id, text, type, innterHTML, parent, dom, link = '', data = {}, children = []) {
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
		 */
		const allowedTypes = ['h', 's', 'p', 'a', 'l', 'd'];
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

		if (!_.isArray(children)) {
			throw new TypeError(`Node.constructor() parameter children must be an array.`);
		}


		this.id = id;
		this.text = text;
		this.type = type
		this.parent = parent;
		this.dom = dom;
		this.hash = crypto.createHash('md5').update(innterHTML).digest('hex');
		this.link = link;
		this.data = data;
		this.children = children;
	}

	getId() {
		return this.id;
	}

	getText() {
		return this.text;
	}

	getLink() {
		return this.link;
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
		return `${this._getHtmlTag()}${content}${this._getHtmlClosingTag()}`;
	}

	getChildren() {
		return this.children;
	}


	_getHtmlTag() {
		let tag = '';
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
		if (_.isEmpty(this.data)) {
			return '';
		}
		return ' ' + _.keys(this.data).map(key => {
				return `data-${key}="${this.data[key]}"`
			}).join(' ');
	}

	_getHtmlClosingTag() {
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
}
