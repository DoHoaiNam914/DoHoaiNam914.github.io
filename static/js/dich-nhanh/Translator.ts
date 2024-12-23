'use strict'
export default class Translator {
  public controller: AbortController
  public lastRequestData: { sourceLanguage: string | null, targetLanguage: string, text: string } | null
  public constructor () {
    this.controller = new AbortController()
    this.lastRequestData = null
  }

  public async translateText (text: string, targetLanguage: string, sourceLanguage: string | null = null): Promise<string | null> {
    this.lastRequestData = { sourceLanguage, targetLanguage, text }
    return null
  }
}
