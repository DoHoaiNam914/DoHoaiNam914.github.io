'use strict';

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
    this.endpoint = 'https://api-free.deepl.com';
    this.authKey = authKey;
    this.fetchUsage();
  }

  fetchUsage() {
    try {
      this.usage = $.ajax({
        async: false,
        method: 'GET',
        url: `${this.endpoint}/v2/usage?auth_key=${this.authKey}`,
      });
    } catch (error) {
      console.error('Không thể lấy được Mức sử dụng:', error);
      throw console.error('Không thể lấy được Mức sử dụng!');
    }
  }

  translateText(sourceLang, targetLang, text) {
    try {
      return $.ajax({
        async: false,
        data: `text=${text.split('\n').map((element) => encodeURIComponent(element)).join('&text=')}&source_lang=${sourceLang}&target_lang=${targetLang}`,
        method: 'POST',
        url: `${this.endpoint}/v2/translate?auth_key=${this.authKey}`,
      }).responseJSON.translations.map((element) => element.text).join('\n');
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      throw error;
    }
  }
}
