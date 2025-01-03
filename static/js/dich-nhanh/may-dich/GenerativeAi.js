'use strict';
/* global axios */
import Translator from '/static/js/dich-nhanh/Translator.js';
import * as Utils from '/static/js/Utils.js';
import Anthropic from 'https://esm.run/@anthropic-ai/sdk';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from 'https://esm.run/@google/generative-ai';
import Groq from 'https://esm.run/groq-sdk';
import { Mistral } from 'https://esm.run/@mistralai/mistralai';
import OpenAI from 'https://esm.run/openai';
export default class GenerativeAi extends Translator {
    LANGUAGE_LIST = [
        {
            label: 'Tiếng Anh',
            value: 'English'
        },
        {
            label: 'Tiếng Nhật',
            value: 'Japanese'
        },
        {
            label: 'Tiếng Trung giản thể',
            value: 'Simplified Chinese'
        },
        {
            label: 'Tiếng Trung phồn thể',
            value: 'Traditional Chinese'
        },
        {
            label: 'Tiếng Việt',
            value: 'Vietnamese'
        }
    ];
    DefaultLanguage = {
        SOURCE_LANGUAGE: 'Auto',
        TARGET_LANGUAGE: 'Vietnamese'
    };
    maxContentLengthPerRequest = 1000;
    uuid;
    openai;
    anthropic;
    genAI;
    client;
    groq;
    duckchat;
    constructor(uuid, openaiApiKey, geminiApiKey, anthropicApiKey, mistralApiKey, groqApiKey) {
        super();
        this.uuid = uuid;
        this.openai = new OpenAI({
            apiKey: openaiApiKey,
            dangerouslyAllowBrowser: true
        });
        this.anthropic = new Anthropic({
            apiKey: anthropicApiKey,
            dangerouslyAllowBrowser: true
        });
        this.genAI = new GoogleGenerativeAI(geminiApiKey);
        this.client = new Mistral({ apiKey: mistralApiKey });
        this.groq = new Groq({
            apiKey: groqApiKey,
            dangerouslyAllowBrowser: true
        });
    }
    async getDuckchatStatus() {
        await axios.get(`${Utils.CORS_HEADER_PROXY}https://duckduckgo.com/duckchat/v1/status`, {
            headers: {
                'x-vqd-accept': 1
            }
        }).then(({ headers }) => {
            this.duckchat = axios.create({
                baseURL: `${Utils.CORS_HEADER_PROXY}https://duckduckgo.com/duckchat/v1/chat`,
                headers: {
                    'Content-Type': 'application/json',
                    'x-vqd-4': headers.get('x-vqd-4')
                },
                signal: this.controller.signal
            });
        }).catch(({ data }) => {
            throw new Error(data);
        });
    }
    async runOpenai(model, instructions, message) {
        const searchParams = new URLSearchParams(window.location.search);
        const isNotAvailable = window.localStorage.getItem('OPENAI_API_KEY') == null;
        const isDebug = searchParams.has('debug');
        if (!isDebug && isNotAvailable && this.duckchat == null)
            await this.getDuckchatStatus();
        const requestBody = {
            model,
            messages: [
                {
                    content: instructions,
                    role: 'user'
                },
                {
                    content: message,
                    role: 'user'
                }
            ],
            response_format: model.startsWith('o1') ? undefined : { type: 'text' },
            temperature: model.startsWith('o1') ? undefined : 0.3, // Mặc định: 1
            max_completion_tokens: ['gpt-4o-2024-05-13', 'gpt-4-turbo', 'gpt-4-turbo-2024-04-09', 'gpt-4-turbo-preview', 'gpt-4-0125-preview', 'gpt-4-1106-preview', 'gpt-3.5-turbo-0125', 'gpt-3.5-turbo', 'gpt-3.5-turbo-1106'].some((element) => model === element) ? 4096 : (model.startsWith('o1-mini') ? 65536 : (model.startsWith('o1-preview') ? 32768 : (model.startsWith('o1') ? 100000 : (model === 'gpt-4' || model.startsWith('gpt-4-') ? undefined /* 8192 */ : 16384)))), // Mặc định: model.startsWith('gpt-4o-mini') || model === 'gpt-3.5-turbo-16k' ? (model.startsWith('gpt-3.5-turbo') ? (/^gpt-3.5-turbo-\d+$/.test(model) ? 4095 : 4096) : 10000) : 2048
            top_p: model.startsWith('o1') ? undefined : 0.3, // Mặc định: 1
            frequency_penalty: model.startsWith('o1') ? undefined : 0,
            presence_penalty: model.startsWith('o1') ? undefined : 0
        };
        let content = '';
        if (isNotAvailable && (isDebug || model === 'gpt-4o-mini')) {
            if (isDebug) {
                const result = await axios.post(`${Utils.CORS_HEADER_PROXY}https://gateway.api.airapps.co/aa_service=server5/aa_apikey=5N3NR9SDGLS7VLUWSEN9J30P//v3/proxy/open-ai/v1/chat/completions`, JSON.stringify(requestBody), {
                    headers: {
                        'User-Agent': 'iOS-TranslateNow/8.8.0.1016 CFNetwork/1568.200.51 Darwin/24.1.0',
                        'Content-Type': 'application/json',
                        'accept-language': 'vi-VN,vi;q=0.9',
                        'air-user-id': this.uuid
                    },
                    signal: this.controller.signal
                }).then(({ data }) => data).catch(({ data }) => {
                    throw new Error(data);
                });
                content = result.choices[0].message.content;
            }
            else if (model === 'gpt-4o-mini') {
                const result = await this.duckchat.post(null, JSON.stringify({
                    model,
                    messages: [
                        {
                            role: 'user',
                            content: instructions
                        },
                        {
                            role: 'user',
                            content: message
                        }
                    ]
                })).then(({ data }) => data.split('\n').filter((element) => /data: {(?:"role":"assistant",)?"message"/.test(element)).map((element) => JSON.parse(element.replace(/^data: /, '')))).catch(({ data }) => {
                    throw new Error(data);
                });
                content = result.map(({ message }) => message).join('');
            }
        }
        else {
            const result = await this.openai.chat.completions.create(requestBody);
            content = result.choices[0].message.content;
        }
        return content;
    }
    async runClaude(model, instructions, message) {
        const isNotAvailable = window.localStorage.getItem('ANTHROPIC_API_KEY') == null;
        if (isNotAvailable && this.duckchat == null)
            await this.getDuckchatStatus();
        let msg = '';
        if (isNotAvailable && model === 'claude-3-haiku-20240307') {
            msg = await this.duckchat.post(null, JSON.stringify({
                model,
                messages: [
                    {
                        role: 'user',
                        content: instructions
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ]
            })).then(({ data }) => data.split('\n').filter((element) => /data: {(?:"role":"assistant",)?"message"/.test(element)).map((element) => JSON.parse(element.replace(/^data: /, '')).message).join('')).catch(({ data }) => {
                throw new Error(data);
            });
        }
        else {
            msg = await this.anthropic.messages.create({
                model,
                max_tokens: !model.startsWith('claude-3-5') ? 4096 : 8192, // Mặc định: 1000
                temperature: 0.3, // Mặc định: 0
                messages: [
                    {
                        role: 'user',
                        content: instructions
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                top_p: 0.3
            });
        }
        return msg;
    }
    async runGemini(model, instructions, message) {
        const generativeModel = this.genAI.getGenerativeModel({ model });
        const generationConfig = {
            temperature: 0.3, // Mặc định: 1
            topP: 0.3, // Mặc định: model.startsWith('gemini-1.0-pro') ? 0.9 : 0.95
            topK: /^gemini-1\.5-[^-]+-001$/.test(model) ? 64 : 40,
            maxOutputTokens: 8192,
            responseMimeType: 'text/plain'
        };
        const chatSession = generativeModel.startChat({
            generationConfig,
            history: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: instructions
                        }
                    ]
                }
            ],
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.BLOCK_NONE
                },
                {
                    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: HarmBlockThreshold.BLOCK_NONE
                },
                {
                    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold: HarmBlockThreshold.BLOCK_NONE
                },
                {
                    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold: HarmBlockThreshold.BLOCK_NONE
                },
                {
                    // FIXME: Thiếu biến `HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY`
                    category: 'HARM_CATEGORY_CIVIC_INTEGRITY',
                    threshold: HarmBlockThreshold.BLOCK_NONE
                }
            ]
        });
        const result = await chatSession.sendMessage(message);
        return result.response.text();
    }
    async runLlama(model, instructions, message) {
        const isOnGroq = model.startsWith('llama');
        if (!isOnGroq && this.duckchat == null)
            await this.getDuckchatStatus();
        let content = '';
        if (isOnGroq) {
            const chatCompletion = await this.groq.chat.completions.create({
                messages: [
                    {
                        content: instructions,
                        role: 'user'
                    },
                    {
                        content: message,
                        role: 'user'
                    }
                ],
                model,
                max_tokens: model === 'llama-3.1-70b-versatile' || model.endsWith('instant') ? 8000 : (model.endsWith('versatile') ? 32768 : 8192), // Mặc định: 1024
                temperature: 0.3, // Mặc định: 1
                top_p: 0.3, // Mặc định: 1
                stream: true,
                stop: null
            });
            for await (const chunk of chatCompletion) {
                content += chunk.choices[0]?.delta?.content || '';
            }
        }
        else {
            const chatCompletion = await this.duckchat.post(null, JSON.stringify({
                model,
                messages: [
                    {
                        role: 'user',
                        content: instructions
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ]
            })).then(({ data }) => data.split('\n').filter((element) => /data: {(?:"role":"assistant",)?"message"/.test(element)).map((element) => JSON.parse(element.replace(/^data: /, '')))).catch(({ data }) => {
                throw new Error(data);
            });
            content = chatCompletion.map(({ message }) => message).join('');
        }
        return content;
    }
    async runMistral(model, instructions, message) {
        const chatResponse = await this.client.chat.complete({
            model,
            messages: [
                {
                    role: 'user',
                    content: instructions
                },
                {
                    role: 'user',
                    content: message
                }
            ],
            temperature: 0.3,
            top_p: 0.3,
            max_tokens: model === 'mistral-small-latest' ? 32000 : 128000
        });
        return chatResponse.choices[0].message.content;
    }
    async translateText(text, targetLanguage, model = 'gpt-4o-mini', nomenclature = [], splitChunkEnabled = false) {
        const nomenclatureList = nomenclature.filter(([first]) => text.includes(first)).map(element => element.join('\t'));
        const INSTRUCTIONS = `Translate the following text into ${targetLanguage}. ${nomenclatureList.length > 0 ? 'Accurately map proper names of people, ethnic groups, species, or place-names, and other concepts listed in the Nomenclature Lookup Table. ' : ''}${/\n\s*[^\s]+/.test(text) ? 'Ensure that the content of each line in the your translations remains as they appear in original text, without merging multiple lines into one or splitting a single line into multiple lines. Preserve every newline character or end-of-line marker as they appear in the original text in your translations. ' : ''}Your translations must convey all the content in the original text and cannot involve explanations or other unnecessary information. Please ensure that the translated text is natural for native speakers with correct grammar and proper word choices. Your output must only contain the translated text and cannot include explanations or other information.${nomenclatureList.length > 0
            ? `

Nomenclature Lookup Table:
\`\`\`tsv
source\ttarget
${nomenclatureList.join('\n')}
\`\`\``
            : ''}`;
        const queues = text.split('\n');
        const responses = [];
        const isMistral = /^(?:open-)?[^-]+tral/.test(model);
        let queries = [];
        while (queues.length > 0) {
            queries.push(queues.shift());
            if (queues.length === 0 || (splitChunkEnabled && [...queries, queues[0]].join('\n').length > this.maxContentLengthPerRequest)) {
                const query = queries.join('\n');
                responses.push((async () => {
                    if (isMistral)
                        await Utils.sleep(2500);
                    return isMistral ? await this.runMistral(model, INSTRUCTIONS, query) : (model.startsWith('meta-llama') || model.startsWith('llama') ? await this.runLlama(model, INSTRUCTIONS, query) : (model.startsWith('gemini') ? await this.runGemini(model, INSTRUCTIONS, query) : (model.startsWith('claude') ? await this.runClaude(model, INSTRUCTIONS, query) : await this.runOpenai(model, INSTRUCTIONS, query))));
                })());
                queries = [];
            }
        }
        const result = await Promise.all(responses).then(responses => responses.flat().join('\n')).catch((reason) => {
            this.duckchat = null;
            throw reason;
        });
        super.translateText(text, targetLanguage, this.DefaultLanguage.SOURCE_LANGUAGE);
        return result;
    }
}
