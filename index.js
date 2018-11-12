const _ = require('lodash');
const log = require('debug')('confession');   // eslint-disable-line
const cheerio = require('cheerio');

const parseAction = require('./lib/parseAction');

const handleAction = (fun, args, html) => {
  if (args) {
    log('handleAction--> %o // %o', fun, args);
  } else {
    log('handleAction--> %o', fun);
  }

  if (_.isFunction(fun)) {
    return fun(html);
  }

  const $ = cheerio.load(html);
  switch (fun) {
    case 'selector':
      return $.html(args[0]);
    case 'text':
      return $.text();
    case 'attribute':
      return $('body').children().attr(args[0]);
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
};

const process = (html, action) => {
  const { fun, args } = parseAction(action);

  if (_.isArray(html)) {
    // more than one element
    // actions on array or on single elements
    switch (fun) {
      case 'join':
        return html.join(args[0]);
      default:
        return html.map(h => handleAction(fun, args, h));
    }
  } else {
    // just one element
    return handleAction(fun, args, html);
  }
};

const work = (html, extractors = {}) => {
  const result = {};
  Object.keys(extractors).forEach((key) => {
    const extractor = extractors[key];
    if (extractor.length === 0) {
      return false;
    }
    let fieldResult = html;
    extractor.forEach((action) => {
      fieldResult = process(fieldResult, action);
    });
    result[key] = fieldResult;
  });
  return result;
};

const confess = (html, extractors = {}, selector) => {
  if (selector) {
    const $ = cheerio.load(html);
    const items = $(selector);
    return items.toArray().map((item) => {
      const itemHtml = $.html(item);
      return work(itemHtml, extractors);
    });
  }
  return work(html, extractors);
};

module.exports = {
  parseAction,
  confess,
};
