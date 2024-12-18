'use strict';

/* global axios */

import Translator from '/static/js/dich-nhanh/Translator.js';
import * as Utils from '/static/js/Utils.js';

import Anthropic from 'https://esm.run/@anthropic-ai/sdk';

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from 'https://esm.run/@google/generative-ai';

import { Mistral } from 'https://esm.run/@mistralai/mistralai';
import OpenAI from "https://esm.run/openai";

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

  constructor(uuid, openaiApiKey, geminiApiKey, anthropicApiKey, mistralApiKey) {
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
    this.client = new Mistral({ apiKey: mistralApiKey });
    this.duckchat = axios.create({
      baseURL: `${Utils.CORS_HEADER_PROXY}https://duckduckgo.com/duckchat`,
      signal: this.controller.signal,
    });
  }

  async getDuckchatStatus() {
    await axios.get('https://cors-header-proxy.itsdhnam.workers.dev/https://duckduckgo.com/duckchat/v1/status', {
      headers: {
        'x-vqd-accept': 1,
      },
    }).then(({ headers }) => {
      this.xVqd4 = headers.get('x-vqd-4');
    }).catch((error) => {
      this.controller.abort();
      console.error('Bản dịch lỗi: Không thể lấy được v-vqd-4:', error);
    });
  }

  async runOpenai(model, instructions, message) {
    const searchParams = new URLSearchParams(location.search);
    const isDebug = searchParams.has('debug');
    if (!isDebug && localStorage.getItem('OPENAI_API_KEY') == null && this.xVqd4 == null) await this.getDuckchatStatus();

    const maybeGpt35Turbo16k = model === 'gpt-3.5-turbo-16k' ? null /* 16385 */ : 16384
    const maybeGpt4 = model.startsWith('gpt-4') ? null /* 8192 */ : maybeGpt35Turbo16k;
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
      response_format: model.startsWith('o1') ? undefined : { type: 'text' },
      temperature: model.startsWith('o1') ? undefined : 0.3, // Mặc định: 1
      max_completion_tokens: ['gpt-4o-2024-05-13', 'gpt-4-turbo', 'gpt-4-turbo-2024-04-09', 'gpt-3.5-turbo-0125', 'gpt-3.5-turbo', 'gpt-3.5-turbo-1106'].some((element) => model === element) ? 4096 : maybeO1Mini, // Mặc định: model.startsWith('gpt-4o-mini') || model === 'gpt-3.5-turbo-16k' ? (model.startsWith('gpt-3.5-turbo') ? (/^gpt-3.5-turbo-\d+$/.test(model) ? 4095 : 4096) : 10000) : 2048
      top_p: model.startsWith('o1') ? undefined : 0.3, // Mặc định: 1
      frequency_penalty: model.startsWith('o1') ? undefined : 0,
      presence_penalty: model.startsWith('o1') ? undefined : 0,
    };

    const maybeIsDebug = async () => isDebug ? await axios.post(`${Utils.CORS_HEADER_PROXY}https://gateway.api.airapps.co/aa_service=server5/aa_apikey=5N3NR9SDGLS7VLUWSEN9J30P//v3/proxy/open-ai/v1/chat/completions`, JSON.stringify(requestBody), {
      headers: {
        'User-Agent': 'iOS-TranslateNow/8.8.0.1016 CFNetwork/1568.200.51 Darwin/24.1.0',
        'Content-Type': 'application/json',
        'accept-language': 'vi-VN,vi;q=0.9',
        'air-user-id': this.uuid,
      },
      signal: this.controller.signal,
    }).then(({ data }) => data).catch(({ data }) => data) : model === 'gpt-4o-mini' && await this.duckchat.post('/v1/chat', JSON.stringify({
      model,
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
    }), {
      headers: {
        'Content-Type': 'application/json',
        'x-vqd-4': this.xVqd4,
      },
    }).then(({ data }) => ({ choices: [{ message: { content: data.split('\n').filter((element) => /data: {(?:"role":"assistant",)?"message"/.test(element)).map((element) => JSON.parse(element.replace(/^data: /, '')).message).join('') } }] })).catch(({ data }) => data);
    const result = localStorage.getItem('OPENAI_API_KEY') == null ? await maybeIsDebug() : await this.openai.chat.completions.create(requestBody);

    return result.choices[0].message.content;
  }

  async runClaude(model, instructions, message) {
    if (localStorage.getItem('ANTHROPIC_API_KEY') == null && this.xVqd4 == null) await this.getDuckchatStatus();

    const msg = localStorage.getItem('ANTHROPIC_API_KEY') == null && model === 'claude-3-haiku-20240307' ? this.duckchat.post('/v1/chat', JSON.stringify({
      model,
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
    }), {
      headers: {
        'Content-Type': 'application/json',
        'x-vqd-4': this.xVqd4,
      },
    }).then(({ data }) => data.split('\n').filter((element) => /data: {(?:"role":"assistant",)?"message"/.test(element)).map((element) => JSON.parse(element.replace(/^data: /, '')).message).join('')).catch(({ data }) => data) : await this.anthropic.messages.create({
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

  async runMistral(model, instructions, message) {
    const chatResponse = await this.client.chat.complete({
      model,
      temperature: 0.3,
      top_p: 0.3,
      max_tokens: model === 'mistral-small-latest' ? 32000 : 128000,
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
    });

    return chatResponse.choices[0].message.content;
  }

  async translateText(text, targetLanguage, model = 'gpt-4o-mini', nomenclature = []) {
    try {
      const filteredNomenclature = nomenclature.filter(([first]) => text.includes(first));
      const lines = text.split('\n');
      const query = lines.join('\n');

      const INSTRUCTIONS = `Translate the following text into ${targetLanguage}. ${filteredNomenclature.length > 0 ? `Accurately map proper names of people, ethnic groups, species, or place-names, and other concepts listed in the Nomenclature Lookup Table to enhance the accuracy and consistency in your translations. ` : ''}Your translations must convey all the content in the original text ${/\n/.test(query) ? 'line by line ' : ''}and cannot involve explanations or other unnecessary information. Please ensure that the translated text is natural for native speakers with correct grammar and proper word choices. Your output must only contain the translated text and cannot include explanations or other information.${filteredNomenclature.length > 0 ? `

Nomenclature Lookup Table:
\`\`\`tsv
source\ttarget
${filteredNomenclature.map((element) => element.join('\t')).join('\n')}
\`\`\`` : ''}`;

      const isGemini = model.startsWith('gemini');

      const maybeIsClaude = async () => model.startsWith('claude') ? await this.runClaude(model, INSTRUCTIONS, query) : await this.runOpenai(model, INSTRUCTIONS, query);
      const maybeIsGemini = async () => isGemini ? await this.runGemini(model, INSTRUCTIONS, query) : await maybeIsClaude();
      this.result = /^(?:open-)?[^-]+tral/.test(model) ? await this.runMistral(model, INSTRUCTIONS, query) : await maybeIsGemini();

      if (this.controller.signal.aborted || this.result == null) {
        this.result = text;
        return this.result;
      }

      if (isGemini) this.result = this.result.replace(/\n$/, '');
      const queryLineSeperators = query.split(/(\n)/).filter((element) => element.includes('\n'));
      const lineSeparatorBooleans = this.result.split(/(\n{1,2})/).filter((element) => element.includes('\n')).map((element, index) => element !== queryLineSeperators[index]);
      this.result = this.result.split(lineSeparatorBooleans.reduce((accumulator, currentValue) => accumulator + (currentValue ? 1 : -1), 0) > 0 ? '\n\n' : '\n');
      const maybeTextLengthBiggerThanZero = (text) => text.replace(/^\s+/, '').length > 0 ? text.match(/^\s*/)[0] : text;
      this.result = lines.map((element, index) => (this.result[index] != null ? element.match(/^\s*/)[0].concat(this.result[index].replace(/^\s+/, '')) : maybeTextLengthBiggerThanZero(element))).join('\n');
      super.translateText(text, targetLanguage, this.DefaultLanguage.SOURCE_LANGUAGE);
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      this.result = error;
    }

    return this.result;
  }
}
