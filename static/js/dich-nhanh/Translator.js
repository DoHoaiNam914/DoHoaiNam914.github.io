'use strict';
export default class Translator {
    controller;
    constructor() {
        this.controller = new AbortController();
    }
    async translateText(text, targetLanguage, sourceLanguage = null) { }
}
