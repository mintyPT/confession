const _ = require('lodash');
const log = require('debug')('confession');   // eslint-disable-line

const parseAction = (action) => {
  log('parseAction --> %o', action);

  const r = {};
  if (_.isString(action)) {
    let key;
    let value;
    const sepPresent = action.indexOf(':') !== -1;
    if (sepPresent) {
      key = action.substring(0, action.indexOf(':'));
      value = action.substring(action.indexOf(':') + 1).split('|');
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
  } else if (_.isFunction(action)) {
    r.fun = action;
  } else {
    r.fun = action[0];
    const value = action.slice(1);
    if (value.length) {
      r.args = value;
    }
  }

  return r;
};

module.exports = parseAction;

