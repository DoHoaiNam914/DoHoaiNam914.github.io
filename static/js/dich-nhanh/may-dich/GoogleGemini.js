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

  async translateText(text, targetLanguage, glossary) {
    try {
      const response = await $.ajax({
        data: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Use the name in the <NAMES></NAMES> tag and the term in the <GLOSSARY></GLOSSARY> tag. Translate the text within the <TEXT></TEXT> tag into ${targetLanguage}. Your translations must convey all the content in the original text and cannot involve explanations or other unnecessary information. Do not merge or cut lines. Keep the same number of lines as the original text. Please ensure that the translated text is natural for native speakers with correct grammar and proper word choices. Your output must only contain the translated text without formatting or the tag and cannot include explanations or other information.`,
                },
              ],
            },
            {
              role: 'model',
              parts: [
                {
                  text: `Please provide the text you would like to have translated into ${targetLanguage}.`,
                },
              ],
            },
            {
              role: 'user',
              parts: [
                {
                  text: `<NAMES>
${Object.entries(glossary.namePhu).filter(([first]) => text.includes(first)).map((element) => element.join(' → ')).join('\n')}
</NAMES>
<GLOSSARY>
${Object.entries(glossary.terminologies).filter(([first]) => text.includes(first)).map((element) => element.join(' → ')).join('\n')}
</GLOSSARY>
<TEXT>${text.split('\n').map((element) => element.replace(/^\s+/, '')).join('\n')}</TEXT>`,
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
            topK: 64,
            topP: 0.95,
            maxOutputTokens: 8192,
            responseMimeType: 'text/plain',
          },
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
      });
      if (this.controller.signal.aborted) return text;
      if (response.candidates != null) this.result = response.candidates[0].content.parts[0].text.replaceAll(/<\/?TEXT>/g, '');
      this.result = text.match(/^(?:\p{Zs}*\n)*/u)[0].concat(([...this.result.replace(/^(?:\p{Zs}*\n)*/u, '').replace(/\s+$/, '').matchAll(/\n\n/g)].length > [...text.replace(/^(?:\p{Zs}*\n)*/u, '').replace(/\s+$/, '').matchAll(/\n\n/g)].length ? this.result.replaceAll('\n\n', '\n') : this.result).replace(/^(?:\p{Zs}*\n)*/u, '').replace(/\s+$/, '').concat(text.match(/\s*$/)[0]));
      super.translateText(text, targetLanguage, this.DefaultLanguage.SOURCE_LANGUAGE);
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      this.result = error;
    }

    return this.result;
  }
}
