'use strict';

import Translator from '/static/js/dich-nhanh/Translator.js';
import Utils from '/static/js/Utils.js';

import Anthropic from "@anthropic-ai/sdk";

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';

import OpenAI from "openai";

export default class GenerativeAi extends Translator {
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
    SOURCE_LANGUAGE: 'Auto-detect',
    TARGET_LANGUAGE: 'Vietnamese',
  };

  constructor(uuid, openaiApiKey, geminiApiKey, anthropicApiKey) {
    super();
    this.uuid = uuid;
    this.openai = new OpenAI({
      apiKey: openaiApiKey,
      dangerouslyAllowBrowser: true,
    });
    this.anthropic = new Anthropic({
      apiKey: anthropicApiKey,
      dangerouslyAllowBrowser: true,
    });
    this.genAI = new GoogleGenerativeAI(geminiApiKey);
  }

  async runOpenai(model, instructions, message) {
    const maybeGpt4 = model.startsWith('gpt-4') ? null /** 8192 */ : 16384;
    const maybeO1 = model.startsWith('o1') ? 32768 : maybeGpt4;
    const maybeO1Mini = model.startsWith('o1-mini') ? 65536 : maybeO1;
    const requestBody = {
      model,
      messages: [
        {
          content: instructions,
          role: 'user',
        },
        {
          content: message,
          role: 'user',
        },
      ],
      response_format: { type: 'text' },
      temperature: model.startsWith('o1') ? 1 : 0.3, // Mặc định: 1
      // max_tokens: 2048,
      max_completion_tokens: ['gpt-4o-2024-05-13', 'gpt-4-turbo', 'gpt-4-turbo-2024-04-09', 'gpt-3.5-turbo-0125', 'gpt-3.5-turbo', 'gpt-3.5-turbo-1106'].some((element) => model === element) ? 4096 : maybeO1Mini,
      top_p: model.startsWith('o1') ? 1 : 0.3, // Mặc định: 1
      frequency_penalty: 0,
      presence_penalty: 0,
    };

    const result = localStorage.getItem('OPENAI_API_KEY') == null ? await axios.post(`${Utils.CORS_PROXY}https://gateway.api.airapps.co/aa_service=server5/aa_apikey=5N3NR9SDGLS7VLUWSEN9J30P//v3/proxy/open-ai/v1/chat/completions`, JSON.stringify(requestBody), {
      headers: {
        'User-Agent': 'iOS-TranslateNow/8.7.1.1001 CFNetwork/1568.200.51 Darwin/24.1.0',
        'Content-Type': 'application/json',
        'accept-language': 'vi-VN,vi;q=0.9',
        'air-user-id': this.uuid,
      },
      signal: this.controller.signal,
    }).then(({ data }) => data).catch((error) => error.toJSON()) : await this.openai.chat.completions.create(requestBody);

    return result.choices[0].message.content;
  }

  async runClaude(model, instructions, message) {
    const msg = await this.anthropic.messages.create({
      model,
      max_tokens: !model.startsWith('claude-3-5') ? 4096 : 8192, // Mặc định: 1000
      temperature: 0.3, // Mặc định: 0
      messages: [
        {
          role: 'user',
          content: instructions,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      top_p: 0.3,
    });

    return msg;
  }

  async runGemini(model, instructions, message) {
    const generativeModel = this.genAI.getGenerativeModel({ model });

    const safetySettings = [
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
    ];

    const generationConfig = {
      temperature: 0.3, // Mặc định: 1
      topP: 0.3,  // Mặc định: model.startsWith('gemini-1.0-pro') ? 0.9 : 0.95
      topK: /^gemini-1\.5-[^-]+-001$/.test(model) ? 64 : 40,
      maxOutputTokens: 8192,
      responseMimeType: 'text/plain',
    };

    const chatSession = generativeModel.startChat({
      safetySettings,
      generationConfig,
      history: [
        {
          role: 'user',
          parts: [
            {
              text: instructions,
            },
          ],
        },
      ],
    });

    const result = await chatSession.sendMessage(message);
    return result.response.text();
  }

  async translateText(text, targetLanguage, model = 'gpt-4o-mini', nomenclature = []) {
    try {
      const filteredNomenclature = nomenclature.filter(([first]) => text.includes(first));
      const lines = text.split('\n');
      const query = lines.map((element) => element.replace(/^\s+/g, '')).filter((element) => element.length > 0).join('\n');

      const INSTRUCTIONS = `Translate the following text ${filteredNomenclature.length > 0 ? 'in the ORIGINAL TEXT section ' : ''}into ${targetLanguage}. ${filteredNomenclature.length > 0 ? `Accurately map proper names of people, ethnic groups, species, or place-names, and other concepts listed in the NOMENCLATURE LOOKUP TABLE to enhance the accuracy and consistency in your translations. ` : ''}Your translations must convey all the content in the original text ${/\n/.test(query) ? 'line by line ' : ''}and cannot involve explanations or other unnecessary information. Please ensure that the translated text is natural for native speakers with correct grammar and proper word choices. Your output must only contain the translated text and cannot include explanations or other information.`;
      const MESSAGE = `${filteredNomenclature.length > 0 ? `ORIGINAL TEXT:
\`\`\`txt
${query}
\`\`\`

NOMENCLATURE LOOKUP TABLE:
\`\`\`tsv
source\ttarget
${filteredNomenclature.map((element) => element.join('\t')).join('\n')}
\`\`\`` : query}`;

      const isGemini = model.startsWith('gemini');

      const maybeIsClaude = async () => model.startsWith('claude') ? await this.runClaude(model, INSTRUCTIONS, MESSAGE) : await this.runOpenai(model, INSTRUCTIONS, MESSAGE);
      this.result = isGemini ? await this.runGemini(model, INSTRUCTIONS, MESSAGE) : await maybeIsClaude();

      if (this.controller.signal.aborted || this.result == null) {
        this.result = text;
        return this.result;
      }

      if (isGemini) this.result = this.result.replace(/\n$/, '').replaceAll(/`{3}txt\n|\n`{3}/g, '');
      else this.result = this.result.replaceAll(/^(?:.+:\n)?`{3}txt\n|\n`{3}$/g, '');
      const queryLineSeperators = query.split(/(\n)/).filter((element) => element.includes('\n'));
      const lineSeparatorBooleans = this.result.split(/(\n{1,2})/).filter((element) => element.includes('\n\n')).map((element, index) => element !== queryLineSeperators[index]);
      this.result = this.result.split(lineSeparatorBooleans.reduce((accumulator, currentValue) => accumulator + (currentValue ? 1 : -1), 0) > 0 ? '\n\n' : '\n');
      const resultMap = Object.fromEntries(lines.map((element, index) => (element.replace(/^\s+/, '').length > 0 ? index : null)).filter((element) => element != null).map((element, index) => [element, this.result[index]]));
      this.result = lines.map((element, index) => (resultMap[index] != null ? element.match(/^\s*/)[0].concat(resultMap[index].replace(/^\s+/, '')) : element)).join('\n');
      super.translateText(text, targetLanguage, this.DefaultLanguage.SOURCE_LANGUAGE);
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      this.result = error;
    }

    return this.result;
  }
}
