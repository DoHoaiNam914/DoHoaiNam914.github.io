'use strict';
/* global axios */
import Translator from '/static/js/dich-nhanh/Translator.js';
import * as Utils from '/static/js/Utils.js';
export default class BaiduTranslate extends Translator {
    SOURCE_LANGUAGE_LIST = {
        auto: 'Automatic detection',
        jp: 'Japanese',
        en: 'English',
        vie: 'Vietnamese',
        zh: 'Chinese',
        cht: 'Traditional Chinese'
    };
    TARGET_LANGUAGE_LIST = {
        jp: 'Japanese',
        en: 'English',
        vie: 'Vietnamese',
        zh: 'Chinese',
        cht: 'Traditional Chinese'
    };
    DefaultLanguage = {
        SOURCE_LANGUAGE: 'auto',
        TARGET_LANGUAGE: 'vie'
    };
    maxContentLengthPerRequest = 1000;
    instance = axios.create({
        baseURL: `${Utils.CORS_HEADER_PROXY}https://fanyi.baidu.com`,
        signal: this.controller.signal
    });
    async translateText(text, targetLanguage, sourceLanguage = null) {
        const lines = text.split('\n');
        const lan = (sourceLanguage ?? this.DefaultLanguage.SOURCE_LANGUAGE) === 'auto' ? await this.instance.post('/langdetect', new URLSearchParams(`query=${text}`)).then(({ data: { lan } }) => lan).catch(({ data }) => {
            throw new Error(data);
        }) : sourceLanguage;
        const responses = [];
        let queries = [];
        while (lines.length > 0) {
            queries.push(lines.shift());
            if (lines.length === 0 || [...queries, lines[0]].join('\n').length > this.maxContentLengthPerRequest) {
                responses.push(this.instance.post('/ait/text/translate', JSON.stringify({
                    query: queries.join('\n'),
                    from: lan,
                    to: targetLanguage,
                    reference: '',
                    corpusIds: [],
                    qcSettings: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
                    domain: 'common'
                }), {
                    headers: { 'Content-Type': 'application/json' }
                }));
                queries = [];
            }
        }
        const result = await Promise.all(responses).then(responses => responses.map(({ data }) => window.JSON.parse(data.split('\n').filter(element => element.includes('"event":"Translating"'))[0].replace(/^data: /, '')).data.list.map(({ dst }) => dst).join('\n')).join('\n')).catch((reason) => {
            throw reason;
        });
        super.translateText(text, targetLanguage, sourceLanguage);
        return result;
    }
}
