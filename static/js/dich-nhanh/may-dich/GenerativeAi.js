'use strict';
/* global axios */
import Translator from '../Translator.js';
import * as Utils from '../../Utils.js';
import Anthropic from 'https://esm.run/@anthropic-ai/sdk';
import { GoogleGenAI, HarmBlockThreshold, HarmCategory } from 'https://esm.run/@google/genai';
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
            label: 'Tiếng Việt',
            value: 'Vietnamese'
        },
        {
            label: 'Tiếng Nhật',
            value: 'Japanese'
        },
        {
            label: 'Tiếng Trung (giản thể)',
            value: 'Chinese (simplified)'
        },
        {
            label: 'Tiếng Trung (phồn thể)',
            value: 'Chinese (traditional)'
        }
    ];
    DefaultLanguage = {
        SOURCE_LANGUAGE: 'null',
        TARGET_LANGUAGE: 'Vietnamese'
    };
    AIR_USER_ID;
    OPENAI_API_KEY;
    openai;
    ai;
    anthropic;
    mistralClient;
    deepseek;
    groq;
    OPENROUTER_API_KEY;
    openrouter;
    constructor(apiKey, airUserId) {
        super();
        const { openaiApiKey, geminiApiKey, anthropicApiKey, mistralApiKey, deepseekApiKey, groqApiKey, openrouterApiKey } = apiKey;
        this.OPENAI_API_KEY = openaiApiKey;
        this.openai = new OpenAI({
            apiKey: this.OPENAI_API_KEY,
            dangerouslyAllowBrowser: true
        });
        this.ai = new GoogleGenAI({
            apiKey: geminiApiKey
        });
        this.anthropic = new Anthropic({
            apiKey: anthropicApiKey,
            dangerouslyAllowBrowser: true
        });
        this.mistralClient = new Mistral({ apiKey: mistralApiKey });
        this.deepseek = new OpenAI({
            baseURL: 'https://api.deepseek.com',
            apiKey: deepseekApiKey,
            dangerouslyAllowBrowser: true
        });
        this.groq = new Groq({
            apiKey: groqApiKey,
            dangerouslyAllowBrowser: true
        });
        this.OPENROUTER_API_KEY = openrouterApiKey;
        this.openrouter = new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: openrouterApiKey,
            dangerouslyAllowBrowser: true
        });
        this.AIR_USER_ID = airUserId;
    }
    async translatenowMain(requestBody) {
        const response = await axios.post(`${Utils.CORS_HEADER_PROXY}https://gateway.api.airapps.co/aa_service=server5/aa_apikey=5N3NR9SDGLS7VLUWSEN9J30P//v3/proxy/open-ai/v1/chat/completions`, JSON.stringify(requestBody), {
            headers: {
                'User-Agent': 'iOS-TranslateNow/8.15.0.1002 CFNetwork/3826.500.62.2.1 Darwin/24.4.0',
                'Content-Type': 'application/json',
                'accept-language': 'vi-VN,vi;q=0.9',
                'air-user-id': this.AIR_USER_ID
            },
            signal: this.controller.signal
        }).then(response => requestBody.stream === true ? response.data.split('\n').filter(element => element.startsWith('data: ') && !element.startsWith('data: [DONE]')).map(element => JSON.parse(`{${element.replace('data: ', '"data":')}}`).data).map(element => element.choices[0].delta.content).filter(element => element != null).join('') : response.data.choices[0].message.content).catch(error => {
            throw new Error(error.data);
        });
        return response;
    }
    async openaiMain(options, systemInstructions, message) {
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
                    messages: [],
                    store: false
                }
                : {
                    model: 'gpt-4.1',
                    messages: [],
                    response_format: {
                        type: 'text'
                    },
                    temperature: 1,
                    max_completion_tokens: 2048,
                    top_p: 1,
                    frequency_penalty: 0,
                    presence_penalty: 0,
                    store: false
                });
        if (isDeepseek) {
            requestBody.model = model;
            requestBody.messages = [
                ...systemInstructions.map((element, index) => ({ content: element, role: index > 0 ? 'user' : 'system' })),
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
                ...systemInstructions.map((element, index) => ({ content: [{ type: 'text', text: element }], role: index > 0 ? 'user' : (/^o\d/.test(model) ? (model === 'o1-mini' ? 'user' : 'developer') : 'system') })),
                {
                    content: message,
                    role: 'user'
                }
            ];
            requestBody.model = model.replace(/-(?:low|medium|high)$/, '');
            if (/^gpt-4o(?:-mini)?-search/.test(requestBody.model)) {
                requestBody.frequency_penalty = undefined;
                requestBody.presence_penalty = undefined;
            }
            if (Object.hasOwn(requestBody, 'max_completion_tokens'))
                requestBody.max_completion_tokens = null;
            if (/^(?:o1|o3-mini).*-(?:low|medium|high)$/.test(model))
                requestBody.reasoning_effort = model.match(/-([^-]+)$/)[1];
            requestBody.stream = true;
            if (/^gpt-4o(?:-mini)?-search/.test(requestBody.model)) {
                requestBody.temperature = undefined;
                requestBody.top_p = undefined;
            }
            else {
                if (Object.hasOwn(requestBody, 'temperature'))
                    requestBody.temperature = temperature;
                if (Object.hasOwn(requestBody, 'top_p'))
                    requestBody.top_p = topP;
            }
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
    async googleGenAiMain(options, systemInstructions, message) {
        const { model, temperature, topP, topK } = options;
        const tools = [];
        // if (doSearch) tools.push({ googleSearch: {} })
        const config = {
            responseMimeType: 'text/plain'
        };
        if (tools.length > 0)
            config.tools = tools;
        config.safetySettings = [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_NONE // Block none
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_NONE // Block none
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_NONE // Block none
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_NONE // Block none
            }
        ];
        if (!model.startsWith('gemma')) {
            config.systemInstruction = systemInstructions.map(element => ({
                text: element
            }));
        }
        config.temperature = temperature;
        config.topP = topP;
        config.topK = topK;
        if ( /* model.startsWith('gemma-3') || */(model.startsWith('gemini-2.5-flash') && model.endsWith('-normal'))) {
            config.thinkingConfig = {
                thinkingBudget: 0
            };
        }
        // const model = 'gemini-2.5-pro-preview-03-25';
        let contents = [
            {
                role: 'user',
                parts: [
                    {
                        text: 'INSERT_INPUT_HERE'
                    }
                ]
            }
        ];
        contents = [
            ...model.startsWith('gemma')
                ? systemInstructions.map(element => ({
                    role: 'user',
                    parts: [
                        {
                            text: element
                        }
                    ]
                }))
                : [],
            {
                role: 'user',
                parts: [
                    {
                        text: message
                    }
                ]
            }
        ];
        if (model.startsWith('gemma-3')) {
            const response = await this.ai.models.generateContent({
                model: model.replace(/-normal$/, ''),
                config,
                contents
            });
            return response.text;
        }
        else {
            const response = await this.ai.models.generateContentStream({
                model: model.replace(/-normal$/, ''),
                config,
                contents
            });
            const collectedChunkTexts = [];
            for await (const chunk of response) {
                // console.log(chunk.text);
                collectedChunkTexts.push(chunk.text);
            }
            return collectedChunkTexts.join('');
        }
    }
    async anthropicMain(options, systemInstructions, message) {
        const body = {
            model: 'claude-3-7-sonnet-20250219',
            max_tokens: 20000,
            temperature: 1,
            messages: []
        };
        const { model, temperature, topP, topK } = options;
        body.model = model.replace(/-thinking$/, '');
        body.messages = [
            ...systemInstructions.slice(1).map(element => ({
                role: 'user',
                content: element
            })),
            {
                role: 'user',
                content: message
            }
        ];
        body.max_tokens = undefined;
        body.system = systemInstructions[0];
        if (/-thinking$/.test(model)) {
            body.thinking = {
                type: 'enabled',
                budget_tokens: 16000
            };
        }
        else {
            body.temperature = temperature;
            body.top_k = topK;
            body.top_p = topP;
        }
        const collectedTexts = [];
        await this.anthropic.messages.stream(body, { signal: this.controller.signal }).on('text', text => {
            collectedTexts.push(text);
        });
        return collectedTexts.join('');
    }
    async runMistral(options, systemInstructions, message) {
        const { model, temperature, topP } = options;
        const result = await this.mistralClient.chat.stream({
            model,
            temperature,
            topP,
            maxTokens: undefined,
            messages: [
                ...systemInstructions.map((element, index) => ({
                    role: index > 0 ? 'user' : 'system',
                    content: element
                })),
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
    async groqMain(options, systemInstructions, message) {
        const requestBody = {
            messages: [],
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            temperature: 1,
            max_completion_tokens: 1024,
            top_p: 1,
            stream: true,
            stop: null
        };
        const { model, temperature, topP } = options;
        requestBody.max_completion_tokens = null;
        requestBody.messages = [
            ...systemInstructions.flatMap((element, index) => ({
                content: element,
                role: index > 0 ? 'user' : 'system'
            })),
            {
                content: message,
                role: 'user'
            }
        ];
        requestBody.model = model;
        requestBody.temperature = temperature;
        requestBody.top_p = topP;
        const chatCompletion = await this.groq.chat.completions.create(requestBody);
        if (requestBody.stream) {
            const collectedMessages = [];
            for await (const chunk of chatCompletion) {
                collectedMessages.push(chunk.choices[0]?.delta?.content ?? '');
            }
            return collectedMessages.join('');
        }
        else {
            return chatCompletion.choices[0].message.content;
        }
    }
    async openrouterMain(options, systemInstructions, message) {
        const request = {
            model: 'openai/gpt-4o',
            messages: [
                {
                    role: 'user',
                    content: 'What is the meaning of life?'
                }
            ]
        };
        const { model, temperature, topP, topK } = options;
        request.model = model.startsWith('qwen/qwen3') ? model.replace('-no-think', '') : model;
        request.messages = [
            ...systemInstructions.map((element, index) => ({
                role: index > 0 ? 'user' : (/^openai\/o\d/.test(model) ? (model === 'openai/o1-mini' ? 'user' : 'developer') : 'system'),
                content: element
            })),
            {
                role: 'user',
                content: `${message}${request.model.startsWith('qwen/qwen3') ? ` ${model.includes('no-think') ? '/no_think' : '/think'}` : ''}`
            }
        ];
        request.stream = true;
        request.temperature = temperature;
        request.top_p = topP;
        request.top_k = topK;
        // const completion = await this.openrouter.chat.completions.create(request, { signal: this.controller.signal })
        const collectedMessages = [];
        /** for await (const chunk of completion) {
          collectedMessages.push(chunk.choices[0].delta.content)
        } */
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request),
            signal: this.controller.signal
        });
        const reader = response.body?.getReader();
        if (reader == null) {
            throw new Error('Response body is not readable');
        }
        const decoder = new TextDecoder();
        let buffer = '';
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                // Append new chunk to buffer
                buffer += decoder.decode(value, { stream: true });
                // Process complete lines from buffer
                while (true) {
                    const lineEnd = buffer.indexOf('\n');
                    if (lineEnd === -1)
                        break;
                    const line = buffer.slice(0, lineEnd).trim();
                    buffer = buffer.slice(lineEnd + 1);
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]')
                            break;
                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices[0].delta.content;
                            if (content != null) {
                                // console.log(content);
                                collectedMessages.push(content);
                            }
                        }
                        catch (e) {
                            // Ignore invalid JSON
                        }
                    }
                }
            }
        }
        finally {
            await reader.cancel();
        }
        return collectedMessages.filter(element => element != null).join('');
    }
    async translateText(text, targetLanguage, options = { sourceLanguage: null }) {
        if (options.model == null)
            options.model = 'gpt-4o-mini';
        if (options.temperature == null)
            options.temperature = 0.1;
        if (options.topP == null)
            options.topP = 0.95;
        if (options.topK == null)
            options.topK = 50;
        if (options.systemPrompt == null)
            options.systemPrompt = 'Basic';
        if (options.tone == null)
            options.tone = 'Serious';
        if (options.domain == null)
            options.domain = 'None';
        if (options.customPrompt == null)
            options.customPrompt = '';
        if (options.dictionary == null)
            options.dictionary = [];
        const { sourceLanguage, model, systemPrompt, tone, domain, customPrompt, dictionary } = options;
        const isGoogleGenAi = model.startsWith('gemini') || model.startsWith('learnlm') || model.startsWith('gemma-3');
        const isMistral = /^(?:open-)?[^-]+tral/.test(model);
        const SYSTEM_PROMPTS = [];
        switch (systemPrompt) {
            case 'Professional': {
                const originalLang = (sourceLanguage ?? 'English').toUpperCase();
                const destLang = targetLanguage.toUpperCase();
                const domainValue = domain === 'None' ? 'Lifestyle' : domain;
                const DOMAIN_INSTRUCTION_MAP = {
                    'Economics - Finance': '- focus on presenting and analyzing information related to the domain.\n- use technical terminology that is precise, clear, neutral, and objective.\n- sentence structure is coherent, presenting information in a logical order.',
                    'Literature - Arts': '- use local words/dialect words/slang/jargon, morphological function words - express emotions/feelings/attitudes.\n- sentences have a structured arrangement, words are selected and polished to create artistic and aesthetic value.\n- use words that are appropriate to the setting and timeline of the story.\n- use words that are easy to understand, easy to visualize, and bring emotions to the reader.\n- make sure the words and sentences flow together like a story from beginning to end.\n- the relationships between characters must be clearly defined and not confused.\n- character names, minor character names, the way characters address each other, and the way the narrator addresses and refers to other characters must be consistent from beginning to end of the story and cannot be changed arbitrarily.\n- the writing is always carefully crafted, emotional, and brings indescribable emotions to the reader.',
                    'Science - Technology': '- use a system of scientific terms, literal, univocal words, complex but standard sentence structures, systems of symbols, formulas, diagrams, models, tables, etc.\n- sentences must have complex structures to fully present the multifaceted content of concepts and theorems. prioritize the use of equal sentences, passive sentences, sentences with missing subjects and sentences with indefinite subjects.',
                    'Administrative documents': '- arranged according to the prescribed format.\n- administrative and objective terms, clear syntax. prioritize the use of declarative sentences, not interrogative or expressive.',
                    Lifestyle: '- the text is simple, close and easy to understand.\n- use the easiest words possible.'
                };
                const toneValue = tone === 'None' ? 'Serious' : tone;
                const TONE_INSTRUCTION_MAP = {
                    Serious: '\n    - Language should be neutral, precise and technical, avoiding emotional elements.\n    - Make everything clear and logical.',
                    Friendly: '\n    - Use language that is warm, approachable, and conversational.\n    - Ensure the language feels natural and relaxed.',
                    Humorous: '\n    - Language must be fun, light and humorous. Use jokes or creative expressions.\n    - Must use entertaining words, wordplay, trendy words, words that young people often use.',
                    Formal: '\n    - Utilize language that is formal, respectful, and professional. Employ complex sentence structures and maintain a formal register.\n    - Choose polite, precise, and refined vocabulary.\n    - Incorporate metaphors, idioms, parallel structures, and couplets where appropriate. Ensure that dialogue between characters is formal and well-ordered.\n    - When relevant, use selectively chosen archaic or classical words, especially if the context pertains to historical or ancient settings.',
                    Romantic: '\n    - Language must be emotional, poetic and artistic.\n    - Choose flowery, sentimental, and erotic words.\n    - The writing is gentle, focusing on subtle feelings about love and deep character emotions.'
                };
                const dictionaryEntries = dictionary.filter(([first]) => text.includes(first));
                SYSTEM_PROMPTS.push(`### ROLE:\nYou are a translation professional with many years of experience, able to translate accurately and naturally between languages. You have a good understanding of the grammar, vocabulary and style of both ${originalLang} and ${destLang}. You also know how to maintain the original meaning and emotion of the text when translating.\n\n### INSTRUCTION:\n- Translate the following paragraphs into ${destLang}, ensuring each sentence is fully understood and free from confusion.\n- Avoid adding any new information, explaining or changing the meaning of the original text.\n- Each translated text segment must have a UUID that exactly matches the UUID of the original text segment.\n- The UUIDs must exactly correspond to the UUIDs in the original text. Do not make up your own UUIDs or confuse the UUIDs of one text with those of another.\n- Only translated into ${destLang} language, not into any other language other than ${destLang}\n- The only priority is translation, do not arbitrarily add your own thoughts and explanations that are not in the original text.\n- Do not insert additional notes or explanations with the words in the translation.\n- Spaces and line breaks must be kept intact, not changed or replaced with /t /n\n- If UUID not have text to translate, just return ""\n- Follow the instruction for translate with domain ${domainValue}:\n${DOMAIN_INSTRUCTION_MAP[['Banking', 'Accounting', 'Management', 'Law', 'Logistics', 'Marketing', 'Securities - Investment', 'Insurance', 'Real Estate'].some(element => domain === element) ? 'Economics - Finance' : (['Music', 'Painting', 'Theater - Cinema', 'Poetry', 'Epic', "Children's Stories", 'Historical Stories', 'Fiction', 'Short Stories'].some(element => domain === element) ? 'Literature - Arts' : (['Physics', 'Chemistry', 'Informatics', 'Electronics', 'Medicine', 'Mechanics', 'Meteorology - Hydrology', 'Agriculture'].some(element => domain === element) ? 'Science - Technology' : (['Legal Documents', 'Internal Documents', 'Email'].some(element => domain === element) ? 'Administrative documents' : 'Lifestyle')))]}\n- Handle special case:\n+ Numbers: Maintain the original numeric values, but adapt formats if necessary (e.g., decimal separators, digit grouping).\n+ Currencies: Convert currency symbols or codes as appropriate for the target language and region.\n+ Dates: Adjust date formats to match the conventions of the target language and culture.\n+ Proper nouns: Generally, do not translate names of people, places, or organizations unless there's a widely accepted equivalent in the target language.\n+ Units of measurement: if they cannot be translated into ${destLang}, convert the unit of measurement to an equivalent system in ${destLang}, but precise calculations are required when converting units and detailed\n### CHAIN OF THOUGHT: Lets thinks step by step to translate but only return the translation:\n1.  Depend on the Input text, find the context and insight of the text by answer all the question below:\n- What is this document about, what is its purpose, who is it for, what is the domain of this document\n- What should be noted when translating this document from ${originalLang} to ${destLang} to ensure the translation is accurate. Especially the technical parameters, measurement units, acronym, technical standards, unit standards are different between ${originalLang} and ${destLang}\n- What is ${originalLang} abbreviations in the context of the document should be understood correctly and translated accurately into ${destLang}. It is necessary to clearly understand the meaning of the abbreviation and not to mistake a ${originalLang} abbreviation for an ${destLang} word.\n- Always make sure that users of the language ${destLang} do not find it difficult to understand when reading\n2. Based on the instructions and rules in INSTRUCTION and what you learned in step 1, proceed to translate the text.\n3. Acting as a reader, give comments on the translation based on the following criteria:\n- Do you understand what the translation is talking about\n- Does the translation follow the rules given in the INSTRUCTION\n- Is the translation really good, perfect? \u200b\u200bIf not good, what is not good, what needs improvement?\n4. Based on the comments in step 3, revise the translation (if necessary).\n### STYLE INSTRUCTION:\n\n        The style of the output must be ${toneValue}:\n        -${TONE_INSTRUCTION_MAP[toneValue]}\n\n\n### ADVANCED MISSION (HIGHEST PRIORITY):\n${dictionaryEntries.length > 0 ? dictionaryEntries.map(([first, second]) => `Must translate: ${first} into ${second}`).join('\n') : ''}\n- Follow the instruction below when translate:\n${customPrompt.replaceAll(/^\s+|\s+$/g, '')}\n### OUTPUT FORMAT MUST BE IN JSON:\n{\n  "type": "object",\n  "properties": {\n    "insight": {\n      "type": "array",\n      "items": {\n        "type": "string"\n      }\n    },\n    "rule": {\n      "type": "array",\n      "items": {\n        "type": "string"\n      }\n    },\n    "translated_string": {\n      "type": "string"\n    }\n  },\n  "required": ["insight", "rule", "translated_string"]\n}`);
                break;
            }
            case 'Intermediate':
                SYSTEM_PROMPTS.push(`I want you to act as a ${targetLanguage.replace(/^(Chinese \()([st])/, (_match, p1, p2) => `${p1}${p2.toUpperCase()}`)} translator.\nYou are trained on data up to October 2023.`);
                SYSTEM_PROMPTS.push(`I will speak to you in ${sourceLanguage != null && sourceLanguage !== this.DefaultLanguage.SOURCE_LANGUAGE ? `${sourceLanguage.replace(/^(Chinese \()([st])/, (_match, p1, p2) => `${p1}${p2.toUpperCase()}`)} and you will ` : 'any language and you will detect the language, '}translate it and answer in the corrected version of my text, exclusively in ${targetLanguage.replace(/^(Chinese \()([st])/, (_match, p1, p2) => `${p1}${p2.toUpperCase()}`)}, while keeping the format.\nYour translations must convey all the content in the original text and cannot involve explanations or other unnecessary information.\nPlease ensure that the translated text is natural for native speakers with correct grammar and proper word choices.\nYour output must only contain the translated text and cannot include explanations or other information.`);
                break;
            case 'Basic':
            default:
                SYSTEM_PROMPTS.push(`You will be provided with a user input in ${(sourceLanguage ?? 'English').replace(/^(Chinese \()([st])/, (_match, p1, p2) => `${p1}${p2.toUpperCase()}`)}.\nTranslate the text into ${targetLanguage.replace(/^(Chinese \()([st])/, (_match, p1, p2) => `${p1}${p2.toUpperCase()}`)}.\nOnly output the translated text, without any additional text.`);
        }
        let queryText = text.split('\n');
        let requestText = queryText.join('\n');
        if (systemPrompt === 'Professional') {
            queryText = text.split('\n').map(element => {
                const partedUuid = window.crypto.randomUUID().split('-');
                return `${partedUuid[0]}#${partedUuid[2].substring(1)}: ${element}`;
            });
            requestText = `### TEXT SENTENCE WITH UUID:\n${queryText.filter(element => element.split(/(^[a-z0-9#]{12}): /)[2].replace(/^\s+/, '').length > 0).join('\n')}\n### TRANSLATED TEXT WITH UUID:`;
        }
        let result = await (['gemma2-9b-it', 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'llama3-70b-8192', 'llama3-8b-8192', 'deepseek-r1-distill-llama-70b', 'meta-llama/llama-4-maverick-17b-128e-instruct', 'meta-llama/llama-4-scout-17b-16e-instruct', 'mistral-saba-24b', 'qwen-qwq-32b'].some(element => element === model) ? this.groqMain(options, SYSTEM_PROMPTS, requestText) : (model.includes('/') ? this.openrouterMain(options, SYSTEM_PROMPTS, requestText) : (isMistral ? this.runMistral(options, SYSTEM_PROMPTS, requestText) : (model.startsWith('claude') ? this.anthropicMain(options, SYSTEM_PROMPTS, requestText) : (isGoogleGenAi ? this.googleGenAiMain(options, SYSTEM_PROMPTS, requestText) : this.openaiMain(options, SYSTEM_PROMPTS, requestText)))))).catch(reason => {
            throw reason;
        });
        if (model.toLowerCase().includes('deepseek-r1'))
            result = result.replace(/<think>\n(?:.+\n+)+<\/think>\n{2}/, '');
        // Sửa phần post-process của Professional Prompt với xử lý toàn diện các định dạng không chuẩn
        if (systemPrompt === 'Professional') {
            // Loại bỏ các backticks và định dạng JSON nếu có
            result = result.replaceAll(/^`{3}(?:json)?\n|\n?`{3}$/g, '');
            // Loại bỏ thông tin debug hoặc thừa mà AI có thể trả về trước hoặc sau JSON
            const jsonMatch = result.match(/(\{[\s\S]*\})/);
            const potentialJsonString = (jsonMatch != null) ? jsonMatch[0] : result;
            // Một số biến để lưu trữ các trường hợp khác nhau của output
            let extractedTranslation = null;
            let translationMap = {};
            let parsedResult = null;
            const originalUuids = queryText.map(element => {
                const match = element.match(/^([a-z0-9#]{12})/);
                return (match != null) ? match[0] : null;
            }).filter(Boolean);
            // Trường hợp 1: Trả về JSON hợp lệ với cấu trúc như yêu cầu
            try {
                // Chuẩn bị chuỗi JSON bằng cách xử lý các dòng mới trong translated_string
                const jsonString = potentialJsonString.replaceAll(/\n(?=[a-z0-9#]{12}: ?|"\n})/g, '\\n');
                if (Utils.isValidJson(jsonString)) {
                    parsedResult = JSON.parse(jsonString);
                    // Trích xuất translated_string nếu có
                    if (parsedResult != null && typeof parsedResult === 'object') {
                        // Kiểm tra các trường hợp khác nhau của cấu trúc JSON
                        if (parsedResult.translated_string !== undefined) {
                            extractedTranslation = parsedResult.translated_string;
                        }
                        else if (parsedResult.translation !== undefined) {
                            extractedTranslation = parsedResult.translation;
                        }
                        else if (parsedResult.result !== undefined) {
                            extractedTranslation = parsedResult.result;
                        }
                        else if (parsedResult.text !== undefined) {
                            extractedTranslation = parsedResult.text;
                        }
                        else if (parsedResult.content !== undefined) {
                            extractedTranslation = parsedResult.content;
                        }
                        else if (parsedResult.output !== undefined) {
                            extractedTranslation = parsedResult.output;
                        }
                        else {
                            for (const key in parsedResult) {
                                const value = parsedResult[key];
                                if (typeof value === 'string' && value.length > 0) {
                                    // Kiểm tra xem chuỗi này có chứa UUID hoặc có số dòng tương tự với văn bản gốc không
                                    if (/[a-z0-9#]{12}/.test(value) ||
                                        value.split('\n').length === queryText.length ||
                                        // Nếu chuỗi đủ dài để có thể là bản dịch (heuristic)
                                        value.length > text.length / 2) {
                                        extractedTranslation = value;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            catch (error) {
                console.error('Error processing JSON translation result:', error);
                // Tiếp tục để thử các phương pháp khác
            }
            // Nếu không tìm thấy bản dịch từ JSON, thử phương pháp khác
            if (extractedTranslation == null) {
                // Trường hợp 2: AI trả về văn bản thuần với các UUID
                const uuidPattern = /(?:^|\n)([a-z0-9#]{12}): ?(.*)/g;
                let match;
                let foundUuids = false;
                while ((match = uuidPattern.exec(result)) !== null) {
                    foundUuids = true;
                    translationMap[match[1]] = match[2];
                }
                if (foundUuids) {
                    // Đã tìm thấy các UUID trong kết quả, sử dụng translationMap
                    extractedTranslation = translationMap;
                }
                else {
                    // Trường hợp 3: AI trả về văn bản thuần không có UUID
                    // Kiểm tra xem có phải là một danh sách các câu dịch tương ứng không
                    const lines = result.split('\n').filter(line => line.trim() !== '');
                    // Nếu số dòng khớp với văn bản gốc, có thể là bản dịch theo thứ tự
                    if (lines.length === queryText.filter(line => line.trim() !== '').length) {
                        extractedTranslation = lines.join('\n');
                    }
                    else {
                        extractedTranslation = result;
                    }
                }
            }
            // Xử lý bản dịch đã trích xuất
            if (extractedTranslation !== null) {
                // Trường hợp 1: extractedTranslation là object (có thể là map UUID -> translation)
                if (typeof extractedTranslation === 'object' && !Array.isArray(extractedTranslation)) {
                    translationMap = extractedTranslation;
                }
                else if (typeof extractedTranslation === 'string' && /(?:^|\n)[a-z0-9#]{12}: ?/.test(extractedTranslation)) {
                    // Tạo map từ chuỗi có định dạng UUID: translation
                    extractedTranslation.split('\n').forEach(line => {
                        const match = line.match(/^([a-z0-9#]{12}): ?(.*)/);
                        if ((match != null) && match.length >= 3) {
                            translationMap[match[1]] = match[2];
                        }
                    });
                }
                else if (Array.isArray(extractedTranslation)) {
                    // Nếu số lượng phần tử khớp với văn bản gốc, giả định theo thứ tự
                    if (extractedTranslation.length === queryText.length) {
                        result = extractedTranslation.join('\n');
                    }
                    else {
                        // Thử tìm các phần tử có UUID
                        let hasUuids = false;
                        extractedTranslation.forEach(item => {
                            if (typeof item === 'string') {
                                const match = item.match(/^([a-z0-9#]{12}): ?(.*)/);
                                if ((match != null) && match.length >= 3) {
                                    hasUuids = true;
                                    translationMap[match[1]] = match[2];
                                }
                            }
                            else if (typeof item === 'object' && item !== null) {
                                // Kiểm tra nếu object có thuộc tính là UUID
                                let foundUuid = false;
                                for (const key in item) {
                                    if (/^[a-z0-9#]{12}$/.test(key)) {
                                        foundUuid = true;
                                        translationMap[key] = item[key];
                                    }
                                }
                                // Nếu không tìm thấy UUID là key, tìm kiếm trong các giá trị
                                if (!foundUuid && item.uuid != null && item.translation != null) {
                                    translationMap[item.uuid] = item.translation;
                                }
                            }
                        });
                        if (!hasUuids) {
                            // Không tìm thấy UUID, chỉ nối mảng
                            result = extractedTranslation.join('\n');
                        }
                    }
                }
                else if (typeof extractedTranslation === 'string') {
                    // Kiểm tra nếu số dòng trong bản dịch tương đương với văn bản gốc
                    const translatedLines = extractedTranslation.split('\n');
                    const nonEmptyOriginalLines = queryText.filter(line => line.trim() !== '').length;
                    const nonEmptyTranslatedLines = translatedLines.filter(line => line.trim() !== '').length;
                    if (nonEmptyTranslatedLines === nonEmptyOriginalLines) {
                        // Số dòng khớp, giả định mỗi dòng tương ứng với một dòng trong queryText
                        result = extractedTranslation;
                    }
                    else {
                        // Số dòng không khớp, kiểm tra xem có thể tách được UUID không
                        const uuidPattern = /(?:^|\n)([a-z0-9#]{12}): ?(.*)/g;
                        let match;
                        let hasUuid = false;
                        while ((match = uuidPattern.exec(extractedTranslation)) !== null) {
                            hasUuid = true;
                            translationMap[match[1]] = match[2];
                        }
                        if (!hasUuid) {
                            // Không tìm thấy UUID, giữ nguyên chuỗi
                            result = extractedTranslation;
                        }
                    }
                }
                // Nếu có translationMap, áp dụng mapping
                if (Object.keys(translationMap).length > 0) {
                    // Kiểm tra xem có tất cả UUID cần thiết không
                    const missingUuids = originalUuids.filter(uuid => translationMap[uuid] == null);
                    if (missingUuids.length === 0 || (missingUuids.length < originalUuids.length / 2)) {
                        // Có đủ UUID để mapping hoặc thiếu ít, map các phần tử trong queryText theo translationMap
                        result = queryText.map(element => {
                            const uuid = ((element.match(/^[a-z0-9#]{12}/) != null) || [''])[0];
                            return uuid.length > 0 && translationMap[uuid] != null ? translationMap[uuid] : element;
                        }).join('\n');
                    }
                    else {
                        // Thiếu quá nhiều UUID, có thể map không chính xác
                        // Kiểm tra tổng số dòng để xác định có lấy bản dịch toàn bộ hay không
                        const allTranslations = Object.values(translationMap).join('\n');
                        const translatedLines = allTranslations.split('\n');
                        if (translatedLines.length === queryText.length) {
                            result = allTranslations;
                        }
                        else {
                            // Không thể xác định bản dịch chính xác, quay trở lại kết quả ban đầu đã làm sạch
                            const cleanedResult = result.replace(/```json|```/g, '').trim();
                            // Loại bỏ các dòng trông giống như phần giải thích hoặc metadata
                            result = cleanedResult.split('\n')
                                .filter(line => line.match(/^(explanation|note|metadata|insight|rule|example):/i) == null)
                                .join('\n');
                        }
                    }
                }
            }
            // Xử lý đặc biệt cho định dạng chuẩn như trong ví dụ
            if (parsedResult?.translated_string != null &&
                (typeof parsedResult.translated_string === 'string') &&
                /[a-z0-9#]{12}/.test(parsedResult.translated_string) &&
                parsedResult?.insight != null && Array.isArray(parsedResult.insight) &&
                parsedResult?.rule != null && Array.isArray(parsedResult.rule)) {
                // Đây là định dạng chuẩn như trong ví dụ
                const stdTranslatedString = parsedResult.translated_string;
                // Tạo map từ định dạng UUID: translation
                const stdTranslationMap = {};
                const stdUuidPattern = /(?:^|\n)([a-z0-9#]{12}): ?(.*)/g;
                let stdMatch;
                while ((stdMatch = stdUuidPattern.exec(stdTranslatedString)) !== null) {
                    stdTranslationMap[stdMatch[1]] = stdMatch[2];
                }
                if (Object.keys(stdTranslationMap).length > 0) {
                    // Áp dụng mapping từ định dạng chuẩn
                    result = queryText.map(element => {
                        const uuid = ((element.match(/^[a-z0-9#]{12}/) != null) || [''])[0];
                        return uuid.length > 0 && stdTranslationMap[uuid] != null ? stdTranslationMap[uuid] : element;
                    }).join('\n');
                }
                else {
                    // Nếu không tìm thấy UUID trong định dạng chuẩn, sử dụng toàn bộ chuỗi
                    result = stdTranslatedString;
                }
            }
            // Làm sạch kết quả cuối cùng
            result = result.trim();
            // Loại bỏ UUID khỏi kết quả cuối cùng nếu còn sót lại
            result = result.replace(/^[a-z0-9#]{12}: /gm, '');
        }
        super.translateText(text, targetLanguage, sourceLanguage);
        return result;
    }
}
