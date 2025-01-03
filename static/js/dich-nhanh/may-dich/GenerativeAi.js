'use strict';
/* global axios */
import Translator from '/static/js/dich-nhanh/Translator.js';
import * as Utils from '/static/js/Utils.js';
import Anthropic from 'https://esm.run/@anthropic-ai/sdk';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from 'https://esm.run/@google/generative-ai';
import { HfInference } from 'https://esm.run/@huggingface/inference';
import { getEncoding, encodingForModel } from 'https://esm.run/js-tiktoken';
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
    AIR_USER_ID;
    OPENAI_API_KEY;
    openai;
    anthropic;
    genAI;
    hfInferenceClient;
    mistralClient;
    constructor(airUserId, openaiApiKey, geminiApiKey, anthropicApiKey, hfToken, mistralApiKey) {
        super();
        this.AIR_USER_ID = airUserId;
        this.OPENAI_API_KEY = openaiApiKey;
        this.openai = new OpenAI({
            apiKey: this.OPENAI_API_KEY,
            dangerouslyAllowBrowser: true
        });
        this.anthropic = new Anthropic({
            apiKey: anthropicApiKey,
            dangerouslyAllowBrowser: true
        });
        this.genAI = new GoogleGenerativeAI(geminiApiKey);
        this.hfInferenceClient = new HfInference(hfToken);
        this.mistralClient = new Mistral({ apiKey: mistralApiKey });
    }
    async runTranslateNow(requestBody) {
        const response = await axios.post(`${Utils.CORS_HEADER_PROXY}https://gateway.api.airapps.co/aa_service=server5/aa_apikey=5N3NR9SDGLS7VLUWSEN9J30P//v3/proxy/open-ai/v1/chat/completions`, JSON.stringify(requestBody), {
            headers: {
                'User-Agent': 'iOS-TranslateNow/8.8.0.1016 CFNetwork/1568.200.51 Darwin/24.1.0',
                'Content-Type': 'application/json',
                'accept-language': 'vi-VN,vi;q=0.9',
                'air-user-id': this.AIR_USER_ID
            },
            signal: this.controller.signal
        }).then(({ data }) => data).catch(({ data }) => {
            throw new Error(data);
        });
        return response.choices[0].message.content;
    }
    async runOpenai(model, instructions, message) {
        const searchParams = new URLSearchParams(window.location.search);
        let requestBody = {
            model: 'gpt-4o',
            messages: [],
            response_format: {
                type: 'text'
            },
            temperature: 1,
            max_completion_tokens: 2048,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        };
        let maxCompletionTokens = requestBody.max_completion_tokens;
        switch (model) {
            case 'o1':
            case 'o1-2024-12-17':
            case 'o1-mini':
            case 'o1-mini-2024-09-12':
            case 'o1-preview':
            case 'o1-preview-2024-09-12':
                requestBody = {
                    model: 'o1-mini',
                    messages: []
                };
                break;
            default:
                if (['gpt-4o', 'gpt-4o-2024-11-20', 'gpt-4o-2024-08-06', 'chatgpt-4o-latest', 'gpt-4o-mini', 'gpt-4o-mini-2024-07-18'].some(element => model === element))
                    maxCompletionTokens = 16384;
                else if (['gpt-4o-2024-05-13', 'gpt-4-turbo', 'gpt-4-turbo-2024-04-09', 'gpt-4-turbo-preview', 'gpt-4-0125-preview', 'gpt-4-1106-preview', 'gpt-3.5-turbo-0125', 'gpt-3.5-turbo', 'gpt-3.5-turbo-1106', 'gpt-3.5-turbo-instruct'].some(element => model === element))
                    maxCompletionTokens = 4096;
                else if (['gpt-4', 'gpt-4-0613', 'gpt-4-0314'].some(element => model === element))
                    maxCompletionTokens = 8192 - encodingForModel(model).encode(`${instructions}${message}`).length;
                break;
        }
        requestBody.messages = [
            {
                content: instructions,
                role: 'user'
            },
            {
                content: message,
                role: 'user'
            }
        ];
        requestBody.model = model;
        if (Object.hasOwn(requestBody, 'max_completion_tokens'))
            requestBody.max_completion_tokens = maxCompletionTokens;
        if (Object.hasOwn(requestBody, 'temperature'))
            requestBody.temperature = 0.3;
        if (Object.hasOwn(requestBody, 'top_p'))
            requestBody.top_p = 0.3;
        if (this.OPENAI_API_KEY.length === 0 && searchParams.has('debug')) {
            return await this.runTranslateNow(requestBody);
        }
        else {
            const response = await this.openai.chat.completions.create(requestBody);
            return response.choices[0].message.content;
        }
    }
    async runAnthropic(model, instructions, message) {
        const body = {
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1000,
            temperature: 0,
            messages: []
        };
        body.model = model;
        body.messages = [
            {
                role: 'user',
                content: instructions
            },
            {
                role: 'user',
                content: message
            }
        ];
        body.max_tokens = !model.startsWith('claude-3-5') ? 4096 : 8192;
        body.temperature = 0.3;
        body.top_p = 0.3;
        const msg = await this.anthropic.messages.create(body);
        return msg;
    }
    async runGoogleGenerativeAI(model, instructions, message) {
        const modelParams = {
            model: 'gemini-2.0-flash-exp'
        };
        modelParams.model = model;
        const generativeModel = this.genAI.getGenerativeModel(modelParams);
        const generationConfig = {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
            responseMimeType: 'text/plain'
        };
        generationConfig.temperature = 0.3;
        generationConfig.topP = 0.3;
        if (/^gemini-1\.5-[^-]+-001$/.test(model))
            generationConfig.topK = 64;
        const startChatParams = {
            generationConfig,
            history: []
        };
        startChatParams.safetySettings = [
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
        ];
        startChatParams.history.push({
            role: 'user',
            parts: [
                {
                    text: instructions
                }
            ]
        });
        const chatSession = generativeModel.startChat(startChatParams);
        const result = await chatSession.sendMessage(message);
        return result.response.text();
    }
    async runHfInference(model, instructions, message) {
        let out = '';
        const chatCompletionInput = {
            model: 'meta-llama/Llama-3.1-8B-Instruct',
            messages: [
                { role: 'user', content: 'Tell me a story' }
            ],
            temperature: 0.5,
            max_tokens: 2048,
            top_p: 0.7
        };
        chatCompletionInput.max_tokens = 8192;
        if (['meta-llama/Llama-3.2-3B-Instruct', 'google/gemma-2-9b-it', 'meta-llama/Llama-3.2-1B-Instruct', 'microsoft/Phi-3-mini-4k-instruct'].some(element => model === element))
            chatCompletionInput.max_tokens = 4096 - encodingForModel('gpt-4').encode(`${instructions}${message}`).length;
        else if (model.startsWith('google') || model.startsWith('meta-llama'))
            chatCompletionInput.max_tokens = chatCompletionInput.max_tokens - getEncoding('gpt2').encode(`${instructions}${message}`).length;
        chatCompletionInput.messages = [
            {
                content: instructions,
                role: 'user'
            },
            ...model.startsWith('google')
                ? [{
                        content: '',
                        role: 'assistant'
                    }]
                : [],
            {
                content: message,
                role: 'user'
            }
        ];
        chatCompletionInput.temperature = 0.3;
        chatCompletionInput.top_p = 0.3;
        chatCompletionInput.model = model;
        const stream = this.hfInferenceClient.chatCompletionStream(chatCompletionInput);
        for await (const chunk of stream) {
            if (chunk.choices != null && chunk.choices.length > 0) {
                const newContent = chunk.choices[0].delta.content;
                out += newContent;
                // console.log(newContent)
            }
        }
        return out;
    }
    async runMistral(model, instructions, message) {
        const chatResponse = await this.mistralClient.chat.complete({
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
        const INSTRUCTIONS = `Translate the following text into ${targetLanguage}. ${nomenclatureList.length > 0 ? 'Ensure the accurate mapping of proper names of people, ethnic groups, species, or place-names, and other concepts listed in the Nomenclature Lookup Table. ' : ''}${/\n\s*[^\s]+/.test(text) ? 'Keep each line in your translation exactly as it appears in the source text - do not combine multiple lines into one or break one line into multiple lines. Preserve every newline character or end-of-line marker as they appear in the original text in your translations. ' : ''}Your translations must convey all the content in the original text and cannot involve explanations${/\n\s*[^\s]+/.test(text) ? ', prefatory statements, introductory statements' : ''} or other unnecessary information. Please ensure that the translated text is natural for native speakers with correct grammar and proper word choices. Your output must only contain the translated text and cannot include explanations${/\n\s*[^\s]+/.test(text) ? ', prefatory statements, introductory statements' : ''} or other information.${nomenclatureList.length > 0
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
                    return isMistral ? await this.runMistral(model, INSTRUCTIONS, query) : (model.startsWith('gemini') ? await this.runGoogleGenerativeAI(model, INSTRUCTIONS, query) : (model.startsWith('claude') ? await this.runAnthropic(model, INSTRUCTIONS, query) : (model.startsWith('gpt') || model.startsWith('o1') ? await this.runOpenai(model, INSTRUCTIONS, query) : await this.runHfInference(model, INSTRUCTIONS, query))));
                })());
                queries = [];
            }
        }
        const result = await Promise.all(responses).then(responses => responses.flat().join('\n')).catch((reason) => {
            throw reason;
        });
        super.translateText(text, targetLanguage, this.DefaultLanguage.SOURCE_LANGUAGE);
        return result;
    }
}
