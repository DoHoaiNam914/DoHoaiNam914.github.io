'use strict';

/* global Translator */

class GoogleGemini extends Translator {
  static LANGUAGE_LIST = [
    'Tiếng Anh', 'Tiếng Nhật', 'Tiếng Hàn', 'Tiếng Ả Rập', 'Tiếng Bahasa Indonesia', 'Tiếng Bengal', 'Tiếng Bulgaria', 'Tiếng Trung (Giản thể)', 'Tiếng Trung (Phồn thể)', 'Tiếng Croatia', 'Tiếng Séc', 'Tiếng Đan Mạch', 'Tiếng Hà Lan', 'Tiếng Estonia', 'Tiếng Farsi', 'Tiếng Phần Lan', 'Tiếng Pháp', 'Tiếng Đức', 'Tiếng Gujarati', 'Tiếng Hy Lạp', 'Tiếng Do Thái', 'Tiếng Hindi', 'Tiếng Hungary', 'Tiếng Ý', 'Tiếng Kannada', 'Tiếng Latvia', 'Tiếng Lithuania', 'Tiếng Malayalam', 'Tiếng Marathi', 'Tiếng Na Uy', 'Tiếng Ba Lan', 'Tiếng Bồ Đào Nha', 'Tiếng Romania', 'Tiếng Nga', 'Tiếng Serbia', 'Tiếng Slovakia', 'Tiếng Slovenia', 'Tiếng Tây Ban Nha', 'Tiếng Swahili', 'Tiếng Thuỵ Điển', 'Tiếng Tamil', 'Tiếng Telugu', 'Tiếng Thái', 'Tiếng Thổ Nhĩ Kỳ', 'Tiếng Ukraina', 'Tiếng Urdu', 'Tiếng Việt',
  ];

  DefaultLanguage = {
    SOURCE_LANGUAGE: '',
    TARGET_LANGUAGE: 'Tiếng Việt',
  };

  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
  }

  async translateText(text, targetLanguage, glossary) {
    try {
      const name = Object.entries(glossary.namePhu).filter(([first]) => text.includes(first));
      const response = await $.ajax({
        data: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `<TEXT>${text.split('\n').map((element) => element.replace(/^\s+/, '')).join('\n')}</TEXT>${name.length > 0 ? `
<NAMES>${name.map((element) => element.join('=')).join('\n')}</NAMES>` : ''}`
                },
              ],
            },
          ],
          systemInstruction: {
            role: 'user',
            parts: [
              {
                text: `Dịch văn bản gồm cả đầu đề và nội dung trong nhãn <TEXT> sau sang ${targetLanguage.replace('Tiếng', 'tiếng')}. Tham khảo tên riêng trong nhãn <NAMES> nếu có nhãn này. Các bản dịch của bạn phải truyền đạt đầy đủ nội dung của văn bản gốc và không được bao gồm giải thích hoặc thông tin không cần thiết khác. Không được gộp hay cắt dòng mà phải giữ nguyên số dòng như văn bản gốc. Đảm bảo rằng văn bản dịch tự nhiên cho người bản địa, ngữ pháp chính xác và lựa chọn từ ngữ đúng đắn. Bản dịch của bạn chỉ chứa văn bản đã dịch không bao gồm nhãn hay định dạng kiểu chữ và không thể chứa bất kỳ giải thích hoặc thông tin khác.`,
              },
            ],
          },
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
