'use strict';

class BaiduTranslate extends Translator {
  static SOURCE_LANGUAGE_LIST = {
    auto: 'Automatic detection',
    jp: 'Japanese',
    en: 'English',
    vie: 'Vietnamese',
    zh: 'Chinese',
    cht: 'Traditional Chinese',
  };

  static TARGET_LANGUAGE_LIST = {
    jp: 'Japanese',
    en: 'English',
    vie: 'Vietnamese',
    zh: 'Chinese',
    cht: 'Traditional Chinese',
  };

  DefaultLanguage = {
    SOURCE_lANGUAGE: 'auto',
    TARGET_lANGUAGE: 'vie',
  };

  constructor() {
    super();
    this.maxContentLengthPerRequest = 1000;
  }

  async translateText(text, targetLanguage, sourceLanguage = this.DefaultLanguage.SOURCE_lANGUAGE) {
    try {
      const lines = text.split(/\n/);
      let queryLines = [];
      const responses = [];
      const lan = sourceLanguage === 'auto' ? $.ajax({
        async: false,
        cache: false,
        data: `query=${encodeURIComponent(text)}`,
        method: 'POST',
        url: `${Utils.CORS_PROXY}https://fanyi.baidu.com/langdetect`,
      }).responseJSON.lan : sourceLanguage;

      while (lines.length > 0 && [...queryLines, lines[0]].join('\n').length <= this.maxContentLengthPerRequest) {
        queryLines.push(lines.shift());

        if (lines.length === 0 || [...queryLines, lines[0]].join('\n').length > this.maxContentLengthPerRequest) {
          responses.push($.ajax({
            cache: false,
            data: JSON.stringify({
              query: queryLines.join('\n'),
              from: sourceLanguage === 'auto' ? lan : sourceLanguage,
              to: targetLanguage,
              reference: '',
              corpusIds: [],
              qcSettings: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
              domain: 'common',
            }),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            url: `${Utils.CORS_PROXY}https://fanyi.baidu.com/ait/text/translate`,
          }));
          queryLines = [];
        }
      }

      await Promise.all(responses);
      this.result = responses.map((a) => JSON.parse(a.responseText.split('\n').filter((b) => b.includes('"event":"Translating"'))[0].replace(/^data: /, '')).data.list.map((b) => b.dst).join('\n')).join('\n');
      super.translateText(text, targetLanguage, sourceLanguage);
      return this.result;
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      throw error;
    }
  }
}