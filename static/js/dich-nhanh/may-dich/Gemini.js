'use strict';

import Translator from '/static/js/dich-nhanh/Translator.js';

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';

export default class Gemini extends Translator {
  static LANGUAGE_LIST = [
    {
      label: 'Tiếng Anh',
      value: 'English',
    },
    {
      label: 'Tiếng Nhật',
      value: 'Japanese',
    },
    {
      label: 'Tiếng Trung giản thể',
      value: 'Chinese simplified',
    },
    {
      label: 'Tiếng Trung phồn thể',
      value: 'Chinese traditional',
    },
    {
      label: 'Tiếng Việt',
      value: 'Vietnamese',
    },
  ];

  DefaultLanguage = {
    SOURCE_LANGUAGE: '',
    TARGET_LANGUAGE: 'Vietnamese',
  };

  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
    this.genAI = new GoogleGenerativeAI(this.apiKey);
  }

  async translateText(text, targetLanguage, model = 'gemini-1.5-flash', nomenclature = []) {
    if (this.apiKey.length === 0) {
      this.result = 'Vui lòng điền API Key để sử dụng Gemini.';
      return this.result;
    }

    try {
      const filteredNomenclature = nomenclature.filter(([first]) => text.includes(first));
      const lines = text.split('\n');
      const query = lines.map((element) => element.replace(/^\s+/g, '')).filter((element) => element.length > 0).join('\n');

      const generativeModel = this.genAI.getGenerativeModel({ model });

      const generationConfig = {
        temperature: 0.3, // Mặc định: 1
        topP: 0.3,  // Mặc định: model.startsWith('gemini-1.0-pro') ? 0.9 : 0.95
        topK: /^gemini-1\.5-[^-]+-001$/.test(model) ? 64 : 40,
        maxOutputTokens: 8192,
        responseMimeType: 'text/plain',
      };

      const chatSession = generativeModel.startChat({
        generationConfig,
        history: [
          {
            role: 'user',
            parts: [
              {
                text: `Translate the following text ${filteredNomenclature.length > 0 ? 'in the ORIGINAL TEXT section ' : ''}into ${targetLanguage}. ${filteredNomenclature.length > 0 ? `Accurately map proper names of people, ethnic groups, species, or place-names, and other concepts listed in the NOMENCLATURE LOOKUP TABLE to enhance translation accuracy and consistency. ` : ''}Your translations must convey all the content in the original text ${/\n/.test(query) ? 'line by line ' : ''}and cannot involve explanations or other unnecessary information. Please ensure that the translated text is natural for native speakers with correct grammar and proper word choices. Your output must only contain the translated text and cannot include explanations or other information.`,
              },
            ],
          },
        ],
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            // FIXME: Thiếu biến `HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY`
            category: 'HARM_CATEGORY_CIVIC_INTEGRITY',
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
        ],
      });

      let { response } = await chatSession.sendMessage(`${filteredNomenclature.length > 0 ? `ORIGINAL TEXT:
\`\`\`txt
${query}
\`\`\`

NOMENCLATURE LOOKUP TABLE:
\`\`\`tsv
source\ttarget
${filteredNomenclature.map((element) => element.join('\t')).join('\n')}
\`\`\`` : query}`);

      if (this.controller.signal.aborted || !response.text()) {
        this.result = text;
        return this.result;
      }

      response = response.text().replace(/\n$/, '');
      const queryLineSeperators = query.split(/(\n)/).filter((element) => element.includes('\n'));
      const lineSeparatorBooleans = response.split(/(\n{1,2})/).filter((element) => element.includes('\n\n')).map((element, index) => element !== queryLineSeperators[index]);
      response = response.split(lineSeparatorBooleans.reduce((accumulator, currentValue) => accumulator + (currentValue ? 1 : -1), 0) > 0 ? '\n\n' : '\n');
      response = Object.fromEntries(lines.map((element, index) => (element.replace(/^\s+/, '').length > 0 ? index : null)).filter((element) => element != null).map((element, index) => [element, response[index]]));
      this.result = lines.map((element, index) => (response[index] != null ? element.match(/^\s*/)[0].concat(response[index].replace(/^\s+/, '')) : element)).join('\n');
      super.translateText(text, targetLanguage, this.DefaultLanguage.SOURCE_LANGUAGE);
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      this.result = error;
    }

    return this.result;
  }
}
