'use strict'

export default class Translator {
  constructor () {
    this.controller = new AbortController()
    this.lastRequestData = null
    this.result = ''
  }

  async translateText (text, targetLanguage, sourceLanguage = null) {
    this.lastRequestData = {
      sourceLanguage,
      targetLanguage,
      text
    }
    return this.result
  }
}
