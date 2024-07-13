'use strict';

/* global Translator, Utils */

class WebNovelGoogleTranslate extends Translator {
  /** https://translate.googleapis.com/translate_a/l?client=chrome */
  static SOURCE_LANGUAGE_LIST = JSON.parse('{"auto":"Phát hiện ngôn ngữ","ar":"Ả Rập","sq":"Albania","am":"Amharic","en":"Anh","hy":"Armenia","as":"Assam","ay":"Aymara","az":"Azerbaijan","pl":"Ba Lan","fa":"Ba Tư","bm":"Bambara","xh":"Bantu","eu":"Basque","be":"Belarus","bn":"Bengal","bho":"Bhojpuri","bs":"Bosnia","pt":"Bồ Đào Nha","bg":"Bulgaria","ca":"Catalan","ceb":"Cebuano","ny":"Chichewa","co":"Corsi","ht":"Creole (Haiti)","hr":"Croatia","dv":"Dhivehi","iw":"Do Thái","doi":"Dogri","da":"Đan Mạch","de":"Đức","et":"Estonia","ee":"Ewe","tl":"Filipino","fy":"Frisia","gd":"Gael Scotland","gl":"Galicia","ka":"George","gn":"Guarani","gu":"Gujarat","nl":"Hà Lan","af":"Hà Lan (Nam Phi)","ko":"Hàn","ha":"Hausa","haw":"Hawaii","hi":"Hindi","hmn":"Hmong","hu":"Hungary","el":"Hy Lạp","is":"Iceland","ig":"Igbo","ilo":"Ilocano","id":"Indonesia","ga":"Ireland","jw":"Java","kn":"Kannada","kk":"Kazakh","km":"Khmer","rw":"Kinyarwanda","gom":"Konkani","kri":"Krio","ku":"Kurd (Kurmanji)","ckb":"Kurd (Sorani)","ky":"Kyrgyz","lo":"Lào","la":"Latinh","lv":"Latvia","ln":"Lingala","lt":"Litva","lg":"Luganda","lb":"Luxembourg","ms":"Mã Lai","mk":"Macedonia","mai":"Maithili","mg":"Malagasy","ml":"Malayalam","mt":"Malta","mi":"Maori","mr":"Marathi","mni-Mtei":"Meiteilon (Manipuri)","lus":"Mizo","mn":"Mông Cổ","my":"Myanmar","no":"Na Uy","ne":"Nepal","ru":"Nga","ja":"Nhật","or":"Odia (Oriya)","om":"Oromo","ps":"Pashto","sa":"Phạn","fr":"Pháp","fi":"Phần Lan","pa":"Punjab","qu":"Quechua","eo":"Quốc tế ngữ","ro":"Rumani","sm":"Samoa","cs":"Séc","nso":"Sepedi","sr":"Serbia","st":"Sesotho","sn":"Shona","sd":"Sindhi","si":"Sinhala","sk":"Slovak","sl":"Slovenia","so":"Somali","su":"Sunda","sw":"Swahili","tg":"Tajik","ta":"Tamil","tt":"Tatar","es":"Tây Ban Nha","te":"Telugu","th":"Thái","tr":"Thổ Nhĩ Kỳ","sv":"Thụy Điển","ti":"Tigrinya","zh-CN":"Trung'.concat(' (Giản thể)","zh-TW":"Trung (Phồn thể)').concat('","ts":"Tsonga","tk":"Turkmen","ak":"Twi","uk":"Ukraina","ur":"Urdu","ug":"Uyghur","uz":"Uzbek","vi":"Việt","cy":"Xứ Wales","it":"Ý","yi":"Yiddish","yo":"Yoruba","zu":"Zulu"}'));

  static TARGET_LANGUAGE_LIST = JSON.parse('{"ar":"Ả Rập","sq":"Albania","am":"Amharic","en":"Anh","hy":"Armenia","as":"Assam","ay":"Aymara","az":"Azerbaijan","pl":"Ba Lan","fa":"Ba Tư","bm":"Bambara","xh":"Bantu","eu":"Basque","be":"Belarus","bn":"Bengal","bho":"Bhojpuri","bs":"Bosnia","pt":"Bồ Đào Nha","bg":"Bulgaria","ca":"Catalan","ceb":"Cebuano","ny":"Chichewa","co":"Corsi","ht":"Creole (Haiti)","hr":"Croatia","dv":"Dhivehi","iw":"Do Thái","doi":"Dogri","da":"Đan Mạch","de":"Đức","et":"Estonia","ee":"Ewe","tl":"Filipino","fy":"Frisia","gd":"Gael Scotland","gl":"Galicia","ka":"George","gn":"Guarani","gu":"Gujarat","nl":"Hà Lan","af":"Hà Lan (Nam Phi)","ko":"Hàn","ha":"Hausa","haw":"Hawaii","hi":"Hindi","hmn":"Hmong","hu":"Hungary","el":"Hy Lạp","is":"Iceland","ig":"Igbo","ilo":"Ilocano","id":"Indonesia","ga":"Ireland","jw":"Java","kn":"Kannada","kk":"Kazakh","km":"Khmer","rw":"Kinyarwanda","gom":"Konkani","kri":"Krio","ku":"Kurd (Kurmanji)","ckb":"Kurd (Sorani)","ky":"Kyrgyz","lo":"Lào","la":"Latinh","lv":"Latvia","ln":"Lingala","lt":"Litva","lg":"Luganda","lb":"Luxembourg","ms":"Mã Lai","mk":"Macedonia","mai":"Maithili","mg":"Malagasy","ml":"Malayalam","mt":"Malta","mi":"Maori","mr":"Marathi","mni-Mtei":"Meiteilon (Manipuri)","lus":"Mizo","mn":"Mông Cổ","my":"Myanmar","no":"Na Uy","ne":"Nepal","ru":"Nga","ja":"Nhật","or":"Odia (Oriya)","om":"Oromo","ps":"Pashto","sa":"Phạn","fr":"Pháp","fi":"Phần Lan","pa":"Punjab","qu":"Quechua","eo":"Quốc tế ngữ","ro":"Rumani","sm":"Samoa","cs":"Séc","nso":"Sepedi","sr":"Serbia","st":"Sesotho","sn":"Shona","sd":"Sindhi","si":"Sinhala","sk":"Slovak","sl":"Slovenia","so":"Somali","su":"Sunda","sw":"Swahili","tg":"Tajik","ta":"Tamil","tt":"Tatar","es":"Tây Ban Nha","te":"Telugu","th":"Thái","tr":"Thổ Nhĩ Kỳ","sv":"Thụy Điển","ti":"Tigrinya","zh-CN":"Trung (Giản thể)","zh-TW":"Trung (Phồn thể)","ts":"Tsonga","tk":"Turkmen","ak":"Twi","uk":"Ukraina","ur":"Urdu","ug":"Uyghur","uz":"Uzbek","vi":"Việt","cy":"Xứ Wales","it":"Ý","yi":"Yiddish","yo":"Yoruba","zu":"Zulu"}');

  DefaultLanguage = {
    SOURCE_lANGUAGE: 'auto',
    TARGET_lANGUAGE: 'vi',
  };

  constructor() {
    super();
    this.clientName = 'gtx';
    this.maxDataPerRequest = 900;
    this.maxContentLinePerRequest = 25;
    this.maxDataPerRequest = 850;
  }

  async translateText(text, targetLanguage, sourceLanguage = this.DefaultLanguage.SOURCE_lANGUAGE) {
    try {
      const lines = text.split(/\n/);
      let queryLines = [];
      const CJK_LANGUAGE_CODE_LIST = ['ja', 'zh-CN', 'zh-TW'];
      const responses = [];

      while (lines.length > 0 && [...queryLines, lines[0]].join(CJK_LANGUAGE_CODE_LIST.some((element) => sourceLanguage === element) ? '||||' : '\\\\n').length <= this.maxDataPerRequest && queryLines.length + 1 <= this.maxContentLinePerRequest && [...queryLines, lines[0]].join('\n').length <= this.maxDataPerRequest) {
        queryLines.push(lines.shift());

        if (lines.length === 0 || [...queryLines, lines[0]].join(CJK_LANGUAGE_CODE_LIST.some((element) => sourceLanguage === element) ? '||||' : '\\\\n').length > this.maxDataPerRequest || queryLines.length > this.maxContentLinePerRequest || [...queryLines, lines[0]].join('\n').length > this.maxDataPerRequest) {
          responses.push($.ajax({
            method: 'GET',
            url: `${Utils.CORS_PROXY}http://translate.google.com/translate_a/single?client=${this.clientName}&ie=UTF-8&oe=UTF-8&dt=bd&dt=ex&dt=ld&dt=md&dt=rw&dt=rm&dt=ss&dt=t&dt=at&dt=gt&dt=qc&sl=${sourceLanguage}&tl=${targetLanguage}&hl=${targetLanguage}&q=${encodeURIComponent(queryLines.join(CJK_LANGUAGE_CODE_LIST.some((element) => sourceLanguage === element) ? '||||' : '\\\\n'))}`,
          }));
          queryLines = [];
        }
      }

      await Promise.all(responses);
      this.result = responses.map((element) => element.responseJSON[0].map(([first]) => first).join('').replaceAll(['ja', 'zh-CN', 'zh-TW'].some((b) => sourceLanguage === b) ? / ?(?:\|{4}|\|[| ]{3,}|\|+)(?!\|)/g : / ?\\+n/g, '\n')).join('\n');
      super.translateText(text, targetLanguage, sourceLanguage);
      return this.result;
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      throw error;
    }
  }
}
