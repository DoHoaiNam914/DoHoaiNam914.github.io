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

const $glossaryManagerButton = $('#glossary-manager-button');

const $themeOptions = $('.theme-option');
const $fontOptions = $('.font-option');
const $fontSizeRange = $('#font-size-range');
const $lineSpacingRange = $('#line-spacing-range');
const $alignmentSettingsSwitch = $('#alignment-settings-switch');
const $formatSettingsSwitch = $('#format-settings-switch');
const $translatorOptions = $('.translator-option');
const $showOriginalTextSwitch = $('#show-original-text-switch');
const $loadDefaultVietPhraseFileSwitch = $('#load-default-viet-phrase-file-switch');
const $vietPhraseInput = $('#viet-phrase-input');
const $addDeLeZhaoSwitch = $('#add-de-le-zhao-switch');
const $prioritizeNameOverVietPhraseCheck = $('#prioritize-name-over-viet-phrase-check');
const $translationAlgorithmRadio = $('.option[name="translation-algorithm-radio"]');
const $luatNhanInput = $('#luat-nhan-input');
const $pronounInput = $('#pronoun-input');
const $multiplicationAlgorithmRadio = $('.option[name="multiplication-algorithm-radio"]');

const $resetButton = $('#reset-button');

const $glossarySwitch = $('#glossary-switch');
const $glossaryInput = $('#glossary-input');
const $glossaryType = $('#glossary-type');
const $languagePairsSelect = $('#language-pairs-select');
const $sourceEntryInput = $('#source-entry-input');
const $dropdownHasCollapse = $('.dropdown-has-collapse');
const $targetEntryTextarea = $('#target-entry-textarea');
const $translateEntryButtons = $('.translate-entry-button');
const $tagsetSelect = $('#tagset-select');
const $addButton = $('#add-button');
const $removeButton = $('#remove-button');
const $glossaryEntrySelect = $('#glossary-entry-select');
const $glossaryName = $('#glossary-name');

const defaultOptions = JSON.parse('{"source_language":"auto","target_language":"vi","theme":"Giao diện Bootstrap","font":"Mặc định","font_size":100,"line_spacing":40,"alignment_settings":true,"format_settings":true,"translator":"googleTranslate","show_original_text":false,"load_default_viet_phrase_file":false,"add_de_le_zhao":false,"translation_algorithm":"0","prioritize_name_over_viet_phrase":false,"multiplication_algorithm":"2","glossary":true,"language_pairs":"zh-vi"}');

const SUPPORTED_LANGUAGES = ['', 'EN', 'JA', 'ZH', 'EN-US', 'auto', 'en', 'ja', 'zh-CN', 'zh-TW', 'vi', 'zh-Hans', 'zh-Hant'];

let isLoaded = false;

let quickTranslateStorage = JSON.parse(localStorage.getItem('dich_nhanh')) ?? {};
let glossary = JSON.parse(localStorage.getItem('glossary')) ?? [];
let glossaryMap = new Map();

const uuid = crypto.randomUUID();

let newAccentObject = {};
let oldAccentObject = {};

const vietPhraseData = {
  pinyins: new Map(),
  hanViet: new Map(),
  vietPhrase: new Map(),
  luatNhan: new Map(),
  pronoun: new Map(),
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
  // Nhãn thành phần cú pháp
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
            case 'theme':
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
          case 'theme':
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

function isStaticWordOrPhrase(tag) {
  const tagset = ['NNP', 'NC', 'MWE', 'X', 'y', 'FW', 'S', 'SQ', 'SBAR'];
  return tagset.includes(tag);
}

function isDynamicWordOrPhrase(tag) {
  const tagset = ['N', 'NU', 'NUX', 'NUM', 'NUMX', 'DET', 'V', 'AUX', 'ADJ', 'PRO', 'ADV', 'PRE', 'PRE', 'CC', 'SC', 'PRT', 'I', 'D', 'Z', 'b', 'PUNCT', 'SYM', 'NP', 'VP', 'AP', 'RP', 'PP', 'QP', 'MDP', 'UCP', 'LST', 'WHNP', 'WHAP', 'WHRP', 'WHPP'];
  return tagset.includes(tag);
}

function getIgnoreTranslationMarkup(text, translation, translator) {
  switch (translator) {
    case Translators.MICROSOFT_TRANSLATOR: {
      return `<mstrans:dictionary translation="${translation}">${text}</mstrans:dictionary>`;
    }
    default: {
      return translation;
    }
  }
}

function applyGlossaryToText(text, translator = Translators.VIETPHRASE, isProperOnly = true) {
  const glossaryEntries = glossary.filter(([__, ___, third]) => !isProperOnly || translator !== Translators.VIETPHRASE || ['NNP', 'NC', 'MWE', 'X', 'y', 'FW'].includes(third)).filter(([first]) => text.toUpperCase().includes(first.toUpperCase()));
  const glossaryMapper = new Map(glossaryEntries.map(([first, second]) => [first.toUpperCase(), second]));
  let newText = text;

  if (glossaryEntries.length > 0) {
    const lines = text.split(/\n/);
    const results = [];

    const glossaryLengths = [...glossaryEntries.map(([first]) => [...first].length), 1].toSorted((a, b) => b - a).filter((element, index, array) => element > 0 && index === array.indexOf(element));

    lines.forEach((a) => {
      const chars = [...a];
      if (chars.length === 0) {
        results.push(a);
      } else {
        let tempLine = '';
        let prevPhrase = '';
        let i = 0;

        chars.forEach((b, c) => {
          if (c === i) {
            glossaryLengths.some((d) => {
              let phrase = translator === Translators.DEEPL_TRANSLATE || translator === Translators.GOOGLE_TRANSLATE ? Utils.convertHtmlToText(a.substring(i, i + d)) : a.substring(i, i + d);
              const charsInTempLine = [...tempLine];
              const lastCharInLine = charsInTempLine.length > 0 ? charsInTempLine[charsInTempLine.length - 1] : '';

              if (glossaryMapper.has(phrase.toUpperCase())) {
                phrase = translator === Translators.DEEPL_TRANSLATE || translator === Translators.GOOGLE_TRANSLATE ? Utils.convertHtmlToText(a.substring(i, i + d).toUpperCase()) : a.substring(i, i + d).toUpperCase();

                if (glossaryMapper.get(phrase) !== '') {
                  const maybeNotStaticPos = glossary.filter(([first, __, third]) => first === phrase && isDynamicWordOrPhrase(third)).length > 0 ? glossaryMapper.get(phrase).replace(/ /g, '_') : glossaryMapper.get(phrase);
                  tempLine += (charsInTempLine.length > 0 && /[\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]/u.test(lastCharInLine) ? ' ' : '') + ([Translators.DEEPL_TRANSLATE, Translators.GOOGLE_TRANSLATE, Translators.MICROSOFT_TRANSLATOR, Translators.VIETPHRASE].some((element) => translator === element) || glossary.filter(([first, __, third]) => first === phrase && (isStaticWordOrPhrase(third))).length > 0 ? getIgnoreTranslationMarkup(phrase, glossaryMapper.get(phrase), translator) : maybeNotStaticPos);
                  prevPhrase = glossaryMapper.get(phrase);
                }

                i += d - 1;
                return true;
              }

              if (d === 1) {
                tempLine += (charsInTempLine.length > 0 && /[\p{Lu}\p{Ll}\p{Nd}([{‘“]/u.test(a[i]) && /[\p{Lu}\p{Ll}\p{Nd})\]}’”]/u.test(prevPhrase) ? ' ' : '') + (translator === Translators.DEEPL_TRANSLATE || translator === Translators.GOOGLE_TRANSLATE ? Utils.convertTextToHtml(phrase) : phrase);
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
  const inputText = $inputTextarea.val();

  const translator = $translatorOptions.filter($('.active')).data('id');

  let sourceLanguage = $sourceLanguageSelect.val();
  let targetLanguage = $targetLanguageSelect.val();
  const languagePairs = $languagePairsSelect.val().split('-');

  switch (translator) {
    case Translators.BAIDU_FANYI: {
      sourceLanguage = BaiduFanyi.getMappedSourceLanguageCode(Translators.GOOGLE_TRANSLATE, sourceLanguage).split('-')[0].toLowerCase();
      targetLanguage = BaiduFanyi.getMappedTargetLanguageCode(Translators.GOOGLE_TRANSLATE, targetLanguage).split('-')[0].toLowerCase();
      break;
    }
    case Translators.DEEPL_TRANSLATE: {
      sourceLanguage = DeeplTranslate.getMappedSourceLanguageCode(Translators.GOOGLE_TRANSLATE, sourceLanguage).split('-')[0].toLowerCase();
      targetLanguage = DeeplTranslate.getMappedTargetLanguageCode(Translators.GOOGLE_TRANSLATE, targetLanguage).split('-')[0].toLowerCase();
      break;
    }
    case Translators.PAPAGO: {
      sourceLanguage = Papago.getMappedSourceLanguageCode(Translators.GOOGLE_TRANSLATE, sourceLanguage).split('-')[0].toLowerCase();
      targetLanguage = Papago.getMappedTargetLanguageCode(Translators.GOOGLE_TRANSLATE, targetLanguage).split('-')[0].toLowerCase();
      break;
    }
    case Translators.MICROSOFT_TRANSLATOR: {
      sourceLanguage = MicrosoftTranslator.getMappedSourceLanguageCode(Translators.GOOGLE_TRANSLATE, sourceLanguage).split('-')[0].toLowerCase();
      targetLanguage = MicrosoftTranslator.getMappedTargetLanguageCode(Translators.GOOGLE_TRANSLATE, targetLanguage).split('-')[0].toLowerCase();
      break;
    }
    case Translators.VIETPHRASE: {
      sourceLanguage = Vietphrase.getMappedSourceLanguageCode(Translators.GOOGLE_TRANSLATE).split('-')[0].toLowerCase();
      targetLanguage = Vietphrase.getMappedTargetLanguageCode(Translators.GOOGLE_TRANSLATE).split('-')[0].toLowerCase();
      break;
    }
    default: {
      sourceLanguage = sourceLanguage.split('-')[0].toLowerCase();
      targetLanguage = targetLanguage.split('-')[0].toLowerCase();
      break;
    }
  }

  const gapLength = applyGlossaryToText(inputText, translator, translator !== Translators.VIETPHRASE).length - inputText.length;

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
    glossary = glossary.filter(([first], __, array) => !array[first] && (array[first] = 1), {}).toSorted((a, b) => Tagset[a[2]] - Tagset[b[2]] || a[1].localeCompare(b[1], 'vi', { ignorePunctuation: true }) || a[0].localeCompare(b[0], 'vi', { sensitivity: 'accent', ignorePunctuation: true }) || b[0].concat(`\t${b[1]}`).length - a[0].concat(`\t${a[1]}`).length).map(([first, second, third]) => [first.trim().replace(/^\s+|\s+$/g, ''), second, third ?? 'X']);
    glossaryMap = new Map(glossary.map(([first, second]) => [first, second]));

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
        glossaryData = $.csv.fromArrays(glossary.toSorted((a, b) => Tagset[a[2]] - Tagset[b[2]] || b[0].concat(`\t${b[1]}`).length - a[0].concat(`\t${a[1]}`).length || a[1].localeCompare(b[1], 'vi', { ignorePunctuation: true }) || a[0].localeCompare(b[0], 'vi', { ignorePunctuation: true })));
        glossaryExtension.text('csv');
        break;
      }
      case GlossaryType.VIETPHRASE: {
        glossaryData = glossary.toSorted((a, b) => b[0].length - a[0].length || b[1].length - a[1].length || a[1].localeCompare(b[1], 'vi', { ignorePunctuation: true }) || a[0].localeCompare(b[0], 'vi', { ignorePunctuation: true })).map(([first, second]) => [first, second].join('=')).join('\n');
        glossaryExtension.text('txt');
        break;
      }
      case 'VietPhrase': {
        glossaryData = [...vietPhraseData.vietPhrase].concat(glossary.filter(([__, ___, third]) => isDynamicWordOrPhrase(third)).toSorted((a, b) => b[0].length - a[0].length || b[1].length - a[1].length || a[1].localeCompare(b[1], 'vi', { ignorePunctuation: true }) || a[0].localeCompare(b[0], 'vi', { ignorePunctuation: true }))).map(([first, second]) => [first, second].join('=')).join('\n');
        glossaryExtension.text('txt');
        break;
      }
      case 'Names': {
        glossaryData = glossary.filter(([__, ___, third]) => isStaticWordOrPhrase(third)).toSorted((a, b) => b[0].length - a[0].length || b[1].length - a[1].length || a[1].localeCompare(b[1], 'vi', { ignorePunctuation: true }) || a[0].localeCompare(b[0], 'vi', { ignorePunctuation: true })).map(([first, second]) => [first, second].join('=')).join('\n');
        glossaryExtension.text('txt');
        break;
      }
      case 'STV': {
        glossaryData = glossary.filter(([__, ___, third]) => isStaticWordOrPhrase(third)).toSorted((a, b) => a[0].length - b[0].length || a[1].length - b[1].length || a[1].localeCompare(b[1], 'vi', { ignorePunctuation: true }) || a[0].localeCompare(b[0], 'vi', { ignorePunctuation: true })).map(([first, second]) => [first, second].join('=')).join('\n');
        glossaryExtension.text('txt');
        break;
      }
      default: {
        glossaryData = glossary.toSorted((a, b) => Tagset[a[2]] - Tagset[b[2]] || b[0].concat(`\t${b[1]}`).length - a[0].concat(`\t${a[1]}`).length || a[1].localeCompare(b[1], 'vi', { ignorePunctuation: true }) || a[0].localeCompare(b[0], 'vi', { ignorePunctuation: true })).map((element) => element.join('\t')).join('\n');
        glossaryExtension.text('tsv');
        break;
      }
    }

    downloadButton.attr('href', URL.createObjectURL(new Blob([glossaryData.split(/\n/).map((element) => ($glossaryType.val() === 'STV' ? element.replace(/^\$/g, '') : element)).join('\n')], { type: `${['VietPhrase', 'Names', 'STV'].indexOf($glossaryType.val()) >= 0 ? GlossaryType.VIETPHRASE : $glossaryType.val()};charset=UTF-8` })));
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
  if (isLoaded) updateInputTextLength();
  localStorage.setItem('glossary', JSON.stringify(glossary));
}

function getMaxQueryLengthAndLine(translator, text) {
  switch (translator) {
    case Translators.BAIDU_FANYI: {
      return [1000, 30];
    }
    case Translators.DEEPL_TRANSLATE: {
      return [131072, 50];
    }
    case Translators.GOOGLE_TRANSLATE: {
      return [6000000, 100];
    }
    case Translators.PAPAGO: {
      return [3000, 1500];
    }
    case Translators.MICROSOFT_TRANSLATOR: {
      return [50000, 1000];
    }
    default: {
      return [applyGlossaryToText(text, Translators.VIETPHRASE, false).length, text.split(/\n/).length];
    }
  }
}

function applyOldAccent(text) {
  return text.replace(Utils.getTrieRegexPatternFromWords(Object.keys(oldAccentObject)), (match) => oldAccentObject[match] ?? match);
}

function buildResult(inputText, result) {
  try {
    const resultDiv = document.createElement('div');

    const originalLines = inputText.split(/\r?\n/).map((element) => element.trimStart());
    const resultLines = result.split(/\n/).map((element) => element.trimStart());

    if ($showOriginalTextSwitch.prop('checked') && result !== 'Vui lòng nhập tệp VietPhrase.txt hoặc bật tuỳ chọn [Tải tệp VietPhrase mặc định] và tải lại trang!') {
      let lostLineFixedNumber = 0;

      for (let i = 0; i < originalLines.length; i += 1) {
        if (i + lostLineFixedNumber < resultLines.length) {
          if (originalLines[i + lostLineFixedNumber].trim().replace(/^\s+$/, '').length === 0 && resultLines[i].trim().replace(/^\s+$/, '').length > 0) {
            lostLineFixedNumber += 1;
            i -= 1;
          } else if ($translatorOptions.filter($('.active')).data('id') === Translators.PAPAGO && resultLines[i].trim().replace(/^\s+$/, '').length === 0 && originalLines[i + lostLineFixedNumber].trim().replace(/^\s+$/, '').length > 0) {
            lostLineFixedNumber -= 1;
          } else {
            let paragraph = document.createElement('p');

            if ($formatSettingsSwitch.prop('checked')) {
              if (originalLines[i + lostLineFixedNumber].length > 0) {
                const idiomaticText = document.createElement('i');
                idiomaticText.innerText = originalLines[i + lostLineFixedNumber];
                paragraph.appendChild(idiomaticText);
                if (i > 0 && resultLines[i - 1].length > 0) paragraph.classList.add('line-spacing');
                resultDiv.appendChild(paragraph.cloneNode(true));
                paragraph = document.createElement('p');
              }

              paragraph.innerText = resultLines[i];
              resultDiv.appendChild(paragraph.cloneNode(true));
            } else if (originalLines[i + lostLineFixedNumber].length > 0) {
              const idiomaticText = document.createElement('i');
              idiomaticText.innerText = originalLines[i + lostLineFixedNumber];
              paragraph.appendChild(idiomaticText);
              paragraph.innerText += resultLines[i].trim().replace(/^\s+$/, '').length > 0 ? ' ' : '';
              const attentionText = document.createElement('b');
              attentionText.innerText = resultLines[i];
              paragraph.appendChild(attentionText);
              resultDiv.appendChild(paragraph.cloneNode(true));
            } else {
              paragraph.innerText = resultLines[i];
              resultDiv.appendChild(paragraph);
            }
          }
        } else if (i + lostLineFixedNumber < originalLines.length) {
          const paragraph = document.createElement('p');
          const idiomaticText = document.createElement('i');
          idiomaticText.innerText = originalLines[i + lostLineFixedNumber];
          paragraph.appendChild(idiomaticText);
          resultDiv.appendChild(paragraph);
        }
      }
    } else {
      resultDiv.innerHTML = `<p>${resultLines.map(Utils.convertTextToHtml).join('</p><p>')}</p>`;
    }

    return resultDiv.innerHTML.replace(/(<p>)(<\/p>)/g, '$1<br>$2');
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
  const languagePairs = $languagePairsSelect.val().split('-');
  let isPairing = false;

  switch (translatorOption) {
    case Translators.BAIDU_FANYI: {
      isPairing = BaiduFanyi.getMappedSourceLanguageCode(Translators.GOOGLE_TRANSLATE, sourceLanguage).split('-')[0].toLowerCase() === languagePairs[0] && BaiduFanyi.getMappedTargetLanguageCode(Translators.GOOGLE_TRANSLATE, targetLanguage).split('-')[0].toLowerCase() === languagePairs[1];
      break;
    }
    case Translators.DEEPL_TRANSLATE: {
      isPairing = DeeplTranslate.getMappedSourceLanguageCode(Translators.GOOGLE_TRANSLATE, sourceLanguage).split('-')[0].toLowerCase() === languagePairs[0] && DeeplTranslate.getMappedTargetLanguageCode(Translators.GOOGLE_TRANSLATE, targetLanguage).split('-')[0].toLowerCase() === languagePairs[1];
      break;
    }
    case Translators.PAPAGO: {
      isPairing = Papago.getMappedSourceLanguageCode(Translators.GOOGLE_TRANSLATE, sourceLanguage).split('-')[0].toLowerCase() === languagePairs[0] && Papago.getMappedTargetLanguageCode(Translators.GOOGLE_TRANSLATE, targetLanguage).split('-')[0].toLowerCase() === languagePairs[1];
      break;
    }
    case Translators.MICROSOFT_TRANSLATOR: {
      isPairing = MicrosoftTranslator.getMappedSourceLanguageCode(Translators.GOOGLE_TRANSLATE, sourceLanguage).split('-')[0].toLowerCase() === languagePairs[0] && MicrosoftTranslator.getMappedTargetLanguageCode(Translators.GOOGLE_TRANSLATE, targetLanguage).split('-')[0].toLowerCase() === languagePairs[1];
      break;
    }
    case Translators.VIETPHRASE: {
      isPairing = Vietphrase.getMappedSourceLanguageCode(Translators.GOOGLE_TRANSLATE, sourceLanguage).split('-')[0].toLowerCase() === languagePairs[0] && Vietphrase.getMappedTargetLanguageCode(Translators.GOOGLE_TRANSLATE, targetLanguage).split('-')[0].toLowerCase() === languagePairs[1];
      break;
    }
    default: {
      isPairing = sourceLanguage.split('-')[0].toLowerCase() === languagePairs[0] && targetLanguage.split('-')[0].toLowerCase() === languagePairs[1];
      break;
    }
  }

  const glossaryEnabled = $glossarySwitch.prop('checked');

  const processText = glossaryEnabled && [Translators.BAIDU_FANYI, Translators.PAPAGO].every((element) => translatorOption !== element) && (translatorOption === Translators.VIETPHRASE ? $prioritizeNameOverVietPhraseCheck.prop('checked') && targetLanguage === 'vi' : isPairing) ? applyGlossaryToText(inputText, translatorOption, false) : inputText;

  const [MAX_LENGTH, MAX_LINE] = getMaxQueryLengthAndLine(translatorOption, processText);

  if (translatorOption !== Translators.DEEPL_TRANSLATE && processText.split(/\n/).toSorted((a, b) => b.length - a.length)[0].length > MAX_LENGTH) {
    throw console.error(`Số lượng từ trong một dòng quá dài (Số lượng từ hợp lệ nhỏ hơn hoặc bằng ${MAX_LENGTH}).`);
  }

  try {
    let result = '';

    if (Object.keys(lastSession).length > 0 && lastSession.inputText === processText && lastSession.translatorOption === translatorOption && lastSession.sourceLanguage === sourceLanguage && lastSession.targetLanguage === targetLanguage) {
      result = lastSession.result;
    } else {
      let translator = null;

      switch (translatorOption) {
        case Translators.BAIDU_FANYI: {
          translator = new BaiduFanyi();
          break;
        }
        case Translators.DEEPL_TRANSLATE: {
          translator = await new DeeplTranslate().init();
          break;
        }
        case Translators.PAPAGO: {
          translator = await new Papago(uuid).init();
          break;
        }
        case Translators.MICROSOFT_TRANSLATOR: {
          translator = await new MicrosoftTranslator().init();
          break;
        }
        case Translators.VIETPHRASE: {
          translator = new Vietphrase(vietPhraseData, $translationAlgorithmRadio.filter('[checked]').val(), $multiplicationAlgorithmRadio.filter('[checked]').val(), glossaryEnabled && targetLanguage === 'vi', glossary, $prioritizeNameOverVietPhraseCheck.prop('checked'), $addDeLeZhaoSwitch.prop('checked'), true);
          break;
        }
        default: {
          translator = await new GoogleTranslate().init();
          break;
        }
      }

      if (translatorOption === Translators.DEEPL_TRANSLATE && translator.usage.character_count + inputText.length > translator.usage.character_limit) throw console.error(`Lỗi DeepL Translator: Đã đạt đến giới hạn dịch của tài khoản. (${translator.usage.character_count}/${translator.usage.character_limit} ký tự).`);
      const results = [];

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

        if (translateAbortController.signal.aborted) return;
        result = results.join('\n');
      }

      if (glossaryEnabled && translatorOption !== Translators.VIETPHRASE && isPairing) {
        glossary.filter(([first]) => inputText.includes(first)).toSorted((a, b) => b[1].length - a[1].length).forEach(([__, second]) => {
          const key = second.replace(/ /g, '_');
          const oldAccentKey = applyOldAccent(key);
          if (second.split(' ').length >= 2) result = result.replace(Utils.getTrieRegexPatternFromWords([key, key[0].toLowerCase() + key.substring(1), key[0].toUpperCase() + key.substring(1), oldAccentKey, oldAccentKey[0].toLowerCase() + oldAccentKey.substring(1), oldAccentKey[0].toUpperCase() + oldAccentKey.substring(1)]), (match) => match[0] + second.substring(1));
        });
      }

      if (translateAbortController.signal.aborted) return;
      $('#translate-timer').text(Date.now() - startTime);
      lastSession.inputText = processText;
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
    case Translators.BAIDU_FANYI: {
      Object.entries(BaiduFanyi.FROM_LANGUAGES).forEach(([languageCode]) => {
        const option = document.createElement('option');
        option.innerText = BaiduFanyi.getFromName(languageCode);
        option.value = languageCode;
        sourceLanguageSelect.appendChild(option);
      });

      break;
    }
    case Translators.DEEPL_TRANSLATE: {
      DeeplTranslate.SOURCE_LANGUAGES.forEach(({ language }) => {
        if (!SUPPORTED_LANGUAGES.includes(language)) return;
        const option = document.createElement('option');
        option.innerText = DeeplTranslate.getSourceLangName(language);
        option.value = language;
        sourceLanguageSelect.appendChild(option);
      });

      break;
    }
    case Translators.PAPAGO: {
      Object.entries(Papago.SOURCE_LANGUAGES).forEach(([languageCode]) => {
        if (!SUPPORTED_LANGUAGES.includes(languageCode)) return;
        const option = document.createElement('option');
        option.innerText = Papago.getSourceName(languageCode);
        option.value = languageCode;
        sourceLanguageSelect.appendChild(option);
      });

      break;
    }
    case Translators.MICROSOFT_TRANSLATOR: {
      Object.entries(MicrosoftTranslator.FROM_LANGUAGES).forEach(([languageCode]) => {
        if (!SUPPORTED_LANGUAGES.includes(languageCode)) return;
        const option = document.createElement('option');
        option.innerText = MicrosoftTranslator.getFromName(languageCode);
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
      Object.entries(GoogleTranslate.SOURCE_LANGUAGES).forEach(([languageCode]) => {
        if (!SUPPORTED_LANGUAGES.includes(languageCode)) return;
        const option = document.createElement('option');
        option.innerText = GoogleTranslate.getSlName(languageCode);
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
    case Translators.BAIDU_FANYI: {
      Object.entries(BaiduFanyi.TO_LANGUAGES).forEach(([languageCode]) => {
        const option = document.createElement('option');
        option.innerText = BaiduFanyi.getToName(languageCode);
        option.value = languageCode;
        targetLanguageSelect.appendChild(option);
      });

      break;
    }
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
    case Translators.MICROSOFT_TRANSLATOR: {
      Object.entries(MicrosoftTranslator.TO_LANGUAGES).forEach(([languageCode]) => {
        if (SUPPORTED_LANGUAGES.indexOf(languageCode) === -1) return;
        const option = document.createElement('option');
        option.innerText = MicrosoftTranslator.getToName(languageCode);
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
      Object.entries(GoogleTranslate.TARGET_LANGUAGES).forEach(([languageCode]) => {
        if (SUPPORTED_LANGUAGES.indexOf(languageCode) === -1) return;
        const option = document.createElement('option');
        option.innerText = GoogleTranslate.getTlName(languageCode);
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
      case Translators.BAIDU_FANYI: {
        sourceLanguage = BaiduFanyi.getMappedSourceLanguageCode(translator, sourceLanguage);
        targetLanguage = BaiduFanyi.getMappedTargetLanguageCode(translator, targetLanguage);
        break;
      }
      case Translators.DEEPL_TRANSLATE: {
        sourceLanguage = DeeplTranslate.getMappedSourceLanguageCode(translator, sourceLanguage);
        targetLanguage = DeeplTranslate.getMappedTargetLanguageCode(translator, targetLanguage);
        break;
      }
      case Translators.PAPAGO: {
        sourceLanguage = Papago.getMappedSourceLanguageCode(translator, sourceLanguage);
        targetLanguage = Papago.getMappedTargetLanguageCode(translator, targetLanguage);
        break;
      }
      case Translators.MICROSOFT_TRANSLATOR: {
        sourceLanguage = MicrosoftTranslator.getMappedSourceLanguageCode(translator, sourceLanguage);
        targetLanguage = MicrosoftTranslator.getMappedTargetLanguageCode(translator, targetLanguage);
        break;
      }
      case Translators.VIETPHRASE: {
        sourceLanguage = Vietphrase.getMappedSourceLanguageCode(translator);
        targetLanguage = Vietphrase.getMappedTargetLanguageCode(translator);
        break;
      }
      default: {
        sourceLanguage = GoogleTranslate.getMappedSourceLanguageCode(translator, sourceLanguage);
        targetLanguage = GoogleTranslate.getMappedTargetLanguageCode(translator, targetLanguage);
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
    const text = glossaryEnabled && [Translators.BAIDU_FANYI, Translators.PAPAGO].every((element) => translatorOption !== element) && (translatorOption !== Translators.VIETPHRASE || $prioritizeNameOverVietPhraseCheck.prop('checked')) ? applyGlossaryToText(inputText, translatorOption, false) : inputText;
    let translator = null;
    let sourceLanguage = '';

    switch (translatorOption) {
      case Translators.BAIDU_FANYI: {
        translator = new BaiduFanyi();
        sourceLanguage = BaiduFanyi.AUTOMATIC_DETECTION;
        break;
      }
      case Translators.DEEPL_TRANSLATE: {
        translator = await new DeeplTranslate().init();
        sourceLanguage = DeeplTranslate.DETECT_LANGUAGE;
        break;
      }
      case Translators.PAPAGO: {
        translator = await new Papago().init();
        sourceLanguage = Papago.DETECT_LANGUAGE;
        break;
      }
      case Translators.MICROSOFT_TRANSLATOR: {
        translator = await new MicrosoftTranslator().init();
        sourceLanguage = MicrosoftTranslator.AUTODETECT;
        break;
      }
      case Translators.VIETPHRASE: {
        translator = await new Vietphrase(vietPhraseData, $translationAlgorithmRadio.filter('[checked]').val(), $multiplicationAlgorithmRadio.filter('[checked]').val(), glossaryEnabled, glossary, $prioritizeNameOverVietPhraseCheck.prop('checked'), $addDeLeZhaoSwitch.prop('checked'));
        sourceLanguage = Vietphrase.DefaultLanguage.SOURCE_LANGUAGE;
        break;
      }
      default: {
        translator = await new GoogleTranslate().init();
        sourceLanguage = GoogleTranslate.DETECT_LANGUAGE;
        break;
      }
    }

    if (translatorOption === Translators.DEEPL_TRANSLATE && translator.usage.character_count + text.length > translator.usage.character_limit) return `Lỗi DeepL Translator: Đã đạt đến giới hạn dịch của tài khoản. (${translator.usage.character_count}/${translator.usage.character_limit} ký tự).`;
    let result = await translator.translateText(sourceLanguage, targetLanguage, text);

    if (glossaryEnabled && translatorOption !== Translators.VIETPHRASE) {
      glossary.filter(([first]) => inputText.includes(first)).toSorted((a, b) => b[1].length - a[1].length).forEach(([__, second]) => {
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

  $.ajax({
    method: 'GET',
    url: '/static/datasource/Unihan_Readings.txt',
  }).done((data) => {
    let pinyinList = data.split(/\r?\n/).filter((element) => element.startsWith('U+')).map((element) => element.substring(2).split(/\t/)).filter((element) => element.length === 2).map(([first, second]) => [String.fromCodePoint(parseInt(first, 16)), second]);
    pinyinList = pinyinList.filter(([first], __, array) => !array[first] && (array[first] = 1), {});
    vietPhraseData.pinyins = new Map(pinyinList);
    console.log(`Đã tải xong bộ dữ liệu bính âm (${pinyinList.length})!`);
    lastSession = {};
  }).fail((__, ___, errorThrown) => {
    console.error('Không thể tải bộ dữ liệu bính âm:', errorThrown);
    setTimeout(window.location.reload, 5000);
  });

  newAccentObject = Object.fromEntries(newAccentMap);
  oldAccentObject = Object.fromEntries(newAccentMap.map(([first, second]) => [second, first]));

  try {
    let chinesePhienAmWordList = specialSinovietnameseMap.map(([a, b, c]) => [a, (new Map(specialSinovietnameseMap.filter(([__, d]) => !/\p{Script=Hani}/u.test(d)).map(([d, e, f]) => [d, f ?? e])).get(b) ?? c ?? b).split(/, | \| /)[0].toLowerCase()]);

    await $.ajax({
      method: 'GET',
      url: '/static/datasource/vn.tangthuvien.ttvtranslate/ChinesePhienAmWords.txt',
    }).done((data) => {
      vietPhraseData.ttvtranslate = data.split(/\n/).map((element) => element.split('='));
      chinesePhienAmWordList = chinesePhienAmWordList.concat(vietPhraseData.ttvtranslate);
    });

    await $.ajax({
      method: 'GET',
      url: '/static/datasource/Data của thtgiang/ChinesePhienAmWords.txt',
    }).done((data) => {
      vietPhraseData.dataByThtgiang = data.split(/\r\n/).map((element) => element.split('='));
      chinesePhienAmWordList = chinesePhienAmWordList.concat(vietPhraseData.dataByThtgiang);
    });

    await $.ajax({
      method: 'GET',
      url: '/static/datasource/Quick Translator/ChinesePhienAmWords.txt',
    }).done((data) => {
      vietPhraseData.quickTranslator = data.split(/\r\n/).map((element) => element.split('='));
      chinesePhienAmWordList = chinesePhienAmWordList.concat(vietPhraseData.quickTranslator);
    });

    chinesePhienAmWordList = chinesePhienAmWordList.concat(cjkv.nam.map(([first, second]) => [first, second.trimStart().split(/, ?/).filter((element) => element.length > 0)[0]]));

    await $.ajax({
      method: 'GET',
      url: '/static/datasource/Chivi/word_hv.txt',
    }).done((data) => {
      vietPhraseData.chivi = data.split(/\n/).map((element) => element.split('='));
      chinesePhienAmWordList = chinesePhienAmWordList.concat(vietPhraseData.chivi.filter(([first]) => [...first].length === 1).toSorted((a, b) => b[0].length - a[0].length).map(([first, second]) => [first, second.split('ǀ')[0]]));
    });

    $.ajax({
      method: 'GET',
      url: '/static/datasource/QuickTranslate2020/ChinesePhienAmWords.txt',
    }).done((data) => {
      vietPhraseData.quickTranslate2020 = data.split(/\r\n/).map((element) => element.split('='));
    });

    chinesePhienAmWordList = chinesePhienAmWordList.concat(hanData.names.map(([first, second]) => [first, second.split(',').filter((element) => element.length > 0)[0]]));
    chinesePhienAmWordList = chinesePhienAmWordList.filter(([first, second]) => first != null && first !== '' && second != null).filter(([first], __, array) => !array[first] && (array[first] = 1), {});
    chinesePhienAmWordList = chinesePhienAmWordList.map(([c, d]) => [c, applyNewAccent(d)]);
    vietPhraseData.hanViet = new Map(chinesePhienAmWordList);
    console.log(`Đã tải xong bộ dữ liệu hán việt (${chinesePhienAmWordList.length})!`);
    lastSession = {};
  } catch (error) {
    console.error('Không thể tải bộ dữ liệu hán việt:', error);
    setTimeout(window.location.reload, 5000);
  }

  if ($loadDefaultVietPhraseFileSwitch.prop('checked')) {
    $.ajax({
      method: 'GET',
      url: '/static/datasource/vn.tangthuvien.ttvtranslate/VietPhrase.txt',
    }).done((data) => {
      let vietPhraseList = data.split(/\n/).map((element) => element.split('=')).filter((element) => element.length === 2).map(([first, second]) => [first, second.split(/[/|]/)[0]]).concat([...vietPhraseData.hanViet]);
      vietPhraseList = vietPhraseList.filter(([first], __, array) => !array[first] && (array[first] = 1), {});
      if ($vietPhraseInput.prop('files').length > 0) return;
      vietPhraseData.vietPhrase = new Map(vietPhraseList);
      const $vietPhraseEntryCounter = $('#viet-phrase-entry-counter');
      $vietPhraseEntryCounter.text(vietPhraseList.length);
      console.log(`Đã tải xong tệp VietPhrase (${$vietPhraseEntryCounter.text()})!`);
      lastSession = {};
    }).fail((__, ___, errorThrown) => {
      console.error('Không tải được tệp VietPhrase:', errorThrown);
    });
  }

  $loadDefaultVietPhraseFileSwitch.removeClass('disabled');
  isLoaded = true;
  updateInputTextLength();
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => $themeOptions.filter('.active').click());

$(window).on('keydown', (event) => (!$resultTextarea.is(':visible') || !event.ctrlKey || event.key !== 'r') || ($retranslateButton.click() && event.preventDefault()));

$(window).on('keypress', (event) => {
  if ($(document.activeElement).is('body') && event.key === 'Enter') {
    if ($resultTextarea.is(':visible')) {
      $resultTextarea.focus();
    } else {
      $translateButton.click();
    }
  }
});

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

$glossaryManagerButton.on('mousedown', () => {
  $glossaryEntrySelect.val('').change();
  $sourceEntryInput.prop('scrollLeft', 0);
  $tagsetSelect.val('X');
  $sourceEntryInput.val(getSelectedTextOrActiveElementText().replace(/\n/g, ' ').trim()).trigger('input');

  if (window.getSelection) {
    window.getSelection().removeAllRanges();
  } else if (document.selection) {
    document.selection.empty();
  }

  $('.textarea').blur();
});

$('[data-bs-theme-value]').on('click', () => $themeOptions.filter('.active').click());

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
    if (optionType === OptionTypes.RADIO) lastSession = {};
    $retranslateButton.click();
  }
});

$themeOptions.click(function onClick() {
  $themeOptions.removeClass('active');
  $(this).addClass('active');
  const isDarkMode = $('#bd-theme').next().find('.active').data('bs-theme-value') === 'auto' ? window.matchMedia('(prefers-color-scheme: dark)').matches : $('#bd-theme').next().find('.active').data('bs-theme-value') === 'dark';

  $('.textarea').css({
    'background-color': $(this).data('dark-background-color') != null && isDarkMode ? $(this).data('dark-background-color') : ($(this).data('background-color') ?? ''),
    color: $(this).data('dark-foreground-color') != null && isDarkMode ? $(this).data('dark-foreground-color') : ($(this).data('foreground-color') ?? ''),
    'font-weight': $(this).data('font-weight') ?? '',
  });

  if (isLoaded === true) {
    $fontOptions.filter('.active').click();

    if ($(this).data('font-size') != null) {
      $fontSizeRange.val($(this).data('font-size')).change();
    }

    if ($(this).data('line-height') != null) {
      $lineSpacingRange.val($(this).data('line-height')).change();
    }

    if ($(this).data('text-align') != null) {
      $alignmentSettingsSwitch.prop('checked', $(this).data('text-align') === 'justify').change();
    }
  }

  quickTranslateStorage.theme = $(this).text();
  localStorage.setItem('dich_nhanh', JSON.stringify(quickTranslateStorage));
});

$fontOptions.click(function onClick() {
  $fontOptions.removeClass('active');
  $(this).addClass('active');
  const $currentTheme = $themeOptions.filter('.active');

  if ($(this).data('fallback-font') != null) {
    $(document.documentElement).css('--opt-font-family', `${$(this).text().includes(' ') ? `'${$(this).text()}'` : $(this).text()}, ${$(this).data('fallback-font').length > 0 ? `${$(this).data('fallback-font').split(', ').map((element) => (element.includes(' ') ? `'${element}'` : element)).join(', ')}` : ''}`);
  } else if ($(this).data('font-stacks') != null) {
    $(document.documentElement).css('--opt-font-family', $(this).data('font-stacks').split(', ').map((element) => `var(--${element})`).join(', '));
  } else if ($currentTheme.data('font-family') != null) {
    $(document.documentElement).css('--opt-font-family', $currentTheme.data('font-family').split(', ').map((element) => (element.includes(' ') ? `'${element}'` : element)).join(', '));
  } else {
    $(document.documentElement).css('--opt-font-family', '');
  }

  $('.textarea').css('font-weight', $currentTheme.text() === 'Apple Sách - Nguyên bản' && $(this).text().startsWith('PingFang ') ? 500 : ($currentTheme.data('font-weight') ?? ''));
  quickTranslateStorage.font = $(this).text();
  localStorage.setItem('dich_nhanh', JSON.stringify(quickTranslateStorage));
});

$fontSizeRange.on('input', function onInput() {
  const $fontSizeDisplay = $('#font-size-display');
  $fontSizeDisplay.val(parseFloat($(this).val()));
  $(this).val(parseFloat($(this).val()).toFixed($fontSizeDisplay.val().includes('.') ? $fontSizeDisplay.val().split('.')[1].length : 0));
  $(document.documentElement).css('--opt-font-size', `${parseFloat($(this).val()) / 100}em`);
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
  const $lineSpacingDisplay = $('#line-spacing-display');
  $lineSpacingDisplay.val(parseInt($(this).val(), 10));
  $(this).val(parseFloat($(this).val()).toFixed($lineSpacingDisplay.val().includes('.') ? $lineSpacingDisplay.val().split('.')[1].length : 0));
  $(document.documentElement).css('--opt-line-height', `${1 + ((0.5 * parseInt($(this).val(), 10)) / 100)}em`);
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
  $(document.documentElement).css('--opt-text-align', $(this).prop('checked') ? 'justify' : 'start');
  quickTranslateStorage[getOptionId($(this).attr('id'))] = $(this).prop('checked');
  localStorage.setItem('dich_nhanh', JSON.stringify(quickTranslateStorage));
});

$alignmentSettingsSwitch.off('change');

$alignmentSettingsSwitch.change(function onChange() {
  $(document.documentElement).css('--opt-text-align', $(this).prop('checked') ? 'justify' : 'start');
  quickTranslateStorage[getOptionId($(this).attr('id'))] = $(this).prop('checked');
  localStorage.setItem('dich_nhanh', JSON.stringify(quickTranslateStorage));
});

$formatSettingsSwitch.off('change');

$formatSettingsSwitch.change(function onChange() {
  $retranslateButton.click();
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
    vietPhraseList = vietPhraseList.concat([...vietPhraseData.hanViet]).filter(([first], __, array) => !array[first] && (array[first] = 1), {});
    vietPhraseData.vietPhrase = new Map(vietPhraseList);
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
    if ($(this).prop('checked') === true && (vietPhraseData.vietPhrase.size === 0 || vietPhraseData.luatNhan.size === 0 || vietPhraseData.pronoun.size === 0) && window.confirm('Bạn có muốn tải lại trang ngay chứ?')) window.location.reload();
  }
});

$luatNhanInput.on('change', function onChange() {
  const reader = new FileReader();

  reader.onload = function onLoad() {
    vietPhraseData.luatNhan = new Map(this.result.split(/\r?\n/).filter((element) => !element.startsWith('#')).map((element) => element.split('=')).filter((element) => element.length === 2));
    const $luatNhanEntryCounter = $('#luat-nhan-entry-counter');
    $luatNhanEntryCounter.text(vietPhraseData.luatNhan.size);
    console.log(`Đã tải xong tệp ${$luatNhanInput.prop('files')[0].name} (${$luatNhanEntryCounter.text()})!`);
    lastSession = {};
  };

  reader.readAsText($(this).prop('files')[0]);
});

$pronounInput.on('change', function onChange() {
  const reader = new FileReader();

  reader.onload = function onLoad() {
    vietPhraseData.pronoun = new Map(this.result.split(/\r?\n/).map((element) => element.split('=')).filter((element) => element.length === 2).map(([first, second]) => [first, second.split('/')[0]]));
    const $pronounEntryCounter = $('#pronoun-entry-counter');
    $pronounEntryCounter.text(vietPhraseData.pronoun.size);
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
        $glossaryType.val(GlossaryType.TSV);
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
    $sourceEntryInput.trigger('input');
  };

  reader.readAsText($(this).prop('files')[0]);
});

$('#clear-button').on('click', () => {
  if (!window.confirm('Bạn có muốn xoá sạch bảng thuật ngữ chứ?')) return;
  glossary = [];
  glossaryMap = new Map();
  $glossaryName.val(null);
  reloadGlossaryEntries();
  $glossaryInput.val('');
});

$glossaryType.on('change', reloadGlossaryEntries);

$sourceEntryInput.on('input', async function onInput() {
  const inputText = (new Map(glossary.map(([first]) => [first.toUpperCase(), first]))).get($(this).val().toUpperCase().trim()) ?? $(this).val();
  $(this).val(inputText);
  $targetEntryTextarea.prop('scrollTop', 0);

  if (inputText.length > 0) {
    const $option = $(`#${$(this).attr('list')} > option`).filter((__, element) => inputText === element.innerText);

    if (Utils.isOnMobile() && $option.length > 0) {
      $(this).val($option.data('value')).trigger('input');
      return;
    }

    if (glossaryMap.has(inputText)) {
      $targetEntryTextarea.val(applyGlossaryToText(inputText, Translators.VIETPHRASE, false)).trigger('input');
      $tagsetSelect.val(glossary.filter(([first]) => first === inputText)[0][2] ?? 'X');
      $glossaryEntrySelect.val(inputText);

      if (!Utils.isOnMobile()) {
        const modalBody = $('#glossary-modal .modal-body');
        const prevModalBodyScrollTop = modalBody.prop('scrollTop');
        $glossaryEntrySelect.prop('options')[$glossaryEntrySelect.prop('selectedIndex')].scrollIntoView({ block: 'center' });
        modalBody.prop('scrollTop', prevModalBodyScrollTop);
      }
    } else {
      $targetEntryTextarea.val((await translateText(inputText, Translators.VIETPHRASE, 'sinoVietnamese', true)).trim()).trigger('input');
      $targetEntryTextarea.prop('scrollTop', 0);
      $tagsetSelect.val('X');
      $glossaryEntrySelect.val('');
    }

    $addButton.removeClass('disabled');
    $removeButton.removeClass('disabled');
  } else {
    $glossaryEntrySelect.val('').change();
    $glossaryEntrySelect.prop('scrollTop', 0);
    $addButton.addClass('disabled');
    $removeButton.addClass('disabled');
  }
});

$targetEntryTextarea.on('input', function onInput() {
  $(this).val($(this).val().replace(/\n/g, ' '));
});

$targetEntryTextarea.on('keypress', (event) => event.key !== 'Enter' || ($addButton.click() && event.preventDefault()));
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

$dropdownHasCollapse.on('show.bs.dropdown', function onHideBsDropdown() {
  $(this).find('.dropdown-menu').find('.collapse.show-by-default').each((indexInArray, value) => {
    if ($(value).hasClass('show')) return;
    const bootstrapCollapseInDropdown = new bootstrap.Collapse(value);
    bootstrapCollapseInDropdown.show();
  });
});

$dropdownHasCollapse.on('hide.bs.dropdown', function onHideBsDropdown() {
  $(this).find('.dropdown-menu').find('.collapse').each((indexInArray, value) => {
    if ($(value).hasClass('show-by-default')) return;
    if (!$(value).hasClass('show')) return;
    const bootstrapCollapseInDropdown = new bootstrap.Collapse(value);
    bootstrapCollapseInDropdown.hide();
  });
});

$('.define-button').on('click', function onClick() {
  if ($sourceEntryInput.val().length > 0) {
    const defineContent = ($sourceEntryInput.val().substring($sourceEntryInput.prop('selectionStart'), $sourceEntryInput.prop('selectionEnd')) || $sourceEntryInput.val()).trim() /** .substring(0, 30) */;
    window.open($(this).data('href').replace('{0}', $(this).data('type') != null && $(this).data('type') === 'codePoint' ? defineContent.codePointAt() : encodeURIComponent(defineContent)), '_blank', 'width=1000,height=577');
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
    window.open($(this).data('href').replace('{0}', encodeURIComponent($sourceEntryInput.val().trimEnd())), '_blank', 'width=1000,height=577');
  }

  if (window.getSelection) {
    window.getSelection().removeAllRanges();
  } else if (document.selection) {
    document.selection.empty();
  }

  $sourceEntryInput.blur();
});

$('.upper-case-button').on('click', function onClick() {
  if ($targetEntryTextarea.val().length > 0) {
    let text = $targetEntryTextarea.val().toLowerCase();

    if ($(this).data('amount') !== '#') {
      for (let i = 0; i < $(this).data('amount'); i += 1) {
        text = text.replace(/(^| |\p{P})(\p{Ll})/u, (__, p1, p2) => p1 + p2.toUpperCase());
      }
    } else {
      text = text.replace(/(^| |\p{P})(\p{Ll})/gu, (__, p1, p2) => p1 + p2.toUpperCase());
    }

    $targetEntryTextarea.val(text).trigger('input');
    $targetEntryTextarea.prop('scrollTop', 0);
  }
});

$translateEntryButtons.on('click', async function onClick() {
  const inputText = $sourceEntryInput.val();

  const translatorOption = $(this).data('translator');
  const targetLanguage = $(this).data('lang');

  if (inputText.length > 0) {
    $translateEntryButtons.addClass('disabled');
    $sourceEntryInput.attr('readonly', true);
    $targetEntryTextarea.val(await translateText(inputText, translatorOption, targetLanguage, $(this).data('glossary') != null && Boolean($(this).data('glossary')) !== false)).trigger('input');
    $targetEntryTextarea.prop('scrollTop', 0);
    $sourceEntryInput.removeAttr('readonly');
    $translateEntryButtons.removeClass('disabled');
  }
});

$addButton.click(() => {
  if ($sourceEntryInput.val().length === 0) return;
  if (glossaryMap.has($sourceEntryInput.val())) glossary.splice(Array.from(glossaryMap, ([first]) => first.toUpperCase()).indexOf($sourceEntryInput.val().toUpperCase()), 1);
  glossary.push([$sourceEntryInput.val().trim().replace(/^\s+|\s+$/g, ''), $targetEntryTextarea.val().trim(), $tagsetSelect.val()]);
  reloadGlossaryEntries();
  $glossaryEntrySelect.change();
  $glossaryInput.val(null);
  $addButton.addClass('disabled');
  $removeButton.addClass('disabled');
});

$removeButton.on('click', () => {
  if (glossaryMap.has($sourceEntryInput.val())) {
    if (window.confirm('Bạn có muốn xoá cụm từ này chứ?')) {
      glossary.splice(Array.from(glossaryMap, ([first]) => first.toUpperCase()).indexOf($sourceEntryInput.val().toUpperCase()), 1);
      reloadGlossaryEntries();
      $glossaryInput.val(null);
      $sourceEntryInput.trigger('input');
    }
  } else {
    $glossaryEntrySelect.val('').change();
  }
});

$glossaryEntrySelect.change(function onChange() {
  if (glossaryMap.has($(this).val())) {
    $sourceEntryInput.val($(this).val()).trigger('input');
    $removeButton.removeClass('disabled');
  } else {
    $sourceEntryInput.val(null);
    $targetEntryTextarea.prop('scrollTop', 0);
    $targetEntryTextarea.val(null).trigger('input');
    $tagsetSelect.val('X');
    $removeButton.addClass('disabled');
  }
});

$glossaryName.on('change', reloadGlossaryEntries);
$inputTextarea.on('input', () => updateInputTextLength());
$inputTextarea.on('keypress', (event) => !(event.shiftKey && event.key === 'Enter') || ($translateButton.click() && $resultTextarea.focus()));

$resultTextarea.on('keydown', (event) => {
  const allowKey = [
    'Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'PrintScreen', 'ScrollLock', 'Pause', 'Cancel',
    'Insert', 'Home', 'PageUp', 'NumLock',
    'Tab', 'Enter', 'End', 'PageDown',
    'CapsLock',
    'Shift', 'ArrowUp',
    'Control', 'Meta', 'Alt', 'ContextMenu', 'ArrowLeft', 'ArrowDown', 'ArrowRight',
  ];

  return event.ctrlKey || (event.key === 'Escape' && document.activeElement.blur()) || allowKey.some((element) => event.key === element) || event.preventDefault();
});

$resultTextarea.on('drop', (event) => event.preventDefault());
$resultTextarea.on('cut', (event) => event.preventDefault());
$resultTextarea.on('paste', (event) => event.preventDefault());
$resultTextarea.on('keypress', (event) => (event.key !== 'Enter' || ((event.ctrlKey && $glossaryManagerButton.trigger('mousedown') && $glossaryManagerButton.click()) || ($translateButton.click() && $inputTextarea.focus()))) && event.preventDefault());
