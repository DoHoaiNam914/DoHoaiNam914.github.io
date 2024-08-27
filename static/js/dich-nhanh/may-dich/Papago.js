'use strict';

/* global CryptoJS, Translator, Utils */

class Papago extends Translator {
  static SOURCE_LANGUAGE_LIST = {
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

  static TARGET_LANGUAGE_LIST = {
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

  DefaultLanguage = {
    SOURCE_LANGUAGE: 'auto',
    TARGET_LANGUAGE: 'vi',
  };

  constructor(uuid) {
    super();
    this.fetchVersion();
    this.uuid = uuid;
    this.maxContentLengthPerRequest = 3000;
  }

  fetchVersion() {
    try {
      const mainJs = $.ajax({
        async: false,
        cache: false,
        method: 'GET',
        url: `${Utils.CORS_PROXY}https://papago.naver.com`,
      }).responseText.match(/\/(main.*\.js)/)[1];
      const [__, version] = $.ajax({
        async: false,
        cache: false,
        method: 'GET',
        url: `${Utils.CORS_PROXY}https://papago.naver.com/${mainJs}`,
      }).responseText.match(/"PPG .*,"(v[^"]*)/);
      this.version = version;
    } catch (error) {
      console.error('Không thể lấy được Thông tin phiên bản:', error);
      throw console.error('Không thể lấy được Thông tin phiên bản!');
    }
  }

  async translateText(text, targetLanguage, sourceLanguage = this.DefaultLanguage.SOURCE_LANGUAGE) {
    try {
      const lines = text.split('\n');
      let queryLines = [];
      const responses = [];

      while (lines.length > 0 && [...queryLines, lines[0]].join('\n').length <= this.maxContentLengthPerRequest) {
        queryLines.push(lines.shift());

        if (lines.length === 0 || [...queryLines, lines[0]].join('\n').length > this.maxContentLengthPerRequest) {
          const timeStamp = (new Date()).getTime();
          responses.push($.ajax({
            data: `deviceId=${this.uuid}&locale=vi&dict=true&dictDisplay=30&honorific=true&instant=false&paging=false&source=${sourceLanguage}&target=${targetLanguage}&text=${encodeURIComponent(queryLines.join('\n'))}`,
            headers: {
              Accept: 'application/json',
              'Accept-Language': 'vi',
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
              'x-apigw-partnerid': 'papago',
              Authorization: `PPG ${this.uuid}:${CryptoJS.HmacMD5(`${this.uuid}\nhttps://papago.naver.com/apis/n2mt/translate\n${timeStamp}`, this.version).toString(CryptoJS.enc.Base64)}`,
              Timestamp: timeStamp,
            },
            method: 'POST',
            url: `${Utils.CORS_PROXY}https://papago.naver.com/apis/n2mt/translate`,
          }));
          queryLines = [];
        }
      }

      await Promise.all(responses);
      if (controller.signal.aborted) return text;
      this.result = responses.map((element) => element.responseJSON.translatedText).join('\n');
      super.translateText(text, targetLanguage, sourceLanguage);
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      this.result = error;
    }

    return this.result;
  }
}
