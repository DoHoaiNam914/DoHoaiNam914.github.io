'use strict';

/* global Translator, Utils */

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
    SOURCE_LANGUAGE: 'auto',
    TARGET_LANGUAGE: 'vie',
  };

  constructor() {
    super();
    this.maxContentLengthPerRequest = 1000;
  }

  async translateText(text, targetLanguage, sourceLanguage = this.DefaultLanguage.SOURCE_LANGUAGE) {
    try {
      const lines = text.split('\n');
      let queryLines = [];
      const responses = [];
      const lan = sourceLanguage === 'auto' ? $.ajax({
        async: false,
        data: `query=${encodeURIComponent(text)}`,
        method: 'POST',
        url: `${Utils.CORS_PROXY}https://fanyi.baidu.com/langdetect`,
      }).responseJSON.lan : sourceLanguage;

      while (lines.length > 0) {
        queryLines.push(lines.shift());

        if (lines.length === 0 || [...queryLines, lines[0]].join('\n').length > this.maxContentLengthPerRequest) {
          responses.push($.ajax({
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
      if (this.controller.signal.aborted) this.result = text;
      this.result = responses.map((a) => JSON.parse(a.responseText.split('\n').filter((b) => b.includes('"event":"Translating"'))[0].replace(/^data: /, '')).data.list.map((b) => b.dst).join('\n')).join('\n');
      super.translateText(text, targetLanguage, sourceLanguage);
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      this.result = error;
    }

    return this.result;
  }
}
