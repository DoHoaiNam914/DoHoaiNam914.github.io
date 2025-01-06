'use strict'
/* global axios */
import Translator from '../Translator.js'
import * as Utils from '../../Utils.js'
export default class BaiduTranslate extends Translator {
  public readonly SOURCE_LANGUAGE_LIST = {
    auto: 'Automatic detection',
    jp: 'Japanese',
    en: 'English',
    vie: 'Vietnamese',
    zh: 'Chinese',
    cht: 'Traditional Chinese'
  }

  public readonly TARGET_LANGUAGE_LIST = {
    jp: 'Japanese',
    en: 'English',
    vie: 'Vietnamese',
    zh: 'Chinese',
    cht: 'Traditional Chinese'
  }

  public readonly DefaultLanguage = {
    SOURCE_LANGUAGE: 'auto',
    TARGET_LANGUAGE: 'vie'
  }

  private readonly maxContentLengthPerRequest = 1000
  private readonly instance = axios.create({
    baseURL: `${Utils.CORS_HEADER_PROXY as string}https://fanyi.baidu.com`,
    signal: this.controller.signal
  })

  public async translateText (text: string, targetLanguage, sourceLanguage = null): Promise<string> {
    const lines = text.split('\n')
    const lan = (sourceLanguage ?? this.DefaultLanguage.SOURCE_LANGUAGE) === 'auto'
      ? await this.instance.post('/langdetect', new URLSearchParams(`query=${text}`)).then(response => response.data.lan).catch(error => {
        throw new Error(error.data)
      })
      : sourceLanguage
    const responses: Array<Promise<{ data: string }>> = []
    let queries: string[] = []
    while (lines.length > 0) {
      queries.push(lines.shift() as string)
      if (lines.length === 0 || [...queries, lines[0]].join('\n').length > this.maxContentLengthPerRequest) {
        responses.push(this.instance.post('/ait/text/translate', JSON.stringify({
          query: queries.join('\n'),
          from: lan,
          to: targetLanguage,
          reference: '',
          corpusIds: [],
          qcSettings: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
          domain: 'common'
        }), {
          headers: { 'Content-Type': 'application/json' }
        }))
        queries = []
      }
    }
    const result = await Promise.all(responses).then(value => value.map(element => JSON.parse(element.data.split('\n').filter(element => element.includes('"event":"Translating"'))[0].replace(/^data: /, '')).data.list.map(element => element.dst).join('\n')).join('\n')).catch(reason => {
      throw reason
    })
    super.translateText(text, targetLanguage, sourceLanguage)
    return result
  }
}
