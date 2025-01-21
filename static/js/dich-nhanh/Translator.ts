'use strict'
export default class Translator {
  public controller
  public constructor () {
    this.controller = new AbortController()
  }

  public async translateText (text, targetLanguage, sourceLanguage = null): Promise<void> {}
}
