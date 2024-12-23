'use strict'
/* global axios */
import Translator from '/static/js/dich-nhanh/Translator.js'
export default class DeeplTranslate extends Translator {
  /* https://api-free.deepl.com/v2/languages?type=source */
  SOURCE_LANGUAGE_LIST = JSON.parse('[{"language":"BG","name":"Bulgarian"},{"language":"CS","name":"Czech"},{"language":"DA","name":"Danish"},{"language":"DE","name":"German"},{"language":"EL","name":"Greek"},{"language":"EN","name":"English"},{"language":"ES","name":"Spanish"},{"language":"ET","name":"Estonian"},{"language":"FI","name":"Finnish"},{"language":"FR","name":"French"},{"language":"HU","name":"Hungarian"},{"language":"ID","name":"Indonesian"},{"language":"IT","name":"Italian"},{"language":"JA","name":"Japanese"},{"language":"KO","name":"Korean"},{"language":"LT","name":"Lithuanian"},{"language":"LV","name":"Latvian"},{"language":"NB","name":"Norwegian"},{"language":"NL","name":"Dutch"},{"language":"PL","name":"Polish"},{"language":"PT","name":"Portuguese"},{"language":"RO","name":"Romanian"},{"language":"RU","name":"Russian"},{"language":"SK","name":"Slovak"},{"language":"SL","name":"Slovenian"},{"language":"SV","name":"Swedish"},{"language":"TR","name":"Turkish"},{"language":"UK","name":"Ukrainian"},{"language":"ZH","name":"Chinese"}]')
  /* https://api-free.deepl.com/v2/languages?type=target */
  TARGET_LANGUAGE_LIST = JSON.parse('[{"language":"BG","name":"Bulgarian"},{"language":"CS","name":"Czech"},{"language":"DA","name":"Danish"},{"language":"DE","name":"German"},{"language":"EL","name":"Greek"},{"language":"EN","name":"English"},{"language":"ES","name":"Spanish"},{"language":"ET","name":"Estonian"},{"language":"FI","name":"Finnish"},{"language":"FR","name":"French"},{"language":"HU","name":"Hungarian"},{"language":"ID","name":"Indonesian"},{"language":"IT","name":"Italian"},{"language":"JA","name":"Japanese"},{"language":"KO","name":"Korean"},{"language":"LT","name":"Lithuanian"},{"language":"LV","name":"Latvian"},{"language":"NB","name":"Norwegian"},{"language":"NL","name":"Dutch"},{"language":"PL","name":"Polish"},{"language":"PT","name":"Portuguese"},{"language":"RO","name":"Romanian"},{"language":"RU","name":"Russian"},{"language":"SK","name":"Slovak"},{"language":"SL","name":"Slovenian"},{"language":"SV","name":"Swedish"},{"language":"TR","name":"Turkish"},{"language":"UK","name":"Ukrainian"},{"language":"ZH","name":"Chinese"}]')
  DefaultLanguage = {
    SOURCE_LANGUAGE: '',
    TARGET_LANGUAGE: 'EN-US'
  }

  maxContentLinePerRequest = 50
  maxRequestSize = 128 * 1024
  instance
  constructor (authKey) {
    super()
    this.instance = axios.create({
      baseURL: authKey.endsWith(':fx') ? 'https://api-free.deepl.com' : 'https://api.deepl.com',
      params: {
        auth_key: authKey
      },
      signal: this.controller.signal
    })
  }

  async translateText (text, targetLanguage, sourceLanguage = null) {
    const usage = await this.instance.get('/v2/usage').then(({ data }) => data).catch((error) => {
      throw error
    })
    if ((usage.character_limit - usage.character_count) < text.length) { throw new Error(`Bản dịch lỗi: Đã đạt đến giới hạn sử dụng của Auth Key này: ${usage.character_count}/${usage.character_limit}`) }
    const lines = text.split('\n')
    const responses = []
    let queries = []
    while (lines.length > 0) {
      queries.push(lines.shift())
      if (lines.length === 0 || (queries.length + 1) > this.maxContentLinePerRequest) {
        responses.push(this.instance.post('/v2/translate', new URLSearchParams({
          text: queries,
          target_lang: targetLanguage,
          source_lang: sourceLanguage != null && sourceLanguage !== '' ? sourceLanguage : null
        })))
        queries = []
      }
    }
    const result = await Promise.all(responses).then(responses => responses.map(({ data: { translations } }) => translations.map(({ text }) => text)).join('\n')).catch((error) => {
      throw error
    })
    super.translateText(text, targetLanguage, sourceLanguage)
    return result
  }
}
