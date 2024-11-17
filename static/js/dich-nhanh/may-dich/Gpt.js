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
      const nomenclature = nomenclature.filter(([first]) => text.includes(first));
      const lines = text.split('\n');

      let response = await $.ajax({
        data: JSON.stringify({
          model,
          messages: [
            {
              content: `Translate the following text ${nomenclature.length > 0 ? 'in the ORIGINAL TEXT section ' : ''}into ${targetLanguage}. ${nomenclature.length > 0 ? `Accurately map proper names, respectful terms of address, pronouns, and concepts listed in the NOMENCLATURE LOOKUP TABLE to enhance translation accuracy and consistency. ` : ''}Your translations must convey all the content in the original text and cannot involve explanations or other unnecessary information. Please ensure that the translated text is natural for native speakers with correct grammar and proper word choices. Your output must only contain the translated text and cannot include explanations or other information.`,
              role: 'user',
            },
            {
              content: `${nomenclature.length > 0 ? `ORIGINAL TEXT:
\`\`\`txt
${lines.map((element) => element.replace(/^\s+/g, '')).join('\n')}
\`\`\`

NOMENCLATURE LOOKUP TABLE:
\`\`\`tsv
source\ttarget
${nomenclature.map((element) => element.join('\t')).join('\n')}
\`\`\`` : lines.map((element) => element.replace(/^\s+/g, '')).join('\n')}`,
              role: 'user',
            },
          ],
          temperature: 0.3, // Mặc định: 1
          // max_tokens: 2048,
          top_p: 0.3, // Mặc định: 1
          frequency_penalty: 0,
          presence_penalty: 0,
          response_format: { type: 'text' },
        }),
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'iOS-TranslateNow/8.5.1.1001 CFNetwork/1568.200.51 Darwin/24.1.0',
          'air-user-id': this.uuid,
        },
        method: 'POST',
        url: `https://gateway.api.airapps.co/aa_service=server5/aa_apikey=5N3NR9SDGLS7VLUWSEN9J30P//v3/proxy/open-ai/v1/chat/completions`,
      });

      if (this.controller.signal.aborted || response.choices == null) {
        this.result = text;
        return this.result;
      }

      response = response.choices[0].message.content.replaceAll(/(?:^`{3}txt\n|\n`{3}$)/g, '').split('\n').filter((element) => element.replace(/^\s+/, '').length > 0);
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
