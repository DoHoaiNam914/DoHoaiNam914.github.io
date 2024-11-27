'use strict';

/* global Translator */

class Gemini extends Translator {
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
      label: 'Tiếng Trung (Giản thể)',
      value: 'Chinese (Simplified)',
    },
    {
      label: 'Tiếng Trung (Phồn thể)',
      value: 'Chinese (Traditional)',
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
      let response = await $.ajax({
        data: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Translate the following text ${filteredNomenclature.length > 0 ? 'in the ORIGINAL TEXT section ' : ''}into ${targetLanguage}. ${filteredNomenclature.length > 0 ? `Accurately map proper names of people, ethnic groups, species, or place-names, and other concepts listed in the NOMENCLATURE LOOKUP TABLE to enhance translation accuracy and consistency. ` : ''}Your translations must convey all the content in the original text ${/\n/.test(query) ? 'line by line ' : ''}and cannot involve explanations or other unnecessary information. Please ensure that the translated text is natural for native speakers with correct grammar and proper word choices. Your output must only contain the translated text and cannot include explanations or other information.`,
                },
              ],
            },
            {
              role: 'user',
              parts: [
                {
                  text: `${filteredNomenclature.length > 0 ? `ORIGINAL TEXT:
\`\`\`txt
${query}
\`\`\`

NOMENCLATURE LOOKUP TABLE:
\`\`\`tsv
source\ttarget
${filteredNomenclature.map((element) => element.join('\t')).join('\n')}
\`\`\`` : query}`,
                },
              ],
            },
          ],
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_NONE',
            },
          ],
          generationConfig: {
            temperature: 0.3, // Mặc định: 1
            topP: 0.3,  // Mặc định: model.startsWith('gemini-1.0-pro') ? 0.9 : 0.95
            topK: /^gemini-1\.5-[^-]+-001$/.test(model) ? 64 : 40,
            maxOutputTokens: 8192,
            responseMimeType: 'text/plain',
          },
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        url: `https://generativelanguage.googleapis.com/v1beta/models/${model !== 'none' ? model : 'gemini-1.5-flash'}:generateContent?key=${this.apiKey}`,
      });

      if (this.controller.signal.aborted || response.candidates == null) {
        this.result = text;
        return this.result;
      }

      response = response.candidates[0].content.parts[0].text.replace(/ \n$/, '').replaceAll(/(?:^`{3}txt\n|\n`{3}$)/g, '');
      response = response.split(response.match(/\n{2}/) != null && response.match(/\n{2}/).length <= query.match(/\n/).length ? '\n\n' : '\n');
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
