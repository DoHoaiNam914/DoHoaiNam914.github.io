'use strict'
/* global $, axios */
import Translator from '../Translator.js'
import * as Utils from '../../Utils.js'
import Anthropic from 'https://esm.run/@anthropic-ai/sdk'
import {
  GoogleGenAI,
  HarmBlockThreshold,
  HarmCategory
} from 'https://esm.run/@google/genai'
import Groq from 'https://esm.run/groq-sdk'
import { Mistral } from 'https://esm.run/@mistralai/mistralai'
import OpenAI from 'https://esm.run/openai'
export default class GenerativeAi extends Translator {
  public readonly LANGUAGE_LIST = [
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
  ]

  public readonly DefaultLanguage = {
    SOURCE_LANGUAGE: 'null',
    TARGET_LANGUAGE: 'Vietnamese'
  }

  private readonly AIR_USER_ID
  private readonly OPENAI_API_KEY
  private readonly openai
  private readonly ai
  private readonly anthropic
  private readonly mistralClient
  private readonly deepseek
  private readonly groq
  private readonly OPENROUTER_API_KEY: string
  private readonly openrouter
  public constructor (apiKey, airUserId) {
    super()
    const { openaiApiKey, geminiApiKey, anthropicApiKey, mistralApiKey, deepseekApiKey, groqApiKey, openrouterApiKey } = apiKey
    this.OPENAI_API_KEY = openaiApiKey
    this.openai = new OpenAI({
      apiKey: this.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    })
    this.ai = new GoogleGenAI({
      apiKey: geminiApiKey
    })
    this.anthropic = new Anthropic({
      apiKey: anthropicApiKey,
      dangerouslyAllowBrowser: true
    })
    this.mistralClient = new Mistral({ apiKey: mistralApiKey })
    this.deepseek = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: deepseekApiKey,
      dangerouslyAllowBrowser: true
    })
    this.groq = new Groq({
      apiKey: groqApiKey,
      dangerouslyAllowBrowser: true
    })
    this.OPENROUTER_API_KEY = openrouterApiKey
    this.openrouter = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: openrouterApiKey,
      dangerouslyAllowBrowser: true
    })
    this.AIR_USER_ID = airUserId
  }

  private async translatenowMain (requestBody): Promise<string> {
    const response = await axios.post(`${Utils.CORS_HEADER_PROXY as string}https://gateway.api.airapps.co/aa_service=server5/aa_apikey=5N3NR9SDGLS7VLUWSEN9J30P//v3/proxy/open-ai/v1/chat/completions`, JSON.stringify(requestBody), {
      headers: {
        'User-Agent': 'iOS-TranslateNow/8.15.0.1002 CFNetwork/3826.500.62.2.1 Darwin/24.4.0',
        'Content-Type': 'application/json',
        'accept-language': 'vi-VN,vi;q=0.9',
        'air-user-id': this.AIR_USER_ID
      },
      signal: this.controller.signal
    }).then(response => requestBody.stream === true ? (response.data as string).split('\n').filter(element => element.startsWith('data: ') && !element.startsWith('data: [DONE]')).map(element => JSON.parse(`{${element.replace('data: ', '"data":')}}`).data).map(element => element.choices[0].delta.content).filter(element => element != null).join('') : response.data.choices[0].message.content).catch(error => {
      throw new Error(error.data)
    })
    return response
  }

  public async openaiMain (options: { model: string, temperature: number, topP: number }, systemInstructions, message): Promise<string> {
    const { model, temperature, topP } = options
    const isDeepseek = model.startsWith('deepseek')
    const requestBody: { [key: string]: any } = isDeepseek
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
            })
    if (isDeepseek) {
      requestBody.model = model
      requestBody.messages = [
        ...systemInstructions.map((element, index) => ({ content: element, role: index > 0 ? 'user' : 'system' })),
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
        ...systemInstructions.map((element, index) => ({ content: [{ type: 'text', text: element }], role: index > 0 ? 'user' : (/^o\d/.test(model) ? (model === 'o1-mini' ? 'user' : 'developer') : 'system') })),
        {
          content: message,
          role: 'user'
        }
      ]
      requestBody.model = model.replace(/-(?:low|medium|high)$/, '')
      if (/^gpt-4o(?:-mini)?-search/.test(requestBody.model)) {
        requestBody.frequency_penalty = undefined
        requestBody.presence_penalty = undefined
      }
      if (Object.hasOwn(requestBody, 'max_completion_tokens')) requestBody.max_completion_tokens = null
      if (/^(?:o1|o3-mini).*-(?:low|medium|high)$/.test(model)) requestBody.reasoning_effort = (model.match(/-([^-]+)$/) as RegExpMatchArray)[1]
      requestBody.stream = true
      if (/^gpt-4o(?:-mini)?-search/.test(requestBody.model)) {
        requestBody.temperature = undefined
        requestBody.top_p = undefined
      } else {
        if (Object.hasOwn(requestBody, 'temperature')) requestBody.temperature = temperature
        if (Object.hasOwn(requestBody, 'top_p')) requestBody.top_p = topP
      }
    }
    if (!isDeepseek && this.OPENAI_API_KEY.length === 0 && new URLSearchParams(window.location.search).has('debug')) {
      return await this.translatenowMain(requestBody)
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

  public async googleGenAiMain (options, systemInstructions, message): Promise<string> {
    const { model, temperature, topP, topK } = options as { model: string, temperature: number, topP: number, topK: number }
    const tools: object[] = []
    // if (doSearch) tools.push({ googleSearch: {} })
    const config: { [key: string]: any } = {
      responseMimeType: 'text/plain'
    }
    if (tools.length > 0) config.tools = tools
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
    ]
    if (!model.startsWith('gemma')) {
      config.systemInstruction = systemInstructions.map(element => ({
        text: element
      }))
    }
    config.temperature = temperature
    config.topP = topP
    config.topK = topK
    if (/* model.startsWith('gemma-3') || */ (model.startsWith('gemini-2.5-flash') && model.endsWith('-normal'))) {
      config.thinkingConfig = {
        thinkingBudget: 0
      }
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
    ]
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
    ]

    if (model.startsWith('gemma-3')) {
      const response = await this.ai.models.generateContent({
        model: model.replace(/-normal$/, ''),
        config,
        contents
      })
      return response.text
    } else {
      const response = await this.ai.models.generateContentStream({
        model: model.replace(/-normal$/, ''),
        config,
        contents
      })
      const collectedChunkTexts: string[] = []
      for await (const chunk of response) {
        // console.log(chunk.text);
        collectedChunkTexts.push(chunk.text)
      }
      return collectedChunkTexts.join('')
    }
  }

  public async anthropicMain (options, systemInstructions, message): Promise<string> {
    const body: { [key: string]: any } = {
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 20000,
      temperature: 1,
      messages: []
    }
    const { model, temperature, topP, topK } = options
    body.model = model.replace(/-thinking$/, '')
    body.messages = [
      ...systemInstructions.slice(1).map(element => ({
        role: 'user',
        content: element
      })),
      {
        role: 'user',
        content: message
      }
    ]
    body.max_tokens = undefined
    body.system = systemInstructions[0]
    if (/-thinking$/.test(model)) {
      body.thinking = {
        type: 'enabled',
        budget_tokens: 16000
      }
    } else {
      body.temperature = temperature
      body.top_k = topK
      body.top_p = topP
    }
    const collectedTexts: string[] = []
    await this.anthropic.messages.stream(body, { signal: this.controller.signal }).on('text', text => {
      collectedTexts.push(text)
    })
    return collectedTexts.join('')
  }

  public async runMistral (options, systemInstructions: string[], message): Promise<string> {
    const { model, temperature, topP } = options
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
    }, { fetchOptions: { signal: this.controller.signal } })
    const collectedMessages: string[] = []
    for await (const chunk of result) {
      collectedMessages.push(chunk.data.choices[0].delta.content)
    }
    return collectedMessages.join('')
  }

  public async groqMain (options, systemInstructions, message): Promise<string> {
    const requestBody: { [key: string]: any } = {
      messages: [],
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stream: true,
      stop: null
    }
    const { model, temperature, topP } = options
    requestBody.max_completion_tokens = null
    requestBody.messages = [
      ...systemInstructions.flatMap((element, index) => ({
        content: element,
        role: index > 0 ? 'user' : 'system'
      })),
      {
        content: message,
        role: 'user'
      }
    ]
    requestBody.model = model
    requestBody.temperature = temperature
    requestBody.top_p = topP
    const chatCompletion = await this.groq.chat.completions.create(requestBody)

    if (requestBody.stream as boolean) {
      const collectedMessages: string[] = []
      for await (const chunk of chatCompletion) {
        collectedMessages.push(chunk.choices[0]?.delta?.content ?? '')
      }
      return collectedMessages.join('')
    } else {
      return chatCompletion.choices[0].message.content
    }
  }

  public async openrouterMain (options, systemInstructions, message: string): Promise<string> {
    const request: { [key: string]: any } = {
      model: 'openai/gpt-4o',
      messages: [
        {
          role: 'user',
          content: 'What is the meaning of life?'
        }
      ]
    }
    const { model, temperature, topP, topK } = options as { model: string, temperature: number, topP: number, topK: number }
    request.model = model.startsWith('qwen/qwen3') ? model.replace('-no-think', '') : model
    request.messages = [
      ...systemInstructions.map((element, index) => ({
        role: index > 0 ? 'user' : (/^openai\/o\d/.test(model) ? (model === 'openai/o1-mini' ? 'user' : 'developer') : 'system'),
        content: element
      })),
      {
        role: 'user',
        content: `${message}${(request.model as string).startsWith('qwen/qwen3') ? ` ${model.includes('no-think') ? '/no_think' : '/think'}` : ''}`
      }
    ]
    request.stream = true
    request.temperature = temperature
    request.top_p = topP
    request.top_k = topK
    // const completion = await this.openrouter.chat.completions.create(request, { signal: this.controller.signal })
    const collectedMessages: string[] = []
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
    })

    const reader = response.body?.getReader()
    if (reader == null) {
      throw new Error('Response body is not readable')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read() as { done: boolean, value: AllowSharedBufferSource }
        if (done) break

        // Append new chunk to buffer
        buffer += decoder.decode(value, { stream: true })

        // Process complete lines from buffer
        while (true) {
          const lineEnd = buffer.indexOf('\n')
          if (lineEnd === -1) break

          const line = buffer.slice(0, lineEnd).trim()
          buffer = buffer.slice(lineEnd + 1)

          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices[0].delta.content
              if (content != null) {
                // console.log(content);
                collectedMessages.push(content)
              }
            } catch (e) {
              // Ignore invalid JSON
            }
          }
        }
      }
    } finally {
      await reader.cancel()
    }
    return collectedMessages.filter(element => element != null).join('')
  }

  public async translateText (text: string, targetLanguage: string, options: { sourceLanguage: string | null, model?: string, temperature?: number, topP?: number, topK?: number, systemPrompt?: string, tone?: string, domain?: string, customPrompt?: string, dictionary?: string[][] } = { sourceLanguage: null }): Promise<string> {
    if (options.model == null) options.model = 'gpt-4o-mini'
    if (options.temperature == null) options.temperature = 0.1
    if (options.topP == null) options.topP = 0.95
    if (options.topK == null) options.topK = 50
    if (options.systemPrompt == null) options.systemPrompt = 'Basic'
    if (options.tone == null) options.tone = 'Serious'
    if (options.domain == null) options.domain = 'None'
    if (options.customPrompt == null) options.customPrompt = ''
    if (options.dictionary == null) options.dictionary = []
    const { sourceLanguage, model, systemPrompt, tone, domain, customPrompt, dictionary } = options
    const isGoogleGenAi = model.startsWith('gemini') || model.startsWith('learnlm') || model.startsWith('gemma-3')
    const isMistral = /^(?:open-)?[^-]+tral/.test(model)
    const SYSTEM_PROMPTS: string[] = []
    switch (systemPrompt) {
      case 'Professional': {
        const originalLang: string = (sourceLanguage ?? 'English').toUpperCase()
        const destLang: string = targetLanguage.toUpperCase()
        const domainValue: string = domain === 'None' ? 'Lifestyle' : domain
        const DOMAIN_INSTRUCTION_MAP = {
          'Economics - Finance': '- focus on presenting and analyzing information related to the domain.\n- use technical terminology that is precise, clear, neutral, and objective.\n- sentence structure is coherent, presenting information in a logical order.',
          'Literature - Arts': '- use local words/dialect words/slang/jargon, morphological function words - express emotions/feelings/attitudes.\n- sentences have a structured arrangement, words are selected and polished to create artistic and aesthetic value.\n- use words that are appropriate to the setting and timeline of the story.\n- use words that are easy to understand, easy to visualize, and bring emotions to the reader.\n- make sure the words and sentences flow together like a story from beginning to end.\n- the relationships between characters must be clearly defined and not confused.\n- character names, minor character names, the way characters address each other, and the way the narrator addresses and refers to other characters must be consistent from beginning to end of the story and cannot be changed arbitrarily.\n- the writing is always carefully crafted, emotional, and brings indescribable emotions to the reader.',
          'Science - Technology': '- use a system of scientific terms, literal, univocal words, complex but standard sentence structures, systems of symbols, formulas, diagrams, models, tables, etc.\n- sentences must have complex structures to fully present the multifaceted content of concepts and theorems. prioritize the use of equal sentences, passive sentences, sentences with missing subjects and sentences with indefinite subjects.',
          'Administrative documents': '- arranged according to the prescribed format.\n- administrative and objective terms, clear syntax. prioritize the use of declarative sentences, not interrogative or expressive.',
          Lifestyle: '- the text is simple, close and easy to understand.\n- use the easiest words possible.'
        }
        const toneValue: string = tone === 'None' ? 'Serious' : tone
        const TONE_INSTRUCTION_MAP: { [key: string]: string } = {
          Serious: '\n    - Language should be neutral, precise and technical, avoiding emotional elements.\n    - Make everything clear and logical.',
          Friendly: '\n    - Use language that is warm, approachable, and conversational.\n    - Ensure the language feels natural and relaxed.',
          Humorous: '\n    - Language must be fun, light and humorous. Use jokes or creative expressions.\n    - Must use entertaining words, wordplay, trendy words, words that young people often use.',
          Formal: '\n    - Utilize language that is formal, respectful, and professional. Employ complex sentence structures and maintain a formal register.\n    - Choose polite, precise, and refined vocabulary.\n    - Incorporate metaphors, idioms, parallel structures, and couplets where appropriate. Ensure that dialogue between characters is formal and well-ordered.\n    - When relevant, use selectively chosen archaic or classical words, especially if the context pertains to historical or ancient settings.',
          Romantic: '\n    - Language must be emotional, poetic and artistic.\n    - Choose flowery, sentimental, and erotic words.\n    - The writing is gentle, focusing on subtle feelings about love and deep character emotions.'
        }
        const dictionaryEntries: string[][] = dictionary.filter(([first]) => text.includes(first))
        SYSTEM_PROMPTS.push(`### ROLE:\nYou are a translation professional with many years of experience, able to translate accurately and naturally between languages. You have a good understanding of the grammar, vocabulary and style of both ${originalLang} and ${destLang}. You also know how to maintain the original meaning and emotion of the text when translating.\n\n### INSTRUCTION:\n- Translate the following paragraphs into ${destLang}, ensuring each sentence is fully understood and free from confusion.\n- Avoid adding any new information, explaining or changing the meaning of the original text.\n- Each translated text segment must have a UUID that exactly matches the UUID of the original text segment.\n- The UUIDs must exactly correspond to the UUIDs in the original text. Do not make up your own UUIDs or confuse the UUIDs of one text with those of another.\n- Only translated into ${destLang} language, not into any other language other than ${destLang}\n- The only priority is translation, do not arbitrarily add your own thoughts and explanations that are not in the original text.\n- Do not insert additional notes or explanations with the words in the translation.\n- Spaces and line breaks must be kept intact, not changed or replaced with /t /n\n- If UUID not have text to translate, just return ""\n- Follow the instruction for translate with domain ${domainValue}:\n${DOMAIN_INSTRUCTION_MAP[['Banking', 'Accounting', 'Management', 'Law', 'Logistics', 'Marketing', 'Securities - Investment', 'Insurance', 'Real Estate'].some(element => domain === element) ? 'Economics - Finance' : (['Music', 'Painting', 'Theater - Cinema', 'Poetry', 'Epic', "Children's Stories", 'Historical Stories', 'Fiction', 'Short Stories'].some(element => domain === element) ? 'Literature - Arts' : (['Physics', 'Chemistry', 'Informatics', 'Electronics', 'Medicine', 'Mechanics', 'Meteorology - Hydrology', 'Agriculture'].some(element => domain === element) ? 'Science - Technology' : (['Legal Documents', 'Internal Documents', 'Email'].some(element => domain === element) ? 'Administrative documents' : 'Lifestyle')))]}\n- Handle special case:\n+ Numbers: Maintain the original numeric values, but adapt formats if necessary (e.g., decimal separators, digit grouping).\n+ Currencies: Convert currency symbols or codes as appropriate for the target language and region.\n+ Dates: Adjust date formats to match the conventions of the target language and culture.\n+ Proper nouns: Generally, do not translate names of people, places, or organizations unless there's a widely accepted equivalent in the target language.\n+ Units of measurement: if they cannot be translated into ${destLang}, convert the unit of measurement to an equivalent system in ${destLang}, but precise calculations are required when converting units and detailed\n### CHAIN OF THOUGHT: Lets thinks step by step to translate but only return the translation:\n1.  Depend on the Input text, find the context and insight of the text by answer all the question below:\n- What is this document about, what is its purpose, who is it for, what is the domain of this document\n- What should be noted when translating this document from ${originalLang} to ${destLang} to ensure the translation is accurate. Especially the technical parameters, measurement units, acronym, technical standards, unit standards are different between ${originalLang} and ${destLang}\n- What is ${originalLang} abbreviations in the context of the document should be understood correctly and translated accurately into ${destLang}. It is necessary to clearly understand the meaning of the abbreviation and not to mistake a ${originalLang} abbreviation for an ${destLang} word.\n- Always make sure that users of the language ${destLang} do not find it difficult to understand when reading\n2. Based on the instructions and rules in INSTRUCTION and what you learned in step 1, proceed to translate the text.\n3. Acting as a reader, give comments on the translation based on the following criteria:\n- Do you understand what the translation is talking about\n- Does the translation follow the rules given in the INSTRUCTION\n- Is the translation really good, perfect? \u200b\u200bIf not good, what is not good, what needs improvement?\n4. Based on the comments in step 3, revise the translation (if necessary).\n### STYLE INSTRUCTION:\n\n        The style of the output must be ${toneValue}:\n        -${TONE_INSTRUCTION_MAP[toneValue]}\n\n\n### ADVANCED MISSION (HIGHEST PRIORITY):\n${dictionaryEntries.length > 0 ? dictionaryEntries.map(([first, second]) => `Must translate: ${first} into ${second}`).join('\n') : ''}\n- Follow the instruction below when translate:\n${customPrompt.replaceAll(/^\s+|\s+$/g, '')}\n### OUTPUT FORMAT MUST BE IN JSON:\n{\n"insight": "[In-depth understanding of the text from the analysis step]",\n"rule": "[Rules followed during translation]",\n"translated_string": "uuid: ${destLang} translation of the sentence when using rule\\n  uuid: ${destLang.replace(/E$/, 'e')} translation of the sentence when using rule\\n  .."\n}`)
        break
      }
      case 'Intermediate':
        SYSTEM_PROMPTS.push(`I want you to act as a ${targetLanguage.replace(/^(Chinese \()([st])/, (_match, p1: string, p2: string) => `${p1}${p2.toUpperCase()}`)} translator.\nYou are trained on data up to October 2023.`)
        SYSTEM_PROMPTS.push(`I will speak to you in ${sourceLanguage != null && sourceLanguage !== this.DefaultLanguage.SOURCE_LANGUAGE ? `${sourceLanguage.replace(/^(Chinese \()([st])/, (_match, p1: string, p2: string) => `${p1}${p2.toUpperCase()}`)} and you will ` : 'any language and you will detect the language, '}translate it and answer in the corrected version of my text, exclusively in ${targetLanguage.replace(/^(Chinese \()([st])/, (_match, p1: string, p2: string) => `${p1}${p2.toUpperCase()}`)}, while keeping the format.\nYour translations must convey all the content in the original text and cannot involve explanations or other unnecessary information.\nPlease ensure that the translated text is natural for native speakers with correct grammar and proper word choices.\nYour output must only contain the translated text and cannot include explanations or other information.`)
        break
      case 'Basic':
      default:
        SYSTEM_PROMPTS.push(`You will be provided with a user input in ${(sourceLanguage ?? 'English').replace(/^(Chinese \()([st])/, (_match, p1: string, p2: string) => `${p1}${p2.toUpperCase()}`)}.\nTranslate the text into ${targetLanguage.replace(/^(Chinese \()([st])/, (_match, p1: string, p2: string) => `${p1}${p2.toUpperCase()}`)}.\nOnly output the translated text, without any additional text.`)
    }
    let queryText = text.split('\n')
    let requestText = queryText.join('\n')
    if (systemPrompt === 'Professional') {
      queryText = text.split('\n').map(element => {
        const partedUuid = window.crypto.randomUUID().split('-')
        return `${partedUuid[0]}#${partedUuid[2].substring(1)}: ${element}`
      })
      requestText = `### TEXT SENTENCE WITH UUID:\n${queryText.filter(element => element.split(/(^[a-z0-9#]{12}): /)[2].replace(/^\s+/, '').length > 0).join('\n')}\n### TRANSLATED TEXT WITH UUID:`
    }
    let result = await (['gemma2-9b-it', 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'llama3-70b-8192', 'llama3-8b-8192', 'deepseek-r1-distill-llama-70b', 'meta-llama/llama-4-maverick-17b-128e-instruct', 'meta-llama/llama-4-scout-17b-16e-instruct', 'mistral-saba-24b', 'qwen-qwq-32b'].some(element => element === model) ? this.groqMain(options, SYSTEM_PROMPTS, requestText) : (model.includes('/') ? this.openrouterMain(options, SYSTEM_PROMPTS, requestText) : (isMistral ? this.runMistral(options, SYSTEM_PROMPTS, requestText) : (model.startsWith('claude') ? this.anthropicMain(options, SYSTEM_PROMPTS, requestText) : (isGoogleGenAi ? this.googleGenAiMain(options, SYSTEM_PROMPTS, requestText) : this.openaiMain(options as { model: string, temperature: number, topP: number }, SYSTEM_PROMPTS, requestText)))))).catch(reason => {
      throw reason
    })
    if (model.toLowerCase().includes('deepseek-r1') || model.toLowerCase().includes('qwq-32b')) result = result.replace(/^<think>[\s\S]+<\/think>\n{2}/, '')
    if (systemPrompt === 'Professional') {
      if (new URLSearchParams(window.location.search).has('debug')) {
        const response = result
        $(document).one('click', async () => {
          if (window.confirm('Sao chép phản hồi')) await navigator.clipboard.writeText(response)
        })
      }
      result = result.replace('({)\\n', '$1\n').replace(/(\\")?"?(?:(?:\n|\\n)?\})?(?=\n?`{0,3}$)/, '$1"\n}')
      const jsonMatch = result.match(/(\{[\s\S]+\})/)
      const potentialJsonString = (jsonMatch != null ? jsonMatch[0] : result.replace(/^`{3}json\n/, '')).replaceAll(/\n(?! *"(?:insight|rule|translated_string|[a-z0-9]{8}#[a-z0-9]{2,3})"|\}$)/g, '\\n').replace(/("translated_string": ")([[\s--\n]\S]+)(?=")/v, (_match, p1: string, p2: string) => `${p1}${p2.replaceAll(/([^\\])"/g, '$1"')}`).replace(/insight": "[\s\S]+(?=translated_string": ")/, '')
      if (Utils.isValidJson(potentialJsonString) as boolean) {
        const parsedResult = JSON.parse(potentialJsonString)
        let translatedStringMap = {}
        if (typeof parsedResult.translated_string !== 'string') {
          translatedStringMap = parsedResult.translated_string
        } else if (Utils.isValidJson(parsedResult.translated_string) as boolean) {
          translatedStringMap = JSON.parse(parsedResult.translated_string)
        } else {
          const translatedStringParts = parsedResult.translated_string.split(/\s*([a-z0-9]{8}#[a-z0-9]{2,3}): (?:[a-z0-9]{8}#[a-z0-9]{2,3}: )?/).slice(1)
          for (let i = 0; i < translatedStringParts.length; i += 2) {
            translatedStringMap[translatedStringParts[i]] = translatedStringParts[i + 1].replace(/\n+$/, '')
          }
        }
        if (Object.keys(translatedStringMap).length > 0) {
          result = queryText.map(element => {
            const uuid = (element.match(/^[a-z0-9]{8}#[a-z0-9]{2,3}/) ?? [''])[0]
            return translatedStringMap[uuid] ?? ''
          }).join('\n')
        }
      }
    }
    super.translateText(text, targetLanguage, sourceLanguage)
    return result
  }
}
