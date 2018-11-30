
/* global describe, it */

const fs = require('fs');
const path = require('path');
const { expect } = require('chai');
const _ = require('lodash')

const lib = require('../index');

/**
 * html to test lib on
 */
const html = fs.readFileSync(path.join(__dirname, 'sample.html'), 'utf-8');


const t = (...etc) => expect(lib.confess(...etc))

describe('confession.confess', () => {

    // it('xxxx', ()=>{ })
    it('no actions should return no results', () => {
        t(html).to.deep.equal({});
        t(html, { title: [] }).to.deep.equal({});
    })

    it('should work for simple examples 1', () => {
        t(html, { title: ['selector:meta[name="description"]', 'attribute:value'] }).to.eql({
            title: 'cenas',
        });
    })

    it('should work for simple examples 1', () => {
        t(html, { title: ['selector:h1'] }).to.eql({
            title: '<h1>Title</h1>',
        });
    })
    it('should work for simple examples 2', () => {
        t(html, { title: 'selector:h1' }).to.eql({
            title: '<h1>Title</h1>',
        });
    })

    it('should work for simple examples 3', () => {
        t(html, { title: ['selector:h1', 'text'] }).to.eql({
            title: 'Title',
        });
    })


    it('should handle function', () => {
        t(html, { title: ['selector:h1', 'text', htmlLoc => `=${htmlLoc}=`] }).to.eql({
            title: '=Title=',
        });
    })

    it('should handle results as arrays', () => {
        t(html, { items: ['selector:ul li', 'text'] }).to.eql({
            items: ['1', '2', '3', '4', '5'],
        });
    })


    it('lib.confess + confess actions', () => {

        let extractors;
        let result;

        extractors = {
            subTitle: ['selector:h2', 'text'],
            subTitleClass: ['selector:h2', 'attribute:class'],
        };
        result = {
            subTitle: 'SubTitle',
            subTitleClass: 'subtitle'
        };
        t(html, extractors).to.eql(result);

        extractors = {
            subTitle: ['selector:h2', 'text'],
            subTitleClass: ['selector:h2', 'attribute:class', 'replace:sub|#'],
        };
        result = { subTitle: 'SubTitle', subTitleClass: '#title' };
        t(html, extractors).to.eql(result);

        extractors = {
            subTitle: ['selector:h2', 'text'],
            subTitleClass: ['selector:h2', 'attribute:class', 'remove:sub'],
        };
        result = { subTitle: 'SubTitle', subTitleClass: 'title' };
        t(html, extractors).to.eql(result);

        extractors = {
            subTitle: ['selector:h2', 'text'],
            subTitleClass: ['selector:h2', 'attribute:class', 'append:sub'],
        };
        result = { subTitle: 'SubTitle', subTitleClass: 'subtitlesub' };
        t(html, extractors).to.eql(result);

        extractors = {
            subTitle: ['selector:h2', 'text'],
            subTitleClass: ['selector:h2', 'attribute:class', 'prepend:sub'],
        };
        result = { subTitle: 'SubTitle', subTitleClass: 'subsubtitle' };
        t(html, extractors).to.eql(result);

        extractors = {
            linkClass: ['selector:a#my-link', 'attribute:class', 'trim'],
        };
        result = { linkClass: 'some' };
        t(html, extractors).to.eql(result);

        extractors = {
            text: ['selector:p', 'text', 'trim', 'split:\n', 'trim', 'join: '],
        };
        result = {
            text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
        };
        t(html, extractors).to.eql(result);
    });

});

