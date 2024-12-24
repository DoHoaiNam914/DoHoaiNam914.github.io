'use strict'
/* global axios */
import Translator from '/static/js/dich-nhanh/Translator.js'
export default class DeeplTranslate extends Translator {
  /* https://api-free.deepl.com/v2/languages?type=source */
  public readonly SOURCE_LANGUAGE_LIST: Array<{ language: string, name: string }> = JSON.parse('[{"language":"BG","name":"Bulgarian"},{"language":"CS","name":"Czech"},{"language":"DA","name":"Danish"},{"language":"DE","name":"German"},{"language":"EL","name":"Greek"},{"language":"EN","name":"English"},{"language":"ES","name":"Spanish"},{"language":"ET","name":"Estonian"},{"language":"FI","name":"Finnish"},{"language":"FR","name":"French"},{"language":"HU","name":"Hungarian"},{"language":"ID","name":"Indonesian"},{"language":"IT","name":"Italian"},{"language":"JA","name":"Japanese"},{"language":"KO","name":"Korean"},{"language":"LT","name":"Lithuanian"},{"language":"LV","name":"Latvian"},{"language":"NB","name":"Norwegian"},{"language":"NL","name":"Dutch"},{"language":"PL","name":"Polish"},{"language":"PT","name":"Portuguese"},{"language":"RO","name":"Romanian"},{"language":"RU","name":"Russian"},{"language":"SK","name":"Slovak"},{"language":"SL","name":"Slovenian"},{"language":"SV","name":"Swedish"},{"language":"TR","name":"Turkish"},{"language":"UK","name":"Ukrainian"},{"language":"ZH","name":"Chinese"}]')
  /* https://api-free.deepl.com/v2/languages?type=target */
  public readonly TARGET_LANGUAGE_LIST: Array<{ language: string, name: string }> = JSON.parse('[{"language":"BG","name":"Bulgarian"},{"language":"CS","name":"Czech"},{"language":"DA","name":"Danish"},{"language":"DE","name":"German"},{"language":"EL","name":"Greek"},{"language":"EN","name":"English"},{"language":"ES","name":"Spanish"},{"language":"ET","name":"Estonian"},{"language":"FI","name":"Finnish"},{"language":"FR","name":"French"},{"language":"HU","name":"Hungarian"},{"language":"ID","name":"Indonesian"},{"language":"IT","name":"Italian"},{"language":"JA","name":"Japanese"},{"language":"KO","name":"Korean"},{"language":"LT","name":"Lithuanian"},{"language":"LV","name":"Latvian"},{"language":"NB","name":"Norwegian"},{"language":"NL","name":"Dutch"},{"language":"PL","name":"Polish"},{"language":"PT","name":"Portuguese"},{"language":"RO","name":"Romanian"},{"language":"RU","name":"Russian"},{"language":"SK","name":"Slovak"},{"language":"SL","name":"Slovenian"},{"language":"SV","name":"Swedish"},{"language":"TR","name":"Turkish"},{"language":"UK","name":"Ukrainian"},{"language":"ZH","name":"Chinese"}]')
  public readonly DefaultLanguage: { SOURCE_LANGUAGE: string, TARGET_LANGUAGE: string } = {
    SOURCE_LANGUAGE: '',
    TARGET_LANGUAGE: 'EN-US'
  }

  private readonly maxContentLinePerRequest: number = 50
  private readonly maxRequestSize: number = 128 * 1024
  private readonly instance: axios
  public constructor (authKey: string) {
    super()
    this.instance = axios.create({
      baseURL: authKey.endsWith(':fx') ? 'https://api-free.deepl.com' : 'https://api.deepl.com',
      params: {
        auth_key: authKey
      },
      signal: this.controller.signal
    })
  }

  public async translateText (text: string, targetLanguage: string, sourceLanguage: string | null = null): Promise<string | null> {
    const usage = await this.instance.get('/v2/usage').then(({ data }) => data).catch(({ data }) => {
      throw new Error(data)
    })
    if ((usage.character_limit - usage.character_count) < text.length) throw new Error(`Bản dịch lỗi: Đã đạt đến giới hạn sử dụng của Auth Key này: ${usage.character_count}/${usage.character_limit}`)
    const lines: string[] = text.split('\n')
    const responses: Array<Promise<{ data: { translations: Array<{ text: string }> } }>> = []
    let queries: string[] = []
    while (lines.length > 0) {
      queries.push(lines.shift() as string)
      if (lines.length === 0 || (queries.length + 1) > this.maxContentLinePerRequest) {
        responses.push(this.instance.post('/v2/translate', new URLSearchParams({
          text: queries,
          target_lang: targetLanguage,
          source_lang: sourceLanguage != null && sourceLanguage !== '' ? sourceLanguage : null
        })))
        queries = []
      }
    }
    const result: string = await Promise.all(responses).then(responses => responses.map(({ data: { translations } }) => translations.map(({ text }) => text)).join('\n')).catch(({ data }) => {
      throw new Error(data)
    })
    super.translateText(text, targetLanguage, sourceLanguage)
    return result
  }
}
