'use strict'
/* global axios, Papa */
import Translator from '../Translator.js'
import * as Utils from '../../Utils.js'
import Anthropic from 'https://esm.run/@anthropic-ai/sdk'
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold
} from 'https://esm.run/@google/generative-ai'
import { HfInference } from 'https://esm.run/@huggingface/inference'
import { Mistral } from 'https://esm.run/@mistralai/mistralai'
import OpenAI from 'https://esm.run/openai'
export default class GenerativeAi extends Translator {
  public readonly LANGUAGE_LIST = [
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
  ]

  public readonly DefaultLanguage = {
    SOURCE_LANGUAGE: 'Auto',
    TARGET_LANGUAGE: 'Vietnamese'
  }

  private readonly maxContentLengthPerRequest = 1000
  private readonly maxContentLinePerRequest = 25
  private readonly AIR_USER_ID
  private readonly OPENAI_API_KEY
  private readonly HYPERBOLIC_API_KEY: string
  private readonly openai
  private readonly deepseek
  private readonly anthropic
  private readonly genAI
  private readonly mistralClient
  private readonly hfInferenceClient
  public constructor (airUserId, openaiApiKey, deepseekApiKey, geminiApiKey, anthropicApiKey, mistralApiKey, hfToken, hyperbolicApiKey) {
    super()
    this.AIR_USER_ID = airUserId
    this.OPENAI_API_KEY = openaiApiKey
    this.HYPERBOLIC_API_KEY = hyperbolicApiKey
    this.openai = new OpenAI({
      apiKey: this.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    })
    this.deepseek = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: deepseekApiKey,
      dangerouslyAllowBrowser: true
    })
    this.anthropic = new Anthropic({
      apiKey: anthropicApiKey,
      dangerouslyAllowBrowser: true
    })
    this.genAI = new GoogleGenerativeAI(geminiApiKey)
    this.mistralClient = new Mistral({ apiKey: mistralApiKey })
    this.hfInferenceClient = new HfInference(hfToken, { signal: this.controller.signal })
  }

  private async mainTranslatenow (requestBody): Promise<string> {
    const response = await axios.post(`${Utils.CORS_HEADER_PROXY as string}https://gateway.api.airapps.co/aa_service=server5/aa_apikey=5N3NR9SDGLS7VLUWSEN9J30P//v3/proxy/open-ai/v1/chat/completions`, JSON.stringify(requestBody), {
      headers: {
        'User-Agent': 'iOS-TranslateNow/8.12.0.1002 CFNetwork/3826.400.120 Darwin/24.3.0',
        'Content-Type': 'application/json',
        'accept-language': 'vi-VN,vi;q=0.9',
        'air-user-id': this.AIR_USER_ID
      },
      signal: this.controller.signal
    }).then(response => requestBody.stream === true ? (response.data as string).split('\n').filter(element => element.startsWith('data: ') && !element.startsWith('data: [DONE]')).map(element => JSON.parse(`{${element.replace('data: ', '"data":')}}`).data.choices[0].delta.content).filter(element => element != null).join('') : response.data.choices[0].message.content).catch(error => {
      throw new Error(error.data)
    })
    return response
  }

  public async mainOpenai (options, systemPrompts, message): Promise<string> {
    const { model, temperature, topP } = options as { model: string, temperature: number, topP: number }
    const isDeepseek = model.startsWith('deepseek')
    const requestBody: { [key: string]: any } = isDeepseek
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
            })
    if (isDeepseek) {
      requestBody.model = model
      requestBody.messages = [
        ...systemPrompts.map(element => ({ content: element, role: 'system' })),
        {
          content: message,
          role: 'user'
        }
      ]
      requestBody.stream = true
      requestBody.temperature = temperature
      requestBody.top_p = topP
    } else {
      requestBody.messages = [
        ...systemPrompts.map(element => ({ content: element, role: /^o\d/.test(model) ? (model === 'o1-mini' ? 'user' : 'developer') : 'system' })),
        {
          content: message,
          role: 'user'
        }
      ]
      requestBody.model = model
      if (Object.hasOwn(requestBody, 'max_completion_tokens')) requestBody.max_completion_tokens = null
      if (model !== 'o1') requestBody.stream = true
      if (Object.hasOwn(requestBody, 'temperature') && model !== 'chatgpt-4o-latest') requestBody.temperature = temperature
      if (Object.hasOwn(requestBody, 'top_p') && model !== 'chatgpt-4o-latest') requestBody.top_p = topP
    }

    if (!isDeepseek && this.OPENAI_API_KEY.length === 0 && new URLSearchParams(window.location.search).has('debug')) {
      return await this.mainTranslatenow(requestBody)
    } else {
      const response = (isDeepseek ? this.deepseek : this.openai).chat.completions.create(requestBody, { signal: this.controller.signal })
      if (requestBody.stream as boolean) {
        const collectedMessages: string[] = []
        for await (const chunk of response) {
          collectedMessages.push(chunk.choices[0].delta.content)
        }
        return collectedMessages.filter(element => element != null).join('')
      } else {
        return response.choices[0].message.content
      }
    }
  }

  public async runGoogleGenerativeAI (options, systemPrompts, message): Promise<string> {
    const modelParams: { [key: string]: string } = {
      model: 'gemini-2.0-flash'
    }
    const { model, temperature, topP } = options
    modelParams.model = model
    if (modelParams.model !== 'gemini-1.0-pro') modelParams.systemInstruction = systemPrompts[0]
    const generativeModel = this.genAI.getGenerativeModel(modelParams)

    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: 'text/plain'
    }

    generationConfig.maxOutputTokens = undefined
    generationConfig.temperature = temperature
    generationConfig.topP = topP
    if (['gemini-2.0-flash-lite-preview-02-05', 'gemini-1.5-flash-001', 'gemini-1.5-pro-001', 'gemini-2.0-pro-exp-02-05', 'gemini-exp-1206', 'gemini-2.0-flash-thinking-exp-01-21', 'learnlm-1.5-pro-experimental'].some(element => modelParams.model === element)) generationConfig.topK = 64
    const startChatParams: { [key: string]: any } = {
      generationConfig,
      history: [
      ]
    }
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
    ]
    startChatParams.history.push(...(modelParams.model === 'gemini-1.0-pro' ? systemPrompts : systemPrompts.slice(1)).map(element => ({ role: 'user', parts: [{ text: element }] })))

    const chatSession = generativeModel.startChat(startChatParams)

    const result = await chatSession.sendMessageStream(message, { signal: this.controller.signal })
    const collectedChunkTexts: string[] = []
    for await (const chunk of result.stream) {
      collectedChunkTexts.push(chunk.text())
    }
    return collectedChunkTexts.join('')
  }

  public async mainAnthropic (options, systemPrompts, message): Promise<string> {
    const body: { [key: string]: any } = {
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      temperature: 0,
      messages: []
    }
    const { model, temperature, topP } = options as { model: string, temperature: number, topP: number }
    body.model = model
    body.messages = [
      {
        role: 'user',
        content: message
      }
    ]
    body.max_tokens = undefined
    body.system = systemPrompts.map(element => ({ text: element, type: 'text' }))
    body.temperature = temperature
    body.top_p = topP
    const collectedTexts: string[] = []
    await this.anthropic.messages.stream(body, { signal: this.controller.signal }).on('text', text => {
      collectedTexts.push(text)
    })
    return collectedTexts.join('')
  }

  public async runMistral (options, systemPrompts, message): Promise<string> {
    const { model, temperature, topP } = options as { model: string, temperature: number, topP: number }
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
    }, { fetchOptions: { signal: this.controller.signal } })
    const collectedStreamTexts: string[] = []
    for await (const chunk of result) {
      collectedStreamTexts.push(chunk.data.choices[0].delta.content)
    }
    return collectedStreamTexts.join('')
  }

  public async launch (options, systemPrompts, message): Promise<string> {
    let out = ''

    const chatCompletionInput: { [key: string]: any } = {
      model: 'meta-llama/Llama-3.1-8B-Instruct',
      messages: [
        { role: 'user', content: 'Tell me a story' }
      ],
      temperature: 0.5,
      max_tokens: 2048,
      top_p: 0.7
    }
    const { model, temperature, topP } = options as { model: string, temperature: number, topP: number }
    chatCompletionInput.max_tokens = undefined
    chatCompletionInput.messages = [
      ...systemPrompts.flatMap(element => ['google', 'mistralai', 'tiiuae'].some(element => model.startsWith(element)) ? [{ content: element, role: 'user' }, { content: '', role: 'assistant' }] : { content: element, role: 'system' }),
      {
        content: message,
        role: 'user'
      }
    ]
    chatCompletionInput.temperature = temperature
    chatCompletionInput.top_p = topP
    chatCompletionInput.model = model

    const stream = this.hfInferenceClient.chatCompletionStream(chatCompletionInput)

    for await (const chunk of stream) {
      if (chunk.choices != null && chunk.choices.length > 0) {
        const newContent: string = chunk.choices[0].delta.content
        out += newContent
        // console.log(newContent)
      }
    }
    return out
  }

  public async fetch (options, systemPrompts, message): Promise<string> {
    const url = 'https://api.hyperbolic.xyz/v1/chat/completions'

    const body: { [key: string]: any } = {
      model: 'deepseek-ai/DeepSeek-R1-Zero',
      messages: [
        {
          role: 'user',
          content: 'What can I do in SF?'
        }
      ],
      max_tokens: 508,
      temperature: 0.1,
      top_p: 0.9,
      stream: false
    }
    const { model, temperature, topP } = options as { model: string, temperature: number, topP: number }
    body.model = model
    body.messages = [
      ...systemPrompts.flatMap(element => ({ role: 'system', content: element })),
      {
        content: message,
        role: 'user'
      }
    ]
    body.max_tokens = null
    body.temperature = temperature
    body.top_p = topP
    body.stream = true
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.HYPERBOLIC_API_KEY}`
      },
      body: JSON.stringify(body)
    })

    const text = await response.text()

    const output = text.split('\n').filter(element => element.startsWith('data: ') && !element.startsWith('data: [DONE]')).map(element => JSON.parse(`{${element.replace('data: ', '"data":')}}`).data.choices[0].delta.content).filter(element => element != null).join('')
    return output
  }

  public async translateText (text, targetLanguage: string, options: { sourceLanguage: string | null, model?: string, temperature?: number, topP?: number, instructions?: string, dictionary?: string[][] } = { sourceLanguage: null }): Promise<string> {
    if (options.model == null) options.model = 'gpt-4o-mini'
    if (options.temperature == null) options.temperature = 0.2
    if (options.topP == null) options.topP = 1
    if (options.instructions == null) options.instructions = ''
    if (options.dictionary == null) options.dictionary = []
    const { sourceLanguage, model, instructions, dictionary } = options
    const isGoogleGenerativeAi = model.startsWith('gemini') || model.startsWith('learnlm')
    const isMistral = /^(?:open-)?[^-]+tral/.test(model)
    const SYSTEM_PROMPTS: string[] = []
    SYSTEM_PROMPTS.push(`I want you to act as a ${targetLanguage} translator.${model.startsWith('gpt') || model === 'chatgpt-4o-latest' || /^o\d/.test(model)
? `
You are trained on data up to ${/^gpt-4[^o]/.test(model) ? 'December 2023' : (model === 'chatgpt-4o-latest' ? 'June 2024' : (model.startsWith('gpt-3.5') ? 'September 2021' : 'October 2023'))}.`
: ''}`)
    if (instructions.replaceAll(/^\s+|\s+$/g, '').length > 0) {
      SYSTEM_PROMPTS.push(`# User’s Instructions

The user provided the additional info about how they would like you to translate:
\`\`\`${instructions}\`\`\``)
    }
    const filteredDictionary: string[][] = dictionary.filter(([first]) => text.includes(first))
    if (filteredDictionary.length > 0) {
      SYSTEM_PROMPTS.push(`# User’s Dictionary

The user provided the dictionary for specific term translations:
\`\`\`csv
${Papa.unparse({ fields: ['sourceText', 'targetText'], data: filteredDictionary }, { newline: '\n' }) as string}
\`\`\``)
    }
    SYSTEM_PROMPTS.push(`I will speak to you in ${sourceLanguage != null && sourceLanguage !== this.DefaultLanguage.SOURCE_LANGUAGE ? `${sourceLanguage} and you will ` : 'any language and you will detect the language, '}translate it and answer in the corrected version of my text, exclusively in ${targetLanguage}, while keeping the format.
Your translations must convey all the content in the original text and cannot involve explanations or other unnecessary information.
Please ensure that the translated text is natural for native speakers with correct grammar and proper word choices.
Your output must only contain the translated text and cannot include explanations or other information.`)
    const MESSAGE = /\n\s*[^\s]+/.test(text) ? text.split('\n').map((element: string, index: number) => `[${index + 1}]${element}`).join('\n') : text
    const result = await (model.includes('/') ? (['deepseek-ai/DeepSeek-R1-Zero', 'deepseek-ai/DeepSeek-R1', 'deepseek-ai/DeepSeek-V3', 'meta-llama/Llama-3.3-70B-Instruct', 'meta-llama/Meta-Llama-3-70B-Instruct', 'meta-llama/Meta-Llama-3.1-405B', 'meta-llama/Meta-Llama-3.1-405B-FP8', 'meta-llama/Meta-Llama-3.1-405B-Instruct', 'meta-llama/Meta-Llama-3.1-70B-Instruct', 'meta-llama/Meta-Llama-3.1-8B-Instruct'].some(element => element === model) ? this.fetch(options, SYSTEM_PROMPTS, MESSAGE) : this.launch(options, SYSTEM_PROMPTS, MESSAGE)) : (isMistral ? this.runMistral(options, SYSTEM_PROMPTS, MESSAGE) : (model.startsWith('claude') ? this.mainAnthropic(options, SYSTEM_PROMPTS, MESSAGE) : (isGoogleGenerativeAi ? this.runGoogleGenerativeAI(options, SYSTEM_PROMPTS, MESSAGE) : this.mainOpenai(options, SYSTEM_PROMPTS, MESSAGE))))).then(value => /\n\s*[^\s]+/.test(text) ? value.split('\n').map(element => element.replace(/^( ?)\[\d+] ?/, '$1')).join('\n') : value).catch(reason => {
      throw reason
    })
    super.translateText(text, targetLanguage, sourceLanguage)
    return result
  }
}
