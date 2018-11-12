
/* global describe, it */

const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'sample.html'), 'utf-8');

const lib = require('../index');

describe('confession', () => {
  it('should parse string commands', () => {
    //  when an action is a function
    const f = () => 'oi';
    expect(lib.parseAction(f)).to.deep.equal({ fun: f });

    //
    expect(lib.parseAction('selector')).to.deep.equal({ fun: 'selector' });
    expect(lib.parseAction('selector:h1')).to.deep.equal({
      fun: 'selector',
      args: ['h1'],
    });
    expect(lib.parseAction('selector:h1|h2')).to.deep.equal({
      fun: 'selector',
      args: ['h1', 'h2'],
    });
    expect(lib.parseAction('attribute:class')).to.deep.equal({
      fun: 'attribute',
      args: ['class'],
    });
  });
  it('should structure array commands', () => {
    expect(lib.parseAction(['selector'])).to.deep.equal({
      fun: 'selector',
    });
    expect(lib.parseAction(['selector', 'h1', 'h2'])).to.deep.equal({
      fun: 'selector',
      args: ['h1', 'h2'],
    });
  });
  it('lib.confess  without actions should return nothing', () => {
    expect(lib.confess(html)).to.deep.equal({});
    expect(lib.confess(html)).to.deep.equal({});
    expect(lib.confess(html, { title: [] })).to.deep.equal({});
    expect(lib.confess(html, { title: [] })).to.deep.equal({});
  });
  it('lib.confess + confess actions', () => {
    expect(lib.confess(html, { title: ['selector:h1'] })).to.eql({
      title: '<h1>Title</h1>',
    });

    expect(lib.confess(html, { title: ['selector:h1', 'text'] })).to.eql({
      title: 'Title',
    });

    expect(lib.confess(html, { title: ['selector:h1', htmlLoc => `=${htmlLoc}=`] })).to.eql({
      title: '=<h1>Title</h1>=',
    });

    let extractors;
    let result;

    extractors = {
      subTitle: ['selector:h2', 'text'],
      subTitleClass: ['selector:h2', 'attribute:class'],
    };
    result = { subTitle: 'SubTitle', subTitleClass: 'subtitle' };
    expect(lib.confess(html, extractors)).to.eql(result);

    extractors = {
      subTitle: ['selector:h2', 'text'],
      subTitleClass: ['selector:h2', 'attribute:class', 'replace:sub|#'],
    };
    result = { subTitle: 'SubTitle', subTitleClass: '#title' };
    expect(lib.confess(html, extractors)).to.eql(result);

    extractors = {
      subTitle: ['selector:h2', 'text'],
      subTitleClass: ['selector:h2', 'attribute:class', 'remove:sub'],
    };
    result = { subTitle: 'SubTitle', subTitleClass: 'title' };
    expect(lib.confess(html, extractors)).to.eql(result);

    extractors = {
      subTitle: ['selector:h2', 'text'],
      subTitleClass: ['selector:h2', 'attribute:class', 'append:sub'],
    };
    result = { subTitle: 'SubTitle', subTitleClass: 'subtitlesub' };
    expect(lib.confess(html, extractors)).to.eql(result);

    extractors = {
      subTitle: ['selector:h2', 'text'],
      subTitleClass: ['selector:h2', 'attribute:class', 'prepend:sub'],
    };
    result = { subTitle: 'SubTitle', subTitleClass: 'subsubtitle' };
    expect(lib.confess(html, extractors)).to.eql(result);

    extractors = {
      linkClass: ['selector:a#my-link', 'attribute:class', 'trim'],
    };
    result = { linkClass: 'some' };
    expect(lib.confess(html, extractors)).to.eql(result);

    extractors = {
      text: ['selector:p', 'text', 'trim', 'split:\n', 'trim', 'join: '],
    };
    result = {
      text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
    };
    expect(lib.confess(html, extractors)).to.eql(result);
  });

  it('lib.confess selector/text', () => {
    expect(lib.confess(html, { text: ['text'] }, 'ul li')).to.eql([
      { text: '1' },
      { text: '2' },
      { text: '3' },
      { text: '4' },
      { text: '5' },
    ]);
  });
});

