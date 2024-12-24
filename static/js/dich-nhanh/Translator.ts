'use strict'
export default class Translator {
  public controller: AbortController = new AbortController()
  public lastRequestData: { [key: string]: any } | null = null
  protected result: string = ''
  public async translateText (text: string, targetLanguage: string, sourceLanguage: string | null = null): Promise<string | null> {
    this.lastRequestData = { sourceLanguage, targetLanguage, text }
    return this.result
  }
}
