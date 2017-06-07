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
			assert.equal(dom.title, 'Test');
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
});
