'use strict'
export default class Translator {
  public controller: AbortController
  public lastRequestData: { sourceLanguage: string | null, targetLanguage: string, text: string } | null
  public result: string
  public constructor () {
    this.controller = new AbortController()
    this.lastRequestData = null
    this.result = ''
  }

  public async translateText (text: string, targetLanguage: string, sourceLanguage: string | null = null): Promise<string> {
    this.lastRequestData = { sourceLanguage, targetLanguage, text }
    return this.result
  }
}
