'use strict'
/* global axios */
import Translator from '/static/js/dich-nhanh/Translator.js'
import * as Utils from '/static/js/Utils.js'
export default class BaiduTranslate extends Translator {
  public readonly SOURCE_LANGUAGE_LIST: { [key: string]: string } = {
    auto: 'Automatic detection',
    jp: 'Japanese',
    en: 'English',
    vie: 'Vietnamese',
    zh: 'Chinese',
    cht: 'Traditional Chinese'
  }

  public readonly TARGET_LANGUAGE_LIST: { [key: string]: string } = {
    jp: 'Japanese',
    en: 'English',
    vie: 'Vietnamese',
    zh: 'Chinese',
    cht: 'Traditional Chinese'
  }

  public readonly DefaultLanguage: { SOURCE_LANGUAGE: string, TARGET_LANGUAGE: string } = {
    SOURCE_LANGUAGE: 'auto',
    TARGET_LANGUAGE: 'vie'
  }

  private readonly maxContentLengthPerRequest: number = 1000
  private readonly instance: AxiosInstance = axios.create({
    baseURL: `${Utils.CORS_HEADER_PROXY}https://fanyi.baidu.com`,
    signal: this.controller.signal
  })

  public async translateText (text: string, targetLanguage: string, sourceLanguage: string | null = null): Promise<string | null> {
    const lines: string[] = text.split('\n')
    const lan: string = (sourceLanguage ?? this.DefaultLanguage.SOURCE_LANGUAGE) === 'auto' ? await this.instance.post('/langdetect', new URLSearchParams(`query=${text}`)).then(({ data: { lan } }) => lan).catch(({ data }) => {
      throw new Error(data)
    }) : sourceLanguage
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
    const result: string = await Promise.all(responses).then(responses => responses.map(({ data }) => window.JSON.parse(data.split('\n').filter(element => element.includes('"event":"Translating"'))[0].replace(/^data: /, '')).data.list.map(({ dst }) => dst).join('\n')).join('\n')).catch((reason: Error) => {
      throw reason
    })
    super.translateText(text, targetLanguage, sourceLanguage)
    return result
  }
}
