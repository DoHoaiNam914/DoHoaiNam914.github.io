'use strict';

import Translator from '/static/js/dich-nhanh/Translator.js';
import Utils from '/static/js/Utils.js';

export default class BaiduTranslate extends Translator {
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
    this.instance = axios.create({
      baseURL: `${Utils.CORS_PROXY}https://fanyi.baidu.com`,
      signal: this.controller.signal,
    });
  }

  async translateText(text, targetLanguage, sourceLanguage = this.DefaultLanguage.SOURCE_LANGUAGE) {
    const lines = text.split('\n');
    const lan = sourceLanguage === 'auto' ? await this.instance.post('/langdetect', `query=${encodeURIComponent(text)}`).then(({ data }) => data.lan).catch(() => sourceLanguage) : '';
    const responses = [];
    let requestLines = [];

    while (lines.length > 0) {
      requestLines.push(lines.shift());

      if (lines.length === 0 || [...requestLines, lines[0]].join('\n').length > this.maxContentLengthPerRequest) {
        responses.push(this.instance.post('/ait/text/translate', JSON.stringify({
          query: requestLines.join('\n'),
          from: sourceLanguage === 'auto' ? lan : sourceLanguage,
          to: targetLanguage,
          reference: '',
          corpusIds: [],
          qcSettings: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
          domain: 'common',
        }), {
          headers: { 'Content-Type': 'application/json' },
          signal: this.controller.signal,
        }));
        requestLines = [];
      }
    }

    await Promise.all(responses).then((responses) => {
      this.result = responses.map(({ data }) => JSON.parse(data.split('\n').filter((element) => element.includes('"event":"Translating"'))[0].replace(/^data: /, '')).data.list.map((element) => element.dst).join('\n')).join('\n');
      super.translateText(text, targetLanguage, sourceLanguage);
    }).catch((error) => {
      this.result = `Bản dịch lỗi: ${error}`;
    });

    return this.result;
  }
}
