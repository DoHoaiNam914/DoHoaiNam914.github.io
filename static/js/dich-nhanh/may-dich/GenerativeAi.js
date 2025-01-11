'use strict';
/* global axios */
import Translator from '../Translator.js';
import * as Utils from '../../Utils.js';
import Anthropic from 'https://esm.run/@anthropic-ai/sdk';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from 'https://esm.run/@google/generative-ai';
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
    maxContentLengthPerRequest = 1024;
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
    async mainTranslatenow(requestBody) {
        const response = await axios.post(`${Utils.CORS_HEADER_PROXY}https://gateway.api.airapps.co/aa_service=server5/aa_apikey=5N3NR9SDGLS7VLUWSEN9J30P//v3/proxy/open-ai/v1/chat/completions`, JSON.stringify(requestBody), {
            headers: {
                'User-Agent': 'iOS-TranslateNow/8.8.0.1016 CFNetwork/1568.200.51 Darwin/24.1.0',
                'Content-Type': 'application/json',
                'accept-language': 'vi-VN,vi;q=0.9',
                'air-user-id': this.AIR_USER_ID
            },
            signal: this.controller.signal
        }).then(response => (requestBody.stream === true ? response.data.split('\n').filter(element => element.startsWith('data: ') && !element.startsWith('data: [DONE]')).map(element => JSON.parse(`{${element.replace('data: ', '"data":')}}`).data.choices[0].delta.content).filter(element => element != null).join('') : response.data.choices[0].message.content)).catch(error => {
            throw new Error(error.data);
        });
        return response;
    }
    async mainOpenai(options, promptInstructions, message) {
        const searchParams = new URLSearchParams(window.location.search);
        const { model, temperature, maxTokens, topP } = options;
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
                    maxCompletionTokens = 8192;
        }
        requestBody.messages = [
            {
                content: promptInstructions,
                role: 'system'
            },
            {
                content: message,
                role: 'user'
            }
        ];
        requestBody.model = model;
        if (maxTokens > 0)
            requestBody.max_completion_tokens = maxTokens;
        else if (Object.hasOwn(requestBody, 'max_completion_tokens'))
            requestBody.max_completion_tokens = maxCompletionTokens;
        if (model !== 'o1')
            requestBody.stream = true;
        if (Object.hasOwn(requestBody, 'temperature') || temperature > 1)
            requestBody.temperature = temperature;
        if (Object.hasOwn(requestBody, 'top_p') || topP > 1)
            requestBody.top_p = topP;
        if (this.OPENAI_API_KEY.length === 0 && searchParams.has('debug')) {
            return await this.mainTranslatenow(requestBody);
        }
        else {
            const response = this.openai.chat.completions.create(requestBody);
            if (requestBody.stream === true) {
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
    async runGoogleGenerativeAI(options, promptInstructions, message) {
        const modelParams = {
            model: 'gemini-2.0-flash-exp'
        };
        const { model, temperature, maxTokens, topP } = options;
        modelParams.model = model;
        modelParams.systemInstruction = promptInstructions;
        const generativeModel = this.genAI.getGenerativeModel(modelParams);
        const generationConfig = {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
            responseMimeType: 'text/plain'
        };
        if (maxTokens > 0)
            generationConfig.maxOutputTokens = maxTokens;
        generationConfig.temperature = temperature;
        generationConfig.topP = topP;
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
        const chatSession = generativeModel.startChat(startChatParams);
        const result = await chatSession.sendMessageStream(message);
        const collectedChunkTexts = [];
        for await (const chunk of result.stream) {
            collectedChunkTexts.push(chunk.text());
        }
        return collectedChunkTexts.join('');
    }
    async mainAnthropic(options, promptInstructions, message) {
        const body = {
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1000,
            temperature: 0,
            messages: []
        };
        body.model = options.model;
        body.messages.push({
            role: 'user',
            content: message
        });
        const { model, temperature, maxTokens, topP } = options;
        body.max_tokens = maxTokens > 0 ? maxTokens : (!model.startsWith('claude-3-5') ? 4096 : 8192);
        body.system = promptInstructions;
        body.temperature = temperature;
        body.top_p = topP;
        const collectedTexts = [];
        await this.anthropic.messages.stream(body).on('text', text => {
            collectedTexts.push(text);
        });
        return collectedTexts.join('');
    }
    async launch(options, promptInstructions, message) {
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
        const { model, temperature, maxTokens, topP } = options;
        chatCompletionInput.max_tokens = maxTokens > 0 ? maxTokens : (['meta-llama/Llama-3.2-3B-Instruct', 'google/gemma-2-9b-it', 'meta-llama/Llama-3.2-1B-Instruct', 'microsoft/Phi-3-mini-4k-instruct', 'meta-llama/Llama-3.2-11B-Vision-Instruct', 'Qwen/Qwen2-VL-7B-Instruct'].some(element => model === element) ? 4096 : 8192);
        chatCompletionInput.messages = [
            ...model.startsWith('google')
                ? [
                    {
                        content: promptInstructions,
                        role: 'user'
                    },
                    {
                        content: '',
                        role: 'assistant'
                    }
                ]
                : [{
                        content: promptInstructions,
                        role: 'system'
                    }],
            {
                content: message,
                role: 'user'
            }
        ];
        chatCompletionInput.temperature = temperature;
        chatCompletionInput.top_p = topP;
        chatCompletionInput.model = options.model;
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
    async runMistral(options, promptInstructions, message) {
        const { model, temperature, maxTokens, topP } = options;
        const result = await this.mistralClient.chat.stream({
            model,
            temperature,
            topP,
            maxTokens: maxTokens > 0 ? maxTokens : (model === 'mistral-small-latest' ? 32000 : 128000),
            messages: [
                {
                    role: 'system',
                    content: promptInstructions
                },
                {
                    role: 'user',
                    content: message
                }
            ]
        });
        const collectedStreamTexts = [];
        for await (const chunk of result) {
            collectedStreamTexts.push(chunk.data.choices[0].delta.content);
        }
        return collectedStreamTexts.join('');
    }
    async translateText(text, targetLanguage, options = { model: 'gpt-4o-mini', temperature: 1, maxTokens: 0, topP: 1, nomenclature: [], splitChunkEnabled: false }) {
        if (options.model == null)
            options.model = 'gpt-4o-mini';
        if (options.temperature == null)
            options.temperature = 1;
        if (options.splitChunkEnabled === true)
            options.maxTokens = 2048;
        else if (options.maxTokens == null)
            options.maxTokens = 0;
        if (options.topP == null)
            options.topP = 1;
        const queues = text.split('\n');
        const responses = [];
        const splitChunkEnabled = options.splitChunkEnabled ?? false;
        const { model } = options;
        const isMistral = /^(?:open-)?[^-]+tral/.test(model);
        let queries = [];
        while (queues.length > 0) {
            queries.push(queues.shift());
            if (queues.length === 0 || (splitChunkEnabled && [...queries, queues[0]].join('\n').length > this.maxContentLengthPerRequest)) {
                const query = queries.join('\n');
                const nomenclature = (options.nomenclature ?? []).filter(([first]) => query.includes(first)).map(element => element.join('\t'));
                const PROMPT_INSTRUCTIONS = `Translate the following text into ${targetLanguage}. ${nomenclature.length > 0 ? 'Ensure to accurately map people\'s proper names, ethnicities, and species, or place names and other concepts listed in the Nomenclature Mapping Table. ' : ''}${/\n\s*[^\s]+/.test(query) ? 'Strictly preserve every newline character or end-of-line marker as they appear in the original text in your translations. ' : ''}Your translations must convey all the content in the original text and cannot involve explanations or other unnecessary information. Please ensure that the translated text is natural for native speakers with correct grammar and proper word choices. Your output must only contain the translated text and cannot include explanations or other information.`;
                const MESSAGE = PROMPT_INSTRUCTIONS.includes('map people\'s proper names, ethnicities, and species, or place names and other concepts') ? `<|start_of_nomenclature_mapping_table|>source\ttarget\n${nomenclature.join('\n')}<|end_of_nomenclature_mapping_table|>\n<|start_of_text|>${query}<|end_of_text|>` : query;
                responses.push(isMistral ? this.runMistral(options, PROMPT_INSTRUCTIONS, MESSAGE) : (model.startsWith('claude') ? this.mainAnthropic(options, PROMPT_INSTRUCTIONS, MESSAGE) : (model.startsWith('gemini') ? this.runGoogleGenerativeAI(options, PROMPT_INSTRUCTIONS, MESSAGE) : (model.startsWith('gpt') || model === 'chatgpt-4o-latest' || model.startsWith('o1') ? this.mainOpenai(options, PROMPT_INSTRUCTIONS, MESSAGE) : this.launch(options, PROMPT_INSTRUCTIONS, MESSAGE)))));
                queries = [];
                if (splitChunkEnabled && isMistral && queues.length > 0)
                    await Utils.sleep(2500);
            }
        }
        const result = await Promise.all(responses).then(value => value.flat().join('\n')).catch(reason => {
            throw reason;
        });
        super.translateText(text, targetLanguage, this.DefaultLanguage.SOURCE_LANGUAGE);
        return result;
    }
}
