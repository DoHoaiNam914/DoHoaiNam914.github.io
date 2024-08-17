'use strict';

/* global Translator */

class CocCocEduTranslate extends Translator {
  /** https://api.cognitive.CocCocEduTranslate.com/languages?api-version=3.0 */
  static SOURCE_LANGUAGE_LIST = {
    auto: 'Tự động nhận diện',
    en: 'Tiếng Anh',
    vi: 'Tiếng Viết',
    ja: 'Tiếng Nhật',
    'zh-Hans': 'Tiếng Trung giản thể',
    'zh-Hant': 'Tiếng Trung phổn thể',
  };

  static TARGET_LANGUAGE_LIST = {
    en: 'Tiếng Anh',
    vi: 'Tiếng Viết',
    ja: 'Tiếng Nhật',
    'zh-Hans': 'Tiếng Trung giản thể',
    'zh-Hant': 'Tiếng Trung phổn thể',
  };

  DefaultLanguage = {
    SOURCE_LANGUAGE: 'auto',
    TARGET_LANGUAGE: 'vi',
  };

  constructor(tone) {
    super();
    this.maxContentLengthPerRequest = 1000;
    this.maxContentLinePerRequest = 25;
  }

  async translateText(text, targetLanguage, sourceLanguage = this.DefaultLanguage.SOURCE_LANGUAGE) {
    try {
      const lines = text.split(/\n/);
      let queryLines = [];
      const responses = [];

      while (lines.length > 0 && [...queryLines, lines[0]].join('\n').length <= this.maxContentLengthPerRequest && (queryLines.length + 1) <= this.maxContentLinePerRequest) {
        queryLines.push(lines.shift());

        if (lines.length === 0 || [...queryLines, lines[0]].join('\n').length > this.maxContentLengthPerRequest || (queryLines.length + 1) > this.maxContentLinePerRequest) {
          responses.push($.ajax({
            data: JSON.stringify({
              Text: queryLines.join('\n'),
            }),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            url: `${Utils.CORS_PROXY}https://hoctap.coccoc.com/composer/proxyapi/translate?from=${sourceLanguage ?? CocCocEduTranslate.AUTODETECT}&to=${targetLanguage}&reqid=undefined`,
          }));
          queryLines = [];
        }
      }

      await Promise.all(responses);
      this.result = responses.map((element) => element.responseJSON.proxyapi[0].translations[0].text).join('\n');
      this.requestIndex += 1;
      super.translateText(text, targetLanguage, sourceLanguage);
      return this.result;
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      this.result = error;
      throw error;
    }
  }
}
