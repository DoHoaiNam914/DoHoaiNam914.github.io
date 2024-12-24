'use strict'
/* global axios */
import Translator from '/static/js/dich-nhanh/Translator.js'
import * as Utils from '/static/js/Utils.js'
export default class CoccocEduTranslate extends Translator {
  /* https://hoctap.coccoc.com/composer/edu?cat=dich&m=1&reqid=undefined&tbm=edu */
  LANGUAGE_LIST = JSON.parse('[{"label":"Tự động nhận diện","value":"auto"},{"label":"Tiếng Anh","value":"en"},{"label":"Tiếng Việt","value":"vi"},{"label":"Tiếng Afrikaans","value":"af"},{"label":"Tiếng Assam","value":"as"},{"label":"Tiếng Ả Rập","value":"ar"},{"label":"Tiếng Ba Lan","value":"pl"},{"label":"Tiếng Ba Tư","value":"fa"},{"label":"Tiếng Bengal","value":"bn"},{"label":"Tiếng Bồ Đào Nha (Brazil)","value":"pt"},{"label":"Tiếng Bồ Đào Nha","value":"pt-pt"},{"label":"Tiếng Bosnia (Latin)","value":"bs"},{"label":"Tiếng Bulgaria","value":"bg"},{"label":"Tiếng Cantonese","value":"yue"},{"label":"Tiếng Catalan","value":"ca"},{"label":"Tiếng Creole Haiti","value":"ht"},{"label":"Tiếng Croatia","value":"hr"},{"label":"Tiếng Đan Mạch","value":"da"},{"label":"Tiếng Dari","value":"prs"},{"label":"Tiếng Do Thái","value":"he"},{"label":"Tiếng Đức","value":"de"},{"label":"Tiếng Estonia","value":"et"},{"label":"Tiếng Fiji","value":"fj"},{"label":"Tiếng Gujarat","value":"gu"},{"label":"Tiếng Hà Lan","value":"nl"},{"label":"Tiếng Hàn Quốc","value":"ko"},{"label":"Tiếng Hindi","value":"hi"},{"label":"Tiếng H\'Mông","value":"mww"},{"label":"Tiếng Hungary","value":"hu"},{"label":"Tiếng Hy Lạp","value":"el"},{"label":"Tiếng Iceland","value":"is"},{"label":"Tiếng Indonesia","value":"id"},{"label":"Tiếng Ireland","value":"ga"},{"label":"Tiếng Kannada","value":"kn"},{"label":"Tiếng Kazakhstan","value":"kk"},{"label":"Tiếng Kiswahili","value":"sw"},{"label":"Tiếng Klingon (plqaD)","value":"tlh-Piqd"},{"label":"Tiếng Klingon","value":"tlh-Latn"},{"label":"Tiếng Kurdish (Central)","value":"ku"},{"label":"Tiếng Kurdish (Northern)","value":"kmr"},{"label":"Tiếng Latvia","value":"lv"},{"label":"Tiếng Litva","value":"lt"},{"label":"Tiếng Malagasy","value":"mg"},{"label":"Tiếng Mã Lai","value":"ms"},{"label":"Tiếng Malayalam","value":"ml"},{"label":"Tiếng Malta","value":"mt"},{"label":"Tiếng Maori","value":"mi"},{"label":"Tiếng Marathi","value":"mr"},{"label":"Tiếng Na Uy","value":"nb"},{"label":"Tiếng Nga","value":"ru"},{"label":"Tiếng Nhật","value":"ja"},{"label":"Tiếng Oriya","value":"or"},{"label":"Tiếng Pashtun","value":"ps"},{"label":"Tiếng Phần Lan","value":"fi"},{"label":"Tiếng Pháp","value":"fr"},{"label":"Tiếng Philippines","value":"fil"},{"label":"Tiếng Punjabi","value":"pa"},{"label":"Tiếng Queretaro Otomi","value":"otq"},{"label":"Tiếng Rumani","value":"ro"},{"label":"Tiếng Samoan","value":"sm"},{"label":"Tiếng Séc","value":"cs"},{"label":"Tiếng Serbia (Cyrillic)","value":"sr-Cyrl"},{"label":"Tiếng Serbia (Latin)","value":"sr-Latn"},{"label":"Tiếng Slovak","value":"sk"},{"label":"Tiếng Slovenia","value":"sl"},{"label":"Tiếng Tahitian","value":"ty"},{"label":"Tiếng Tamil","value":"ta"},{"label":"Tiếng Tây Ban Nha","value":"es"},{"label":"Tiếng Telugu","value":"te"},{"label":"Tiếng Thái","value":"th"},{"label":"Tiếng Thổ Nhĩ Kỳ","value":"tr"},{"label":"Tiếng Thụy Điển","value":"sv"},{"label":"Tiếng Tongan","value":"to"},{"label":"Tiếng Trung giản thể","value":"zh-Hans"},{"label":"Tiếng Trung phồn thể","value":"zh-Hant"},{"label":"Tiếng Ukraine","value":"uk"},{"label":"Tiếng Urdu","value":"ur"},{"label":"Tiếng Xứ Wales","value":"cy"},{"label":"Tiếng Ý","value":"it"},{"label":"Tiếng Yucatec Maya","value":"yua"}]')
  DefaultLanguage = {
    SOURCE_LANGUAGE: 'auto',
    TARGET_LANGUAGE: 'vi'
  }

  maxContentLengthPerRequest = 1000 - 282
  maxContentLinePerRequest = 25 - 24
  async translateText (text, targetLanguage, sourceLanguage = null) {
    const lines = text.split('\n')
    const responses = []
    let queries = []
    while (lines.length > 0) {
      queries.push(lines.shift())
      if (lines.length === 0 || [...queries, lines[0]].join('\n').length > this.maxContentLengthPerRequest || (queries.length + 1) > this.maxContentLinePerRequest) {
        responses.push(axios.post(`${Utils.CORS_HEADER_PROXY}https://hoctap.coccoc.com/composer/proxyapi/translate`, JSON.stringify({ Text: queries.join('\n') }), {
          headers: { 'Content-Type': 'application/json' },
          params: {
            from: sourceLanguage ?? this.DefaultLanguage.SOURCE_LANGUAGE,
            to: targetLanguage,
            reqid: 'undefined'
          },
          signal: this.controller.signal
        }))
        queries = []
      }
    }
    const result = await Promise.all(responses).then(responses => responses.map(({ data: { proxyapi: [{ translations: [{ text }] }] } }) => text).join('\n')).catch(({ data }) => {
      throw new Error(data)
    })
    super.translateText(text, targetLanguage, sourceLanguage)
    return result
  }
}
