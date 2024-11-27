'use strict';

/* global Translator */

class Gpt extends Translator {
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
      value: 'Simplified Chinese',
    },
    {
      label: 'Tiếng Trung phồn thể',
      value: 'Traditional Chinese',
    },
    {
      label: 'Tiếng Việt',
      value: 'Vietnamese',
    },
  ];

  DefaultLanguage = {
    SOURCE_LANGUAGE: 'Auto-Detect',
    TARGET_LANGUAGE: 'Vietnamese',
  };

  constructor(uuid) {
    super();
    this.uuid = uuid.toUpperCase();
  }

  async translateText(text, targetLanguage, model = 'gpt-4o-mini', nomenclature = []) {
    try {
      const filteredNomenclature = nomenclature.filter(([first]) => text.includes(first));
      const lines = text.split('\n');
      const query = lines.map((element) => element.replace(/^\s+/g, '')).filter((element) => element.length > 0).join('\n');
      const maybeGpt4 = ['gpt-4', 'gpt-4-0613'].some((element) => model === element) ? 8192 : 16384;
      let response = await $.ajax({
        data: JSON.stringify({
          model,
          messages: [
            {
              content: `Translate the following text ${filteredNomenclature.length > 0 ? 'in the ORIGINAL TEXT section ' : ''}into ${targetLanguage}. ${filteredNomenclature.length > 0 ? `Accurately map names of people, ethnic groups, species, or place-names, and other concepts listed in the NOMENCLATURE LOOKUP TABLE to enhance translation accuracy and consistency. ` : ''}Your translations must convey all the content in the original text ${/\n/.test(query) ? 'line by line ' : ''}and cannot involve explanations or other unnecessary information. Please ensure that the translated text is natural for native speakers with correct grammar and proper word choices. Your output must only contain the translated text and cannot include explanations or other information.`,
              role: 'user',
            },
            {
              content: `${nomenclature.length > 0 ? `ORIGINAL TEXT:
\`\`\`txt
${query}
\`\`\`

NOMENCLATURE LOOKUP TABLE:
\`\`\`tsv
source\ttarget
${filteredNomenclature.map((element) => element.join('\t')).join('\n')}
\`\`\`` : query}`,
              role: 'user',
            },
          ],
          temperature: model.startsWith('o1') ? 1 : 0.3, // Mặc định: 1
          max_tokens: ['gpt-4o-2024-05-13', 'gpt-4-turbo', 'gpt-4-turbo-2024-04-09', 'gpt-3.5-turbo-0125', 'gpt-3.5-turbo', 'gpt-3.5-turbo-1106'].some((element) => model === element) ? 4096 : maybeGpt4, // Mặc định: 2048
          top_p: model.startsWith('o1') ? 1 : 0.3, // Mặc định: 1
          frequency_penalty: 0,
          presence_penalty: 0,
          response_format: { type: 'text' },
        }),
        headers: {
          'User-Agent': 'iOS-TranslateNow/8.7.0.1004 CFNetwork/1568.200.51 Darwin/24.1.0',
          'Content-Type': 'application/json',
          'air-user-id': this.uuid,
        },
        method: 'POST',
        url: 'https://gateway.api.airapps.co/aa_service=server5/aa_apikey=5N3NR9SDGLS7VLUWSEN9J30P//v3/proxy/open-ai/v1/chat/completions',
      });

      if (this.controller.signal.aborted || response.choices == null) {
        this.result = text;
        return this.result;
      }

      response = response.choices[0].message.content.replaceAll(/(?:^(?:.+:\n)?`{3}txt\n|\n`{3}$)/g, '');
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
