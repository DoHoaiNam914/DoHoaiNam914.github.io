class Utils {
  static CORS_PROXY = 'https://corsproxy.itsdhnam.workers.dev/';

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

  static getTrieRegexPatternFromWords(words, prefix = '', suffix = '') {
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
        alternation.push(`[${trie.join('')}]`);
      }
    }

    let result = '';

    if (alternation.length === 1) {
      result = alternation[0];
    } else {
      result = `(?:${alternation.join('|')})`;
    }

    if (isNoncapturing) {
      if (isTrieOnly) {
        result += '?';
      } else {
        result = `(?:${result})?`;
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
