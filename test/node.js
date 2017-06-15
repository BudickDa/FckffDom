const assert = require('assert');
const _ = require('lodash');
const chance = new require('chance')();
const Dom = require('../index');

describe('Node', function() {
	describe('#getNodeById()', function() {
		it('should return the node with the getId 0', function() {
			const dom = new Dom('<body><p>Text</p></body>');
			const node = dom.getById(0);
			assert.equal(node.id(), 0);
		});

		it('should have ids and classes', function() {
			const dom = new Dom('<body><p class="class1 class2">Class</p><p id="id1 id2">Id</p></body>');
			dom._nodes.forEach(node => {
				if (node._text === 'Class') {
					assert.deepEqual(node._classes, ['class1', 'class2']);
					assert.deepEqual(node.classList, ['class1', 'class2']);
				}
				if (node._text === 'Id') {
					assert.deepEqual(node._ids, ['id1', 'id2']);
					assert.deepEqual(node.idList, ['id1', 'id2']);
				}
			});
		});
	});

	describe('#getChildren()', function() {
		it('should return the children of a node', function() {
			const html = '<body><p>Text</p></body>';
			const dom = new Dom(html);
			const body = dom.getById(0)
			assert.equal(body.getChildren().length, 1);
			const paragraph = dom.getById(1)
			assert.equal(paragraph.getChildren().length, 0);
		});
	});

	describe('#text()', function() {
		it('should return the text of a node', function() {
			const html = '<body><p>Text</p></body>';
			const dom = new Dom(html);
			const paragraph = dom.getById(1);
			assert.equal(paragraph.text(), 'Text');
		});
		it('should return the text of a node and its children', function() {
			const html = '<body><p>Text <span>and its child</span></p></body>';
			const dom = new Dom(html);
			const paragraph = dom.getById(1);
			assert.equal(paragraph.text(), 'Text and its child');
		});
	});

	describe('#html()', function() {
		it('should return html of the first node', function() {
			const html = '<body><p>Text</p></body>';
			const dom = new Dom(html);
			const node = dom.getById(0)
			assert.equal(node.html(), '<div><p>Text</p></div>');
		});

		it('should return html of the first node', function() {
			const html = '<body><p>Text <span>Span</span></p></body>';
			const dom = new Dom(html);
			const node = dom.getById(0);
			assert.equal(node.html(), '<div><p><span>Text </span><span>Span</span></p></div>');
		});
	});

	describe('#isLeaf()', function() {
		it('should return html of the first node', function() {
			const html = '<body><p><span>Leave</span>Leave</p><p>Leave</p><div><span>Leave</span></div><span><a>Leave</a><p>Leave</p></span><a>Leave</a><div>Leave</div></body>';
			const dom = new Dom(html);
			const node = dom._nodes.forEach(node => {
				if (node._text === 'Leave') {
					assert.equal(node.isLeaf(), true);
				} else {
					assert.equal(node.isLeaf(), false);
				}
			});
		});
	});

	describe('#getCleaneval()', function() {
		it('should return cleaneval of the node', function() {
			const html = '<body><p>Text</p></body>';
			const dom = new Dom(html);
			const node = dom.getById(0)
			assert.equal(node.getCleaneval(), '<p>Text\n');
		});
	});

	describe('#isSelected()', function() {
		it('should return true if it is selected by string', function() {
			const html = '<body><p class="class1 class2">Class</p><p id="id1 id2">Id</p><p id="id1 id2" class="class1 class2">ClassId</p></body>';
			const dom = new Dom(html);
			dom._nodes.forEach(node => {
				if (node._text === 'Class') {
					assert.equal(node.isSelected('.class1'), true);
					assert.equal(node.isSelected('.class2'), true);
					assert.equal(node.isSelected('.class1.class2'), true);

					assert.equal(node.isSelected('#id1'), false);
					assert.equal(node.isSelected('#id2'), false);
					assert.equal(node.isSelected('#id1#id2'), false);
				}
				if (node._text === 'Id') {
					assert.equal(node.isSelected('.class1'), false);
					assert.equal(node.isSelected('.class2'), false);
					assert.equal(node.isSelected('.class1.class2'), false);

					assert.equal(node.isSelected('#id1'), true);
					assert.equal(node.isSelected('#id2'), true);
					assert.equal(node.isSelected('#id1#id2'), true);
				}
				if (node._text === 'ClassId') {
					assert.equal(node.isSelected('.class1'), true);
					assert.equal(node.isSelected('.class2'), true);
					assert.equal(node.isSelected('#id1'), true);
					assert.equal(node.isSelected('#id2'), true);
					assert.equal(node.isSelected('.class1.class2'), true);
					assert.equal(node.isSelected('#id1#id2'), true);

					assert.equal(node.isSelected('#id1.class1'), true);
					assert.equal(node.isSelected('#id1.class2'), true);
					assert.equal(node.isSelected('#id2.class1'), true);
					assert.equal(node.isSelected('#id2.class2'), true);

					assert.equal(node.isSelected('#id1#id2.class1'), true);
					assert.equal(node.isSelected('#id1#id2.class2'), true);

					assert.equal(node.isSelected('#id1#id2.class1.class2'), true);
					assert.equal(node.isSelected('#id1.class1.class2'), true);
					assert.equal(node.isSelected('#id2.class1.class2'), true);
				}
			});
		});
	});

	describe('#remove()', function() {
		it('should remove node', function() {
			const html = '<body><p>Text</p><p id="remove">Text 2</p></body>';
			const dom = new Dom(html);
			const node = dom.querySelector('#remove');
			node.remove();
			assert.equal(dom.html(), '<div><p>Text</p></div>');
		});

		it('should remove node with children', function() {
			const html = '<body><p>Text</p><div id="remove">Text 2<p>Child 1</p><div>Child 2</div></div></body>';
			const dom = new Dom(html);
			const node = dom.querySelector('#remove');
			node.remove();
			assert.equal(dom.html(), '<div><p>Text</p></div>');
		});
	});
});
