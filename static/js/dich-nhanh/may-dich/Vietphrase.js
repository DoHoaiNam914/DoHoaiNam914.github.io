'use strict';

/* global Translator, Utils */

class Vietphrase extends Translator {
  static SOURCE_LANGUAGE_LIST = { cj: 'Chinese-Japanese' };

  static TARGET_LANGUAGE_LIST = {
    vi: 'Vietphrase',
    SinoVietnamese: 'Hán Việt',
    OnYomi: 'On\'yomi',
    KunYomi: 'Kun\'yomi',
    pinyin: 'Pinyin',
    pīnyīn: 'Pīnyīn',
    traditional: 'Traditional',
    simplified: 'Simplified',
  };

  DefaultLanguage = {
    SOURCE_LANGUAGE: 'cj',
    TARGET_LANGUAGE: 'vi',
  };

  constructor(addDeLeZhaoEnabled, multiplicationAlgorithm) {
    super();
    this.addDeLeZhaoEnabled = addDeLeZhaoEnabled;
    this.multiplicationAlgorithm = multiplicationAlgorithm;
  }

  static removeAccents(pinyin) {
    const accentsMap = {
      ā: 'a',
      á: 'a',
      ǎ: 'a',
      à: 'a',
      ō: 'o',
      ó: 'o',
      ǒ: 'o',
      ò: 'o',
      ē: 'e',
      é: 'e',
      ě: 'e',
      è: 'e',
      ī: 'i',
      í: 'i',
      ǐ: 'i',
      ì: 'i',
      ū: 'u',
      ú: 'u',
      ǔ: 'u',
      ù: 'u',
      ǖ: 'v',
      ǘ: 'v',
      ǚ: 'v',
      ǜ: 'v',
      ü: 'v',
    };

    return pinyin.replaceAll(/[āáǎàōóǒòēéěèīíǐìūúǔùǖǘǚǜü]/g, (match) => accentsMap[match]);
  }

  static getFormattedText(text) {
    const PUNCTUATIONS = {
      '、': ',',
      '。': '.',
      '《': '“',
      '》': '”',
      '「': '“',
      '」': '”',
      '『': '‘',
      '』': '’',
      '【': '[',
      '】': ']',
      '！': '!',
      '（': '(',
      '）': ')',
      '，': ',',
      '：': ':',
      '；': ';',
      '？': '?',
      '～': '~',
    };

    return text.replaceAll(/(?:[…、。】！），：；？～]|\.\.\.)(?![\p{Pc}\p{Pd}\p{Pe}\p{Pf}\p{Po}\s]|$)/gu, (match) => `${PUNCTUATIONS[match] ?? match} `).replaceAll(/([^\s\p{Ps}\p{Pi}])([【（])/gu, (__, p1, p2) => `${p1} ${PUNCTUATIONS[p2] ?? p2}`).replaceAll(/[、。【】！（），：；？～]/g, (match) => PUNCTUATIONS[match] ?? match).replaceAll(/ ?· ?/g, ' ');
  }

  static quickTranslate(text, translations) {
    if (translations == null || translations.length === 0) return text;
    const translationsMap = Object.fromEntries(translations.filter(function filter([first]) {
      return !this[first] && (this[first] = 1);
    }, {}));

    let startIndex = 0;
    const characters = text.split(/(?:)/u);
    const charactersLength = characters.length;
    let minLength = 0;
    let maxLength = 131072;

    translations.forEach(([first]) => {
      const { length } = first.split(/(?:)/u);

      if (length > 0) {
        if (length > minLength) minLength = length;
        if (length < maxLength) maxLength = length;
      }
    });

    let endIndex = minLength;

    let translatedText = '';

    let lastEndIndex = 0;
    let hasTranslation = false;

    let previousPhrase = '';

    while (startIndex < charactersLength) {
      if (startIndex + endIndex > charactersLength) endIndex = charactersLength - startIndex;
      const tempChars = [];

      for (let i = 0; i < endIndex; i += 1) {
        tempChars.push(...characters.at(startIndex + i).split(/(?:)/u));
      }

      let currentEndIndex = endIndex;

      const translatedChars = translatedText.split(/(?:)/u);

      while (true) {
        if (currentEndIndex < maxLength) {
          lastEndIndex = startIndex;
          hasTranslation = false;
          break;
        }

        const substring = tempChars.slice(0, currentEndIndex).join('');

        if (Object.hasOwn(translationsMap, substring)) {
          const phrase = translationsMap[substring];
          translatedText += (translatedChars.length > 0 && phrase !== '' && (/[\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(translatedChars[translatedChars.length - 1]) || previousPhrase.length === 0) ? ' ' : '') + phrase;
          previousPhrase = phrase;
          lastEndIndex = startIndex + currentEndIndex;
          hasTranslation = true;
          break;
        }

        currentEndIndex -= 1;
      }

      if (hasTranslation) {
        startIndex = lastEndIndex;
      } else {
        const char = characters.at(lastEndIndex);
        translatedText += (translatedChars.length > 0 && /^[\p{Lu}\p{Ll}\p{Nd}([{‘“]/u.test(char) && /[\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(previousPhrase) ? ' ' : '') + char;
        previousPhrase = /[^\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(char) ? char : '';
        startIndex = lastEndIndex + 1;
      }
    }

    return translatedText;
  }

  static translateAfterTest(text, names, vietPhrases, hanVietDict, testTextMapping) {
    if (names == null || vietPhrases == null || hanVietDict == null || hanVietDict.length === 0) return text;
    let startIndex = 0;
    const characters = text.split(/(?:)/u);
    const charactersLength = characters.length;
    let endIndex = 10;
    let primaryIndex = 0;

    let translatedText = '';

    const hanVietMap = Object.fromEntries(hanVietDict);

    let hasPhrase = false;

    let currentIndex = 0;

    const nameMap = Object.fromEntries(names);

    let hasHanViet = false;

    let previousPhrase = '';

    const vietPhraseMap = Object.fromEntries(vietPhrases);

    while (startIndex < charactersLength) {
      if (startIndex + endIndex > charactersLength) endIndex = charactersLength - startIndex;
      const translatedChars = translatedText.split(/(?:)/u);

      if (!Object.hasOwn(hanVietMap, characters.slice(startIndex).filter((element) => !/^[\d\p{Ps}\p{Pi}]/u.test(element))[0])) {
        const char = characters.at(startIndex);
        translatedText += (translatedChars.length > 0 && /^[\p{Lu}\p{Ll}\p{Nd}([{‘“]/u.test(char) && /[\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(previousPhrase) ? ' ' : '') + char;
        previousPhrase = /[^\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(char) ? char : '';
        startIndex += 1;
      } else {
        const tempChars = [];

        for (let i = 0; i < endIndex; i += 1) {
          tempChars.push(...characters.at(startIndex + i).split(/(?:)/u));
        }

        let currentEndIndex = endIndex;

        let currentStartIndex = primaryIndex;

        while (true) {
          if (currentEndIndex < 1) {
            hasPhrase = false;
            break;
          }

          const substring = tempChars.slice(currentIndex, currentEndIndex).join('');

          if (Object.hasOwn(nameMap, substring)) {
            const name = nameMap[substring];
            translatedText += (translatedChars.length > 0 && (/[\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(translatedChars[translatedChars.length - 1]) || previousPhrase.length === 0) ? ' ' : '') + name.split(/[/|]/)[0];
            if (name !== '') previousPhrase = name;

            startIndex += currentEndIndex;
            hasPhrase = true;
            break;
          } else if (Object.hasOwn(vietPhraseMap, substring)) {
            if (currentStartIndex >= testTextMapping.length) currentStartIndex = 0;
            let tempStartIndex = currentStartIndex;

            while (true) {
              if (currentStartIndex >= testTextMapping.length) {
                currentStartIndex = tempStartIndex;
                hasHanViet = false;
                break;
              }

              const testText = testTextMapping[currentStartIndex];
              if (startIndex >= testText.indexChina) tempStartIndex = currentStartIndex;

              if (testText.indexChina > startIndex + (endIndex * 2)) {
                currentStartIndex = tempStartIndex;
                hasHanViet = false;
                break;
              }

              if (testText.indexChina >= startIndex && testText.indexChina < startIndex + currentEndIndex) {
                currentStartIndex = tempStartIndex;
                hasHanViet = true;
                break;
              }

              currentStartIndex += 1;
            }

            if (!hasHanViet) {
              const vietPhrase = vietPhraseMap[substring];
              translatedText += (translatedChars.length > 0 && vietPhrase !== '' && (/[\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(translatedChars[translatedChars.length - 1]) || previousPhrase.length === 0) ? ' ' : '') + vietPhrase;
              if (vietPhrase !== '') previousPhrase = vietPhrase;
              startIndex += currentEndIndex;
              hasPhrase = true;
              break;
            } else if (Object.hasOwn(hanVietMap, substring)) {
              const hanViet = hanVietMap[substring];
              translatedText += (translatedChars.length > 0 && hanViet !== '' && (/[\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(translatedChars[translatedChars.length - 1]) || previousPhrase.length === 0) ? ' ' : '') + hanViet;
              if (hanViet !== '') previousPhrase = hanViet;
              startIndex += currentEndIndex;
              hasPhrase = true;
              break;
            } else {
              currentEndIndex -= 1;
              currentIndex = 0;
            }
          } else if (Object.hasOwn(hanVietMap, substring)) {
            const hanViet = hanVietMap[substring];
            translatedText += (translatedChars.length > 0 && hanViet !== '' && (/[\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(translatedChars[translatedChars.length - 1]) || previousPhrase.length === 0) ? ' ' : '') + hanViet;
            if (hanViet !== '') previousPhrase = hanViet;
            startIndex += currentEndIndex;
            hasPhrase = true;
            break;
          } else {
            currentEndIndex -= 1;
            currentIndex = 0;
          }
        }

        if (hasPhrase) {
          primaryIndex = currentStartIndex;
        } else {
          primaryIndex = currentStartIndex;
          const char = characters.at(startIndex);
          translatedText += (translatedChars.length > 0 && /^[\p{Lu}\p{Ll}\p{Nd}([{‘“]/u.test(char) && /[\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(previousPhrase) ? ' ' : '') + char;
          previousPhrase = /[^\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(char) ? char : '';
          startIndex += 1;
        }
      }

      currentIndex = 0;
    }

    translatedText = Vietphrase.getFormattedText(translatedText.replaceAll(/> /g, '>')).replace(' .', '.').replace(' ,', ',');
    return translatedText;
  }

  translateWithTest(text, names, hanVietDict) {
    if (names == null || hanVietDict.length === 0) return text;
    let startIndex = 0;
    const characters = text.split(/(?:)/u);
    const charactersLength = characters.length;
    let endIndex = 10;

    let translatedText = '';

    const hanVietMap = Object.fromEntries(hanVietDict);

    let hasPhrase = false;

    const nameMap = Object.fromEntries(names);

    let previousPhrase = '';

    const testTextMapping = [];

    while (startIndex < charactersLength) {
      if (startIndex + endIndex > charactersLength) endIndex = charactersLength - startIndex;
      const translatedChars = translatedText.split(/(?:)/u);

      if (!Object.hasOwn(hanVietMap, characters.slice(startIndex).filter((element) => !/^[\d\p{Ps}\p{Pi}]/u.test(element))[0])) {
        const char = characters.at(startIndex);
        translatedText += (translatedChars.length > 0 && /^[\p{Lu}\p{Ll}\p{Nd}([{‘“]/u.test(char) && /[\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(previousPhrase) ? ' ' : '') + char;
        previousPhrase = /[^\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(char) ? char : '';
        startIndex += 1;
      } else {
        const tempChars = [];

        for (let i = 0; i < endIndex; i += 1) {
          tempChars.push(...characters.at(startIndex + i).split(/(?:)/u));
        }

        let currentEndIndex = endIndex;

        while (true) {
          hasPhrase = true;

          if (currentEndIndex < 1) {
            hasPhrase = false;
            break;
          }

          const substring = tempChars.slice(0, currentEndIndex).join('');

          if (Object.hasOwn(nameMap, substring)) {
            const name = nameMap[substring];
            translatedText += (translatedChars.length > 0 && (/[\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”\p{sc=Hani}\p{sc=Hira}\p{sc=Kana}]$/u.test(translatedChars[translatedChars.length - 1]) || previousPhrase.length === 0) ? ' ' : '') + name.split(/[/|]/)[0];
            if (name !== '') previousPhrase = name;
            testTextMapping.push({
              indexChina: startIndex,
              lenChina: currentEndIndex,
              contentViet: name,
              contentChina: substring,
            });
            startIndex += currentEndIndex;
            break;
          }

          currentEndIndex -= 1;
        }

        if (!hasPhrase) {
          const char = characters.at(startIndex);
          translatedText += (translatedChars.length > 0 && /^[\p{Lu}\p{Ll}\p{Nd}([{‘“]/u.test(char) && /[\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(previousPhrase) ? ' ' : '') + char;
          previousPhrase = /[^\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(char) ? char : '';
          startIndex += 1;
        }
      }
    }

    if (testTextMapping.length > 0) testTextMapping.sort((a, b) => a.indexChina - b.indexChina);
    return Vietphrase.translateAfterTest(text, names, this.vietPhrase, hanVietDict, testTextMapping);
  }

  static getCapitalizeText(text) {
    return text.split('\n').map((element) => element.replaceAll(/(^[\p{P}\p{Z}]*|[!.?] )(\p{Ll})/gu, (__, p1, p2) => p1 + p2.toUpperCase())).join('\n');
  }

  async translateText(text, targetLanguage, glossary, options) {
    const phonetics = Object.entries(glossary.phonetics).map(([first, second]) => [first, second.split('/')[0]]).map(([first, second]) => [first, second.split('|')[0]]).map(([first, second]) => [first, second.split(/; */)[0]]);
    const SinoVietnameses = glossary.SinoVietnameses.map(([first,second]) => [first, second.split(',').map((element) => element.trimStart()).filter((element) => element.length > 0)[0]]);
    let hanViet = phonetics.filter(([__, second]) => !/\p{Script_Extensions=Hani}/u.test(second)).concat(targetLanguage === 'vi' ? glossary.hanViet.filter(([first]) => !Object.hasOwn(glossary.phonetics, first)) : [], SinoVietnameses);
    hanViet = phonetics.filter(([__, second]) => /\p{Script_Extensions=Hani}/u.test(second)).map(([first, second]) => [first, Vietphrase.quickTranslate(second, hanViet)]).concat(hanViet).map(([first, second]) => [first, second.toLowerCase()]).filter(function filter([first]) {
      return !this[first] && (this[first] = 1);
    }, {});

    this.result = text;

    switch (targetLanguage) {
      case 'simplified': {
        this.result = Vietphrase.quickTranslate(text, glossary.simplified.map(([first, second]) => [first, second.split(' ').filter((element) => element !== first)[0] ?? null]).filter(([__, second]) => second != null));
        break;
      }
      case 'traditional': {
        this.result = Vietphrase.quickTranslate(text, glossary.traditional.map(([first, second]) => [first, second.split(' ').filter((element) => element !== first)[0] ?? null]).filter(([__, second]) => second != null));
        break;
      }
      case 'pīnyīn':
      case 'pinyin': {
        this.result = Vietphrase.getFormattedText(Vietphrase.quickTranslate(text, glossary.pinyins.map(([first, second]) => [first, second.split(' ')[0]]).map(([first, second]) => [first, targetLanguage === 'pinyin' ? Vietphrase.removeAccents(second) : second]).concat(glossary.romajis).filter(function filter([first]) {
          return !this[first] && (this[first] = 1);
        }, {})));
        break;
      }
      case 'KunYomi': {
        this.result = Vietphrase.getFormattedText(Vietphrase.quickTranslate(text, glossary.KunYomis.map(([first, second]) => [first, second.split(' ')[0].toLowerCase()]).concat(glossary.romajis).filter(function filter([first]) {
          return !this[first] && (this[first] = 1);
        }, {})));
        break;
      }
      case 'OnYomi': {
        this.result = Vietphrase.getFormattedText(Vietphrase.quickTranslate(text, glossary.OnYomis.map(([first, second]) => [first, second.split(' ')[0].toLowerCase()]).concat(glossary.romajis).filter(function filter([first]) {
          return !this[first] && (this[first] = 1);
        }, {})));
        break;
      }
      case 'vi': {
        try {
          let isOnloadNewVietPhrase = false;
          let isOnloadNewName = false;

          if (this.vietPhrase == null) {
            this.vietPhrase = (!this.addDeLeZhaoEnabled ? [['的', ''], ['了', ''], ['着', '']] : []).concat(Object.entries(glossary.terminologies), Object.entries(glossary.vietPhrase).map(([first, second]) => [first, second.split(/[/|]/)[0]])).filter(function filter([first]) {
              return !this[first] && (this[first] = 1);
            }, {});
            isOnloadNewVietPhrase = true;
          }

          if (this.name == null) {
            this.name = Object.entries(glossary.namePhu).concat(Object.entries(glossary.name)).filter(function filter([first]) {
              return !this[first] && (this[first] = 1);
            }, {});
            isOnloadNewName = true;
          }

          if (isOnloadNewVietPhrase || isOnloadNewName) {
            const pronounList = Object.entries(glossary.pronoun);

            let luatNhanPronoun = [];
            let luatNhanName = [];

            if (this.multiplicationAlgorithm > 0) {
              Object.entries(glossary.luatNhan).forEach(([a, b]) => {
                if (isOnloadNewVietPhrase) luatNhanPronoun = [...luatNhanPronoun, ...pronounList.map(([c, d]) => [a.replace('{0}', c), b.replace('{0}', d.split(/[/|]/)[0])])];

                if (this.multiplicationAlgorithm === 2 && isOnloadNewName && this.name.length > 0) {
                  luatNhanName = [...luatNhanName, ...this.name.map(([c, d]) => [a.replace('{0}', c), b.replace('{0}', d.split(/[/|]/)[0])])];
                }
              });
            }

            if (isOnloadNewVietPhrase && luatNhanPronoun.length > 0) {
              this.vietPhrase = luatNhanPronoun.concat(this.vietPhrase).filter(function filter([first]) {
                return !this[first] && (this[first] = 1);
              }, {});
            }

            if (isOnloadNewName && luatNhanName.length > 0) {
              this.name = luatNhanName.concat(this.name).filter(function filter([first]) {
                return !this[first] && (this[first] = 1);
              }, {});
            }
          }

          this.result = this.translateWithTest(text, options.nameEnabled ? this.name : [], hanViet.concat(glossary.romajis).filter(function filter([first]) {
            return !this[first] && (this[first] = 1);
          }, {}));
          this.result = options.autocapitalize ? Vietphrase.getCapitalizeText(this.result) : this.result;
        } catch (error) {
          this.vietPhrase = null;
          this.name = null;
          this.result = error;
          throw error;
        }

        break;
      }
      default: {
        this.result = Vietphrase.getFormattedText(Vietphrase.quickTranslate(text, hanViet.concat(glossary.romajis).filter(([first], ___, array) => !array[first] && (array[first] = 1), {})));
        break;
      }
    }

    super.translateText(text, targetLanguage, this.DefaultLanguage.SOURCE_LANGUAGE);
    return this.result;
  }
}
