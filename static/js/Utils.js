'use strict';

class Utils {
  static CORS_PROXY = 'https://corsproxy.itsdhnam.workers.dev/';

  static isOnMobile() {
    return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(navigator.userAgent || navigator.vendor || window.opera) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte-/i.test((navigator.userAgent || navigator.vendor || window.opera).substr(0, 4));
  }

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

    return new RegExp(prefix + this.getRegexPattern(trieData) + suffix, 'g');
  }

  static getRegexPattern(data) {
    if (data.hasOwnProperty('') && Object.keys(data).length === 1) return null;
    const alternation = [];
    const trie = [];
    let isNoncapturing = false;

    for (const char of Object.keys(data).sort()) {
      if (typeof data[char] === 'object') {
        const recurse = this.getRegexPattern(data[char]);

        if (recurse != null) {
          alternation.push(this.escapeRegExp(char) + recurse);
        } else {
          trie.push(this.escapeRegExp(char));
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

  static escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  static escapeRegExpReplacement(replacement) {
    return replacement.replace(/\$[&`'\d]/g, '$$$&');
  }

  static hexToRgb(hexColor) {
    let hex = hexColor.replace(/^#/, '');

    if (hex.length === 3) {
      hex = hex.split('').map((char) => char + char).join('');
    }

    const bigint = parseInt(hex, 16);
    const red = (bigint / (256 * 256)) % 256;
    const green = (bigint / 256) % 256;
    const blue = bigint % 256;

    return { red, green, blue };
  }

  static rgbToHsb(red, green, blue) {
    const redNormalized = red / 255;
    const greenNormalized = green / 255;
    const blueNormalized = blue / 255;

    const max = Math.max(redNormalized, greenNormalized, blueNormalized);
    const min = Math.min(redNormalized, greenNormalized, blueNormalized);
    const delta = max - min;

    let hue = 0;
    let saturation = 0;
    const brightness = max;

    if (max !== 0) {
      saturation = delta / max;
    }

    if (delta !== 0) {
      switch (max) {
        case redNormalized: {
          hue = (greenNormalized - blueNormalized) / delta + (greenNormalized < blueNormalized ? 6 : 0);
          break;
        }
        case greenNormalized: {
          hue = (blueNormalized - redNormalized) / delta + 2;
          break;
        }
        case blueNormalized: {
          hue = (redNormalized - greenNormalized) / delta + 4;
          break;
        }
        // no default
      }

      hue /= 6;
    }

    return { hue: hue * 360, saturation: saturation * 100, brightness: brightness * 100 };
  }

  static hexToHsb(hexColor) {
    const { red, green, blue } = Utils.hexToRgb(hexColor);
    return Utils.rgbToHsb(red, green, blue);
  }
}
