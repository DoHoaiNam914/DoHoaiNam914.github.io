'use strict'
export default class Translator {
  public controller
  public lastRequestData
  protected result
  public constructor () {
    this.controller = new AbortController()
    this.lastRequestData = null
    this.result = ''
  }

  public async translateText (text, targetLanguage, sourceLanguage = null): Promise<void> {
    this.lastRequestData = { sourceLanguage, targetLanguage, text }
  }
}
