'use strict';

class GoogleGemini extends Translator {
  static LANGUAGE_LIST = [
    'tiếng Anh', 'tiếng Nhật', 'tiếng Hàn', 'tiếng Ả Rập', 'tiếng Bahasa Indonesia', 'tiếng Bengal', 'tiếng Bulgaria', 'tiếng Trung (Giản thể)', 'tiếng Trung (Phồn thể)', 'tiếng Croatia', 'tiếng Séc', 'tiếng Đan Mạch', 'tiếng Hà Lan', 'tiếng Estonia', 'tiếng Farsi', 'tiếng Phần Lan', 'tiếng Pháp', 'tiếng Đức', 'tiếng Gujarati', 'tiếng Hy Lạp', 'tiếng Do Thái', 'tiếng Hindi', 'tiếng Hungary', 'tiếng Ý', 'tiếng Kannada', 'tiếng Latvia', 'tiếng Lithuania', 'tiếng Malayalam', 'tiếng Marathi', 'tiếng Na Uy', 'tiếng Ba Lan', 'tiếng Bồ Đào Nha', 'tiếng Romania', 'tiếng Nga', 'tiếng Serbia', 'tiếng Slovakia', 'tiếng Slovenia', 'tiếng Tây Ban Nha', 'tiếng Swahili', 'tiếng Thuỵ Điển', 'tiếng Tamil', 'tiếng Telugu', 'tiếng Thái', 'tiếng Thổ Nhĩ Kỳ', 'tiếng Ukraina', 'tiếng Urdu', 'tiếng Việt',
  ];

  DefaultLanguage = {
    SOURCE_LANGUAGE: '',
    TARGET_LANGUAGE: 'tiếng Việt',
  };

  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
  }

  async translateText(text, targetLanguage, glossary) {
    try {
      const name = Object.entries(glossary.namePhu);
      const response = await $.ajax({
        data: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `<TEXT>${text.split('\n').map((element) => element.replace(/^\s+/, '')).join('\n')}</TEXT>
<NAMES>${nameEnabled && name.length > 0 ? name.map((element) => element.join('=')).join('\n') : ''}</NAMES>`
                },
              ],
            },
          ],
          systemInstruction: {
            role: 'model',
            parts: [
              {
                text: `Bạn là dịch giả. Bạn sẽ dịch văn bản trong nhãn <TEXT> sang ${targetLanguage}. Tham khảo tên riêng trong nhãn <NAMES> nếu có nhãn này. Các bản dịch của bạn phải truyền đạt đầy đủ đầu đề và nội dung của văn bản gốc và không được bao gồm giải thích hoặc thông tin không cần thiết khác hay định dạng kiểu chữ. Không được gộp hay cắt dòng mà phải giữ nguyên số dòng như văn bản gốc. Đảm bảo rằng văn bản dịch tự nhiên cho người bản địa, ngữ pháp chính xác và lựa chọn từ ngữ đúng đắn. Bản dịch của bạn chỉ chứa văn bản đã dịch và không thể chứa bất kỳ giải thích hoặc thông tin khác hay định dạng kiểu chữ.`,
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
          }
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
      });
      if (this.controller.signal.aborted) return text;
      if (response.candidates != null) this.result = response.candidates[0].content.parts[0].text.replaceAll(/<\/?TEXT>/g, '');
      this.result = text.match(/^(?:\p{Zs}*\n)*/u)[0].concat(([...result.replace(/^(?:\p{Zs}*\n)*/u, '').replace(/\s+$/, '').matchAll(/\n\n/g)].length > [...text.replace(/^(?:\p{Zs}*\n)*/u, '').replace(/\s+$/, '').matchAll(/\n\n/g)].length ? result.replaceAll('\n\n', '\n') : result).replace(/^(?:\p{Zs}*\n)*/u, '').replace(/\s+$/, '').concat(text.match(/\s*$/)[0]));
      super.translateText(text, targetLanguage, this.DefaultLanguage.SOURCE_LANGUAGE);
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      this.result = error;
    }

    return this.result;
  }
}
