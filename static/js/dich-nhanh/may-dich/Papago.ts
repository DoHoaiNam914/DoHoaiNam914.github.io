'use strict'
/* global axios */
import Translator from '/static/js/dich-nhanh/Translator.js'
import * as Utils from '/static/js/Utils.js'
import CryptoJS from 'https://esm.run/crypto-js'
export default class Papago extends Translator {
  public readonly SOURCE_LANGUAGE_LIST: { [key: string]: string } = {
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

  public readonly TARGET_LANGUAGE_LIST: { [key: string]: string } = {
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

  public readonly DefaultLanguage: { SOURCE_LANGUAGE: string, TARGET_LANGUAGE: string } = {
    SOURCE_LANGUAGE: 'auto',
    TARGET_LANGUAGE: 'vi'
  }

  private readonly maxContentLengthPerRequest: number = 3000
  private readonly instance: axios = axios.create({
    baseURL: `${Utils.CORS_HEADER_PROXY}https://papago.naver.com`,
    signal: this.controller.signal
  })

  private readonly uuid: string
  private version: string
  public constructor (uuid: string) {
    super()
    this.uuid = uuid
  }

  private async fetchVersion (): Promise<void> {
    await this.instance.get().then(async (a: { data: string }) => {
      await this.instance.get(`/${(a.data.match(/\/(main.*\.js)/) as string[])[1]}`).then((b: { data: string }) => {
        this.version = (b.data.match(/"PPG .*,"(v[^"]*)/) as string[])[1]
      }).catch(({ data }) => {
        throw new Error(data)
      })
    }).catch(({ data }) => {
      throw new Error(data)
    })
  }

  public async translateText (text: string, targetLanguage: string, sourceLanguage: string | null = null): Promise<string | null> {
    if (this.version == null) await this.fetchVersion()
    const lines: string[] = text.split('\n')
    const responses: Array<Promise<{ data: { translatedText: string } }>> = []
    const date: Date = new Date()
    let queries: string[] = []
    while (lines.length > 0) {
      queries.push(lines.shift() as string)
      if (lines.length === 0 || [...queries, lines[0]].join('\n').length > this.maxContentLengthPerRequest) {
        const timeStamp: number = date.getTime()
        responses.push(this.instance.post('/apis/n2mt/translate', `deviceId=${this.uuid}&locale=vi&dict=true&dictDisplay=30&honorific=true&instant=false&paging=false&source=${sourceLanguage ?? this.DefaultLanguage.SOURCE_LANGUAGE}&target=${targetLanguage}&text=${encodeURIComponent(queries.join('\n'))}`, {
          headers: {
            Accept: 'application/json',
            'Accept-Language': 'vi',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'x-apigw-partnerid': 'papago',
            Authorization: `PPG ${this.uuid}:${CryptoJS.HmacMD5(`${this.uuid}\nhttps://papago.naver.com/apis/n2mt/translate\n${timeStamp}`, this.version).toString(CryptoJS.enc.Base64)}`,
            Timestamp: timeStamp
          }
        }))
        queries = []
      }
    }
    const result: string = await Promise.all(responses).then(responses => responses.map(({ data: { translatedText } }) => translatedText).join('\n')).catch(({ data }) => {
      throw new Error(data)
    })
    super.translateText(text, targetLanguage, sourceLanguage)
    return result
  }
}
