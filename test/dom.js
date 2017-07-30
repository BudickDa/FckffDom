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
    /*const dom = new FckffDOM(html);
    it('should have test as title', function() {
      assert.equal(dom.title(), 'Test');
    });
    it('should have nodes of the correct type', function() {
      assert.equal(dom.getById(1).getType(), 'd');
      assert.equal(dom.getById(2).getType(), 'h');
      assert.equal(dom.getById(3).getType(), 'p');
    });
    it('should create a dom from html without body', function(){
      const dom = new FckffDOM('<div id="no-body"><p class="class1 class2">Class</p><p id="id1 id2">Id</p></div>');
      assert.equal(dom.body().getChildren()[0]._ids[0], 'no-body');
    });
    it('should create a dom from html with only one child', function(){
      const dom = new FckffDOM('<body><span>Foo</span></body>');
      assert.equal(dom.body().html(), '<div><span>Foo</span></div>');
    });*/
    it('should create a dom from html without body', function() {
      const dom = new FckffDOM('<body><img src="foo.png"/></body>');
      assert.equal(dom.body().html(), '<div><img src="foo.png"/></div>');
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
      const dom = new FckffDOM(html);
      assert.equal(dom.html(), '<div><div><h1>Heading 1</h1><p><span>Paragraph 1</span><a href="http://href.de">Link</a></p></div><div><span data-url="URL" data-foo="bar" data-sense="42">Data</span></div></div>');
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

  describe('#remove()', function() {
    it('should return the html of the body', function() {
      const dom = new FckffDOM(`
										<html>
											<head>
												<title>Test</title>
											</head>
											<body id="three">
												<div>
													<h1 id="two">Heading 1</h1>
													<p>Paragraph 1  
														<a href="http://href.de">Link</a>
													</p>
												</div>
												<div>
													<span id="one" data-url="URL" data-foo="bar" data-sense="42">Data <span>This should be removed too!</span></span>
												</div>
											</body>
										</html>`);

      assert.equal(dom.html(), '<div><div><h1>Heading 1</h1><p><span>Paragraph 1</span><a href="http://href.de">Link</a></p></div><div><span data-url="URL" data-foo="bar" data-sense="42"><span>Data</span><span>This should be removed too!</span></span></div></div>');
      dom.querySelector('#one').remove();
      assert.equal(dom.html(), '<div><div><h1>Heading 1</h1><p><span>Paragraph 1</span><a href="http://href.de">Link</a></p></div><div></div></div>');
      dom.querySelector('#two').remove();
      assert.equal(dom.html(), '<div><div><p><span>Paragraph 1</span><a href="http://href.de">Link</a></p></div><div></div></div>');
      dom.querySelector('#three').remove();
      assert.equal(dom.html(), '<div></div>');
    });
  });

  describe('#getDataFromTables()', function() {
    it('should return the data of tables', function() {
      const dom = new FckffDOM(`
											<body id="three">
												<div>
													<h1 id="two">Heading 1</h1>
													<p>Paragraph 1  
														<a href="http://href.de">Link</a>
													</p>
												</div>
												<table>
												<tbody>
                        <tr>
                            <td>
                                KeyName:
                            </td>
                            <td>
                                ValueName                            </td>
                        </tr>
                        <tr>
                            <td>
                                KeySecond:
                          </td>
                          <td>
                             NameSecond                            
                          </td>
                        </tr>
                        </tbody>
												</table>
												<div>
													<span id="one" data-url="URL" data-foo="bar" data-sense="42">Data <span>This should be removed too!</span></span>
												</div>
											</body>
										</html>`);
      assert.deepEqual(dom._tableData, [{key: 'KeyName', value: 'ValueName'},
        {key: 'KeySecond', value: 'NameSecond'}])
    });
  });
});
