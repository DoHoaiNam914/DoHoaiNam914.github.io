'use strict'
/* global axios */
import Translator from '../Translator.js'
import * as Utils from '../../Utils.js'
import CryptoJS from '../../../lib/crypto-js+esm.js'
export default class Papago extends Translator {
  public readonly SOURCE_LANGUAGE_LIST = {
    auto: 'Phát hiện ngôn ngữ',
    ko: 'Hàn',
    en: 'Anh',
    ja: 'Nhật',
    'zh-CN': 'Trung (Giản thể)',
    'zh-TW': 'Trung (Phồn thể)',
    es: 'Tây Ban Nha',
    fr: 'Pháp',
    de: 'Đức',
    ru: 'Nga',
    pt: 'Bồ Đào Nha',
    it: 'Ý',
    vi: 'Việt',
    th: 'Thái',
    id: 'Indonesia',
    hi: 'Hindi'
  }

  public readonly TARGET_LANGUAGE_LIST = {
    ko: 'Hàn',
    en: 'Anh',
    ja: 'Nhật',
    'zh-CN': 'Trung (Giản thể)',
    'zh-TW': 'Trung (Phồn thể)',
    es: 'Tây Ban Nha',
    fr: 'Pháp',
    de: 'Đức',
    ru: 'Nga',
    pt: 'Bồ Đào Nha',
    it: 'Ý',
    vi: 'Việt',
    th: 'Thái',
    id: 'Indonesia',
    hi: 'Hindi'
  }

  public readonly DefaultLanguage = {
    SOURCE_LANGUAGE: 'auto',
    TARGET_LANGUAGE: 'vi'
  }

  private readonly maxContentLengthPerRequest = 3000
  private readonly instance = axios.create({
    baseURL: `${Utils.CORS_HEADER_PROXY as string}https://papago.naver.com`,
    signal: this.controller.signal
  })

  private readonly uuid: string
  private version
  public constructor (uuid) {
    super()
    this.uuid = uuid
  }

  private async fetchVersion (): Promise<void> {
    await this.instance.get().then(async response => {
      await this.instance.get(`/${response.data.match(/\/(main.*\.js)/)[1] as string}`).then(response => {
        this.version = response.data.match(/"PPG .*,"(v[^"]*)/)[1]
      }).catch(error => {
        throw new Error(error.data)
      })
    }).catch(error => {
      throw new Error(error.data)
    })
  }

  public async translateText (text, targetLanguage: string, sourceLanguage = null): Promise<string> {
    if (this.version == null) await this.fetchVersion()
    const lines = text.split('\n')
    const responses: Array<Promise<{ [key: string]: any }>> = []
    const date = new Date()
    let queries: string[] = []
    while (lines.length > 0) {
      queries.push(lines.shift() as string)
      if (lines.length === 0 || [...queries, lines[0]].join('\n').length > this.maxContentLengthPerRequest) {
        const timeStamp: string = date.getTime()
        responses.push(this.instance.post('/apis/n2mt/translate', `deviceId=${this.uuid}&locale=vi&dict=true&dictDisplay=30&honorific=true&instant=false&paging=false&source=${sourceLanguage ?? this.DefaultLanguage.SOURCE_LANGUAGE}&target=${targetLanguage}&text=${encodeURIComponent(queries.join('\n'))}`, {
          headers: {
            Accept: 'application/json',
            'Accept-Language': 'vi',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'x-apigw-partnerid': 'papago',
            Authorization: `PPG ${this.uuid}:${CryptoJS.HmacMD5(`${this.uuid}\nhttps://papago.naver.com/apis/n2mt/translate\n${timeStamp}`, this.version).toString(CryptoJS.enc.Base64) as string}`,
            Timestamp: timeStamp
          }
        }))
        queries = []
      }
    }
    const result: string = await Promise.all(responses).then(value => value.map(element => element.data.translatedText).join('\n')).catch((reason: Error) => {
      throw reason
    })
    super.translateText(text, targetLanguage, sourceLanguage)
    return result
  }
}
