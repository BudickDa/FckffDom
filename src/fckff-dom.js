import Cheerio from 'cheerio';
import _ from 'lodash';
import Node from './node';

export default class FckffDOM {
	constructor(html) {
		if (html.indexOf('<body') === -1) {
			html = `<body>${html}</body>`;
		}
		this._html = html;
		const $ = Cheerio.load(html.replace(/\t|\n/gi,' ').replace(/\s+/gi, ' '));
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
		this._nodes.forEach(n =>{
			if(n.getText().replace(/\s/gi, '').length===0){
				n.remove();
			}
		});
	}

	getOriginal(){
		return this._html;
	}

	/**
	 * If innerHtml of a tag is mixed getText and nodes, put getText into span tags so order is kept.
	 * @param $
	 * @private
	 */
	_closeHtml($, element) {
		let html = $(element).html();
		if ($(element).children().length > 0) {
			$(element)[0].children.forEach(child => {
				if (child.type === 'text') {
					const cleanText = child.data;
					if (cleanText.replace(/\s/gi, '').length > 0) {
						html = html.replace(child.data, `<span>${cleanText}</span>`);
					}
				}
			});
		}
		return html;
	}

	_getNextId() {
		this._lastId++;
		return this._lastId;
	}

	_traverse($, element, parentId = -1) {
		$(element).html(this._closeHtml($, element));
		const cNode = $(element);
		const childElements = cNode.children();

		const id = this._getNextId();

		/**
		 * A node has only _text, if it has no children.
		 * There is no mixture of elements and _text allowed.
		 * _closeHtml takes care of this.
		 * @type {string}
		 */
		let text = '';
		let children = [];
		if (childElements.length === 0) {
			text = cNode.text();
		} else {
			children = _.map(childElements, el => this._traverse($, el, id));
		}

		let classes = [];
		if (cNode.attr('class')) {
			classes = cNode.attr('class').split(' ');
		}
		let ids = [];
		if (cNode.attr('id')) {
			ids = cNode.attr('id').split(' ');
		}

		const node = new Node(id,
			text,
			FckffDOM._getType(cNode[0].name),
			cNode.html(),
			parentId,
			this,
			cNode.attr('href'),
			FckffDOM._getData(cNode[0].attribs),
			classes,
			ids,
			children);
		this._nodes[id] = node;
		return node;
	}

	static _getType(name) {
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
				if (_.includes(['b', 'big', 'i', 'small', 'tt', 'abbr', 'acronym', 'cite', 'code', 'dfn', 'em', 'kbd', 'strong', 'samp', 'var', 'bdo', 'img', 'map', 'object', 'q', 'span', 'sub', 'sup', 'button', 'input', 'label', 'select', 'textarea'], name)) {
					return 's';
				}
				return 'd';
		}
	}

	static _getData(attributes) {
		if (_.isEmpty(attributes)) {
			return {};
		}
		const keys = _.keys(attributes).filter(k => k.match(/data-/));
		if (keys.length === 0) {
			return {};
		}
		const data = {};
		keys.forEach(k => {
			data[k.replace('data-', '')] = attributes[k];
		});
		return data;
	}

	querySelector(selector) {
		return _.first(this.querySelectorAll(selector));
	}

	querySelectorAll(selector) {
		return this._nodes.filter(node => node.isSelected(selector));
	}

	getNodeById(id) {
		return this._nodes.filter(node => node.isSelected(id))[0];
	}

	body() {
		return this._body;
	}

	findByText(text) {

	}

	title() {
		return this._title;
	}

	getById(id) {
		return _.find(this._nodes, n => n.getId() === id);
	}

	getLinks() {
		return this._nodes.filter(node => node.hasLink()).map(node => node.getLink());
	}

	text() {
		const body = this.body();
		if (body) {
			return body.text();
		}
		return '';
	}

	html() {
		const body = this.body();
		if (body) {
			return body.html();
		}
		return '';
	}

	cleaneval() {
		const body = this.body();
		if (body) {
			return body.getCleaneval();
		}
		return '';
	}

	removeById(id) {
		const node = this.getById(id);
		return node.remove();
	}
}