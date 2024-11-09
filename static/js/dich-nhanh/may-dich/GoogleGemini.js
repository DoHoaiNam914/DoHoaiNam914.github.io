'use strict';

/* global Translator */

class GoogleGemini extends Translator {
  static LANGUAGE_LIST = [
    {
      label: 'Tự động nhận diện',
      value: '',
    },
    {
      label: 'Tiếng Anh',
      value: 'English',
    },
    {
      label: 'Tiếng Nhật',
      value: 'Japanese',
    },
    {
      label: 'Tiếng Hàn',
      value: 'Korean',
    },
    {
      label: 'Tiếng Ả Rập',
      value: 'Arabic',
    },
    {
      label: 'Tiếng Bahasa Indonesia',
      value: 'Bahasa Indonesia',
    },
    {
      label: 'Tiếng Bengal',
      value: 'Bengali',
    },
    {
      label: 'Tiếng Bulgaria',
      value: 'Bulgarian',
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
      label: 'Tiếng Estonia',
      value: 'Estonian',
    },
    {
      label: 'Tiếng Farsi',
      value: 'Farsi',
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
      label: 'Tiếng Đức',
      value: 'German',
    },
    {
      label: 'Tiếng Gujarati',
      value: 'Gujarati',
    },
    {
      label: 'Tiếng Hy Lạp',
      value: 'Greek',
    },
    {
      label: 'Tiếng Do Thái',
      value: 'Hebrew',
    },
    {
      label: 'Tiếng Hindi',
      value: 'Hindi',
    },
    {
      label: 'Tiếng Hungary',
      value: 'Hungarian',
    },
    {
      label: 'Tiếng Ý',
      value: 'Italian',
    },
    {
      label: 'Tiếng Kannada',
      value: 'Kannada',
    },
    {
      label: 'Tiếng Latvia',
      value: 'Latvian',
    },
    {
      label: 'Tiếng Lithuania',
      value: 'Lithuanian',
    },
    {
      label: 'Tiếng Malayalam',
      value: 'Malayalam',
    },
    {
      label: 'Tiếng Marathi',
      value: 'Marathi',
    },
    {
      label: 'Tiếng Na Uy',
      value: 'Norwegian',
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
      label: 'Tiếng Romania',
      value: 'Romanian',
    },
    {
      label: 'Tiếng Nga',
      value: 'Russian',
    },
    {
      label: 'Tiếng Serbia',
      value: 'Serbian',
    },
    {
      label: 'Tiếng Slovakia',
      value: 'Slovak',
    },
    {
      label: 'Tiếng Slovenia',
      value: 'Slovenian',
    },
    {
      label: 'Tiếng Tây Ban Nha',
      value: 'Spanish',
    },
    {
      label: 'Tiếng Swahili',
      value: 'Swahili',
    },
    {
      label: 'Tiếng Thuỵ Điển',
      value: 'Swedish',
    },
    {
      label: 'Tiếng Tamil',
      value: 'Tamil',
    },
    {
      label: 'Tiếng Telugu',
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
      label: 'Tiếng Urdu',
      value: 'Urdu',
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

  async translateText(text, targetLanguage, glossary = { terminologies: {}, namePhu: {} }, model = 'gemini-1.5-flash') {
    try {
      const terminologies = Object.entries(glossary.terminologies).filter(([first]) => text.includes(first));
      const names = Object.entries(glossary.namePhu).filter(([first]) => text.includes(first));
      const lines = text.split('\n');

      let response = await $.ajax({
        data: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Translate the text ${terminologies.length > 0 || names.length > 0 ? 'in the VĂN BẢN GỐC section ' : ''}into ${targetLanguage}. ${terminologies.length > 0 || names.length > 0 ? `Accurately mapping ${terminologies.length > 0 ? 'the terms listed in the BẢNG TRA CỨU THUẬT NGỮ section ' : ''}${names.length > 0 ? `${terminologies.length > 0 ? 'and ' : ''}the proper names listed in the BẢNG TRA CỨU TÊN RIÊNG section ` : ''}to enhance translation accuracy and consistency. ` : ''}Your translations must convey all the content in the original text in and cannot involve explanations or other unnecessary information. Please ensure that the translated text is natural for native speakers with correct grammar and proper word choices. Your output must only contain the translated text and cannot include explanations or other information.`,
                },
              ],
            },
            {
              role: 'model',
              parts: [
                {
                  text: `Please provide the text you would like to have translated into ${targetLanguage}${terminologies.length > 0 || names.length > 0 ? ' in the VĂN BẢN GỐC section' : ''}.`,
                },
              ],
            },
            {
              role: 'user',
              parts: [
                {
                  text: `${terminologies.length > 0 || names.length > 0 ? `# VĂN BẢN GỐC:
\`\`\`txt
${lines.map((element) => element.replace(/^\s+/g, '')).join('\n')}
\`\`\`

${terminologies.length > 0 ? `# BẢNG TRA CỨU THUẬT NGỮ:
\`\`\`tsv
source\ttarget
${terminologies.map((element) => element.join('\t')).join('\n')}
\`\`\`` : ''}${names.length > 0 ? `${terminologies.length > 0 ? '\n\n' : ''}# BẢNG TRA CỨU TÊN RIÊNG:
\`\`\`tsv
source\ttarget
${names.map((element) => element.join('\t')).join('\n')}
\`\`\`` : ''}` : lines.map((element) => element.replace(/^\s+/g, '')).join('\n')}`,
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
            temperature: 1,
            topP: 0.95,
            topK: /^gemini-1\.5-[^-]+-001$/.test(model) ? 64 : 40,
            // maxOutputTokens: 8192,
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

      response = response.candidates[0].content.parts[0].text.replace(' \n$', '').replace(/^# .+\n`{3}txt\n/, '').replace('\n```$', '').split('\n').filter((element) => element.replace(/^\s+/, '').length > 0);
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
