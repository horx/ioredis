'use strict';

/**
 * Test if two buffers are equal
 *
 * @param {Buffer} a
 * @param {Buffer} b
 * @return {Boolean} Whether the two buffers are equal
 * @private
 */
exports.bufferEqual = function (a, b) {
  if (typeof a.equals === 'function') {
    return a.equals(b);
  }

  if (a.length !== b.length) {
    return false;
  }

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
};

/**
 * Convert a buffer to string, supports buffer array
 *
 * @param {*} value - The input value
 * @param {string} encoding - string encoding
 * @return {*} The result
 * @example
 * ```js
 * var input = [new Buffer('foo'), [new Buffer('bar')]];
 * var res = convertBufferToString(input, 'utf8');
 * expect(res).to.eql(['foo', ['bar']]);
 * ```
 * @private
 */
exports.convertBufferToString = function (value, encoding) {
  if (value instanceof Buffer) {
    return value.toString(encoding);
  }
  if (Array.isArray(value)) {
    var res = [];
    for (var i = 0; i < value.length; ++i) {
      res[i] = exports.convertBufferToString(value[i], encoding);
    }
    return res;
  }
  return value;
};

/**
 * Convert a list of results to node-style
 *
 * @param {Array} arr - The input value
 * @return {Array} The output value
 * @example
 * ```js
 * var input = ['a', 'b', new Error('c'), 'd'];
 * var output = exports.wrapMultiResult(input);
 * expect(output).to.eql([[null, 'a'], [null, 'b'], [new Error('c')], [null, 'd']);
 * ```
 * @private
 */
exports.wrapMultiResult = function (arr) {
  var result = [];
  var length = arr.length;
  for (var i = 0; i < length; ++i) {
    var item = arr[i];
    if (item instanceof Error) {
      result.push([item]);
    } else {
      result.push([null, item]);
    }
  }
  return result;
};

/**
 * Detect the argument is a int
 *
 * @param {string} value
 * @return {boolean} Whether the value is a int
 * @example
 * ```js
 * > isInt('123')
 * true
 * > isInt('123.3')
 * false
 * > isInt('1x')
 * false
 * > isInt(123)
 * true
 * > isInt(true)
 * false
 * ```
 * @private
 */
exports.isInt = function (value) {
  var x = parseFloat(value);
  return !isNaN(value) && (x | 0) === x;
};

/**
 * Pack an array to an Object
 *
 * @param {array} array
 * @return {object}
 * @example
 * ```js
 * > packObject(['a', 'b', 'c', 'd'])
 * { a: 'b', c: 'd' }
 * ```
 */
exports.packObject = function (array) {
  var result = {};
  var length = array.length;

  for (var i = 1; i < length; i += 2) {
    result[array[i - 1]] = array[i];
  }

  return result;
};

/**
 * Return a callback with timeout
 *
 * @param {function} callback
 * @param {number} timeout
 * @return {function}
 */
exports.timeout = function (callback, timeout) {
  var timer;
  var run = function () {
    if (timer) {
      clearTimeout(timer);
      timer = null;
      callback.apply(this, arguments);
    }
  };
  timer = setTimeout(run, timeout, new Error('timeout'));
  return run;
};

/**
 * Convert an object to an array
 *
 * @param {object} obj
 * @return {array}
 * @example
 * ```js
 * > convertObjectToArray({ a: '1' })
 * ['a', '1']
 * ```
 */
exports.convertObjectToArray = function (obj) {
  var result = [];
  var pos = 0;
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[pos] = key;
      result[pos + 1] = obj[key];
    }
    pos += 2;
  }
  return result;
};

/**
 * Convert a map to an array
 *
 * @param {Map} map
 * @return {array}
 * @example
 * ```js
 * > convertObjectToArray(new Map([[1, '2']]))
 * [1, '2']
 * ```
 */
exports.convertMapToArray = function (map) {
  var result = [];
  var pos = 0;
  map.forEach(function (value, key) {
    result[pos] = key;
    result[pos + 1] = value;
    pos += 2;
  });
  return result;
};

/**
 * Convert a non-string arg to a string
 *
 * @param {*} arg
 * @return {string}
 */
exports.toArg = function (arg) {
  if (arg === null || typeof arg === 'undefined') {
    return '';
  }
  return String(arg);
};

var crc16 = require('./crc');
/**
 * Calculate slot by key
 *
 * @param {string} key
 * @return {number}
 */
exports.calcSlot = function (key) {
  var s = key.indexOf('{');
  if (s !== -1) {
    var e = key.indexOf('}', s + 2);
    if (e !== -1) {
      key = key.slice(s + 1, e);
    }
  }
  return crc16(key) & 16383;
};

/**
 * Optimize error stack
 *
 * @param {Error} error - actually error
 * @param {string} friendlyStack - the stack that more meaningful
 * @param {string} filterPath - only show stacks with the specified path
 */
exports.optimizeErrorStack = function (error, friendlyStack, filterPath) {
  var stacks = friendlyStack.split('\n');
  var lines = '';
  var i;
  for (i = 1; i < stacks.length; ++i) {
    if (stacks[i].indexOf(filterPath) === -1) {
      break;
    }
  }
  for (var j = i; j < stacks.length; ++j) {
    lines += '\n' + stacks[j];
  }
  var pos = error.stack.indexOf('\n');
  error.stack = error.stack.slice(0, pos) + lines;
  return error;
};
