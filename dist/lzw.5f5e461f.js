// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"WZkq":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _basedecoder = _interopRequireDefault(require("./basedecoder"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const MIN_BITS = 9;
const CLEAR_CODE = 256; // clear code

const EOI_CODE = 257; // end of information

const MAX_BYTELENGTH = 12;

function getByte(array, position, length) {
  const d = position % 8;
  const a = Math.floor(position / 8);
  const de = 8 - d;
  const ef = position + length - (a + 1) * 8;
  let fg = 8 * (a + 2) - (position + length);
  const dg = (a + 2) * 8 - position;
  fg = Math.max(0, fg);

  if (a >= array.length) {
    console.warn('ran off the end of the buffer before finding EOI_CODE (end on input code)');
    return EOI_CODE;
  }

  let chunk1 = array[a] & 2 ** (8 - d) - 1;
  chunk1 <<= length - de;
  let chunks = chunk1;

  if (a + 1 < array.length) {
    let chunk2 = array[a + 1] >>> fg;
    chunk2 <<= Math.max(0, length - dg);
    chunks += chunk2;
  }

  if (ef > 8 && a + 2 < array.length) {
    const hi = (a + 3) * 8 - (position + length);
    const chunk3 = array[a + 2] >>> hi;
    chunks += chunk3;
  }

  return chunks;
}

function appendReversed(dest, source) {
  for (let i = source.length - 1; i >= 0; i--) {
    dest.push(source[i]);
  }

  return dest;
}

function decompress(input) {
  const dictionaryIndex = new Uint16Array(4093);
  const dictionaryChar = new Uint8Array(4093);

  for (let i = 0; i <= 257; i++) {
    dictionaryIndex[i] = 4096;
    dictionaryChar[i] = i;
  }

  let dictionaryLength = 258;
  let byteLength = MIN_BITS;
  let position = 0;

  function initDictionary() {
    dictionaryLength = 258;
    byteLength = MIN_BITS;
  }

  function getNext(array) {
    const byte = getByte(array, position, byteLength);
    position += byteLength;
    return byte;
  }

  function addToDictionary(i, c) {
    dictionaryChar[dictionaryLength] = c;
    dictionaryIndex[dictionaryLength] = i;
    dictionaryLength++;
    return dictionaryLength - 1;
  }

  function getDictionaryReversed(n) {
    const rev = [];

    for (let i = n; i !== 4096; i = dictionaryIndex[i]) {
      rev.push(dictionaryChar[i]);
    }

    return rev;
  }

  const result = [];
  initDictionary();
  const array = new Uint8Array(input);
  let code = getNext(array);
  let oldCode;

  while (code !== EOI_CODE) {
    if (code === CLEAR_CODE) {
      initDictionary();
      code = getNext(array);

      while (code === CLEAR_CODE) {
        code = getNext(array);
      }

      if (code === EOI_CODE) {
        break;
      } else if (code > CLEAR_CODE) {
        throw new Error(`corrupted code at scanline ${code}`);
      } else {
        const val = getDictionaryReversed(code);
        appendReversed(result, val);
        oldCode = code;
      }
    } else if (code < dictionaryLength) {
      const val = getDictionaryReversed(code);
      appendReversed(result, val);
      addToDictionary(oldCode, val[val.length - 1]);
      oldCode = code;
    } else {
      const oldVal = getDictionaryReversed(oldCode);

      if (!oldVal) {
        throw new Error(`Bogus entry. Not in dictionary, ${oldCode} / ${dictionaryLength}, position: ${position}`);
      }

      appendReversed(result, oldVal);
      result.push(oldVal[oldVal.length - 1]);
      addToDictionary(oldCode, oldVal[oldVal.length - 1]);
      oldCode = code;
    }

    if (dictionaryLength + 1 >= 2 ** byteLength) {
      if (byteLength === MAX_BYTELENGTH) {
        oldCode = undefined;
      } else {
        byteLength++;
      }
    }

    code = getNext(array);
  }

  return new Uint8Array(result);
}

class LZWDecoder extends _basedecoder.default {
  decodeBlock(buffer) {
    return decompress(buffer, false).buffer;
  }

}

exports.default = LZWDecoder;
},{"./basedecoder":"EXcy"}]},{},[], null)
//# sourceMappingURL=lzw.5f5e461f.js.map