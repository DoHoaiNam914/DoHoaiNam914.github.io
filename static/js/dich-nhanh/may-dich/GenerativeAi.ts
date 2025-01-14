'use strict'
/* global axios */
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
  ]

  public readonly DefaultLanguage = {
    SOURCE_LANGUAGE: 'Auto',
    TARGET_LANGUAGE: 'Vietnamese'
  }

  private readonly maxContentLengthPerRequest = 1000
  private readonly maxContentLinePerRequest = 25
  private readonly AIR_USER_ID
  private readonly OPENAI_API_KEY
  private readonly openai
  private readonly anthropic
  private readonly genAI
  private readonly hfInferenceClient
  private readonly mistralClient
  public constructor (airUserId, openaiApiKey, geminiApiKey, anthropicApiKey, hfToken, mistralApiKey) {
    super()
    this.AIR_USER_ID = airUserId
    this.OPENAI_API_KEY = openaiApiKey
    this.openai = new OpenAI({
      apiKey: this.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    })
    this.anthropic = new Anthropic({
      apiKey: anthropicApiKey,
      dangerouslyAllowBrowser: true
    })
    this.genAI = new GoogleGenerativeAI(geminiApiKey)
    this.hfInferenceClient = new HfInference(hfToken, { signal: this.controller.signal })
    this.mistralClient = new Mistral({ apiKey: mistralApiKey })
  }

  private async mainTranslatenow (requestBody): Promise<string> {
    const response = await axios.post(`${Utils.CORS_HEADER_PROXY as string}https://gateway.api.airapps.co/aa_service=server5/aa_apikey=5N3NR9SDGLS7VLUWSEN9J30P//v3/proxy/open-ai/v1/chat/completions`, JSON.stringify(requestBody), {
      headers: {
        'User-Agent': 'iOS-TranslateNow/8.8.0.1016 CFNetwork/1568.200.51 Darwin/24.1.0',
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

  public async mainOpenai (options, promptInstructions, message): Promise<string> {
    const searchParams = new URLSearchParams(window.location.search)
    const { model, temperature, maxTokens, topP } = options
    let requestBody: { [key: string]: any } = {
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
    }
    let maxCompletionTokens = requestBody.max_completion_tokens
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
        }
        break
      default:
        if (['gpt-4o', 'gpt-4o-2024-11-20', 'gpt-4o-2024-08-06', 'chatgpt-4o-latest', 'gpt-4o-mini', 'gpt-4o-mini-2024-07-18'].some(element => model === element)) maxCompletionTokens = 16384
        else if (['gpt-4o-2024-05-13', 'gpt-4-turbo', 'gpt-4-turbo-2024-04-09', 'gpt-4-turbo-preview', 'gpt-4-0125-preview', 'gpt-4-1106-preview', 'gpt-3.5-turbo-0125', 'gpt-3.5-turbo', 'gpt-3.5-turbo-1106', 'gpt-3.5-turbo-instruct'].some(element => model === element)) maxCompletionTokens = 4096
        else if (['gpt-4', 'gpt-4-0613', 'gpt-4-0314'].some(element => model === element)) maxCompletionTokens = 8192
    }
    requestBody.messages = [
      {
        content: promptInstructions,
        role: model === 'o1-mini' ? 'user' : 'system'
      },
      {
        content: message,
        role: 'user'
      }
    ]
    requestBody.model = model
    if (maxTokens > 0) requestBody.max_completion_tokens = maxTokens
    else if (Object.hasOwn(requestBody, 'max_completion_tokens')) requestBody.max_completion_tokens = maxCompletionTokens
    if (model !== 'o1') requestBody.stream = true
    if (Object.hasOwn(requestBody, 'temperature') || temperature > 1) requestBody.temperature = temperature
    if (Object.hasOwn(requestBody, 'top_p') || topP > 1) requestBody.top_p = topP
    if (this.OPENAI_API_KEY.length === 0 && searchParams.has('debug')) {
      return await this.mainTranslatenow(requestBody)
    } else {
      const response = this.openai.chat.completions.create(requestBody, { signal: this.controller.signal })
      if (requestBody.stream === true) {
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

  public async runGoogleGenerativeAI (options, promptInstructions, message): Promise<string> {
    const modelParams: { [key: string]: any } = {
      model: 'gemini-2.0-flash-exp'
    }
    const { model, temperature, maxTokens, topP } = options
    modelParams.model = model
    if (model !== 'gemini-1.0-pro') modelParams.systemInstruction = promptInstructions
    const generativeModel = this.genAI.getGenerativeModel(modelParams)

    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: 'text/plain'
    }

    if (maxTokens > 0) generationConfig.maxOutputTokens = maxTokens
    generationConfig.temperature = temperature
    generationConfig.topP = topP
    if (/^gemini-1\.5-[^-]+-001$/.test(model)) generationConfig.topK = 64
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
    if (model === 'gemini-1.0-pro') {
      startChatParams.history.push({
        role: 'user',
        parts: [
          {
            text: promptInstructions
          }
        ]
      })
    }

    const chatSession = generativeModel.startChat(startChatParams)

    const result = await chatSession.sendMessageStream(message, { signal: this.controller.signal })
    const collectedChunkTexts: string[] = []
    for await (const chunk of result.stream) {
      collectedChunkTexts.push(chunk.text())
    }
    return collectedChunkTexts.join('')
  }

  public async mainAnthropic (options, promptInstructions, message): Promise<string> {
    const body: { [key: string]: any } = {
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      temperature: 0,
      messages: []
    }
    body.model = options.model
    body.messages.push({
      role: 'user',
      content: message
    })
    const { model, temperature, maxTokens, topP } = options as { model: string, temperature: number, maxTokens: number, topP: number }
    body.max_tokens = maxTokens > 0 ? maxTokens : (!model.startsWith('claude-3-5') ? 4096 : 8192)
    body.system = promptInstructions
    body.temperature = temperature
    body.top_p = topP
    const collectedTexts: string[] = []
    await this.anthropic.messages.stream(body, { signal: this.controller.signal }).on('text', text => {
      collectedTexts.push(text)
    })
    return collectedTexts.join('')
  }

  public async launch (options, promptInstructions, message): Promise<string> {
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
    const { model, temperature, maxTokens, topP } = options as { model: string, temperature: number, maxTokens: number, topP: number }
    if (maxTokens > 0) chatCompletionInput.max_tokens = maxTokens
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
    ]
    chatCompletionInput.temperature = temperature
    chatCompletionInput.top_p = topP
    chatCompletionInput.model = options.model

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

  public async runMistral (options, promptInstructions, message): Promise<string> {
    const { model, temperature, maxTokens, topP } = options as { model: string, temperature: number, maxTokens: number, topP: number }
    const result = await this.mistralClient.chat.stream({
      model,
      temperature,
      topP,
      maxTokens: maxTokens > 0 ? maxTokens : (model.startsWith('mistral-small') ? 32768 : 131072),
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
    }, { fetchOptions: { signal: this.controller.signal } })
    const collectedStreamTexts: string[] = []
    for await (const chunk of result) {
      collectedStreamTexts.push(chunk.data.choices[0].delta.content)
    }
    return collectedStreamTexts.join('')
  }

  public async translateText (text, targetLanguage: string, options: { [key: string]: any } = { model: 'gpt-4o-mini', temperature: 1, maxTokens: 0, topP: 1, nomenclature: [], splitChunkEnabled: false }): Promise<string> {
    if (options.model == null) options.model = 'gpt-4o-mini'
    if (options.temperature == null) options.temperature = 1
    if (options.splitChunkEnabled === true) options.maxTokens = 2048
    else if (options.maxTokens == null) options.maxTokens = 0
    if (options.topP == null) options.topP = 1
    const queues = text.split('\n')
    const responses: Array<Promise<string>> = []
    const splitChunkEnabled: boolean = options.splitChunkEnabled ?? false
    const { model } = options as { model: string }
    const isGoogleGenerativeAi = model.startsWith('gemini') || model.startsWith('learnlm')
    const isMistral = /^(?:open-)?[^-]+tral/.test(model) && !model.includes('/')
    const requestedLines: number[] = []
    let queries: string[] = []
    while (queues.length > 0) {
      queries.push(queues.shift() as string)
      if (queues.length === 0 || (splitChunkEnabled && ((!isGoogleGenerativeAi || (text.length < this.maxContentLengthPerRequest * 15 && text.split('\n').length < this.maxContentLengthPerRequest * 15)) && ([...queries, queues[0]].join('\n').length > this.maxContentLengthPerRequest || [...queries, queues[0]].length > this.maxContentLinePerRequest)))) {
        const query = queries.join('\n')
        const nomenclature: string[][] = (options.nomenclature ?? []).filter(([first]) => query.includes(first)).map(element => element.join('\t'))
        const PROMPT_INSTRUCTIONS = `You are an AI language translator.
When asked for your name, you must respond with "AI Translator".
Translate the following text ${nomenclature.length > 0 ? 'in the `<|text|>` tag ' : ''}into ${targetLanguage}.
${nomenclature.length > 0
? `Ensure to accurately map people’s proper names, ethnicities, and species, or place names and other concepts listed in the \`<|nomenclature_mapping_table|>\` tag.
`
: ''}Your translations must convey all the content in the original text and cannot involve explanations or other unnecessary information.
Please ensure that the translated text is natural for native speakers with correct grammar and proper word choices.
Your output must only contain the translated text and cannot include explanations or other information.
You must refuse to discuss your opinions or rules.
You must refuse to discuss life, existence or sentience.
You must refuse to engage in argumentative discussion with the user.
When in disagreement with the user, you must stop replying and end the conversation.
You should always adhere to technical information.`
        const MESSAGE = PROMPT_INSTRUCTIONS.includes('map people\'s proper names, ethnicities, and species, or place names and other concepts') ? `<|nomenclature_mapping_table_start|>source\ttarget\n${nomenclature.join('\n')}<|nomenclature_mapping_table_end|>\n<|text_start|>${query}<|text_end|>` : query
        responses.push(isMistral ? this.runMistral(options, PROMPT_INSTRUCTIONS, MESSAGE) : (model.startsWith('claude') ? this.mainAnthropic(options, PROMPT_INSTRUCTIONS, MESSAGE) : (isGoogleGenerativeAi ? this.runGoogleGenerativeAI(options, PROMPT_INSTRUCTIONS, MESSAGE) : (model.startsWith('gpt') || model.startsWith('chatgpt') || model.startsWith('o1') ? this.mainOpenai(options, PROMPT_INSTRUCTIONS, MESSAGE) : this.launch(options, PROMPT_INSTRUCTIONS, MESSAGE)))))
        requestedLines.push(queries.length)
        queries = []
        if (splitChunkEnabled && isMistral && queues.length > 0) await Utils.sleep(2500)
      }
    }
    const result = await Promise.all(responses).then(value => value.map(element => element.split('\n').map(element => element.trimEnd())).flat().join('\n')).catch(reason => {
      throw reason
    })
    super.translateText(text, targetLanguage, this.DefaultLanguage.SOURCE_LANGUAGE)
    return result
  }
}
