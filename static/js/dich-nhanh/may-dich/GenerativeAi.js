'use strict'
/* global axios */
import Translator from '/static/js/dich-nhanh/Translator.js'
import * as Utils from '/static/js/Utils.js'
import Anthropic from 'https://esm.run/@anthropic-ai/sdk'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from 'https://esm.run/@google/generative-ai'
import { Mistral } from 'https://esm.run/@mistralai/mistralai'
import OpenAI from 'https://esm.run/openai'
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
  ]

  DefaultLanguage = {
    SOURCE_LANGUAGE: 'Auto',
    TARGET_LANGUAGE: 'Vietnamese'
  }

  maxContentLengthPerRequest = 1000
  uuid
  openai
  anthropic
  genAI
  client
  duckchat
  constructor (uuid, openaiApiKey, geminiApiKey, anthropicApiKey, mistralApiKey) {
    super()
    this.uuid = uuid
    this.openai = new OpenAI({
      apiKey: openaiApiKey,
      dangerouslyAllowBrowser: true
    })
    this.anthropic = new Anthropic({
      apiKey: anthropicApiKey,
      dangerouslyAllowBrowser: true
    })
    this.genAI = new GoogleGenerativeAI(geminiApiKey)
    this.client = new Mistral({ apiKey: mistralApiKey })
  }

  async getDuckchatStatus () {
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
      })
    }).catch((error) => {
      this.controller.abort()
      throw error
    })
  }

  async runOpenai (model, instructions, message) {
    const searchParams = new URLSearchParams(window.location.search)
    const isDebug = searchParams.has('debug')
    if (!isDebug && window.localStorage.getItem('OPENAI_API_KEY') == null && this.duckchat == null) { await this.getDuckchatStatus() }
    const maybeGpt4 = model === 'gpt-4' || model.startsWith('gpt-4-') ? undefined /* 8192 */ : 16384
    const maybeO1 = model.startsWith('o1') ? 100000 : maybeGpt4
    const maybeO1Preview = model.startsWith('o1-preview') ? 32768 : maybeO1
    const maybeO1Mini = model.startsWith('o1-mini') ? 65536 : maybeO1Preview
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
      temperature: model.startsWith('o1') ? undefined : 0.3,
      max_completion_tokens: ['gpt-4o-2024-05-13', 'gpt-4-turbo', 'gpt-4-turbo-2024-04-09', 'gpt-4-turbo-preview', 'gpt-4-0125-preview', 'gpt-4-1106-preview', 'gpt-3.5-turbo-0125', 'gpt-3.5-turbo', 'gpt-3.5-turbo-1106'].some((element) => model === element) ? 4096 : maybeO1Mini,
      top_p: model.startsWith('o1') ? undefined : 0.3,
      frequency_penalty: model.startsWith('o1') ? undefined : 0,
      presence_penalty: model.startsWith('o1') ? undefined : 0
    }
    const maybeIsDebug = async () => isDebug
      ? await axios.post(`${Utils.CORS_HEADER_PROXY}https://gateway.api.airapps.co/aa_service=server5/aa_apikey=5N3NR9SDGLS7VLUWSEN9J30P//v3/proxy/open-ai/v1/chat/completions`, JSON.stringify(requestBody), {
        headers: {
          'User-Agent': 'iOS-TranslateNow/8.8.0.1016 CFNetwork/1568.200.51 Darwin/24.1.0',
          'Content-Type': 'application/json',
          'accept-language': 'vi-VN,vi;q=0.9',
          'air-user-id': this.uuid
        },
        signal: this.controller.signal
      }).then(({ data }) => data).catch((error) => {
        this.controller.abort()
        throw error
      })
      : model === 'gpt-4o-mini' && await this.duckchat.post('', JSON.stringify({
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
      })).then(({ data }) => ({ choices: [{ message: { content: data.split('\n').filter((element) => /data: {(?:"role":"assistant",)?"message"/.test(element)).map((element) => JSON.parse(element.replace(/^data: /, '')).message).join('') } }] })).catch((error) => {
        this.controller.abort()
        throw error
      })
    const result = window.localStorage.getItem('OPENAI_API_KEY') == null ? await maybeIsDebug() : await this.openai.chat.completions.create(requestBody)
    return result.choices[0].message.content
  }

  async runClaude (model, instructions, message) {
    if (window.localStorage.getItem('ANTHROPIC_API_KEY') == null && this.duckchat == null) { await this.getDuckchatStatus() }
    const msg = window.localStorage.getItem('ANTHROPIC_API_KEY') == null && model === 'claude-3-haiku-20240307'
      ? this.duckchat.post(JSON.stringify({
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
      })).then(({ data }) => data.split('\n').filter((element) => /data: {(?:"role":"assistant",)?"message"/.test(element)).map((element) => JSON.parse(element.replace(/^data: /, '')).message).join('')).catch((error) => {
        this.controller.abort()
        throw error
      })
      : await this.anthropic.messages.create({
        model,
        max_tokens: !model.startsWith('claude-3-5') ? 4096 : 8192,
        temperature: 0.3,
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
      })
    return msg
  }

  async runGemini (model, instructions, message) {
    const generativeModel = this.genAI.getGenerativeModel({ model })
    const generationConfig = {
      temperature: 0.3,
      topP: 0.3,
      topK: /^gemini-1\.5-[^-]+-001$/.test(model) ? 64 : 40,
      maxOutputTokens: 8192,
      responseMimeType: 'text/plain'
    }
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
    })
    const result = await chatSession.sendMessage(message)
    return result.response.text()
  }

  async runMistral (model, instructions, message) {
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
    })
    return chatResponse.choices[0].message.content
  }

  async translateText (text, targetLanguage, model = 'gpt-4o-mini', nomenclature = []) {
    const nomenclatureList = nomenclature.filter(([first]) => text.includes(first)).map(element => element.join('\t'))
    const INSTRUCTIONS = `Translate the following text into ${targetLanguage}. ${nomenclatureList.length > 0 ? 'Accurately map proper names of people, ethnic groups, species, or place-names, and other concepts listed in the Nomenclature Lookup Table to enhance the accuracy and consistency in your translations. ' : ''}Your translations must convey all the content in the original text and cannot involve explanations or other unnecessary information. Please ensure that the translated text is natural for native speakers with correct grammar and proper word choices. Your output must only contain the translated text and cannot include explanations or other information.${nomenclatureList.length > 0
            ? `

Nomenclature Lookup Table:
\`\`\`tsv
source\ttarget
${nomenclatureList.join('\n')}
\`\`\``
            : ''}`
    const lines = text.split(/(\n)/)
    const cleanedLines = lines.filter(element => element !== '\n' && element.replace(/^\s+/, '').length > 0)
    const queueLines = cleanedLines
    const responses = []
    let requestLines = []
    const isGemini = model.startsWith('gemini')
    const maybeIsClaude = async (query) => model.startsWith('claude') ? await this.runClaude(model, INSTRUCTIONS, query) : await this.runOpenai(model, INSTRUCTIONS, query)
    const maybeIsGemini = async (query) => isGemini ? await this.runGemini(model, INSTRUCTIONS, query) : await maybeIsClaude(query)
    while (queueLines.length > 0) {
      requestLines.push(queueLines.shift())
      if (queueLines.length === 0 || [...queueLines, queueLines[0]].join('\n').length > this.maxContentLengthPerRequest) {
        const request = requestLines.join('\n')
        responses.push(/^(?:open-)?[^-]+tral/.test(model) ? this.runMistral(model, INSTRUCTIONS, request) : maybeIsGemini(request))
        requestLines = []
      }
    }
    const result = await Promise.all(responses).then(function (responses) {
      const joinedResults = responses.map(value => value).join('\n')
      const originalLineSeperators = lines.filter((element) => element === '\n')
      const resultLines = joinedResults.split(joinedResults.split(/(\n{1,2})/).filter(element => element.includes('\n')).map((element, index) => element !== originalLineSeperators[index]).reduce((accumulator, currentValue) => accumulator + (currentValue ? 1 : -1), 0) > 0 ? '\n\n' : '\n')
      const resultMap = Object.fromEntries(cleanedLines.map((element, index) => [element, resultLines[index]]))
      return lines.map(element => (element !== '\n' ? `${element.match(/^\s*/)[0]}${resultMap[element] ?? element}` : element)).join('')
    }).catch(error => {
      throw error
    })
    super.translateText(text, targetLanguage, this.DefaultLanguage.SOURCE_LANGUAGE)
    return result
  }
}
