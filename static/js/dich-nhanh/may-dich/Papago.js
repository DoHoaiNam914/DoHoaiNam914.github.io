'use strict';

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
    this.fetchVersion();
  }

  fetchVersion() {
    try {
      const mainJs = $.ajax({
        async: false,
        method: 'GET',
        url: `${Utils.CORS_PROXY}https://papago.naver.com`,
      }).responseText.match(/\/(main.*\.js)/)[1];
      const [__, version] = $.ajax({
        async: false,
        method: 'GET',
        url: `${Utils.CORS_PROXY}https://papago.naver.com/${mainJs}`,
      }).responseText.match(/"PPG .*,"(v[^"]*)/);
      this.version = version;
    } catch (error) {
      console.error('Không thể lấy được Thông tin phiên bản:', error);
      throw console.error('Không thể lấy được Thông tin phiên bản!');
    }
  }

  translateText(source, target, text) {
    try {
      const timeStamp = (new Date()).getTime();

      return $.ajax({
        async: false,
        data: `deviceId=${this.uuid}&locale=vi&dict=true&dictDisplay=30&honorific=true&instant=false&paging=false&source=${source}&target=${target}&text=${encodeURIComponent(text)}`,
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
      }).responseJSON.translatedText;
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      throw error;
    }
  }
}
