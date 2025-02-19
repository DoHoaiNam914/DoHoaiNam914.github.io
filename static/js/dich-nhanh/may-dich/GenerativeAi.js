'use strict';
/* global axios, Papa */
import Translator from '../Translator.js';
import * as Utils from '../../Utils.js';
import Anthropic from 'https://esm.run/@anthropic-ai/sdk';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from 'https://esm.run/@google/generative-ai';
import Groq from 'https://esm.run/groq-sdk';
import { HfInference } from 'https://esm.run/@huggingface/inference';
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
            value: 'Chinese (Simplified)'
        },
        {
            label: 'Tiếng Trung phồn thể',
            value: 'Chinese (Traditional)'
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
    maxContentLinePerRequest = 25;
    AIR_USER_ID;
    OPENAI_API_KEY;
    HYPERBOLIC_API_KEY;
    openai;
    deepseek;
    anthropic;
    genAI;
    mistralClient;
    groq;
    hfInferenceClient;
    constructor(apiKey, airUserId) {
        super();
        const { openaiApiKey, deepseekApiKey, geminiApiKey, anthropicApiKey, mistralApiKey, hfToken, groqApiKey } = apiKey;
        this.OPENAI_API_KEY = openaiApiKey;
        this.openai = new OpenAI({
            apiKey: this.OPENAI_API_KEY,
            dangerouslyAllowBrowser: true
        });
        this.deepseek = new OpenAI({
            baseURL: 'https://api.deepseek.com',
            apiKey: deepseekApiKey,
            dangerouslyAllowBrowser: true
        });
        this.anthropic = new Anthropic({
            apiKey: anthropicApiKey,
            dangerouslyAllowBrowser: true
        });
        this.genAI = new GoogleGenerativeAI(geminiApiKey);
        this.mistralClient = new Mistral({ apiKey: mistralApiKey });
        this.hfInferenceClient = new HfInference(hfToken, { signal: this.controller.signal });
        this.groq = new Groq({
            apiKey: groqApiKey,
            dangerouslyAllowBrowser: true
        });
        this.AIR_USER_ID = airUserId;
    }
    async translatenowMain(requestBody) {
        const response = await axios.post(`${Utils.CORS_HEADER_PROXY}https://gateway.api.airapps.co/aa_service=server5/aa_apikey=5N3NR9SDGLS7VLUWSEN9J30P//v3/proxy/open-ai/v1/chat/completions`, JSON.stringify(requestBody), {
            headers: {
                'User-Agent': 'iOS-TranslateNow/8.12.0.1002 CFNetwork/3826.400.120 Darwin/24.3.0',
                'Content-Type': 'application/json',
                'accept-language': 'vi-VN,vi;q=0.9',
                'air-user-id': this.AIR_USER_ID
            },
            signal: this.controller.signal
        }).then(response => requestBody.stream === true ? response.data.split('\n').filter(element => element.startsWith('data: ') && !element.startsWith('data: [DONE]')).map(element => JSON.parse(`{${element.replace('data: ', '"data":')}}`).data.choices[0].delta.content).filter(element => element != null).join('') : response.data.choices[0].message.content).catch(error => {
            throw new Error(error.data);
        });
        return response;
    }
    async openaiMain(options, systemPrompts, message) {
        const { model, temperature, topP } = options;
        const isDeepseek = model.startsWith('deepseek');
        const requestBody = isDeepseek
            ? {
                messages: [{ role: 'system', content: 'You are a helpful assistant.' }],
                model: 'deepseek-chat'
            }
            : (/^o\d/.test(model)
                ? {
                    model: 'o1-mini',
                    messages: []
                }
                : {
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
                });
        if (isDeepseek) {
            requestBody.model = model;
            requestBody.messages = [
                ...systemPrompts.map(element => ({ content: element, role: 'system' })),
                {
                    content: message,
                    role: 'user'
                }
            ];
            requestBody.stream = true;
            requestBody.temperature = temperature;
            requestBody.top_p = topP;
        }
        else {
            requestBody.messages = [
                ...systemPrompts.map(element => ({ content: element, role: /^o\d/.test(model) ? (model === 'o1-mini' ? 'user' : 'developer') : 'system' })),
                {
                    content: message,
                    role: 'user'
                }
            ];
            requestBody.model = model;
            if (Object.hasOwn(requestBody, 'max_completion_tokens'))
                requestBody.max_completion_tokens = null;
            if (model !== 'o1')
                requestBody.stream = true;
            if (Object.hasOwn(requestBody, 'temperature') && model !== 'chatgpt-4o-latest')
                requestBody.temperature = temperature;
            if (Object.hasOwn(requestBody, 'top_p') && model !== 'chatgpt-4o-latest')
                requestBody.top_p = topP;
        }
        if (!isDeepseek && this.OPENAI_API_KEY.length === 0 && new URLSearchParams(window.location.search).has('debug')) {
            return await this.translatenowMain(requestBody);
        }
        else {
            const response = (isDeepseek ? this.deepseek : this.openai).chat.completions.create(requestBody, { signal: this.controller.signal });
            if (requestBody.stream) {
                const collectedMessages = [];
                for await (const chunk of response) {
                    collectedMessages.push(chunk.choices[0].delta.content);
                }
                return collectedMessages.filter(element => element != null).join('');
            }
            else {
                return response.choices[0].message.content;
            }
        }
    }
    async runGoogleGenerativeAI(options, systemPrompts, message) {
        const modelParams = {
            model: 'gemini-2.0-flash'
        };
        const { model, temperature, topP } = options;
        modelParams.model = model;
        if (modelParams.model !== 'gemini-1.0-pro')
            modelParams.systemInstruction = systemPrompts[0];
        const generativeModel = this.genAI.getGenerativeModel(modelParams);
        const generationConfig = {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
            responseMimeType: 'text/plain'
        };
        generationConfig.maxOutputTokens = undefined;
        generationConfig.temperature = temperature;
        generationConfig.topP = topP;
        if (['gemini-2.0-flash-lite-preview-02-05', 'gemini-1.5-flash-001', 'gemini-1.5-pro-001', 'gemini-2.0-pro-exp-02-05', 'gemini-exp-1206', 'gemini-2.0-flash-thinking-exp-01-21', 'learnlm-1.5-pro-experimental'].some(element => modelParams.model === element))
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
        startChatParams.history.push(...(modelParams.model === 'gemini-1.0-pro' ? systemPrompts : systemPrompts.slice(1)).map(element => ({ role: 'user', parts: [{ text: element }] })));
        const chatSession = generativeModel.startChat(startChatParams);
        const result = await chatSession.sendMessageStream(message, { signal: this.controller.signal });
        const collectedChunkTexts = [];
        for await (const chunk of result.stream) {
            collectedChunkTexts.push(chunk.text());
        }
        return collectedChunkTexts.join('');
    }
    async anthropicMain(options, systemPrompts, message) {
        const body = {
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1000,
            temperature: 0,
            messages: []
        };
        const { model, temperature, topP } = options;
        body.model = model;
        body.messages = [
            {
                role: 'user',
                content: message
            }
        ];
        body.max_tokens = undefined;
        body.system = systemPrompts.map(element => ({ text: element, type: 'text' }));
        body.temperature = temperature;
        body.top_p = topP;
        const collectedTexts = [];
        await this.anthropic.messages.stream(body, { signal: this.controller.signal }).on('text', text => {
            collectedTexts.push(text);
        });
        return collectedTexts.join('');
    }
    async runMistral(options, systemPrompts, message) {
        const { model, temperature, topP } = options;
        const result = await this.mistralClient.chat.stream({
            model,
            temperature,
            topP,
            maxTokens: undefined,
            messages: [
                ...systemPrompts.map(element => ({ role: 'system', content: element })),
                {
                    role: 'user',
                    content: message
                }
            ]
        }, { fetchOptions: { signal: this.controller.signal } });
        const collectedMessages = [];
        for await (const chunk of result) {
            collectedMessages.push(chunk.data.choices[0].delta.content);
        }
        return collectedMessages.join('');
    }
    async launch(options, systemPrompts, message) {
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
        const { model, temperature, topP } = options;
        chatCompletionInput.max_tokens = undefined;
        chatCompletionInput.messages = [
            ...systemPrompts.flatMap(element => ['google', 'mistralai', 'tiiuae'].some(element => model.startsWith(element)) ? [{ content: element, role: 'user' }, { content: '', role: 'assistant' }] : { content: element, role: 'system' }),
            {
                content: message,
                role: 'user'
            }
        ];
        chatCompletionInput.temperature = temperature;
        chatCompletionInput.top_p = topP;
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
    async groqMain(options, systemPrompts, message) {
        const { model, temperature, topP } = options;
        const requestBody = {
            messages: [],
            model: 'llama-3.3-70b-versatile',
            temperature: 1,
            max_completion_tokens: 1024,
            top_p: 1,
            stream: true,
            stop: null
        };
        requestBody.max_completion_tokens = null;
        requestBody.messages = [
            ...systemPrompts.flatMap(element => ({ content: element, role: 'system' })),
            {
                content: message,
                role: 'user'
            }
        ];
        requestBody.model = model;
        requestBody.temperature = temperature;
        requestBody.top_p = topP;
        const chatCompletion = await this.groq.chat.completions.create(requestBody);
        const collectedMessages = [];
        for await (const chunk of chatCompletion) {
            collectedMessages.push(chunk.choices[0]?.delta?.content ?? '');
        }
        return collectedMessages.join('');
    }
    async translateText(text, targetLanguage, options = { sourceLanguage: null }) {
        if (options.model == null)
            options.model = 'gpt-4o-mini';
        if (options.temperature == null)
            options.temperature = 0.2;
        if (options.topP == null)
            options.topP = 1;
        if (options.instructions == null)
            options.instructions = '';
        if (options.dictionary == null)
            options.dictionary = [];
        const { sourceLanguage, model, instructions, dictionary } = options;
        const isGoogleGenerativeAi = model.startsWith('gemini') || model.startsWith('learnlm');
        const isMistral = /^(?:open-)?[^-]+tral/.test(model);
        const SYSTEM_PROMPTS = [];
        SYSTEM_PROMPTS.push(`I want you to act as a ${targetLanguage} translator.${model.startsWith('gpt') || model === 'chatgpt-4o-latest' || /^o\d/.test(model)
            ? `
You are trained on data up to ${/^gpt-4[^o]/.test(model) ? 'December 2023' : (model === 'chatgpt-4o-latest' ? 'June 2024' : (model.startsWith('gpt-3.5') ? 'September 2021' : 'October 2023'))}.`
            : ''}`);
        if (instructions.replaceAll(/^\s+|\s+$/g, '').length > 0) {
            SYSTEM_PROMPTS.push(`# User’s Instructions

The user provided the additional info about how they would like you to translate:
\`\`\`${instructions}\`\`\`
For each terminology, put the original terminology in the bracket. An example: translated_terminology (original_terminology)`);
        }
        const filteredDictionary = dictionary.map(([first, second]) => [sourceLanguage ?? '', first, targetLanguage, second]).filter(([_first, second]) => text.includes(second));
        if (filteredDictionary.length > 0) {
            SYSTEM_PROMPTS.push(`# User’s Dictionary

The user provided the dictionary for specific term translations:
\`\`\`csv
${Papa.unparse({ fields: ['Source language', 'Original word', 'Destination language', 'Destination word'], data: filteredDictionary }, { newline: '\n' })}
\`\`\``);
        }
        SYSTEM_PROMPTS.push(`I will speak to you in ${sourceLanguage != null && sourceLanguage !== this.DefaultLanguage.SOURCE_LANGUAGE ? `${sourceLanguage} and you will ` : 'any language and you will detect the language, '}translate it and answer in the corrected version of my text, exclusively in ${targetLanguage}, while keeping the format.
Your translations must convey all the content in the original text and cannot involve explanations or other unnecessary information.
Please ensure that the translated text is natural for native speakers with correct grammar and proper word choices.
Your output must only contain the translated text and cannot include explanations or other information.`);
        const MESSAGE = /\n\s*[^\s]+/.test(text) ? text.split('\n').map((element, index) => `[${index + 1}]${element}`).join('\n') : text;
        const result = await (['gemma2-9b-it', 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'llama3-70b-8192', 'llama3-8b-8192', 'qwen-2.5-32b', 'deepseek-r1-distill-qwen-32b', 'deepseek-r1-distill-llama-70b-specdec', 'deepseek-r1-distill-llama-70b', 'llama-3.3-70b-specdec', 'llama-3.2-1b-preview', 'llama-3.2-3b-preview', 'llama-3.2-11b-vision-preview', 'llama-3.2-90b-vision-preview'].some(element => element === model) ? this.groqMain(options, SYSTEM_PROMPTS, MESSAGE) : (model.includes('/') ? this.launch(options, SYSTEM_PROMPTS, MESSAGE) : (isMistral ? this.runMistral(options, SYSTEM_PROMPTS, MESSAGE) : (model.startsWith('claude') ? this.anthropicMain(options, SYSTEM_PROMPTS, MESSAGE) : (isGoogleGenerativeAi ? this.runGoogleGenerativeAI(options, SYSTEM_PROMPTS, MESSAGE) : this.openaiMain(options, SYSTEM_PROMPTS, MESSAGE)))))).then(value => /\n\s*[^\s]+/.test(text) ? value.split('\n').map(element => element.replace(/^( ?)\[\d+] ?/, '$1')).join('\n') : value).catch(reason => {
            throw reason;
        });
        super.translateText(text, targetLanguage, sourceLanguage);
        return result;
    }
}
