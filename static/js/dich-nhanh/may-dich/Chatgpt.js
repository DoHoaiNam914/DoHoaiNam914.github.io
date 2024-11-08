'use strict';

/* global Translator */

class Chatgpt extends Translator {
  static LANGUAGE_LIST = [
    {
      label: 'Tự động nhận diện',
      value: '',
    },
    {
      label: 'Albanian',
      value: 'Albanian',
    },
    {
      label: 'Amharic',
      value: 'Amharic',
    },
    {
      label: 'Tiếng Ả Rập',
      value: 'Arabic',
    },
    {
      label: 'Armenian',
      value: 'Armenian',
    },
    {
      label: 'Bengali',
      value: 'Bengali',
    },
    {
      label: 'Tiếng Bosnia',
      value: 'Bosnian',
    },
    {
      label: 'Tiếng Bulgaria',
      value: 'Bulgarian',
    },
    {
      label: 'Burmese',
      value: 'Burmese',
    },
    {
      label: 'Tiếng Catalan',
      value: 'Catalan',
    },
    {
      label: 'Tiếng Trung',
      value: 'Chinese',
    },
    {
      label: 'Tiếng Croatia',
      value: 'Croatian',
    },
    {
      label: 'Tiếng Séc',
      value: 'Czech',
    },
    {
      label: 'Tiếng Đan Mạch',
      value: 'Danish',
    },
    {
      label: 'Tiếng Hà Lan',
      value: 'Dutch',
    },

    {
      label: 'Tiếng Anh',
      value: 'English',
    },

    {
      label: 'Estonian',
      value: 'Estonian',
    },
    {
      label: 'Tiếng Phần Lan',
      value: 'Finnish',
    },
    {
      label: 'Tiếng Pháp',
      value: 'French',
    },

    {
      label: 'Tiếng Galician',
      value: 'Galician',
    },

    {
      label: 'Georgian',
      value: 'Georgian',
    },
    {
      label: 'Tiếng Đức',
      value: 'German',
    },
    {
      label: 'Tiếng Hy Lạp',
      value: 'Greek',
    },
    {
      label: 'Gujarati',
      value: 'Gujarati',
    },
    {
      label: 'Tiếng Hindi',
      value: 'Hindi',
    },
    {
      label: 'Tiếng Hungaryc',
      value: 'Hungarian',
    },
    {
      label: 'Icelandic',
      value: 'Icelandic',
    },
    {
      label: 'Tiếng Indonesia',
      value: 'Indonesian',
    },
    {
      label: 'Tiếng Italy',
      value: 'Italian',
    },
    {
      label: 'Tiếng Nhật',
      value: 'Japanese',
    },
    {
      label: 'Kannada',
      value: 'Kannada',
    },
    {
      label: 'Kazakh',
      value: 'Kazakh',
    },
    {
      label: 'Tiếng Hàn',
      value: 'Korean',
    },
    {
      label: 'Latvian',
      value: 'Latvian',
    },
    {
      label: 'Lithuanian',
      value: 'Lithuanian',
    },
    {
      label: 'Tiếng Macedonia',
      value: 'Macedonian',
    },
    {
      label: 'Tiếng Mã Lai',
      value: 'Malay',
    },
    {
      label: 'Malayalam',
      value: 'Malayalam',
    },
    {
      label: 'Marathi',
      value: 'Marathi',
    },
    {
      label: 'Mongolian',
      value: 'Mongolian',
    },
    {
      label: 'Tiếng Na Uy',
      value: 'Norwegian',
    },
    {
      label: 'Persian',
      value: 'Persian',
    },
    {
      label: 'Tiếng Ba Lan',
      value: 'Polish',
    },
    {
      label: 'Tiếng Bồ Đào Nha',
      value: 'Portuguese',
    },
    {
      label: 'Punjabi',
      value: 'Punjabi',
    },
    {
      label: 'Tiếng Romania',
      value: 'Romanian',
    },
    {
      label: 'Tiếng Nga',
      value: 'Russian',
    },
    {
      label: 'Serbian',
      value: 'Serbian',
    },
    {
      label: 'Tiếng Slovak',
      value: 'Slovak',
    },
    {
      label: 'Slovenian',
      value: 'Slovenian',
    },
    {
      label: 'Somali',
      value: 'Somali',
    },
    {
      label: 'Tiếng Tây Ban Nha',
      value: 'Spanish',
    },
    {
      label: 'Swahili',
      value: 'Swahili',
    },
    {
      label: 'Tiếng Thụy Điển',
      value: 'Swedish',
    },
    {
      label: 'Tiếng Tagalog',
      value: 'Tagalog',
    },
    {
      label: 'Tiếng Tamil',
      value: 'Tamil',
    },
    {
      label: 'Telugu',
      value: 'Telugu',
    },
    {
      label: 'Tiếng Thái',
      value: 'Thai',
    },
    {
      label: 'Tiếng Thổ Nhĩ Kỳ',
      value: 'Turkish',
    },
    {
      label: 'Tiếng Ukraina',
      value: 'Ukrainian',
    },
    {
      label: 'Urdu',
      value: 'Urdu',
    },
    {
      label: 'Tiếng Việt',
      value: 'Vietnamese',
    }
  ];

  DefaultLanguage = {
    SOURCE_LANGUAGE: '',
    TARGET_LANGUAGE: 'Vietnamese',
  };

  constructor(uuid) {
    super();
    this.uuid = uuid.toUpperCase();
  }

  async translateText(text, targetLanguage, glossary = { terminologies: {}, namePhu: {} }) {
    try {
      const addresses = glossary.addresses.filter(([first]) => text.includes(first));
      const terminologies = Object.entries({ ...targetLanguage === 'Vietnamese' ? Object.fromEntries(addresses) : {}, ...glossary.terminologies }).filter(([first]) => text.includes(first));
      const names = Object.entries(glossary.namePhu).filter(([first]) => text.includes(first));
      const lines = text.split('\n');

      let response = await $.ajax({
        data: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              content: `Translate the text ${terminologies.length > 0 || names.length > 0 ? 'in the VĂN BẢN GỐC section ' : ''}into ${targetLanguage}. ${(targetLanguage === 'Vietnamese' && addresses.length > 0) || terminologies.length > 0 || names.length > 0 ? `Accurately mapping ${terminologies.length > 0 ? `the terms ${targetLanguage === 'Vietnamese' && addresses.length > 0 ? 'or the addresses ' : ''}listed in the BẢNG TRA CỨU THUẬT NGỮ section ` : ''}${names.length > 0 ? `${(targetLanguage === 'Vietnamese' && addresses.length > 0) || terminologies.length > 0 ? 'and ' : ''}the proper names listed in the BẢNG TRA CỨU TÊN RIÊNG section ` : ''}to enhance translation accuracy and consistency. ` : ''}Your translations must convey all the content in the original text in and cannot involve explanations or other unnecessary information. Please ensure that the translated text is natural for native speakers with correct grammar and proper word choices. Your output must only contain the translated text and cannot include explanations or other information.`,
              role: 'user',
            },
            {
              content: `Please provide the text you would like to have translated into ${targetLanguage}${terminologies.length > 0 || names.length > 0 ? ' in the VĂN BẢN GỐC section' : ''}.`,
              role: 'assistant',
            },
            {
              content: `${terminologies.length > 0 || names.length > 0 ? `## VĂN BẢN GỐC:
\`\`\`txt
${lines.map((element) => element.replace(/^\s+/g, '')).join('\n')}
\`\`\`

${terminologies.length > 0 ? `## BẢNG TRA CỨU THUẬT NGỮ:
\`\`\`tsv
source\ttarget
${terminologies.map((element) => element.join('\t')).join('\n')}
\`\`\`` : ''}${names.length > 0 ? `${terminologies.length > 0 ? '\n\n' : ''}## BẢNG TRA CỨU TÊN RIÊNG:
\`\`\`tsv
source\ttarget
${names.map((element) => element.join('\t')).join('\n')}
\`\`\`` : ''}` : lines.map((element) => element.replace(/^\s+/g, '')).join('\n')}`,
              role: 'user',
            },
          ],
          temperature: 1,
          // max_tokens: 2048,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
          response_format: { type: 'text' },
        }),
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'iOS-TranslateNow/8.5.0.1001 CFNetwork/1568.200.51 Darwin/24.1.0',
          'air-user-id': this.uuid,
        },
        method: 'POST',
        url: `https://gateway.api.airapps.co/aa_service=server5/aa_apikey=5N3NR9SDGLS7VLUWSEN9J30P//v3/proxy/open-ai/v1/chat/completions`,
      });

      if (this.controller.signal.aborted || response.choices == null) {
        this.result = text;
        return this.result;
      }

      response = response.choices[0].message.content.replace(/^## .+\n`{3}txt/, '').replace('\n```', '').split('\n').filter((element) => element.replace(/^\s+/, '').length > 0);
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
