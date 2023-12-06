'use strict';

const $sourceLanguageSelect = $('#source-language-select');
const $targetLanguageSelect = $('#target-language-select');
const $translateButton = $('#translate-button');

const $copyButtons = $('.copy-button');
const $pasteButtons = $('.paste-button');
const $retranslateButton = $('#retranslate-button');

const $options = $('.option');

const $inputTextarea = $('#input-textarea');
const $resultTextarea = $('#result-textarea');

const $fontOptions = $('.font-option');
const $fontSizeRange = $('#font-size-range');
const $lineSpacingRange = $('#line-spacing-range');
const $alignmentSettingsSwitch = $('#alignment-settings-switch');
const $translatorOptions = $('.translator-option');
const $showOriginalTextSwitch = $('#show-original-text-switch');
const $vietPhraseInput = $('#viet-phrase-input');
const $loadDefaultVietPhraseFileSwitch = $('#load-default-viet-phrase-file-switch');
const $luatNhanInput = $('#luat-nhan-input');
const $pronounInput = $('#pronoun-input');
const $prioritizeNameOverVietPhraseCheck = $('#prioritize-name-over-viet-phrase-check');
const $translationAlgorithmRadio = $('.option[name="translation-algorithm-radio"]');
const $multiplicationAlgorithmRadio = $('.option[name="multiplication-algorithm-radio"]');

const $resetButton = $('#reset-button');

const $glossarySwitch = $('#glossary-switch');
const $glossaryInput = $('#glossary-input');
const $glossaryType = $('#glossary-type');
const $languagePairsSelect = $('#language-pairs-select');
const $sourceEntryInput = $('#source-entry-input');
const $dropdownHasCollapse = $('.dropdown-has-collapse');
const $targetEntryInput = $('#target-entry-input');
const $translateEntryButtons = $('.translate-entry-button');
const $tagsetSelect = $('#tagset-select');
const $addButton = $('#add-button');
const $removeButton = $('#remove-button');
const $glossaryEntrySelect = $('#glossary-entry-select');
const $glossaryName = $('#glossary-name');

const defaultOptions = JSON.parse('{"source_language":"auto","target_language":"vi","font":"Mặc định","font_size":100,"line_spacing":40,"alignment_settings":true,"translator":"googleTranslate","show_original_text":false,"load_default_viet_phrase_file":false,"translation_algorithm":"0","prioritize_name_over_viet_phrase":false,"multiplication_algorithm":"2","glossary":true,"language_pairs":"zh-vi"}');

const SUPPORTED_LANGUAGES = ['', 'EN', 'JA', 'ZH', 'EN-US', 'auto', 'en', 'ja', 'zh-CN', 'zh-TW', 'vi', 'zh-Hans', 'zh-Hant'];

let quickTranslateStorage = JSON.parse(localStorage.getItem('dich_nhanh')) ?? {};
let glossary = JSON.parse(localStorage.getItem('glossary')) ?? [];
let glossaryObject = {};

let newAccentObject = {};
let oldAccentObject = {};

const vietPhraseData = {
  pinyins: {},
  hanViet: {},
  vietPhrase: {},
  luatNhan: {},
  pronoun: {},
};

let glossaryData = '';

let isOnLoad = true;

let translateAbortController = null;
let prevScrollTop = 0;

let lastSession = {};

const OptionTypes = {
  SELECT: 'select',
  CHECK: 'check',
  RADIO: 'radio',
  SWITCH: 'switch',
  RANGE: 'range',
  DROPDOWN: 'dropdown',
};

const GlossaryType = {
  TSV: 'text/tab-separated-values',
  CSV: 'text/csv',
  VIETPHRASE: 'text/plain',
};

const Tagset = {
  // Nhãn POS
  N: 0,
  NNP: 1,
  NC: 2,
  NU: 3,
  NUX: 4,
  NUM: 5,
  NUMX: 6,
  DET: 7,
  V: 8,
  AUX: 9,
  ADJ: 10,
  PRO: 11,
  ADV: 12,
  PRE: 13,
  CC: 14,
  SC: 15,
  PRT: 16,
  I: 17,
  MWE: 18,
  D: 19,
  X: 20,
  Z: 21,
  y: 22,
  b: 23,
  FW: 24,
  PUNCT: 25,
  SYM: 26,
  // Nhãn Constituency
  NP: 27,
  VP: 28,
  AP: 29,
  RP: 30,
  PP: 31,
  QP: 32,
  MDP: 33,
  UCP: 34,
  LST: 35,
  WHNP: 36,
  WHAP: 37,
  WHRP: 38,
  WHPP: 39,
  S: 40,
  SQ: 41,
  SBAR: 42,
};

function getOptionId(id) {
  return id.match(/(.+)-(?:select|check|radio|switch|range|dropdown)$/)[1].replace(/-/g, '_');
}

function getOptionType(id) {
  return id.match(/.+-(select|check|radio|switch|range|dropdown)$/)[1];
}

function getCurrentOptions() {
  const data = {};

  try {
    $options.each((index, element) => {
      const option = $(element);
      const optionId = getOptionId(option.attr('name') ?? option.attr('id'));
      const optionType = getOptionType(option.attr('name') ?? option.attr('id'));

      switch (optionType) {
        case OptionTypes.RADIO: {
          if (option.prop('checked') === true) data[optionId] = option.val();
          break;
        }
        case OptionTypes.CHECK:
        case OptionTypes.SWITCH: {
          data[optionId] = option.prop('checked');
          break;
        }
        case OptionTypes.RANGE: {
          data[optionId] = parseInt(option.val(), 10);
          break;
        }
        case OptionTypes.DROPDOWN: {
          const selectedValue = option.find('.dropdown-menu > li > .active');

          switch (optionId) {
            case 'font': {
              data.font = selectedValue.text();
              break;
            }
            case 'translator': {
              data.translator = selectedValue.data('id');
              break;
            }
            // no default
          }

          break;
        }
        default: {
          data[optionId] = option.val();
          break;
        }
      }
    });
  } catch (error) {
    console.error(error);
  }

  return data;
}

function loadAllQuickTranslatorOptions() {
  if (Object.keys(quickTranslateStorage).length === 0) quickTranslateStorage = getCurrentOptions();

  $options.each((index) => {
    const option = $options.eq(index);
    const optionId = getOptionId(option.attr('name') ?? option.attr('id'));
    const optionType = getOptionType(option.attr('name') ?? option.attr('id'));

    switch (optionType) {
      case OptionTypes.RADIO: {
        if (option.val() === quickTranslateStorage[optionId]) {
          $(`.option[name="${option.attr('name')}"]`).removeAttr('checked');
          option.attr('checked', true);
        }

        break;
      }
      case OptionTypes.CHECK:
      case OptionTypes.SWITCH: {
        option.attr('checked', quickTranslateStorage[optionId]).change();
        break;
      }
      case OptionTypes.RANGE: {
        option.val(quickTranslateStorage[optionId]).change();
        break;
      }
      case OptionTypes.DROPDOWN: {
        const values = option.find('.dropdown-menu > li > .dropdown-item');

        switch (optionId) {
          case 'font': {
            values.filter(`:contains(${quickTranslateStorage[optionId]})`).click();
            break;
          }
          case 'translator': {
            values.filter(`[data-id="${quickTranslateStorage[optionId]}"]`).click();
            break;
          }
          // no default
        }

        break;
      }
      default: {
        option.val(quickTranslateStorage[optionId]);
        break;
      }
    }
  });
}

function isStaticWordOrPhrase(tagset) {
  return tagset === 'NNP' || tagset === 'MWE' || tagset === 'X' || tagset === 'y' || tagset === 'FW' || tagset === 'MDP' || tagset === 'WHNP' || tagset === 'WHAP' || tagset === 'WHRP' || tagset === 'WHPP' || tagset === 'S' || tagset === 'SQ' || tagset === 'SBAR';
}

function isDynamicWordOrPhrase(tagset) {
  return tagset === 'ADJ' || tagset === 'ADV' || tagset === 'N' || tagset === 'PRT' || tagset === 'SC' || tagset === 'V' || tagset === 'NP' || tagset === 'VP' || tagset === 'AP' || tagset === 'RP' || tagset === 'PP' || tagset === 'QP' || tagset === 'UCP';
}

function getIgnoreTranslationMarkup(text, translation, translator) {
  switch (translator) {
    case Translators.DEEPL_TRANSLATE:
    case Translators.GOOGLE_TRANSLATE: {
      return `<span translate="no">${Utils.convertTextToHtml(translation.replace(/ /g, '_'))}</span>`;
    }
    case Translators.MICROSOFT_TRANSLATOR: {
      return `<mstrans:dictionary translation="${/\p{sc=Hani}/u.test(text) && /\p{sc=Latn}/u.test(translation) ? ` ${translation.replace(/ /g, '_')} ` : translation.replace(/ /g, '_')}">${text}</mstrans:dictionary>`;
    }
    default: {
      return translator !== Translators.VIETPHRASE ? translation.replace(/ /g, '_') : translation;
    }
  }
}

function applyGlossaryToText(text, translator = Translators.VIETPHRASE) {
  const glossaryEntries = glossary.filter(([first]) => text.includes(first));
  let newText = text;

  if (glossaryEntries.length > 0) {
    const lines = text.split(/\n/);
    const results = [];

    const glossaryLengths = [...glossaryEntries.map(([first]) => first.length), 1].sort((a, b) => b - a).filter((element, index, array) => element > 0 && index === array.indexOf(element));

    lines.forEach((a) => {
      if (a.length === 0) {
        results.push(a);
      } else {
        let tempLine = '';
        let prevPhrase = '';
        let i = 0;

        a.split('').forEach((b, c) => {
          if (c === i) {
            glossaryLengths.some((d) => {
              const phrase = translator === Translators.DEEPL_TRANSLATE || translator === Translators.GOOGLE_TRANSLATE ? Utils.convertHtmlToText(a.substring(i, i + d)) : a.substring(i, i + d);

              if (Object.prototype.hasOwnProperty.call(glossaryObject, phrase)) {
                if (glossaryObject[phrase].length > 0) {
                  const maybeNotStaticPos = glossary.filter(([first, __, third]) => first === phrase && isDynamicWordOrPhrase(third)).length > 0 ? glossaryObject[phrase].replace(/ /g, '_') : glossaryObject[phrase];
                  tempLine += (i > 0 && /[\p{Lu}\p{Ll}\p{Nd}]/u.test(prevPhrase || tempLine[tempLine.length - 1] || '') ? ' ' : '') + (translator === Translators.MICROSOFT_TRANSLATOR || translator === Translators.VIETPHRASE || glossary.filter(([first, __, third]) => first === phrase && (isStaticWordOrPhrase(third))).length > 0 ? getIgnoreTranslationMarkup(phrase, glossaryObject[phrase], translator) : maybeNotStaticPos);
                  prevPhrase = glossaryObject[phrase];
                }

                i += d - 1;
                return true;
              }

              if (d === 1) {
                tempLine += (i > 0 && /[\p{Lu}\p{Ll}\p{Nd}]/u.test(a[i]) && /[\p{Lu}\p{Ll}\p{Nd}]/u.test(prevPhrase || '') ? ' ' : '') + (translator === Translators.DEEPL_TRANSLATE || translator === Translators.GOOGLE_TRANSLATE ? Utils.convertTextToHtml(phrase) : phrase);
                prevPhrase = '';
                return true;
              }

              return false;
            });

            i += 1;
          }
        });

        results.push(tempLine);
      }
    });

    newText = results.join('\n');
  }

  return newText;
}

function updateInputTextLength() {
  if (isOnLoad) return;
  const inputText = $inputTextarea.val();

  const translator = $translatorOptions.filter($('.active')).data('id');

  const sourceLanguage = $sourceLanguageSelect.val().split('-')[0].toLowerCase();
  const targetLanguage = $targetLanguageSelect.val().split('-')[0].toLowerCase();
  const languagePairs = $languagePairsSelect.val().split('-');

  const gapLength = applyGlossaryToText(inputText, translator).length - inputText.length;

  $('#input-textarea-counter').text(`${inputText.length}${inputText.length > 0 && ($glossarySwitch.prop('checked') && (translator === Translators.VIETPHRASE ? $prioritizeNameOverVietPhraseCheck.prop('checked') && targetLanguage === 'vi' : sourceLanguage === languagePairs[0] && targetLanguage === languagePairs[1])) && gapLength > 0 ? ` (+${gapLength})` : ''}`);
}

function reloadGlossaryEntries() {
  const entrySelect = document.createElement('select');
  const entriesList = document.createElement('datalist');

  const defaultOption = document.createElement('option');
  defaultOption.innerText = 'Chọn...';
  defaultOption.value = '';
  entrySelect.appendChild(defaultOption);

  const downloadButton = $('#download-button');
  const glossaryExtension = $('#glossary-extension');

  if (glossary.length > 0) {
    glossary = glossary.filter(([first, second], index, array) => !array[first] && (array[first] = 1), {}).sort((a, b) => Tagset[a[2]] - Tagset[b[2]] || a[1].localeCompare(b[1], 'vi', { ignorePunctuation: true }) || a[0].localeCompare(b[0], 'vi', { ignorePunctuation: true }) || b[0].length - a[0].length).map(([first, second, third]) => [first, second, third ?? 'X']);
    glossaryObject = Object.fromEntries(glossary.map(([first, second]) => [first, second]));

    glossary.forEach(([first, second, third]) => {
      const option = document.createElement('option');
      option.innerText = `[${third}] ${first} → ${second}`;
      option.value = first;
      entrySelect.appendChild(option.cloneNode(true));

      if (Utils.isOnMobile()) {
        const optionOnMobile = document.createElement('option');
        optionOnMobile.innerText = `${first} → ${second}`;
        optionOnMobile.setAttribute('data-value', first);
        entriesList.appendChild(optionOnMobile);
      } else {
        option.innerText = `${first} → ${second}`;
        entriesList.appendChild(option.cloneNode(true));
      }
    });

    switch ($glossaryType.val()) {
      case GlossaryType.CSV: {
        glossaryData = $.csv.fromArrays(glossary);
        glossaryExtension.text('csv');
        break;
      }
      case GlossaryType.VIETPHRASE: {
        glossaryData = glossary.map(([first, second]) => [first, second]).map((element) => element.join('=')).join('\n');
        glossaryExtension.text('txt');
        break;
      }
      default: {
        glossaryData = glossary.map((element) => element.join('\t')).join('\n');
        glossaryExtension.text('tsv');
        break;
      }
    }

    downloadButton.attr('href', URL.createObjectURL(new Blob([glossaryData], { type: `${$glossaryType};charset=UTF-8` })));
    downloadButton.attr('download', `${$glossaryName.val().length > 0 ? $glossaryName.val() : $glossaryName.attr('placeholder')}.${glossaryExtension.text()}`);
    downloadButton.removeClass('disabled');
  } else {
    glossaryData = '';
    downloadButton.removeAttr('href');
    downloadButton.removeAttr('download');
    downloadButton.addClass('disabled');
  }

  $glossaryEntrySelect.html(entrySelect.innerHTML);
  $('#glossary-entries-list').html(entriesList.innerHTML);
  $glossaryEntrySelect.val('');
  $('#glossary-entry-counter').text(glossary.length);
  updateInputTextLength();
  localStorage.setItem('glossary', JSON.stringify(glossary));
}

function getMaxQueryLengthAndLine(translator, text) {
  switch (translator) {
    case Translators.DEEPL_TRANSLATE:
      return [131072, 50];

    case Translators.GOOGLE_TRANSLATE:
      return [6000000, 100];

    case Translators.PAPAGO:
      return [3000, 1500];

    case Translators.MICROSOFT_TRANSLATOR:
      return [50000, 1000];

    default:
      return [applyGlossaryToText(text).length, text.split(/\n/).length];
  }
}

function buildResult(inputText, result) {
  try {
    const resultDiv = document.createElement('div');

    const inputLines = inputText.split(/\r?\n/).map((element) => element.trim());
    const resultLines = result.split(/\r?\n/).map((element) => element.trim());

    if ($showOriginalTextSwitch.prop('checked') && result !== 'Vui lòng nhập tệp VietPhrase.txt hoặc bật tuỳ chọn [Tải tệp VietPhrase mặc định] và tải lại trang!') {
      let lostLineFixedNumber = 0;

      for (let i = 0; i < inputLines.length; i += 1) {
        if (i + lostLineFixedNumber < resultLines.length) {
          if (inputLines[i + lostLineFixedNumber].length === 0 && resultLines[i].length > 0) {
            lostLineFixedNumber += 1;
            i -= 1;
          } else if ($translatorOptions.filter($('.active')).data('id') === Translators.PAPAGO && resultLines[i].length === 0 && inputLines[i + lostLineFixedNumber].length > 0) {
            lostLineFixedNumber -= 1;
          } else {
            const paragraph = document.createElement('p');
            let textNode = document.createTextNode(resultLines[i]);

            if (resultLines[i] !== inputLines[i + lostLineFixedNumber]) {
              const idiomaticText = document.createElement('i');
              const linebreak = document.createElement('br');
              idiomaticText.innerText = inputLines[i + lostLineFixedNumber];
              paragraph.appendChild(idiomaticText);
              paragraph.appendChild(linebreak.cloneNode(true));
              textNode = document.createElement('b');
              textNode.innerText = resultLines[i];
            }

            paragraph.appendChild(textNode);
            resultDiv.appendChild(paragraph);
          }
        } else if (i + lostLineFixedNumber < inputLines.length) {
          const paragraph = document.createElement('p');
          const idiomaticText = document.createElement('i');
          idiomaticText.innerText = inputLines[i + lostLineFixedNumber];
          paragraph.appendChild(idiomaticText);
          resultDiv.appendChild(paragraph);
        }
      }
    } else {
      resultDiv.innerHTML = `<p>${resultLines.map(Utils.convertTextToHtml).join('</p><p>')}</p>`;
    }

    return resultDiv.innerHTML.replace(/<p><\/p>/g, '<br>');
  } catch (error) {
    console.error('Lỗi hiển thị bản dịch:', error);
    throw error.toString();
  }
}

function applyOldAccent(text) {
  return text.replace(Utils.getTrieRegexPatternFromWords(Object.keys(oldAccentObject)), (match) => oldAccentObject[match] ?? match);
}

async function translateTextarea() {
  const startTime = Date.now();

  const inputText = $inputTextarea.val();

  const translatorOption = $translatorOptions.filter($('.active')).data('id');

  const sourceLanguage = $sourceLanguageSelect.val();
  const targetLanguage = $targetLanguageSelect.val();
  const languagePairs = $languagePairsSelect.val().split('-');

  const glossaryEnabled = $glossarySwitch.prop('checked');

  const processText = glossaryEnabled && (translatorOption === Translators.VIETPHRASE ? $prioritizeNameOverVietPhraseCheck.prop('checked') && targetLanguage === 'vi' : sourceLanguage.split('-')[0].toLowerCase() === languagePairs[0] && targetLanguage.split('-')[0].toLowerCase() === languagePairs[1]) ? applyGlossaryToText(inputText, translatorOption) : inputText;

  const [MAX_LENGTH, MAX_LINE] = getMaxQueryLengthAndLine(translatorOption, processText);

  if (translatorOption !== Translators.DEEPL_TRANSLATE && processText.split(/\n/).sort((a, b) => b.length - a.length)[0].length > MAX_LENGTH) {
    throw console.error(`Số lượng từ trong một dòng quá dài (Số lượng từ hợp lệ nhỏ hơn hoặc bằng ${MAX_LENGTH}).`);
  }

  try {
    let result = '';

    if (Object.keys(lastSession).length > 0 && lastSession.inputText === (glossaryEnabled && (translatorOption === Translators.VIETPHRASE ? targetLanguage === 'vi' : sourceLanguage.split('-')[0].toLowerCase() === languagePairs[0] && targetLanguage.split('-')[0].toLowerCase() === languagePairs[1]) ? applyGlossaryToText(inputText) : inputText) && lastSession.translatorOption === translatorOption && lastSession.sourceLanguage === sourceLanguage && lastSession.targetLanguage === targetLanguage) {
      result = lastSession.result;
    } else {
      const results = [];
      let translator = null;

      switch (translatorOption) {
        case Translators.DEEPL_TRANSLATE: {
          translator = await new DeeplTranslate().init();
          break;
        }
        case Translators.GOOGLE_TRANSLATE: {
          translator = await new GoogleTranslate().init();
          break;
        }
        case Translators.PAPAGO: {
          translator = await new Papago().init();
          break;
        }
        case Translators.VIETPHRASE: {
          translator = await new Vietphrase(vietPhraseData, $translationAlgorithmRadio.filter('[checked]').val(), $multiplicationAlgorithmRadio.filter('[checked]').val(), glossaryEnabled && targetLanguage === 'vi', glossaryObject, $prioritizeNameOverVietPhraseCheck.prop('checked'), true);
          break;
        }
        default: {
          translator = await new MicrosoftTranslator().init();
          break;
        }
      }

      if (translatorOption === Translators.DEEPL_TRANSLATE && translator.usage.character_count + inputText.length > translator.usage.character_limit) throw console.error(`Lỗi DeepL Translator: Đã đạt đến giới hạn dịch của tài khoản. (${translator.usage.character_count}/${translator.usage.character_limit} ký tự).`);

      if (processText.split(/\r?\n/).length <= MAX_LINE && (translatorOption === Translators.DEEPL_TRANSLATE ? (new TextEncoder()).encode(`text=${processText.split(/\r?\n/).map((element) => encodeURIComponent(element)).join('&text=')}&source_lang=${sourceLanguage}&target_lang=${targetLanguage}&tag_handling=xml`) : processText).length <= MAX_LENGTH) {
        result = await translator.translateText(sourceLanguage, targetLanguage, processText);
      } else {
        const inputLines = processText.split(/\r?\n/);
        let queryLines = [];

        switch (translatorOption) {
          case Translators.DEEPL_TRANSLATE: {
            while (inputLines.length > 0 && queryLines.length + 1 <= MAX_LINE && (new TextEncoder()).encode(`text=${[...queryLines, inputLines[0]].map((element) => encodeURIComponent(element)).join('&text=')}&source_lang=${sourceLanguage}&target_lang=${targetLanguage}&tag_handling=xml`).length <= MAX_LENGTH) {
              if (translateAbortController.signal.aborted) break;
              queryLines.push(inputLines.shift());

              if (inputLines.length === 0 || queryLines.length + 1 > MAX_LINE || (new TextEncoder()).encode(`text=${[...queryLines, inputLines[0]].map((element) => encodeURIComponent(element)).join('&text=')}&source_lang=${sourceLanguage}&target_lang=${targetLanguage}&tag_handling=xml`).length > MAX_LENGTH) {
                results.push(await translator.translateText(sourceLanguage, targetLanguage, queryLines.join('\n')));
                queryLines = [];
              }
            }

            break;
          }
          default: {
            while (inputLines.length > 0 && queryLines.length + 1 <= MAX_LINE && [...queryLines, inputLines[0]].join('\n').length <= MAX_LENGTH) {
              if (translateAbortController.signal.aborted) break;
              queryLines.push(inputLines.shift());

              if (inputLines.length === 0 || queryLines.length + 1 > MAX_LINE || [...queryLines, inputLines[0]].join('\n').length > MAX_LENGTH) {
                results.push(await translator.translateText(sourceLanguage, targetLanguage, queryLines.join('\n')));
                queryLines = [];
              }
            }

            break;
          }
        }

        result = results.join('\n');
      }

      if (glossaryEnabled && translatorOption !== Translators.MICROSOFT_TRANSLATOR && translatorOption !== Translators.VIETPHRASE && sourceLanguage.split('-')[0].toLowerCase() === languagePairs[0] && targetLanguage.split('-')[0].toLowerCase() === languagePairs[1] && translatorOption !== Translators.MICROSOFT_TRANSLATOR) {
        glossary.filter(([first]) => inputText.includes(first)).sort((a, b) => b[1].length - a[1].length).forEach(([__, second]) => {
          const key = second.replace(/ /g, '_');
          const oldAccentKey = applyOldAccent(key);
          if (second.split(' ').length >= 2) result = result.replace(Utils.getTrieRegexPatternFromWords([key, key[0].toLowerCase() + key.substring(1), key[0].toUpperCase() + key.substring(1), oldAccentKey, oldAccentKey[0].toLowerCase() + oldAccentKey.substring(1), oldAccentKey[0].toUpperCase() + oldAccentKey.substring(1)]), (match) => match[0] + second.substring(1));
        });
      }

      $('#translate-timer').text(Date.now() - startTime);
      lastSession.inputText = (glossaryEnabled && translatorOption === Translators.VIETPHRASE ? targetLanguage === 'vi' : sourceLanguage.split('-')[0].toLowerCase() === languagePairs[0] && targetLanguage.split('-')[0].toLowerCase() === languagePairs[1]) ? applyGlossaryToText(inputText) : inputText;
      lastSession.translatorOption = translatorOption;
      lastSession.sourceLanguage = sourceLanguage;
      lastSession.targetLanguage = targetLanguage;
      lastSession.result = result;
    }

    if (translateAbortController.signal.aborted) return;
    $resultTextarea.html(buildResult($inputTextarea.val(), result));
  } catch (error) {
    console.error(error);
    const paragraph = document.createElement('p');
    paragraph.innerText = `Bản dịch thất bại: ${error}`;
    $resultTextarea.html(paragraph);
    lastSession = {};
  }
}

function getSelectedTextOrActiveElementText() {
  return window.getSelection().toString() || ((document.activeElement.tagName === 'TEXTAREA' || (document.activeElement.tagName === 'INPUT' && /^(?:email|month|number|search|tel|text|url|week)$/i.test(document.activeElement.type))) && typeof document.activeElement.selectionStart === 'number' && document.activeElement.value.slice(document.activeElement.selectionStart, document.activeElement.selectionEnd)) || '';
}

function getSourceLanguageSelectOptions(translator) {
  const sourceLanguageSelect = document.createElement('select');

  switch (translator) {
    case Translators.DEEPL_TRANSLATE: {
      DeeplTranslate.SOURCE_LANGUAGES.forEach(({ language }) => {
        if (SUPPORTED_LANGUAGES.indexOf(language) === -1) return;
        const option = document.createElement('option');
        option.innerText = DeeplTranslate.getSourceLangName(language);
        option.value = language;
        sourceLanguageSelect.appendChild(option);
      });

      break;
    }
    case Translators.GOOGLE_TRANSLATE: {
      Object.entries(GoogleTranslate.SOURCE_LANGUAGES).forEach(([languageCode]) => {
        if (SUPPORTED_LANGUAGES.indexOf(languageCode) === -1) return;
        const option = document.createElement('option');
        option.innerText = GoogleTranslate.getSlName(languageCode);
        option.value = languageCode;
        sourceLanguageSelect.appendChild(option);
      });

      break;
    }
    case Translators.PAPAGO: {
      Object.entries(Papago.SOURCE_LANGUAGES).forEach(([languageCode]) => {
        if (SUPPORTED_LANGUAGES.indexOf(languageCode) === -1) return;
        const option = document.createElement('option');
        option.innerText = Papago.getSourceName(languageCode);
        option.value = languageCode;
        sourceLanguageSelect.appendChild(option);
      });

      break;
    }
    case Translators.VIETPHRASE: {
      Object.entries(Vietphrase.SOURCE_LANGUAGES).forEach(([languageCode]) => {
        const option = document.createElement('option');
        option.innerText = Vietphrase.getSourceLanguageName(languageCode);
        option.value = languageCode;
        sourceLanguageSelect.appendChild(option);
      });

      break;
    }
    default: {
      Object.entries(MicrosoftTranslator.FROM_LANGUAGES).forEach(([languageCode]) => {
        if (SUPPORTED_LANGUAGES.indexOf(languageCode) === -1) return;
        const option = document.createElement('option');
        option.innerText = MicrosoftTranslator.getFromName(languageCode);
        option.value = languageCode;
        sourceLanguageSelect.appendChild(option);
      });

      break;
    }
  }

  return sourceLanguageSelect.innerHTML;
}

function getTargetLanguageSelectOptions(translator) {
  const targetLanguageSelect = document.createElement('select');

  switch (translator) {
    case Translators.DEEPL_TRANSLATE: {
      DeeplTranslate.TARGET_LANGUAGES.forEach(({ language }) => {
        if (SUPPORTED_LANGUAGES.indexOf(language) === -1) return;
        const option = document.createElement('option');
        option.innerText = DeeplTranslate.getTargetLangName(language);
        option.value = language;
        targetLanguageSelect.appendChild(option);
      });

      break;
    }
    case Translators.GOOGLE_TRANSLATE: {
      Object.entries(GoogleTranslate.TARGET_LANGUAGES).forEach(([languageCode]) => {
        if (SUPPORTED_LANGUAGES.indexOf(languageCode) === -1) return;
        const option = document.createElement('option');
        option.innerText = GoogleTranslate.getTlName(languageCode);
        option.value = languageCode;
        targetLanguageSelect.appendChild(option);
      });

      break;
    }
    case Translators.PAPAGO: {
      Object.entries(Papago.TARGET_LANGUAGES).forEach(([languageCode]) => {
        if (SUPPORTED_LANGUAGES.indexOf(languageCode) === -1) return;
        const option = document.createElement('option');
        option.innerText = Papago.getTargetName(languageCode);
        option.value = languageCode;
        targetLanguageSelect.appendChild(option);
      });

      break;
    }
    case Translators.VIETPHRASE: {
      Object.entries(Vietphrase.TARGET_LANGUAGES).forEach(([languageCode]) => {
        const option = document.createElement('option');
        option.innerText = Vietphrase.getTargetLanguageName(languageCode);
        option.value = languageCode;
        targetLanguageSelect.appendChild(option);
      });

      break;
    }
    default: {
      Object.entries(MicrosoftTranslator.TO_LANGUAGES).forEach(([languageCode]) => {
        if (SUPPORTED_LANGUAGES.indexOf(languageCode) === -1) return;
        const option = document.createElement('option');
        option.innerText = MicrosoftTranslator.getToName(languageCode);
        option.value = languageCode;
        targetLanguageSelect.appendChild(option);
      });

      break;
    }
  }

  return targetLanguageSelect.innerHTML;
}

function updateLanguageSelect(translator, prevTranslator) {
  let sourceLanguage = quickTranslateStorage.source_language;
  let targetLanguage = quickTranslateStorage.target_language;

  if (translator !== prevTranslator) {
    switch (prevTranslator) {
      case Translators.DEEPL_TRANSLATE: {
        sourceLanguage = DeeplTranslate.getMappedSourceLanguageCode(translator, sourceLanguage) ?? sourceLanguage;
        targetLanguage = DeeplTranslate.getMappedTargetLanguageCode(translator, targetLanguage) ?? targetLanguage;
        break;
      }
      case Translators.GOOGLE_TRANSLATE: {
        sourceLanguage = GoogleTranslate.getMappedSourceLanguageCode(translator, sourceLanguage) ?? sourceLanguage;
        targetLanguage = GoogleTranslate.getMappedTargetLanguageCode(translator, targetLanguage) ?? targetLanguage;
        break;
      }
      case Translators.PAPAGO: {
        sourceLanguage = Papago.getMappedSourceLanguageCode(translator, sourceLanguage) ?? sourceLanguage;
        targetLanguage = Papago.getMappedTargetLanguageCode(translator, targetLanguage) ?? targetLanguage;
        break;
      }
      case Translators.VIETPHRASE: {
        sourceLanguage = Vietphrase.getMappedSourceLanguageCode(translator);
        targetLanguage = Vietphrase.getMappedTargetLanguageCode(translator);
        break;
      }
      default: {
        sourceLanguage = MicrosoftTranslator.getMappedSourceLanguageCode(translator, sourceLanguage) ?? sourceLanguage;
        targetLanguage = MicrosoftTranslator.getMappedTargetLanguageCode(translator, targetLanguage) ?? targetLanguage;
        break;
      }
    }
  }

  $sourceLanguageSelect.html(getSourceLanguageSelectOptions(translator));
  $sourceLanguageSelect.val(sourceLanguage).change();
  $targetLanguageSelect.html(getTargetLanguageSelectOptions(translator));
  $targetLanguageSelect.val(targetLanguage).change();
}

async function translateText(inputText, translatorOption, targetLanguage, glossaryEnabled) {
  try {
    const text = glossaryEnabled && (translatorOption !== Translators.VIETPHRASE || $prioritizeNameOverVietPhraseCheck.prop('checked')) ? applyGlossaryToText(inputText, translatorOption) : inputText;
    let translator = null;
    let sourceLanguage = '';

    switch (translatorOption) {
      case Translators.DEEPL_TRANSLATE: {
        translator = await new DeeplTranslate().init();
        sourceLanguage = DeeplTranslate.DETECT_LANGUAGE;
        break;
      }
      case Translators.GOOGLE_TRANSLATE: {
        translator = await new GoogleTranslate().init();
        sourceLanguage = GoogleTranslate.DETECT_LANGUAGE;
        break;
      }
      case Translators.PAPAGO: {
        translator = await new Papago().init();
        sourceLanguage = Papago.DETECT_LANGUAGE;
        break;
      }
      case Translators.VIETPHRASE: {
        translator = await new Vietphrase(vietPhraseData, $translationAlgorithmRadio.filter('[checked]').val(), $multiplicationAlgorithmRadio.filter('[checked]').val(), glossaryEnabled, glossaryObject, $prioritizeNameOverVietPhraseCheck.prop('checked'));
        sourceLanguage = Vietphrase.DefaultLanguage.SOURCE_LANGUAGE;
        break;
      }
      default: {
        translator = await new MicrosoftTranslator().init();
        sourceLanguage = MicrosoftTranslator.AUTODETECT;
        break;
      }
    }

    if (translatorOption === Translators.DEEPL_TRANSLATE && translator.usage.character_count + text.length > translator.usage.character_limit) return `Lỗi DeepL Translator: Đã đạt đến giới hạn dịch của tài khoản. (${translator.usage.character_count}/${translator.usage.character_limit} ký tự).`;
    let result = await translator.translateText(sourceLanguage, targetLanguage, text);

    if (glossaryEnabled && translatorOption !== Translators.MICROSOFT_TRANSLATOR && translatorOption !== Translators.VIETPHRASE) {
      glossary.filter(([first]) => inputText.includes(first)).sort((a, b) => b[1].length - a[1].length).forEach(([__, second]) => {
        const key = second.replace(/ /g, '_');
        const oldAccentKey = applyOldAccent(key);
        if (second.split(' ').length >= 2) result = result.replace(Utils.getTrieRegexPatternFromWords([key, key[0].toLowerCase() + key.substring(1), key[0].toUpperCase() + key.substring(1), oldAccentKey, oldAccentKey[0].toLowerCase() + oldAccentKey.substring(1), oldAccentKey[0].toUpperCase() + oldAccentKey.substring(1)]), (match) => match[0] + second.substring(1));
      });
    }

    return result;
  } catch (error) {
    console.error(error);
    return `Bản dịch thất bại: ${error}`;
  }
}

function applyNewAccent(text) {
  return text.replace(Utils.getTrieRegexPatternFromWords(newAccentMap.map(([first]) => first)), (match) => newAccentObject[match] ?? match);
}

$(document).ready(async () => {
  $('input[type="file"]').val(null);
  loadAllQuickTranslatorOptions();
  reloadGlossaryEntries();

  try {
    let pinyinList = [];

    await $.ajax({
      method: 'GET',
      url: '/static/datasource/Unihan_Readings.txt',
    }).done((data) => {
      pinyinList = data.split(/\r?\n/).filter((element) => element.startsWith('U+')).map((element) => element.substring(2).split(/\t/)).filter((element) => element.length === 2).map(([first, second]) => [String.fromCodePoint(parseInt(first, 16)), second]);
      vietPhraseData.pinyins = Object.fromEntries(pinyinList);
    });

    await $.ajax({
      method: 'GET',
      url: '/static/datasource/chivi/Bính âm.txt',
    }).done((data) => {
      pinyinList = [...pinyinList, ...data.split(/\r?\n/).map((element) => element.split('=')).filter((element) => element.length === 2).sort((a, b) => b[0].length - a[0].length).map(([first, second]) => [first, second.split('ǀ')[0]]).filter(([first]) => !Object.prototype.hasOwnProperty.call(vietPhraseData.pinyins, first))];
    });

    pinyinList = pinyinList.filter(([first, second], index, array) => !array[first] && (array[first] = 1), {});
    vietPhraseData.pinyins = Object.fromEntries(pinyinList);
    console.log(`Đã tải xong bộ dữ liệu bính âm (${pinyinList.length})!`);
    lastSession = {};
  } catch (error) {
    console.error('Không thể tải bộ dữ liệu bính âm:', error);
    setTimeout(window.location.reload, 5000);
  }

  newAccentObject = Object.fromEntries(newAccentMap);
  oldAccentObject = Object.fromEntries(newAccentMap.map(([first, second]) => [second, first]));

  try {
    let chinesePhienAmWordList = [...specialSinovietnameseMap.map(([a, b, c]) => [a, (Object.fromEntries(specialSinovietnameseMap.filter(([__, d]) => !/\p{sc=Hani}/u.test(d)).map(([d, e, f]) => [d, f ?? e]))[b] ?? c ?? b).split(/, | \| /)[0].toLowerCase()]), ...cjkv.nam.map(([first, second]) => [first, second.trimStart().split(/, ?/).filter((element) => element.length > 0)[0]]), ...hanData.names.map(([first, second]) => [first, second.split(',').filter((element) => element.length > 0)[0]])];

    await $.ajax({
      method: 'GET',
      url: '/static/datasource/QuickTranslate2020/ChinesePhienAmWords.txt',
    }).done((data) => {
      chinesePhienAmWordList = [...chinesePhienAmWordList, ...data.split(/\r\n/).map((element) => element.split('=')).filter((element) => element.length === 2 && !/\p{sc=Latn}/u.test(element[0]))];
    });

    await $.ajax({
      method: 'GET',
      url: '/static/datasource/chivi/word_hv.txt',
    }).done((data) => {
      chinesePhienAmWordList = [...chinesePhienAmWordList, ...data.split(/\n/).map((element) => element.split('=')).filter((element) => element.length === 2 && Array.from(element[0]).length === 1).sort((a, b) => b[0].length - a[0].length).map(([first, second]) => [first, second.split('ǀ')[0]])];
    });

    chinesePhienAmWordList = chinesePhienAmWordList.filter(([first], index, array) => !array[first] && (array[first] = 1), {});
    chinesePhienAmWordList = chinesePhienAmWordList.map(([c, d]) => [c, applyNewAccent(d)]);
    vietPhraseData.hanViet = Object.fromEntries(chinesePhienAmWordList);
    console.log(`Đã tải xong bộ dữ liệu hán việt (${chinesePhienAmWordList.length})!`);
    lastSession = {};
  } catch (error) {
    console.error('Không thể tải bộ dữ liệu hán việt:', error);
    setTimeout(window.location.reload, 5000);
  }

  if ($loadDefaultVietPhraseFileSwitch.prop('checked')) {
    $.ajax({
      method: 'GET',
      url: '/static/datasource/Quick Translator/VietPhrase.txt',
    }).done((data) => {
      let vietPhraseList = [...data.split(/\r\n/).map((element) => element.split('=')).filter((element) => element.length === 2).map(([first, second]) => [first, second.split(/[/|]/)[0]]), ...Object.entries(vietPhraseData.hanViet)];
      vietPhraseList = vietPhraseList.filter(([first], index, array) => !array[first] && (array[first] = 1), {});
      if ($vietPhraseInput.prop('files').length > 0) return;
      vietPhraseData.vietPhrase = Object.fromEntries(vietPhraseList);
      const $vietPhraseEntryCounter = $('#viet-phrase-entry-counter');
      $vietPhraseEntryCounter.text(vietPhraseList.length);
      console.log(`Đã tải xong tệp VietPhrase (${$vietPhraseEntryCounter.text()})!`);
      lastSession = {};
    }).fail((jqXHR, textStatus, errorThrown) => {
      console.error('Không tải được tệp VietPhrase:', errorThrown);
    });

    $.ajax({
      method: 'GET',
      url: '/static/datasource/Quick Translator/LuatNhan.txt',
    }).done((data) => {
      if ($luatNhanInput.prop('files').length > 0) return;
      vietPhraseData.luatNhan = Object.fromEntries(data.split(/\r?\n/).filter((element) => !element.startsWith('#')).map((element) => element.split('=')).filter((element) => element.length === 2));
      const $luatNhanEntryCounter = $('#luat-nhan-entry-counter');
      $luatNhanEntryCounter.text(Object.keys(vietPhraseData.luatNhan).length);
      console.log(`Đã tải xong tệp LuatNhan (${$luatNhanEntryCounter.text()})!`);
      lastSession = {};
    }).fail((jqXHR, textStatus, errorThrown) => {
      console.error('Không tải được tệp LuatNhan:', errorThrown);
      setTimeout(window.location.reload, 5000);
    });

    $.ajax({
      method: 'GET',
      url: '/static/datasource/Quick Translator/Pronouns.txt',
    }).done((data) => {
      if ($pronounInput.prop('files').length > 0) return;
      vietPhraseData.pronoun = Object.fromEntries(data.split(/\r?\n/).map((element) => element.split('=')).filter((element) => element.length === 2).map(([first, second]) => [first, second.split('/')[0]]));
      const $pronounEntryCounter = $('#pronoun-entry-counter');
      $pronounEntryCounter.text(Object.keys(vietPhraseData.pronoun).length);
      console.log(`Đã tải xong tệp Pronouns (${$pronounEntryCounter.text()})!`);
      lastSession = {};
    }).fail((jqXHR, textStatus, errorThrown) => {
      console.error('Không tải được tệp Pronouns:', errorThrown);
      setTimeout(window.location.reload, 5000);
    });
  }

  $loadDefaultVietPhraseFileSwitch.removeClass('disabled');
  isOnLoad = false;
  updateInputTextLength();
});

$(window).on('keypress', (event) => !($(document.activeElement).is('body') && $resultTextarea.is(':visible') && event.key === 'Enter') || $resultTextarea.focus());

$translateButton.on('click', function onClick() {
  if (translateAbortController != null) {
    translateAbortController.abort();
    translateAbortController = null;
  }

  const copyButton = $('#action-navbar .copy-button');

  switch ($(this).text()) {
    case 'Huỷ':
    case 'Sửa': {
      $('#translate-timer').text(0);
      $resultTextarea.html(null);
      $resultTextarea.hide();
      $inputTextarea.show();
      $(this).text('Dịch');
      copyButton.data('target', '#input-textarea');
      copyButton.removeClass('disabled');
      $('#action-nav .paste-button').removeClass('disabled');
      $retranslateButton.addClass('disabled');
      break;
    }
    default: {
      if ($inputTextarea.val().length === 0) break;
      copyButton.addClass('disabled');
      $('#action-navbar .paste-button').addClass('disabled');
      $resultTextarea.html($resultTextarea.html().split(/<br>|<\/p><p>/).map((element, index) => (index === 0 ? `Đang dịch...${element.slice(12).replace(/./g, ' ')}` : element.replace(/./g, ' '))).join('<br>'));
      $inputTextarea.hide();
      $resultTextarea.show();
      $(this).text('Huỷ');
      translateAbortController = new AbortController();
      translateTextarea().finally(() => {
        $translateButton.text('Sửa');
        copyButton.data('target', '#result-textarea');
        copyButton.removeClass('disabled');
        $('#action-navbar .paste-button').removeClass('disabled');
        $retranslateButton.removeClass('disabled');

        if (prevScrollTop > 0) {
          $resultTextarea.prop('scrollTop', prevScrollTop);
          prevScrollTop = 0;
        }
      });

      break;
    }
    // no default
  }
});

$copyButtons.on('click', async function onClick() {
  if ($(this).data('target') === '#result-textarea') {
    if (Object.keys(lastSession).length > 0) {
      await navigator.clipboard.writeText(lastSession.result);
    }

    return;
  }

  if ($(this).data('target') === '#glossary-entry-list') {
    if (glossaryData.length > 0) {
      await navigator.clipboard.writeText(glossaryData);
    }

    return;
  }

  const target = $($(this).data('target'));

  if (target.val().length > 0) {
    await navigator.clipboard.writeText(target.val());
  }
});

$pasteButtons.on('click', async function onClick() {
  await navigator.clipboard.readText().then((clipText) => {
    if ($($(this).data('target')).val().length > 0 && !window.confirm('Dán văn bản mới sẽ khiến văn bản hiện tại bị mất. Bạn chấp nhận chữ?')) return;
    if ($(this).data('target') === '#input-textarea') {
      $resultTextarea.prop('scrollTop', 0);
      $($(this).data('target')).val(clipText).trigger('input');
      $retranslateButton.click();
    } else {
      $($(this).data('target')).val(clipText).trigger('input');
    }
  });
});

$retranslateButton.click(function onClick() {
  if (!$(this).hasClass('disabled')) {
    prevScrollTop = $resultTextarea.prop('scrollTop');
    $translateButton.text('Dịch').click();
  }
});

$('#glossary-management-button').on('mousedown', () => {
  $tagsetSelect.val('X');
  $glossaryEntrySelect.val('').change();
  $sourceEntryInput.val(getSelectedTextOrActiveElementText()).trigger('input');

  if (window.getSelection) {
    window.getSelection().removeAllRanges();
  } else if (document.selection) {
    document.selection.empty();
  }

  $('.textarea').blur();
});

$options.change(function onChange() {
  const optionId = getOptionId($(this).attr('name') != null ? $(this).attr('name') : $(this).attr('id'));
  const optionType = getOptionType($(this).attr('name') != null ? $(this).attr('name') : $(this).attr('id'));

  if (optionType !== OptionTypes.SELECT && optionType !== OptionTypes.CHECK && optionType !== OptionTypes.RADIO && optionType !== OptionTypes.SWITCH) return;
  if (optionType === OptionTypes.RADIO) {
    $options.filter(`[name="${$(this).attr('name')}"]`).removeAttr('checked');
    $(this).attr('checked', true);
  }

  if (optionType === OptionTypes.CHECK || optionType === OptionTypes.SWITCH) {
    quickTranslateStorage[optionId] = $(this).prop('checked');
  } else {
    quickTranslateStorage[optionId] = $(this).val();
  }

  localStorage.setItem('dich_nhanh', JSON.stringify(quickTranslateStorage));

  if ($(this).hasClass('quick-translate-option')) {
    updateInputTextLength();
    lastSession = {};
    $retranslateButton.click();
  }
});

$fontOptions.click(function onClick() {
  $fontOptions.removeClass('active');
  $(this).addClass('active');

  if ($(this).text() !== 'Mặc định') {
    $(document.body).css('--opt-font-family', `${$(this).text().includes(' ') ? `'${$(this).text()}'` : $(this).text()}, ${$(this).data('additional-fonts') != null && $(this).data('additional-fonts').length > 0 ? `${$(this).data('additional-fonts').split(', ').map((element) => (element.includes(' ') ? `'${element}'` : element)).join(', ')}, serif` : 'serif'}`);
  } else if ($(this).text() === 'Phông chữ hệ thống') {
    $(document.body).css('--opt-font-family', 'var(--system-font-family)');
  } else {
    $(document.body).css('--opt-font-family', '');
  }

  quickTranslateStorage.font = $(this).text();
  localStorage.setItem('dich_nhanh', JSON.stringify(quickTranslateStorage));
});

$fontSizeRange.on('input', function onInput() {
  $('#font-size-display').val(parseFloat($(this).val()));
  $(document.body).css('--opt-font-size', `${parseFloat($(this).val()) / 100}rem`);
  quickTranslateStorage[getOptionId($(this).attr('id'))] = parseFloat($(this).val());
});

$('#font-size-display').on('change', function onChange() {
  const maybeValueIsBiggerThanMaxValue = $(this).val() > parseInt($fontSizeRange.attr('max'), 10) ? $fontSizeRange.attr('max') : $(this).val();
  $fontSizeRange.val($(this).val() < parseInt($fontSizeRange.attr('min'), 10) ? $fontSizeRange.attr('min') : maybeValueIsBiggerThanMaxValue).change();
});

$fontSizeRange.off('change');

$fontSizeRange.change(function onChange() {
  $(this).trigger('input');
  localStorage.setItem('dich_nhanh', JSON.stringify(quickTranslateStorage));
});

$lineSpacingRange.on('input', function onInput() {
  $('#line-spacing-display').val(parseInt($(this).val(), 10));
  $(document.body).css('--opt-line-height', `${1 + ((0.5 * parseInt($(this).val(), 10)) / 100)}em`);
  quickTranslateStorage[getOptionId($(this).attr('id'))] = parseInt($(this).val(), 10);
});

$('#line-spacing-display').on('change', function onChange() {
  const maybeValueIsBiggerThanMaxValue = $(this).val() > parseInt($lineSpacingRange.attr('max'), 10) ? $lineSpacingRange.attr('max') : $(this).val();
  $lineSpacingRange.val($(this).val() < parseInt($lineSpacingRange.attr('min'), 10) ? $lineSpacingRange.attr('min') : maybeValueIsBiggerThanMaxValue).change();
});

$lineSpacingRange.off('change');

$lineSpacingRange.change(function onChange() {
  $(this).trigger('input');
  localStorage.setItem('dich_nhanh', JSON.stringify(quickTranslateStorage));
});

$alignmentSettingsSwitch.off('change');

$alignmentSettingsSwitch.change(function onChange() {
  $(document.body).css('--opt-text-align', $(this).prop('checked') ? 'justify' : 'start');
  quickTranslateStorage[getOptionId($(this).attr('id'))] = $(this).prop('checked');
  localStorage.setItem('dich_nhanh', JSON.stringify(quickTranslateStorage));
});

$translatorOptions.click(function onClick() {
  $translatorOptions.removeClass('active');
  $(this).addClass('active');
  updateLanguageSelect($(this).data('id'), quickTranslateStorage.translator);
  quickTranslateStorage.translator = $(this).data('id');
  localStorage.setItem('dich_nhanh', JSON.stringify(quickTranslateStorage));
  updateInputTextLength();
  $retranslateButton.click();
});

$showOriginalTextSwitch.off('change');

$showOriginalTextSwitch.change(function onChange() {
  quickTranslateStorage[getOptionId($(this).attr('id'))] = $(this).prop('checked');
  $retranslateButton.click();
});

$vietPhraseInput.on('change', function onChange() {
  const reader = new FileReader();

  reader.onload = function onLoad() {
    let vietPhraseList = this.result.split(/\r?\n/).map((element) => element.split('=')).filter((element) => element.length === 2).map(([first, second]) => [first, second.split(/[/|]/)[0]]);
    vietPhraseList = [...vietPhraseList, ...Object.entries(vietPhraseData.hanViet)].filter(([first], index, array) => !array[first] && (array[first] = 1), {});
    vietPhraseData.vietPhrase = Object.fromEntries(vietPhraseList);
    const $vietPhraseEntryCounter = $('#viet-phrase-entry-counter');
    $vietPhraseEntryCounter.text(vietPhraseList.length);
    console.log(`Đã tải xong tệp ${$vietPhraseInput.prop('files')[0].name} (${$vietPhraseEntryCounter.text()})!`);
    lastSession = {};
  };

  reader.readAsText($(this).prop('files')[0]);
});

$loadDefaultVietPhraseFileSwitch.off('change');

$loadDefaultVietPhraseFileSwitch.on('change', function onChange() {
  if (!$(this).hasClass('disabled')) {
    quickTranslateStorage[getOptionId($(this).attr('id'))] = $(this).prop('checked');
    localStorage.setItem('dich_nhanh', JSON.stringify(quickTranslateStorage));
    if ($(this).prop('checked') === true && window.confirm('Bạn có muốn tải lại trang ngay chứ?')) window.location.reload();
  }
});

$luatNhanInput.on('change', function onChange() {
  const reader = new FileReader();

  reader.onload = function onLoad() {
    vietPhraseData.luatNhan = Object.fromEntries(this.result.split(/\r?\n/).filter((element) => !element.startsWith('#')).map((element) => element.split('=')).filter((element) => element.length === 2));
    const $luatNhanEntryCounter = $('#luat-nhan-entry-counter');
    $luatNhanEntryCounter.text(Object.keys(vietPhraseData.luatNhan).length);
    console.log(`Đã tải xong tệp ${$luatNhanInput.prop('files')[0].name} (${$luatNhanEntryCounter.text()})!`);
    lastSession = {};
  };

  reader.readAsText($(this).prop('files')[0]);
});

$pronounInput.on('change', function onChange() {
  const reader = new FileReader();

  reader.onload = function onLoad() {
    vietPhraseData.pronoun = Object.fromEntries(this.result.split(/\r?\n/).map((element) => element.split('=')).filter((element) => element.length === 2).map(([first, second]) => [first, second.split('/')[0]]));
    const $pronounEntryCounter = $('#pronoun-entry-counter');
    $pronounEntryCounter.text(Object.keys(vietPhraseData.pronoun).length);
    console.log(`Đã tải xong tệp ${$pronounInput.prop('files')[0].name} (${$pronounEntryCounter.text()})!`);
    lastSession = {};
  };

  reader.readAsText($(this).prop('files')[0]);
});

$resetButton.on('click', () => {
  if (!window.confirm('Bạn có muốn đặt lại tất cả thiết lập chứ?')) return;
  localStorage.setItem('dich_nhanh', JSON.stringify(defaultOptions));
  if (window.confirm('Bạn có muốn tải lại trang ngay chứ?')) window.location.reload();
});

$glossaryInput.on('change', function onChange() {
  const reader = new FileReader();

  reader.onload = function onLoad() {
    switch ($glossaryInput.prop('files')[0].type) {
      case GlossaryType.CSV: {
        glossary = $.csv.toArrays(this.result).filter((element) => element.length >= 2);
        $glossaryType.val(GlossaryType.CSV);
        break;
      }
      case GlossaryType.VIETPHRASE: {
        glossary = this.result.split(/\r?\n/).map((element) => element.split('=')).filter((element) => element.length === 2);
        $glossaryType.val(GlossaryType.VIETPHRASE);
        break;
      }
      default: {
        glossary = this.result.split(/\r?\n/).map((element) => element.split(/\t/)).filter((element) => element.length >= 2);
        $glossaryType.val(GlossaryType.TSV);
        break;
      }
    }

    $glossaryName.val($glossaryInput.prop('files')[0].name.split('.').slice(0, $glossaryInput.prop('files')[0].name.split('.').length - 1).join('.'));
    reloadGlossaryEntries();
  };

  reader.readAsText($(this).prop('files')[0]);
});

$('#clear-button').on('click', () => {
  if (!window.confirm('Bạn có muốn xoá sạch bảng thuật ngữ chứ?')) return;
  glossary = [];
  $glossaryName.val(null);
  reloadGlossaryEntries();
  $glossaryInput.val('');
});

$glossaryType.on('change', () => reloadGlossaryEntries());

$sourceEntryInput.on('input', async function onInput() {
  const inputText = $(this).val();

  if (inputText.length > 0) {
    const $option = $(`#${$(this).attr('list')} > option:contains(${inputText})`);

    if (Utils.isOnMobile() && $option.length > 0 && inputText === $option.text()) {
      $(this).val($option.data('value')).trigger('input');
      return;
    }

    if (Object.prototype.hasOwnProperty.call(glossaryObject, inputText)) {
      $targetEntryInput.val(applyGlossaryToText(inputText.trim()));
      $glossaryEntrySelect.val(inputText.trim());
      $tagsetSelect.val(glossary.filter(([first]) => first === inputText)[0][2] ?? 'X');
    } else {
      $targetEntryInput.val((await translateText(inputText, Translators.VIETPHRASE, 'sinoVietnamese', true)).trim());
      $glossaryEntrySelect.val('');
      $tagsetSelect.val('X');
    }

    $addButton.removeClass('disabled');
    $removeButton.removeClass('disabled');
  } else {
    $glossaryEntrySelect.val('').change();
    $addButton.addClass('disabled');
    $removeButton.addClass('disabled');
  }
});

$('#source-entry-dropdown-toggle').on('mousedown', (event) => event.preventDefault());

$('.dropdown-can-scroll').on('hide.bs.dropdown', function onHideBsDropdown() {
  $(this).find('.dropdown-menu-scroller').prop('scrollTop', 0);
});

$('.dropdown-menu button.dropdown-item').on('click', function onClick() {
  if ($(this).data('bs-toggle') === 'collapse') {
    $dropdownHasCollapse.find('.dropdown-menu').find('.collapse').each((indexInArray, value) => {
      if (!$(value).hasClass('show')) return;
      const bootstrapDropdownHasCollapse = new bootstrap.Collapse(value);
      bootstrapDropdownHasCollapse.hide();
    });
  } else {
    $dropdownHasCollapse.find('.dropdown-menu').each((indexInArray, value) => {
      if (!$(value).hasClass('show')) return;
      const bootstrapDropdownHasCollapse = new bootstrap.Dropdown(value);
      bootstrapDropdownHasCollapse.hide();
    });
  }
});

$dropdownHasCollapse.on('hide.bs.dropdown', function onHideBsDropdown() {
  $(this).find('.dropdown-menu').find('.collapse').each((indexInArray, value) => {
    if (!$(value).hasClass('show')) return;
    const bootstrapCollapseInDropdown = new bootstrap.Collapse(value);
    bootstrapCollapseInDropdown.hide();
  });
});

$('.define-button').on('click', function onClick() {
  if ($sourceEntryInput.val().length > 0) {
    window.open($(this).data('href').replace('{0}', encodeURIComponent(($sourceEntryInput.val().substring($sourceEntryInput.prop('selectionStart'), $sourceEntryInput.prop('selectionEnd')) || $sourceEntryInput.val()) /** .substring(0, 30) */ .trim())));
  }

  if (window.getSelection) {
    window.getSelection().removeAllRanges();
  } else if (document.selection) {
    document.selection.empty();
  }

  $sourceEntryInput.blur();
});

$('.translate-webpage-button').on('click', function onClick() {
  if ($sourceEntryInput.val().length > 0) {
    window.open($(this).data('href').replace('{0}', encodeURIComponent($sourceEntryInput.val().trimEnd())));
  }

  if (window.getSelection) {
    window.getSelection().removeAllRanges();
  } else if (document.selection) {
    document.selection.empty();
  }

  $sourceEntryInput.blur();
});

$('.upper-case-button').on('click', function onClick() {
  if ($targetEntryInput.val().length > 0) {
    let text = $targetEntryInput.val().toLowerCase();

    if ($(this).data('amount') !== '#') {
      for (let i = 0; i < $(this).data('amount'); i += 1) {
        text = text.replace(/(^| |\p{P})(\p{Ll})/u, (__, p1, p2) => p1 + p2.toUpperCase());
      }
    } else {
      text = text.replace(/(^| |\p{P})(\p{Ll})/gu, (__, p1, p2) => p1 + p2.toUpperCase());
    }

    $targetEntryInput.val(text);
  }
});

$translateEntryButtons.on('click', async function onClick() {
  const inputText = $sourceEntryInput.val();

  const translatorOption = $(this).data('translator');
  const targetLanguage = $(this).data('lang');

  if (inputText.length > 0) {
    $translateEntryButtons.addClass('disabled');
    $targetEntryInput.val(await translateText(inputText, translatorOption, targetLanguage, false));
    $translateEntryButtons.removeClass('disabled');
  }
});

$addButton.on('click', () => {
  if ($sourceEntryInput.val().length === 0) return;
  if (Object.prototype.hasOwnProperty.call(glossaryObject, $sourceEntryInput.val())) glossary.splice(Object.keys(glossaryObject).indexOf($sourceEntryInput.val()), 1);
  glossary.push([$sourceEntryInput.val().trim(), $targetEntryInput.val().trim(), $tagsetSelect.val()]);
  reloadGlossaryEntries();
  $glossaryEntrySelect.change();
  $glossaryInput.val(null);
});

$removeButton.on('click', () => {
  if (Object.prototype.hasOwnProperty.call(glossaryObject, $sourceEntryInput.val())) {
    if (window.confirm('Bạn có muốn xoá cụm từ này chứ?')) {
      glossary.splice(Object.keys(glossaryObject).indexOf($sourceEntryInput.val()), 1);
      reloadGlossaryEntries();
      $glossaryInput.val(null);
      $sourceEntryInput.trigger('input');
    }
  } else {
    $glossaryEntrySelect.val('').change();
  }
});

$glossaryEntrySelect.change(function onChange() {
  if (Object.prototype.hasOwnProperty.call(glossaryObject, $(this).val())) {
    $sourceEntryInput.val($(this).val()).trigger('input');
    $removeButton.removeClass('disabled');
  } else {
    $sourceEntryInput.val(null);
    $targetEntryInput.val(null);
    $tagsetSelect.val('X');
    $removeButton.addClass('disabled');
  }
});

$inputTextarea.on('input', () => {
  $(visualViewport).resize();
  updateInputTextLength();
});

$inputTextarea.on('keypress', (event) => !(event.shiftKey && event.key === 'Enter') || ($translateButton.click() && $resultTextarea.focus()));
$resultTextarea.on('keydown', (event) => event.ctrlKey || event.key === 'Enter' || event.key === 'Home' || event.key === 'End' || event.key === 'PageUp' || event.key === 'PageDown' || event.key === 'ArrowUp' || event.key === 'ArrowLeft' || event.key === 'ArrowDown' || event.key === 'ArrowRight' || event.preventDefault());
$resultTextarea.on('dragstart', (event) => event.preventDefault());
$resultTextarea.on('cut', (event) => event.preventDefault());
$resultTextarea.on('paste', (event) => event.preventDefault());
$resultTextarea.on('keypress', (event) => event.key !== 'Enter' || ($translateButton.click() && $inputTextarea.focus()));
