import Cheerio from 'cheerio';
import _ from 'lodash';
import Node from './node';

export default class FckffDOM {
	constructor(html) {
		const $ = Cheerio.load(html);
		/**
		 * Clean clutter out
		 */
		$('style').remove();
		$('script').remove();
		$('getLink').remove();
		$('meta').remove();

		this.title = $('title').text();
		this._lastId = -1;
		this._nodes = [];
		this._traversed = this._traverse($, 'body');
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
					const cleanText = child.data.replace(/\t/gi, '').replace(/\n/gi, ' ').replace(/\s+/gi, ' ');
					if (cleanText.length > 0) {
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
		 * A node has only text, if it has no children.
		 * There is no mixture of elements and text allowed.
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

		const node = new Node(id, text, FckffDOM._getType(cNode[0].name), cNode.html(), parentId, this, cNode.attr('href'), FckffDOM._getData(cNode[0].attribs), children);
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

	findByText(text) {

	}

	getNodeById(id) {
		return this._nodes[id];
	}

	html() {
		const body = _.first(this._nodes);
		if (body) {
			return body.html();
		}
		return '';
	}
}