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
      const lines = text.split('\n');
      const terminologies = Object.entries(glossary.terminologies).filter(([first]) => text.includes(first));
      const names = Object.entries(glossary.namePhu).filter(([first]) => text.includes(first));
      let response = await $.ajax({
        data: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Translate the text in #original-text into ${targetLanguage}. Use the names from the #name-dictionary and the terms from the #glossary to enhance the translation. When writing Japanese names, use Hepburn Romanization. For Chinese names, use ${targetLanguage === 'Vietnamese' ? 'Sino-Vietnamese' : 'pinyin without tonal marks'}. Your translations must convey all the content in the original text in #original-text line by line, including the title, and cannot involve explanations or other unnecessary information. Ensure to strictly maintain the same number of lines as the original text in #original-text. Please ensure that the translated text is natural for native speakers with correct grammar and proper word choices. ${targetLanguage === 'Vietnamese' ? 'Standardize the use of I/Y for the main vowel and the placement of tone marks in syllables with -oa/-oe/-uy in the translated text. ' : ''}Your output must only contain the translated text and cannot include explanations or other information.`,
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
                  text: `<!DOCTYPE html>
<meta charset="utf-8">
<script type="text/tab-separated-values" id="glossary">${terminologies.length > 0 ? ['source\ttarget', ...terminologies.map((element) => element.join('\t'))].join('\n') : ''}</script>
<script type="text/tab-separated-values" id="name-dictionary">${names.length > 0 ? ['source\ttarget', ...names.map((element) => element.join('\t'))].join('\n') : ''}</script>
<pre type="text/plain" id="original-text">
${lines.map((element) => element.replace(/^\s+/g, '')).join('\n')}
</pre>`,
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

      if (this.controller.signal.aborted || response.candidates == null) {
        this.result = text;
        return this.result;
      }

      response = response.candidates[0].content.parts[0].text.replace(/\n<\/pre>\n?|(?:<pre type="text\/plain"(?: id="(?:original|translated)-text")?>|```)\n/g, '').split('\n');
      const contentLine = lines.filter((element) => element.replace(/^\s+/g, '').length > 0);
      response = Object.fromEntries(response.filter((element) => element.replace(/^\s+/g, '').length > 0).map((element, index) => [contentLine[index], element]));
      this.result = lines.map((element) => (response[element] != null ? element.match(/^\s*/)[0].concat(response[element].replace(/^\s+/g, '')) : element)).join('\n');
      super.translateText(text, targetLanguage, this.DefaultLanguage.SOURCE_LANGUAGE);
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      this.result = error;
    }

    return this.result;
  }
}
