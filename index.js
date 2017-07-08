'use strict';

const _ = require('lodash');
const cheerio = require('cheerio');

const process = (result, action) => {

    console.log('-', action)
    if (_.isString(action)) {
        let key, value;
        const sepPresent = action.indexOf(':') !== -1
        if (sepPresent) {
            key = action.substring(0, action.indexOf(':'))
            value = action.substring(action.indexOf(':') + 1).split('|')
            if (value.length == 1) {
                value = value[0]
            }
        } else {
            key = action
            value = ''
        }
        switch (key) {
            // case 'selector':
            //     result = cheerio(result).find(value)
            //     break;
            // case 'attribute':
            //     result = result.attr(value)
                break;
            // case 'text':
            //     result = result[key]()
            //     break;
            case 'toArray':
                result = result.toArray()
                break;
            case 'map.text':
                result = result.map(r => cheerio(r).text())
                break;
            // case 'replace':
            //     result = result.replace(value[0], value[1])
            //     break
            // case 'remove':
            //     result = result.replace(value, '')
            //     break
            // case 'preprend':
            //     result = `${value}${result}`
            //     break
            // case 'append':
            //     result = `${result}${value}`
            //     break
            // case 'trim':
            //     if (_.isArray(result))
            //         result = result.map(r => r.trim())
            //     else
            //         result = result.trim()
            //     break
            // case 'split':
            //     result = result.split(value)
            //     break
            // case 'join':
            //     result = result.join(value)
            //     break
            default:
                throw Error('Missing key for action [' + key + ']')
        }
    } else {
        throw Error('Not implemented ' + action)
    }
    console.log('\t- result', result)
    return result;
}


const extractItem = exports.extractItem = (extractors, $) => {
    const scrappedData = {}
    Object.keys(extractors).map(key => {
        const actions = extractors[key];
        console.log('>>', key, actions)
        const result = actions.reduce((state, action) => state ? process(state, action) : undefined, $)
        if(result)
            scrappedData[key] = result
    })
    return scrappedData
}

const extractItems = exports.extractItems = (selector, extractors, $) => {
    return $(selector).map((i, item) => extractItem(extractors, item) ).toArray()
}

module.exports = {
    extractItem,
    extractItems
}
