'use strict';

class BaiduFanyi {
  static FROM_LANGUAGES = {
    auto: 'Automatic detection',
    jp: 'Japanese',
    en: 'English',
    vie: 'Vietnamese',
    zh: 'Chinese',
    cht: 'Traditional Chinese',
  };

  static TO_LANGUAGES = {
    jp: 'Japanese',
    en: 'English',
    vie: 'Vietnamese',
    zh: 'Chinese',
    cht: 'Traditional Chinese',
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
    },
    TARGET_LANGUAGES: {
      jp: 'JA',
      en: 'EN-US',
      zh: 'ZH',
      cht: 'ZH',
    },
  };

  static GOOGLE_TRANSLATE_MAPPING = {
    jp: 'ja',
    vie: 'vi',
    zh: 'zh-CN',
    cht: 'zh-TW',
  };

  static PAPAGO_MAPPING = {
    jp: 'ja',
    vie: 'vi',
    zh: 'zh-CN',
    cht: 'zh-TW',
  };

  static MICROSOFT_TRANSLATOR_MAPPING = {
    auto: '',
    jp: 'ja',
    vie: 'vi',
    zh: 'zh-Hans',
  };

  constructor() {
    this.endpoint = 'https://fanyi.baidu.com';
  }

  translateText(from, to, query) {
    let result = query;

    if (query.replaceAll(/\n/g, '').length > 0) {
      try {
        let detectFrom = from;

        if (from === 'auto') {
          detectFrom = $.ajax({
            async: false,
            data: `query=${encodeURIComponent(query)}`,
            method: 'POST',
            url: `${Utils.CORS_PROXY}${this.endpoint}/langdetect`,
          }).responseJSON.lan;
        }

        let response = $.ajax({
          async: false,
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
          url: `${Utils.CORS_PROXY}${this.endpoint}/ait/text/translate`,
        }).responseText.split('\n').filter((element) => element.includes('"event":"Translating"'));

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
