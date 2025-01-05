'use strict'
export default class Translator {
  public controller: AbortController
  public lastRequestData: { [key: string]: any } | null
  protected result: string
  public constructor () {
    this.controller = new AbortController()
    this.lastRequestData = null
    this.result = ''
  }

  public async translateText (text: string, targetLanguage: string, sourceLanguage: string | null = null): Promise<string | null> {
    this.lastRequestData = { sourceLanguage, targetLanguage, text }
    return null
  }
}
