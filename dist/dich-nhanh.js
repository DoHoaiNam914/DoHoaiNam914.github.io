"use strict";

var _JSON$parse, _JSON$parse2;
/* global Translators, specialSinovietnameseData, newAccentData, Utils, MicrosoftTranslator, DeepLTranslate, GoogleTranslate, Papago, Vietphrase */
const $sourceLanguageSelect = $('#source-language-select');
const $targetLanguageSelect = $('#target-language-select');
const $translateButton = $('#translate-button');
const $copyButtons = $('.copy-button');
const $pasteButtons = $('.paste-button');
const $retranslateButton = $('#retranslate-button');
const $resetButton = $('#reset-button');
const $options = $('.option');
const $fontOptions = $('.font-option');
const $fontSizeRange = $('#font-size-range');
const $lineSpacingRange = $('#line-spacing-range');
const $alignmentSettingsSwitch = $('#alignment-settings-switch');
const $translatorOptions = $('.translator-option');
const $showOriginalTextSwitch = $('#show-original-text-switch');
const $vietphrasesInput = $('#vietphrases-input');
const $prioritizeNameOverVietphraseCheck = $('#prioritize-name-over-vietphrase-check');
const $translationAlgorithmRadio = $('.option[name="translation-algorithm-radio"]');
const $multiplicationAlgorithmRadio = $('.option[name="multiplication-algorithm-radio"]');
const $inputTextarea = $('#input-textarea');
const $resultTextarea = $('#result-textarea');
const $glossarySwitch = $('#glossary-switch');
const $glossaryInput = $('#glossary-input');
const $glossaryType = $('#glossary-type');
const $sourcePairInput = $('#source-pair-input');
const $targetPairInput = $('#target-pair-input');
const $addButton = $('#add-button');
const $removeButton = $('#remove-button');
const $glossaryDataList = $('#glossary-data-list');
const $glossaryName = $('#glossary-name');
const defaultOptions = JSON.parse('{"source_language":"","target_language":"vi","font":"Mặc định","font_size":100,"line_spacing":40,"alignment_settings":true,"translator":"microsoftTranslator","show_original_text":false,"ttvtranslate_mode":false,"translation_algorithm":"0","prioritize_name_over_vietphrase":false,"multiplication_algorithm":"2","glossary":true,"language_pairs":"zh-vi"}');
let quickTranslateStorage = (_JSON$parse = JSON.parse(localStorage.getItem('dich_nhanh'))) !== null && _JSON$parse !== void 0 ? _JSON$parse : {};
let glossary = (_JSON$parse2 = JSON.parse(localStorage.getItem('glossary'))) !== null && _JSON$parse2 !== void 0 ? _JSON$parse2 : {};
const vietphraseData = {
  pinyins: {},
  chinesePhienAmWords: {},
  vietphrases: {},
  pronouns: {},
  cacLuatnhan: {}
};
let glossaryData = '';
let translateAbortController = null;
let prevScrollTop = 0;
let lastSession = {};
const OptionTypes = {
  SELECT: 'select',
  CHECK: 'check',
  RADIO: 'radio',
  SWITCH: 'switch',
  RANGE: 'range',
  DROPDOWN: 'dropdown'
};
const GlossaryType = {
  TSV: 'text/tab-separated-values',
  CSV: 'text/csv',
  VIETPHRASE: 'text/plain'
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
    $options.each(index => {
      const option = $options.eq(index);
      const optionId = getOptionId(option.attr('name') != null ? option.attr('name') : option.attr('id'));
      const optionType = getOptionType(option.attr('name') != null ? option.attr('name') : option.attr('id'));
      switch (optionType) {
        case OptionTypes.RADIO:
          {
            if (option.prop('checked') === true) data[optionId] = option.val();
            break;
          }
        case OptionTypes.CHECK:
        case OptionTypes.SWITCH:
          {
            data[optionId] = option.prop('checked');
            break;
          }
        case OptionTypes.RANGE:
          {
            data[optionId] = parseInt(option.val(), 10);
            break;
          }
        case OptionTypes.DROPDOWN:
          {
            const selectedValue = option.find('.dropdown-menu > li > .active');
            switch (optionId) {
              case 'font':
                {
                  data.font = selectedValue.text().includes('Mặc định') ? selectedValue.text().match(/(.+) \(/)[1] : selectedValue.text();
                  break;
                }
              case 'translator':
                {
                  data.translator = selectedValue.data('id');
                  break;
                }
              // no default
            }

            break;
          }
        default:
          {
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
  $options.each(index => {
    const option = $options.eq(index);
    const optionId = getOptionId(option.attr('name') != null ? option.attr('name') : option.attr('id'));
    const optionType = getOptionType(option.attr('name') != null ? option.attr('name') : option.attr('id'));
    switch (optionType) {
      case OptionTypes.RADIO:
        {
          if (option.val() === quickTranslateStorage[optionId]) {
            $(".option[name=\"".concat(option.attr('name'), "\"]")).removeAttr('checked');
            option.attr('checked', true);
          }
          break;
        }
      case OptionTypes.CHECK:
      case OptionTypes.SWITCH:
        {
          option.attr('checked', quickTranslateStorage[optionId]).change();
          break;
        }
      case OptionTypes.RANGE:
        {
          option.val(quickTranslateStorage[optionId]).change();
          break;
        }
      case OptionTypes.DROPDOWN:
        {
          const values = option.find('.dropdown-menu > li > .dropdown-item');
          switch (optionId) {
            case 'font':
              {
                values.filter(":contains(".concat(quickTranslateStorage[optionId], ")")).click();
                break;
              }
            case 'translator':
              {
                values.filter("[data-id=\"".concat(quickTranslateStorage[optionId], "\"]")).click();
                break;
              }
            // no default
          }

          break;
        }
      default:
        {
          option.val(quickTranslateStorage[optionId]);
          break;
        }
    }
  });
}
function reloadGlossaryEntries() {
  const entrySelect = document.createElement('select');
  const defaultOption = document.createElement('option');
  defaultOption.innerText = 'Chọn...';
  defaultOption.value = '';
  entrySelect.appendChild(defaultOption);
  let glossaryEntries = Object.entries(glossary);
  const downloadButton = $('#download-button');
  const glossaryExtension = $('#glossary-extension');
  if (glossaryEntries.length > 0) {
    glossary = Object.fromEntries(glossaryEntries.sort((a, b) => /\p{Lu}/u.test(b[1][0]) - /\p{Lu}/u.test(a[1][0]) || a[0].startsWith(b[0]) || a[1].localeCompare(b[1], 'vi', {
      ignorePunctuation: true
    }) || a[0].localeCompare(b[0], 'vi', {
      ignorePunctuation: true
    }) || b[0].length - a[0].length));
    glossaryEntries = Object.entries(glossary);
    glossaryEntries.forEach(_ref => {
      let [first, second] = _ref;
      const option = document.createElement('option');
      option.innerText = "".concat(first, " \u2192 ").concat(second);
      option.value = first;
      entrySelect.appendChild(option);
    });
    switch ($glossaryType.val()) {
      case GlossaryType.CSV:
        {
          glossaryData = $.csv.fromArrays(glossaryEntries);
          glossaryExtension.text('csv');
          break;
        }
      case GlossaryType.VIETPHRASE:
        {
          glossaryData = glossaryEntries.map(element => (element.length > 2 ? element.splice(2, glossary.length - 2) : element).join('=')).join('\n');
          glossaryExtension.text('txt');
          break;
        }
      default:
        {
          glossaryData = glossaryEntries.map(element => (element.length > 2 ? element.splice(2, glossary.length - 2) : element).join('\t')).join('\n');
          glossaryExtension.text('tsv');
          break;
        }
    }
    downloadButton.attr('href', URL.createObjectURL(new Blob([glossaryData], {
      type: "".concat($glossaryType, ";charset=UTF-8")
    })));
    downloadButton.attr('download', "".concat($glossaryName.val().length > 0 ? $glossaryName.val() : $glossaryName.attr('placeholder'), ".").concat(glossaryExtension.text()));
    downloadButton.removeClass('disabled');
  } else {
    glossaryData = '';
    downloadButton.removeAttr('href');
    downloadButton.removeAttr('download');
    downloadButton.addClass('disabled');
  }
  $glossaryDataList.html(entrySelect.innerHTML);
  $glossaryDataList.val('');
  $('#glossary-counter').text(glossaryEntries.length);
  localStorage.setItem('glossary', JSON.stringify(glossary));
}
function getIgnoreTranslationMarkup(text, translation, translator) {
  switch (translator) {
    case Translators.DEEPL_TRANSLATE:
    case Translators.GOOGLE_TRANSLATE:
      {
        // case Translators.PAPAGO:
        return "<span translate=\"no\">".concat(Utils.convertTextToHtml(translation), "</span>");
      }
    case Translators.MICROSOFT_TRANSLATOR:
      {
        return "<mstrans:dictionary translation=\"".concat(/\p{sc=Hani}/u.test(text) && /\p{sc=Latn}/u.test(translation) ? " ".concat(translation, " ") : translation, "\">").concat(text, "</mstrans:dictionary>");
      }
    default:
      {
        return translation;
      }
  }
}
function applyGlossaryToText(text) {
  let translator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  const glossaryEntries = Object.entries(glossary).filter(_ref2 => {
    let [first] = _ref2;
    return text.includes(first);
  });
  let newText = text;
  if (glossaryEntries.length > 0) {
    const lines = text.split(/\n/);
    const results = [];
    const glossaryLengths = [...glossaryEntries.map(_ref3 => {
      let [first] = _ref3;
      return first.length;
    }), 1].sort((a, b) => b - a).filter((element, index, array) => element > 0 && index === array.indexOf(element));
    lines.forEach(a => {
      const chars = a;
      if (chars.length === 0) {
        results.push(chars);
      } else {
        let tempLine = '';
        let prevPhrase = '';
        let i = 0;
        chars.forEach(() => {
          glossaryLengths.some(b => {
            const phrase = translator === Translators.DEEPL_TRANSLATE || translator === Translators.GOOGLE_TRANSLATE ? Utils.convertHtmlToText(chars.substring(i, i + b)) : chars.substring(i, i + b);
            if (Object.prototype.hasOwnProperty.call(glossary, phrase)) {
              if (glossary[phrase].length > 0) {
                tempLine += (i > 0 && /[\p{Lu}\p{Ll}\p{Nd}]/u.test(prevPhrase || tempLine[tempLine.length - 1] || '') ? ' ' : '') + getIgnoreTranslationMarkup(phrase, glossary[phrase], translator);
                prevPhrase = glossary[phrase];
              }
              i += b - 1;
              return true;
            }
            if (b === 1) {
              tempLine += (i > 0 && /[\p{Lu}\p{Ll}\p{Nd}]/u.test(chars[i]) && /[\p{Lu}\p{Ll}\p{Nd}]/u.test(prevPhrase || '') ? ' ' : '') + (translator === Translators.DEEPL_TRANSLATE || translator === Translators.GOOGLE_TRANSLATE ? Utils.convertTextToHtml(chars[i]) : chars[i]);
              prevPhrase = '';
              return true;
            }
            return false;
          });
          i += 1;
        });
        results.push(tempLine);
      }
    });
    newText = results.join('\n');
  }
  return newText;
}
function getMaxQueryLengthAndLine(translator, text) {
  switch (translator) {
    case Translators.DEEPL_TRANSLATE:
      return [32768, 50];
    case Translators.GOOGLE_TRANSLATE:
      return [16272, 100];
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
    const inputLines = inputText.split(/\r?\n/).map(element => element.trim());
    const resultLines = result.split(/\r?\n/).map(element => element.trim());
    if ($showOriginalTextSwitch.prop('checked')) {
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
            if (resultLines[i].length !== inputLines[i + lostLineFixedNumber].length) {
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
      resultDiv.innerHTML = "<p>".concat(resultLines.map(Utils.convertTextToHtml).join('</p><p>'), "</p>");
    }
    return resultDiv.innerHTML.replace(/<p><\/p>/g, '<br>');
  } catch (error) {
    console.error('Lỗi hiển thị bản dịch:', error);
    throw error.toString();
  }
}
async function translateTextarea() {
  const startTime = Date.now();
  const inputText = $inputTextarea.val();
  const translatorOption = $translatorOptions.filter($('.active')).data('id');
  const sourceLanguage = $sourceLanguageSelect.val();
  const targetLanguage = $targetLanguageSelect.val();
  const languagePairs = $('#language-pairs-select').val();
  const glossaryLanguageSource = languagePairs.split('-')[0];
  const glossaryLanguageTarget = languagePairs.split('-')[1];
  const glossaryEnabled = $glossarySwitch.prop('checked');
  let processText = glossaryEnabled && (translatorOption === Translators.VIETPHRASE ? $prioritizeNameOverVietphraseCheck.prop('checked') && targetLanguage === 'vi' : sourceLanguage.split('-')[0].toLowerCase() === glossaryLanguageSource && targetLanguage.split('-')[0].toLowerCase() === glossaryLanguageTarget) ? applyGlossaryToText(inputText, translatorOption) : inputText;
  processText = glossaryEnabled && (translatorOption === Translators.DEEPL_TRANSLATE || translatorOption === Translators.GOOGLE_TRANSLATE) && sourceLanguage.split('-')[0].toLowerCase() === glossaryLanguageSource && targetLanguage.split('-')[0].toLowerCase() === glossaryLanguageTarget ? Utils.convertHtmlToText(processText) : processText;
  const [MAX_LENGTH, MAX_LINE] = getMaxQueryLengthAndLine(translatorOption, processText);
  if (processText.split(/\n/).sort((a, b) => b.length - a.length)[0].length > MAX_LENGTH) {
    throw console.error("S\u1ED1 l\u01B0\u1EE3ng t\u1EEB trong m\u1ED9t d\xF2ng qu\xE1 d\xE0i (S\u1ED1 l\u01B0\u1EE3ng t\u1EEB h\u1EE3p l\u1EC7 nh\u1ECF h\u01A1n ho\u1EB7c b\u1EB1ng ".concat(MAX_LENGTH, "). [L\u01B0u \xFD: Khi s\u1EED d\u1EE5ng Dynamic Dictionary v\xE0 B\u1EA3o v\u1EC7 d\u1EA5u tr\xEDch \u0111\u1EABn s\u1EBD l\xE0m gi\u1EA3m s\u1ED1 l\u01B0\u1EE3ng t\u1EEB c\xF3 th\u1EC3 d\u1ECBch \u0111i.]"));
  }
  try {
    let result = '';
    if (Object.keys(lastSession).length > 0 && lastSession.inputText === (glossaryEnabled && (translatorOption === Translators.VIETPHRASE ? targetLanguage === 'vi' : sourceLanguage.split('-')[0].toLowerCase() === glossaryLanguageSource && targetLanguage.split('-')[0].toLowerCase() === glossaryLanguageTarget) ? applyGlossaryToText(inputText) : inputText) && lastSession.translatorOption === translatorOption && lastSession.sourceLanguage === sourceLanguage && lastSession.targetLanguage === targetLanguage) {
      result = lastSession.result;
    } else {
      const results = [];
      let translator = null;
      switch (translatorOption) {
        case Translators.DEEPL_TRANSLATE:
          {
            translator = await new DeepLTranslate().init();
            break;
          }
        case Translators.GOOGLE_TRANSLATE:
          {
            translator = await new GoogleTranslate().init();
            break;
          }
        case Translators.PAPAGO:
          {
            translator = await new Papago().init();
            break;
          }
        case Translators.VIETPHRASE:
          {
            translator = await new Vietphrase(vietphraseData, $translationAlgorithmRadio.filter('[checked]').val(), $multiplicationAlgorithmRadio.filter('[checked]').val(), $('#ttvtranslate-mode-switch').prop('checked'), glossaryEnabled && targetLanguage === 'vi', glossary, $prioritizeNameOverVietphraseCheck.prop('checked'), true);
            break;
          }
        default:
          {
            translator = await new MicrosoftTranslator().init();
            break;
          }
      }
      if (translatorOption === Translators.DEEPL_TRANSLATE && translator.usage.character_count + inputText.length > translator.usage.character_limit) throw console.error("L\u1ED7i DeepL Translator: \u0110\xE3 \u0111\u1EA1t \u0111\u1EBFn gi\u1EDBi h\u1EA1n d\u1ECBch c\u1EE7a t\xE0i kho\u1EA3n. (".concat(translator.usage.character_count, "/").concat(translator.usage.character_limit, " k\xFD t\u1EF1)."));
      if (processText.split(/\r?\n/).length <= MAX_LINE && processText.length <= MAX_LENGTH) {
        result = await translator.translateText(sourceLanguage, targetLanguage, processText);
      } else {
        const inputLines = processText.split(/\r?\n/);
        let queryLines = [];
        while (inputLines.length > 0 && queryLines.length + 1 <= MAX_LINE && [...queryLines, inputLines[0]].join('\n').length <= MAX_LENGTH) {
          if (translateAbortController.signal.aborted) break;
          queryLines.push(inputLines.shift());
          if (inputLines.length === 0 || queryLines.length + 1 >= MAX_LINE || [...queryLines, inputLines[0]].join('\n').length >= MAX_LENGTH) {
            results.push(await translator.translateText(sourceLanguage, targetLanguage, queryLines.join('\n')));
            queryLines = [];
          }
        }
        result = results.join('\n');
      }
      $('#translate-timer').text(Date.now() - startTime);
      lastSession.inputText = (glossaryEnabled && translatorOption === Translators.VIETPHRASE ? targetLanguage === 'vi' : sourceLanguage.split('-')[0].toLowerCase() === glossaryLanguageSource && targetLanguage.split('-')[0].toLowerCase() === glossaryLanguageTarget) ? applyGlossaryToText(inputText) : inputText;
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
    paragraph.innerText = "B\u1EA3n d\u1ECBch th\u1EA5t b\u1EA1i: ".concat(error);
    $resultTextarea.html(paragraph);
    lastSession = {};
  }
}
function getSelectedTextOrActiveElementText() {
  return window.getSelection().toString() || (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT' && /^(?:email|month|number|search|tel|text|url|week)$/i.test(document.activeElement.type)) && typeof document.activeElement.selectionStart === 'number' && document.activeElement.value.slice(document.activeElement.selectionStart, document.activeElement.selectionEnd) || '';
}
function getSourceLanguageSelectOptions(translator) {
  const sourceLanguageSelect = document.createElement('select');
  switch (translator) {
    case Translators.DEEPL_TRANSLATE:
      {
        DeepLTranslate.SOURCE_LANGUAGES.forEach(_ref4 => {
          let {
            language
          } = _ref4;
          const option = document.createElement('option');
          option.innerText = DeepLTranslate.getSourceLangName(language);
          option.value = language;
          sourceLanguageSelect.appendChild(option);
        });
        break;
      }
    case Translators.GOOGLE_TRANSLATE:
      {
        Object.entries(GoogleTranslate.SOURCE_LANGUAGES).forEach(_ref5 => {
          let [languageCode] = _ref5;
          const option = document.createElement('option');
          option.innerText = GoogleTranslate.getSlName(languageCode);
          option.value = languageCode;
          sourceLanguageSelect.appendChild(option);
        });
        break;
      }
    case Translators.PAPAGO:
      {
        Object.entries(Papago.SOURCE_LANGUAGES).forEach(_ref6 => {
          let [languageCode] = _ref6;
          const option = document.createElement('option');
          option.innerText = Papago.getSourceName(languageCode);
          option.value = languageCode;
          sourceLanguageSelect.appendChild(option);
        });
        break;
      }
    case Translators.VIETPHRASE:
      {
        Object.entries(Vietphrase.SOURCE_LANGUAGES).forEach(_ref7 => {
          let [languageCode] = _ref7;
          const option = document.createElement('option');
          option.innerText = Vietphrase.getSourceLanguageName(languageCode);
          option.value = languageCode;
          sourceLanguageSelect.appendChild(option);
        });
        break;
      }
    default:
      {
        Object.entries(MicrosoftTranslator.FROM_LANGUAGES).forEach(_ref8 => {
          let [languageCode] = _ref8;
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
    case Translators.DEEPL_TRANSLATE:
      {
        DeepLTranslate.TARGET_LANGUAGES.forEach(_ref9 => {
          let {
            language
          } = _ref9;
          const option = document.createElement('option');
          option.innerText = DeepLTranslate.getTargetLangName(language);
          option.value = language;
          targetLanguageSelect.appendChild(option);
        });
        break;
      }
    case Translators.GOOGLE_TRANSLATE:
      {
        Object.entries(GoogleTranslate.TARGET_LANGUAGES).forEach(_ref10 => {
          let [languageCode] = _ref10;
          const option = document.createElement('option');
          option.innerText = GoogleTranslate.getTlName(languageCode);
          option.value = languageCode;
          targetLanguageSelect.appendChild(option);
        });
        break;
      }
    case Translators.PAPAGO:
      {
        Object.entries(Papago.TARGET_LANGUAGES).forEach(_ref11 => {
          let [languageCode] = _ref11;
          const option = document.createElement('option');
          option.innerText = Papago.getTargetName(languageCode);
          option.value = languageCode;
          targetLanguageSelect.appendChild(option);
        });
        break;
      }
    case Translators.VIETPHRASE:
      {
        Object.entries(Vietphrase.TARGET_LANGUAGES).forEach(_ref12 => {
          let [languageCode] = _ref12;
          const option = document.createElement('option');
          option.innerText = Vietphrase.getTargetLanguageName(languageCode);
          option.value = languageCode;
          targetLanguageSelect.appendChild(option);
        });
        break;
      }
    default:
      {
        Object.entries(MicrosoftTranslator.TO_LANGUAGES).forEach(_ref13 => {
          let [languageCode] = _ref13;
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
      case Translators.DEEPL_TRANSLATE:
        {
          var _DeepLTranslate$getMa, _DeepLTranslate$getMa2;
          sourceLanguage = (_DeepLTranslate$getMa = DeepLTranslate.getMappedSourceLanguageCode(translator, sourceLanguage)) !== null && _DeepLTranslate$getMa !== void 0 ? _DeepLTranslate$getMa : sourceLanguage;
          targetLanguage = (_DeepLTranslate$getMa2 = DeepLTranslate.getMappedTargetLanguageCode(translator, targetLanguage)) !== null && _DeepLTranslate$getMa2 !== void 0 ? _DeepLTranslate$getMa2 : targetLanguage;
          break;
        }
      case Translators.GOOGLE_TRANSLATE:
        {
          var _GoogleTranslate$getM, _GoogleTranslate$getM2;
          sourceLanguage = (_GoogleTranslate$getM = GoogleTranslate.getMappedSourceLanguageCode(translator, sourceLanguage)) !== null && _GoogleTranslate$getM !== void 0 ? _GoogleTranslate$getM : sourceLanguage;
          targetLanguage = (_GoogleTranslate$getM2 = GoogleTranslate.getMappedTargetLanguageCode(translator, targetLanguage)) !== null && _GoogleTranslate$getM2 !== void 0 ? _GoogleTranslate$getM2 : targetLanguage;
          break;
        }
      case Translators.PAPAGO:
        {
          var _Papago$getMappedSour, _Papago$getMappedTarg;
          sourceLanguage = (_Papago$getMappedSour = Papago.getMappedSourceLanguageCode(translator, sourceLanguage)) !== null && _Papago$getMappedSour !== void 0 ? _Papago$getMappedSour : sourceLanguage;
          targetLanguage = (_Papago$getMappedTarg = Papago.getMappedTargetLanguageCode(translator, targetLanguage)) !== null && _Papago$getMappedTarg !== void 0 ? _Papago$getMappedTarg : targetLanguage;
          break;
        }
      case Translators.VIETPHRASE:
        {
          sourceLanguage = Vietphrase.getMappedSourceLanguageCode(translator);
          targetLanguage = Vietphrase.getMappedTargetLanguageCode(translator);
          break;
        }
      default:
        {
          var _MicrosoftTranslator$, _MicrosoftTranslator$2;
          sourceLanguage = (_MicrosoftTranslator$ = MicrosoftTranslator.getMappedSourceLanguageCode(translator, sourceLanguage)) !== null && _MicrosoftTranslator$ !== void 0 ? _MicrosoftTranslator$ : sourceLanguage;
          targetLanguage = (_MicrosoftTranslator$2 = MicrosoftTranslator.getMappedTargetLanguageCode(translator, targetLanguage)) !== null && _MicrosoftTranslator$2 !== void 0 ? _MicrosoftTranslator$2 : targetLanguage;
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
    const text = translatorOption === Translators.VIETPHRASE && $prioritizeNameOverVietphraseCheck.prop('checked') ? applyGlossaryToText(inputText, translatorOption) : inputText;
    let translator = null;
    let sourceLanguage = '';
    switch (translatorOption) {
      case Translators.DEEPL_TRANSLATE:
        {
          translator = await new DeepLTranslate().init();
          sourceLanguage = DeepLTranslate.DETECT_LANGUAGE;
          break;
        }
      case Translators.GOOGLE_TRANSLATE:
        {
          translator = await new GoogleTranslate().init();
          sourceLanguage = GoogleTranslate.DETECT_LANGUAGE;
          break;
        }
      case Translators.PAPAGO:
        {
          translator = await new Papago().init();
          sourceLanguage = Papago.DETECT_LANGUAGE;
          break;
        }
      case Translators.VIETPHRASE:
        {
          translator = await new Vietphrase(vietphraseData, $translationAlgorithmRadio.filter('[checked]').val(), $multiplicationAlgorithmRadio.filter('[checked]').val(), $('#ttvtranslate-mode-switch').prop('checked'), glossaryEnabled, glossary, $prioritizeNameOverVietphraseCheck.prop('checked'));
          sourceLanguage = Vietphrase.DefaultLanguage.SOURCE_LANGUAGE;
          break;
        }
      default:
        {
          translator = await new MicrosoftTranslator().init();
          sourceLanguage = MicrosoftTranslator.AUTODETECT;
          break;
        }
    }
    if (translatorOption === Translators.DEEPL_TRANSLATE && translator.usage.character_count + text.length > translator.usage.character_limit) throw console.error("L\u1ED7i DeepL Translator: \u0110\xE3 \u0111\u1EA1t \u0111\u1EBFn gi\u1EDBi h\u1EA1n d\u1ECBch c\u1EE7a t\xE0i kho\u1EA3n. (".concat(translator.usage.character_count, "/").concat(translator.usage.character_limit, " k\xFD t\u1EF1)."));
    return await translator.translateText(sourceLanguage, targetLanguage, text);
  } catch (error) {
    console.error(error);
    return "B\u1EA3n d\u1ECBch th\u1EA5t b\u1EA1i: ".concat(error);
  }
}
$(document).ready(async () => {
  loadAllQuickTranslatorOptions();
  reloadGlossaryEntries();
  try {
    let pinyinList = [];
    await $.ajax({
      method: 'GET',
      url: '/static/datasource/Unihan_Readings.txt'
    }).done(data => {
      pinyinList = data.split(/\r?\n/).filter(element => element.startsWith('U+')).map(element => element.substring(2).split(/\t/)).map(_ref14 => {
        let [first, second] = _ref14;
        return [String.fromCodePoint(parseInt(first, 16)), second];
      });
      vietphraseData.pinyins = Object.fromEntries(pinyinList);
    });
    await $.ajax({
      method: 'GET',
      url: '/static/datasource/Bính âm.txt'
    }).done(data => pinyinList === [...pinyinList, ...data.split(/\r?\n/).map(element => element.split('=')).sort((a, b) => b[0].length - a[0].length).map(_ref15 => {
      let [first, second] = _ref15;
      return [first, second.split('ǀ')[0]];
    }).filter(_ref16 => {
      let [first] = _ref16;
      return !Object.prototype.hasOwnProperty.call(vietphraseData.pinyins, first);
    })]);
    pinyinList = pinyinList.filter((_ref17, index, array) => {
      let [first, second] = _ref17;
      return first !== '' && second != null && !array[first] && (array[first] = 1);
    }, {});
    vietphraseData.pinyins = Object.fromEntries(pinyinList);
    console.log('Đã tải xong bộ dữ liệu bính âm (%d)!', pinyinList.length);
    lastSession = {};
  } catch (error) {
    console.error('Không thể tải bộ dữ liệu bính âm:', error);
    setTimeout(window.location.reload, 5000);
  }
  try {
    let chinesePhienAmWordList = [...specialSinovietnameseData.map(_ref18 => {
      var _ref19, _Object$fromEntries$b;
      let [a, b, c] = _ref18;
      return [a, ((_ref19 = (_Object$fromEntries$b = Object.fromEntries(specialSinovietnameseData.filter(_ref20 => {
        let [, d] = _ref20;
        return !/\p{sc=Hani}/u.test(d);
      }).map(_ref21 => {
        let [d, e, f] = _ref21;
        return [d, f !== null && f !== void 0 ? f : e];
      }))[b]) !== null && _Object$fromEntries$b !== void 0 ? _Object$fromEntries$b : c) !== null && _ref19 !== void 0 ? _ref19 : b).split(', ')[0].toLowerCase()];
    }), ...window.hanData.names.map(_ref22 => {
      let [first, second] = _ref22;
      return [first, second.split(',').filter(element => element.length > 0)[0]];
    })];
    await $.ajax({
      method: 'GET',
      url: '/static/datasource/ChinesePhienAmWords của thtgiang.txt'
    }).done(data => {
      chinesePhienAmWordList = [...chinesePhienAmWordList, ...data.split(/\r?\n/).map(element => element.split('=')).filter(_ref23 => {
        let [first] = _ref23;
        return !Object.prototype.hasOwnProperty.call(vietphraseData.chinesePhienAmWords, first);
      })];
      vietphraseData.chinesePhienAmWords = Object.fromEntries(chinesePhienAmWordList);
    });
    await $.ajax({
      method: 'GET',
      url: '/static/datasource/TTV Translate.ChinesePhienAmWords.txt'
    }).done(data => {
      chinesePhienAmWordList = [...chinesePhienAmWordList, ...data.split(/\r?\n/).map(element => element.split('=')).filter(_ref24 => {
        let [first] = _ref24;
        return !Object.prototype.hasOwnProperty.call(vietphraseData.chinesePhienAmWords, first);
      })];
      vietphraseData.chinesePhienAmWords = Object.fromEntries(chinesePhienAmWordList);
    });
    await $.ajax({
      method: 'GET',
      url: '/static/datasource/QuickTranslate2020 - ChinesePhienAmWords.txt'
    }).done(data => {
      chinesePhienAmWordList = [...chinesePhienAmWordList, ...data.split(/\r?\n/).map(element => element.split('=')).filter(_ref25 => {
        let [first] = _ref25;
        return !Object.prototype.hasOwnProperty.call(vietphraseData.chinesePhienAmWords, first);
      })];
      vietphraseData.chinesePhienAmWords = Object.fromEntries(chinesePhienAmWordList);
    });
    await $.ajax({
      method: 'GET',
      url: '/static/datasource/Hán việt.txt'
    }).done(data => chinesePhienAmWordList === [...chinesePhienAmWordList, ...data.split(/\r?\n/).map(element => element.split('=')).sort((a, b) => b[0].length - a[0].length).map(_ref26 => {
      let [first, second] = _ref26;
      return [first, second.split('ǀ')[0]];
    }).filter(_ref27 => {
      let [first] = _ref27;
      return !Object.prototype.hasOwnProperty.call(vietphraseData.chinesePhienAmWords, first);
    })]);
    chinesePhienAmWordList = chinesePhienAmWordList.filter((_ref28, index, array) => {
      let [first, second] = _ref28;
      return first !== '' && !/\p{sc=Latin}/u.test(first) && second != null && !array[first] && (array[first] = 1);
    }, {});
    newAccentData.forEach(_ref29 => {
      let [a, b] = _ref29;
      return chinesePhienAmWordList === chinesePhienAmWordList.map(_ref30 => {
        let [c, d] = _ref30;
        return [c, d.replace(new RegExp(a, 'gi'), b)];
      });
    });
    vietphraseData.chinesePhienAmWords = Object.fromEntries(chinesePhienAmWordList);
    console.log('Đã tải xong bộ dữ liệu hán việt (%d)!', chinesePhienAmWordList.length);
    lastSession = {};
  } catch (error) {
    console.error('Không thể tải bộ dữ liệu hán việt:', error);
    setTimeout(window.location.reload, 5000);
  }
  await $.ajax({
    method: 'GET',
    url: '/static/datasource/Pronouns.txt'
  }).done(data => {
    vietphraseData.pronouns = Object.fromEntries(data.split(/\r?\n/).map(element => element.split('=')).filter(element => element.length === 2).map(_ref31 => {
      let [first, second] = _ref31;
      return [first, second.split('/')[0]];
    }));
    console.log('Đã tải xong tệp Pronouns.txt (%d)!', Object.entries(vietphraseData.pronouns).length);
    lastSession = {};
  }).fail((jqXHR, textStatus, errorThrown) => {
    console.error('Không tải được tệp Pronouns.txt:', errorThrown);
    setTimeout(window.location.reload, 5000);
  });
  await $.ajax({
    method: 'GET',
    url: '/static/datasource/LuatNhan.txt'
  }).done(data => {
    vietphraseData.cacLuatnhan = Object.fromEntries(data.split(/\r?\n/).map(element => element.split('=')).filter(element => element.length === 2));
    console.log('Đã tải xong tệp LuatNhan.txt (%d)!', Object.entries(vietphraseData.cacLuatnhan).length);
    lastSession = {};
  }).fail((jqXHR, textStatus, errorThrown) => {
    console.error('Không tải được tệp LuatNhan.txt:', errorThrown);
    setTimeout(window.location.reload, 5000);
  });
  if (Object.entries(vietphraseData.vietphrases).length === 0) {
    await $.ajax({
      method: 'GET',
      url: '/static/datasource/VietPhrase.txt'
    }).done(data => {
      let vietphraseList = [...data.split(/\r?\n/).map(element => element.split('=')).filter(element => element.length === 2).map(_ref32 => {
        let [first, second] = _ref32;
        return [first, second.split('/')[0].split('|')[0]];
      }), ...Object.entries(vietphraseData.chinesePhienAmWords)];
      vietphraseList = vietphraseList.filter((_ref33, index, array) => {
        let [first, second] = _ref33;
        return first !== '' && second != null && !array[first] && (array[first] = 1);
      }, {});
      if ($vietphrasesInput.prop('files') == null) return;
      vietphraseData.vietphrases = Object.fromEntries(vietphraseList);
      console.log('Đã tải xong tệp VietPhrase.txt (%d)!', vietphraseList.length);
      lastSession = {};
    }).fail((jqXHR, textStatus, errorThrown) => {
      console.error('Không tải được tệp VietPhrase.txt:', errorThrown);
    });
  }
  $inputTextarea.trigger('input');
});
$(window).on('keydown', event => {
  if ($(document.activeElement).is('body') && $resultTextarea.is(':visible')) {
    switch (event.key) {
      case 'Home':
        {
          $resultTextarea.prop('scrollTop', 0);
          break;
        }
      case 'End':
        {
          $resultTextarea.prop('scrollTop', $resultTextarea.prop('scrollTopMax'));
          break;
        }
      // no default
    }
  }
});

$(visualViewport).resize(event => $('.textarea').css('max-height', "".concat(event.target.height - (event.target.width < 1200 ? 23.28703703703703 : 40.33092037228542) / 100 * event.target.height, "px")));
$translateButton.on('click', function () {
  if (translateAbortController != null) {
    translateAbortController.abort();
    translateAbortController = null;
  }
  const copyButton = $('#action-navbar .copy-button');
  switch ($(this).text()) {
    case 'Huỷ':
    case 'Sửa':
      {
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
    default:
      {
        if ($inputTextarea.val().length === 0) break;
        copyButton.addClass('disabled');
        $('#action-navbar .paste-button').addClass('disabled');
        $resultTextarea.html($resultTextarea.html().split(/<br>|<\/p><p>/).map((element, index) => index === 0 ? "\u0110ang d\u1ECBch...".concat(element.slice(12).replace(/./g, ' ')) : element.replace(/./g, ' ')).join('<br>'));
        $inputTextarea.hide();
        $resultTextarea.show();
        $(this).text('Huỷ');
        translateAbortController = new AbortController();
        translateTextarea()["finally"](() => {
          $resultTextarea.css('height', 'auto');
          $resultTextarea.css('height', "".concat($resultTextarea.prop('scrollHeight'), "px"));
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

$copyButtons.on('click', async function () {
  if ($(this).data('target') === '#result-textarea') {
    if (Object.keys(lastSession).length > 0) {
      await navigator.clipboard.writeText(lastSession.result);
    }
    return;
  }
  if ($(this).data('target') === '#glossary-data-list') {
    if (glossaryData.length > 0) {
      await navigator.clipboard.writeText(glossaryData);
    }
    return;
  }
  const target = $($(this).data('target'));
  if (target.val().length > 0) {
    await navigator.clipboard.writeText(target.val());
    target.blur();
  }
});
$pasteButtons.on('click', async function () {
  await navigator.clipboard.readText().then(clipText => {
    if ($(this).data('target') === '#input-textarea') {
      $resultTextarea.prop('scrollTop', 0);
      $($(this).data('target')).val(clipText).trigger('input');
      $retranslateButton.click();
    } else {
      $($(this).data('target')).val(clipText).trigger('input');
    }
  });
});
$retranslateButton.click(function () {
  if (!$(this).hasClass('disabled')) {
    prevScrollTop = $resultTextarea.prop('scrollTop');
    $translateButton.text('Dịch').click();
  }
});
$('#glossary-management-button').on('mousedown', () => {
  $glossaryDataList.val('').change();
  $sourcePairInput.val(getSelectedTextOrActiveElementText()).trigger('input');
});
$options.change(function () {
  const optionId = getOptionId($(this).attr('name') != null ? $(this).attr('name') : $(this).attr('id'));
  const optionType = getOptionType($(this).attr('name') != null ? $(this).attr('name') : $(this).attr('id'));
  if (optionType !== OptionTypes.SELECT && optionType !== OptionTypes.CHECK && optionType !== OptionTypes.RADIO && optionType !== OptionTypes.SWITCH) return;
  if (optionType === OptionTypes.RADIO) {
    $options.filter("[name=\"".concat($(this).attr('name'), "\"]")).removeAttr('checked');
    $(this).attr('checked', true);
  }
  if (optionType === OptionTypes.CHECK || optionType === OptionTypes.SWITCH) {
    quickTranslateStorage[optionId] = $(this).prop('checked');
  } else {
    quickTranslateStorage[optionId] = $(this).val();
  }
  localStorage.setItem('dich_nhanh', JSON.stringify(quickTranslateStorage));
  if ($(this).hasClass('quick-translate-option')) {
    lastSession = {};
    $retranslateButton.click();
  }
});
$fontOptions.click(function () {
  $fontOptions.removeClass('active');
  $(this).addClass('active');
  if (!$(this).text().includes('Mặc định')) {
    $(document.body).css('--opt-font-family', "".concat($(this).text().includes(' ') ? "'".concat($(this).text(), "'") : $(this).text(), ", ").concat($(this).data('additional-fonts') != null && $(this).data('additional-fonts').length > 0 ? "".concat($(this).text().includes(' ') ? "'".concat($(this).data('additional-fonts'), "'") : $(this).data('additional-fonts'), ", serif") : 'serif'));
  } else if ($(this).text() === 'Phông chữ hệ thống') {
    $(document.body).css('--opt-font-family', 'var(--system-font-family)');
  } else {
    $(document.body).css('--opt-font-family', 'Georgia, serif');
  }
  quickTranslateStorage.font = $(this).text().includes('Mặc định') ? $(this).text().match(/(.+) \(/)[1] : $(this).text();
  localStorage.setItem('dich_nhanh', JSON.stringify(quickTranslateStorage));
});
$fontSizeRange.on('input', function () {
  $('#font-size-display').val(parseInt($(this).val(), 10));
  $(document.body).css('--opt-font-size', "".concat(parseInt($(this).val(), 10) / 100, "rem"));
  quickTranslateStorage[getOptionId($(this).attr('id'))] = parseInt($(this).val(), 10);
});
$('#font-size-display').on('change', function () {
  const maybeValueIsBiggerThanMaxValue = $(this).val() > parseInt($fontSizeRange.attr('max'), 10) ? $fontSizeRange.attr('max') : $(this).val();
  $fontSizeRange.val($(this).val() < parseInt($fontSizeRange.attr('min'), 10) ? $fontSizeRange.attr('min') : maybeValueIsBiggerThanMaxValue).change();
});
$fontSizeRange.change(function () {
  $(this).trigger('input');
  localStorage.setItem('dich_nhanh', JSON.stringify(quickTranslateStorage));
});
$lineSpacingRange.on('input', function () {
  $('#line-spacing-display').val(parseInt($(this).val(), 10));
  $(document.body).css('--opt-line-height', "".concat(1 + 0.5 * parseInt($(this).val(), 10) / 100, "em"));
  quickTranslateStorage[getOptionId($(this).attr('id'))] = parseInt($(this).val(), 10);
});
$('#line-spacing-display').on('change', function () {
  const maybeValueIsBiggerThanMaxValue = $(this).val() > parseInt($lineSpacingRange.attr('max'), 10) ? $lineSpacingRange.attr('max') : $(this).val();
  $lineSpacingRange.val($(this).val() < parseInt($lineSpacingRange.attr('min'), 10) ? $lineSpacingRange.attr('min') : maybeValueIsBiggerThanMaxValue).change();
});
$lineSpacingRange.change(function () {
  $(this).trigger('input');
  localStorage.setItem('dich_nhanh', JSON.stringify(quickTranslateStorage));
});
$alignmentSettingsSwitch.change(function () {
  $(document.body).css('--opt-text-align', $(this).prop('checked') ? 'justify' : 'start');
  quickTranslateStorage[getOptionId($(this).attr('id'))] = $(this).prop('checked');
  localStorage.setItem('dich_nhanh', JSON.stringify(quickTranslateStorage));
});
$translatorOptions.click(function () {
  $translatorOptions.removeClass('active');
  $(this).addClass('active');
  updateLanguageSelect($(this).data('id'), quickTranslateStorage.translator);
  quickTranslateStorage.translator = $(this).data('id');
  localStorage.setItem('dich_nhanh', JSON.stringify(quickTranslateStorage));
  $retranslateButton.click();
});
$vietphrasesInput.on('change', function () {
  const reader = new FileReader();
  reader.onload = function () {
    let vietphraseList = this.result.split(/\r?\n/).map(element => element.split($vietphrasesInput.prop('files')[0].type === 'text/tab-separated-values' ? '\t' : '=')).filter(element => element.length === 2).map(_ref34 => {
      let [first, second] = _ref34;
      return [first, second.split('/')[0].split('|')[0]];
    });
    vietphraseList = [...vietphraseList, ...Object.entries(vietphraseData.chinesePhienAmWords)].filter((_ref35, index, array) => {
      let [first, second] = _ref35;
      return first !== '' && second != null && !array[first] && (array[first] = 1);
    }, {});
    vietphraseData.vietphrases = Object.fromEntries(vietphraseList);
    console.log('Đã tải xong tệp VietPhrase.txt (%d)!', vietphraseList.length);
    lastSession = {};
  };
  reader.readAsText($(this).prop('files')[0]);
});
$prioritizeNameOverVietphraseCheck.change(function () {
  quickTranslateStorage[getOptionId($(this).attr('id'))] = $(this).prop('checked');
  localStorage.setItem('dich_nhanh', JSON.stringify(quickTranslateStorage));
  $retranslateButton.click();
});
$resetButton.on('click', () => {
  if (!window.confirm('Bạn có muốn đặt lại tất cả thiết lập chứ?')) return;
  localStorage.setItem('dich_nhanh', JSON.stringify(defaultOptions));
  if (window.confirm('Bạn có muốn tải lại trang ngay chứ?')) window.location.reload();
});
$glossaryInput.on('change', function () {
  const reader = new FileReader();
  reader.onload = function () {
    switch ($glossaryInput.prop('files')[0].type) {
      case GlossaryType.CSV:
        {
          glossary = $.csv.toObjects(this.result);
          $glossaryType.val(GlossaryType.CSV);
          break;
        }
      case GlossaryType.VIETPHRASE:
        {
          glossary = Object.fromEntries(this.result.split(/\r?\n/).map(phrase => phrase.split('=')).filter(phrase => phrase.length >= 2));
          $glossaryType.val(GlossaryType.VIETPHRASE);
          break;
        }
      default:
        {
          glossary = Object.fromEntries(this.result.split(/\r?\n/).map(phrase => phrase.split(/\t/)).filter(phrase => phrase.length >= 2));
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
  glossary = {};
  $glossaryName.val(null);
  reloadGlossaryEntries();
  $glossaryInput.val('');
});
$glossaryType.on('change', () => reloadGlossaryEntries());
$sourcePairInput.on('input', async function () {
  const inputText = $(this).val();
  if (inputText.length > 0) {
    if (Object.prototype.hasOwnProperty.call(glossary, inputText)) {
      $targetPairInput.val(applyGlossaryToText(inputText));
      $glossaryDataList.val(inputText);
    } else {
      $targetPairInput.val(/\p{sc=Hani}/u.test(inputText) ? await translateText(inputText, Translators.VIETPHRASE, 'sinoVietnamese', true) : inputText);
      $glossaryDataList.val('');
    }
    $addButton.removeClass('disabled');
    $removeButton.removeClass('disabled');
  } else {
    $glossaryDataList.val('').change();
    $addButton.addClass('disabled');
    $removeButton.addClass('disabled');
  }
});
$('.dropdown-toggle').on('click', () => $('.dropdown-scroller').prop('scrollTop', 0));
$('#source-pair-dropdown').on('mousedown', event => event.preventDefault());
$('.define-button').on('click', function () {
  if ($sourcePairInput.val().length > 0) {
    window.open($(this).data('href').replace('{0}', encodeURIComponent(($sourcePairInput.val().substring($sourcePairInput.prop('selectionStart'), $sourcePairInput.prop('selectionEnd')) || $sourcePairInput.val()).substring(0, 30).trim())));
    $sourcePairInput.blur();
  }
});
$('.translate-webpage-button').on('click', function () {
  if ($sourcePairInput.val().length > 0) {
    window.open($(this).data('href').replace('{0}', encodeURIComponent($sourcePairInput.val().trimEnd())));
    $sourcePairInput.blur();
  }
});
$('.upper-case-button').on('click', function () {
  if ($targetPairInput.val().length > 0) {
    $targetPairInput.val($targetPairInput.val().split(' ').map((element, index) => {
      const maybeIndexIsSmallerThanAmount = index < $(this).data('amount') ? element.charAt(0).toUpperCase() + element.slice(1) : element.toLowerCase();
      return element === $(this).data('amount') === '#' ? element.charAt(0).toUpperCase() + element.slice(1) : maybeIndexIsSmallerThanAmount;
    }).join(' '));
  }
});
$('.translate-button').on('click', async function () {
  const inputText = $sourcePairInput.val();
  const translatorOption = $(this).data('translator');
  const targetLanguage = $(this).data('lang');
  if (inputText.length > 0) {
    $targetPairInput.val(await translateText(inputText, translatorOption, targetLanguage, false));
  }
});
$addButton.on('click', () => {
  glossary[$sourcePairInput.val().trim()] = $targetPairInput.val().trim();
  reloadGlossaryEntries();
  $glossaryDataList.change();
  $glossaryInput.val(null);
});
$removeButton.on('click', () => {
  if (Object.prototype.hasOwnProperty.call(glossary, $sourcePairInput.val())) {
    if (window.confirm('Bạn có muốn xoá cụm từ này chứ?')) {
      delete glossary[$sourcePairInput.val()];
      reloadGlossaryEntries();
      $glossaryInput.val(null);
      $sourcePairInput.trigger('input');
    }
  } else {
    $glossaryDataList.val('').change();
  }
});
$glossaryDataList.change(function () {
  if (Object.prototype.hasOwnProperty.call(glossary, $(this).val())) {
    $sourcePairInput.val($(this).val()).trigger('input');
    $removeButton.removeClass('disabled');
  } else {
    $sourcePairInput.val(null);
    $targetPairInput.val(null);
    $removeButton.addClass('disabled');
  }
});
$inputTextarea.on('input', function () {
  $(this).css('height', 'auto');
  $(this).css('height', "".concat($(this).prop('scrollHeight'), "px"));
  $(visualViewport).resize();
  $('#input-textarea-counter').text($(this).val().length);
});
$inputTextarea.on('keypress', event => {
  if (event.shiftKey && event.key === 'Enter') $translateButton.click();
});
$resultTextarea.on('dblclick', () => {
  $translateButton.click();
  $inputTextarea.focus();
});
//# sourceMappingURL=dich-nhanh.js.map