'use strict';

/* global Translator */

class DeepLTranslate extends Translator {
  /** https://api-free.deepl.com/v2/languages?type=source */
  static SOURCE_LANGUAGE_LIST = [{
    language: '',
    name: 'Detect language',
  }, ...JSON.parse('[{"language":"BG","name":"Bulgarian"},{"language":"CS","name":"Czech"},{"language":"DA","name":"Danish"},{"language":"DE","name":"German"},{"language":"EL","name":"Greek"},{"language":"EN","name":"English"},{"language":"ES","name":"Spanish"},{"language":"ET","name":"Estonian"},{"language":"FI","name":"Finnish"},{"language":"FR","name":"French"},{"language":"HU","name":"Hungarian"},{"language":"ID","name":"Indonesian"},{"language":"IT","name":"Italian"},{"language":"JA","name":"Japanese"},{"language":"KO","name":"Korean"},{"language":"LT","name":"Lithuanian"},{"language":"LV","name":"Latvian"},{"language":"NB","name":"Norwegian"},{"language":"NL","name":"Dutch"},{"language":"PL","name":"Polish"},{"language":"PT","name":"Portuguese"},{"language":"RO","name":"Romanian"},{"language":"RU","name":"Russian"},{"language":"SK","name":"Slovak"},{"language":"SL","name":"Slovenian"},{"language":"SV","name":"Swedish"},{"language":"TR","name":"Turkish"},{"language":"UK","name":"Ukrainian"},{"language":"ZH","name":"Chinese"}]')];

  /** https://api-free.deepl.com/v2/languages?type=target */
  static TARGET_LANGUAGE_LIST = JSON.parse('[{"language":"BG","name":"Bulgarian","supports_formality":false},{"language":"CS","name":"Czech","supports_formality":false},{"language":"DA","name":"Danish","supports_formality":false},{"language":"DE","name":"German","supports_formality":true},{"language":"EL","name":"Greek","supports_formality":false},{"language":"EN-GB","name":"English (British)","supports_formality":false},{"language":"EN-US","name":"English (American)","supports_formality":false},{"language":"ES","name":"Spanish","supports_formality":true},{"language":"ET","name":"Estonian","supports_formality":false},{"language":"FI","name":"Finnish","supports_formality":false},{"language":"FR","name":"French","supports_formality":true},{"language":"HU","name":"Hungarian","supports_formality":false},{"language":"ID","name":"Indonesian","supports_formality":false},{"language":"IT","name":"Italian","supports_formality":true},{"language":"JA","name":"Japanese","supports_formality":true},{"language":"KO","name":"Korean","supports_formality":false},{"language":"LT","name":"Lithuanian","supports_formality":false},{"language":"LV","name":"Latvian","supports_formality":false},{"language":"NB","name":"Norwegian","supports_formality":false},{"language":"NL","name":"Dutch","supports_formality":true},{"language":"PL","name":"Polish","supports_formality":true},{"language":"PT-BR","name":"Portuguese (Brazilian)","supports_formality":true},{"language":"PT-PT","name":"Portuguese (European)","supports_formality":true},{"language":"RO","name":"Romanian","supports_formality":false},{"language":"RU","name":"Russian","supports_formality":true},{"language":"SK","name":"Slovak","supports_formality":false},{"language":"SL","name":"Slovenian","supports_formality":false},{"language":"SV","name":"Swedish","supports_formality":false},{"language":"TR","name":"Turkish","supports_formality":false},{"language":"UK","name":"Ukrainian","supports_formality":false},{"language":"ZH","name":"Chinese (simplified)","supports_formality":false}]');

  DefaultLanguage = {
    SOURCE_LANGUAGE: '',
    TARGET_LANGUAGE: 'EN-US',
  };

  constructor(authKey) {
    super();
    this.authKey = authKey;
    this.fetchUsage();
    this.maxRequestBodySizePerRequest = 131072;
    this.maxContentLinePerRequest = 50;
  }

  fetchUsage() {
    try {
      this.usage = $.ajax({
        async: false,
        cache: false,
        method: 'GET',
        url: `https://api-free.deepl.com/v2/usage?auth_key=${this.authKey}`,
      });
    } catch (error) {
      console.error('Không thể lấy được Mức sử dụng:', error);
      throw console.error('Không thể lấy được Mức sử dụng!');
    }
  }

  async translateText(text, targetLanguage, sourceLanguage = this.DefaultLanguage.SOURCE_LANGUAGE) {
    try {
      const lines = text.split(/\n/);
      const textEncoder = new TextEncoder();
      const requestBody = (queryLines) => `text=${queryLines.map((element) => encodeURIComponent(element)).join('&text=')}&source_lang=${sourceLanguage}&target_lang=${targetLanguage}`;
      let queryLines = [];
      const responses = [];

      while (lines.length > 0 && textEncoder.encode(requestBody([...queryLines, lines[0]])).length <= this.maxRequestBodySizePerRequest && (queryLines.length + 1) <= this.maxContentLinePerRequest) {
        queryLines.push(lines.shift());

        if (lines.length === 0 || textEncoder.encode(requestBody([...queryLines, lines[0]])).length > this.maxRequestBodySizePerRequest || (queryLines.length + 1) > this.maxContentLinePerRequest) {
          responses.push($.ajax({
            data: requestBody(queryLines),
            method: 'POST',
            url: `https://api-free.deepl.com/v2/translate?auth_key=${this.authKey}`,
          }));
          queryLines = [];
        }
      }

      await Promise.all(responses);
      console.log(responses);
      this.result = responses.map((a) => a.responseJSON.translations.map((b) => b.text).join('\n')).join('\n');
      super.translateText(text, targetLanguage, sourceLanguage);
      return this.result;
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      this.result = error;
      throw error;
    }
  }
}
