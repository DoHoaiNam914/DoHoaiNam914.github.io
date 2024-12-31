'use strict';
export default class Translator {
    controller = new AbortController();
    lastRequestData = null;
    result = '';
    async translateText(text, targetLanguage, sourceLanguage = null) {
        this.lastRequestData = { sourceLanguage, targetLanguage, text };
        return null;
    }
}
