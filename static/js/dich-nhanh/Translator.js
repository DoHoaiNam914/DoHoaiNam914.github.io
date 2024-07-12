'use strict';

class Translator {
  constructor() {
    this.lastRequestData = null;
    this.result = '';
  }

  async translateText(text, targetLanguage, sourceLanguage = null) {
    this.lastRequestData = { sourceLanguage, targetLanguage, text };
  }
}