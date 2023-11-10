"use strict";

function _defineProperty(obj, key, value) {
  key = _toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return typeof key === "symbol" ? key : String(key);
}
function _toPrimitive(input, hint) {
  if (typeof input !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== undefined) {
    var res = prim.call(input, hint || "default");
    if (typeof res !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
class Utils {
  static convertTextToHtml(text) {
    const paragraph = document.createElement('p');
    paragraph.innerText = text;
    return paragraph.innerHTML.replace(/<br>/g, '\n');
  }
  static convertHtmlToText(html) {
    const paragraph = document.createElement('p');
    paragraph.innerHTML = html;
    return paragraph.innerText;
  }

  /* eslint-disable */

  static getTrieRegexPatternFromWords(words) {
    let prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    let suffix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
    const trieData = {};
    for (const word of words) {
      let referenceData = trieData;
      for (const char of word) {
        referenceData[char] = referenceData.hasOwnProperty(char) ? referenceData[char] : {};
        referenceData = referenceData[char];
      }
      referenceData[''] = 1;
    }
    return prefix + this.getRegexPattern(trieData) + suffix;
  }
  static getRegexPattern(data) {
    if (data.hasOwnProperty('') && Object.keys(data).length === 1) return '';
    const alternation = [];
    const trie = [];
    let isNoncapturing = false;
    for (const char of Object.keys(data).sort()) {
      if (typeof data[char] === 'object') {
        const recurse = this.getRegexPattern(data[char]);
        if (recurse != null) {
          alternation.push(this.getRegexEscapedText(char) + recurse);
        } else {
          trie.push(this.getRegexEscapedText(char));
        }
      } else {
        isNoncapturing = true;
      }
    }
    const isTrieOnly = alternation.length === 0;
    if (trie.length > 0) {
      if (trie.length === 1) {
        alternation.push(trie[0]);
      } else {
        alternation.push("[".concat(trie.join(''), "]"));
      }
    }
    let result = '';
    if (alternation.length === 1) {
      result = alternation[0];
    } else {
      result = "(?:".concat(alternation.join('|'), ")");
    }
    if (isNoncapturing) {
      if (isTrieOnly) {
        result += '?';
      } else {
        result = "(?:".concat(result, ")?");
      }
    }
    return result;
  }

  /* eslint-enable */

  static getRegexEscapedText(text) {
    return text.replace(/[$()*+\-.\\/?[\]^{|}]/g, '\\$&');
  }
  static getRegexEscapedReplacement(replacement) {
    return replacement.replace(/\$/g, '$$$&');
  }
}
_defineProperty(Utils, "CORS_PROXY", 'https://corsproxy.itsdhnam.workers.dev/');
//# sourceMappingURL=cac-tien-ich.js.map