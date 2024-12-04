'use strict';

import Translator from '/static/js/dich-nhanh/Translator.js';
import Utils from '/static/js/Utils.js';

export default class GoogleTranslate extends Translator {
  /** https://translation.googleapis.com/language/translate/v2/languages?prettyPrint=false&target=vi&key=${key} */
  static LANGUAGE_LIST = JSON.parse('{"data":{"languages":[{"language":"ar","name":"Ả Rập"},{"language":"ab","name":"Abkhaz"},{"language":"ace","name":"Aceh"},{"language":"ach","name":"Acholi"},{"language":"sq","name":"Albania"},{"language":"alz","name":"Alur"},{"language":"am","name":"Amharic"},{"language":"en","name":"Anh"},{"language":"hy","name":"Armenia"},{"language":"as","name":"Assam"},{"language":"awa","name":"Awadhi"},{"language":"ay","name":"Aymara"},{"language":"az","name":"Azerbaijan"},{"language":"pl","name":"Ba Lan"},{"language":"fa","name":"Ba Tư"},{"language":"ban","name":"Bali"},{"language":"bm","name":"Bambara"},{"language":"xh","name":"Bantu"},{"language":"ba","name":"Bashkir"},{"language":"eu","name":"Basque"},{"language":"btx","name":"Batak Karo"},{"language":"bts","name":"Batak Simalungun"},{"language":"bbc","name":"Batak Toba"},{"language":"be","name":"Belarus"},{"language":"bem","name":"Bemba"},{"language":"bn","name":"Bengal"},{"language":"bew","name":"Betawi"},{"language":"bho","name":"Bhojpuri"},{"language":"bik","name":"Bikol"},{"language":"bs","name":"Bosnia"},{"language":"pt","name":"Bồ Đào Nha (Brazil)"},{"language":"br","name":"Breton"},{"language":"bg","name":"Bulgaria"},{"language":"bua","name":"Buryat"},{"language":"ca","name":"Catalan"},{"language":"ceb","name":"Cebuano"},{"language":"ny","name":"Chichewa"},{"language":"cv","name":"Chuvash"},{"language":"co","name":"Corsi"},{"language":"ht","name":"Creole (Haiti)"},{"language":"crs","name":"Creole Seychelles"},{"language":"hr","name":"Croatia"},{"language":"dv","name":"Dhivehi"},{"language":"din","name":"Dinka"},{"language":"iw","name":"Do Thái"},{"language":"doi","name":"Dogri"},{"language":"dov","name":"Dombe"},{"language":"dz","name":"Dzongkha"},{"language":"da","name":"Đan Mạch"},{"language":"de","name":"Đức"},{"language":"et","name":"Estonia"},{"language":"ee","name":"Ewe"},{"language":"fj","name":"Fiji"},{"language":"tl","name":"Filipino"},{"language":"fy","name":"Frisia"},{"language":"ff","name":"Fulani"},{"language":"gaa","name":"Gaa"},{"language":"gd","name":"Gael Scotland"},{"language":"gl","name":"Galicia"},{"language":"gn","name":"Guarani"},{"language":"gu","name":"Gujarat"},{"language":"nl","name":"Hà Lan"},{"language":"af","name":"Hà Lan (Nam Phi)"},{"language":"cnh","name":"Hakha Chin"},{"language":"ko","name":"Hàn"},{"language":"ha","name":"Hausa"},{"language":"haw","name":"Hawaii"},{"language":"hil","name":"Hiligaynon"},{"language":"hi","name":"Hindi"},{"language":"hmn","name":"Hmong"},{"language":"hu","name":"Hungary"},{"language":"hrx","name":"Hunsrik"},{"language":"el","name":"Hy Lạp"},{"language":"is","name":"Iceland"},{"language":"ig","name":"Igbo"},{"language":"ilo","name":"Ilocano"},{"language":"id","name":"Indonesia"},{"language":"ga","name":"Ireland"},{"language":"jw","name":"Java"},{"language":"kn","name":"Kannada"},{"language":"pam","name":"Kapampangan"},{"language":"kk","name":"Kazakh"},{"language":"km","name":"Khmer"},{"language":"cgg","name":"Kiga"},{"language":"rw","name":"Kinyarwanda"},{"language":"ktu","name":"Kituba"},{"language":"gom","name":"Konkani"},{"language":"kri","name":"Krio"},{"language":"ku","name":"Kurd (Kurmanji)"},{"language":"ckb","name":"Kurd (Sorani)"},{"language":"ky","name":"Kyrgyz"},{"language":"lo","name":"Lào"},{"language":"ltg","name":"Latgale"},{"language":"la","name":"Latinh"},{"language":"lv","name":"Latvia"},{"language":"lij","name":"Liguria"},{"language":"li","name":"Limburg"},{"language":"ln","name":"Lingala"},{"language":"lt","name":"Litva"},{"language":"lmo","name":"Lombard"},{"language":"lg","name":"Luganda"},{"language":"luo","name":"Luo"},{"language":"lb","name":"Luxembourg"},{"language":"ms","name":"Mã Lai"},{"language":"mk","name":"Macedonia"},{"language":"mai","name":"Maithili"},{"language":"mak","name":"Makassar"},{"language":"mg","name":"Malagasy"},{"language":"ms-Arab","name":"Malay (Jawi)"},{"language":"ml","name":"Malayalam"},{"language":"mt","name":"Malta"},{"language":"mi","name":"Maori"},{"language":"mr","name":"Marathi"},{"language":"yua","name":"Maya Yucatec"},{"language":"chm","name":"Meadow Mari"},{"language":"mni-Mtei","name":"Meiteilon (Manipuri)"},{"language":"min","name":"Minang"},{"language":"lus","name":"Mizo"},{"language":"mn","name":"Mông Cổ"},{"language":"my","name":"Myanmar"},{"language":"no","name":"Na Uy"},{"language":"nr","name":"Nam Ndebele"},{"language":"ne","name":"Nepal"},{"language":"ru","name":"Nga"},{"language":"ja","name":"Nhật"},{"language":"nus","name":"Nuer"},{"language":"oc","name":"Occitan"},{"language":"or","name":"Odia (Oriya)"},{"language":"om","name":"Oromo"},{"language":"pag","name":"Pangasinan"},{"language":"pap","name":"Papiamento"},{"language":"ps","name":"Pashto"},{"language":"sa","name":"Phạn"},{"language":"fr","name":"Pháp"},{"language":"fi","name":"Phần Lan"},{"language":"pa","name":"Punjab (Gurmukhi)"},{"language":"pa-Arab","name":"Punjab (Shahmukhi)"},{"language":"yue","name":"Quảng Đông"},{"language":"qu","name":"Quechua"},{"language":"eo","name":"Quốc tế ngữ"},{"language":"rom","name":"Romani"},{"language":"ro","name":"Rumani"},{"language":"rn","name":"Rundi"},{"language":"sm","name":"Samoa"},{"language":"sg","name":"Sango"},{"language":"cs","name":"Séc"},{"language":"nso","name":"Sepedi"},{"language":"sr","name":"Serbia"},{"language":"st","name":"Sesotho"},{"language":"shn","name":"Shan"},{"language":"sn","name":"Shona"},{"language":"scn","name":"Sicily"},{"language":"szl","name":"Silesia"},{"language":"sd","name":"Sindhi"},{"language":"si","name":"Sinhala"},{"language":"sk","name":"Slovak"},{"language":"sl","name":"Slovenia"},{"language":"so","name":"Somali"},{"language":"su","name":"Sunda"},{"language":"sw","name":"Swahili"},{"language":"ss","name":"Swati"},{"language":"tg","name":"Tajik"},{"language":"ta","name":"Tamil"},{"language":"tt","name":"Tatar"},{"language":"crh","name":"Tatar Krym"},{"language":"es","name":"Tây Ban Nha"},{"language":"te","name":"Telugu"},{"language":"tet","name":"Tetum"},{"language":"th","name":"Thái"},{"language":"tr","name":"Thổ Nhĩ Kỳ"},{"language":"sv","name":"Thụy Điển"},{"language":"ka","name":"Tiếng Georgia"},{"language":"new","name":"Tiếng Nepal Bhasa (tiếng Newar)"},{"language":"ti","name":"Tigrinya"},{"language":"zh","name":"Trung (Giản thể)"},{"language":"zh-TW","name":"Trung (Phồn thể)"},{"language":"ts","name":"Tsonga"},{"language":"tn","name":"Tswana"},{"language":"tk","name":"Turkmen"},{"language":"ak","name":"Twi"},{"language":"uk","name":"Ukraina"},{"language":"ur","name":"Urdu"},{"language":"ug","name":"Uyghur"},{"language":"uz","name":"Uzbek"},{"language":"vi","name":"Việt"},{"language":"cy","name":"Xứ Wales"},{"language":"it","name":"Ý"},{"language":"yi","name":"Yiddish"},{"language":"yo","name":"Yoruba"},{"language":"zu","name":"Zulu"},{"language":"he","name":"Do Thái"},{"language":"jv","name":"Java"},{"language":"zh-CN","name":"Trung (Giản thể)"}]}}').data.languages;

  DefaultLanguage = {
    SOURCE_LANGUAGE: 'auto',
    TARGET_LANGUAGE: 'vi',
  };

  constructor(key) {
    super();
    this.key = key;
    this.maxRequestUrlLength = 2048;
  }

  async translateText(text, targetLanguage, sourceLanguage = this.DefaultLanguage.SOURCE_LANGUAGE) {
    const lines = text.split('\n');
    const textEncoder = new TextEncoder();
    const responses = [];
    let requestLines = [];

    while (lines.length > 0) {
      requestLines.push(lines.shift());

      if (lines.length === 0 || `${Utils.CORS_PROXY}https://translation.googleapis.com/language/translate/v2?prettyPrint=false${sourceLanguage !== this.DefaultLanguage.SOURCE_LANGUAGE ? `&source=${sourceLanguage}` : ''}&target=${targetLanguage}&q=${[...requestLines, lines[0]].map((element) => encodeURIComponent(element)).join('&q=')}&key=${this.key}`.length > this.maxRequestUrlLength) {
        responses.push(axios.post(`${Utils.CORS_PROXY}https://translation.googleapis.com/language/translate/v2?${requestLines.length === 1 ? '' : `q=${requestLines.slice(0, -1).map((element) => encodeURIComponent(element)).join('&q=')}`}`, undefined, {
          headers: {
            'User-Agent': 'com.google.GoogleBooks/6.8.1 google-api-objc-client/3.0 iPhone/18.1.1 hw/iPhone17_2 (gzip)',
            'content-type': 'application/json; charset=utf-8',
            'accept-language': 'vi-VN,vi;q=0.9',
            'cache-control': 'no-cache',
          },
          params: {
            prettyPrint: false,
            q: requestLines.pop(),
            source: sourceLanguage == null || sourceLanguage !== this.DefaultLanguage.SOURCE_LANGUAGE ? sourceLanguage : null,
            target: targetLanguage,
            key: this.key,
          },
          signal: this.controller.signal,
        }));
        requestLines = [];
      }
    }

    await Promise.all(responses).then((responses) => {
      this.result = Utils.convertHtmlToText(responses.map(({ data: { data: { translations } } }) => translations.map((element) => element.translatedText)).flat().join('\n'));
      super.translateText(text, targetLanguage, sourceLanguage);
    }).catch((error) => {
      this.result = `Bản dịch lỗi: ${error}`;
    });

    return this.result;
  }
}
