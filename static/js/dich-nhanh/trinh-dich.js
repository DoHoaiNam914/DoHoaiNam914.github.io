'use strict';

class DeepLTranslator {
  /** https://api-free.deepl.com/v2/languages?type=source */
  static SOURCE_LANGUAGES = [
    {
      language: '',
      name: 'Detect language'
    },
    ...JSON.parse('[{"language":"BG","name":"Bulgarian"},{"language":"CS","name":"Czech"},{"language":"DA","name":"Danish"},{"language":"DE","name":"German"},{"language":"EL","name":"Greek"},{"language":"EN","name":"English"},{"language":"ES","name":"Spanish"},{"language":"ET","name":"Estonian"},{"language":"FI","name":"Finnish"},{"language":"FR","name":"French"},{"language":"HU","name":"Hungarian"},{"language":"ID","name":"Indonesian"},{"language":"IT","name":"Italian"},{"language":"JA","name":"Japanese"},{"language":"KO","name":"Korean"},{"language":"LT","name":"Lithuanian"},{"language":"LV","name":"Latvian"},{"language":"NB","name":"Norwegian"},{"language":"NL","name":"Dutch"},{"language":"PL","name":"Polish"},{"language":"PT","name":"Portuguese"},{"language":"RO","name":"Romanian"},{"language":"RU","name":"Russian"},{"language":"SK","name":"Slovak"},{"language":"SL","name":"Slovenian"},{"language":"SV","name":"Swedish"},{"language":"TR","name":"Turkish"},{"language":"UK","name":"Ukrainian"},{"language":"ZH","name":"Chinese"}]')
  ];
  /** https://api-free.deepl.com/v2/languages?type=target */
  static TARGET_LANGUAGES = JSON.parse('[{"language":"BG","name":"Bulgarian","supports_formality":false},{"language":"CS","name":"Czech","supports_formality":false},{"language":"DA","name":"Danish","supports_formality":false},{"language":"DE","name":"German","supports_formality":true},{"language":"EL","name":"Greek","supports_formality":false},{"language":"EN-GB","name":"English (British)","supports_formality":false},{"language":"EN-US","name":"English (American)","supports_formality":false},{"language":"ES","name":"Spanish","supports_formality":true},{"language":"ET","name":"Estonian","supports_formality":false},{"language":"FI","name":"Finnish","supports_formality":false},{"language":"FR","name":"French","supports_formality":true},{"language":"HU","name":"Hungarian","supports_formality":false},{"language":"ID","name":"Indonesian","supports_formality":false},{"language":"IT","name":"Italian","supports_formality":true},{"language":"JA","name":"Japanese","supports_formality":true},{"language":"KO","name":"Korean","supports_formality":false},{"language":"LT","name":"Lithuanian","supports_formality":false},{"language":"LV","name":"Latvian","supports_formality":false},{"language":"NB","name":"Norwegian","supports_formality":false},{"language":"NL","name":"Dutch","supports_formality":true},{"language":"PL","name":"Polish","supports_formality":true},{"language":"PT-BR","name":"Portuguese (Brazilian)","supports_formality":true},{"language":"PT-PT","name":"Portuguese (European)","supports_formality":true},{"language":"RO","name":"Romanian","supports_formality":false},{"language":"RU","name":"Russian","supports_formality":true},{"language":"SK","name":"Slovak","supports_formality":false},{"language":"SL","name":"Slovenian","supports_formality":false},{"language":"SV","name":"Swedish","supports_formality":false},{"language":"TR","name":"Turkish","supports_formality":false},{"language":"UK","name":"Ukrainian","supports_formality":false},{"language":"ZH","name":"Chinese (simplified)","supports_formality":false}]');

  static DETECT_LANGUAGE = '';
  static DefaultLanguage = {
    SOURCE_LANG: DeepLTranslator.DETECT_LANGUAGE,
    TARGET_LANG: 'EN-US'
  };

  static GOOGLE_TRANSLATE_MAPPING = {
    '': 'auto',
    'BG': 'bg',
    'CS': 'cs',
    'DA': 'da',
    'DE': 'de',
    'EL': 'el',
    'EN': 'en',
    'EN-GB': 'en',
    'EN-US': 'en',
    'ES': 'es',
    'ET': 'et',
    'FI': 'fi',
    'FR': 'fr',
    'HU': 'hu',
    'ID': 'id',
    'IT': 'it',
    'JA': 'ja',
    'KO': 'ko',
    'LT': 'lt',
    'LV': 'lv',
    'NL': 'nl',
    'PL': 'pl',
    'PT': 'pt',
    'PT-BR': 'pt',
    'PT-PT': 'pt',
    'RO': 'ro',
    'RU': 'ru',
    'SK': 'sk',
    'SL': 'sl',
    'SV': 'sv',
    'UK': 'uk',
    'ZH': 'zh-CN',
  };
  static PAPAGO_MAPPING = {
    '': 'auto',
    'DE': 'de',
    'EN': 'en',
    'EN-GB': 'en',
    'EN-US': 'en',
    'ES': 'es',
    'FR': 'fr',
    'IT': 'it',
    'JA': 'ja',
    'KO': 'ko',
    'PT': 'pt',
    'PT-BR': 'pt',
    'PT-PT': 'pt',
    'RU': 'ru',
    'ZH': 'zh-CN',
  };
  static MICROSOFT_TRANSLATOR_MAPPING = {
    'BG': 'bg',
    'CS': 'cs',
    'DA': 'da',
    'DE': 'de',
    'EL': 'el',
    'EN': 'en',
    'EN-GB': 'en',
    'EN-US': 'en',
    'ES': 'es',
    'ET': 'et',
    'FI': 'fi',
    'FR': 'fr',
    'HU': 'hu',
    'ID': 'id',
    'IT': 'it',
    'JA': 'ja',
    'KO': 'ko',
    'LT': 'lt',
    'LV': 'lv',
    'NL': 'nl',
    'PL': 'pl',
    'PT': 'pt',
    'PT-BR': 'pt',
    'PT-PT': 'pt-PT',
    'RO': 'ro',
    'RU': 'ru',
    'SK': 'sk',
    'SL': 'sl',
    'SV': 'sv',
    'UK': 'uk',
    'ZH': 'zh-CN',
  };

  constructor() {
    this.authKey_ = 'a4b25ba2-b628-fa56-916e-b323b16502de:fx';
  }

  async init() {
    try {
      this.usage = await this.fetchUsage();
    } catch (error) {
      throw error;
    }
    return this;
  }

  static getSourceLangName(languageCode) {
    return DeepLTranslator.SOURCE_LANGUAGES.filter(({language}) => language === languageCode)[0].name;
  }

  static getTargetLangName(languageCode) {
    return DeepLTranslator.TARGET_LANGUAGES.filter(({language}) => language === languageCode)[0].name;
  }

  static getMappedSourceLanguageCode(translator, languageCode) {
    switch (translator) {
      case Translators.GOOGLE_TRANSLATE:
        return DeepLTranslator.GOOGLE_TRANSLATE_MAPPING[languageCode] ?? (GoogleTranslate.SOURCE_LANGUAGES.hasOwnProperty(languageCode) ? languageCode : GoogleTranslate.DefaultLanguage.SL);

      case Translators.PAPAGO:
        return DeepLTranslator.PAPAGO_MAPPING[languageCode] ?? (Papago.SOURCE_LANGUAGES.hasOwnProperty(languageCode) ? languageCode : Papago.DefaultLanguage.SOURCE);

      case Translators.MICROSOFT_TRANSLATOR:
        return DeepLTranslator.MICROSOFT_TRANSLATOR_MAPPING[languageCode] ?? (MicrosoftTranslator.FROM_LANGUAGES.hasOwnProperty(languageCode) ? languageCode : MicrosoftTranslator.DefaultLanguage.FROM);

      case Translators.VIETPHRASE:
        return Vietphrase.DefaultLanguage.SOURCE_LANGUAGE;
    }
  }

  static getMappedTargetLanguageCode(translator, languageCode) {
    switch (translator) {
      case Translators.GOOGLE_TRANSLATE:
        return DeepLTranslator.GOOGLE_TRANSLATE_MAPPING[languageCode] ?? (GoogleTranslate.TARGET_LANGUAGES.hasOwnProperty(languageCode) ? languageCode : GoogleTranslate.DefaultLanguage.TL);

      case Translators.PAPAGO:
        return DeepLTranslator.PAPAGO_MAPPING[languageCode] ?? (Papago.TARGET_LANGUAGES.hasOwnProperty(languageCode) ? languageCode : Papago.DefaultLanguage.TARGET);

      case Translators.MICROSOFT_TRANSLATOR:
        return DeepLTranslator.MICROSOFT_TRANSLATOR_MAPPING[languageCode] ?? (MicrosoftTranslator.TO_LANGUAGES.hasOwnProperty(languageCode) ? languageCode : MicrosoftTranslator.DefaultLanguage.TO);

      case Translators.VIETPHRASE:
        return Vietphrase.DefaultLanguage.TARGET_LANGUAGE;
    }
  }

  async fetchUsage() {
    try {
      return await $.ajax({
        method: 'GET',
        url: `https://api-free.deepl.com/v2/usage?auth_key=${this.authKey_}`
      });
    } catch (error) {
      console.error('Không thể lấy được Mức sử dụng:', error);
      throw 'Không thể lấy được Mức sử dụng!';
    }
  }

  async translateText(sourceLang, targetLang, text) {
    try {
      return Utils.convertHtmlToText((await $.ajax({
        data: `text=${text.split(/\n/).map((element) => encodeURIComponent(element)).join('&text=')}&source_lang=${sourceLang}&target_lang=${targetLang}&tag_handling=xml`,
        method: 'POST',
        url: `https://api-free.deepl.com/v2/translate?auth_key=${this.authKey_}`
      })).translations.map(({text}) => text).join('\n'));
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      throw error;
    }
  }
}

class GoogleTranslate {
  /** https://translate.googleapis.com/translate_a/l?client=chrome */
  static SOURCE_LANGUAGES = JSON.parse('{"auto":"Phát hiện ngôn ngữ","ar":"Ả Rập","sq":"Albania","am":"Amharic","en":"Anh","hy":"Armenia","as":"Assam","ay":"Aymara","az":"Azerbaijan","pl":"Ba Lan","fa":"Ba Tư","bm":"Bambara","xh":"Bantu","eu":"Basque","be":"Belarus","bn":"Bengal","bho":"Bhojpuri","bs":"Bosnia","pt":"Bồ Đào Nha","bg":"Bulgaria","ca":"Catalan","ceb":"Cebuano","ny":"Chichewa","co":"Corsi","ht":"Creole (Haiti)","hr":"Croatia","dv":"Dhivehi","iw":"Do Thái","doi":"Dogri","da":"Đan Mạch","de":"Đức","et":"Estonia","ee":"Ewe","tl":"Filipino","fy":"Frisia","gd":"Gael Scotland","gl":"Galicia","ka":"George","gn":"Guarani","gu":"Gujarat","nl":"Hà Lan","af":"Hà Lan (Nam Phi)","ko":"Hàn","ha":"Hausa","haw":"Hawaii","hi":"Hindi","hmn":"Hmong","hu":"Hungary","el":"Hy Lạp","is":"Iceland","ig":"Igbo","ilo":"Ilocano","id":"Indonesia","ga":"Ireland","jw":"Java","kn":"Kannada","kk":"Kazakh","km":"Khmer","rw":"Kinyarwanda","gom":"Konkani","kri":"Krio","ku":"Kurd (Kurmanji)","ckb":"Kurd (Sorani)","ky":"Kyrgyz","lo":"Lào","la":"Latinh","lv":"Latvia","ln":"Lingala","lt":"Litva","lg":"Luganda","lb":"Luxembourg","ms":"Mã Lai","mk":"Macedonia","mai":"Maithili","mg":"Malagasy","ml":"Malayalam","mt":"Malta","mi":"Maori","mr":"Marathi","mni-Mtei":"Meiteilon (Manipuri)","lus":"Mizo","mn":"Mông Cổ","my":"Myanmar","no":"Na Uy","ne":"Nepal","ru":"Nga","ja":"Nhật","or":"Odia (Oriya)","om":"Oromo","ps":"Pashto","sa":"Phạn","fr":"Pháp","fi":"Phần Lan","pa":"Punjab","qu":"Quechua","eo":"Quốc tế ngữ","ro":"Rumani","sm":"Samoa","cs":"Séc","nso":"Sepedi","sr":"Serbia","st":"Sesotho","sn":"Shona","sd":"Sindhi","si":"Sinhala","sk":"Slovak","sl":"Slovenia","so":"Somali","su":"Sunda","sw":"Swahili","tg":"Tajik","ta":"Tamil","tt":"Tatar","es":"Tây Ban Nha","te":"Telugu","th":"Thái","tr":"Thổ Nhĩ Kỳ","sv":"Thụy Điển","ti":"Tigrinya","zh-CN":"Trung","ts":"Tsonga","tk":"Turkmen","ak":"Twi","uk":"Ukraina","ur":"Urdu","ug":"Uyghur","uz":"Uzbek","vi":"Việt","cy":"Xứ Wales","it":"Ý","yi":"Yiddish","yo":"Yoruba","zu":"Zulu"}');
  static TARGET_LANGUAGES = JSON.parse('{"ar":"Ả Rập","sq":"Albania","am":"Amharic","en":"Anh","hy":"Armenia","as":"Assam","ay":"Aymara","az":"Azerbaijan","pl":"Ba Lan","fa":"Ba Tư","bm":"Bambara","xh":"Bantu","eu":"Basque","be":"Belarus","bn":"Bengal","bho":"Bhojpuri","bs":"Bosnia","pt":"Bồ Đào Nha","bg":"Bulgaria","ca":"Catalan","ceb":"Cebuano","ny":"Chichewa","co":"Corsi","ht":"Creole (Haiti)","hr":"Croatia","dv":"Dhivehi","iw":"Do Thái","doi":"Dogri","da":"Đan Mạch","de":"Đức","et":"Estonia","ee":"Ewe","tl":"Filipino","fy":"Frisia","gd":"Gael Scotland","gl":"Galicia","ka":"George","gn":"Guarani","gu":"Gujarat","nl":"Hà Lan","af":"Hà Lan (Nam Phi)","ko":"Hàn","ha":"Hausa","haw":"Hawaii","hi":"Hindi","hmn":"Hmong","hu":"Hungary","el":"Hy Lạp","is":"Iceland","ig":"Igbo","ilo":"Ilocano","id":"Indonesia","ga":"Ireland","jw":"Java","kn":"Kannada","kk":"Kazakh","km":"Khmer","rw":"Kinyarwanda","gom":"Konkani","kri":"Krio","ku":"Kurd (Kurmanji)","ckb":"Kurd (Sorani)","ky":"Kyrgyz","lo":"Lào","la":"Latinh","lv":"Latvia","ln":"Lingala","lt":"Litva","lg":"Luganda","lb":"Luxembourg","ms":"Mã Lai","mk":"Macedonia","mai":"Maithili","mg":"Malagasy","ml":"Malayalam","mt":"Malta","mi":"Maori","mr":"Marathi","mni-Mtei":"Meiteilon (Manipuri)","lus":"Mizo","mn":"Mông Cổ","my":"Myanmar","no":"Na Uy","ne":"Nepal","ru":"Nga","ja":"Nhật","or":"Odia (Oriya)","om":"Oromo","ps":"Pashto","sa":"Phạn","fr":"Pháp","fi":"Phần Lan","pa":"Punjab","qu":"Quechua","eo":"Quốc tế ngữ","ro":"Rumani","sm":"Samoa","cs":"Séc","nso":"Sepedi","sr":"Serbia","st":"Sesotho","sn":"Shona","sd":"Sindhi","si":"Sinhala","sk":"Slovak","sl":"Slovenia","so":"Somali","su":"Sunda","sw":"Swahili","tg":"Tajik","ta":"Tamil","tt":"Tatar","es":"Tây Ban Nha","te":"Telugu","th":"Thái","tr":"Thổ Nhĩ Kỳ","sv":"Thụy Điển","ti":"Tigrinya","zh-CN":"Trung (Giản thể)","zh-TW":"Trung (Phồn thể)","ts":"Tsonga","tk":"Turkmen","ak":"Twi","uk":"Ukraina","ur":"Urdu","ug":"Uyghur","uz":"Uzbek","vi":"Việt","cy":"Xứ Wales","it":"Ý","yi":"Yiddish","yo":"Yoruba","zu":"Zulu"}');

  static DETECT_LANGUAGE = 'auto';
  static DefaultLanguage = {
    SL: GoogleTranslate.DETECT_LANGUAGE,
    TL: 'vi'
  };

  static DEEPL_TRANSLATOR_MAPPING = {
    SOURCE_LANGUAGES: {
      'auto': '',
      'ja': 'JA',
      'en': 'EN',
      'zh-CN': 'ZH',
      'zh-TW': 'ZH',
    },
    TARGET_LANGUAGES: {
      'ja': 'JA',
      'en': 'EN-US',
      'zh-CN': 'ZH',
      'zh-TW': 'ZH',
    }
  };
  static MICROSOFT_TRANSLATOR_MAPPING = {
    'auto': '',
    'zh-CN': 'zh-Hans',
    'zh-TW': 'zh-Hant',
  };

  constructor() {
    this.apiKey_ = 'AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw';
  }

  async init() {
    try {
      this.data_ = await this.fetchElementJsData();
    } catch (error) {
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
      case Translators.DEEPL_TRANSLATOR:
        return GoogleTranslate.DEEPL_TRANSLATOR_MAPPING.SOURCE_LANGUAGES[languageCode] ?? (DeepLTranslator.SOURCE_LANGUAGES.filter(({language}) => language === languageCode).length > 0 ? languageCode : DeepLTranslator.DefaultLanguage.SOURCE_LANG);

      case Translators.MICROSOFT_TRANSLATOR:
        return GoogleTranslate.MICROSOFT_TRANSLATOR_MAPPING[languageCode] ?? (MicrosoftTranslator.FROM_LANGUAGES.hasOwnProperty(languageCode) ? languageCode : MicrosoftTranslator.DefaultLanguage.FROM);

      case Translators.VIETPHRASE:
        return Vietphrase.DefaultLanguage.SOURCE_LANGUAGE;
    }
  }

  static getMappedTargetLanguageCode(translator, languageCode) {
    switch (translator) {
      case Translators.DEEPL_TRANSLATOR:
        return GoogleTranslate.DEEPL_TRANSLATOR_MAPPING.TARGET_LANGUAGES[languageCode] ?? (DeepLTranslator.TARGET_LANGUAGES.filter(({language}) => language === languageCode).length > 0 ? languageCode : DeepLTranslator.DefaultLanguage.TARGET_LANG);

      case Translators.PAPAGO:
        return GoogleTranslate.SOURCE_LANGUAGES.hasOwnProperty(languageCode) ? languageCode : Papago.DefaultLanguage.SL;

      case Translators.MICROSOFT_TRANSLATOR:
        return GoogleTranslate.MICROSOFT_TRANSLATOR_MAPPING[languageCode] ?? (MicrosoftTranslator.TO_LANGUAGES.hasOwnProperty(languageCode) ? languageCode : MicrosoftTranslator.DefaultLanguage.TO);

      case Translators.VIETPHRASE:
        return Vietphrase.DefaultLanguage.TARGET_LANGUAGE;
    }
  }

  async fetchElementJsData() {
    try {
      const data = {};

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
        url: `${Utils.CORS_PROXY}https://translate.googleapis.com/translate_a/element.js?aus=true&hl=vi${this.apiKey_.length > 0 ? `&key=${this.apiKey_}` : ''}`
      });

      data._cac = elementJs.match(/c\._cac='([a-z]*)'/)[1];
      data._cam = elementJs.match(/c\._cam='([a-z]*)'/)[1];
      this.kq = () => elementJs.match(/c\._ctkk='(\d+\.\d+)'/)[1];
      // console.log(elementJs.match(/_loadJs\('([^']+)'\)/)[1]);
      data.v = elementJs.match(/_exportVersion\('(TE_\d+)'\)/)[1];
      return data;
    } catch (error) {
      console.error('Không thể lấy được Google Translate Element:', error);
      throw 'Không thể lấy được Google Translate Element!';
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
        data: `q=${q.split(/\n/).map((element) => encodeURIComponent(element)).join('&q=')}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        url: `https://translate.googleapis.com/translate_a/t?anno=3&client=${(this.data_._cac || 'te') + (this.data_._cam === 'lib' ? '_lib' : '')}&format=html&v=1.0&key${this.apiKey_.length > 0 ? `=${this.apiKey_}` : ''}&logld=v${this.data_.v || ''}&sl=${sl}&tl=${tl}&tc=0&tk=${this.lq(q.replace(/\n/g, ''))}`
      })).map((element) => sl === 'auto' ? element[0] : element).map((element) => element.includes('<i>') ? element.replace(/<i>(?:.(?!<\/i>))+.(?=<\/i>)<\/i> <b>((?:.(?!<\/b>))+.(?=<\/b>))<\/b>/g, '$1') : element).join('\n'));
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      throw error;
    }
  }

  Oo(a) {
    for (var b = [], c = 0, d = 0; d < a.length; d++) {
      var e = a.charCodeAt(d);
      128 > e ? (b[c++] = e) : (2048 > e ? (b[c++] = (e >> 6) | 192) : (55296 === (e & 64512) && d + 1 < a.length && 56320 === (a.charCodeAt(d + 1) & 64512) ? ((e = 65536 + ((e & 1023) << 10) + (a.charCodeAt(++d) & 1023)), (b[c++] = (e >> 18) | 240), (b[c++] = ((e >> 12) & 63) | 128)) : (b[c++] = (e >> 12) | 224), (b[c++] = ((e >> 6) & 63) | 128)), (b[c++] = (e & 63) | 128));
    }
    return b;
  }

  jq(a, b) {
    for (var c = 0; c < b.length - 2; c += 3) {
      var d = b.charAt(c + 2);
      d = "a" <= d ? d.charCodeAt(0) - 87 : Number(d);
      d = "+" === b.charAt(c + 1) ? a >>> d : a << d;
      a = "+" === b.charAt(c) ? (a + d) & 4294967295 : a ^ d;
    }
    return a;
  }

  lq(a) {
    var b = this.kq().split("."), c = Number(b[0]) || 0;
    a = this.Oo(a);
    for (var d = c, e = 0; e < a.length; e++) {
      (d += a[e]), (d = this.jq(d, "+-a^+6"));
    }
    d = this.jq(d, "+-3^+b+-f");
    d ^= Number(b[1]) || 0;
    0 > d && (d = (d & 2147483647) + 2147483648);
    b = d % 1e6;
    return b.toString() + "." + (b ^ c);
  }
}

class Papago {
  static SOURCE_LANGUAGES = {
    'auto': 'Phát hiện ngôn ngữ',
    'ko': 'Hàn',
    'en': 'Anh',
    'ja': 'Nhật',
    'zh-CN': 'Trung (Giản thể)',
    'zh-TW': 'Trung (Phổn thể)',
    'es': 'Tây Ban Nha',
    'fr': 'Pháp',
    'de': 'Đức',
    'ru': 'Nga',
    'pt': 'Bồ Đào Nha',
    'it': 'Ý',
    'vi': 'Việt',
    'th': 'Thái',
    'id': 'Indonesia',
    'hi': 'Hindi'
  };
  static TARGET_LANGUAGES = {
    'ko': 'Hàn',
    'en': 'Anh',
    'ja': 'Nhật',
    'zh-CN': 'Trung (Giản thể)',
    'zh-TW': 'Trung (Phổn thể)',
    'es': 'Tây Ban Nha',
    'fr': 'Pháp',
    'de': 'Đức',
    'ru': 'Nga',
    'pt': 'Bồ Đào Nha',
    'it': 'Ý',
    'vi': 'Việt',
    'th': 'Thái',
    'id': 'Indonesia',
    'hi': 'Hindi'
  };

  static DETECT_LANGUAGE = 'auto';
  static DefaultLanguage = {
    SOURCE: Papago.DETECT_LANGUAGE,
    TARGET: 'vi'
  };

  static DEEPL_TRANSLATOR_MAPPING = {
    SOURCE_LANGUAGES: {
      '': 'auto',
      'en': 'EN',
      'ja': 'JA',
      'zh-CN': 'ZH',
      'zh-TW': 'ZH',
    },
    TARGET_LANGUAGES: {
      'en': 'EN-US',
      'ja': 'JA',
      'zh-CN': 'ZH',
      'zh-TW': 'ZH',
    }
  };
  static MICROSOFT_TRANSLATOR_MAPPING = {
    'auto': '',
    'zh-CN': 'zh-Hans',
    'zh-TW': 'zh-Hant',
  };

  async init() {
    this.uuid_ = crypto.randomUUID();

    try {
      this.version_ = await this.fetchVersion();
    } catch (error) {
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
      case Translators.DEEPL_TRANSLATOR:
        return Papago.DEEPL_TRANSLATOR_MAPPING.SOURCE_LANGUAGES[languageCode] ?? (DeepLTranslator.SOURCE_LANGUAGES.filter(({language}) => language === languageCode).length > 0 ? languageCode : DeepLTranslator.DefaultLanguage.SOURCE_LANG);

      case Translators.GOOGLE_TRANSLATE:
        return Papago.SOURCE_LANGUAGES.hasOwnProperty(languageCode) ? languageCode : GoogleTranslate.DefaultLanguage.SL;

      case Translators.MICROSOFT_TRANSLATOR:
        return Papago.MICROSOFT_TRANSLATOR_MAPPING[languageCode] ?? (MicrosoftTranslator.FROM_LANGUAGES.hasOwnProperty(languageCode) ? languageCode : MicrosoftTranslator.DefaultLanguage.FROM);

      case Translators.VIETPHRASE:
        return Vietphrase.DefaultLanguage.SOURCE_LANGUAGE;
    }
  }

  static getMappedTargetLanguageCode(translator, languageCode) {
    switch (translator) {
      case Translators.DEEPL_TRANSLATOR:
        return Papago.DEEPL_TRANSLATOR_MAPPING.TARGET_LANGUAGES[languageCode] ?? (DeepLTranslator.TARGET_LANGUAGES.filter(({language}) => language === languageCode).length > 0 ? languageCode : DeepLTranslator.DefaultLanguage.TARGET_LANG);

      case Translators.GOOGLE_TRANSLATE:
        return Papago.TARGET_LANGUAGES.hasOwnProperty(languageCode) ? languageCode : GoogleTranslate.DefaultLanguage.TL;

      case Translators.MICROSOFT_TRANSLATOR:
        return Papago.MICROSOFT_TRANSLATOR_MAPPING[languageCode] ?? (MicrosoftTranslator.TO_LANGUAGES.hasOwnProperty(languageCode) ? languageCode : MicrosoftTranslator.DefaultLanguage.TO);

      case Translators.VIETPHRASE:
        return Vietphrase.DefaultLanguage.TARGET_LANGUAGE;
    }
  }

  async fetchVersion() {
    try {
      const mainJs = (await $.ajax({
        method: 'GET',
        url: Utils.CORS_PROXY + 'https://papago.naver.com'
      })).match(/\/(main.*\.js)/)[1];
      return (await $.ajax({
        method: 'GET',
        url: Utils.CORS_PROXY + 'https://papago.naver.com/' + mainJs
      })).match(/"PPG .*,"(v[^"]*)/)[1];
    } catch (error) {
      console.error('Không thể lấy được Thông tin phiên bản:', error);
      throw 'Không thể lấy được Thông tin phiên bản!';
    }
  }

  async translateText(source, target, text) {
    try {
      const timeStamp = (new Date()).getTime();

      return (await $.ajax({
        data: `deviceId=${this.uuid_}&locale=vi&dict=true&dictDisplay=30&honorific=true&instant=false&paging=false&source=${source}&target=${target}&text=${encodeURIComponent(text)}`,
        headers: {
          Accept: 'application/json',
          'Accept-Language': 'vi',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          // 'device-type': 'pc',
          // 'device-type': 'mobile',
          'x-apigw-partnerid': 'papago',
          Authorization: 'PPG ' + this.uuid_ + ':' + CryptoJS.HmacMD5(this.uuid_ + '\n' + 'https://papago.naver.com/apis/n2mt/translate' + '\n' + timeStamp, this.version_).toString(CryptoJS.enc.Base64),
          Timestamp: timeStamp
        },
        method: 'POST',
        url: Utils.CORS_PROXY + 'https://papago.naver.com/apis/n2mt/translate'
      })).translatedText;
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      throw error;
    }
  }
}

class MicrosoftTranslator {
  /** https://api.cognitive.microsofttranslator.com/languages?api-version=3.0 */
  static FROM_LANGUAGES = {
    '': {name: 'Tự phát hiện'}, ...JSON.parse('{"af":{"name":"Tiếng Afrikaans","nativeName":"Afrikaans","dir":"ltr"},"am":{"name":"Tiếng Amharic","nativeName":"አማርኛ","dir":"ltr"},"ar":{"name":"Tiếng Ả Rập","nativeName":"العربية","dir":"rtl"},"as":{"name":"Tiếng Assam","nativeName":"অসমীয়া","dir":"ltr"},"az":{"name":"Tiếng Azerbaijan","nativeName":"Azərbaycan","dir":"ltr"},"ba":{"name":"Tiếng Bashkir","nativeName":"Bashkir","dir":"ltr"},"bg":{"name":"Tiếng Bulgaria","nativeName":"Български","dir":"ltr"},"bho":{"name":"Bhojpuri","nativeName":"Bhojpuri","dir":"ltr"},"bn":{"name":"Tiếng Bangla","nativeName":"বাংলা","dir":"ltr"},"bo":{"name":"Tiếng Tây Tạng","nativeName":"བོད་སྐད་","dir":"ltr"},"brx":{"name":"Bodo","nativeName":"बड़ो","dir":"ltr"},"bs":{"name":"Tiếng Bosnia","nativeName":"Bosnian","dir":"ltr"},"ca":{"name":"Tiếng Catalan","nativeName":"Català","dir":"ltr"},"cs":{"name":"Tiếng Séc","nativeName":"Čeština","dir":"ltr"},"cy":{"name":"Tiếng Wales","nativeName":"Cymraeg","dir":"ltr"},"da":{"name":"Tiếng Đan Mạch","nativeName":"Dansk","dir":"ltr"},"de":{"name":"Tiếng Đức","nativeName":"Deutsch","dir":"ltr"},"doi":{"name":"Dogri","nativeName":"Dogri","dir":"ltr"},"dsb":{"name":"Tiếng Hạ Sorbia","nativeName":"Dolnoserbšćina","dir":"ltr"},"dv":{"name":"Tiếng Divehi","nativeName":"ދިވެހިބަސް","dir":"rtl"},"el":{"name":"Tiếng Hy Lạp","nativeName":"Ελληνικά","dir":"ltr"},"en":{"name":"Tiếng Anh","nativeName":"English","dir":"ltr"},"es":{"name":"Tiếng Tây Ban Nha","nativeName":"Español","dir":"ltr"},"et":{"name":"Tiếng Estonia","nativeName":"Eesti","dir":"ltr"},"eu":{"name":"Tiếng Basque","nativeName":"Euskara","dir":"ltr"},"fa":{"name":"Tiếng Ba Tư","nativeName":"فارسی","dir":"rtl"},"fi":{"name":"Tiếng Phần Lan","nativeName":"Suomi","dir":"ltr"},"fil":{"name":"Tiếng Philippines","nativeName":"Filipino","dir":"ltr"},"fj":{"name":"Tiếng Fiji","nativeName":"Na Vosa Vakaviti","dir":"ltr"},"fo":{"name":"Tiếng Faroe","nativeName":"Føroyskt","dir":"ltr"},"fr":{"name":"Tiếng Pháp","nativeName":"Français","dir":"ltr"},"fr-CA":{"name":"Tiếng Pháp (Canada)","nativeName":"Français (Canada)","dir":"ltr"},"ga":{"name":"Tiếng Ireland","nativeName":"Gaeilge","dir":"ltr"},"gl":{"name":"Tiếng Galician","nativeName":"Galego","dir":"ltr"},"gom":{"name":"Konkani","nativeName":"Konkani","dir":"ltr"},"gu":{"name":"Tiếng Gujarati","nativeName":"ગુજરાતી","dir":"ltr"},"ha":{"name":"Tiếng Hausa","nativeName":"Hausa","dir":"ltr"},"he":{"name":"Tiếng Do Thái","nativeName":"עברית","dir":"rtl"},"hi":{"name":"Tiếng Hindi","nativeName":"हिन्दी","dir":"ltr"},"hr":{"name":"Tiếng Croatia","nativeName":"Hrvatski","dir":"ltr"},"hsb":{"name":"Tiếng Thượng Sorbia","nativeName":"Hornjoserbšćina","dir":"ltr"},"ht":{"name":"Tiếng Haiti","nativeName":"Haitian Creole","dir":"ltr"},"hu":{"name":"Tiếng Hungary","nativeName":"Magyar","dir":"ltr"},"hy":{"name":"Tiếng Armenia","nativeName":"Հայերեն","dir":"ltr"},"id":{"name":"Tiếng Indonesia","nativeName":"Indonesia","dir":"ltr"},"ig":{"name":"Tiếng Igbo","nativeName":"Ásụ̀sụ́ Ìgbò","dir":"ltr"},"ikt":{"name":"Inuinnaqtun","nativeName":"Inuinnaqtun","dir":"ltr"},"is":{"name":"Tiếng Iceland","nativeName":"Íslenska","dir":"ltr"},"it":{"name":"Tiếng Italy","nativeName":"Italiano","dir":"ltr"},"iu":{"name":"Tiếng Inuktitut","nativeName":"ᐃᓄᒃᑎᑐᑦ","dir":"ltr"},"iu-Latn":{"name":"Inuktitut (Latin)","nativeName":"Inuktitut (Latin)","dir":"ltr"},"ja":{"name":"Tiếng Nhật","nativeName":"日本語","dir":"ltr"},"ka":{"name":"Tiếng Georgia","nativeName":"ქართული","dir":"ltr"},"kk":{"name":"Tiếng Kazakh","nativeName":"Қазақ Тілі","dir":"ltr"},"km":{"name":"Tiếng Khmer","nativeName":"ខ្មែរ","dir":"ltr"},"kmr":{"name":"Tiếng Kurd (Bắc)","nativeName":"Kurdî (Bakur)","dir":"ltr"},"kn":{"name":"Tiếng Kannada","nativeName":"ಕನ್ನಡ","dir":"ltr"},"ko":{"name":"Tiếng Hàn","nativeName":"한국어","dir":"ltr"},"ks":{"name":"Kashmiri","nativeName":"کٲشُر","dir":"rtl"},"ku":{"name":"Tiếng Kurd (Trung)","nativeName":"Kurdî (Navîn)","dir":"rtl"},"ky":{"name":"Tiếng Kyrgyz","nativeName":"Кыргызча","dir":"ltr"},"ln":{"name":"Tiếng Lingala","nativeName":"Lingála","dir":"ltr"},"lo":{"name":"Tiếng Lào","nativeName":"ລາວ","dir":"ltr"},"lt":{"name":"Tiếng Litva","nativeName":"Lietuvių","dir":"ltr"},"lug":{"name":"Ganda","nativeName":"Ganda","dir":"ltr"},"lv":{"name":"Tiếng Latvia","nativeName":"Latviešu","dir":"ltr"},"lzh":{"name":"Chinese (Literary)","nativeName":"中文 (文言文)","dir":"ltr"},"mai":{"name":"Tiếng Maithili","nativeName":"Maithili","dir":"ltr"},"mg":{"name":"Tiếng Malagasy","nativeName":"Malagasy","dir":"ltr"},"mi":{"name":"Tiếng Maori","nativeName":"Te Reo Māori","dir":"ltr"},"mk":{"name":"Tiếng Macedonia","nativeName":"Македонски","dir":"ltr"},"ml":{"name":"Tiếng Malayalam","nativeName":"മലയാളം","dir":"ltr"},"mn-Cyrl":{"name":"Mongolian (Cyrillic)","nativeName":"Mongolian (Cyrillic)","dir":"ltr"},"mn-Mong":{"name":"Mongolian (Traditional)","nativeName":"ᠮᠣᠩᠭᠣᠯ ᠬᠡᠯᠡ","dir":"ltr"},"mr":{"name":"Tiếng Marathi","nativeName":"मराठी","dir":"ltr"},"ms":{"name":"Tiếng Mã Lai","nativeName":"Melayu","dir":"ltr"},"mt":{"name":"Tiếng Malta","nativeName":"Malti","dir":"ltr"},"mww":{"name":"Tiếng H’Mông","nativeName":"Hmong Daw","dir":"ltr"},"my":{"name":"Tiếng Miến Điện","nativeName":"မြန်မာ","dir":"ltr"},"nb":{"name":"Tiếng Na Uy (Bokmål)","nativeName":"Norsk Bokmål","dir":"ltr"},"ne":{"name":"Tiếng Nepal","nativeName":"नेपाली","dir":"ltr"},"nl":{"name":"Tiếng Hà Lan","nativeName":"Nederlands","dir":"ltr"},"nso":{"name":"Sesotho sa Leboa","nativeName":"Sesotho sa Leboa","dir":"ltr"},"nya":{"name":"Nyanja","nativeName":"Nyanja","dir":"ltr"},"or":{"name":"Tiếng Odia","nativeName":"ଓଡ଼ିଆ","dir":"ltr"},"otq":{"name":"Tiếng Querétaro Otomi","nativeName":"Hñähñu","dir":"ltr"},"pa":{"name":"Tiếng Punjab","nativeName":"ਪੰਜਾਬੀ","dir":"ltr"},"pl":{"name":"Tiếng Ba Lan","nativeName":"Polski","dir":"ltr"},"prs":{"name":"Tiếng Dari","nativeName":"دری","dir":"rtl"},"ps":{"name":"Tiếng Pashto","nativeName":"پښتو","dir":"rtl"},"pt":{"name":"Tiếng Bồ Đào Nha (Brazil)","nativeName":"Português (Brasil)","dir":"ltr"},"pt-PT":{"name":"Tiếng Bồ Đào Nha (Bồ Đào Nha)","nativeName":"Português (Portugal)","dir":"ltr"},"ro":{"name":"Tiếng Romania","nativeName":"Română","dir":"ltr"},"ru":{"name":"Tiếng Nga","nativeName":"Русский","dir":"ltr"},"run":{"name":"Rundi","nativeName":"Rundi","dir":"ltr"},"rw":{"name":"Tiếng Kinyarwanda","nativeName":"Kinyarwanda","dir":"ltr"},"sd":{"name":"Tiếng Sindhi","nativeName":"سنڌي","dir":"rtl"},"si":{"name":"Tiếng Sinhala","nativeName":"සිංහල","dir":"ltr"},"sk":{"name":"Tiếng Slovak","nativeName":"Slovenčina","dir":"ltr"},"sl":{"name":"Tiếng Slovenia","nativeName":"Slovenščina","dir":"ltr"},"sm":{"name":"Tiếng Samoa","nativeName":"Gagana Sāmoa","dir":"ltr"},"sn":{"name":"Tiếng Shona","nativeName":"chiShona","dir":"ltr"},"so":{"name":"Tiếng Somali","nativeName":"Soomaali","dir":"ltr"},"sq":{"name":"Tiếng Albania","nativeName":"Shqip","dir":"ltr"},"sr-Cyrl":{"name":"Tiếng Serbia (Chữ Kirin)","nativeName":"Српски (ћирилица)","dir":"ltr"},"sr-Latn":{"name":"Tiếng Serbia (Chữ La Tinh)","nativeName":"Srpski (latinica)","dir":"ltr"},"st":{"name":"Sesotho","nativeName":"Sesotho","dir":"ltr"},"sv":{"name":"Tiếng Thụy Điển","nativeName":"Svenska","dir":"ltr"},"sw":{"name":"Tiếng Swahili","nativeName":"Kiswahili","dir":"ltr"},"ta":{"name":"Tiếng Tamil","nativeName":"தமிழ்","dir":"ltr"},"te":{"name":"Tiếng Telugu","nativeName":"తెలుగు","dir":"ltr"},"th":{"name":"Tiếng Thái","nativeName":"ไทย","dir":"ltr"},"ti":{"name":"Tiếng Tigrinya","nativeName":"ትግር","dir":"ltr"},"tk":{"name":"Tiếng Turkmen","nativeName":"Türkmen Dili","dir":"ltr"},"tlh-Latn":{"name":"Tiếng Klingon (Chữ La Tinh)","nativeName":"Klingon (Latin)","dir":"ltr"},"tlh-Piqd":{"name":"Tiếng Klingon (pIqaD)","nativeName":"Klingon (pIqaD)","dir":"ltr"},"tn":{"name":"Setswana","nativeName":"Setswana","dir":"ltr"},"to":{"name":"Tiếng Tonga","nativeName":"Lea Fakatonga","dir":"ltr"},"tr":{"name":"Tiếng Thổ Nhĩ Kỳ","nativeName":"Türkçe","dir":"ltr"},"tt":{"name":"Tiếng Tatar","nativeName":"Татар","dir":"ltr"},"ty":{"name":"Tiếng Tahiti","nativeName":"Reo Tahiti","dir":"ltr"},"ug":{"name":"Tiếng Uyghur","nativeName":"ئۇيغۇرچە","dir":"rtl"},"uk":{"name":"Tiếng Ukraina","nativeName":"Українська","dir":"ltr"},"ur":{"name":"Tiếng Urdu","nativeName":"اردو","dir":"rtl"},"uz":{"name":"Tiếng Uzbek","nativeName":"Uzbek (Latin)","dir":"ltr"},"vi":{"name":"Tiếng Việt","nativeName":"Tiếng Việt","dir":"ltr"},"xh":{"name":"Tiếng Xhosa","nativeName":"isiXhosa","dir":"ltr"},"yo":{"name":"Tiếng Yoruba","nativeName":"Èdè Yorùbá","dir":"ltr"},"yua":{"name":"Tiếng Maya Yucatec","nativeName":"Yucatec Maya","dir":"ltr"},"yue":{"name":"Tiếng Quảng Đông (Phồn Thể)","nativeName":"粵語 (繁體)","dir":"ltr"},"zh-Hans":{"name":"Tiếng Trung (Giản Thể)","nativeName":"中文 (简体)","dir":"ltr"},"zh-Hant":{"name":"Tiếng Trung (Phồn Thể)","nativeName":"繁體中文 (繁體)","dir":"ltr"},"zu":{"name":"Tiếng Zulu","nativeName":"Isi-Zulu","dir":"ltr"}}')
  };
  static TO_LANGUAGES = JSON.parse('{"af":{"name":"Tiếng Afrikaans","nativeName":"Afrikaans","dir":"ltr"},"am":{"name":"Tiếng Amharic","nativeName":"አማርኛ","dir":"ltr"},"ar":{"name":"Tiếng Ả Rập","nativeName":"العربية","dir":"rtl"},"as":{"name":"Tiếng Assam","nativeName":"অসমীয়া","dir":"ltr"},"az":{"name":"Tiếng Azerbaijan","nativeName":"Azərbaycan","dir":"ltr"},"ba":{"name":"Tiếng Bashkir","nativeName":"Bashkir","dir":"ltr"},"bg":{"name":"Tiếng Bulgaria","nativeName":"Български","dir":"ltr"},"bho":{"name":"Bhojpuri","nativeName":"Bhojpuri","dir":"ltr"},"bn":{"name":"Tiếng Bangla","nativeName":"বাংলা","dir":"ltr"},"bo":{"name":"Tiếng Tây Tạng","nativeName":"བོད་སྐད་","dir":"ltr"},"brx":{"name":"Bodo","nativeName":"बड़ो","dir":"ltr"},"bs":{"name":"Tiếng Bosnia","nativeName":"Bosnian","dir":"ltr"},"ca":{"name":"Tiếng Catalan","nativeName":"Català","dir":"ltr"},"cs":{"name":"Tiếng Séc","nativeName":"Čeština","dir":"ltr"},"cy":{"name":"Tiếng Wales","nativeName":"Cymraeg","dir":"ltr"},"da":{"name":"Tiếng Đan Mạch","nativeName":"Dansk","dir":"ltr"},"de":{"name":"Tiếng Đức","nativeName":"Deutsch","dir":"ltr"},"doi":{"name":"Dogri","nativeName":"Dogri","dir":"ltr"},"dsb":{"name":"Tiếng Hạ Sorbia","nativeName":"Dolnoserbšćina","dir":"ltr"},"dv":{"name":"Tiếng Divehi","nativeName":"ދިވެހިބަސް","dir":"rtl"},"el":{"name":"Tiếng Hy Lạp","nativeName":"Ελληνικά","dir":"ltr"},"en":{"name":"Tiếng Anh","nativeName":"English","dir":"ltr"},"es":{"name":"Tiếng Tây Ban Nha","nativeName":"Español","dir":"ltr"},"et":{"name":"Tiếng Estonia","nativeName":"Eesti","dir":"ltr"},"eu":{"name":"Tiếng Basque","nativeName":"Euskara","dir":"ltr"},"fa":{"name":"Tiếng Ba Tư","nativeName":"فارسی","dir":"rtl"},"fi":{"name":"Tiếng Phần Lan","nativeName":"Suomi","dir":"ltr"},"fil":{"name":"Tiếng Philippines","nativeName":"Filipino","dir":"ltr"},"fj":{"name":"Tiếng Fiji","nativeName":"Na Vosa Vakaviti","dir":"ltr"},"fo":{"name":"Tiếng Faroe","nativeName":"Føroyskt","dir":"ltr"},"fr":{"name":"Tiếng Pháp","nativeName":"Français","dir":"ltr"},"fr-CA":{"name":"Tiếng Pháp (Canada)","nativeName":"Français (Canada)","dir":"ltr"},"ga":{"name":"Tiếng Ireland","nativeName":"Gaeilge","dir":"ltr"},"gl":{"name":"Tiếng Galician","nativeName":"Galego","dir":"ltr"},"gom":{"name":"Konkani","nativeName":"Konkani","dir":"ltr"},"gu":{"name":"Tiếng Gujarati","nativeName":"ગુજરાતી","dir":"ltr"},"ha":{"name":"Tiếng Hausa","nativeName":"Hausa","dir":"ltr"},"he":{"name":"Tiếng Do Thái","nativeName":"עברית","dir":"rtl"},"hi":{"name":"Tiếng Hindi","nativeName":"हिन्दी","dir":"ltr"},"hr":{"name":"Tiếng Croatia","nativeName":"Hrvatski","dir":"ltr"},"hsb":{"name":"Tiếng Thượng Sorbia","nativeName":"Hornjoserbšćina","dir":"ltr"},"ht":{"name":"Tiếng Haiti","nativeName":"Haitian Creole","dir":"ltr"},"hu":{"name":"Tiếng Hungary","nativeName":"Magyar","dir":"ltr"},"hy":{"name":"Tiếng Armenia","nativeName":"Հայերեն","dir":"ltr"},"id":{"name":"Tiếng Indonesia","nativeName":"Indonesia","dir":"ltr"},"ig":{"name":"Tiếng Igbo","nativeName":"Ásụ̀sụ́ Ìgbò","dir":"ltr"},"ikt":{"name":"Inuinnaqtun","nativeName":"Inuinnaqtun","dir":"ltr"},"is":{"name":"Tiếng Iceland","nativeName":"Íslenska","dir":"ltr"},"it":{"name":"Tiếng Italy","nativeName":"Italiano","dir":"ltr"},"iu":{"name":"Tiếng Inuktitut","nativeName":"ᐃᓄᒃᑎᑐᑦ","dir":"ltr"},"iu-Latn":{"name":"Inuktitut (Latin)","nativeName":"Inuktitut (Latin)","dir":"ltr"},"ja":{"name":"Tiếng Nhật","nativeName":"日本語","dir":"ltr"},"ka":{"name":"Tiếng Georgia","nativeName":"ქართული","dir":"ltr"},"kk":{"name":"Tiếng Kazakh","nativeName":"Қазақ Тілі","dir":"ltr"},"km":{"name":"Tiếng Khmer","nativeName":"ខ្មែរ","dir":"ltr"},"kmr":{"name":"Tiếng Kurd (Bắc)","nativeName":"Kurdî (Bakur)","dir":"ltr"},"kn":{"name":"Tiếng Kannada","nativeName":"ಕನ್ನಡ","dir":"ltr"},"ko":{"name":"Tiếng Hàn","nativeName":"한국어","dir":"ltr"},"ks":{"name":"Kashmiri","nativeName":"کٲشُر","dir":"rtl"},"ku":{"name":"Tiếng Kurd (Trung)","nativeName":"Kurdî (Navîn)","dir":"rtl"},"ky":{"name":"Tiếng Kyrgyz","nativeName":"Кыргызча","dir":"ltr"},"ln":{"name":"Tiếng Lingala","nativeName":"Lingála","dir":"ltr"},"lo":{"name":"Tiếng Lào","nativeName":"ລາວ","dir":"ltr"},"lt":{"name":"Tiếng Litva","nativeName":"Lietuvių","dir":"ltr"},"lug":{"name":"Ganda","nativeName":"Ganda","dir":"ltr"},"lv":{"name":"Tiếng Latvia","nativeName":"Latviešu","dir":"ltr"},"lzh":{"name":"Chinese (Literary)","nativeName":"中文 (文言文)","dir":"ltr"},"mai":{"name":"Tiếng Maithili","nativeName":"Maithili","dir":"ltr"},"mg":{"name":"Tiếng Malagasy","nativeName":"Malagasy","dir":"ltr"},"mi":{"name":"Tiếng Maori","nativeName":"Te Reo Māori","dir":"ltr"},"mk":{"name":"Tiếng Macedonia","nativeName":"Македонски","dir":"ltr"},"ml":{"name":"Tiếng Malayalam","nativeName":"മലയാളം","dir":"ltr"},"mn-Cyrl":{"name":"Mongolian (Cyrillic)","nativeName":"Mongolian (Cyrillic)","dir":"ltr"},"mn-Mong":{"name":"Mongolian (Traditional)","nativeName":"ᠮᠣᠩᠭᠣᠯ ᠬᠡᠯᠡ","dir":"ltr"},"mr":{"name":"Tiếng Marathi","nativeName":"मराठी","dir":"ltr"},"ms":{"name":"Tiếng Mã Lai","nativeName":"Melayu","dir":"ltr"},"mt":{"name":"Tiếng Malta","nativeName":"Malti","dir":"ltr"},"mww":{"name":"Tiếng H’Mông","nativeName":"Hmong Daw","dir":"ltr"},"my":{"name":"Tiếng Miến Điện","nativeName":"မြန်မာ","dir":"ltr"},"nb":{"name":"Tiếng Na Uy (Bokmål)","nativeName":"Norsk Bokmål","dir":"ltr"},"ne":{"name":"Tiếng Nepal","nativeName":"नेपाली","dir":"ltr"},"nl":{"name":"Tiếng Hà Lan","nativeName":"Nederlands","dir":"ltr"},"nso":{"name":"Sesotho sa Leboa","nativeName":"Sesotho sa Leboa","dir":"ltr"},"nya":{"name":"Nyanja","nativeName":"Nyanja","dir":"ltr"},"or":{"name":"Tiếng Odia","nativeName":"ଓଡ଼ିଆ","dir":"ltr"},"otq":{"name":"Tiếng Querétaro Otomi","nativeName":"Hñähñu","dir":"ltr"},"pa":{"name":"Tiếng Punjab","nativeName":"ਪੰਜਾਬੀ","dir":"ltr"},"pl":{"name":"Tiếng Ba Lan","nativeName":"Polski","dir":"ltr"},"prs":{"name":"Tiếng Dari","nativeName":"دری","dir":"rtl"},"ps":{"name":"Tiếng Pashto","nativeName":"پښتو","dir":"rtl"},"pt":{"name":"Tiếng Bồ Đào Nha (Brazil)","nativeName":"Português (Brasil)","dir":"ltr"},"pt-PT":{"name":"Tiếng Bồ Đào Nha (Bồ Đào Nha)","nativeName":"Português (Portugal)","dir":"ltr"},"ro":{"name":"Tiếng Romania","nativeName":"Română","dir":"ltr"},"ru":{"name":"Tiếng Nga","nativeName":"Русский","dir":"ltr"},"run":{"name":"Rundi","nativeName":"Rundi","dir":"ltr"},"rw":{"name":"Tiếng Kinyarwanda","nativeName":"Kinyarwanda","dir":"ltr"},"sd":{"name":"Tiếng Sindhi","nativeName":"سنڌي","dir":"rtl"},"si":{"name":"Tiếng Sinhala","nativeName":"සිංහල","dir":"ltr"},"sk":{"name":"Tiếng Slovak","nativeName":"Slovenčina","dir":"ltr"},"sl":{"name":"Tiếng Slovenia","nativeName":"Slovenščina","dir":"ltr"},"sm":{"name":"Tiếng Samoa","nativeName":"Gagana Sāmoa","dir":"ltr"},"sn":{"name":"Tiếng Shona","nativeName":"chiShona","dir":"ltr"},"so":{"name":"Tiếng Somali","nativeName":"Soomaali","dir":"ltr"},"sq":{"name":"Tiếng Albania","nativeName":"Shqip","dir":"ltr"},"sr-Cyrl":{"name":"Tiếng Serbia (Chữ Kirin)","nativeName":"Српски (ћирилица)","dir":"ltr"},"sr-Latn":{"name":"Tiếng Serbia (Chữ La Tinh)","nativeName":"Srpski (latinica)","dir":"ltr"},"st":{"name":"Sesotho","nativeName":"Sesotho","dir":"ltr"},"sv":{"name":"Tiếng Thụy Điển","nativeName":"Svenska","dir":"ltr"},"sw":{"name":"Tiếng Swahili","nativeName":"Kiswahili","dir":"ltr"},"ta":{"name":"Tiếng Tamil","nativeName":"தமிழ்","dir":"ltr"},"te":{"name":"Tiếng Telugu","nativeName":"తెలుగు","dir":"ltr"},"th":{"name":"Tiếng Thái","nativeName":"ไทย","dir":"ltr"},"ti":{"name":"Tiếng Tigrinya","nativeName":"ትግር","dir":"ltr"},"tk":{"name":"Tiếng Turkmen","nativeName":"Türkmen Dili","dir":"ltr"},"tlh-Latn":{"name":"Tiếng Klingon (Chữ La Tinh)","nativeName":"Klingon (Latin)","dir":"ltr"},"tlh-Piqd":{"name":"Tiếng Klingon (pIqaD)","nativeName":"Klingon (pIqaD)","dir":"ltr"},"tn":{"name":"Setswana","nativeName":"Setswana","dir":"ltr"},"to":{"name":"Tiếng Tonga","nativeName":"Lea Fakatonga","dir":"ltr"},"tr":{"name":"Tiếng Thổ Nhĩ Kỳ","nativeName":"Türkçe","dir":"ltr"},"tt":{"name":"Tiếng Tatar","nativeName":"Татар","dir":"ltr"},"ty":{"name":"Tiếng Tahiti","nativeName":"Reo Tahiti","dir":"ltr"},"ug":{"name":"Tiếng Uyghur","nativeName":"ئۇيغۇرچە","dir":"rtl"},"uk":{"name":"Tiếng Ukraina","nativeName":"Українська","dir":"ltr"},"ur":{"name":"Tiếng Urdu","nativeName":"اردو","dir":"rtl"},"uz":{"name":"Tiếng Uzbek","nativeName":"Uzbek (Latin)","dir":"ltr"},"vi":{"name":"Tiếng Việt","nativeName":"Tiếng Việt","dir":"ltr"},"xh":{"name":"Tiếng Xhosa","nativeName":"isiXhosa","dir":"ltr"},"yo":{"name":"Tiếng Yoruba","nativeName":"Èdè Yorùbá","dir":"ltr"},"yua":{"name":"Tiếng Maya Yucatec","nativeName":"Yucatec Maya","dir":"ltr"},"yue":{"name":"Tiếng Quảng Đông (Phồn Thể)","nativeName":"粵語 (繁體)","dir":"ltr"},"zh-Hans":{"name":"Tiếng Trung (Giản Thể)","nativeName":"中文 (简体)","dir":"ltr"},"zh-Hant":{"name":"Tiếng Trung (Phồn Thể)","nativeName":"繁體中文 (繁體)","dir":"ltr"},"zu":{"name":"Tiếng Zulu","nativeName":"Isi-Zulu","dir":"ltr"}}');

  static AUTODETECT = '';
  static DefaultLanguage = {
    FROM: MicrosoftTranslator.AUTODETECT,
    TO: 'vi'
  };

  static DEEPL_TRANSLATOR_MAPPING = {
    SOURCE_LANGUAGES: {
      'en': 'EN',
      'ja': 'JA',
      'zh-Hans': 'ZH',
      'zh-Hant': 'ZH',
    },
    TARGET_LANGUAGES: {
      'en': 'EN-US',
      'ja': 'JA',
      'zh-Hans': 'ZH',
      'zh-Hant': 'ZH',
    }
  };
  static GOOGLE_TRANSLATE_MAPPING = {
    '': 'auto',
    'zh-Hans': 'zh-CN',
    'zh-Hant': 'zh-TW',
  };
  static PAPAGO_MAPPING = {
    '': 'auto',
    'zh-Hans': 'zh-CN',
    'zh-Hant': 'zh-TW',
  };

  async init() {
    try {
      this.accessToken_ = await this.fetchAccessToken();
    } catch (error) {
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
      case Translators.DEEPL_TRANSLATOR:
        return MicrosoftTranslator.DEEPL_TRANSLATOR_MAPPING.SOURCE_LANGUAGES[languageCode] ?? (DeepLTranslator.SOURCE_LANGUAGES.filter(({language}) => language === languageCode).length > 0 ? languageCode : DeepLTranslator.DefaultLanguage.SOURCE_LANG);

      case Translators.GOOGLE_TRANSLATE:
        return MicrosoftTranslator.GOOGLE_TRANSLATE_MAPPING[languageCode] ?? (GoogleTranslate.SOURCE_LANGUAGES.hasOwnProperty(languageCode) ? languageCode : GoogleTranslate.DefaultLanguage.SL);

      case Translators.PAPAGO:
        return MicrosoftTranslator.PAPAGO_MAPPING[languageCode] ?? (Papago.SOURCE_LANGUAGES.hasOwnProperty(languageCode) ? languageCode : Papago.DefaultLanguage.SOURCE);

      case Translators.VIETPHRASE:
        return Vietphrase.DefaultLanguage.SOURCE_LANGUAGE;
    }
  }

  static getMappedTargetLanguageCode(translator, languageCode) {
    switch (translator) {
      case Translators.DEEPL_TRANSLATOR:
        return MicrosoftTranslator.DEEPL_TRANSLATOR_MAPPING.TARGET_LANGUAGES[languageCode] ?? (DeepLTranslator.TARGET_LANGUAGES.filter(({language}) => language === languageCode).length > 0 ? languageCode : DeepLTranslator.DefaultLanguage.TARGET_LANG);

      case Translators.GOOGLE_TRANSLATE:
        return MicrosoftTranslator.GOOGLE_TRANSLATE_MAPPING[languageCode] ?? (GoogleTranslate.TARGET_LANGUAGES.hasOwnProperty(languageCode) ? languageCode : GoogleTranslate.DefaultLanguage.TL);

      case Translators.PAPAGO:
        return MicrosoftTranslator.PAPAGO_MAPPING[languageCode] ?? (Papago.TARGET_LANGUAGES.hasOwnProperty(languageCode) ? languageCode : Papago.DefaultLanguage.TARGET);

      case Translators.VIETPHRASE:
        return Vietphrase.DefaultLanguage.TARGET_LANGUAGE;
    }
  }

  async fetchAccessToken() {
    try {
      return await $.ajax({
        dataType: 'text',
        method: 'GET',
        url: 'https://edge.microsoft.com/translate/auth'
      });
    } catch (error) {
      console.error('Không thể lấy được Access Token:', error);
      throw 'Không thể lấy được Access Token!';
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
        data: JSON.stringify(text.split(/\n/).map((element) => ({Text: element}))),
        dataType: 'json',
        headers: {
          'Authorization': `Bearer ${this.accessToken_}`,
          'Content-Type': 'application/json'
        },
        method: 'POST',
        url: `https://api-edge.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${from}&to=${to}`
      })).map(({translations: [{text}]}) => text).join('\n');
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      throw error;
    }
  }
}

class Vietphrase {
  static SOURCE_LANGUAGES = {zh: 'Tiếng Trung'};
  static TARGET_LANGUAGES = {
    pinyin: 'Bính âm',
    sinoVietnamese: 'Hán Việt',
    vi: 'Vietphrase'
  };

  static DefaultLanguage = {
    SOURCE_LANGUAGE: 'zh',
    TARGET_LANGUAGE: 'vi'
  };

  TranslationAlgorithms = {
    PRIORITIZE_LONG_VIETPHRASE_CLUSTERS: '0',
    TRANSLATE_FROM_LEFT_TO_RIGHT: '1',
  };
  MultiplicationAlgorithm = {
    NOT_APPLICABLE: '0',
    MULTIPLICATION_BY_PRONOUNS: '1',
    MULTIPLICATION_BY_PRONOUNS_AND_NAMES: '2',
  };

  constructor(data, translationAlgorithm, multiplicationAlgorithm, caseSensitive = false, useGlossary = false, glossary = {}, prioritizeNameOverVietphraseCheck = false) {
    this.data_ = data;
    this.translationAlgorithm_ = translationAlgorithm;
    this.multiplicationAlgorithm_ = multiplicationAlgorithm;
    this.caseSensitive_ = caseSensitive;
    this.useGlossary_ = useGlossary;
    this.glossary_ = glossary;
    this.prioritizeNameOverVietphraseCheck_ = prioritizeNameOverVietphraseCheck;
  }

  static getSourceLanguageName(languageCode) {
    return Vietphrase.SOURCE_LANGUAGES[languageCode].startsWith('Tiếng ') ? Vietphrase.SOURCE_LANGUAGES[languageCode].match(/Tiếng (.+)/)[1] : Vietphrase.SOURCE_LANGUAGES[languageCode];
  }

  static getTargetLanguageName(languageCode) {
    return Vietphrase.TARGET_LANGUAGES[languageCode].startsWith('Tiếng ') ? Vietphrase.TARGET_LANGUAGES[languageCode].match(/Tiếng (.+)/)[1] : Vietphrase.TARGET_LANGUAGES[languageCode];
  }

  static getMappedSourceLanguageCode(translator, languageCode) {
    switch (translator) {
      case Translators.DEEPL_TRANSLATOR:
        return DeepLTranslator.DefaultLanguage.SOURCE_LANG;

      case Translators.GOOGLE_TRANSLATE:
        return GoogleTranslate.DefaultLanguage.SL;

      case Translators.PAPAGO:
        return Papago.DefaultLanguage.SOURCE;

      case Translators.MICROSOFT_TRANSLATOR:
        return MicrosoftTranslator.DefaultLanguage.FROM;
    }
  }

  static getMappedTargetLanguageCode(translator, languageCode) {
    switch (translator) {
      case Translators.DEEPL_TRANSLATOR:
        return DeepLTranslator.DefaultLanguage.TARGET_LANG;

      case Translators.GOOGLE_TRANSLATE:
        return GoogleTranslate.DefaultLanguage.TL;

      case Translators.PAPAGO:
        return Papago.DefaultLanguage.TARGET;

      case Translators.MICROSOFT_TRANSLATOR:
        return MicrosoftTranslator.DefaultLanguage.TO;
    }
  }

  translateText(sourceLanugage, targetLanguage, inputText) {
    try {
      let data = {};

      switch (targetLanguage) {
        case 'pinyin':
          data = this.data_.pinyins;
          break;

        case 'sinoVietnamese':
          data = this.data_.chinesePhienAmWords;
          break;

        case 'vi':
          data = this.data_.vietphrases;
          break;
      }

      switch (this.translationAlgorithm_) {
        case this.TranslationAlgorithms.TRANSLATE_FROM_LEFT_TO_RIGHT:
          return this.translateFromLeftToRight(data, targetLanguage, inputText);

        default:
        case this.TranslationAlgorithms.PRIORITIZE_LONG_VIETPHRASE_CLUSTERS:
          return this.translatePrioritizeLongVietphraseClusters(data, targetLanguage, inputText);
      }
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      throw error;
    }
  }

  translatePrioritizeLongVietphraseClusters(data, targetLanguage, inputText) {
    let dataEntries = Object.entries(data).filter(([first]) => inputText.includes(first));
    let result = inputText.split(/\r?\n/).map((element) => element.trim());

    switch (targetLanguage) {
      case 'pinyin':
      case 'sinoVietnamese':
        if (dataEntries.length > 0) {
          data = Object.fromEntries(dataEntries);

          for (const property in data) {
            result = result.replace(new RegExp(`([\\p{Lu}\\p{Ll}\\p{Nd}])${Utils.getRegexEscapedText(property)}([\\p{Lu}\\p{Ll}\\p{Nd}])`, 'gu'), `$1 ${Utils.getRegexEscapedReplacement(data[property])} $2`)
                           .replace(new RegExp(`([\\p{Lu}\\p{Ll}\\p{Nd}])${Utils.getRegexEscapedText(property)}`, 'gu'), `$1 ${Utils.getRegexEscapedReplacement(data[property])}`)
                           .replace(new RegExp(`${Utils.getRegexEscapedText(property)}([\\p{Lu}\\p{Ll}\\p{Nd}])`, 'gu'), `${Utils.getRegexEscapedReplacement(data[property])} $1`)
                           .replace(new RegExp(Utils.getRegexEscapedText(property), 'g'), Utils.getRegexEscapedReplacement(data[property]));
          }

          result = result.split(/\n/).map((element) => this.caseSensitive_ ? element.replace(/(^\s*|\s*(?:[!\-.:;?。！．：；？]\s*|['"\p{Ps}\p{Pi}]\s*))(\p{Ll})/gu, (match, p1, p2) => p1 + p2.toUpperCase()) : element).join('\n');
        }
        break;

      case 'vi':
        let glossaryEntries = Object.entries(this.glossary_);

        if (dataEntries.length > 0 || glossaryEntries.length > 0) {
          if (this.multiplicationAlgorithm_ > this.MultiplicationAlgorithm.NOT_APPLICABLE) {
            const luatnhanNameEntries = [];
            const luatnhanPronounEntries = [];

            for (const luatnhan in this.data_.cacLuatnhan) {
              if (this.useGlossary_ && this.multiplicationAlgorithm_ === this.MultiplicationAlgorithm.MULTIPLICATION_BY_PRONOUNS_AND_NAMES && glossaryEntries.length > 0) {
                for (const element in this.glossary_) {
                  const first = luatnhan.replace(/\{0}/g, Utils.getRegexEscapedReplacement(this.prioritizeNameOverVietphraseCheck_ ? this.glossary_[element] : element));

                  if (inputText.includes(first)) {
                    luatnhanNameEntries.push([
                      first,
                      this.data_.cacLuatnhan[luatnhan].replace(/\{0}/g, Utils.getRegexEscapedReplacement(this.glossary_[element]))
                    ]);
                  }
                }
              }

              for (const pronoun in this.data_.pronouns) {
                const first = luatnhan.replace(/\{0}/g, Utils.getRegexEscapedReplacement(pronoun));

                if (inputText.includes(first)) {
                  luatnhanPronounEntries.push([
                    first,
                    this.data_.cacLuatnhan[luatnhan].replace(/\{0}/g, Utils.getRegexEscapedReplacement(this.data_.pronouns[pronoun]))
                  ]);
                }
              }
            }

            glossaryEntries = [...luatnhanNameEntries, ...glossaryEntries];
            dataEntries = [...this.prioritizeNameOverVietphraseCheck_ ? luatnhanNameEntries : [], ...luatnhanPronounEntries, ...dataEntries];
          }

          dataEntries = [
            ...this.useGlossary_ && !this.prioritizeNameOverVietphraseCheck_ ? glossaryEntries : [],
            ...dataEntries
          ];

          data = Object.fromEntries(dataEntries);

          for (const property in data) {
            result = result.replace(new RegExp(`([\\p{Lu}\\p{Ll}\\p{Nd}])${Utils.getRegexEscapedText(property)}(?=${Object.values(this.glossary_).join('|')})`, 'gu'), `$1 ${Utils.getRegexEscapedReplacement(data[property])} `)
                           .replace(new RegExp(`([\\p{Lu}\\p{Ll}\\p{Nd}])${Utils.getRegexEscapedText(property)}([\\p{Lu}\\p{Ll}\\p{Nd}])`, 'gu'), `$1 ${Utils.getRegexEscapedReplacement(data[property])} $2`)
                           .replace(new RegExp(`([\\p{Lu}\\p{Ll}\\p{Nd}])${Utils.getRegexEscapedText(property)}`, 'gu'), `$1 ${Utils.getRegexEscapedReplacement(data[property])}`)
                           .replace(new RegExp(`${Utils.getRegexEscapedText(property)}([\\p{Lu}\\p{Ll}\\p{Nd}])`, 'gu'), `${Utils.getRegexEscapedReplacement(data[property])} $1`)
                           .replace(new RegExp(`${Utils.getRegexEscapedText(property)}(?=${Object.values(this.glossary_).join('|')})`, 'g'), `${Utils.getRegexEscapedReplacement(data[property])} `)
                           .replace(new RegExp(Utils.getRegexEscapedText(property), 'g'), Utils.getRegexEscapedReplacement(data[property]));
          }

          result = result.split(/\n/).map((element) => this.caseSensitive_ ? element.replace(/(^\s*|\s*(?:[!\-.:;?。！．：；？]\s*|['"\p{Ps}\p{Pi}]\s*))(\p{Ll})/gu, (match, p1, p2) => p1 + p2.toUpperCase()) : element).join('\n');
        }
        break;
    }
    
    return result;
  }

  translateFromLeftToRight(data, targetLanguage, inputText) {
    let dataEntries = Object.entries(data).filter(([first]) => inputText.includes(first));

    let result = inputText.split(/\r?\n/).map((element) => element.trim()).join('\n');

    const lines = inputText.split(/\r?\n/).map((element) => element.trim());
    const results = [];

    switch (targetLanguage) {
      case 'pinyin':
      case 'sinoVietnamese':
        if (dataEntries.length > 0) {
          data = Object.fromEntries(dataEntries);

          const dataLengths = [
            ...dataEntries.map(([first]) => first.length),
            1
          ].sort((a, b) => b - a).filter((element, index, array) => index === array.indexOf(element));

          for (let i = 0; i < lines.length; i++) {
            let chars = lines[i];

            if (chars.length === 0) {
              results.push(chars);
              continue;
            }

            let tempLine = '';
            let prevPhrase = '';

            for (let j = 0; j < chars.length; j++) {
              for (const dataLength of dataLengths) {
                const phrase = chars.substring(j, j + dataLength);

                if (data.hasOwnProperty(phrase)) {
                  if (data[phrase].length > 0) {
                    tempLine += (j > 0 && /[\p{Lu}\p{Ll}\p{Nd}]/u.test(prevPhrase || tempLine[tempLine.length - 1] || '') ? ' ' : '') + data[phrase];
                    prevPhrase = data[phrase];
                  }

                  j += dataLength - 1;
                  break;
                } else if (dataLength === 1) {
                  tempLine += chars[j];
                  prevPhrase = '';
                  break;
                }
              }
            }

            results.push(tempLine);
          }
        }

        result = results.map((element) => this.caseSensitive_ ? element.replace(/(^\s*|\s*(?:[!\-.:;?。！．：；？]\s*|['"\p{Ps}\p{Pi}]\s*))(\p{Ll})/gu, (match, p1, p2) => p1 + p2.toUpperCase()) : element).join('\n');
        break;

      case 'vi':
        let glossaryEntries = Object.entries(this.glossary_);

        if (dataEntries.length > 0 || glossaryEntries.length > 0) {
          if (this.multiplicationAlgorithm_ > this.MultiplicationAlgorithm.NOT_APPLICABLE) {
            const luatnhanNameEntries = [];
            const luatnhanPronounEntries = [];

            for (const luatnhan in this.data_.cacLuatnhan) {
              if (this.useGlossary_ && this.multiplicationAlgorithm_ === this.MultiplicationAlgorithm.MULTIPLICATION_BY_PRONOUNS_AND_NAMES && glossaryEntries.length > 0) {
                for (const element in this.glossary_) {
                  luatnhanNameEntries.push([
                    luatnhan.replace(/\{0}/g, Utils.getRegexEscapedReplacement(this.prioritizeNameOverVietphraseCheck_ ? this.glossary_[element] : element)),
                    this.data_.cacLuatnhan[luatnhan].replace(/\{0}/g, Utils.getRegexEscapedReplacement(this.glossary_[element]))
                  ]);
                }
              }

              for (const pronoun in this.data_.pronouns) {
                luatnhanPronounEntries.push([
                  luatnhan.replace(/\{0}/g, Utils.getRegexEscapedReplacement(pronoun)),
                  this.data_.cacLuatnhan[luatnhan].replace(/\{0}/g, Utils.getRegexEscapedReplacement(this.data_.pronouns[pronoun]))
                ]);
              }
            }

            glossaryEntries = [...luatnhanNameEntries, ...glossaryEntries];
            dataEntries = [
              ...this.prioritizeNameOverVietphraseCheck_ ? luatnhanNameEntries : [],
              ...luatnhanPronounEntries,
              ...dataEntries
            ];
          }

          dataEntries = [
            ...this.useGlossary_ && !this.prioritizeNameOverVietphraseCheck_ ? glossaryEntries : [],
            ...dataEntries
          ];

          data = Object.fromEntries(dataEntries);

          const dataLengths = [
            ...this.useGlossary_ && this.prioritizeNameOverVietphraseCheck_ ? glossaryEntries.map(([, second]) => second.length) : [],
            ...dataEntries.map(([first]) => first.length),
            1
          ].sort((a, b) => b - a).filter((element, index, array) => index === array.indexOf(element));

          for (let i = 0; i < lines.length; i++) {
            let chars = lines[i];

            if (chars.length === 0) {
              results.push(chars);
              continue;
            }

            let tempLine = '';
            let prevPhrase = '';

            for (let j = 0; j < chars.length; j++) {
              for (const dataLength of dataLengths) {
                const phrase = chars.substring(j, j + dataLength);

                if (this.useGlossary_ && this.prioritizeNameOverVietphraseCheck_ && glossaryEntries.map(([, second]) => second.length).indexOf(phrase) > -1) {
                  tempLine += (j > 0 && /[\p{Lu}\p{Ll}\p{Nd}]/u.test(prevPhrase || tempLine[tempLine.length - 1] || '') ? ' ' : '') + phrase;
                  prevPhrase = phrase;
                  j += dataLength - 1;
                  break;
                } else if (data.hasOwnProperty(phrase)) {
                  if (data[phrase].length > 0) {
                    tempLine += (j > 0 && /[\p{Lu}\p{Ll}\p{Nd}]/u.test(prevPhrase || tempLine[tempLine.length - 1] || '') ? ' ' : '') + data[phrase];
                    prevPhrase = data[phrase];
                  }

                  j += dataLength - 1;
                  break;
                } else if (dataLength === 1) {
                  tempLine += chars[j];
                  prevPhrase = '';
                  break;
                }
              }
            }

            results.push(tempLine);
          }
        }

        result = results.map((element) => this.caseSensitive_ ? element.replace(/(^\s*|\s*(?:[!\-.:;?。！．：；？]\s*|['"\p{Ps}\p{Pi}]\s*))(\p{Ll})/gu, (match, p1, p2) => p1 + p2.toUpperCase()) : element).join('\n');
        break;
    }

    return result;
  }
}