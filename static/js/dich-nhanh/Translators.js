/* eslint-disable max-classes-per-file */
// eslint-disable-next-line lines-around-directive
'use strict';

const Translators = {
  BAIDU_FANYI: 'baiduFanyi',
  DEEPL_TRANSLATE: 'deeplTranslate',
  GOOGLE_TRANSLATE: 'googleTranslate',
  PAPAGO: 'papago',
  MICROSOFT_TRANSLATOR: 'microsoftTranslator',
  VIETPHRASE: 'vietphrase',
};

class BaiduFanyi {
  static FROM_LANGUAGES = {
    auto: 'Automatic detection',
    jp: 'Japanese',
    en: 'English',
    vie: 'Vietnamese',
    zh: 'Chinese',
    cht: 'Traditional Chinese',
    yue: 'Cantonese',
    wyw: 'Classical Chinese',
  };

  static TO_LANGUAGES = {
    jp: 'Japanese',
    en: 'English',
    vie: 'Vietnamese',
    zh: 'Chinese',
    cht: 'Traditional Chinese',
    yue: 'Cantonese',
    wyw: 'Classical Chinese',
  };

  static AUTOMATIC_DETECTION = 'auto';

  static DefaultLanguage = {
    FROM: BaiduFanyi.AUTOMATIC_DETECTION,
    TO: 'vie',
  };

  static DEEPL_TRANSLATOR_MAPPING = {
    SOURCE_LANGUAGES: {
      auto: '',
      jp: 'JA',
      en: 'EN',
      zh: 'ZH',
      cht: 'ZH',
      yue: 'ZH',
      wyw: 'ZH',
    },
    TARGET_LANGUAGES: {
      jp: 'JA',
      en: 'EN-US',
      zh: 'ZH',
      cht: 'ZH',
      yue: 'ZH',
      wyw: 'ZH',
    },
  };

  static GOOGLE_TRANSLATE_MAPPING = {
    jp: 'ja',
    vie: 'vi',
    zh: 'zh-CN',
    cht: 'zh-TW',
    yue: 'zh-TW',
    wyw: 'ZH',
  };

  static PAPAGO_MAPPING = {
    jp: 'ja',
    vie: 'vi',
    zh: 'zh-CN',
    cht: 'zh-TW',
    yue: 'zh-TW',
    wyw: 'zh-CN',
  };

  static MICROSOFT_TRANSLATOR_MAPPING = {
    auto: '',
    jp: 'ja',
    vie: 'vi',
    zh: 'zh-Hans',
    cht: 'zh-Hant',
    wyw: 'lzh',
  };

  static getFromName(languageCode) {
    return BaiduFanyi.FROM_LANGUAGES[languageCode];
  }

  static getToName(languageCode) {
    return BaiduFanyi.TO_LANGUAGES[languageCode];
  }

  static getMappedSourceLanguageCode(translator, languageCode) {
    switch (translator) {
      case Translators.DEEPL_TRANSLATE: {
        return BaiduFanyi.DEEPL_TRANSLATOR_MAPPING.SOURCE_LANGUAGES[languageCode] ?? (DeeplTranslate.SOURCE_LANGUAGES.filter(({ language }) => language === languageCode).length > 0 ? languageCode : DeeplTranslate.DefaultLanguage.SOURCE_LANG);
      }
      case Translators.GOOGLE_TRANSLATE: {
        return BaiduFanyi.GOOGLE_TRANSLATE_MAPPING[languageCode] ?? (Object.hasOwn(GoogleTranslate.SOURCE_LANGUAGES, languageCode) ? languageCode : GoogleTranslate.DefaultLanguage.SL);
      }
      case Translators.PAPAGO: {
        return BaiduFanyi.PAPAGO_MAPPING[languageCode] ?? (Object.hasOwn(Papago.SOURCE_LANGUAGES, languageCode) ? languageCode : Papago.DefaultLanguage.SOURCE);
      }
      case Translators.MICROSOFT_TRANSLATOR: {
        return BaiduFanyi.MICROSOFT_TRANSLATOR_MAPPING[languageCode] ?? (Object.hasOwn(MicrosoftTranslator.FROM_LANGUAGES, languageCode) ? languageCode : MicrosoftTranslator.DefaultLanguage.FROM);
      }
      case Translators.VIETPHRASE: {
        return Vietphrase.DefaultLanguage.SOURCE_LANGUAGE;
      }
      default: {
        return null;
      }
    }
  }

  static getMappedTargetLanguageCode(translator, languageCode) {
    switch (translator) {
      case Translators.DEEPL_TRANSLATE: {
        return BaiduFanyi.DEEPL_TRANSLATOR_MAPPING.TARGET_LANGUAGES[languageCode] ?? (DeeplTranslate.TARGET_LANGUAGES.filter(({ language }) => language === languageCode).length > 0 ? languageCode : DeeplTranslate.DefaultLanguage.TARGET_LANG);
      }
      case Translators.GOOGLE_TRANSLATE: {
        return BaiduFanyi.GOOGLE_TRANSLATE_MAPPING[languageCode] ?? (Object.hasOwn(GoogleTranslate.TARGET_LANGUAGES, languageCode) ? languageCode : GoogleTranslate.DefaultLanguage.TL);
      }
      case Translators.PAPAGO: {
        return BaiduFanyi.PAPAGO_MAPPING[languageCode] ?? (Object.hasOwn(Papago.TARGET_LANGUAGES, languageCode) ? languageCode : Papago.DefaultLanguage.TARGET);
      }
      case Translators.MICROSOFT_TRANSLATOR: {
        return BaiduFanyi.MICROSOFT_TRANSLATOR_MAPPING[languageCode] ?? (Object.hasOwn(MicrosoftTranslator.TO_LANGUAGES, languageCode) ? languageCode : MicrosoftTranslator.DefaultLanguage.TO);
      }
      case Translators.VIETPHRASE: {
        return Vietphrase.DefaultLanguage.TARGET_LANGUAGE;
      }
      default: {
        return null;
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async translateText(from, to, query) {
    let result = query;

    if (query.replaceAll(/\n/g, '').length > 0) {
      try {
        let detectFrom = from;

        if (from === 'auto') {
          detectFrom = (await $.ajax({
            data: `query=${encodeURIComponent(query)}`,
            method: 'POST',
            url: `${Utils.CORS_PROXY}https://fanyi.baidu.com/langdetect`,
          })).lan;
        }

        let response = (await $.ajax({
          data: JSON.stringify({
            query,
            from: detectFrom,
            to,
            reference: '',
            corpusIds: [],
            qcSettings: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
            domain: 'common',
          }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
          url: `${Utils.CORS_PROXY}https://fanyi.baidu.com/ait/text/translate`,
        })).split('\n').filter((element) => element.includes('"event":"Translating"'));

        response = response.length > 0 ? JSON.parse(response[0].replace(/^data: /, '')) : {};
        result = response.data != null ? response.data.list.map((element) => element.dst).join('\n') : query;
      } catch (error) {
        console.error('Bản dịch lỗi:', error);
        throw error;
      }
    }

    return result;
  }
}

class DeeplTranslate {
  /** https://api-free.deepl.com/v2/languages?type=source */
  static SOURCE_LANGUAGES = [{
    language: '',
    name: 'Detect language',
  }, ...JSON.parse('[{"language":"BG","name":"Bulgarian"},{"language":"CS","name":"Czech"},{"language":"DA","name":"Danish"},{"language":"DE","name":"German"},{"language":"EL","name":"Greek"},{"language":"EN","name":"English"},{"language":"ES","name":"Spanish"},{"language":"ET","name":"Estonian"},{"language":"FI","name":"Finnish"},{"language":"FR","name":"French"},{"language":"HU","name":"Hungarian"},{"language":"ID","name":"Indonesian"},{"language":"IT","name":"Italian"},{"language":"JA","name":"Japanese"},{"language":"KO","name":"Korean"},{"language":"LT","name":"Lithuanian"},{"language":"LV","name":"Latvian"},{"language":"NB","name":"Norwegian"},{"language":"NL","name":"Dutch"},{"language":"PL","name":"Polish"},{"language":"PT","name":"Portuguese"},{"language":"RO","name":"Romanian"},{"language":"RU","name":"Russian"},{"language":"SK","name":"Slovak"},{"language":"SL","name":"Slovenian"},{"language":"SV","name":"Swedish"},{"language":"TR","name":"Turkish"},{"language":"UK","name":"Ukrainian"},{"language":"ZH","name":"Chinese"}]')];

  /** https://api-free.deepl.com/v2/languages?type=target */
  static TARGET_LANGUAGES = JSON.parse('[{"language":"BG","name":"Bulgarian","supports_formality":false},{"language":"CS","name":"Czech","supports_formality":false},{"language":"DA","name":"Danish","supports_formality":false},{"language":"DE","name":"German","supports_formality":true},{"language":"EL","name":"Greek","supports_formality":false},{"language":"EN-GB","name":"English (British)","supports_formality":false},{"language":"EN-US","name":"English (American)","supports_formality":false},{"language":"ES","name":"Spanish","supports_formality":true},{"language":"ET","name":"Estonian","supports_formality":false},{"language":"FI","name":"Finnish","supports_formality":false},{"language":"FR","name":"French","supports_formality":true},{"language":"HU","name":"Hungarian","supports_formality":false},{"language":"ID","name":"Indonesian","supports_formality":false},{"language":"IT","name":"Italian","supports_formality":true},{"language":"JA","name":"Japanese","supports_formality":true},{"language":"KO","name":"Korean","supports_formality":false},{"language":"LT","name":"Lithuanian","supports_formality":false},{"language":"LV","name":"Latvian","supports_formality":false},{"language":"NB","name":"Norwegian","supports_formality":false},{"language":"NL","name":"Dutch","supports_formality":true},{"language":"PL","name":"Polish","supports_formality":true},{"language":"PT-BR","name":"Portuguese (Brazilian)","supports_formality":true},{"language":"PT-PT","name":"Portuguese (European)","supports_formality":true},{"language":"RO","name":"Romanian","supports_formality":false},{"language":"RU","name":"Russian","supports_formality":true},{"language":"SK","name":"Slovak","supports_formality":false},{"language":"SL","name":"Slovenian","supports_formality":false},{"language":"SV","name":"Swedish","supports_formality":false},{"language":"TR","name":"Turkish","supports_formality":false},{"language":"UK","name":"Ukrainian","supports_formality":false},{"language":"ZH","name":"Chinese (simplified)","supports_formality":false}]');

  static DETECT_LANGUAGE = '';

  static DefaultLanguage = {
    SOURCE_LANG: DeeplTranslate.DETECT_LANGUAGE,
    TARGET_LANG: 'EN-US',
  };

  static BAIDU_FANYI_MAPPING = {
    '': 'auto',
    JA: 'jp',
    EN: 'en',
    ZH: 'zh',
  };

  static GOOGLE_TRANSLATE_MAPPING = {
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
    ZH: 'zh-CN',
  };

  static PAPAGO_MAPPING = {
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
    ZH: 'zh-CN',
  };

  static MICROSOFT_TRANSLATOR_MAPPING = {
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
    ZH: 'zh-Hans',
  };

  constructor(authKey) {
    this.authKey = authKey;
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
    return DeeplTranslate.SOURCE_LANGUAGES.filter(({ language }) => language === languageCode)[0].name;
  }

  static getTargetLangName(languageCode) {
    return DeeplTranslate.TARGET_LANGUAGES.filter(({ language }) => language === languageCode)[0].name;
  }

  static getMappedSourceLanguageCode(translator, languageCode) {
    switch (translator) {
      case Translators.BAIDU_FANYI: {
        return DeeplTranslate.BAIDU_FANYI_MAPPING[languageCode] ?? (Object.hasOwn(BaiduFanyi.FROM_LANGUAGES, languageCode) ? languageCode : BaiduFanyi.DefaultLanguage.FROM);
      }
      case Translators.GOOGLE_TRANSLATE: {
        return DeeplTranslate.GOOGLE_TRANSLATE_MAPPING[languageCode] ?? (Object.hasOwn(GoogleTranslate.SOURCE_LANGUAGES, languageCode) ? languageCode : GoogleTranslate.DefaultLanguage.SL);
      }
      case Translators.PAPAGO: {
        return DeeplTranslate.PAPAGO_MAPPING[languageCode] ?? (Object.hasOwn(Papago.SOURCE_LANGUAGES, languageCode) ? languageCode : Papago.DefaultLanguage.SOURCE);
      }
      case Translators.MICROSOFT_TRANSLATOR: {
        return DeeplTranslate.MICROSOFT_TRANSLATOR_MAPPING[languageCode] ?? (Object.hasOwn(MicrosoftTranslator.FROM_LANGUAGES, languageCode) ? languageCode : MicrosoftTranslator.DefaultLanguage.FROM);
      }
      case Translators.VIETPHRASE: {
        return Vietphrase.DefaultLanguage.SOURCE_LANGUAGE;
      }
      default: {
        return null;
      }
    }
  }

  static getMappedTargetLanguageCode(translator, languageCode) {
    switch (translator) {
      case Translators.BAIDU_FANYI: {
        return DeeplTranslate.BAIDU_FANYI_MAPPING[languageCode] ?? (Object.hasOwn(BaiduFanyi.TO_LANGUAGES, languageCode) ? languageCode : BaiduFanyi.DefaultLanguage.TO);
      }
      case Translators.GOOGLE_TRANSLATE: {
        return DeeplTranslate.GOOGLE_TRANSLATE_MAPPING[languageCode] ?? (Object.hasOwn(GoogleTranslate.TARGET_LANGUAGES, languageCode) ? languageCode : GoogleTranslate.DefaultLanguage.TL);
      }
      case Translators.PAPAGO: {
        return DeeplTranslate.PAPAGO_MAPPING[languageCode] ?? (Object.hasOwn(Papago.TARGET_LANGUAGES, languageCode) ? languageCode : Papago.DefaultLanguage.TARGET);
      }
      case Translators.MICROSOFT_TRANSLATOR: {
        return DeeplTranslate.MICROSOFT_TRANSLATOR_MAPPING[languageCode] ?? (Object.hasOwn(MicrosoftTranslator.TO_LANGUAGES, languageCode) ? languageCode : MicrosoftTranslator.DefaultLanguage.TO);
      }
      case Translators.VIETPHRASE: {
        return Vietphrase.DefaultLanguage.TARGET_LANGUAGE;
      }
      default: {
        return null;
      }
    }
  }

  async fetchUsage() {
    try {
      return await $.ajax({
        method: 'GET',
        url: `https://api-free.deepl.com/v2/usage?auth_key=${this.authKey}`,
      });
    } catch (error) {
      console.error('Không thể lấy được Mức sử dụng:', error);
      throw console.error('Không thể lấy được Mức sử dụng!');
    }
  }

  async translateText(sourceLang, targetLang, text) {
    try {
      return Utils.convertHtmlToText((await $.ajax({
        data: `text=${text.split('\n').map((element) => encodeURIComponent(element)).join('&text=')}&source_lang=${sourceLang}&target_lang=${targetLang}&tag_handling=xml`,
        method: 'POST',
        url: `https://api-free.deepl.com/v2/translate?auth_key=${this.authKey}`,
      })).translations.map((element) => element.text).join('\n'));
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      throw error;
    }
  }
}

class GoogleTranslate {
  /** https://translate.googleapis.com/translate_a/l?client=chrome */
  static SOURCE_LANGUAGES = JSON.parse('{"auto":"Phát hiện ngôn ngữ","ar":"Ả Rập","sq":"Albania","am":"Amharic","en":"Anh","hy":"Armenia","as":"Assam","ay":"Aymara","az":"Azerbaijan","pl":"Ba Lan","fa":"Ba Tư","bm":"Bambara","xh":"Bantu","eu":"Basque","be":"Belarus","bn":"Bengal","bho":"Bhojpuri","bs":"Bosnia","pt":"Bồ Đào Nha","bg":"Bulgaria","ca":"Catalan","ceb":"Cebuano","ny":"Chichewa","co":"Corsi","ht":"Creole (Haiti)","hr":"Croatia","dv":"Dhivehi","iw":"Do Thái","doi":"Dogri","da":"Đan Mạch","de":"Đức","et":"Estonia","ee":"Ewe","tl":"Filipino","fy":"Frisia","gd":"Gael Scotland","gl":"Galicia","ka":"George","gn":"Guarani","gu":"Gujarat","nl":"Hà Lan","af":"Hà Lan (Nam Phi)","ko":"Hàn","ha":"Hausa","haw":"Hawaii","hi":"Hindi","hmn":"Hmong","hu":"Hungary","el":"Hy Lạp","is":"Iceland","ig":"Igbo","ilo":"Ilocano","id":"Indonesia","ga":"Ireland","jw":"Java","kn":"Kannada","kk":"Kazakh","km":"Khmer","rw":"Kinyarwanda","gom":"Konkani","kri":"Krio","ku":"Kurd (Kurmanji)","ckb":"Kurd (Sorani)","ky":"Kyrgyz","lo":"Lào","la":"Latinh","lv":"Latvia","ln":"Lingala","lt":"Litva","lg":"Luganda","lb":"Luxembourg","ms":"Mã Lai","mk":"Macedonia","mai":"Maithili","mg":"Malagasy","ml":"Malayalam","mt":"Malta","mi":"Maori","mr":"Marathi","mni-Mtei":"Meiteilon (Manipuri)","lus":"Mizo","mn":"Mông Cổ","my":"Myanmar","no":"Na Uy","ne":"Nepal","ru":"Nga","ja":"Nhật","or":"Odia (Oriya)","om":"Oromo","ps":"Pashto","sa":"Phạn","fr":"Pháp","fi":"Phần Lan","pa":"Punjab","qu":"Quechua","eo":"Quốc tế ngữ","ro":"Rumani","sm":"Samoa","cs":"Séc","nso":"Sepedi","sr":"Serbia","st":"Sesotho","sn":"Shona","sd":"Sindhi","si":"Sinhala","sk":"Slovak","sl":"Slovenia","so":"Somali","su":"Sunda","sw":"Swahili","tg":"Tajik","ta":"Tamil","tt":"Tatar","es":"Tây Ban Nha","te":"Telugu","th":"Thái","tr":"Thổ Nhĩ Kỳ","sv":"Thụy Điển","ti":"Tigrinya","zh-CN":"Trung'.concat(' (Giản thể)","zh-TW":"Trung (Phồn thể)').concat('","ts":"Tsonga","tk":"Turkmen","ak":"Twi","uk":"Ukraina","ur":"Urdu","ug":"Uyghur","uz":"Uzbek","vi":"Việt","cy":"Xứ Wales","it":"Ý","yi":"Yiddish","yo":"Yoruba","zu":"Zulu"}'));

  static TARGET_LANGUAGES = JSON.parse('{"ar":"Ả Rập","sq":"Albania","am":"Amharic","en":"Anh","hy":"Armenia","as":"Assam","ay":"Aymara","az":"Azerbaijan","pl":"Ba Lan","fa":"Ba Tư","bm":"Bambara","xh":"Bantu","eu":"Basque","be":"Belarus","bn":"Bengal","bho":"Bhojpuri","bs":"Bosnia","pt":"Bồ Đào Nha","bg":"Bulgaria","ca":"Catalan","ceb":"Cebuano","ny":"Chichewa","co":"Corsi","ht":"Creole (Haiti)","hr":"Croatia","dv":"Dhivehi","iw":"Do Thái","doi":"Dogri","da":"Đan Mạch","de":"Đức","et":"Estonia","ee":"Ewe","tl":"Filipino","fy":"Frisia","gd":"Gael Scotland","gl":"Galicia","ka":"George","gn":"Guarani","gu":"Gujarat","nl":"Hà Lan","af":"Hà Lan (Nam Phi)","ko":"Hàn","ha":"Hausa","haw":"Hawaii","hi":"Hindi","hmn":"Hmong","hu":"Hungary","el":"Hy Lạp","is":"Iceland","ig":"Igbo","ilo":"Ilocano","id":"Indonesia","ga":"Ireland","jw":"Java","kn":"Kannada","kk":"Kazakh","km":"Khmer","rw":"Kinyarwanda","gom":"Konkani","kri":"Krio","ku":"Kurd (Kurmanji)","ckb":"Kurd (Sorani)","ky":"Kyrgyz","lo":"Lào","la":"Latinh","lv":"Latvia","ln":"Lingala","lt":"Litva","lg":"Luganda","lb":"Luxembourg","ms":"Mã Lai","mk":"Macedonia","mai":"Maithili","mg":"Malagasy","ml":"Malayalam","mt":"Malta","mi":"Maori","mr":"Marathi","mni-Mtei":"Meiteilon (Manipuri)","lus":"Mizo","mn":"Mông Cổ","my":"Myanmar","no":"Na Uy","ne":"Nepal","ru":"Nga","ja":"Nhật","or":"Odia (Oriya)","om":"Oromo","ps":"Pashto","sa":"Phạn","fr":"Pháp","fi":"Phần Lan","pa":"Punjab","qu":"Quechua","eo":"Quốc tế ngữ","ro":"Rumani","sm":"Samoa","cs":"Séc","nso":"Sepedi","sr":"Serbia","st":"Sesotho","sn":"Shona","sd":"Sindhi","si":"Sinhala","sk":"Slovak","sl":"Slovenia","so":"Somali","su":"Sunda","sw":"Swahili","tg":"Tajik","ta":"Tamil","tt":"Tatar","es":"Tây Ban Nha","te":"Telugu","th":"Thái","tr":"Thổ Nhĩ Kỳ","sv":"Thụy Điển","ti":"Tigrinya","zh-CN":"Trung (Giản thể)","zh-TW":"Trung (Phồn thể)","ts":"Tsonga","tk":"Turkmen","ak":"Twi","uk":"Ukraina","ur":"Urdu","ug":"Uyghur","uz":"Uzbek","vi":"Việt","cy":"Xứ Wales","it":"Ý","yi":"Yiddish","yo":"Yoruba","zu":"Zulu"}');

  static DETECT_LANGUAGE = 'auto';

  static DefaultLanguage = {
    SL: GoogleTranslate.DETECT_LANGUAGE,
    TL: 'vi',
  };

  static BAIDU_FANYI_MAPPING = {
    ja: 'jp',
    vi: 'vie',
    'zh-CN': 'zh',
    'zh-TW': 'cht',
  };

  static DEEPL_TRANSLATOR_MAPPING = {
    SOURCE_LANGUAGES: {
      auto: '',
      ja: 'JA',
      en: 'EN',
      'zh-CN': 'ZH',
    },
    TARGET_LANGUAGES: {
      ja: 'JA',
      en: 'EN-US',
      'zh-CN': 'ZH',
      'zh-TW': 'ZH',
    },
  };

  static MICROSOFT_TRANSLATOR_MAPPING = {
    auto: '',
    'zh-CN': 'zh-Hans',
    'zh-TW': 'zh-Hant',
  };

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
      case Translators.BAIDU_FANYI: {
        return GoogleTranslate.BAIDU_FANYI_MAPPING[languageCode] ?? (Object.hasOwn(BaiduFanyi.FROM_LANGUAGES, languageCode) ? languageCode : BaiduFanyi.DefaultLanguage.FROM);
      }
      case Translators.DEEPL_TRANSLATE: {
        return GoogleTranslate.DEEPL_TRANSLATOR_MAPPING.SOURCE_LANGUAGES[languageCode] ?? (DeeplTranslate.SOURCE_LANGUAGES.filter(({ language }) => language === languageCode).length > 0 ? languageCode : DeeplTranslate.DefaultLanguage.SOURCE_LANG);
      }
      case Translators.PAPAGO: {
        return Object.hasOwn(Papago.SOURCE_LANGUAGES, languageCode) ? languageCode : Papago.DefaultLanguage.SOURCE;
      }
      case Translators.MICROSOFT_TRANSLATOR: {
        return GoogleTranslate.MICROSOFT_TRANSLATOR_MAPPING[languageCode] ?? (Object.hasOwn(MicrosoftTranslator.FROM_LANGUAGES, languageCode) ? languageCode : MicrosoftTranslator.DefaultLanguage.FROM);
      }
      case Translators.VIETPHRASE: {
        return Vietphrase.DefaultLanguage.SOURCE_LANGUAGE;
      }
      default: {
        return null;
      }
    }
  }

  static getMappedTargetLanguageCode(translator, languageCode) {
    switch (translator) {
      case Translators.BAIDU_FANYI: {
        return GoogleTranslate.BAIDU_FANYI_MAPPING[languageCode] ?? (Object.hasOwn(BaiduFanyi.TO_LANGUAGES, languageCode) ? languageCode : BaiduFanyi.DefaultLanguage.TO);
      }
      case Translators.DEEPL_TRANSLATE: {
        return GoogleTranslate.DEEPL_TRANSLATOR_MAPPING.TARGET_LANGUAGES[languageCode] ?? (DeeplTranslate.TARGET_LANGUAGES.filter(({ language }) => language === languageCode).length > 0 ? languageCode : DeeplTranslate.DefaultLanguage.TARGET_LANG);
      }
      case Translators.PAPAGO: {
        return Object.hasOwn(Papago.TARGET_LANGUAGES, languageCode) ? languageCode : Papago.DefaultLanguage.TARGET;
      }
      case Translators.MICROSOFT_TRANSLATOR: {
        return GoogleTranslate.MICROSOFT_TRANSLATOR_MAPPING[languageCode] ?? (Object.hasOwn(MicrosoftTranslator.TO_LANGUAGES, languageCode) ? languageCode : MicrosoftTranslator.DefaultLanguage.TO);
      }
      case Translators.VIETPHRASE: {
        return Vietphrase.DefaultLanguage.TARGET_LANGUAGE;
      }
      default: {
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
        headers: { 'Google-Translate-Element-Mode': 'library' },
        method: 'GET',
        url: `${Utils.CORS_PROXY}https://translate.googleapis.com/translate_a/element.js?aus=true&hl=vi${this.apiKey.length > 0 ? `&key=${this.apiKey}` : ''}`,
      });
      this.kq = () => elementJs.match(/c\._ctkk='(\d+\.\d+)'/)[1];
      // console.log(elementJs.match(/_loadJs\('([^']+)'\)/)[1]);
      return {
        _cac: elementJs.match(/c\._cac='([a-z]*)'/)[1],
        _cam: elementJs.match(/c\._cam='([a-z]*)'/)[1],
        v: elementJs.match(/_exportVersion\('(TE_\d+)'\)/)[1],
      };
    } catch (error) {
      console.error('Không thể lấy được Google Translate Element:', error);
      throw console.error('Không thể lấy được Google Translate Element!');
    }
  }

  /* eslint-disable */

  static Oo(a) {
    for (var b = [], c = 0, d = 0; d < a.length; d++) {
      var e = a.charCodeAt(d);
      128 > e ? (b[c++] = e) : (2048 > e ? (b[c++] = (e >> 6) | 192) : (55296 === (e & 64512) && d + 1 < a.length && 56320 === (a.charCodeAt(d + 1) & 64512) ? ((e = 65536 + ((e & 1023) << 10) + (a.charCodeAt(++d) & 1023)), (b[c++] = (e >> 18) | 240), (b[c++] = ((e >> 12) & 63) | 128)) : (b[c++] = (e >> 12) | 224), (b[c++] = ((e >> 6) & 63) | 128)), (b[c++] = (e & 63) | 128));
    }
    return b;
  }

  static jq(a, b) {
    for (var c = 0; c < b.length - 2; c += 3) {
      var d = b.charAt(c + 2);
      d = 'a' <= d ? d.charCodeAt(0) - 87 : Number(d);
      d = '+' === b.charAt(c + 1) ? a >>> d : a << d;
      a = '+' === b.charAt(c) ? (a + d) & 4294967295 : a ^ d;
    }
    return a;
  }

  lq(a) {
    var b = this.kq().split('.'),
      c = Number(b[0]) || 0;
    a = GoogleTranslate.Oo(a);
    for (var d = c, e = 0; e < a.length; e++) {
      (d += a[e]), (d = GoogleTranslate.jq(d, '+-a^+6'));
    }
    d = GoogleTranslate.jq(d, '+-3^+b+-f');
    d ^= Number(b[1]) || 0;
    0 > d && (d = (d & 2147483647) + 2147483648);
    b = d % 1e6;
    return b.toString() + '.' + (b ^ c);
  }

  /* eslint-enable */

  async translateText(sl, tl, q) {
    try {
      /**
       * Google translate Widget
       * Method: POST
       * URL: https://translate.googleapis.com/translate_a/t?anno=3&client=te&format=html&v=1.0&key&logld=v${version}&sl=${sl}&tl=${tl}&tc=0&tk=${lq(querys)}
       * `q=${querys.split('\n').map((sentence) => encodeURIComponent(sentence)).join('&q=')}`
       *
       * Google Translate
       * Method: GET
       * URL: https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&hl=vi&dt=t&dt=bd&dj=1&q=${encodeURIComponent(querys)}
       *
       * Google Translate Websites
       * Method: POST
       * URL: https://translate.googleapis.com/translate_a/t?anno=3&client=wt_lib&format=html&v=1.0&key=&logld=v${version}&sl=${sl}&tl=${tl}&tc=0&tk=${lq(querys)}
       * Content-Type: application/x-www-form-urlencoded - `q=${querys.split('\n').map((sentence) => encodeURIComponent(sentence)).join('&q=')}`
       *
       * Google Chrome
       * Method: POST
       * URL: https://translate.googleapis.com/translate_a/t?anno=3&client=${(_cac || 'te') + (_cam === 'lib' ? '_lib' : '')}&format=html&v=1.0&key=AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw&logld=v${v || ''}&sl=${sl}&tl=${tl}&tc=0&tk=${lq(querys)}
       * Content-Type: application/x-www-form-urlencoded - `q=${querys.split('\n').map((sentence) => encodeURIComponent(sentence)).join('&q=')}`
       */
      return Utils.convertHtmlToText((await $.ajax({
        data: `q=${q.split('\n').map((element) => encodeURIComponent(element)).join('&q=')}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        method: 'POST',
        url: `https://translate.googleapis.com/translate_a/t?anno=2&client=${(this.data._cac || 'te') + (this.data._cam === 'lib' ? '_lib' : '')}&format=html&v=1.0&key${this.apiKey.length > 0 ? `=${this.apiKey}` : ''}&logld=v${this.data.v || ''}&sl=${sl}&tl=${tl}&tc=0&tk=${this.lq(q.replaceAll(/\n/g, ''))}`,
      })).map((element) => (sl === 'auto' ? element[0] : element)).join('\n'));
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      throw error;
    }
  }
}

class Papago {
  static SOURCE_LANGUAGES = {
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
    hi: 'Hindi',
  };

  static TARGET_LANGUAGES = {
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
    hi: 'Hindi',
  };

  static DETECT_LANGUAGE = 'auto';

  static DefaultLanguage = {
    SOURCE: Papago.DETECT_LANGUAGE,
    TARGET: 'vi',
  };

  static BAIDU_FANYI_MAPPING = {
    ja: 'jp',
    vi: 'vie',
    'zh-CN': 'zh',
    'zh-TW': 'cht',
  };

  static DEEPL_TRANSLATOR_MAPPING = {
    SOURCE_LANGUAGES: {
      '': 'auto',
      en: 'EN',
      ja: 'JA',
      'zh-CN': 'ZH',
      'zh-TW': 'ZH',
    },
    TARGET_LANGUAGES: {
      en: 'EN-US',
      ja: 'JA',
      'zh-CN': 'ZH',
      'zh-TW': 'ZH',
    },
  };

  static MICROSOFT_TRANSLATOR_MAPPING = {
    auto: '',
    'zh-CN': 'zh-Hans',
    'zh-TW': 'zh-Hant',
  };

  constructor(uuid) {
    this.uuid = uuid;
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
      case Translators.BAIDU_FANYI: {
        return Papago.BAIDU_FANYI_MAPPING[languageCode] ?? (Object.hasOwn(BaiduFanyi.FROM_LANGUAGES, languageCode) ? languageCode : BaiduFanyi.DefaultLanguage.FROM);
      }
      case Translators.DEEPL_TRANSLATE: {
        return Papago.DEEPL_TRANSLATOR_MAPPING.SOURCE_LANGUAGES[languageCode] ?? (DeeplTranslate.SOURCE_LANGUAGES.filter(({ language }) => language === languageCode).length > 0 ? languageCode : DeeplTranslate.DefaultLanguage.SOURCE_LANG);
      }
      case Translators.GOOGLE_TRANSLATE: {
        const maybeIsChineseTraditional = languageCode === 'zh-TW' ? 'zh-TW' : GoogleTranslate.DefaultLanguage.SL;
        return Object.hasOwn(GoogleTranslate.SOURCE_LANGUAGES, languageCode) ? languageCode : maybeIsChineseTraditional;
      }
      case Translators.MICROSOFT_TRANSLATOR: {
        return Papago.MICROSOFT_TRANSLATOR_MAPPING[languageCode] ?? (Object.hasOwn(MicrosoftTranslator.FROM_LANGUAGES, languageCode) ? languageCode : MicrosoftTranslator.DefaultLanguage.FROM);
      }
      case Translators.VIETPHRASE: {
        return Vietphrase.DefaultLanguage.SOURCE_LANGUAGE;
      }
      default: {
        return null;
      }
    }
  }

  static getMappedTargetLanguageCode(translator, languageCode) {
    switch (translator) {
      case Translators.BAIDU_FANYI: {
        return Papago.BAIDU_FANYI_MAPPING[languageCode] ?? (Object.hasOwn(BaiduFanyi.TO_LANGUAGES, languageCode) ? languageCode : BaiduFanyi.DefaultLanguage.TO);
      }
      case Translators.DEEPL_TRANSLATE: {
        return Papago.DEEPL_TRANSLATOR_MAPPING.TARGET_LANGUAGES[languageCode] ?? (DeeplTranslate.TARGET_LANGUAGES.filter(({ language }) => language === languageCode).length > 0 ? languageCode : DeeplTranslate.DefaultLanguage.TARGET_LANG);
      }
      case Translators.GOOGLE_TRANSLATE: {
        return Object.hasOwn(Papago.TARGET_LANGUAGES, languageCode) ? languageCode : GoogleTranslate.DefaultLanguage.TL;
      }
      case Translators.MICROSOFT_TRANSLATOR: {
        return Papago.MICROSOFT_TRANSLATOR_MAPPING[languageCode] ?? (Object.hasOwn(MicrosoftTranslator.TO_LANGUAGES, languageCode) ? languageCode : MicrosoftTranslator.DefaultLanguage.TO);
      }
      case Translators.VIETPHRASE: {
        return Vietphrase.DefaultLanguage.TARGET_LANGUAGE;
      }
      default: {
        return null;
      }
    }
  }

  static async fetchVersion() {
    try {
      const mainJs = (await $.ajax({
        method: 'GET',
        url: `${Utils.CORS_PROXY}https://papago.naver.com`,
      })).match(/\/(main.*\.js)/)[1];
      return (await $.ajax({
        method: 'GET',
        url: `${Utils.CORS_PROXY}https://papago.naver.com/${mainJs}`,
      })).match(/"PPG .*,"(v[^"]*)/)[1];
    } catch (error) {
      console.error('Không thể lấy được Thông tin phiên bản:', error);
      throw console.error('Không thể lấy được Thông tin phiên bản!');
    }
  }

  async translateText(source, target, text) {
    try {
      const timeStamp = (new Date()).getTime();

      return (await $.ajax({
        data: `deviceId=${this.uuid}&locale=vi&dict=true&dictDisplay=30&honorific=true&instant=false&paging=false&source=${source}&target=${target}&text=${encodeURIComponent(text)}`,
        headers: {
          Accept: 'application/json',
          'Accept-Language': 'vi',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', // 'device-type': 'pc',
          // 'device-type': 'mobile',
          'x-apigw-partnerid': 'papago', /* eslint-disable */

          Authorization: 'PPG ' + this.uuid + ':' + window.CryptoJS.HmacMD5(this.uuid + '\n' + 'https://papago.naver.com/apis/n2mt/translate' + '\n' + timeStamp, this.version).toString(window.CryptoJS.enc.Base64),

          /* eslint-enable */
          Timestamp: timeStamp,
        },
        method: 'POST',
        url: `${Utils.CORS_PROXY}https://papago.naver.com/apis/n2mt/translate`,
      })).translatedText;
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      throw error;
    }
  }
}

class MicrosoftTranslator {
  /** https://api.cognitive.microsofttranslator.com/languages?api-version=3.0 */
  static FROM_LANGUAGES = { '': { name: 'Tự phát hiện' }, ...JSON.parse('{"af":{"name":"Tiếng Afrikaans","nativeName":"Afrikaans","dir":"ltr"},"am":{"name":"Tiếng Amharic","nativeName":"አማርኛ","dir":"ltr"},"ar":{"name":"Tiếng Ả Rập","nativeName":"العربية","dir":"rtl"},"as":{"name":"Tiếng Assam","nativeName":"অসমীয়া","dir":"ltr"},"az":{"name":"Tiếng Azerbaijan","nativeName":"Azərbaycan","dir":"ltr"},"ba":{"name":"Tiếng Bashkir","nativeName":"Bashkir","dir":"ltr"},"bg":{"name":"Tiếng Bulgaria","nativeName":"Български","dir":"ltr"},"bho":{"name":"Bhojpuri","nativeName":"Bhojpuri","dir":"ltr"},"bn":{"name":"Tiếng Bangla","nativeName":"বাংলা","dir":"ltr"},"bo":{"name":"Tiếng Tây Tạng","nativeName":"བོད་སྐད་","dir":"ltr"},"brx":{"name":"Bodo","nativeName":"बड़ो","dir":"ltr"},"bs":{"name":"Tiếng Bosnia","nativeName":"Bosnian","dir":"ltr"},"ca":{"name":"Tiếng Catalan","nativeName":"Català","dir":"ltr"},"cs":{"name":"Tiếng Séc","nativeName":"Čeština","dir":"ltr"},"cy":{"name":"Tiếng Wales","nativeName":"Cymraeg","dir":"ltr"},"da":{"name":"Tiếng Đan Mạch","nativeName":"Dansk","dir":"ltr"},"de":{"name":"Tiếng Đức","nativeName":"Deutsch","dir":"ltr"},"doi":{"name":"Dogri","nativeName":"Dogri","dir":"ltr"},"dsb":{"name":"Tiếng Hạ Sorbia","nativeName":"Dolnoserbšćina","dir":"ltr"},"dv":{"name":"Tiếng Divehi","nativeName":"ދިވެހިބަސް","dir":"rtl"},"el":{"name":"Tiếng Hy Lạp","nativeName":"Ελληνικά","dir":"ltr"},"en":{"name":"Tiếng Anh","nativeName":"English","dir":"ltr"},"es":{"name":"Tiếng Tây Ban Nha","nativeName":"Español","dir":"ltr"},"et":{"name":"Tiếng Estonia","nativeName":"Eesti","dir":"ltr"},"eu":{"name":"Tiếng Basque","nativeName":"Euskara","dir":"ltr"},"fa":{"name":"Tiếng Ba Tư","nativeName":"فارسی","dir":"rtl"},"fi":{"name":"Tiếng Phần Lan","nativeName":"Suomi","dir":"ltr"},"fil":{"name":"Tiếng Philippines","nativeName":"Filipino","dir":"ltr"},"fj":{"name":"Tiếng Fiji","nativeName":"Na Vosa Vakaviti","dir":"ltr"},"fo":{"name":"Tiếng Faroe","nativeName":"Føroyskt","dir":"ltr"},"fr":{"name":"Tiếng Pháp","nativeName":"Français","dir":"ltr"},"fr-CA":{"name":"Tiếng Pháp (Canada)","nativeName":"Français (Canada)","dir":"ltr"},"ga":{"name":"Tiếng Ireland","nativeName":"Gaeilge","dir":"ltr"},"gl":{"name":"Tiếng Galician","nativeName":"Galego","dir":"ltr"},"gom":{"name":"Konkani","nativeName":"Konkani","dir":"ltr"},"gu":{"name":"Tiếng Gujarati","nativeName":"ગુજરાતી","dir":"ltr"},"ha":{"name":"Tiếng Hausa","nativeName":"Hausa","dir":"ltr"},"he":{"name":"Tiếng Do Thái","nativeName":"עברית","dir":"rtl"},"hi":{"name":"Tiếng Hindi","nativeName":"हिन्दी","dir":"ltr"},"hr":{"name":"Tiếng Croatia","nativeName":"Hrvatski","dir":"ltr"},"hsb":{"name":"Tiếng Thượng Sorbia","nativeName":"Hornjoserbšćina","dir":"ltr"},"ht":{"name":"Tiếng Haiti","nativeName":"Haitian Creole","dir":"ltr"},"hu":{"name":"Tiếng Hungary","nativeName":"Magyar","dir":"ltr"},"hy":{"name":"Tiếng Armenia","nativeName":"Հայերեն","dir":"ltr"},"id":{"name":"Tiếng Indonesia","nativeName":"Indonesia","dir":"ltr"},"ig":{"name":"Tiếng Igbo","nativeName":"Ásụ̀sụ́ Ìgbò","dir":"ltr"},"ikt":{"name":"Inuinnaqtun","nativeName":"Inuinnaqtun","dir":"ltr"},"is":{"name":"Tiếng Iceland","nativeName":"Íslenska","dir":"ltr"},"it":{"name":"Tiếng Italy","nativeName":"Italiano","dir":"ltr"},"iu":{"name":"Tiếng Inuktitut","nativeName":"ᐃᓄᒃᑎᑐᑦ","dir":"ltr"},"iu-Latn":{"name":"Inuktitut (Latin)","nativeName":"Inuktitut (Latin)","dir":"ltr"},"ja":{"name":"Tiếng Nhật","nativeName":"日本語","dir":"ltr"},"ka":{"name":"Tiếng Georgia","nativeName":"ქართული","dir":"ltr"},"kk":{"name":"Tiếng Kazakh","nativeName":"Қазақ Тілі","dir":"ltr"},"km":{"name":"Tiếng Khmer","nativeName":"ខ្មែរ","dir":"ltr"},"kmr":{"name":"Tiếng Kurd (Bắc)","nativeName":"Kurdî (Bakur)","dir":"ltr"},"kn":{"name":"Tiếng Kannada","nativeName":"ಕನ್ನಡ","dir":"ltr"},"ko":{"name":"Tiếng Hàn","nativeName":"한국어","dir":"ltr"},"ks":{"name":"Kashmiri","nativeName":"کٲشُر","dir":"rtl"},"ku":{"name":"Tiếng Kurd (Trung)","nativeName":"Kurdî (Navîn)","dir":"rtl"},"ky":{"name":"Tiếng Kyrgyz","nativeName":"Кыргызча","dir":"ltr"},"ln":{"name":"Tiếng Lingala","nativeName":"Lingála","dir":"ltr"},"lo":{"name":"Tiếng Lào","nativeName":"ລາວ","dir":"ltr"},"lt":{"name":"Tiếng Litva","nativeName":"Lietuvių","dir":"ltr"},"lug":{"name":"Ganda","nativeName":"Ganda","dir":"ltr"},"lv":{"name":"Tiếng Latvia","nativeName":"Latviešu","dir":"ltr"},"lzh":{"name":"Chinese (Literary)","nativeName":"中文 (文言文)","dir":"ltr"},"mai":{"name":"Tiếng Maithili","nativeName":"Maithili","dir":"ltr"},"mg":{"name":"Tiếng Malagasy","nativeName":"Malagasy","dir":"ltr"},"mi":{"name":"Tiếng Maori","nativeName":"Te Reo Māori","dir":"ltr"},"mk":{"name":"Tiếng Macedonia","nativeName":"Македонски","dir":"ltr"},"ml":{"name":"Tiếng Malayalam","nativeName":"മലയാളം","dir":"ltr"},"mn-Cyrl":{"name":"Mongolian (Cyrillic)","nativeName":"Mongolian (Cyrillic)","dir":"ltr"},"mn-Mong":{"name":"Mongolian (Traditional)","nativeName":"ᠮᠣᠩᠭᠣᠯ ᠬᠡᠯᠡ","dir":"ltr"},"mr":{"name":"Tiếng Marathi","nativeName":"मराठी","dir":"ltr"},"ms":{"name":"Tiếng Mã Lai","nativeName":"Melayu","dir":"ltr"},"mt":{"name":"Tiếng Malta","nativeName":"Malti","dir":"ltr"},"mww":{"name":"Tiếng H’Mông","nativeName":"Hmong Daw","dir":"ltr"},"my":{"name":"Tiếng Miến Điện","nativeName":"မြန်မာ","dir":"ltr"},"nb":{"name":"Tiếng Na Uy (Bokmål)","nativeName":"Norsk Bokmål","dir":"ltr"},"ne":{"name":"Tiếng Nepal","nativeName":"नेपाली","dir":"ltr"},"nl":{"name":"Tiếng Hà Lan","nativeName":"Nederlands","dir":"ltr"},"nso":{"name":"Sesotho sa Leboa","nativeName":"Sesotho sa Leboa","dir":"ltr"},"nya":{"name":"Nyanja","nativeName":"Nyanja","dir":"ltr"},"or":{"name":"Tiếng Odia","nativeName":"ଓଡ଼ିଆ","dir":"ltr"},"otq":{"name":"Tiếng Querétaro Otomi","nativeName":"Hñähñu","dir":"ltr"},"pa":{"name":"Tiếng Punjab","nativeName":"ਪੰਜਾਬੀ","dir":"ltr"},"pl":{"name":"Tiếng Ba Lan","nativeName":"Polski","dir":"ltr"},"prs":{"name":"Tiếng Dari","nativeName":"دری","dir":"rtl"},"ps":{"name":"Tiếng Pashto","nativeName":"پښتو","dir":"rtl"},"pt":{"name":"Tiếng Bồ Đào Nha (Brazil)","nativeName":"Português (Brasil)","dir":"ltr"},"pt-PT":{"name":"Tiếng Bồ Đào Nha (Bồ Đào Nha)","nativeName":"Português (Portugal)","dir":"ltr"},"ro":{"name":"Tiếng Romania","nativeName":"Română","dir":"ltr"},"ru":{"name":"Tiếng Nga","nativeName":"Русский","dir":"ltr"},"run":{"name":"Rundi","nativeName":"Rundi","dir":"ltr"},"rw":{"name":"Tiếng Kinyarwanda","nativeName":"Kinyarwanda","dir":"ltr"},"sd":{"name":"Tiếng Sindhi","nativeName":"سنڌي","dir":"rtl"},"si":{"name":"Tiếng Sinhala","nativeName":"සිංහල","dir":"ltr"},"sk":{"name":"Tiếng Slovak","nativeName":"Slovenčina","dir":"ltr"},"sl":{"name":"Tiếng Slovenia","nativeName":"Slovenščina","dir":"ltr"},"sm":{"name":"Tiếng Samoa","nativeName":"Gagana Sāmoa","dir":"ltr"},"sn":{"name":"Tiếng Shona","nativeName":"chiShona","dir":"ltr"},"so":{"name":"Tiếng Somali","nativeName":"Soomaali","dir":"ltr"},"sq":{"name":"Tiếng Albania","nativeName":"Shqip","dir":"ltr"},"sr-Cyrl":{"name":"Tiếng Serbia (Chữ Kirin)","nativeName":"Српски (ћирилица)","dir":"ltr"},"sr-Latn":{"name":"Tiếng Serbia (Chữ La Tinh)","nativeName":"Srpski (latinica)","dir":"ltr"},"st":{"name":"Sesotho","nativeName":"Sesotho","dir":"ltr"},"sv":{"name":"Tiếng Thụy Điển","nativeName":"Svenska","dir":"ltr"},"sw":{"name":"Tiếng Swahili","nativeName":"Kiswahili","dir":"ltr"},"ta":{"name":"Tiếng Tamil","nativeName":"தமிழ்","dir":"ltr"},"te":{"name":"Tiếng Telugu","nativeName":"తెలుగు","dir":"ltr"},"th":{"name":"Tiếng Thái","nativeName":"ไทย","dir":"ltr"},"ti":{"name":"Tiếng Tigrinya","nativeName":"ትግር","dir":"ltr"},"tk":{"name":"Tiếng Turkmen","nativeName":"Türkmen Dili","dir":"ltr"},"tlh-Latn":{"name":"Tiếng Klingon (Chữ La Tinh)","nativeName":"Klingon (Latin)","dir":"ltr"},"tlh-Piqd":{"name":"Tiếng Klingon (pIqaD)","nativeName":"Klingon (pIqaD)","dir":"ltr"},"tn":{"name":"Setswana","nativeName":"Setswana","dir":"ltr"},"to":{"name":"Tiếng Tonga","nativeName":"Lea Fakatonga","dir":"ltr"},"tr":{"name":"Tiếng Thổ Nhĩ Kỳ","nativeName":"Türkçe","dir":"ltr"},"tt":{"name":"Tiếng Tatar","nativeName":"Татар","dir":"ltr"},"ty":{"name":"Tiếng Tahiti","nativeName":"Reo Tahiti","dir":"ltr"},"ug":{"name":"Tiếng Uyghur","nativeName":"ئۇيغۇرچە","dir":"rtl"},"uk":{"name":"Tiếng Ukraina","nativeName":"Українська","dir":"ltr"},"ur":{"name":"Tiếng Urdu","nativeName":"اردو","dir":"rtl"},"uz":{"name":"Tiếng Uzbek","nativeName":"Uzbek (Latin)","dir":"ltr"},"vi":{"name":"Tiếng Việt","nativeName":"Tiếng Việt","dir":"ltr"},"xh":{"name":"Tiếng Xhosa","nativeName":"isiXhosa","dir":"ltr"},"yo":{"name":"Tiếng Yoruba","nativeName":"Èdè Yorùbá","dir":"ltr"},"yua":{"name":"Tiếng Maya Yucatec","nativeName":"Yucatec Maya","dir":"ltr"},"yue":{"name":"Tiếng Quảng Đông (Phồn Thể)","nativeName":"粵語 (繁體)","dir":"ltr"},"zh-Hans":{"name":"Tiếng Trung (Giản Thể)","nativeName":"中文 (简体)","dir":"ltr"},"zh-Hant":{"name":"Tiếng Trung (Phồn Thể)","nativeName":"繁體中文 (繁體)","dir":"ltr"},"zu":{"name":"Tiếng Zulu","nativeName":"Isi-Zulu","dir":"ltr"}}') };

  static TO_LANGUAGES = JSON.parse('{"af":{"name":"Tiếng Afrikaans","nativeName":"Afrikaans","dir":"ltr"},"am":{"name":"Tiếng Amharic","nativeName":"አማርኛ","dir":"ltr"},"ar":{"name":"Tiếng Ả Rập","nativeName":"العربية","dir":"rtl"},"as":{"name":"Tiếng Assam","nativeName":"অসমীয়া","dir":"ltr"},"az":{"name":"Tiếng Azerbaijan","nativeName":"Azərbaycan","dir":"ltr"},"ba":{"name":"Tiếng Bashkir","nativeName":"Bashkir","dir":"ltr"},"bg":{"name":"Tiếng Bulgaria","nativeName":"Български","dir":"ltr"},"bho":{"name":"Bhojpuri","nativeName":"Bhojpuri","dir":"ltr"},"bn":{"name":"Tiếng Bangla","nativeName":"বাংলা","dir":"ltr"},"bo":{"name":"Tiếng Tây Tạng","nativeName":"བོད་སྐད་","dir":"ltr"},"brx":{"name":"Bodo","nativeName":"बड़ो","dir":"ltr"},"bs":{"name":"Tiếng Bosnia","nativeName":"Bosnian","dir":"ltr"},"ca":{"name":"Tiếng Catalan","nativeName":"Català","dir":"ltr"},"cs":{"name":"Tiếng Séc","nativeName":"Čeština","dir":"ltr"},"cy":{"name":"Tiếng Wales","nativeName":"Cymraeg","dir":"ltr"},"da":{"name":"Tiếng Đan Mạch","nativeName":"Dansk","dir":"ltr"},"de":{"name":"Tiếng Đức","nativeName":"Deutsch","dir":"ltr"},"doi":{"name":"Dogri","nativeName":"Dogri","dir":"ltr"},"dsb":{"name":"Tiếng Hạ Sorbia","nativeName":"Dolnoserbšćina","dir":"ltr"},"dv":{"name":"Tiếng Divehi","nativeName":"ދިވެހިބަސް","dir":"rtl"},"el":{"name":"Tiếng Hy Lạp","nativeName":"Ελληνικά","dir":"ltr"},"en":{"name":"Tiếng Anh","nativeName":"English","dir":"ltr"},"es":{"name":"Tiếng Tây Ban Nha","nativeName":"Español","dir":"ltr"},"et":{"name":"Tiếng Estonia","nativeName":"Eesti","dir":"ltr"},"eu":{"name":"Tiếng Basque","nativeName":"Euskara","dir":"ltr"},"fa":{"name":"Tiếng Ba Tư","nativeName":"فارسی","dir":"rtl"},"fi":{"name":"Tiếng Phần Lan","nativeName":"Suomi","dir":"ltr"},"fil":{"name":"Tiếng Philippines","nativeName":"Filipino","dir":"ltr"},"fj":{"name":"Tiếng Fiji","nativeName":"Na Vosa Vakaviti","dir":"ltr"},"fo":{"name":"Tiếng Faroe","nativeName":"Føroyskt","dir":"ltr"},"fr":{"name":"Tiếng Pháp","nativeName":"Français","dir":"ltr"},"fr-CA":{"name":"Tiếng Pháp (Canada)","nativeName":"Français (Canada)","dir":"ltr"},"ga":{"name":"Tiếng Ireland","nativeName":"Gaeilge","dir":"ltr"},"gl":{"name":"Tiếng Galician","nativeName":"Galego","dir":"ltr"},"gom":{"name":"Konkani","nativeName":"Konkani","dir":"ltr"},"gu":{"name":"Tiếng Gujarati","nativeName":"ગુજરાતી","dir":"ltr"},"ha":{"name":"Tiếng Hausa","nativeName":"Hausa","dir":"ltr"},"he":{"name":"Tiếng Do Thái","nativeName":"עברית","dir":"rtl"},"hi":{"name":"Tiếng Hindi","nativeName":"हिन्दी","dir":"ltr"},"hr":{"name":"Tiếng Croatia","nativeName":"Hrvatski","dir":"ltr"},"hsb":{"name":"Tiếng Thượng Sorbia","nativeName":"Hornjoserbšćina","dir":"ltr"},"ht":{"name":"Tiếng Haiti","nativeName":"Haitian Creole","dir":"ltr"},"hu":{"name":"Tiếng Hungary","nativeName":"Magyar","dir":"ltr"},"hy":{"name":"Tiếng Armenia","nativeName":"Հայերեն","dir":"ltr"},"id":{"name":"Tiếng Indonesia","nativeName":"Indonesia","dir":"ltr"},"ig":{"name":"Tiếng Igbo","nativeName":"Ásụ̀sụ́ Ìgbò","dir":"ltr"},"ikt":{"name":"Inuinnaqtun","nativeName":"Inuinnaqtun","dir":"ltr"},"is":{"name":"Tiếng Iceland","nativeName":"Íslenska","dir":"ltr"},"it":{"name":"Tiếng Italy","nativeName":"Italiano","dir":"ltr"},"iu":{"name":"Tiếng Inuktitut","nativeName":"ᐃᓄᒃᑎᑐᑦ","dir":"ltr"},"iu-Latn":{"name":"Inuktitut (Latin)","nativeName":"Inuktitut (Latin)","dir":"ltr"},"ja":{"name":"Tiếng Nhật","nativeName":"日本語","dir":"ltr"},"ka":{"name":"Tiếng Georgia","nativeName":"ქართული","dir":"ltr"},"kk":{"name":"Tiếng Kazakh","nativeName":"Қазақ Тілі","dir":"ltr"},"km":{"name":"Tiếng Khmer","nativeName":"ខ្មែរ","dir":"ltr"},"kmr":{"name":"Tiếng Kurd (Bắc)","nativeName":"Kurdî (Bakur)","dir":"ltr"},"kn":{"name":"Tiếng Kannada","nativeName":"ಕನ್ನಡ","dir":"ltr"},"ko":{"name":"Tiếng Hàn","nativeName":"한국어","dir":"ltr"},"ks":{"name":"Kashmiri","nativeName":"کٲشُر","dir":"rtl"},"ku":{"name":"Tiếng Kurd (Trung)","nativeName":"Kurdî (Navîn)","dir":"rtl"},"ky":{"name":"Tiếng Kyrgyz","nativeName":"Кыргызча","dir":"ltr"},"ln":{"name":"Tiếng Lingala","nativeName":"Lingála","dir":"ltr"},"lo":{"name":"Tiếng Lào","nativeName":"ລາວ","dir":"ltr"},"lt":{"name":"Tiếng Litva","nativeName":"Lietuvių","dir":"ltr"},"lug":{"name":"Ganda","nativeName":"Ganda","dir":"ltr"},"lv":{"name":"Tiếng Latvia","nativeName":"Latviešu","dir":"ltr"},"lzh":{"name":"Chinese (Literary)","nativeName":"中文 (文言文)","dir":"ltr"},"mai":{"name":"Tiếng Maithili","nativeName":"Maithili","dir":"ltr"},"mg":{"name":"Tiếng Malagasy","nativeName":"Malagasy","dir":"ltr"},"mi":{"name":"Tiếng Maori","nativeName":"Te Reo Māori","dir":"ltr"},"mk":{"name":"Tiếng Macedonia","nativeName":"Македонски","dir":"ltr"},"ml":{"name":"Tiếng Malayalam","nativeName":"മലയാളം","dir":"ltr"},"mn-Cyrl":{"name":"Mongolian (Cyrillic)","nativeName":"Mongolian (Cyrillic)","dir":"ltr"},"mn-Mong":{"name":"Mongolian (Traditional)","nativeName":"ᠮᠣᠩᠭᠣᠯ ᠬᠡᠯᠡ","dir":"ltr"},"mr":{"name":"Tiếng Marathi","nativeName":"मराठी","dir":"ltr"},"ms":{"name":"Tiếng Mã Lai","nativeName":"Melayu","dir":"ltr"},"mt":{"name":"Tiếng Malta","nativeName":"Malti","dir":"ltr"},"mww":{"name":"Tiếng H’Mông","nativeName":"Hmong Daw","dir":"ltr"},"my":{"name":"Tiếng Miến Điện","nativeName":"မြန်မာ","dir":"ltr"},"nb":{"name":"Tiếng Na Uy (Bokmål)","nativeName":"Norsk Bokmål","dir":"ltr"},"ne":{"name":"Tiếng Nepal","nativeName":"नेपाली","dir":"ltr"},"nl":{"name":"Tiếng Hà Lan","nativeName":"Nederlands","dir":"ltr"},"nso":{"name":"Sesotho sa Leboa","nativeName":"Sesotho sa Leboa","dir":"ltr"},"nya":{"name":"Nyanja","nativeName":"Nyanja","dir":"ltr"},"or":{"name":"Tiếng Odia","nativeName":"ଓଡ଼ିଆ","dir":"ltr"},"otq":{"name":"Tiếng Querétaro Otomi","nativeName":"Hñähñu","dir":"ltr"},"pa":{"name":"Tiếng Punjab","nativeName":"ਪੰਜਾਬੀ","dir":"ltr"},"pl":{"name":"Tiếng Ba Lan","nativeName":"Polski","dir":"ltr"},"prs":{"name":"Tiếng Dari","nativeName":"دری","dir":"rtl"},"ps":{"name":"Tiếng Pashto","nativeName":"پښتو","dir":"rtl"},"pt":{"name":"Tiếng Bồ Đào Nha (Brazil)","nativeName":"Português (Brasil)","dir":"ltr"},"pt-PT":{"name":"Tiếng Bồ Đào Nha (Bồ Đào Nha)","nativeName":"Português (Portugal)","dir":"ltr"},"ro":{"name":"Tiếng Romania","nativeName":"Română","dir":"ltr"},"ru":{"name":"Tiếng Nga","nativeName":"Русский","dir":"ltr"},"run":{"name":"Rundi","nativeName":"Rundi","dir":"ltr"},"rw":{"name":"Tiếng Kinyarwanda","nativeName":"Kinyarwanda","dir":"ltr"},"sd":{"name":"Tiếng Sindhi","nativeName":"سنڌي","dir":"rtl"},"si":{"name":"Tiếng Sinhala","nativeName":"සිංහල","dir":"ltr"},"sk":{"name":"Tiếng Slovak","nativeName":"Slovenčina","dir":"ltr"},"sl":{"name":"Tiếng Slovenia","nativeName":"Slovenščina","dir":"ltr"},"sm":{"name":"Tiếng Samoa","nativeName":"Gagana Sāmoa","dir":"ltr"},"sn":{"name":"Tiếng Shona","nativeName":"chiShona","dir":"ltr"},"so":{"name":"Tiếng Somali","nativeName":"Soomaali","dir":"ltr"},"sq":{"name":"Tiếng Albania","nativeName":"Shqip","dir":"ltr"},"sr-Cyrl":{"name":"Tiếng Serbia (Chữ Kirin)","nativeName":"Српски (ћирилица)","dir":"ltr"},"sr-Latn":{"name":"Tiếng Serbia (Chữ La Tinh)","nativeName":"Srpski (latinica)","dir":"ltr"},"st":{"name":"Sesotho","nativeName":"Sesotho","dir":"ltr"},"sv":{"name":"Tiếng Thụy Điển","nativeName":"Svenska","dir":"ltr"},"sw":{"name":"Tiếng Swahili","nativeName":"Kiswahili","dir":"ltr"},"ta":{"name":"Tiếng Tamil","nativeName":"தமிழ்","dir":"ltr"},"te":{"name":"Tiếng Telugu","nativeName":"తెలుగు","dir":"ltr"},"th":{"name":"Tiếng Thái","nativeName":"ไทย","dir":"ltr"},"ti":{"name":"Tiếng Tigrinya","nativeName":"ትግር","dir":"ltr"},"tk":{"name":"Tiếng Turkmen","nativeName":"Türkmen Dili","dir":"ltr"},"tlh-Latn":{"name":"Tiếng Klingon (Chữ La Tinh)","nativeName":"Klingon (Latin)","dir":"ltr"},"tlh-Piqd":{"name":"Tiếng Klingon (pIqaD)","nativeName":"Klingon (pIqaD)","dir":"ltr"},"tn":{"name":"Setswana","nativeName":"Setswana","dir":"ltr"},"to":{"name":"Tiếng Tonga","nativeName":"Lea Fakatonga","dir":"ltr"},"tr":{"name":"Tiếng Thổ Nhĩ Kỳ","nativeName":"Türkçe","dir":"ltr"},"tt":{"name":"Tiếng Tatar","nativeName":"Татар","dir":"ltr"},"ty":{"name":"Tiếng Tahiti","nativeName":"Reo Tahiti","dir":"ltr"},"ug":{"name":"Tiếng Uyghur","nativeName":"ئۇيغۇرچە","dir":"rtl"},"uk":{"name":"Tiếng Ukraina","nativeName":"Українська","dir":"ltr"},"ur":{"name":"Tiếng Urdu","nativeName":"اردو","dir":"rtl"},"uz":{"name":"Tiếng Uzbek","nativeName":"Uzbek (Latin)","dir":"ltr"},"vi":{"name":"Tiếng Việt","nativeName":"Tiếng Việt","dir":"ltr"},"xh":{"name":"Tiếng Xhosa","nativeName":"isiXhosa","dir":"ltr"},"yo":{"name":"Tiếng Yoruba","nativeName":"Èdè Yorùbá","dir":"ltr"},"yua":{"name":"Tiếng Maya Yucatec","nativeName":"Yucatec Maya","dir":"ltr"},"yue":{"name":"Tiếng Quảng Đông (Phồn Thể)","nativeName":"粵語 (繁體)","dir":"ltr"},"zh-Hans":{"name":"Tiếng Trung (Giản Thể)","nativeName":"中文 (简体)","dir":"ltr"},"zh-Hant":{"name":"Tiếng Trung (Phồn Thể)","nativeName":"繁體中文 (繁體)","dir":"ltr"},"zu":{"name":"Tiếng Zulu","nativeName":"Isi-Zulu","dir":"ltr"}}');

  static AUTODETECT = '';

  static DefaultLanguage = {
    FROM: MicrosoftTranslator.AUTODETECT,
    TO: 'vi',
  };

  static BAIDU_FANYI_MAPPING = {
    '': 'auto',
    ja: 'jp',
    lzh: 'wyw',
    vi: 'vie',
    'zh-Hans': 'zh',
    'zh-Hant': 'cht',
  };

  static DEEPL_TRANSLATOR_MAPPING = {
    SOURCE_LANGUAGES: {
      en: 'EN',
      ja: 'JA',
      lzh: 'ZH',
      yue: 'ZH',
      'zh-Hans': 'ZH',
      'zh-Hant': 'ZH',
    },
    TARGET_LANGUAGES: {
      en: 'EN-US',
      ja: 'JA',
      lzh: 'ZH',
      yue: 'ZH',
      'zh-Hans': 'ZH',
      'zh-Hant': 'ZH',
    },
  };

  static GOOGLE_TRANSLATE_MAPPING = {
    '': 'auto',
    lzh: 'zh-CN',
    yue: 'zh-TW',
    'zh-Hans': 'zh-CN',
    'zh-Hant': 'zh-TW',
  };

  static PAPAGO_MAPPING = {
    '': 'auto',
    lzh: 'zh-CN',
    yue: 'zh-TW',
    'zh-Hans': 'zh-CN',
    'zh-Hant': 'zh-TW',
  };

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
      case Translators.BAIDU_FANYI: {
        return MicrosoftTranslator.BAIDU_FANYI_MAPPING[languageCode] ?? (Object.hasOwn(BaiduFanyi.FROM_LANGUAGES, languageCode) ? languageCode : BaiduFanyi.DefaultLanguage.FROM);
      }
      case Translators.DEEPL_TRANSLATE: {
        return MicrosoftTranslator.DEEPL_TRANSLATOR_MAPPING.SOURCE_LANGUAGES[languageCode] ?? (DeeplTranslate.SOURCE_LANGUAGES.filter(({ language }) => language === languageCode).length > 0 ? languageCode : DeeplTranslate.DefaultLanguage.SOURCE_LANG);
      }
      case Translators.GOOGLE_TRANSLATE: {
        return MicrosoftTranslator.GOOGLE_TRANSLATE_MAPPING[languageCode] ?? (Object.hasOwn(GoogleTranslate.SOURCE_LANGUAGES, languageCode) ? languageCode : GoogleTranslate.DefaultLanguage.SL);
      }
      case Translators.PAPAGO: {
        return MicrosoftTranslator.PAPAGO_MAPPING[languageCode] ?? (Object.hasOwn(Papago.SOURCE_LANGUAGES, languageCode) ? languageCode : Papago.DefaultLanguage.SOURCE);
      }
      case Translators.VIETPHRASE: {
        return Vietphrase.DefaultLanguage.SOURCE_LANGUAGE;
      }
      default: {
        return null;
      }
    }
  }

  static getMappedTargetLanguageCode(translator, languageCode) {
    switch (translator) {
      case Translators.BAIDU_FANYI: {
        return MicrosoftTranslator.BAIDU_FANYI_MAPPING[languageCode] ?? (Object.hasOwn(BaiduFanyi.TO_LANGUAGES, languageCode) ? languageCode : BaiduFanyi.DefaultLanguage.TO);
      }
      case Translators.DEEPL_TRANSLATE: {
        return MicrosoftTranslator.DEEPL_TRANSLATOR_MAPPING.TARGET_LANGUAGES[languageCode] ?? (DeeplTranslate.TARGET_LANGUAGES.filter(({ language }) => language === languageCode).length > 0 ? languageCode : DeeplTranslate.DefaultLanguage.TARGET_LANG);
      }
      case Translators.GOOGLE_TRANSLATE: {
        return MicrosoftTranslator.GOOGLE_TRANSLATE_MAPPING[languageCode] ?? (Object.hasOwn(GoogleTranslate.TARGET_LANGUAGES, languageCode) ? languageCode : GoogleTranslate.DefaultLanguage.TL);
      }
      case Translators.PAPAGO: {
        return MicrosoftTranslator.PAPAGO_MAPPING[languageCode] ?? (Object.hasOwn(Papago.TARGET_LANGUAGES, languageCode) ? languageCode : Papago.DefaultLanguage.TARGET);
      }
      case Translators.VIETPHRASE: {
        return Vietphrase.DefaultLanguage.TARGET_LANGUAGE;
      }
      default: {
        return null;
      }
    }
  }

  static async fetchAccessToken() {
    try {
      return await $.ajax({
        method: 'GET',
        url: 'https://edge.microsoft.com/translate/auth',
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
       * const [__, key, token] = bingTranslatorHTML.match(/var params_AbusePreventionHelper\s*=\s*\[([0-9]+),\s*'([^']+)',[^\]]*\];/);
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
        data: JSON.stringify(text.split('\n').map((element) => ({ Text: element }))),
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        url: `https://api-edge.cognitive.microsofttranslator.com/translate?from=${from}&to=${to}&api-version=3.0`,
      })).map(({ translations: [element] }) => element.text).join('\n');
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      throw error;
    }
  }
}

class Vietphrase {
  static SOURCE_LANGUAGES = { cj: 'Chinese-Japanese' };

  static TARGET_LANGUAGES = {
    simplified: 'Giản thể',
    traditional: 'Phổn thể',
    pinyin: 'Bính âm',
    KunYomi: 'Kun\'yomi',
    OnYomi: 'On\'yomi',
    SinoVietnamese: 'Hán Việt',
    vi: 'Vietphrase',
  };

  static DefaultLanguage = {
    SOURCE_LANGUAGE: 'cj',
    TARGET_LANGUAGE: 'vi',
  };

  SpecialSinoVietnameses = [
    ['开天辟地', 'KHAI THIÊN TỊCH ĐỊA'],
    ['虾兵蟹将', 'HÀ BINH GIẢI TƯỚNG'],
    ['办事处', 'bạn sự xứ'],
    ['俱乐部', 'câu lạc bộ'],
    ['审判长', 'thẩm phán trưởng'],
    ['小姐姐', 'tiểu tỷ tỷ'],
    ['安乐', 'an lạc'],
    ['本我', 'bản ngã'],
    ['本源', 'bản nguyên'],
    ['本体', 'bản thể'],
    ['秘传', 'bí truyền'],
    ['表姐', 'biểu tỷ'],
    ['部长', 'bộ trưởng'],
    ['格斗', 'cách đấu'],
    ['乾坤', 'càn khôn'],
    ['高岭', 'CAO LĨNH'],
    ['高层', 'cao tầng'],
    ['禁忌', 'cấm kị'],
    ['战斗', 'chiến đấu'],
    ['战将', 'chiến tướng'],
    ['主任', 'chủ nhiệm'],
    ['掌柜', 'chưởng quỹ'],
    ['公司', 'công ti'],
    ['基本', 'cơ bản'],
    ['局长', 'cục trưởng'],
    ['营养', 'dinh dưỡng'],
    ['多重', 'đa trùng'],
    ['代号', 'đại hiệu'],
    ['大将', 'đại tướng'],
    ['大姐', 'đại tỷ'],
    ['道号', 'đạo hiệu'],
    ['道长', 'đạo trưởng'],
    ['斗气', 'đấu khí'],
    ['斗士', 'đấu sĩ'],
    ['点数', 'điểm số'],
    ['团长', 'đoàn trưởng'],
    ['队长', 'đội trưởng'],
    ['监督', 'giám đốc'],
    ['监察', 'giám sát'],
    ['降临', 'giáng lâm'],
    ['降世', 'giáng thế'],
    ['降生', 'giáng sinh'],
    ['希望', 'hi vọng'],
    ['校长', 'hiệu trưởng'],
    ['欢乐', 'hoan lạc'],
    ['皇朝', 'hoàng triều'],
    ['学长', 'học trưởng'],
    ['学姐', 'học tỷ'],
    ['会长', 'hội trưởng'],
    ['兄长', 'huynh trưởng'],
    ['虚数', 'hư số'],
    ['乡长', 'hương trưởng'],
    ['计划', 'kế hoạch'],
    ['快乐', 'khoái lạc'],
    ['乐园', 'lạc viên'],
    ['领主', 'lãnh chủ'],
    ['领地', 'lãnh địa'],
    ['领袖', 'lãnh tụ'],
    ['灵长', 'linh trưởng'],
    ['美丽', 'mĩ lệ'],
    ['银行', 'ngân hàng'],
    ['外号', 'ngoại hiệu'],
    ['二重', 'nhị trùng'],
    ['任务', 'nhiệm vụ'],
    ['奴仆', 'nô bộc'],
    ['女仆', 'nữ bộc'],
    ['玻璃', 'pha lê'],
    ['缥缈', 'phiêu miểu'],
    ['副本', 'phó bản'],
    ['封号', 'phong hiệu'],
    ['府邸', 'phủ để'],
    ['服从', 'phục tùng'],
    ['管理', 'quản lí'],
    ['使团', 'sứ đoàn'],
    ['使徒', 'sứ đồ'],
    ['使者', 'sứ giả'],
    ['师姐', 'sư tỷ'],
    ['三重', 'tam trùng'],
    ['层次', 'tầng thứ'],
    ['成长', 'thành trưởng'],
    ['操纵', 'thao túng'],
    ['亲传', 'thân truyền'],
    ['施主', 'thí chủ'],
    ['刺客', 'thích khách'],
    ['刺杀', 'thích sát'],
    ['刺史', 'thích sử'],
    ['天使', 'thiên sứ'],
    ['禅师', 'thiền sư'],
    ['天朝', 'thiên triều'],
    ['少爷', 'thiếu gia'],
    ['少校', 'thiếu hiệu'],
    ['少年', 'thiếu niên'],
    ['少女', 'thiếu nữ'],
    ['少妇', 'thiếu phụ'],
    ['脱离', 'thoát li'],
    ['时代', 'thời đại'],
    ['时间', 'thời gian'],
    ['时刻', 'thời khắc'],
    ['时空', 'thời không'],
    ['时期', 'thời kỳ'],
    ['时光', 'thời quang'],
    ['时速', 'thời tốc'],
    ['时装', 'thời trang'],
    ['上将', 'thượng tướng'],
    ['司职', 'ti chức'],
    ['比武', 'tỉ võ'],
    ['族长', 'tộc trưởng'],
    ['朝廷', 'triều đình'],
    ['朝圣', 'triều thánh'],
    ['侦探', 'trinh thám'],
    ['重叠', 'trùng điệp'],
    ['重开', 'trùng khai'],
    ['重启', 'trùng khải'],
    ['重生', 'trùng sinh'],
    ['重塑', 'trùng tố'],
    ['重重', 'trùng trùng'],
    ['传道', 'truyền đạo'],
    ['传唤', 'truyền hoán'],
    ['传奇', 'truyền kỳ'],
    ['传人', 'truyền nhân'],
    ['传讯', 'truyền tấn'],
    ['传说', 'truyền thuyết'],
    ['传承', 'truyền thừa'],
    ['传送', 'truyền tống'],
    ['长辈', 'trưởng bối'],
    ['长老', 'trưởng lão'],
    ['长官', 'trưởng quan'],
    ['长孙', 'trưởng tôn'],
    ['长子', 'trưởng tử'],
    ['四重', 'tứ trùng'],
    ['将领', 'tướng lĩnh'],
    ['将军', 'tướng quân'],
    ['将士', 'tướng sĩ'],
    ['姐妹', 'tỷ muội'],
    ['姐夫', 'tỷ phu'],
    ['姐姐', 'tỷ tỷ'],
    ['物理', 'vật lí'],
    ['院长', 'viện trưởng'],
    ['武斗', 'võ đấu'],
    ['武馆', 'võ quán'],
    ['武夫', 'võ phu'],
    ['武士', 'võ sĩ'],
    ['武师', 'võ sư'],
    ['武圣', 'võ thánh'],
    ['无数', 'vô số'],
    ['王朝', 'vương triều'],
    ['称号', 'xưng hiệu'],
    ['吖', 'A'],
    ['诶', null, 'ai | hy'],
    ['摁', 'ÂN'],
    ['爸', 'BÁ'],
    ['霸', 'BÁ'],
    ['沛', 'BÁI'],
    ['掰', 'BÃI'],
    ['孢', 'BÀO'],
    ['泡', 'BÀO'],
    ['镚', 'BẢNG'],
    ['嘭', 'BÀNH'],
    ['嘣', 'BĂNG'],
    ['赑', 'BỊ'],
    ['捕', 'BỔ'],
    ['怖', 'BỐ'],
    ['旮', 'CA'],
    ['咖', 'CA'],
    ['干', 'CAN'],
    ['赣', 'CÁN'],
    ['薅', 'CAO'],
    ['裘', 'CẦU'],
    ['正', 'CHÍNH'/* Họ */],
    ['政', 'CHÍNH'],
    ['锤', 'CHUỲ'],
    ['褚', 'CHỬ'/* Họ */],
    ['骷', 'CÔ'],
    ['机', 'CƠ'],
    ['玑', 'CƠ'],
    [/* Kanji */'姫', '姬'/* CEDICT */],
    ['畸', 'CƠ'],
    ['奇', 'CƠ, KI, KỲ', 'KỲ'/* Họ Kỳ */],
    ['蒟', 'CƯ'],
    ['犟', 'CƯỜNG'],
    ['柜', 'CỰ, QUỸ'],
    ['摇', 'DAO'],
    ['遥', 'DAO'],
    ['焰', 'DIỆM'],
    ['焱', 'DIỆM'],
    ['延', 'DIÊN'/* Họ */],
    ['淼', 'DIỂU'],
    ['杳', 'DIỂU'],
    ['尹', 'DOÃN'/* Họ */],
    ['允', 'DOÃN'],
    ['蓉', 'DUNG'],
    ['熔', 'DUNG'],
    ['缘', 'DUYÊN'],
    ['兖', 'DUYỄN'],
    ['嗲', 'ĐÀ'],
    ['台', 'ĐÀI'/* Họ */],
    ['抬', 'ĐÀI'],
    ['哒', 'ĐÁT'],
    ['娣', 'ĐỆ'],
    ['侄', 'ĐIỆT'],
    ['顶', 'ĐỈNH'],
    ['锻', 'ĐOÀN'],
    ['洞', 'ĐỘNG'],
    ['郝', 'HÁCH'/* Họ */],
    ['唏', 'HI'],
    ['屃', 'HÍ'],
    ['峡', 'HIỆP'],
    ['叶', 'HIỆP, DIỆP', 'DIỆP'/* Họ Nghiệp */],
    ['校', 'HIỆU'],
    ['靴', 'HOA'],
    [/* Giản thể */'坏', 'HOẠI'],
    [/* Kanji */'壊', '坏'/* CEDICT */],
    ['嚯', 'HOẮC'],
    ['槐', 'HÒE'/* Họ Hoè *//* Fix New Accent */],
    ['宏', 'HỒNG, HOẰNG', 'HOẰNG'/* Họ Hồng */],
    ['县', 'HUYỆN'],
    ['佧', 'KHA'],
    ['铐', 'KHẢO'],
    ['啃', 'KHẲNG'],
    ['氪', 'KHẮC'],
    ['蹊', 'KHÊ'],
    ['挑', 'KHIÊU'],
    ['跨', 'KHOA'],
    ['矿', 'KHOÁNG'],
    ['灰', 'KHÔI'],
    ['绮', 'KHỞI'],
    ['蝰', 'KHUÊ'],
    ['哐', 'KHUÔNG'],
    ['其', 'KI, KỲ', 'KỲ'],
    ['劲', 'KÌNH'],
    ['期', 'KỲ'],
    ['祁', 'KỲ'],
    ['岐', 'KỲ'],
    ['祈', 'KỲ'],
    ['崎', 'KỲ'],
    ['淇', 'KỲ'],
    ['棋', 'KỲ'],
    ['琪', 'KỲ'],
    ['旗', 'KỲ'],
    ['麒', 'KỲ'],
    ['纪', 'KỶ'],
    ['技', 'KỸ'],
    ['记', 'KÝ'],
    ['骑', 'KỴ'],
    ['铝', 'LÃ'],
    ['脸', 'LIỂM, LIỄM'],
    ['辇', 'LIÊN'],
    ['柃', '', 'linh'/* Hanzii */],
    ['摞', 'LOA'],
    ['涮', 'LOÁT'],
    ['撸', 'LỖ'],
    ['仑', 'LUÂN'],
    ['胧', 'LUNG'],
    ['拢', 'LŨNG'],
    ['累', 'LUỸ, LUỴ'],
    ['鎏', 'LƯU'],
    ['璃', '', 'ly | li | lê'/* Hanzii */],
    ['妈', 'MA'],
    ['玫', 'MAI'],
    ['曼', 'MAN'],
    ['牦', 'MAO'],
    ['咩', 'MIẾT'],
    ['喵', 'MIÊU'],
    ['茗', 'MINH'],
    ['馍', 'MÔ'],
    ['哞', 'MU'],
    ['闹', 'NÁO'],
    ['孬', 'NẠO'],
    ['嚣', 'NGAO'],
    ['垠', 'NGẦN'],
    ['荛', 'NGHIÊU'],
    ['鼋', 'NGUYÊN'],
    ['玥', 'NGUYỆT'],
    ['伢', 'NHA'],
    [/* Kanji */'楽', '乐'/* CEDICT */],
    ['刃', 'NHẪN'],
    ['任', 'NHẬM, NHIỆM'/* Họ Nhậm */],
    ['儿', 'NHI'],
    ['聂', 'NHIẾP'/* Họ */],
    ['蕊', 'NHUỴ'],
    [/* Biến thể cũ */'叒', '若'/* CEDICT */],
    ['袅', 'NIỄU'],
    ['宁', 'NINH'/* Họ Ninh */],
    ['苧', 'NINH'],
    ['柠', 'NINH'],
    [/* Giản thể */'钕', 'NỮ'],
    [/* Phổn thể */'釹', '钕'],
    ['樊', 'PHÀN'/* Họ */],
    ['粪', 'PHẪN, PHẤN'],
    ['缚', 'PHỌC'],
    ['浦', 'PHỐ'/* Họ */],
    ['仆', 'PHỐC, BỘC'],
    ['绾', 'QUÁN'],
    ['广', 'QUẢNG'],
    ['瑰', 'QUẾ, KHÔI', 'KHÔI'],
    [/* Giản thể */'创', 'SANG, SÁNG', 'SÁNG'],
    [/* Phổn thể */'創', '创'],
    ['厅', 'SẢNH'],
    ['笙', 'SÊNH'],
    ['生', 'SINH'],
    ['傻', 'SOẢ'],
    ['帅', 'SOÁI'/* Họ */],
    ['山', 'SƠN'/* Họ */],
    ['爹', 'TA'],
    ['噻', 'TẮC'],
    ['噌', 'TĂNG'],
    ['沁', 'TẨM'],
    ['烬', 'TẦN'],
    ['剂', 'TỄ'],
    ['济', 'TẾ'],
    ['采', 'THÁI'],
    ['彩', 'THÁI, THỂ'],
    ['呔', 'THÁI, THẢI'],
    ['遢', 'THẠP'],
    ['沈', 'THẨM'/* Họ */],
    ['瘆', 'THẨM'],
    ['单', 'THIỀN, ĐƠN', 'ĐƠN'],
    ['蹿', 'THOÃN'],
    ['兔', 'THỐ'],
    ['姝', 'THÙ'],
    ['驯', 'THUẦN'],
    ['属', 'THUỘC'],
    ['姐', 'THƯ'],
    ['实', 'THỰC'],
    ['熵', 'THƯƠNG'],
    ['撕', 'TI, TƯ'],
    ['比', 'TỈ'],
    ['霹', 'TỊCH'],
    ['钱', 'TIỀN'],
    ['箭', 'TIỄN'],
    ['羡', 'TIỄN'/* Họ */],
    ['筱', 'TIÊU'],
    ['啸', 'TIẾU'],
    ['箐', 'TINH'],
    ['静', 'TỊNH, TĨNH', 'TĨNH'/* Họ Tịnh */],
    ['璇', 'TOÀN'],
    ['诅', 'TỔ'],
    ['橙', 'TRÀNH, TRANH, ĐẮNG', 'TRANH'],
    ['沼', 'TRẢO'],
    ['镯', 'TRỌC'],
    ['住', 'TRÚ'],
    ['着', 'TRƯỚC, CHIÊU'],
    ['场', 'TRƯỜNG'],
    ['纵', 'TUNG'],
    ['祟', 'TUỴ'],
    ['司', 'TƯ, TI'],
    ['蔷', 'TƯỜNG'],
    ['蒋', 'TƯỞNG'/* Họ */],
    ['碗', 'UYỂN'],
    ['哟', 'ƯỚC'],
    ['援', 'VIỆN'],
    ['眦', 'XẾ'],
    ['掣', 'XIẾT'],
    ['冲', 'XUNG'],
    ['胭', 'YẾT'],
    ['夭', 'YỂU'],
  ];

  static getSourceLanguageName(languageCode) {
    return Vietphrase.SOURCE_LANGUAGES[languageCode].startsWith('Tiếng ') ? Vietphrase.SOURCE_LANGUAGES[languageCode].match(/Tiếng (.+)/)[1] : Vietphrase.SOURCE_LANGUAGES[languageCode];
  }

  static getTargetLanguageName(languageCode) {
    return Vietphrase.TARGET_LANGUAGES[languageCode].startsWith('Tiếng ') ? Vietphrase.TARGET_LANGUAGES[languageCode].match(/Tiếng (.+)/)[1] : Vietphrase.TARGET_LANGUAGES[languageCode];
  }

  static getMappedSourceLanguageCode(translator) {
    switch (translator) {
      case Translators.BAIDU_FANYI: {
        return 'zh';
      }
      case Translators.DEEPL_TRANSLATE: {
        return 'ZH';
      }
      case Translators.GOOGLE_TRANSLATE:
      case Translators.PAPAGO: {
        return 'zh-CN';
      }
      case Translators.MICROSOFT_TRANSLATOR: {
        return 'zh-Hans';
      }
      default: {
        return null;
      }
    }
  }

  static getMappedTargetLanguageCode(translator) {
    switch (translator) {
      case Translators.BAIDU_FANYI: {
        return 'vie';
      }
      case Translators.DEEPL_TRANSLATE: {
        return DeeplTranslate.DefaultLanguage.TARGET_LANG;
      }
      default: {
        return 'vi';
      }
    }
  }

  static removeAccents(pinyin) {
    const accentsMap = {
      ā: 'a',
      á: 'a',
      ǎ: 'a',
      à: 'a',
      ō: 'o',
      ó: 'o',
      ǒ: 'o',
      ò: 'o',
      ē: 'e',
      é: 'e',
      ě: 'e',
      è: 'e',
      ī: 'i',
      í: 'i',
      ǐ: 'i',
      ì: 'i',
      ū: 'u',
      ú: 'u',
      ǔ: 'u',
      ù: 'u',
      ǖ: 'v',
      ǘ: 'v',
      ǚ: 'v',
      ǜ: 'v',
      ü: 'v',
    };

    return pinyin.replaceAll(/[āáǎàōóǒòēéěèīíǐìūúǔùǖǘǚǜü]/g, (match) => accentsMap[match]);
  }

  static getFormattedText(inputText) {
    const PUNCTUATIONS = {
      '、': ',',
      '。': '.',
      '【': '[',
      '】': ']',
      '！': '!',
      '（': '(',
      '）': ')',
      '，': ',',
      '：': ':',
      '；': ';',
      '？': '?',
    };

    return inputText.replaceAll(/(?:[…、。】！），：；？]|\.\.\.)(?![\p{Pc}\p{Pd}\p{Pe}\p{Pf}\p{Po}\s]|$)/gu, (match) => `${PUNCTUATIONS[match] ?? match} `).replaceAll(/([^\s\p{Ps}\p{Pi}])([【（])/gu, (__, p1, p2) => `${p1} ${PUNCTUATIONS[p2] ?? p2}`).replaceAll(/[、。【】！（），：；？]/g, (match) => PUNCTUATIONS[match] ?? match).replaceAll(/ ?· ?/g, ' ');
  }

  static quickTranslate(inputText, translations) {
    if (translations == null || translations.length === 0) return inputText;
    const translationsMap = Object.fromEntries(translations.map(([first, second]) => [first.toUpperCase(), second]));

    let startIndex = 0;
    const characters = inputText.split(/(?:)/u);
    const charactersLength = characters.length;
    let minLength = 0;
    let maxLength = 131072;

    translations.forEach(([first]) => {
      const { length } = first.split(/(?:)/u);

      if (length > 0) {
        if (length > minLength) minLength = length;
        if (length < maxLength) maxLength = length;
      }
    });

    let endIndex = minLength;

    let translatedText = '';

    let lastEndIndex = 0;
    let hasTranslation = false;

    let previousPhrase = '';

    while (startIndex < charactersLength) {
      if (startIndex + endIndex > charactersLength) endIndex = charactersLength - startIndex;
      const tempChars = [];

      for (let i = 0; i < endIndex; i += 1) {
        tempChars.push(...characters.at(startIndex + i).split(/(?:)/u));
      }

      let currentEndIndex = endIndex;

      const translatedChars = translatedText.split(/(?:)/u);

      while (true) {
        if (currentEndIndex < maxLength) {
          lastEndIndex = startIndex;
          hasTranslation = false;
          break;
        }

        const substring = tempChars.slice(0, currentEndIndex).join('');

        if (Object.hasOwn(translationsMap, substring.toUpperCase())) {
          const phrase = translationsMap[substring.toUpperCase()];
          translatedText += (translatedChars.length > 0 && phrase !== '' && (/[\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(translatedChars[translatedChars.length - 1]) || previousPhrase.length === 0) ? ' ' : '') + phrase;
          previousPhrase = phrase;
          lastEndIndex = startIndex + currentEndIndex;
          hasTranslation = true;
          break;
        }

        currentEndIndex -= 1;
      }

      if (hasTranslation) {
        startIndex = lastEndIndex;
      } else {
        const char = characters.at(lastEndIndex);
        translatedText += (translatedChars.length > 0 && /^[\p{Lu}\p{Ll}\p{Nd}([{‘“]/u.test(char) && /[\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(previousPhrase) ? ' ' : '') + char;
        previousPhrase = /[^\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(char) ? char : '';
        startIndex = lastEndIndex + 1;
      }
    }

    return translatedText;
  }

  static translateAfterTest(inputText, names, vietPhrases, hanVietDict, testTextMapping) {
    if (names == null || vietPhrases == null || hanVietDict == null || hanVietDict.length === 0) return inputText;
    let startIndex = 0;
    const characters = inputText.split(/(?:)/u);
    const charactersLength = characters.length;
    let endIndex = 10;
    let primaryIndex = 0;

    let translatedText = '';

    let hasPhrase = false;

    let currentIndex = 0;

    const nameMap = Object.fromEntries(names);

    let hasHanViet = false;

    let previousPhrase = '';

    const textMapping = [];

    const vietPhraseMap = Object.fromEntries(vietPhrases);
    const hanVietMap = Object.fromEntries(hanVietDict);

    while (startIndex < charactersLength) {
      if (startIndex + endIndex > charactersLength) endIndex = charactersLength - startIndex;
      const tempChars = [];

      for (let i = 0; i < endIndex; i += 1) {
        tempChars.push(...characters.at(startIndex + i).split(/(?:)/u));
      }

      let currentEndIndex = endIndex;

      const translatedChars = translatedText.split(/(?:)/u);

      let currentStartIndex = primaryIndex;

      while (true) {
        if (currentEndIndex < 1) {
          hasPhrase = false;
          break;
        }

        const substring = tempChars.slice(currentIndex, currentEndIndex).join('');

        if (Object.hasOwn(nameMap, substring.toUpperCase())) {
          const name = nameMap[substring.toUpperCase()];
          translatedText += (translatedChars.length > 0 && (/[\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(translatedChars[translatedChars.length - 1]) || previousPhrase.length === 0) ? ' ' : '') + name.split(/[/|]/)[0];
          if (name !== '') previousPhrase = name;
          textMapping.push({
            indexChina: startIndex,
            lenChina: currentEndIndex,
            contentViet: name,
            contentChina: substring,
          });
          startIndex += currentEndIndex;
          hasPhrase = true;
          break;
        } else if (Object.hasOwn(vietPhraseMap, substring.toUpperCase())) {
          if (currentStartIndex >= testTextMapping.length) currentStartIndex = 0;
          let tempStartIndex = currentStartIndex;

          while (true) {
            if (currentStartIndex >= testTextMapping.length) {
              currentStartIndex = tempStartIndex;
              hasHanViet = false;
              break;
            }

            const text = testTextMapping[currentStartIndex];
            if (startIndex >= text.indexChina) tempStartIndex = currentStartIndex;

            if (text.indexChina > startIndex + (endIndex * 2)) {
              currentStartIndex = tempStartIndex;
              hasHanViet = false;
              break;
            }

            if (text.indexChina >= startIndex && text.indexChina < startIndex + currentEndIndex) {
              currentStartIndex = tempStartIndex;
              hasHanViet = true;
              break;
            }

            currentStartIndex += 1;
          }

          if (!hasHanViet) {
            const vietPhrase = vietPhraseMap[substring.toUpperCase()];
            translatedText += (translatedChars.length > 0 && vietPhrase !== '' && (/[\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(translatedChars[translatedChars.length - 1]) || previousPhrase.length === 0) ? ' ' : '') + vietPhrase;
            if (vietPhrase !== '') previousPhrase = vietPhrase;
            textMapping.push({
              indexChina: startIndex,
              lenChina: currentEndIndex,
              contentViet: vietPhrase,
              contentChina: substring,
            });
            startIndex += currentEndIndex;
            hasPhrase = true;
            break;
          } else if (Object.hasOwn(hanVietMap, substring)) {
            const hanViet = hanVietMap[substring];
            translatedText += (translatedChars.length > 0 && hanViet !== '' && (/[\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(translatedChars[translatedChars.length - 1]) || previousPhrase.length === 0) ? ' ' : '') + hanViet;
            if (hanViet !== '') previousPhrase = hanViet;
            textMapping.push({
              indexChina: startIndex,
              lenChina: currentEndIndex,
              contentViet: hanViet,
              contentChina: substring,
            });
            startIndex += currentEndIndex;
            hasPhrase = true;
            break;
          } else {
            currentEndIndex -= 1;
            currentIndex = 0;
          }
        } else if (Object.hasOwn(hanVietMap, substring)) {
          const hanViet = hanVietMap[substring];
          translatedText += (translatedChars.length > 0 && hanViet !== '' && (/[\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(translatedChars[translatedChars.length - 1]) || previousPhrase.length === 0) ? ' ' : '') + hanViet;
          if (hanViet !== '') previousPhrase = hanViet;
          textMapping.push({
            indexChina: startIndex,
            lenChina: currentEndIndex,
            contentViet: hanViet,
            contentChina: substring,
          });
          startIndex += currentEndIndex;
          hasPhrase = true;
          break;
        } else {
          currentEndIndex -= 1;
          currentIndex = 0;
        }
      }

      if (hasPhrase) {
        primaryIndex = currentStartIndex;
      } else {
        primaryIndex = currentStartIndex;
        const char = characters.at(startIndex);
        translatedText += (translatedChars.length > 0 && /^[\p{Lu}\p{Ll}\p{Nd}([{‘“]/u.test(char) && /[\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(previousPhrase) ? ' ' : '') + char;
        previousPhrase = /[^\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(char) ? char : '';
        startIndex += 1;
      }
    }

    currentIndex = 0;

    translatedText = Vietphrase.getFormattedText(translatedText.replaceAll(/> /g, '>')).replace(' .', '.').replace(' ,', ',');
    if (textMapping.length > 0) textMapping.sort((a, b) => a.indexChina - b.indexChina);
    return translatedText;
  }

  translateWithTextMapping(inputText, names, hanVietDict) {
    if (names == null || hanVietDict.length === 0) return inputText;
    let startIndex = 0;
    const characters = inputText.split(/(?:)/u);
    const charactersLength = characters.length;
    let endIndex = 10;

    const hanVietMap = Object.fromEntries(hanVietDict);

    let translatedText = '';

    let hasPhrase = false;

    const nameMap = Object.fromEntries(names);

    let previousPhrase = '';

    const testTextMapping = [];

    while (startIndex < charactersLength) {
      if (startIndex + endIndex > charactersLength) endIndex = charactersLength - startIndex;

      if (Object.hasOwn(hanVietMap, characters.at(startIndex)) == null) {
        const char = characters.at(startIndex);
        translatedText += char;
        previousPhrase = /[^\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(char) ? char : '';
        startIndex += 1;
      } else {
        const tempChars = [];

        for (let i = 0; i < endIndex; i += 1) {
          tempChars.push(...characters.at(startIndex + i).split(/(?:)/u));
        }

        let currentEndIndex = endIndex;

        const translatedChars = translatedText.split(/(?:)/u);

        while (true) {
          hasPhrase = true;

          if (currentEndIndex < 1) {
            hasPhrase = false;
            break;
          }

          const substring = tempChars.slice(0, currentEndIndex).join('');

          if (Object.hasOwn(nameMap, substring.toUpperCase())) {
            const name = nameMap[substring.toUpperCase()];
            translatedText += (translatedChars.length > 0 && (/[\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”\p{sc=Hani}\p{sc=Hira}\p{sc=Kana}]$/u.test(translatedChars[translatedChars.length - 1]) || previousPhrase.length === 0) ? ' ' : '') + name.split(/[/|]/)[0];
            if (name !== '') previousPhrase = name;
            testTextMapping.push({
              indexChina: startIndex,
              lenChina: currentEndIndex,
              contentViet: name,
              contentChina: substring,
            });
            startIndex += currentEndIndex;
            break;
          }

          currentEndIndex -= 1;
        }

        if (!hasPhrase) {
          const char = characters.at(startIndex);
          translatedText += (translatedChars.length > 0 && /^[\p{Lu}\p{Ll}\p{Nd}([{‘“]/u.test(char) && /[\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(previousPhrase) ? ' ' : '') + char;
          previousPhrase = /[^\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(char) ? char : '';
          startIndex += 1;
        }
      }
    }

    if (testTextMapping.length > 0) testTextMapping.sort((a, b) => a.indexChina - b.indexChina);
    return Vietphrase.translateAfterTest(inputText, names, this.vietPhrase, hanVietDict, testTextMapping);
  }

  static getCapitalizeText(text) {
    return text.split('\n').map((element) => element.replaceAll(/(^[\p{P}\p{Z}]*|[!.?] )(\p{Ll})/gu, (__, p1, p2) => p1 + p2.toUpperCase())).join('\n');
  }

  translateText(__, targetLanguage, inputText, options, glossary) {
    this.prioritizeNameOverVietPhrase = options.prioritizeNameOverVietPhrase;
    this.autocapitalize = options.autocapitalize;

    let hanViet = (glossary.SinoVietnameses.length > 0 ? glossary.SinoVietnameses.filter(([___, second]) => !/^\p{Script=Hani}+$/u.test(second)).map(([first, second]) => [first, second.toLowerCase()]) : []).concat(this.SpecialSinoVietnameses.filter(([___, second]) => !/^\p{Script=Hani}+$/u.test(second)).map(([a, b, c]) => [a, (c ?? b).split(/, | \| /)[0].toLowerCase()]), glossary.hanViet).filter(([first], ___, array) => !array[first] && (array[first] = 1), {});
    hanViet = this.SpecialSinoVietnameses.filter(([___, second]) => /^\p{Script=Hani}+$/u.test(second)).map(([a, b]) => [a, Object.fromEntries(glossary.hanViet.filter(([___, d]) => !/^\p{Script=Hani}+$/u.test(d)))[b]]).concat(hanViet).filter(([first], ___, array) => !array[first] && (array[first] = 1), {});
    if (glossary.SinoVietnameses.length > 0) hanViet = glossary.SinoVietnameses.filter(([___, second]) => /^\p{Script=Hani}+$/u.test(second)).map(([a, b]) => [a, Object.fromEntries(glossary.hanViet.filter(([___, d]) => !/^\p{Script=Hani}+$/u.test(d)))[b]]).concat(hanViet).filter(([first], ___, array) => !array[first] && (array[first] = 1), {});
    hanViet = new Map(hanViet);

    let resultText = inputText;

    switch (targetLanguage) {
      case 'simplified': {
        resultText = Vietphrase.quickTranslate(inputText, glossary.simplified);
        break;
      }
      case 'traditional': {
        resultText = Vietphrase.quickTranslate(inputText, glossary.traditional);
        break;
      }
      case 'pinyin': {
        resultText = Vietphrase.getFormattedText(Vietphrase.quickTranslate(inputText, glossary.romajis.concat(glossary.pinyins.map(([first, second]) => [first, Vietphrase.removeAccents(second)]))));
        break;
      }
      case 'KunYomi': {
        resultText = Vietphrase.getFormattedText(Vietphrase.quickTranslate(inputText, glossary.KunYomis.concat(glossary.OnYomis, glossary.romajis).filter(([first], ___, array) => !array[first] && (array[first] = 1), {})));
        break;
      }
      case 'OnYomi': {
        resultText = Vietphrase.getFormattedText(Vietphrase.quickTranslate(inputText, glossary.OnYomis.concat(glossary.KunYomis, glossary.romajis).filter(([first], ___, array) => !array[first] && (array[first] = 1), {})));
        break;
      }
      case 'vi': {
        let luatNhanName = [];
        let luatNhanPronoun = [];

        if (options.multiplicationAlgorithm > 0) {
          glossary.luatNhan.filter(([first]) => inputText.match(new RegExp(Utils.escapeRegExp(first).replace('\\{0\\}', '.+')))).forEach(([a, b]) => {
            if (options.nameEnabled && options.multiplicationAlgorithm === 2 && glossary.name.length > 0) {
              luatNhanName = [...luatNhanName, ...glossary.name.map(([c, d]) => [a.replace('{0}', c), b.replace('{0}', d)])];
            }

            luatNhanPronoun = [...luatNhanPronoun, ...glossary.name.pronoun.map(([c, d]) => [a.replace('{0}', c), b.replace('{0}', d.split(/[/|]/)[0])])];
          });
        }

        const name = options.nameEnabled ? Object.entries(Object.fromEntries(glossary.name.concat(glossary.namePhu, luatNhanName).filter(([first]) => first != null && first.length > 0 && inputText.toLowerCase().includes(first.toLowerCase())))).map(([first, second]) => [first.toUpperCase(), second]) : [];
        this.vietPhrase = Object.entries(Object.fromEntries((glossary.vietPhrase.length > 0 ? glossary.vietPhrase : []).concat(glossary.vietPhrase.concat(glossary.vietPhrasePhu).length > 0 ? [['的', options.addDeLeZhao ? hanViet.get('的') : ''], ['了', options.addDeLeZhao ? hanViet.get('了') : ''], ['着', options.addDeLeZhao ? hanViet.get('着') : '']] : [], glossary.vietPhrasePhu, luatNhanPronoun))).map(([first, second]) => [first.toUpperCase(), second.split(/[/|]/)[0]]);
        resultText = this.translateWithTextMapping(inputText, name, Object.entries(Object.fromEntries(glossary.romajis.concat(glossary.KunYomis, glossary.OnYomis, [...hanViet]))));
        resultText = options.autocapitalize ? Vietphrase.getCapitalizeText(resultText) : resultText;
        break;
      }
      default: {
        resultText = Vietphrase.getFormattedText(Vietphrase.quickTranslate(inputText, [...hanViet]));
        break;
      }
    }

    return resultText;
  }
}
