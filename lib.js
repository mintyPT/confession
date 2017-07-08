const _ = require("lodash");
const cheerio = require("cheerio");

const parseAction = action => {
    let r = {};
    if (_.isString(action)) {
        let key, value;
        const sepPresent = action.indexOf(":") !== -1;
        if (sepPresent) {
            key = action.substring(0, action.indexOf(":"));
            value = action.substring(action.indexOf(":") + 1).split("|");
        } else {
            key = action;
            value = undefined;
        }

        if (key) {
            r.fun = key;
        }
        if (value) {
            r.args = value;
        }
    }  else if (_.isFunction(action)){
        r.fun = action;
    } else {
        r.fun = action[0];
        let value = action.slice(1);
        if (value.length) {
            r.args = value;
        }
    }

    return r;
};

const handleAction = (fun, args, html) => {

    if(_.isFunction(fun)){
        return fun(html);
    }

    const $ = cheerio.load(html);
    switch (fun) {
        case "selector":
            return $.html(args[0]);
        case "text":
            return $.text();
        case "attribute":
            return $("body").children().attr(args[0]);
        case "replace":
            return html.replace(args[0], args[1]);
        case "remove":
            return html.replace(args[0], "");
        case "prepend":
            return `${args[0]}${html}`;
        case "append":
            return `${html}${args[0]}`;
        case "trim":
            return html.trim();
        case "split":
            return html.split(args[0]);

        default:
            throw Error(`Missing case for action ${fun}`);
    }
};

const process = (html, action) => {
    const _action = parseAction(action);
    const { fun, args } = _action;

    if(_.isArray(html)){
        // more than one element
        // actions on array or on single elements
        switch(fun){
            case "join":
                return html.join(args[0]);
            default:
                return html.map(h => handleAction(fun, args, h))
        }
    } else {
        // just one element
        return handleAction(fun, args, html);
    }


};

const one = (html, extractors = {}) => {
    const result = {};
    Object.keys(extractors).map(key => {
        const extractor = extractors[key];
        if (extractor.length == 0) {
            return;
        }
        let fieldResult = html;
        extractor.map(action => {
            fieldResult = process(fieldResult, action);
        });
        result[key] = fieldResult;
    });
    return result;
};

const confess = (html, extractors = {}, selector) => {
    if (!!selector) {
        const $ = cheerio.load(html);
        const items = $(selector);
        return items.toArray().map(item => {
            const itemHtml = $.html(item);
            return one(itemHtml, extractors);
        });
    } else {
        return one(html, extractors);
    }
};

module.exports = {
    parseAction,
    confess
};
