'use strict';
/* global axios */
import Translator from '/static/js/dich-nhanh/Translator.js';
import * as Utils from '/static/js/Utils.js';
import CryptoJS from '/static/lib/crypto-js+esm.js';
export default class Papago extends Translator {
    SOURCE_LANGUAGE_LIST = {
        auto: 'Phát hiện ngôn ngữ',
        ko: 'Hàn',
        en: 'Anh',
        ja: 'Nhật',
        'zh-CN': 'Trung (Giản thể)',
        'zh-TW': 'Trung (Phồn thể)',
        es: 'Tây Ban Nha',
        fr: 'Pháp',
        de: 'Đức',
        ru: 'Nga',
        pt: 'Bồ Đào Nha',
        it: 'Ý',
        vi: 'Việt',
        th: 'Thái',
        id: 'Indonesia',
        hi: 'Hindi'
    };
    TARGET_LANGUAGE_LIST = {
        ko: 'Hàn',
        en: 'Anh',
        ja: 'Nhật',
        'zh-CN': 'Trung (Giản thể)',
        'zh-TW': 'Trung (Phồn thể)',
        es: 'Tây Ban Nha',
        fr: 'Pháp',
        de: 'Đức',
        ru: 'Nga',
        pt: 'Bồ Đào Nha',
        it: 'Ý',
        vi: 'Việt',
        th: 'Thái',
        id: 'Indonesia',
        hi: 'Hindi'
    };
    DefaultLanguage = {
        SOURCE_LANGUAGE: 'auto',
        TARGET_LANGUAGE: 'vi'
    };
    maxContentLengthPerRequest = 3000;
    instance = axios.create({
        baseURL: `${Utils.CORS_HEADER_PROXY}https://papago.naver.com`,
        signal: this.controller.signal
    });
    uuid;
    version;
    constructor(uuid) {
        super();
        this.uuid = uuid;
    }
    async fetchVersion() {
        await this.instance.get().then(async (a) => {
            await this.instance.get(`/${a.data.match(/\/(main.*\.js)/)[1]}`).then((b) => {
                this.version = b.data.match(/"PPG .*,"(v[^"]*)/)[1];
            }).catch(({ data }) => {
                throw new Error(data);
            });
        }).catch(({ data }) => {
            throw new Error(data);
        });
    }
    async translateText(text, targetLanguage, sourceLanguage = null) {
        if (this.version == null)
            await this.fetchVersion();
        const lines = text.split('\n');
        const responses = [];
        const date = new Date();
        let queries = [];
        while (lines.length > 0) {
            queries.push(lines.shift());
            if (lines.length === 0 || [...queries, lines[0]].join('\n').length > this.maxContentLengthPerRequest) {
                const timeStamp = date.getTime();
                responses.push(this.instance.post('/apis/n2mt/translate', `deviceId=${this.uuid}&locale=vi&dict=true&dictDisplay=30&honorific=true&instant=false&paging=false&source=${sourceLanguage ?? this.DefaultLanguage.SOURCE_LANGUAGE}&target=${targetLanguage}&text=${encodeURIComponent(queries.join('\n'))}`, {
                    headers: {
                        Accept: 'application/json',
                        'Accept-Language': 'vi',
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'x-apigw-partnerid': 'papago',
                        Authorization: `PPG ${this.uuid}:${CryptoJS.HmacMD5(`${this.uuid}\nhttps://papago.naver.com/apis/n2mt/translate\n${timeStamp}`, this.version).toString(CryptoJS.enc.Base64)}`,
                        Timestamp: timeStamp
                    }
                }));
                queries = [];
            }
        }
        const result = await Promise.all(responses).then(responses => responses.map(({ data: { translatedText } }) => translatedText).join('\n')).catch((reason) => {
            throw reason;
        });
        super.translateText(text, targetLanguage, sourceLanguage);
        return result;
    }
}
