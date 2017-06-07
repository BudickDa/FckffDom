const assert = require('assert');
const _ = require('lodash');
const chance = new require('chance')();
const Dom = require('../index');

describe('Node', function() {
	describe('#getNodeById()', function() {
		it('should return the node with the getId 0', function() {
			const dom = new Dom('<body><p>Text</p></body>');
			const node = dom.getNodeById(0);
			assert.equal(node.id, 0);
		});
	});

	describe('#getChildren()', function() {
		it('should return the children of a node', function() {
			const html = '<body><p>Text</p></body>';
			const dom = new Dom(html);
			const body = dom.getNodeById(0)
			assert.equal(body.getChildren().length, 1);
			const paragraph = dom.getNodeById(1)
			assert.equal(paragraph.getChildren().length, 0);
		});
	});

	describe('#html()', function() {
		it('should return html of the first node', function() {
			const html = '<body><p>Text</p></body>';
			const dom = new Dom(html);
			const node = dom.getNodeById(0)
			assert.equal(node.html(), '<div><p>Text</p></div>');
		});

		it('should return html of the first node', function() {
			const html = '<body><p>Text <span>Span</span></p></body>';
			const dom = new Dom(html);
			const node = dom.getNodeById(0);
			assert.equal(node.html(), '<div><p><span>Text </span><span>Span</span></p></div>');
		});
	});
});