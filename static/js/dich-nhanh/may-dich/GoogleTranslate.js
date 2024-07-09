'use strict';

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
    this.clientName = 'gtx';
    this.baseUrl = 'https://translate.googleapis.com';
  }

  // fetchData() {
  //   try {
  //     const bingTranslatorHtml = $.ajax({
  //       async: false,
  //       method: 'GET',
  //       url: `${Utils.CORS_PROXY}https://translate.google.com/?sl=auto&tl=vi&op=translate`,
  //     }).responseText;

  //     const [__, fSid] = bingTranslatorHtml.match(/"FdrFJe":"(\d+)"/);
  //     const [___, bl] = bingTranslatorHtml.match(/"cfb2h":"([^"]+)"/);

  //     this.fSid = fSid;
  //     this.bl = bl;
  //   } catch (error) {
  //     console.error('Không thể lấy được Data:', error);
  //     throw console.error('Không thể lấy được Data!');
  //   }
  // }

  // translateText(sourceLang, targetLang, text) {
  //   try {
  //     return $.ajax({
  //       async: false,
  //       data: `f.req=${encodeURIComponent(JSON.stringify([[['MkEWBc', JSON.stringify([[text, sourceLang, targetLang, 1], []]), null, 'generic']]]))}&`,
  //       headers: {
  //         'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
  //       },
  //       method: 'POST',
  //       url: `${Utils.CORS_PROXY}https://translate.google.com/_/TranslateWebserverUi/data/batchexecute?rpcids=MkEWBc&source-path=%2F&f.sid=${this.fSid}&bl=${this.bl}&hl=vi&soc-app=1&soc-platform=1&soc-device=1&_reqid=${Utils.getRandomInt(10000, 9999999)}&rt=c`,
  //     }).responseText;
  //   } catch (error) {
  //     console.error('Bản dịch lỗi:', error);
  //     throw error;
  //   }
  // }

  static stringToUtf8ByteArray(string) {
    const utf8Bytes = [];

    for (let i = 0; i < string.length; i += 1) {
      let charCode = string.charCodeAt(i);

      if (charCode < 128) {
        utf8Bytes.push(charCode);
      } else {
        if (charCode < 2048) {
          utf8Bytes.push(Math.floor(charCode / 64) + 192);
        } else {
          if (charCode >= 55296 && charCode <= 57343 && i + 1 < string.length && string.charCodeAt(i + 1) >= 56320 && string.charCodeAt(i + 1) <= 57343) {
            charCode = 65536 + ((charCode - 55296) * 1024) + (string.charCodeAt(i += 1) - 56320);
            utf8Bytes.push(Math.floor(charCode / 262144) + 240);
            utf8Bytes.push(Math.floor((charCode % 262144) / 4096) + 128);
          } else {
            utf8Bytes.push(Math.floor(charCode / 4096) + 224);
          }

          utf8Bytes.push(Math.floor((charCode % 4096) / 64) + 128);
        }

        utf8Bytes.push((charCode % 64) + 128);
      }
    }

    return utf8Bytes;
  }

  /* eslint-disable no-bitwise */

  static applyTokenGenerator(securityKey, operationsString) {
    let result = securityKey;

    for (let c = 0; c < operationsString.length - 2; c += 3) {
      let shifted = operationsString.charAt(c + 2);
      shifted = shifted >= 'a' ? shifted.charCodeAt(0) - 87 : Number(shifted);
      shifted = operationsString.charAt(c + 1) === '+' ? result >>> shifted : result << shifted;
      result = operationsString.charAt(c) === '+' ? (result + shifted) % 4294967295 : result ^ shifted;
    }

    return result;
  }

  static getSecurityHash(query, securityKey, tokenGeneratorKey) {
    const utf8Bytes = GoogleTranslate.stringToUtf8ByteArray(query);
    let accumulator = Number(securityKey) || 0;

    for (let i = 0; i < utf8Bytes.length; i += 1) {
      accumulator += utf8Bytes[i];
      accumulator = GoogleTranslate.applyTokenGenerator(accumulator, '+-a^+6');
    }

    accumulator = GoogleTranslate.applyTokenGenerator(accumulator, '+-3^+b+-f');
    accumulator ^= Number(tokenGeneratorKey) || 0;
    if (accumulator < 0) accumulator = (accumulator & 2147483647) + 2147483648;
    return accumulator % 1E6;
  }

  static getSecurityToken(query, securityKey) {
    const parts = securityKey.split('.');
    const keyPart1 = Number(parts[0]) || 0;
    const securityHash = GoogleTranslate.getSecurityHash(query, keyPart1, Number(parts[1]) || 0);
    return `${securityHash.toString()}.${securityHash ^ keyPart1}`;
  }

  /* eslint-enable no-bitwise */

  getSecurityKey() {
    if (this.securityKeyTokenGenerator != null) return this.securityKeyTokenGenerator;
    let charT = String.fromCharCode(84);
    const charK = String.fromCharCode(75);

    charT = [charT, charT];
    charT[1] = charK;

    this.securityKeyTokenGenerator = window[charT.join(charK)] || '';
    return this.securityKeyTokenGenerator || '';
  }

  getSecurityParam(querys) {
    const query = querys.join('');
    return GoogleTranslate.getSecurityToken(query, this.getSecurityKey());
  }

  translateText(sourceLanguage, targetLanguage, query) {
    try {
      const querys = query.split('\n');
      return $.ajax({
        async: false,
        data: `q=${querys.map((element) => encodeURIComponent(element)).join('&q=')}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        method: 'POST',
        url: `${this.baseUrl}/translate_a/t?client=${this.clientName}&sl=${sourceLanguage}&tl=${targetLanguage}&hl=vi&v=1.0&ie=UTF-8&oe=UTF-8&source=text&tk=${this.getSecurityParam(querys)}`,
      }).responseJSON.map((element) => (sourceLanguage === 'auto' ? element[0] : element)).join('\n');
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      throw error;
    }
  }
}
