const assert = require('assert');
const _ = require('lodash');
const cheerio = require('cheerio');
const chance = new require('chance')();
const FckffDOM = require('../index');


const html = `
										<html>
											<head>
												<title>Test</title>
											</head>
											<body>
												<div>
													<h1>Heading 1</h1>
													<p>Paragraph 1  
														<a href="http://href.de">Link</a>
													</p>
												</div>
												<div>
													<span data-url="URL" data-foo="bar" data-sense="42">Data</span>
												</div>
											</body>
										</html>`;

describe('Dom', function() {
	describe('#constructor', function() {
		const dom = new FckffDOM(html);
		it('should have test as title', function() {
			assert.equal(dom.title(), 'Test');
		});
		it('should have nodes of the correct type', function() {
			assert.equal(dom.getById(1).getType(), 'd');
			assert.equal(dom.getById(2).getType(), 'h');
			assert.equal(dom.getById(3).getType(), 'p');
		});
	});

	describe('#_closeHtml', function() {
		it('should enclose getText in innterHtml mixed with tags in tags', function() {
			const $ = cheerio.load('<p>This is Text <a>Link</a>. Other Text.</p>');
			const dom = new FckffDOM('<body></body>');
			assert.equal(dom._closeHtml($, 'p'), '<span>This is Text </span><a>Link</a><span>. Other Text.</span>');
		});
	});

	describe('#html()', function() {
		it('should return the html of the body', function() {
			const dom = new FckffDOM(html.replace(/\n|\t/gi, ''));
			assert.equal(dom.html(), '<div><div><h1>Heading 1</h1><p><span>Paragraph 1 </span><a href="http://href.de">Link</a></p></div><div><span data-url="URL" data-foo="bar" data-sense="42">Data</span></div></div>');
		});
	});

	describe('#cleaneval()', function() {
		it('should return the cleaneval of the body', function() {
			const dom = new FckffDOM('<body><h1>Heading</h1><p>Paragraph 1 <a href="/link">Link</a></p><p>Paragraph 2</p></body>');
			assert.equal(dom.cleaneval().replace(/\n|\t|\s/gi, ''), `
				<h>Heading
				<p>Paragraph 1 Link
				<p>Paragraph 2`.replace(/\n|\t|\s/gi, '')
			);
		});
		it('should return the cleaneval of a complicated body', function() {
			const dom = new FckffDOM('<body><div><h1>Heading</h1><p>Paragraph 1 <a href="/link">Link</a></p></div><span><p>Paragraph <span>2</span></p></span></body>');
			assert.equal(dom.cleaneval().replace(/\n|\t|\s/gi, ''), `
				<h>Heading
				<p>Paragraph 1 Link
				<p>Paragraph 2`.replace(/\n|\t|\s/gi, '')
			);
		});
	});
});
