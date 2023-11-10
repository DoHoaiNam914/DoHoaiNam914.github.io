"use strict";

var _class, _class2, _class3, _class4;
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function (r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), !0).forEach(function (r) {
      _defineProperty(e, r, t[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
    });
  }
  return e;
}
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
/* global Utils */
const Translators = {
  DEEPL_TRANSLATE: 'deeplTranslator',
  GOOGLE_TRANSLATE: 'googleTranslate',
  PAPAGO: 'papago',
  MICROSOFT_TRANSLATOR: 'microsoftTranslator',
  VIETPHRASE: 'vietphrase'
};
class DeepLTranslate {
  constructor() {
    this.authKey = 'a4b25ba2-b628-fa56-916e-b323b16502de:fx';
  }
  async init() {
    try {
      this.usage = await this.fetchUsage();
    } catch (error) {
      console.error(error);
      throw error;
    }
    return this;
  }
  static getSourceLangName(languageCode) {
    return DeepLTranslate.SOURCE_LANGUAGES.filter(_ref => {
      let {
        language
      } = _ref;
      return language === languageCode;
    })[0].name;
  }
  static getTargetLangName(languageCode) {
    return DeepLTranslate.TARGET_LANGUAGES.filter(_ref2 => {
      let {
        language
      } = _ref2;
      return language === languageCode;
    })[0].name;
  }
  static getMappedSourceLanguageCode(translator, languageCode) {
    switch (translator) {
      case Translators.GOOGLE_TRANSLATE:
        {
          var _DeepLTranslate$GOOGL;
          return (_DeepLTranslate$GOOGL = DeepLTranslate.GOOGLE_TRANSLATE_MAPPING[languageCode]) !== null && _DeepLTranslate$GOOGL !== void 0 ? _DeepLTranslate$GOOGL : Object.prototype.hasOwnProperty.call(GoogleTranslate.SOURCE_LANGUAGES, languageCode) ? languageCode : GoogleTranslate.DefaultLanguage.SL;
        }
      case Translators.PAPAGO:
        {
          var _DeepLTranslate$PAPAG;
          return (_DeepLTranslate$PAPAG = DeepLTranslate.PAPAGO_MAPPING[languageCode]) !== null && _DeepLTranslate$PAPAG !== void 0 ? _DeepLTranslate$PAPAG : Object.prototype.hasOwnProperty.call(Papago.SOURCE_LANGUAGES, languageCode) ? languageCode : Papago.DefaultLanguage.SOURCE;
        }
      case Translators.MICROSOFT_TRANSLATOR:
        {
          var _DeepLTranslate$MICRO;
          return (_DeepLTranslate$MICRO = DeepLTranslate.MICROSOFT_TRANSLATOR_MAPPING[languageCode]) !== null && _DeepLTranslate$MICRO !== void 0 ? _DeepLTranslate$MICRO : Object.prototype.hasOwnProperty.call(MicrosoftTranslator.FROM_LANGUAGES, languageCode) ? languageCode : MicrosoftTranslator.DefaultLanguage.FROM;
        }
      case Translators.VIETPHRASE:
        {
          return Vietphrase.DefaultLanguage.SOURCE_LANGUAGE;
        }
      default:
        {
          return null;
        }
    }
  }
  static getMappedTargetLanguageCode(translator, languageCode) {
    switch (translator) {
      case Translators.GOOGLE_TRANSLATE:
        {
          var _DeepLTranslate$GOOGL2;
          return (_DeepLTranslate$GOOGL2 = DeepLTranslate.GOOGLE_TRANSLATE_MAPPING[languageCode]) !== null && _DeepLTranslate$GOOGL2 !== void 0 ? _DeepLTranslate$GOOGL2 : Object.prototype.hasOwnProperty.call(GoogleTranslate.TARGET_LANGUAGES, languageCode) ? languageCode : GoogleTranslate.DefaultLanguage.TL;
        }
      case Translators.PAPAGO:
        {
          var _DeepLTranslate$PAPAG2;
          return (_DeepLTranslate$PAPAG2 = DeepLTranslate.PAPAGO_MAPPING[languageCode]) !== null && _DeepLTranslate$PAPAG2 !== void 0 ? _DeepLTranslate$PAPAG2 : Object.prototype.hasOwnProperty.call(Papago.TARGET_LANGUAGES, languageCode) ? languageCode : Papago.DefaultLanguage.TARGET;
        }
      case Translators.MICROSOFT_TRANSLATOR:
        {
          var _DeepLTranslate$MICRO2;
          return (_DeepLTranslate$MICRO2 = DeepLTranslate.MICROSOFT_TRANSLATOR_MAPPING[languageCode]) !== null && _DeepLTranslate$MICRO2 !== void 0 ? _DeepLTranslate$MICRO2 : Object.prototype.hasOwnProperty.call(MicrosoftTranslator.TO_LANGUAGES, languageCode) ? languageCode : MicrosoftTranslator.DefaultLanguage.TO;
        }
      case Translators.VIETPHRASE:
        {
          return Vietphrase.DefaultLanguage.TARGET_LANGUAGE;
        }
      default:
        {
          return null;
        }
    }
  }
  async fetchUsage() {
    try {
      return await $.ajax({
        method: 'GET',
        url: "https://api-free.deepl.com/v2/usage?auth_key=".concat(this.authKey)
      });
    } catch (error) {
      console.error('Không thể lấy được Mức sử dụng:', error);
      throw console.error('Không thể lấy được Mức sử dụng!');
    }
  }
  async translateText(sourceLang, targetLang, text) {
    try {
      return Utils.convertHtmlToText((await $.ajax({
        data: "text=".concat(text.split(/\n/).map(element => encodeURIComponent(element)).join('&text='), "&source_lang=").concat(sourceLang, "&target_lang=").concat(targetLang, "&tag_handling=xml"),
        method: 'POST',
        url: "https://api-free.deepl.com/v2/translate?auth_key=".concat(this.authKey)
      })).translations.map(element => element.text).join('\n'));
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      throw error;
    }
  }
}
_class = DeepLTranslate;
/** https://api-free.deepl.com/v2/languages?type=source */
_defineProperty(DeepLTranslate, "SOURCE_LANGUAGES", [{
  language: '',
  name: 'Detect language'
}, ...JSON.parse('[{"language":"BG","name":"Bulgarian"},{"language":"CS","name":"Czech"},{"language":"DA","name":"Danish"},{"language":"DE","name":"German"},{"language":"EL","name":"Greek"},{"language":"EN","name":"English"},{"language":"ES","name":"Spanish"},{"language":"ET","name":"Estonian"},{"language":"FI","name":"Finnish"},{"language":"FR","name":"French"},{"language":"HU","name":"Hungarian"},{"language":"ID","name":"Indonesian"},{"language":"IT","name":"Italian"},{"language":"JA","name":"Japanese"},{"language":"KO","name":"Korean"},{"language":"LT","name":"Lithuanian"},{"language":"LV","name":"Latvian"},{"language":"NB","name":"Norwegian"},{"language":"NL","name":"Dutch"},{"language":"PL","name":"Polish"},{"language":"PT","name":"Portuguese"},{"language":"RO","name":"Romanian"},{"language":"RU","name":"Russian"},{"language":"SK","name":"Slovak"},{"language":"SL","name":"Slovenian"},{"language":"SV","name":"Swedish"},{"language":"TR","name":"Turkish"},{"language":"UK","name":"Ukrainian"},{"language":"ZH","name":"Chinese"}]')]);
/** https://api-free.deepl.com/v2/languages?type=target */
_defineProperty(DeepLTranslate, "TARGET_LANGUAGES", JSON.parse('[{"language":"BG","name":"Bulgarian","supports_formality":false},{"language":"CS","name":"Czech","supports_formality":false},{"language":"DA","name":"Danish","supports_formality":false},{"language":"DE","name":"German","supports_formality":true},{"language":"EL","name":"Greek","supports_formality":false},{"language":"EN-GB","name":"English (British)","supports_formality":false},{"language":"EN-US","name":"English (American)","supports_formality":false},{"language":"ES","name":"Spanish","supports_formality":true},{"language":"ET","name":"Estonian","supports_formality":false},{"language":"FI","name":"Finnish","supports_formality":false},{"language":"FR","name":"French","supports_formality":true},{"language":"HU","name":"Hungarian","supports_formality":false},{"language":"ID","name":"Indonesian","supports_formality":false},{"language":"IT","name":"Italian","supports_formality":true},{"language":"JA","name":"Japanese","supports_formality":true},{"language":"KO","name":"Korean","supports_formality":false},{"language":"LT","name":"Lithuanian","supports_formality":false},{"language":"LV","name":"Latvian","supports_formality":false},{"language":"NB","name":"Norwegian","supports_formality":false},{"language":"NL","name":"Dutch","supports_formality":true},{"language":"PL","name":"Polish","supports_formality":true},{"language":"PT-BR","name":"Portuguese (Brazilian)","supports_formality":true},{"language":"PT-PT","name":"Portuguese (European)","supports_formality":true},{"language":"RO","name":"Romanian","supports_formality":false},{"language":"RU","name":"Russian","supports_formality":true},{"language":"SK","name":"Slovak","supports_formality":false},{"language":"SL","name":"Slovenian","supports_formality":false},{"language":"SV","name":"Swedish","supports_formality":false},{"language":"TR","name":"Turkish","supports_formality":false},{"language":"UK","name":"Ukrainian","supports_formality":false},{"language":"ZH","name":"Chinese (simplified)","supports_formality":false}]'));
_defineProperty(DeepLTranslate, "DETECT_LANGUAGE", '');
_defineProperty(DeepLTranslate, "DefaultLanguage", {
  SOURCE_LANG: _class.DETECT_LANGUAGE,
  TARGET_LANG: 'EN-US'
});
_defineProperty(DeepLTranslate, "GOOGLE_TRANSLATE_MAPPING", {
  '': 'auto',
  BG: 'bg',
  CS: 'cs',
  DA: 'da',
  DE: 'de',
  EL: 'el',
  EN: 'en',
  'EN-GB': 'en',
  'EN-US': 'en',
  ES: 'es',
  ET: 'et',
  FI: 'fi',
  FR: 'fr',
  HU: 'hu',
  ID: 'id',
  IT: 'it',
  JA: 'ja',
  KO: 'ko',
  LT: 'lt',
  LV: 'lv',
  NL: 'nl',
  PL: 'pl',
  PT: 'pt',
  'PT-BR': 'pt',
  'PT-PT': 'pt',
  RO: 'ro',
  RU: 'ru',
  SK: 'sk',
  SL: 'sl',
  SV: 'sv',
  UK: 'uk',
  ZH: 'zh-CN'
});
_defineProperty(DeepLTranslate, "PAPAGO_MAPPING", {
  '': 'auto',
  DE: 'de',
  EN: 'en',
  'EN-GB': 'en',
  'EN-US': 'en',
  ES: 'es',
  FR: 'fr',
  IT: 'it',
  JA: 'ja',
  KO: 'ko',
  PT: 'pt',
  'PT-BR': 'pt',
  'PT-PT': 'pt',
  RU: 'ru',
  ZH: 'zh-CN'
});
_defineProperty(DeepLTranslate, "MICROSOFT_TRANSLATOR_MAPPING", {
  BG: 'bg',
  CS: 'cs',
  DA: 'da',
  DE: 'de',
  EL: 'el',
  EN: 'en',
  'EN-GB': 'en',
  'EN-US': 'en',
  ES: 'es',
  ET: 'et',
  FI: 'fi',
  FR: 'fr',
  HU: 'hu',
  ID: 'id',
  IT: 'it',
  JA: 'ja',
  KO: 'ko',
  LT: 'lt',
  LV: 'lv',
  NL: 'nl',
  PL: 'pl',
  PT: 'pt',
  'PT-BR': 'pt',
  'PT-PT': 'pt-PT',
  RO: 'ro',
  RU: 'ru',
  SK: 'sk',
  SL: 'sl',
  SV: 'sv',
  UK: 'uk',
  ZH: 'zh-CN'
});
class GoogleTranslate {
  constructor() {
    this.apiKey = 'AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw';
  }
  async init() {
    try {
      this.data = await this.fetchElementJsData();
    } catch (error) {
      console.error(error);
      throw error;
    }
    return this;
  }
  static getSlName(languageCode) {
    return GoogleTranslate.SOURCE_LANGUAGES[languageCode];
  }
  static getTlName(languageCode) {
    return GoogleTranslate.TARGET_LANGUAGES[languageCode];
  }
  static getMappedSourceLanguageCode(translator, languageCode) {
    switch (translator) {
      case Translators.DEEPL_TRANSLATE:
        {
          var _GoogleTranslate$DEEP;
          return (_GoogleTranslate$DEEP = GoogleTranslate.DEEPL_TRANSLATOR_MAPPING.SOURCE_LANGUAGES[languageCode]) !== null && _GoogleTranslate$DEEP !== void 0 ? _GoogleTranslate$DEEP : DeepLTranslate.SOURCE_LANGUAGES.filter(_ref3 => {
            let {
              language
            } = _ref3;
            return language === languageCode;
          }).length > 0 ? languageCode : DeepLTranslate.DefaultLanguage.SOURCE_LANG;
        }
      case Translators.PAPAGO:
        {
          return Object.prototype.hasOwnProperty.call(Papago.SOURCE_LANGUAGES, languageCode) ? languageCode : Papago.DefaultLanguage.SOURCE;
        }
      case Translators.MICROSOFT_TRANSLATOR:
        {
          var _GoogleTranslate$MICR;
          return (_GoogleTranslate$MICR = GoogleTranslate.MICROSOFT_TRANSLATOR_MAPPING[languageCode]) !== null && _GoogleTranslate$MICR !== void 0 ? _GoogleTranslate$MICR : Object.prototype.hasOwnProperty.call(MicrosoftTranslator.FROM_LANGUAGES, languageCode) ? languageCode : MicrosoftTranslator.DefaultLanguage.FROM;
        }
      case Translators.VIETPHRASE:
        {
          return Vietphrase.DefaultLanguage.SOURCE_LANGUAGE;
        }
      default:
        {
          return null;
        }
    }
  }
  static getMappedTargetLanguageCode(translator, languageCode) {
    switch (translator) {
      case Translators.DEEPL_TRANSLATE:
        {
          var _GoogleTranslate$DEEP2;
          return (_GoogleTranslate$DEEP2 = GoogleTranslate.DEEPL_TRANSLATOR_MAPPING.TARGET_LANGUAGES[languageCode]) !== null && _GoogleTranslate$DEEP2 !== void 0 ? _GoogleTranslate$DEEP2 : DeepLTranslate.TARGET_LANGUAGES.filter(_ref4 => {
            let {
              language
            } = _ref4;
            return language === languageCode;
          }).length > 0 ? languageCode : DeepLTranslate.DefaultLanguage.TARGET_LANG;
        }
      case Translators.PAPAGO:
        {
          return Object.prototype.hasOwnProperty.call(Papago.TARGET_LANGUAGES, languageCode) ? languageCode : Papago.DefaultLanguage.TARGET;
        }
      case Translators.MICROSOFT_TRANSLATOR:
        {
          var _GoogleTranslate$MICR2;
          return (_GoogleTranslate$MICR2 = GoogleTranslate.MICROSOFT_TRANSLATOR_MAPPING[languageCode]) !== null && _GoogleTranslate$MICR2 !== void 0 ? _GoogleTranslate$MICR2 : Object.prototype.hasOwnProperty.call(MicrosoftTranslator.TO_LANGUAGES, languageCode) ? languageCode : MicrosoftTranslator.DefaultLanguage.TO;
        }
      case Translators.VIETPHRASE:
        {
          return Vietphrase.DefaultLanguage.TARGET_LANGUAGE;
        }
      default:
        {
          return null;
        }
    }
  }
  async fetchElementJsData() {
    try {
      /**
       * Google translate Widget
       * URL: //translate.google.com/translate_a/element.js?cb=googleTranslateElementInit
       *
       * Google Translate Websites
       * URL: https://translate.google.com/translate_a/element.js?cb=gtElInit&hl=vi&client=wt
       *
       * Google Chrome
       * Method: GET
       * URL: https://translate.googleapis.com/translate_a/element.js?cb=cr.googleTranslate.onTranslateElementLoad&aus=true&clc=cr.googleTranslate.onLoadCSS&jlc=cr.googleTranslate.onLoadJavascript&hl=vi&key=AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw
       * Google-Translate-Element-Mode: library
       */
      const elementJs = await $.ajax({
        headers: {
          'Google-Translate-Element-Mode': 'library'
        },
        method: 'GET',
        url: "".concat(Utils.CORS_PROXY, "https://translate.googleapis.com/translate_a/element.js?aus=true&hl=vi").concat(this.apiKey.length > 0 ? "&key=".concat(this.apiKey) : '')
      });
      this.kq = () => elementJs.match(/c\._ctkk='(\d+\.\d+)'/)[1];
      // console.log(elementJs.match(/_loadJs\('([^']+)'\)/)[1]);
      return {
        _cac: elementJs.match(/c\._cac='([a-z]*)'/)[1],
        _cam: elementJs.match(/c\._cam='([a-z]*)'/)[1],
        v: elementJs.match(/_exportVersion\('(TE_\d+)'\)/)[1]
      };
    } catch (error) {
      console.error('Không thể lấy được Google Translate Element:', error);
      throw console.error('Không thể lấy được Google Translate Element!');
    }
  }
  async translateText(sl, tl, q) {
    try {
      /**
       * Google translate Widget
       * Method: POST
       * URL: https://translate.googleapis.com/translate_a/t?anno=3&client=te&format=html&v=1.0&key&logld=v${version}&sl=${sl}&tl=${tl}&tc=0&tk=${lq(querys)}
       * `q=${querys.split(/\n/).map((sentence) => encodeURIComponent(sentence)).join('&q=')}`
       *
       * Google Translate
       * Method: GET
       * URL: https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&hl=vi&dt=t&dt=bd&dj=1&q=${encodeURIComponent(querys)}
       *
       * Google Translate Websites
       * Method: POST
       * URL: https://translate.googleapis.com/translate_a/t?anno=3&client=wt_lib&format=html&v=1.0&key=&logld=v${version}&sl=${sl}&tl=${tl}&tc=0&tk=${lq(querys)}
       * Content-Type: application/x-www-form-urlencoded - `q=${querys.split(/\n/).map((sentence) => encodeURIComponent(sentence)).join('&q=')}`
       *
       * Google Chrome
       * Method: POST
       * URL: https://translate.googleapis.com/translate_a/t?anno=3&client=${(_cac || 'te') + (_cam === 'lib' ? '_lib' : '')}&format=html&v=1.0&key=AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw&logld=v${v || ''}&sl=${sl}&tl=${tl}&tc=0&tk=${lq(querys)}
       * Content-Type: application/x-www-form-urlencoded - `q=${querys.split(/\n/).map((sentence) => encodeURIComponent(sentence)).join('&q=')}`
       */
      return Utils.convertHtmlToText((await $.ajax({
        data: "q=".concat(q.split(/\n/).map(element => encodeURIComponent(element)).join('&q=')),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        url: "https://translate.googleapis.com/translate_a/t?anno=3&client=".concat((this.data._cac || 'te') + (this.data._cam === 'lib' ? '_lib' : ''), "&format=html&v=1.0&key").concat(this.apiKey.length > 0 ? "=".concat(this.apiKey) : '', "&logld=v").concat(this.data.v || '', "&sl=").concat(sl, "&tl=").concat(tl, "&tc=0&tk=").concat(this.lq(q.replace(/\n/g, '')))
      })).map(element => sl === 'auto' ? element[0] : element).map(element => element.includes('<i>') ? element.replace(/<i>(?:.(?!<\/i>))+.(?=<\/i>)<\/i> <b>((?:.(?!<\/b>))+.(?=<\/b>))<\/b>/g, '$1') : element).join('\n'));
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      throw error;
    }
  }

  /* eslint-disable */

  static Oo(a) {
    for (var b = [], c = 0, d = 0; d < a.length; d++) {
      var e = a.charCodeAt(d);
      128 > e ? b[c++] = e : (2048 > e ? b[c++] = e >> 6 | 192 : (55296 === (e & 64512) && d + 1 < a.length && 56320 === (a.charCodeAt(d + 1) & 64512) ? (e = 65536 + ((e & 1023) << 10) + (a.charCodeAt(++d) & 1023), b[c++] = e >> 18 | 240, b[c++] = e >> 12 & 63 | 128) : b[c++] = e >> 12 | 224, b[c++] = e >> 6 & 63 | 128), b[c++] = e & 63 | 128);
    }
    return b;
  }
  static jq(a, b) {
    for (var c = 0; c < b.length - 2; c += 3) {
      var d = b.charAt(c + 2);
      d = 'a' <= d ? d.charCodeAt(0) - 87 : Number(d);
      d = '+' === b.charAt(c + 1) ? a >>> d : a << d;
      a = '+' === b.charAt(c) ? a + d & 4294967295 : a ^ d;
    }
    return a;
  }
  lq(a) {
    var b = this.kq().split('.'),
      c = Number(b[0]) || 0;
    a = GoogleTranslate.Oo(a);
    for (var d = c, e = 0; e < a.length; e++) {
      d += a[e], d = GoogleTranslate.jq(d, '+-a^+6');
    }
    d = GoogleTranslate.jq(d, '+-3^+b+-f');
    d ^= Number(b[1]) || 0;
    0 > d && (d = (d & 2147483647) + 2147483648);
    b = d % 1e6;
    return b.toString() + '.' + (b ^ c);
  }

  /* eslint-enable */
}

_class2 = GoogleTranslate;
/** https://translate.googleapis.com/translate_a/l?client=chrome */
_defineProperty(GoogleTranslate, "SOURCE_LANGUAGES", JSON.parse('{"auto":"Phát hiện ngôn ngữ","ar":"Ả Rập","sq":"Albania","am":"Amharic","en":"Anh","hy":"Armenia","as":"Assam","ay":"Aymara","az":"Azerbaijan","pl":"Ba Lan","fa":"Ba Tư","bm":"Bambara","xh":"Bantu","eu":"Basque","be":"Belarus","bn":"Bengal","bho":"Bhojpuri","bs":"Bosnia","pt":"Bồ Đào Nha","bg":"Bulgaria","ca":"Catalan","ceb":"Cebuano","ny":"Chichewa","co":"Corsi","ht":"Creole (Haiti)","hr":"Croatia","dv":"Dhivehi","iw":"Do Thái","doi":"Dogri","da":"Đan Mạch","de":"Đức","et":"Estonia","ee":"Ewe","tl":"Filipino","fy":"Frisia","gd":"Gael Scotland","gl":"Galicia","ka":"George","gn":"Guarani","gu":"Gujarat","nl":"Hà Lan","af":"Hà Lan (Nam Phi)","ko":"Hàn","ha":"Hausa","haw":"Hawaii","hi":"Hindi","hmn":"Hmong","hu":"Hungary","el":"Hy Lạp","is":"Iceland","ig":"Igbo","ilo":"Ilocano","id":"Indonesia","ga":"Ireland","jw":"Java","kn":"Kannada","kk":"Kazakh","km":"Khmer","rw":"Kinyarwanda","gom":"Konkani","kri":"Krio","ku":"Kurd (Kurmanji)","ckb":"Kurd (Sorani)","ky":"Kyrgyz","lo":"Lào","la":"Latinh","lv":"Latvia","ln":"Lingala","lt":"Litva","lg":"Luganda","lb":"Luxembourg","ms":"Mã Lai","mk":"Macedonia","mai":"Maithili","mg":"Malagasy","ml":"Malayalam","mt":"Malta","mi":"Maori","mr":"Marathi","mni-Mtei":"Meiteilon (Manipuri)","lus":"Mizo","mn":"Mông Cổ","my":"Myanmar","no":"Na Uy","ne":"Nepal","ru":"Nga","ja":"Nhật","or":"Odia (Oriya)","om":"Oromo","ps":"Pashto","sa":"Phạn","fr":"Pháp","fi":"Phần Lan","pa":"Punjab","qu":"Quechua","eo":"Quốc tế ngữ","ro":"Rumani","sm":"Samoa","cs":"Séc","nso":"Sepedi","sr":"Serbia","st":"Sesotho","sn":"Shona","sd":"Sindhi","si":"Sinhala","sk":"Slovak","sl":"Slovenia","so":"Somali","su":"Sunda","sw":"Swahili","tg":"Tajik","ta":"Tamil","tt":"Tatar","es":"Tây Ban Nha","te":"Telugu","th":"Thái","tr":"Thổ Nhĩ Kỳ","sv":"Thụy Điển","ti":"Tigrinya","zh-CN":"Trung","ts":"Tsonga","tk":"Turkmen","ak":"Twi","uk":"Ukraina","ur":"Urdu","ug":"Uyghur","uz":"Uzbek","vi":"Việt","cy":"Xứ Wales","it":"Ý","yi":"Yiddish","yo":"Yoruba","zu":"Zulu"}'));
_defineProperty(GoogleTranslate, "TARGET_LANGUAGES", JSON.parse('{"ar":"Ả Rập","sq":"Albania","am":"Amharic","en":"Anh","hy":"Armenia","as":"Assam","ay":"Aymara","az":"Azerbaijan","pl":"Ba Lan","fa":"Ba Tư","bm":"Bambara","xh":"Bantu","eu":"Basque","be":"Belarus","bn":"Bengal","bho":"Bhojpuri","bs":"Bosnia","pt":"Bồ Đào Nha","bg":"Bulgaria","ca":"Catalan","ceb":"Cebuano","ny":"Chichewa","co":"Corsi","ht":"Creole (Haiti)","hr":"Croatia","dv":"Dhivehi","iw":"Do Thái","doi":"Dogri","da":"Đan Mạch","de":"Đức","et":"Estonia","ee":"Ewe","tl":"Filipino","fy":"Frisia","gd":"Gael Scotland","gl":"Galicia","ka":"George","gn":"Guarani","gu":"Gujarat","nl":"Hà Lan","af":"Hà Lan (Nam Phi)","ko":"Hàn","ha":"Hausa","haw":"Hawaii","hi":"Hindi","hmn":"Hmong","hu":"Hungary","el":"Hy Lạp","is":"Iceland","ig":"Igbo","ilo":"Ilocano","id":"Indonesia","ga":"Ireland","jw":"Java","kn":"Kannada","kk":"Kazakh","km":"Khmer","rw":"Kinyarwanda","gom":"Konkani","kri":"Krio","ku":"Kurd (Kurmanji)","ckb":"Kurd (Sorani)","ky":"Kyrgyz","lo":"Lào","la":"Latinh","lv":"Latvia","ln":"Lingala","lt":"Litva","lg":"Luganda","lb":"Luxembourg","ms":"Mã Lai","mk":"Macedonia","mai":"Maithili","mg":"Malagasy","ml":"Malayalam","mt":"Malta","mi":"Maori","mr":"Marathi","mni-Mtei":"Meiteilon (Manipuri)","lus":"Mizo","mn":"Mông Cổ","my":"Myanmar","no":"Na Uy","ne":"Nepal","ru":"Nga","ja":"Nhật","or":"Odia (Oriya)","om":"Oromo","ps":"Pashto","sa":"Phạn","fr":"Pháp","fi":"Phần Lan","pa":"Punjab","qu":"Quechua","eo":"Quốc tế ngữ","ro":"Rumani","sm":"Samoa","cs":"Séc","nso":"Sepedi","sr":"Serbia","st":"Sesotho","sn":"Shona","sd":"Sindhi","si":"Sinhala","sk":"Slovak","sl":"Slovenia","so":"Somali","su":"Sunda","sw":"Swahili","tg":"Tajik","ta":"Tamil","tt":"Tatar","es":"Tây Ban Nha","te":"Telugu","th":"Thái","tr":"Thổ Nhĩ Kỳ","sv":"Thụy Điển","ti":"Tigrinya","zh-CN":"Trung (Giản thể)","zh-TW":"Trung (Phồn thể)","ts":"Tsonga","tk":"Turkmen","ak":"Twi","uk":"Ukraina","ur":"Urdu","ug":"Uyghur","uz":"Uzbek","vi":"Việt","cy":"Xứ Wales","it":"Ý","yi":"Yiddish","yo":"Yoruba","zu":"Zulu"}'));
_defineProperty(GoogleTranslate, "DETECT_LANGUAGE", 'auto');
_defineProperty(GoogleTranslate, "DefaultLanguage", {
  SL: _class2.DETECT_LANGUAGE,
  TL: 'vi'
});
_defineProperty(GoogleTranslate, "DEEPL_TRANSLATOR_MAPPING", {
  SOURCE_LANGUAGES: {
    auto: '',
    ja: 'JA',
    en: 'EN',
    'zh-CN': 'ZH'
  },
  TARGET_LANGUAGES: {
    ja: 'JA',
    en: 'EN-US',
    'zh-CN': 'ZH',
    'zh-TW': 'ZH'
  }
});
_defineProperty(GoogleTranslate, "MICROSOFT_TRANSLATOR_MAPPING", {
  auto: '',
  'zh-CN': 'zh-Hans',
  'zh-TW': 'zh-Hant'
});
class Papago {
  constructor() {
    this.uuid = crypto.randomUUID();
  }
  async init() {
    try {
      this.version = await Papago.fetchVersion();
    } catch (error) {
      console.error(error);
      throw error;
    }
    return this;
  }
  static getSourceName(languageCode) {
    return Papago.SOURCE_LANGUAGES[languageCode];
  }
  static getTargetName(languageCode) {
    return Papago.TARGET_LANGUAGES[languageCode];
  }
  static getMappedSourceLanguageCode(translator, languageCode) {
    switch (translator) {
      case Translators.DEEPL_TRANSLATE:
        {
          var _Papago$DEEPL_TRANSLA;
          return (_Papago$DEEPL_TRANSLA = Papago.DEEPL_TRANSLATOR_MAPPING.SOURCE_LANGUAGES[languageCode]) !== null && _Papago$DEEPL_TRANSLA !== void 0 ? _Papago$DEEPL_TRANSLA : DeepLTranslate.SOURCE_LANGUAGES.filter(_ref5 => {
            let {
              language
            } = _ref5;
            return language === languageCode;
          }).length > 0 ? languageCode : DeepLTranslate.DefaultLanguage.SOURCE_LANG;
        }
      case Translators.GOOGLE_TRANSLATE:
        {
          var _Papago$GOOGLE_TRANSL;
          return ((_Papago$GOOGLE_TRANSL = Papago.GOOGLE_TRANSLATOR_MAPPING[languageCode]) !== null && _Papago$GOOGLE_TRANSL !== void 0 ? _Papago$GOOGLE_TRANSL : Object.prototype.hasOwnProperty.call(Papago.SOURCE_LANGUAGES, languageCode)) ? languageCode : GoogleTranslate.DefaultLanguage.SL;
        }
      case Translators.MICROSOFT_TRANSLATOR:
        {
          var _Papago$MICROSOFT_TRA;
          return (_Papago$MICROSOFT_TRA = Papago.MICROSOFT_TRANSLATOR_MAPPING[languageCode]) !== null && _Papago$MICROSOFT_TRA !== void 0 ? _Papago$MICROSOFT_TRA : Object.prototype.hasOwnProperty.call(MicrosoftTranslator.FROM_LANGUAGES, languageCode) ? languageCode : MicrosoftTranslator.DefaultLanguage.FROM;
        }
      case Translators.VIETPHRASE:
        {
          return Vietphrase.DefaultLanguage.SOURCE_LANGUAGE;
        }
      default:
        {
          return null;
        }
    }
  }
  static getMappedTargetLanguageCode(translator, languageCode) {
    switch (translator) {
      case Translators.DEEPL_TRANSLATE:
        {
          var _Papago$DEEPL_TRANSLA2;
          return (_Papago$DEEPL_TRANSLA2 = Papago.DEEPL_TRANSLATOR_MAPPING.TARGET_LANGUAGES[languageCode]) !== null && _Papago$DEEPL_TRANSLA2 !== void 0 ? _Papago$DEEPL_TRANSLA2 : DeepLTranslate.TARGET_LANGUAGES.filter(_ref6 => {
            let {
              language
            } = _ref6;
            return language === languageCode;
          }).length > 0 ? languageCode : DeepLTranslate.DefaultLanguage.TARGET_LANG;
        }
      case Translators.GOOGLE_TRANSLATE:
        {
          return Object.prototype.hasOwnProperty.call(Papago.TARGET_LANGUAGES, languageCode) ? languageCode : GoogleTranslate.DefaultLanguage.TL;
        }
      case Translators.MICROSOFT_TRANSLATOR:
        {
          var _Papago$MICROSOFT_TRA2;
          return (_Papago$MICROSOFT_TRA2 = Papago.MICROSOFT_TRANSLATOR_MAPPING[languageCode]) !== null && _Papago$MICROSOFT_TRA2 !== void 0 ? _Papago$MICROSOFT_TRA2 : Object.prototype.hasOwnProperty.call(MicrosoftTranslator.TO_LANGUAGES, languageCode) ? languageCode : MicrosoftTranslator.DefaultLanguage.TO;
        }
      case Translators.VIETPHRASE:
        {
          return Vietphrase.DefaultLanguage.TARGET_LANGUAGE;
        }
      default:
        {
          return null;
        }
    }
  }
  static async fetchVersion() {
    try {
      const mainJs = (await $.ajax({
        method: 'GET',
        url: "".concat(Utils.CORS_PROXY, "https://papago.naver.com")
      })).match(/\/(main.*\.js)/)[1];
      return (await $.ajax({
        method: 'GET',
        url: "".concat(Utils.CORS_PROXY, "https://papago.naver.com/").concat(mainJs)
      })).match(/"PPG .*,"(v[^"]*)/)[1];
    } catch (error) {
      console.error('Không thể lấy được Thông tin phiên bản:', error);
      throw console.error('Không thể lấy được Thông tin phiên bản!');
    }
  }
  async translateText(source, target, text) {
    try {
      const timeStamp = new Date().getTime();
      return (await $.ajax({
        data: "deviceId=".concat(this.uuid, "&locale=vi&dict=true&dictDisplay=30&honorific=true&instant=false&paging=false&source=").concat(source, "&target=").concat(target, "&text=").concat(encodeURIComponent(text)),
        headers: {
          Accept: 'application/json',
          'Accept-Language': 'vi',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          // 'device-type': 'pc',
          // 'device-type': 'mobile',
          'x-apigw-partnerid': 'papago',
          /* eslint-disable */

          Authorization: 'PPG ' + this.uuid + ':' + window.CryptoJS.HmacMD5(this.uuid + '\n' + 'https://papago.naver.com/apis/n2mt/translate' + '\n' + timeStamp, this.version).toString(window.CryptoJS.enc.Base64),
          /* eslint-enable */
          Timestamp: timeStamp
        },
        method: 'POST',
        url: "".concat(Utils.CORS_PROXY, "https://papago.naver.com/apis/n2mt/translate")
      })).translatedText;
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      throw error;
    }
  }
}
_class3 = Papago;
_defineProperty(Papago, "SOURCE_LANGUAGES", {
  auto: 'Phát hiện ngôn ngữ',
  ko: 'Hàn',
  en: 'Anh',
  ja: 'Nhật',
  'zh-CN': 'Trung (Giản thể)',
  'zh-TW': 'Trung (Phổn thể)',
  es: 'Tây Ban Nha',
  fr: 'Pháp',
  de: 'Đức',
  ru: 'Nga',
  pt: 'Bồ Đào Nha',
  it: 'Ý',
  vi: 'Việt',
  th: 'Thái',
  id: 'Indonesia',
  hi: 'Hindi'
});
_defineProperty(Papago, "TARGET_LANGUAGES", {
  ko: 'Hàn',
  en: 'Anh',
  ja: 'Nhật',
  'zh-CN': 'Trung (Giản thể)',
  'zh-TW': 'Trung (Phổn thể)',
  es: 'Tây Ban Nha',
  fr: 'Pháp',
  de: 'Đức',
  ru: 'Nga',
  pt: 'Bồ Đào Nha',
  it: 'Ý',
  vi: 'Việt',
  th: 'Thái',
  id: 'Indonesia',
  hi: 'Hindi'
});
_defineProperty(Papago, "DETECT_LANGUAGE", 'auto');
_defineProperty(Papago, "DefaultLanguage", {
  SOURCE: _class3.DETECT_LANGUAGE,
  TARGET: 'vi'
});
_defineProperty(Papago, "DEEPL_TRANSLATOR_MAPPING", {
  SOURCE_LANGUAGES: {
    '': 'auto',
    en: 'EN',
    ja: 'JA',
    'zh-CN': 'ZH',
    'zh-TW': 'ZH'
  },
  TARGET_LANGUAGES: {
    en: 'EN-US',
    ja: 'JA',
    'zh-CN': 'ZH',
    'zh-TW': 'ZH'
  }
});
_defineProperty(Papago, "GOOGLE_TRANSLATOR_MAPPING", {
  'zh-TW': 'zh-CN'
});
_defineProperty(Papago, "MICROSOFT_TRANSLATOR_MAPPING", {
  auto: '',
  'zh-CN': 'zh-Hans',
  'zh-TW': 'zh-Hant'
});
class MicrosoftTranslator {
  async init() {
    try {
      this.accessToken = await MicrosoftTranslator.fetchAccessToken();
    } catch (error) {
      console.error(error);
      throw error;
    }
    return this;
  }
  static getFromName(languageCode) {
    return MicrosoftTranslator.FROM_LANGUAGES[languageCode].name.startsWith('Tiếng ') ? MicrosoftTranslator.FROM_LANGUAGES[languageCode].name.match(/Tiếng (.+)/)[1] : MicrosoftTranslator.FROM_LANGUAGES[languageCode].name;
  }
  static getToName(languageCode) {
    return MicrosoftTranslator.TO_LANGUAGES[languageCode].name.startsWith('Tiếng ') ? MicrosoftTranslator.TO_LANGUAGES[languageCode].name.match(/Tiếng (.+)/)[1] : MicrosoftTranslator.TO_LANGUAGES[languageCode].name;
  }
  static getMappedSourceLanguageCode(translator, languageCode) {
    switch (translator) {
      case Translators.DEEPL_TRANSLATE:
        {
          var _MicrosoftTranslator$;
          return (_MicrosoftTranslator$ = MicrosoftTranslator.DEEPL_TRANSLATOR_MAPPING.SOURCE_LANGUAGES[languageCode]) !== null && _MicrosoftTranslator$ !== void 0 ? _MicrosoftTranslator$ : DeepLTranslate.SOURCE_LANGUAGES.filter(_ref7 => {
            let {
              language
            } = _ref7;
            return language === languageCode;
          }).length > 0 ? languageCode : DeepLTranslate.DefaultLanguage.SOURCE_LANG;
        }
      case Translators.GOOGLE_TRANSLATE:
        {
          var _MicrosoftTranslator$2;
          return (_MicrosoftTranslator$2 = MicrosoftTranslator.GOOGLE_TRANSLATE_MAPPING[languageCode]) !== null && _MicrosoftTranslator$2 !== void 0 ? _MicrosoftTranslator$2 : Object.prototype.hasOwnProperty.call(GoogleTranslate.SOURCE_LANGUAGES, languageCode) ? languageCode : GoogleTranslate.DefaultLanguage.SL;
        }
      case Translators.PAPAGO:
        {
          var _MicrosoftTranslator$3;
          return (_MicrosoftTranslator$3 = MicrosoftTranslator.PAPAGO_MAPPING[languageCode]) !== null && _MicrosoftTranslator$3 !== void 0 ? _MicrosoftTranslator$3 : Object.prototype.hasOwnProperty.call(Papago.SOURCE_LANGUAGES, languageCode) ? languageCode : Papago.DefaultLanguage.SOURCE;
        }
      case Translators.VIETPHRASE:
        {
          return Vietphrase.DefaultLanguage.SOURCE_LANGUAGE;
        }
      default:
        {
          return null;
        }
    }
  }
  static getMappedTargetLanguageCode(translator, languageCode) {
    switch (translator) {
      case Translators.DEEPL_TRANSLATE:
        {
          var _MicrosoftTranslator$4;
          return (_MicrosoftTranslator$4 = MicrosoftTranslator.DEEPL_TRANSLATOR_MAPPING.TARGET_LANGUAGES[languageCode]) !== null && _MicrosoftTranslator$4 !== void 0 ? _MicrosoftTranslator$4 : DeepLTranslate.TARGET_LANGUAGES.filter(_ref8 => {
            let {
              language
            } = _ref8;
            return language === languageCode;
          }).length > 0 ? languageCode : DeepLTranslate.DefaultLanguage.TARGET_LANG;
        }
      case Translators.GOOGLE_TRANSLATE:
        {
          var _MicrosoftTranslator$5;
          return (_MicrosoftTranslator$5 = MicrosoftTranslator.GOOGLE_TRANSLATE_MAPPING[languageCode]) !== null && _MicrosoftTranslator$5 !== void 0 ? _MicrosoftTranslator$5 : Object.prototype.hasOwnProperty.call(GoogleTranslate.TARGET_LANGUAGES, languageCode) ? languageCode : GoogleTranslate.DefaultLanguage.TL;
        }
      case Translators.PAPAGO:
        {
          var _MicrosoftTranslator$6;
          return (_MicrosoftTranslator$6 = MicrosoftTranslator.PAPAGO_MAPPING[languageCode]) !== null && _MicrosoftTranslator$6 !== void 0 ? _MicrosoftTranslator$6 : Object.prototype.hasOwnProperty.call(Papago.TARGET_LANGUAGES, languageCode) ? languageCode : Papago.DefaultLanguage.TARGET;
        }
      case Translators.VIETPHRASE:
        {
          return Vietphrase.DefaultLanguage.TARGET_LANGUAGE;
        }
      default:
        {
          return null;
        }
    }
  }
  static async fetchAccessToken() {
    try {
      return await $.ajax({
        dataType: 'text',
        method: 'GET',
        url: 'https://edge.microsoft.com/translate/auth'
      });
    } catch (error) {
      console.error('Không thể lấy được Access Token:', error);
      throw console.error('Không thể lấy được Access Token!');
    }
  }
  async translateText(from, to, text) {
    try {
      /**
       * Microsoft Bing Translator
       * const bingTranslatorHTML = await $.get('https://cors-anywhere.herokuapp.com/https://www.bing.com/translator');
       * const IG = bingTranslatorHTML.match(/IG:'([A-Z0-9]+)'/)[1];
       * const IID = bingTranslatorHTML.match(/data-iid='(translator.\d+)'/)[1];
       * const [, key, token] = bingTranslatorHTML.match(/var params_AbusePreventionHelper\s*=\s*\[([0-9]+),\s*'([^']+)',[^\]]*\];/);
       * Method: POST
       * URL: https://www.bing.com/ttranslatev3?isVertical=1&&IG=76A5BF5FFF374A53A1374DE8089BDFF2&IID=translator.5029
       * Content-type: application/x-www-form-urlencoded send(&fromLang=auto-detect&text=inputText&to=targetLanguage&token=kXtg8tfzQrA11KAJyMhp61NCVy-19gPj&key=1687667900500&tryFetchingGenderDebiasedTranslations=true)
       *
       * Microsoft Edge old
       * Method: POST
       * URL: https://api.cognitive.microsofttranslator.com/translate?to=${targetLanguage}&api-version=3.0&includeSentenceLength=true
       * Content-Type: application/json - send(inputText)
       *
       * Microsoft Edge 2
       * Method: POST
       * URL: https://api-edge.cognitive.microsofttranslator.com/translate?to=${targetLanguage}&api-version=3.0&includeSentenceLength=true
       * URL: https://api-edge.cognitive.microsofttranslator.com/translate?from=${sourceLanguage}&to=${targetLanguage}&api-version=3.0&includeSentenceLength=true
       * Authorization: Bearer ${accessToken} - Content-Type: application/json - send(inputText)
       */
      return (await $.ajax({
        data: JSON.stringify(text.split(/\n/).map(element => ({
          Text: element
        }))),
        dataType: 'json',
        headers: {
          Authorization: "Bearer ".concat(this.accessToken),
          'Content-Type': 'application/json'
        },
        method: 'POST',
        url: "https://api-edge.cognitive.microsofttranslator.com/translate?api-version=3.0&from=".concat(from, "&to=").concat(to)
      })).map(_ref9 => {
        let {
          translations: [element]
        } = _ref9;
        return element.text;
      }).join('\n');
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      throw error;
    }
  }
}
_class4 = MicrosoftTranslator;
/** https://api.cognitive.microsofttranslator.com/languages?api-version=3.0 */
_defineProperty(MicrosoftTranslator, "FROM_LANGUAGES", _objectSpread({
  '': {
    name: 'Tự phát hiện'
  }
}, JSON.parse('{"af":{"name":"Tiếng Afrikaans","nativeName":"Afrikaans","dir":"ltr"},"am":{"name":"Tiếng Amharic","nativeName":"አማርኛ","dir":"ltr"},"ar":{"name":"Tiếng Ả Rập","nativeName":"العربية","dir":"rtl"},"as":{"name":"Tiếng Assam","nativeName":"অসমীয়া","dir":"ltr"},"az":{"name":"Tiếng Azerbaijan","nativeName":"Azərbaycan","dir":"ltr"},"ba":{"name":"Tiếng Bashkir","nativeName":"Bashkir","dir":"ltr"},"bg":{"name":"Tiếng Bulgaria","nativeName":"Български","dir":"ltr"},"bho":{"name":"Bhojpuri","nativeName":"Bhojpuri","dir":"ltr"},"bn":{"name":"Tiếng Bangla","nativeName":"বাংলা","dir":"ltr"},"bo":{"name":"Tiếng Tây Tạng","nativeName":"བོད་སྐད་","dir":"ltr"},"brx":{"name":"Bodo","nativeName":"बड़ो","dir":"ltr"},"bs":{"name":"Tiếng Bosnia","nativeName":"Bosnian","dir":"ltr"},"ca":{"name":"Tiếng Catalan","nativeName":"Català","dir":"ltr"},"cs":{"name":"Tiếng Séc","nativeName":"Čeština","dir":"ltr"},"cy":{"name":"Tiếng Wales","nativeName":"Cymraeg","dir":"ltr"},"da":{"name":"Tiếng Đan Mạch","nativeName":"Dansk","dir":"ltr"},"de":{"name":"Tiếng Đức","nativeName":"Deutsch","dir":"ltr"},"doi":{"name":"Dogri","nativeName":"Dogri","dir":"ltr"},"dsb":{"name":"Tiếng Hạ Sorbia","nativeName":"Dolnoserbšćina","dir":"ltr"},"dv":{"name":"Tiếng Divehi","nativeName":"ދިވެހިބަސް","dir":"rtl"},"el":{"name":"Tiếng Hy Lạp","nativeName":"Ελληνικά","dir":"ltr"},"en":{"name":"Tiếng Anh","nativeName":"English","dir":"ltr"},"es":{"name":"Tiếng Tây Ban Nha","nativeName":"Español","dir":"ltr"},"et":{"name":"Tiếng Estonia","nativeName":"Eesti","dir":"ltr"},"eu":{"name":"Tiếng Basque","nativeName":"Euskara","dir":"ltr"},"fa":{"name":"Tiếng Ba Tư","nativeName":"فارسی","dir":"rtl"},"fi":{"name":"Tiếng Phần Lan","nativeName":"Suomi","dir":"ltr"},"fil":{"name":"Tiếng Philippines","nativeName":"Filipino","dir":"ltr"},"fj":{"name":"Tiếng Fiji","nativeName":"Na Vosa Vakaviti","dir":"ltr"},"fo":{"name":"Tiếng Faroe","nativeName":"Føroyskt","dir":"ltr"},"fr":{"name":"Tiếng Pháp","nativeName":"Français","dir":"ltr"},"fr-CA":{"name":"Tiếng Pháp (Canada)","nativeName":"Français (Canada)","dir":"ltr"},"ga":{"name":"Tiếng Ireland","nativeName":"Gaeilge","dir":"ltr"},"gl":{"name":"Tiếng Galician","nativeName":"Galego","dir":"ltr"},"gom":{"name":"Konkani","nativeName":"Konkani","dir":"ltr"},"gu":{"name":"Tiếng Gujarati","nativeName":"ગુજરાતી","dir":"ltr"},"ha":{"name":"Tiếng Hausa","nativeName":"Hausa","dir":"ltr"},"he":{"name":"Tiếng Do Thái","nativeName":"עברית","dir":"rtl"},"hi":{"name":"Tiếng Hindi","nativeName":"हिन्दी","dir":"ltr"},"hr":{"name":"Tiếng Croatia","nativeName":"Hrvatski","dir":"ltr"},"hsb":{"name":"Tiếng Thượng Sorbia","nativeName":"Hornjoserbšćina","dir":"ltr"},"ht":{"name":"Tiếng Haiti","nativeName":"Haitian Creole","dir":"ltr"},"hu":{"name":"Tiếng Hungary","nativeName":"Magyar","dir":"ltr"},"hy":{"name":"Tiếng Armenia","nativeName":"Հայերեն","dir":"ltr"},"id":{"name":"Tiếng Indonesia","nativeName":"Indonesia","dir":"ltr"},"ig":{"name":"Tiếng Igbo","nativeName":"Ásụ̀sụ́ Ìgbò","dir":"ltr"},"ikt":{"name":"Inuinnaqtun","nativeName":"Inuinnaqtun","dir":"ltr"},"is":{"name":"Tiếng Iceland","nativeName":"Íslenska","dir":"ltr"},"it":{"name":"Tiếng Italy","nativeName":"Italiano","dir":"ltr"},"iu":{"name":"Tiếng Inuktitut","nativeName":"ᐃᓄᒃᑎᑐᑦ","dir":"ltr"},"iu-Latn":{"name":"Inuktitut (Latin)","nativeName":"Inuktitut (Latin)","dir":"ltr"},"ja":{"name":"Tiếng Nhật","nativeName":"日本語","dir":"ltr"},"ka":{"name":"Tiếng Georgia","nativeName":"ქართული","dir":"ltr"},"kk":{"name":"Tiếng Kazakh","nativeName":"Қазақ Тілі","dir":"ltr"},"km":{"name":"Tiếng Khmer","nativeName":"ខ្មែរ","dir":"ltr"},"kmr":{"name":"Tiếng Kurd (Bắc)","nativeName":"Kurdî (Bakur)","dir":"ltr"},"kn":{"name":"Tiếng Kannada","nativeName":"ಕನ್ನಡ","dir":"ltr"},"ko":{"name":"Tiếng Hàn","nativeName":"한국어","dir":"ltr"},"ks":{"name":"Kashmiri","nativeName":"کٲشُر","dir":"rtl"},"ku":{"name":"Tiếng Kurd (Trung)","nativeName":"Kurdî (Navîn)","dir":"rtl"},"ky":{"name":"Tiếng Kyrgyz","nativeName":"Кыргызча","dir":"ltr"},"ln":{"name":"Tiếng Lingala","nativeName":"Lingála","dir":"ltr"},"lo":{"name":"Tiếng Lào","nativeName":"ລາວ","dir":"ltr"},"lt":{"name":"Tiếng Litva","nativeName":"Lietuvių","dir":"ltr"},"lug":{"name":"Ganda","nativeName":"Ganda","dir":"ltr"},"lv":{"name":"Tiếng Latvia","nativeName":"Latviešu","dir":"ltr"},"lzh":{"name":"Chinese (Literary)","nativeName":"中文 (文言文)","dir":"ltr"},"mai":{"name":"Tiếng Maithili","nativeName":"Maithili","dir":"ltr"},"mg":{"name":"Tiếng Malagasy","nativeName":"Malagasy","dir":"ltr"},"mi":{"name":"Tiếng Maori","nativeName":"Te Reo Māori","dir":"ltr"},"mk":{"name":"Tiếng Macedonia","nativeName":"Македонски","dir":"ltr"},"ml":{"name":"Tiếng Malayalam","nativeName":"മലയാളം","dir":"ltr"},"mn-Cyrl":{"name":"Mongolian (Cyrillic)","nativeName":"Mongolian (Cyrillic)","dir":"ltr"},"mn-Mong":{"name":"Mongolian (Traditional)","nativeName":"ᠮᠣᠩᠭᠣᠯ ᠬᠡᠯᠡ","dir":"ltr"},"mr":{"name":"Tiếng Marathi","nativeName":"मराठी","dir":"ltr"},"ms":{"name":"Tiếng Mã Lai","nativeName":"Melayu","dir":"ltr"},"mt":{"name":"Tiếng Malta","nativeName":"Malti","dir":"ltr"},"mww":{"name":"Tiếng H’Mông","nativeName":"Hmong Daw","dir":"ltr"},"my":{"name":"Tiếng Miến Điện","nativeName":"မြန်မာ","dir":"ltr"},"nb":{"name":"Tiếng Na Uy (Bokmål)","nativeName":"Norsk Bokmål","dir":"ltr"},"ne":{"name":"Tiếng Nepal","nativeName":"नेपाली","dir":"ltr"},"nl":{"name":"Tiếng Hà Lan","nativeName":"Nederlands","dir":"ltr"},"nso":{"name":"Sesotho sa Leboa","nativeName":"Sesotho sa Leboa","dir":"ltr"},"nya":{"name":"Nyanja","nativeName":"Nyanja","dir":"ltr"},"or":{"name":"Tiếng Odia","nativeName":"ଓଡ଼ିଆ","dir":"ltr"},"otq":{"name":"Tiếng Querétaro Otomi","nativeName":"Hñähñu","dir":"ltr"},"pa":{"name":"Tiếng Punjab","nativeName":"ਪੰਜਾਬੀ","dir":"ltr"},"pl":{"name":"Tiếng Ba Lan","nativeName":"Polski","dir":"ltr"},"prs":{"name":"Tiếng Dari","nativeName":"دری","dir":"rtl"},"ps":{"name":"Tiếng Pashto","nativeName":"پښتو","dir":"rtl"},"pt":{"name":"Tiếng Bồ Đào Nha (Brazil)","nativeName":"Português (Brasil)","dir":"ltr"},"pt-PT":{"name":"Tiếng Bồ Đào Nha (Bồ Đào Nha)","nativeName":"Português (Portugal)","dir":"ltr"},"ro":{"name":"Tiếng Romania","nativeName":"Română","dir":"ltr"},"ru":{"name":"Tiếng Nga","nativeName":"Русский","dir":"ltr"},"run":{"name":"Rundi","nativeName":"Rundi","dir":"ltr"},"rw":{"name":"Tiếng Kinyarwanda","nativeName":"Kinyarwanda","dir":"ltr"},"sd":{"name":"Tiếng Sindhi","nativeName":"سنڌي","dir":"rtl"},"si":{"name":"Tiếng Sinhala","nativeName":"සිංහල","dir":"ltr"},"sk":{"name":"Tiếng Slovak","nativeName":"Slovenčina","dir":"ltr"},"sl":{"name":"Tiếng Slovenia","nativeName":"Slovenščina","dir":"ltr"},"sm":{"name":"Tiếng Samoa","nativeName":"Gagana Sāmoa","dir":"ltr"},"sn":{"name":"Tiếng Shona","nativeName":"chiShona","dir":"ltr"},"so":{"name":"Tiếng Somali","nativeName":"Soomaali","dir":"ltr"},"sq":{"name":"Tiếng Albania","nativeName":"Shqip","dir":"ltr"},"sr-Cyrl":{"name":"Tiếng Serbia (Chữ Kirin)","nativeName":"Српски (ћирилица)","dir":"ltr"},"sr-Latn":{"name":"Tiếng Serbia (Chữ La Tinh)","nativeName":"Srpski (latinica)","dir":"ltr"},"st":{"name":"Sesotho","nativeName":"Sesotho","dir":"ltr"},"sv":{"name":"Tiếng Thụy Điển","nativeName":"Svenska","dir":"ltr"},"sw":{"name":"Tiếng Swahili","nativeName":"Kiswahili","dir":"ltr"},"ta":{"name":"Tiếng Tamil","nativeName":"தமிழ்","dir":"ltr"},"te":{"name":"Tiếng Telugu","nativeName":"తెలుగు","dir":"ltr"},"th":{"name":"Tiếng Thái","nativeName":"ไทย","dir":"ltr"},"ti":{"name":"Tiếng Tigrinya","nativeName":"ትግር","dir":"ltr"},"tk":{"name":"Tiếng Turkmen","nativeName":"Türkmen Dili","dir":"ltr"},"tlh-Latn":{"name":"Tiếng Klingon (Chữ La Tinh)","nativeName":"Klingon (Latin)","dir":"ltr"},"tlh-Piqd":{"name":"Tiếng Klingon (pIqaD)","nativeName":"Klingon (pIqaD)","dir":"ltr"},"tn":{"name":"Setswana","nativeName":"Setswana","dir":"ltr"},"to":{"name":"Tiếng Tonga","nativeName":"Lea Fakatonga","dir":"ltr"},"tr":{"name":"Tiếng Thổ Nhĩ Kỳ","nativeName":"Türkçe","dir":"ltr"},"tt":{"name":"Tiếng Tatar","nativeName":"Татар","dir":"ltr"},"ty":{"name":"Tiếng Tahiti","nativeName":"Reo Tahiti","dir":"ltr"},"ug":{"name":"Tiếng Uyghur","nativeName":"ئۇيغۇرچە","dir":"rtl"},"uk":{"name":"Tiếng Ukraina","nativeName":"Українська","dir":"ltr"},"ur":{"name":"Tiếng Urdu","nativeName":"اردو","dir":"rtl"},"uz":{"name":"Tiếng Uzbek","nativeName":"Uzbek (Latin)","dir":"ltr"},"vi":{"name":"Tiếng Việt","nativeName":"Tiếng Việt","dir":"ltr"},"xh":{"name":"Tiếng Xhosa","nativeName":"isiXhosa","dir":"ltr"},"yo":{"name":"Tiếng Yoruba","nativeName":"Èdè Yorùbá","dir":"ltr"},"yua":{"name":"Tiếng Maya Yucatec","nativeName":"Yucatec Maya","dir":"ltr"},"yue":{"name":"Tiếng Quảng Đông (Phồn Thể)","nativeName":"粵語 (繁體)","dir":"ltr"},"zh-Hans":{"name":"Tiếng Trung (Giản Thể)","nativeName":"中文 (简体)","dir":"ltr"},"zh-Hant":{"name":"Tiếng Trung (Phồn Thể)","nativeName":"繁體中文 (繁體)","dir":"ltr"},"zu":{"name":"Tiếng Zulu","nativeName":"Isi-Zulu","dir":"ltr"}}')));
_defineProperty(MicrosoftTranslator, "TO_LANGUAGES", JSON.parse('{"af":{"name":"Tiếng Afrikaans","nativeName":"Afrikaans","dir":"ltr"},"am":{"name":"Tiếng Amharic","nativeName":"አማርኛ","dir":"ltr"},"ar":{"name":"Tiếng Ả Rập","nativeName":"العربية","dir":"rtl"},"as":{"name":"Tiếng Assam","nativeName":"অসমীয়া","dir":"ltr"},"az":{"name":"Tiếng Azerbaijan","nativeName":"Azərbaycan","dir":"ltr"},"ba":{"name":"Tiếng Bashkir","nativeName":"Bashkir","dir":"ltr"},"bg":{"name":"Tiếng Bulgaria","nativeName":"Български","dir":"ltr"},"bho":{"name":"Bhojpuri","nativeName":"Bhojpuri","dir":"ltr"},"bn":{"name":"Tiếng Bangla","nativeName":"বাংলা","dir":"ltr"},"bo":{"name":"Tiếng Tây Tạng","nativeName":"བོད་སྐད་","dir":"ltr"},"brx":{"name":"Bodo","nativeName":"बड़ो","dir":"ltr"},"bs":{"name":"Tiếng Bosnia","nativeName":"Bosnian","dir":"ltr"},"ca":{"name":"Tiếng Catalan","nativeName":"Català","dir":"ltr"},"cs":{"name":"Tiếng Séc","nativeName":"Čeština","dir":"ltr"},"cy":{"name":"Tiếng Wales","nativeName":"Cymraeg","dir":"ltr"},"da":{"name":"Tiếng Đan Mạch","nativeName":"Dansk","dir":"ltr"},"de":{"name":"Tiếng Đức","nativeName":"Deutsch","dir":"ltr"},"doi":{"name":"Dogri","nativeName":"Dogri","dir":"ltr"},"dsb":{"name":"Tiếng Hạ Sorbia","nativeName":"Dolnoserbšćina","dir":"ltr"},"dv":{"name":"Tiếng Divehi","nativeName":"ދިވެހިބަސް","dir":"rtl"},"el":{"name":"Tiếng Hy Lạp","nativeName":"Ελληνικά","dir":"ltr"},"en":{"name":"Tiếng Anh","nativeName":"English","dir":"ltr"},"es":{"name":"Tiếng Tây Ban Nha","nativeName":"Español","dir":"ltr"},"et":{"name":"Tiếng Estonia","nativeName":"Eesti","dir":"ltr"},"eu":{"name":"Tiếng Basque","nativeName":"Euskara","dir":"ltr"},"fa":{"name":"Tiếng Ba Tư","nativeName":"فارسی","dir":"rtl"},"fi":{"name":"Tiếng Phần Lan","nativeName":"Suomi","dir":"ltr"},"fil":{"name":"Tiếng Philippines","nativeName":"Filipino","dir":"ltr"},"fj":{"name":"Tiếng Fiji","nativeName":"Na Vosa Vakaviti","dir":"ltr"},"fo":{"name":"Tiếng Faroe","nativeName":"Føroyskt","dir":"ltr"},"fr":{"name":"Tiếng Pháp","nativeName":"Français","dir":"ltr"},"fr-CA":{"name":"Tiếng Pháp (Canada)","nativeName":"Français (Canada)","dir":"ltr"},"ga":{"name":"Tiếng Ireland","nativeName":"Gaeilge","dir":"ltr"},"gl":{"name":"Tiếng Galician","nativeName":"Galego","dir":"ltr"},"gom":{"name":"Konkani","nativeName":"Konkani","dir":"ltr"},"gu":{"name":"Tiếng Gujarati","nativeName":"ગુજરાતી","dir":"ltr"},"ha":{"name":"Tiếng Hausa","nativeName":"Hausa","dir":"ltr"},"he":{"name":"Tiếng Do Thái","nativeName":"עברית","dir":"rtl"},"hi":{"name":"Tiếng Hindi","nativeName":"हिन्दी","dir":"ltr"},"hr":{"name":"Tiếng Croatia","nativeName":"Hrvatski","dir":"ltr"},"hsb":{"name":"Tiếng Thượng Sorbia","nativeName":"Hornjoserbšćina","dir":"ltr"},"ht":{"name":"Tiếng Haiti","nativeName":"Haitian Creole","dir":"ltr"},"hu":{"name":"Tiếng Hungary","nativeName":"Magyar","dir":"ltr"},"hy":{"name":"Tiếng Armenia","nativeName":"Հայերեն","dir":"ltr"},"id":{"name":"Tiếng Indonesia","nativeName":"Indonesia","dir":"ltr"},"ig":{"name":"Tiếng Igbo","nativeName":"Ásụ̀sụ́ Ìgbò","dir":"ltr"},"ikt":{"name":"Inuinnaqtun","nativeName":"Inuinnaqtun","dir":"ltr"},"is":{"name":"Tiếng Iceland","nativeName":"Íslenska","dir":"ltr"},"it":{"name":"Tiếng Italy","nativeName":"Italiano","dir":"ltr"},"iu":{"name":"Tiếng Inuktitut","nativeName":"ᐃᓄᒃᑎᑐᑦ","dir":"ltr"},"iu-Latn":{"name":"Inuktitut (Latin)","nativeName":"Inuktitut (Latin)","dir":"ltr"},"ja":{"name":"Tiếng Nhật","nativeName":"日本語","dir":"ltr"},"ka":{"name":"Tiếng Georgia","nativeName":"ქართული","dir":"ltr"},"kk":{"name":"Tiếng Kazakh","nativeName":"Қазақ Тілі","dir":"ltr"},"km":{"name":"Tiếng Khmer","nativeName":"ខ្មែរ","dir":"ltr"},"kmr":{"name":"Tiếng Kurd (Bắc)","nativeName":"Kurdî (Bakur)","dir":"ltr"},"kn":{"name":"Tiếng Kannada","nativeName":"ಕನ್ನಡ","dir":"ltr"},"ko":{"name":"Tiếng Hàn","nativeName":"한국어","dir":"ltr"},"ks":{"name":"Kashmiri","nativeName":"کٲشُر","dir":"rtl"},"ku":{"name":"Tiếng Kurd (Trung)","nativeName":"Kurdî (Navîn)","dir":"rtl"},"ky":{"name":"Tiếng Kyrgyz","nativeName":"Кыргызча","dir":"ltr"},"ln":{"name":"Tiếng Lingala","nativeName":"Lingála","dir":"ltr"},"lo":{"name":"Tiếng Lào","nativeName":"ລາວ","dir":"ltr"},"lt":{"name":"Tiếng Litva","nativeName":"Lietuvių","dir":"ltr"},"lug":{"name":"Ganda","nativeName":"Ganda","dir":"ltr"},"lv":{"name":"Tiếng Latvia","nativeName":"Latviešu","dir":"ltr"},"lzh":{"name":"Chinese (Literary)","nativeName":"中文 (文言文)","dir":"ltr"},"mai":{"name":"Tiếng Maithili","nativeName":"Maithili","dir":"ltr"},"mg":{"name":"Tiếng Malagasy","nativeName":"Malagasy","dir":"ltr"},"mi":{"name":"Tiếng Maori","nativeName":"Te Reo Māori","dir":"ltr"},"mk":{"name":"Tiếng Macedonia","nativeName":"Македонски","dir":"ltr"},"ml":{"name":"Tiếng Malayalam","nativeName":"മലയാളം","dir":"ltr"},"mn-Cyrl":{"name":"Mongolian (Cyrillic)","nativeName":"Mongolian (Cyrillic)","dir":"ltr"},"mn-Mong":{"name":"Mongolian (Traditional)","nativeName":"ᠮᠣᠩᠭᠣᠯ ᠬᠡᠯᠡ","dir":"ltr"},"mr":{"name":"Tiếng Marathi","nativeName":"मराठी","dir":"ltr"},"ms":{"name":"Tiếng Mã Lai","nativeName":"Melayu","dir":"ltr"},"mt":{"name":"Tiếng Malta","nativeName":"Malti","dir":"ltr"},"mww":{"name":"Tiếng H’Mông","nativeName":"Hmong Daw","dir":"ltr"},"my":{"name":"Tiếng Miến Điện","nativeName":"မြန်မာ","dir":"ltr"},"nb":{"name":"Tiếng Na Uy (Bokmål)","nativeName":"Norsk Bokmål","dir":"ltr"},"ne":{"name":"Tiếng Nepal","nativeName":"नेपाली","dir":"ltr"},"nl":{"name":"Tiếng Hà Lan","nativeName":"Nederlands","dir":"ltr"},"nso":{"name":"Sesotho sa Leboa","nativeName":"Sesotho sa Leboa","dir":"ltr"},"nya":{"name":"Nyanja","nativeName":"Nyanja","dir":"ltr"},"or":{"name":"Tiếng Odia","nativeName":"ଓଡ଼ିଆ","dir":"ltr"},"otq":{"name":"Tiếng Querétaro Otomi","nativeName":"Hñähñu","dir":"ltr"},"pa":{"name":"Tiếng Punjab","nativeName":"ਪੰਜਾਬੀ","dir":"ltr"},"pl":{"name":"Tiếng Ba Lan","nativeName":"Polski","dir":"ltr"},"prs":{"name":"Tiếng Dari","nativeName":"دری","dir":"rtl"},"ps":{"name":"Tiếng Pashto","nativeName":"پښتو","dir":"rtl"},"pt":{"name":"Tiếng Bồ Đào Nha (Brazil)","nativeName":"Português (Brasil)","dir":"ltr"},"pt-PT":{"name":"Tiếng Bồ Đào Nha (Bồ Đào Nha)","nativeName":"Português (Portugal)","dir":"ltr"},"ro":{"name":"Tiếng Romania","nativeName":"Română","dir":"ltr"},"ru":{"name":"Tiếng Nga","nativeName":"Русский","dir":"ltr"},"run":{"name":"Rundi","nativeName":"Rundi","dir":"ltr"},"rw":{"name":"Tiếng Kinyarwanda","nativeName":"Kinyarwanda","dir":"ltr"},"sd":{"name":"Tiếng Sindhi","nativeName":"سنڌي","dir":"rtl"},"si":{"name":"Tiếng Sinhala","nativeName":"සිංහල","dir":"ltr"},"sk":{"name":"Tiếng Slovak","nativeName":"Slovenčina","dir":"ltr"},"sl":{"name":"Tiếng Slovenia","nativeName":"Slovenščina","dir":"ltr"},"sm":{"name":"Tiếng Samoa","nativeName":"Gagana Sāmoa","dir":"ltr"},"sn":{"name":"Tiếng Shona","nativeName":"chiShona","dir":"ltr"},"so":{"name":"Tiếng Somali","nativeName":"Soomaali","dir":"ltr"},"sq":{"name":"Tiếng Albania","nativeName":"Shqip","dir":"ltr"},"sr-Cyrl":{"name":"Tiếng Serbia (Chữ Kirin)","nativeName":"Српски (ћирилица)","dir":"ltr"},"sr-Latn":{"name":"Tiếng Serbia (Chữ La Tinh)","nativeName":"Srpski (latinica)","dir":"ltr"},"st":{"name":"Sesotho","nativeName":"Sesotho","dir":"ltr"},"sv":{"name":"Tiếng Thụy Điển","nativeName":"Svenska","dir":"ltr"},"sw":{"name":"Tiếng Swahili","nativeName":"Kiswahili","dir":"ltr"},"ta":{"name":"Tiếng Tamil","nativeName":"தமிழ்","dir":"ltr"},"te":{"name":"Tiếng Telugu","nativeName":"తెలుగు","dir":"ltr"},"th":{"name":"Tiếng Thái","nativeName":"ไทย","dir":"ltr"},"ti":{"name":"Tiếng Tigrinya","nativeName":"ትግር","dir":"ltr"},"tk":{"name":"Tiếng Turkmen","nativeName":"Türkmen Dili","dir":"ltr"},"tlh-Latn":{"name":"Tiếng Klingon (Chữ La Tinh)","nativeName":"Klingon (Latin)","dir":"ltr"},"tlh-Piqd":{"name":"Tiếng Klingon (pIqaD)","nativeName":"Klingon (pIqaD)","dir":"ltr"},"tn":{"name":"Setswana","nativeName":"Setswana","dir":"ltr"},"to":{"name":"Tiếng Tonga","nativeName":"Lea Fakatonga","dir":"ltr"},"tr":{"name":"Tiếng Thổ Nhĩ Kỳ","nativeName":"Türkçe","dir":"ltr"},"tt":{"name":"Tiếng Tatar","nativeName":"Татар","dir":"ltr"},"ty":{"name":"Tiếng Tahiti","nativeName":"Reo Tahiti","dir":"ltr"},"ug":{"name":"Tiếng Uyghur","nativeName":"ئۇيغۇرچە","dir":"rtl"},"uk":{"name":"Tiếng Ukraina","nativeName":"Українська","dir":"ltr"},"ur":{"name":"Tiếng Urdu","nativeName":"اردو","dir":"rtl"},"uz":{"name":"Tiếng Uzbek","nativeName":"Uzbek (Latin)","dir":"ltr"},"vi":{"name":"Tiếng Việt","nativeName":"Tiếng Việt","dir":"ltr"},"xh":{"name":"Tiếng Xhosa","nativeName":"isiXhosa","dir":"ltr"},"yo":{"name":"Tiếng Yoruba","nativeName":"Èdè Yorùbá","dir":"ltr"},"yua":{"name":"Tiếng Maya Yucatec","nativeName":"Yucatec Maya","dir":"ltr"},"yue":{"name":"Tiếng Quảng Đông (Phồn Thể)","nativeName":"粵語 (繁體)","dir":"ltr"},"zh-Hans":{"name":"Tiếng Trung (Giản Thể)","nativeName":"中文 (简体)","dir":"ltr"},"zh-Hant":{"name":"Tiếng Trung (Phồn Thể)","nativeName":"繁體中文 (繁體)","dir":"ltr"},"zu":{"name":"Tiếng Zulu","nativeName":"Isi-Zulu","dir":"ltr"}}'));
_defineProperty(MicrosoftTranslator, "AUTODETECT", '');
_defineProperty(MicrosoftTranslator, "DefaultLanguage", {
  FROM: _class4.AUTODETECT,
  TO: 'vi'
});
_defineProperty(MicrosoftTranslator, "DEEPL_TRANSLATOR_MAPPING", {
  SOURCE_LANGUAGES: {
    en: 'EN',
    ja: 'JA',
    'zh-Hans': 'ZH',
    'zh-Hant': 'ZH'
  },
  TARGET_LANGUAGES: {
    en: 'EN-US',
    ja: 'JA',
    'zh-Hans': 'ZH',
    'zh-Hant': 'ZH'
  }
});
_defineProperty(MicrosoftTranslator, "GOOGLE_TRANSLATE_MAPPING", {
  '': 'auto',
  'zh-Hans': 'zh-CN',
  'zh-Hant': 'zh-TW'
});
_defineProperty(MicrosoftTranslator, "PAPAGO_MAPPING", {
  '': 'auto',
  'zh-Hans': 'zh-CN',
  'zh-Hant': 'zh-TW'
});
class Vietphrase {
  constructor(data, translationAlgorithm, multiplicationAlgorithm, isTtvTranslate) {
    let useGlossary = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
    let glossary = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
    let prioritizeNameOverVietphraseCheck = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;
    let caseSensitive = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : false;
    _defineProperty(this, "TranslationAlgorithms", {
      PRIORITIZE_LONG_VIETPHRASE_CLUSTERS: '0',
      TRANSLATE_FROM_LEFT_TO_RIGHT: '1'
    });
    _defineProperty(this, "MultiplicationAlgorithm", {
      NOT_APPLICABLE: '0',
      MULTIPLICATION_BY_PRONOUNS: '1',
      MULTIPLICATION_BY_PRONOUNS_AND_NAMES: '2'
    });
    this.data = data;
    this.translationAlgorithm = translationAlgorithm;
    this.multiplicationAlgorithm = multiplicationAlgorithm;
    this.isTtvTranslate = isTtvTranslate;
    this.useGlossary = useGlossary;
    this.glossary = glossary;
    this.prioritizeNameOverVietphrase = prioritizeNameOverVietphraseCheck;
    this.caseSensitive = caseSensitive;
  }
  static getSourceLanguageName(languageCode) {
    return Vietphrase.SOURCE_LANGUAGES[languageCode].startsWith('Tiếng ') ? Vietphrase.SOURCE_LANGUAGES[languageCode].match(/Tiếng (.+)/)[1] : Vietphrase.SOURCE_LANGUAGES[languageCode];
  }
  static getTargetLanguageName(languageCode) {
    return Vietphrase.TARGET_LANGUAGES[languageCode].startsWith('Tiếng ') ? Vietphrase.TARGET_LANGUAGES[languageCode].match(/Tiếng (.+)/)[1] : Vietphrase.TARGET_LANGUAGES[languageCode];
  }
  static getMappedSourceLanguageCode(translator) {
    switch (translator) {
      case Translators.DEEPL_TRANSLATE:
        {
          return 'ZH';
        }
      case Translators.GOOGLE_TRANSLATE:
        {
          return 'zh-CN';
        }
      case Translators.PAPAGO:
        {
          return 'zh-CN';
        }
      case Translators.MICROSOFT_TRANSLATOR:
        {
          return 'zh-Hans';
        }
      default:
        {
          return null;
        }
    }
  }
  static getMappedTargetLanguageCode(translator) {
    switch (translator) {
      case Translators.DEEPL_TRANSLATE:
        {
          return DeepLTranslate.DefaultLanguage.TARGET_LANG;
        }
      default:
        {
          return 'vi';
        }
    }
  }
  async translateText(sourceLanugage, targetLanguage, inputText) {
    try {
      let data = {};
      switch (targetLanguage) {
        case 'pinyin':
          {
            data = this.data.pinyins;
            break;
          }
        case 'sinoVietnamese':
          {
            data = this.data.chinesePhienAmWords;
            break;
          }
        case 'vi':
          {
            data = this.data.vietphrases;
            break;
          }
        // no default
      }

      switch (this.translationAlgorithm) {
        case this.TranslationAlgorithms.TRANSLATE_FROM_LEFT_TO_RIGHT:
          {
            return this.translateFromLeftToRight(data, inputText);
          }
        default:
          {
            return this.translatePrioritizeLongVietphraseClusters(data, inputText);
          }
      }
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      throw error;
    }
  }
  translatePrioritizeLongVietphraseClusters(data, inputText) {
    try {
      const text = inputText.split(/\r?\n/).map(element => element.trim()).join('\n');
      let dataEntries = Object.entries(data).filter(_ref10 => {
        let [first] = _ref10;
        return text.includes(first);
      });
      const glossaryEntries = Object.entries(this.glossary);
      let result = text;
      if (dataEntries.length > 0 || glossaryEntries.length > 0) {
        const [luatnhanNameEntries, luatnhanPronounEntries] = this.getLuatnhanData(glossaryEntries, text);
        const maybePrioritizeNameOverVietphrase = this.prioritizeNameOverVietphrase ? luatnhanNameEntries : [...luatnhanNameEntries, ...glossaryEntries];
        dataEntries = [...(this.useGlossary ? maybePrioritizeNameOverVietphrase : []), ...luatnhanPronounEntries, ...dataEntries].sort((a, b) => b[0].length - a[0].length);
        dataEntries.some((_ref11, index, array) => {
          let [key, value] = _ref11;
          if (!this.isTtvTranslate || /^[\d\p{sc=Hani}]+$/u.test(key) || [...luatnhanNameEntries, ...glossaryEntries].indexOf(key) > -1) {
            result = result.replace(new RegExp("([\\p{Lu}\\p{Ll}\\p{Nd}])".concat(Utils.getRegexEscapedText(key), "(?=").concat(Object.values(this.glossary).join('|'), ")"), 'gu'), "$1 ".concat(Utils.getRegexEscapedReplacement(value), " ")).replace(new RegExp("([\\p{Lu}\\p{Ll}\\p{Nd}])".concat(Utils.getRegexEscapedText(key), "([\\p{Lu}\\p{Ll}\\p{Nd}])"), 'gu'), "$1 ".concat(Utils.getRegexEscapedReplacement(value), " $2")).replace(new RegExp("([\\p{Lu}\\p{Ll}\\p{Nd}])".concat(Utils.getRegexEscapedText(key)), 'gu'), "$1 ".concat(Utils.getRegexEscapedReplacement(value))).replace(new RegExp("".concat(Utils.getRegexEscapedText(key), "([\\p{Lu}\\p{Ll}\\p{Nd}])"), 'gu'), "".concat(Utils.getRegexEscapedReplacement(value), " $1")).replace(new RegExp("".concat(Utils.getRegexEscapedText(key), "(?=").concat(Object.values(this.glossary).join('|'), ")"), 'g'), "".concat(Utils.getRegexEscapedReplacement(value), " ")).replace(new RegExp(Utils.getRegexEscapedText(key), 'g'), Utils.getRegexEscapedReplacement(value));
          }
          if (array.filter(_ref12 => {
            let [first] = _ref12;
            return result.includes(first);
          }).length === 0) return true;
          return false;
        });
        result = this.getCaseSensitive(result);
      }
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  translateFromLeftToRight(data, inputText) {
    try {
      const text = inputText.split(/\r?\n/).map(element => element.trim()).join('\n');
      let dataEntries = Object.entries(data).filter(_ref13 => {
        let [first] = _ref13;
        return text.includes(first);
      });
      const glossaryEntries = Object.entries(this.glossary);
      const lines = text.split(/\n/);
      const results = [];
      let result = text;
      if (dataEntries.length > 0 || glossaryEntries.length > 0) {
        const [luatnhanNameEntries, luatnhanPronounEntries] = this.getLuatnhanData(glossaryEntries, text);
        const maybePrioritizeNameOverVietphrase = this.prioritizeNameOverVietphrase ? luatnhanNameEntries : [...luatnhanNameEntries, ...glossaryEntries];
        dataEntries = [...(this.useGlossary ? maybePrioritizeNameOverVietphrase : []), ...luatnhanPronounEntries, ...dataEntries];
        const dataObj = Object.fromEntries(dataEntries);
        lines.forEach(a => {
          if (a.length === 0) {
            results.push(a);
          } else {
            const glossaryEntriesInLine = glossaryEntries.filter(_ref14 => {
              let [, second] = _ref14;
              return a.includes(second);
            });
            const dataLengths = [a.length, ...(this.useGlossary && this.prioritizeNameOverVietphrase ? glossaryEntriesInLine.map(_ref15 => {
              let [, second] = _ref15;
              return second.length;
            }) : []), ...dataEntries.filter(_ref16 => {
              let [first] = _ref16;
              return a.includes(first);
            }).map(_ref17 => {
              let [first] = _ref17;
              return first.length;
            }), 1].sort((b, c) => c - b).filter((element, index, array) => element > 0 && index === array.indexOf(element));
            let tempLine = '';
            let prevPhrase = '';
            let i = 0;
            a.split('').forEach((b, c) => {
              if (c === i) {
                dataLengths.some(d => {
                  const phrase = a.substring(i, i + d);
                  if (this.useGlossary && this.prioritizeNameOverVietphrase && glossaryEntries.map(_ref18 => {
                    let [, second] = _ref18;
                    return second;
                  }).indexOf(phrase) > -1) {
                    tempLine += (i > 0 && /[\p{Lu}\p{Ll}\p{Nd}]/u.test(prevPhrase || tempLine[tempLine.length - 1] || '') ? ' ' : '') + phrase;
                    prevPhrase = phrase;
                    i += d - 1;
                    return true;
                  }
                  if ((!this.isTtvTranslate || /^[\d\p{sc=Hani}]+$/u.test(phrase) || [...luatnhanNameEntries, ...glossaryEntries].indexOf(phrase) > -1) && Object.prototype.hasOwnProperty.call(dataObj, phrase)) {
                    if (dataObj[phrase].length > 0) {
                      tempLine += (i > 0 && /[\p{Lu}\p{Ll}\p{Nd}]/u.test(prevPhrase || tempLine[tempLine.length - 1] || '') ? ' ' : '') + dataObj[phrase];
                      prevPhrase = dataObj[phrase];
                    }
                    i += d - 1;
                    return true;
                  }
                  if (d === 1) {
                    tempLine += (i > 0 && /[\p{Lu}\p{Ll}\p{Nd}]/u.test(a[i]) && /[\p{Lu}\p{Ll}\p{Nd}]/u.test(prevPhrase || '') ? ' ' : '') + phrase;
                    prevPhrase = '';
                    return true;
                  }
                  return false;
                });
                i += 1;
              }
            });
            results.push(tempLine);
          }
        });
        result = this.getCaseSensitive(results.join('\n'));
      }
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  getLuatnhanData(glossaryEntries, inputText) {
    const luatnhanNameEntries = [];
    const luatnhanPronounEntries = [];
    if (this.multiplicationAlgorithm > this.MultiplicationAlgorithm.NOT_APPLICABLE) {
      Object.entries(this.data.cacLuatnhan).forEach(_ref19 => {
        let [a, b] = _ref19;
        if (this.useGlossary && this.multiplicationAlgorithm === this.MultiplicationAlgorithm.MULTIPLICATION_BY_PRONOUNS_AND_NAMES && glossaryEntries.length > 0) {
          Object.entries(this.glossary).forEach(_ref20 => {
            let [c, d] = _ref20;
            const entriesKey = a.replace(/\{0}/g, Utils.getRegexEscapedReplacement(this.prioritizeNameOverVietphrase ? d : c));
            if (inputText.includes(entriesKey)) {
              luatnhanNameEntries.push([entriesKey, b.replace(/\{0}/g, Utils.getRegexEscapedReplacement(d))]);
            }
          });
        }
        Object.entries(this.data.pronouns).forEach(_ref21 => {
          let [c, d] = _ref21;
          const entriesKey = a.replace(/\{0}/g, Utils.getRegexEscapedReplacement(c));
          if (inputText.includes(entriesKey)) {
            luatnhanPronounEntries.push([entriesKey, b.replace(/\{0}/g, Utils.getRegexEscapedReplacement(d))]);
          }
        });
      });
    }
    return [luatnhanNameEntries, luatnhanPronounEntries];
  }
  getCaseSensitive(text) {
    return text.split(/\n/).map(element => this.caseSensitive ? element.replace(/(^\s*|(?:[!.:;?]\s+|\s+-\s+|…\s*|[。！．：；？]\s*|['"\p{Ps}\p{Pi}]\s*))(\p{Ll})/gu, (match, p1, p2) => p1 + p2.toUpperCase()) : element).join('\n');
  }
}
_defineProperty(Vietphrase, "SOURCE_LANGUAGES", {
  zh: 'Tiếng Trung'
});
_defineProperty(Vietphrase, "TARGET_LANGUAGES", {
  pinyin: 'Bính âm',
  sinoVietnamese: 'Hán Việt',
  vi: 'Vietphrase'
});
_defineProperty(Vietphrase, "DefaultLanguage", {
  SOURCE_LANGUAGE: 'zh',
  TARGET_LANGUAGE: 'vi'
});
//# sourceMappingURL=cac-trinh-dich.js.map