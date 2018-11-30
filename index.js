const _ = require('lodash');
const log = require('debug')('confession');   // eslint-disable-line
const cheerio = require('cheerio');

const parseAction = require('./lib/parseAction');

const handleAction = (fun, args, html) => {
  if (args) {
    // console.log('handleAction--> %o // %o', fun, args);
  } else {
    // console.log('handleAction--> %o', fun);
  }

  if (_.isFunction(fun)) {
    return fun(html);
  }

  let res
  let $
  if(_.isString(html)){
    $ = cheerio.load(html);
  } else {
    $ = html.clone()
  }
   
  switch (fun) {
    case 'selector':
      // console.log('selector')
      const sel = $(args[0]);
      res = []
      $(sel).each(function(i, link){    
        // console.log(`$(this).toString() -->`, $(this).toString())
        res.push($(this));  //aici pun val gasite in locuri in array
      });
      // console.log('selector length', res.length)
      return res
      
    case 'text':
      return $.text();
    case 'attribute':
      return $.attr(args[0]);
    case 'replace':
      return html.replace(args[0], args[1]);
    case 'remove':
      return html.replace(args[0], '');
    case 'prepend':
      return `${args[0]}${html}`;
    case 'append':
      return `${html}${args[0]}`;
    case 'trim':
      return html.trim();
    case 'split':
      return html.split(args[0]);

    default:
      throw Error(`Missing case for action ${fun}`);
  }

  return res
};

const process = (html, action) => {
  // console.log(`process -->`, html, action)
  const { fun, args } = parseAction(action);

  if (_.isArray(html)) {
    // console.log('process array')
    // more than one element
    // actions on array or on single elements
    switch (fun) {
      case 'join':
        return html.join(args[0]);
      default:
      // console.log('process single element')
        return html.map(h => handleAction(fun, args, h));
    }
  } else {
    // just one element
    // console.log('process one element')
    return handleAction(fun, args, html);
  }
};

const work = (html, extractors = {}) => {
  const result = {};
  const handleExtractor = (key) => {
    let extractor = extractors[key];
    if (extractor.length === 0) {
      return false;
    }
    
    extractor = _.castArray(extractor)
    let fieldResult = extractor.reduce((state, action) => { 
      // console.log('▾▾▾▾▾▾▾▾▾▾▾▾▾▾▾▾▾▾▾▾▾▾▾▾▾▾▾▾▾▾')
      // console.log(`state  before -->`, state)
      const state2 = process(state, action);
      // console.log(`state  after -->`, state2)
      if(_.isArray(state2)){
        if(state2.length>0 && _.isArray(_.first(state2))){
          // console.log(`1 -->`, 1)
          return _.flatten(state2)

        }
      }
      // console.log(`2 -->`, 2)
      return state2; 
    }, html);

    if(fieldResult && _.isArray(fieldResult) && fieldResult.length === 1){
      fieldResult = _.first(fieldResult)

      if(fieldResult.cheerio){
        fieldResult = fieldResult.toString()
      }
    }
    result[key] = fieldResult;
  };
  Object.keys(extractors).forEach(handleExtractor);
  return result;
};

const confess = (html, extractors = {}, selector) => {
  if (selector) {
    const $ = cheerio.load(html);
    const items = $(selector);
    return items.toArray().map((item) => {
      return work($.html(item), extractors);
    });
  }
  return work(html, extractors);
};


module.exports = {
  parseAction,
  confess,
};
