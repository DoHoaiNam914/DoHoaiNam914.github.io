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
const $fontStackText = $('#font-stack-text');
const $fontSizeRange = $('#font-size-range');
const $lineSpacingRange = $('#line-spacing-range');
const $alignmentSettingsSwitch = $('#alignment-settings-switch');
const $formatSettingsSwitch = $('#format-settings-switch');
const $translatorOptions = $('.translator-option');
const $showOriginalTextSwitch = $('#show-original-text-switch');
const $defaultVietPhraseFileSelect = $('#default-viet-phrase-file-select');
const $vietPhraseEntryCounter = $('#viet-phrase-entry-counter');
const $vietPhraseInput = $('#viet-phrase-input');
const $addDeLeZhaoSwitch = $('#add-de-le-zhao-switch');
const $prioritizeNameOverVietPhraseCheck = $('#prioritize-name-over-viet-phrase-check');
const $translationAlgorithmRadio = $('.option[name="translation-algorithm-radio"]');
const $multiplicationAlgorithmRadio = $('.option[name="multiplication-algorithm-radio"]');

const $resetButton = $('#reset-button');

const $nameSwitch = $('#name-switch');
const $glossaryInput = $('#glossary-input');
const $glossaryTypeSelect = $('#glossary-type-select');
const $vietPhraseType = $('#viet-phrase-type-select');
const $languagePairsSelect = $('#language-pairs-select');
const $glossaryListSelect = $('#glossary-list-select');
const $sourceEntryInput = $('#source-entry-input');
const $dropdownHasCollapse = $('.dropdown-has-collapse');
const $targetEntryTextarea = $('#target-entry-textarea');
const $translateEntryButtons = $('.translate-entry-button');
const $addButton = $('#add-button');
const $removeButton = $('#remove-button');
const $glossaryEntrySelect = $('#glossary-entry-select');
const $glossaryName = $('#glossary-name');

const defaultOptions = JSON.parse('{"source_language":"","target_language":"vi","font-stack":"","font_size":100,"line_spacing":40,"alignment_settings":true,"format_settings":true,"translator":"microsoftTranslator","show_original_text":false,"default-viet-phrase-file-select":"3","add_de_le_zhao":false,"translation_algorithm":"0","prioritize_name_over_viet_phrase":false,"multiplication_algorithm":"2","name":true,"glossary_type":"text/plain","language_pairs":"zh-vi"}');

const SUPPORTED_LANGUAGES = ['', 'EN', 'JA', 'ZH', 'EN-US', 'auto', 'en', 'ja', 'zh-CN', 'zh-TW', 'vi', 'yue', 'zh-Hans', 'zh-Hant'];

let isLoaded = false;

let quickTranslateStorage = JSON.parse(localStorage.getItem('dich_nhanh')) ?? {};
const glossaryStorage = JSON.parse(localStorage.getItem('glossary')) ?? {};

const uuid = crypto.randomUUID();

let glossary = {
  simplified: [],
  traditional: [],
  pinyins: [],
  romajis: [
    ['ぁ', '~a'],
    ['あ', 'a'],
    ['ぃ', '~i'],
    ['い', 'i'],
    ['ぅ', '~u'],
    ['う', 'u'],
    ['ぇ', '~e'],
    ['え', 'e'],
    ['ぉ', '~o'],
    ['お', 'o'],
    ['か', 'ka'],
    ['か', 'ga'],
    ['きゃ', 'kya'],
    ['きゅ', 'kyu'],
    ['きょ', 'kyo'],
    ['き', 'ki'],
    ['ぎゃ', 'gya'],
    ['ぎゅ', 'gyu'],
    ['ぎょ', 'gyo'],
    ['ぎ', 'gi'],
    ['く', 'ku'],
    ['ぐ', 'gu'],
    ['け', 'ke'],
    ['げ', 'ge'],
    ['こ', 'ko'],
    ['ご', 'go'],
    ['さ', 'sa'],
    ['ざ', 'za'],
    ['しゃ', 'sha'],
    ['しゅ', 'shu'],
    ['しょ', 'sho'],
    ['し', 'shi'],
    ['じゃ', 'ja'],
    ['じゅ', 'ju'],
    ['じょ', 'jo'],
    ['じ', 'ji'],
    ['す', 'su'],
    ['ず', 'zu'],
    ['せ', 'se'],
    ['ぜ', 'ze'],
    ['そ', 'so'],
    ['ぞ', 'zo'],
    ['た', 'ta'],
    ['だ', 'da'],
    ['ちゃ', 'cha'],
    ['ちゅ', 'chu'],
    ['ちょ', 'cho'],
    ['ち', 'chi'],
    ['ぢゃ', 'dja'],
    ['ぢゅ', 'dju'],
    ['ぢょ', 'djo'],
    ['ぢ', 'dji'],
    ['っ', '~tsu'],
    ['つ', 'tsu'],
    ['づ', 'dzu'],
    ['て', 'te'],
    ['で', 'de'],
    ['と', 'to'],
    ['ど', 'do'],
    ['な', 'na'],
    ['にゃ', 'nya'],
    ['にゅ', 'nyu'],
    ['にょ', 'nyo'],
    ['に', 'ni'],
    ['ぬ', 'nu'],
    ['ね', 'ne'],
    ['の', 'no'],
    ['は', 'wa', 'ha'],
    ['ば', 'ba'],
    ['ぱ', 'pa'],
    ['ひゃ', 'hya'],
    ['ひゅ', 'hyu'],
    ['ひょ', 'hyo'],
    ['ひ', 'hi'],
    ['びゃ', 'bya'],
    ['びゅ', 'byu'],
    ['びょ', 'byo'],
    ['び', 'bi'],
    ['ぴゃ', 'pya'],
    ['ぴゅ', 'pyu'],
    ['ぴょ', 'pyo'],
    ['ぴ', 'pi'],
    ['ふ', 'fu'],
    ['ぶ', 'bu'],
    ['ぷ', 'pu'],
    ['へ', 'e', 'he'],
    ['べ', 'be'],
    ['ぺ', 'pe'],
    ['ほ', 'ho'],
    ['ぼ', 'bo'],
    ['ぽ', 'po'],
    ['ま', 'ma'],
    ['みゃ', 'mya'],
    ['みゅ', 'myu'],
    ['みょ', 'myo'],
    ['み', 'mi'],
    ['む', 'mu'],
    ['め', 'me'],
    ['も', 'mo'],
    ['ゃ', '~ya'],
    ['や', 'ya'],
    ['ゅ', '~yu'],
    ['ゆ', 'yu'],
    ['ょ', '~yo'],
    ['よ', 'yo'],
    ['ら', 'ra'],
    ['りゃ', 'rya'],
    ['りゅ', 'ryu'],
    ['りょ', 'ryo'],
    ['り', 'ri'],
    ['る', 'ru'],
    ['れ', 're'],
    ['ろ', 'ro'],
    ['ゎ', '~wa'],
    ['わ', 'wa'],
    ['ゐ', 'wi'],
    ['ゑ', 'we'],
    ['を', 'o', 'wo'],
    ['ん', 'n'],
    ['ゔ', 'vu'],
    ['ゕ', '~ka'],
    ['ゖ', '~ke'],

    ['ァ', '~a'],
    ['ア', 'a'],
    ['ィ', '~i'],
    ['イェ', 'ye'],
    ['イ', 'i'],
    ['ゥ', '~u'],
    ['ウ', 'u'],
    ['ェ', '~e'],
    ['エ', 'e'],
    ['ォ', '~o'],
    ['オ', 'o'],
    ['カ', 'ka'],
    ['ガ', 'ga'],
    ['キャ', 'kya'],
    ['キュ', 'kyu'],
    ['キョ', 'kyo'],
    ['キ', 'ki'],
    ['ギャ', 'gya'],
    ['ギュ', 'gyu'],
    ['ギョ', 'gyo'],
    ['ギ', 'gi'],
    ['ク', 'ku'],
    ['グ', 'gu'],
    ['ケァ', 'kwa'],
    ['ケィ', 'kwi'],
    ['ケェ', 'kwe'],
    ['ケォ', 'kwo'],
    ['ケ', 'ke'],
    ['ケァ', 'gwa'],
    ['ケィ', 'gwi'],
    ['ケェ', 'gwe'],
    ['ケォ', 'gwo'],
    ['ゲ', 'ge'],
    ['コ', 'ko'],
    ['ゴ', 'go'],
    ['サ', 'sa'],
    ['ザ', 'za'],
    ['シェ', 'she'],
    ['シャ', 'sha'],
    ['シュ', 'shu'],
    ['ショ', 'sho'],
    ['シ', 'shi'],
    ['ジェ', 'je'],
    ['ジャ', 'ja'],
    ['ジュ', 'ju'],
    ['ジョ', 'jo'],
    ['ジ', 'ji'],
    ['スィ', 'swi'],
    ['ス', 'su'],
    ['ズィ', 'zwi'],
    ['ズ', 'zu'],
    ['セ', 'se'],
    ['ゼ', 'ze'],
    ['ソ', 'so'],
    ['ゾ', 'zo'],
    ['タ', 'ta'],
    ['ダ', 'da'],
    ['チェ', 'che'],
    ['チャ', 'cha'],
    ['チュ', 'chu'],
    ['チョ', 'cho'],
    ['チ', 'chi'],
    ['ヂャ', 'dja'],
    ['ヂュ', 'dju'],
    ['ヂョ', 'djo'],
    ['ヂ', 'dji'],
    ['ッ', '~tsu'],
    ['ツァ', 'tsa'],
    ['ツィ', 'tsi'],
    ['ツェ', 'tse'],
    ['ツォ', 'tso'],
    ['ツ', 'tsu'],
    ['ヅ', 'dzu'],
    ['ティ', 'ti'],
    ['テゥ', 'tu'],
    ['テュ', 'tyu'],
    ['テ', 'te'],
    ['ティ', 'di'],
    ['テゥ', 'du'],
    ['テュ', 'dyu'],
    ['デ', 'de'],
    ['ト', 'to'],
    ['ド', 'do'],
    ['ナ', 'na'],
    ['ニャ', 'nya'],
    ['ニュ', 'nyu'],
    ['ニョ', 'nyo'],
    ['ニ', 'ni'],
    ['ヌ', 'nu'],
    ['ネ', 'ne'],
    ['ノ', 'no'],
    ['ハ', 'ha'],
    ['バ', 'ba'],
    ['パ', 'pa'],
    ['ヒャ', 'hya'],
    ['ヒュ', 'hyu'],
    ['ヒョ', 'hyo'],
    ['ヒ', 'hi'],
    ['ビャ', 'bya'],
    ['ビュ', 'byu'],
    ['ビョ', 'byo'],
    ['ビ', 'bi'],
    ['ピャ', 'pya'],
    ['ピュ', 'pyu'],
    ['ピョ', 'pyo'],
    ['ピ', 'pi'],
    ['ファ', 'fa'],
    ['フィ', 'fi'],
    ['フェ', 'fe'],
    ['フォ', 'fo'],
    ['フュ', 'fyu'],
    ['フ', 'fu'],
    ['ブ', 'bu'],
    ['プ', 'pu'],
    ['ヘ', 'e', 'he'],
    ['ベ', 'be'],
    ['ペ', 'pe'],
    ['ホ', 'ho'],
    ['ボ', 'bo'],
    ['ポ', 'po'],
    ['マ', 'ma'],
    ['ミャ', 'mya'],
    ['ミュ', 'myu'],
    ['ミョ', 'myo'],
    ['ミ', 'mi'],
    ['ム', 'mu'],
    ['メ', 'me'],
    ['モ', 'mo'],
    ['ャ', '~ya'],
    ['ヤ', 'ya'],
    ['ュ', '~yu'],
    ['ユ', 'yu'],
    ['ョ', '~yo'],
    ['ヨ', 'yo'],
    ['ラ', 'ra'],
    ['リャ', 'rya'],
    ['リュ', 'ryu'],
    ['リョ', 'ryo'],
    ['リ', 'ri'],
    ['ル', 'ru'],
    ['レ', 're'],
    ['ロ', 'ro'],
    ['ヮ', '~wa'],
    ['ワ', 'wa'],
    ['ヰ', 'wi'],
    ['ヱ', 'we'],
    ['ヲ', 'o', 'wo'],
    ['ン', 'n'],
    ['ヴァ', 'va'],
    ['ヴィ', 'vi'],
    ['ヴェ', 've'],
    ['ヴォ', 'vo'],
    ['ヴャ', 'vya'],
    ['ヴュ', 'vyu'],
    ['ヴョ', 'vyo'],
    ['ヴ', 'vu'],
    ['ヵ', '~ka'],
    ['ヶ', '~ke'],
    ['ヷ', 'va'],
    ['ヸ', 'vi'],
    ['ヹ', 've'],
    ['ヺ', 'vo'],

    ['ㇰ', '~ku'],
    ['ㇱ', '~shi'],
    ['ㇲ', '~su'],
    ['ㇳ', '~to'],
    ['ㇴ', '~ne'],
    ['ㇵ', '~ha'],
    ['ㇶ', '~hi'],
    ['ㇷ', '~fu'],
    ['ㇸ', '~he'],
    ['ㇹ', '~ho'],
    ['ㇺ', '~mu'],
    ['ㇻ', '~ra'],
    ['ㇼ', '~ri'],
    ['ㇽ', '~ru'],
    ['ㇾ', '~re'],
    ['ㇿ', '~ro'],
  ],
  KunYomis: [],
  OnYomis: [],
  hanViet: [],
  SinoVietnameses: [],
  vietPhrase: [],
  vietPhrasePhu: [],
  name: [],
  namePhu: [],
  luatNhan: [],
  pronoun: [],
};

let glossaryObject = {};

let glossaryData = '';

let currentTranslator = null;
let translateAbortController = null;
let prevScrollTop = 0;

let lastSession = {};

const OptionTypes = {
  CHECK: 'check',
  SWITCH: 'switch',
  RADIO: 'radio',
  RANGE: 'range',
  TEXT: 'text',
  SELECT: 'select',
  DROPDOWN: 'dropdown',
};

const GlossaryType = {
  TSV: 'text/tab-separated-values',
  CSV: 'text/csv',
  VIETPHRASE: 'text/plain',
};

function getOptionId(id) {
  return id.match(/(.+)-(?:check|switch|radio|range|text|select|dropdown)$/)[1].replaceAll(/-/g, '_');
}

function getOptionType(id) {
  return id.match(/.+-(check|switch|radio|range|text|select|dropdown)$/)[1];
}

function getCurrentOptions() {
  const data = {};

  try {
    $options.each((__, element) => {
      const option = $(element);
      const optionId = getOptionId(option.attr('name') ?? option.attr('id'));
      const optionType = getOptionType(option.attr('name') ?? option.attr('id'));

      switch (optionType) {
        case OptionTypes.CHECK:
        case OptionTypes.SWITCH: {
          data[optionId] = option.prop('checked');
          break;
        }
        case OptionTypes.RADIO: {
          if (option.prop('checked') === true) data[optionId] = option.val();
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
    if (optionId === 'font-stack') console.log(quickTranslateStorage[optionId]);

    switch (optionType) {
      case OptionTypes.CHECK:
      case OptionTypes.SWITCH: {
        option.attr('checked', quickTranslateStorage[optionId]).change();
        break;
      }
      case OptionTypes.RADIO: {
        if (option.val() === quickTranslateStorage[optionId]) {
          $(`.option[name="${option.attr('name')}"]`).removeAttr('checked');
          option.attr('checked', true);
        }

        break;
      }
      case OptionTypes.RANGE:
      case OptionTypes.TEXT: {
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

function applyNameToText(text, translator = Translators.VIETPHRASE, name = glossary.name.concat(glossary.namePhu), multiple = false) {
  let nameEntries = (translator === Translators.VIETPHRASE ? name : glossary.namePhu).map(([first, second]) => [first.toUpperCase(), second]);
  nameEntries = nameEntries.filter(([first]) => text.toLowerCase().includes(first.toLowerCase()));
  const nameObject = Object.fromEntries(nameEntries);

  let result = text;

  if (nameEntries.length > 0) {
    const lines = text.split('\n');
    const nameLengths = nameEntries.reduce((accumulator, [first]) => (!accumulator.includes(first.length) ? accumulator.concat(first.length) : accumulator), [1]).sort((a, b) => b - a);

    const results = [];

    lines.forEach((a) => {
      const chars = a.split(/(?:)/u);

      if (chars.length === 0) {
        results.push(a);
      } else {
        let tempLine = '';
        let prevPhrase = '';

        for (let i = 0; i < chars.length; i += 1) {
          for (let j = 0; j < nameLengths.length; j += 1) {
            const length = Math.min(chars.length, nameLengths[j]);
            let phrase = translator === Translators.DEEPL_TRANSLATE || translator === Translators.GOOGLE_TRANSLATE ? Utils.convertHtmlToText(a.substring(i, i + length)) : a.substring(i, i + length);

            const charsInTempLine = tempLine.split(/(?:)/u);

            if (Object.hasOwn(nameObject, phrase.toUpperCase())) {
              phrase = translator === Translators.DEEPL_TRANSLATE || translator === Translators.GOOGLE_TRANSLATE ? Utils.convertHtmlToText(a.substring(i, i + length).toUpperCase()) : phrase.toUpperCase();
              let phraseResult = nameObject[phrase];
              if (!multiple || translator !== Translators.VIETPHRASE) [phraseResult] = phraseResult.split(/[/|]/);

              if (phraseResult !== '') {
                tempLine += (charsInTempLine.length > 0 && (/[\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(charsInTempLine[charsInTempLine.length - 1]) || prevPhrase.length === 0) ? ' ' : '') + getIgnoreTranslationMarkup(phrase, phraseResult, translator);
                prevPhrase = phraseResult;
              }

              i += length - 1;
              break;
            }

            if (length === 1) {
              tempLine += (charsInTempLine.length > 0 && /[\p{Lu}\p{Ll}\p{Nd}([{‘“]/u.test(a[i]) && /[\p{Lu}\p{Ll}\p{Nd})\]}’”]$/u.test(prevPhrase) ? ' ' : '') + (translator === Translators.DEEPL_TRANSLATE || translator === Translators.GOOGLE_TRANSLATE ? Utils.convertTextToHtml(phrase) : phrase);
              prevPhrase = /[^\p{Lu}\p{Ll}\p{M}\p{Nd})\]}’”]$/u.test(phrase) ? phrase : '';
              break;
            }
          }
        }

        results.push(tempLine);
      }
    });

    result = results.join('\n');
  }

  return result;
}

function getMaxQueryLengthAndLine(translator, text) {
  switch (translator) {
    case Translators.BAIDU_FANYI: {
      return [1000, text.split('\n').length];
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
      return [text.length, text.split('\n').length];
    }
  }
}

function buildResult(inputText, result) {
  try {
    const resultDiv = document.createElement('div');

    const originalLines = inputText.split(/\r?\n/).map((element) => element.trimStart());
    const resultLines = result.split('\n').map((element) => element.trimStart());

    if ($showOriginalTextSwitch.prop('checked') && result !== 'Vui lòng nhập tệp VietPhrase.txt hoặc bật tuỳ chọn [Tải tệp VietPhrase mặc định] và tải lại trang!') {
      let lostLineFixedNumber = 0;

      for (let i = 0; i < originalLines.length; i += 1) {
        if (i + lostLineFixedNumber < resultLines.length) {
          if (originalLines[i + lostLineFixedNumber].trim().replace(/^\s+/, '').length === 0 && resultLines[i].trim().replace(/^\s+/, '').length > 0) {
            lostLineFixedNumber += 1;
            i -= 1;
          } else if ($translatorOptions.filter($('.active')).data('id') === Translators.PAPAGO && resultLines[i].trim().replace(/^\s+/, '').length === 0 && originalLines[i + lostLineFixedNumber].trim().replace(/^\s+/, '').length > 0) {
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
              paragraph.innerText += resultLines[i].trim().length > 0 ? ' ' : '';
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

    return resultDiv.innerHTML.replaceAll(/(<p>)(<\/p>)/g, '$1<br>$2');
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

  const nameEnabled = $nameSwitch.prop('checked');

  const processText = nameEnabled && [Translators.BAIDU_FANYI, Translators.PAPAGO].every((element) => translatorOption !== element) && (translatorOption === Translators.VIETPHRASE ? $prioritizeNameOverVietPhraseCheck.prop('checked') && targetLanguage === 'vi' : isPairing) ? applyNameToText(inputText, translatorOption) : inputText;
  const processTextToCheck = nameEnabled && translatorOption === Translators.VIETPHRASE && targetLanguage === 'vi' && !$prioritizeNameOverVietPhraseCheck.prop('checked') ? applyNameToText(inputText, translatorOption) : processText;

  const [MAX_LENGTH, MAX_LINE] = getMaxQueryLengthAndLine(translatorOption, processTextToCheck);

  if (translatorOption !== Translators.DEEPL_TRANSLATE && processText.split('\n').toSorted((a, b) => b.length - a.length)[0].length > MAX_LENGTH) throw console.error(`Số lượng từ trong một dòng quá dài (Số lượng từ hợp lệ nhỏ hơn hoặc bằng ${MAX_LENGTH}).`);

  try {
    let result = '';

    if (Object.keys(lastSession).length > 0 && lastSession.inputText === processTextToCheck && lastSession.translatorOption === translatorOption && lastSession.sourceLanguage === sourceLanguage && lastSession.targetLanguage === targetLanguage) {
      result = lastSession.result;
    } else {
      if (translatorOption === Translators.DEEPL_TRANSLATE && currentTranslator.usage.character_count + inputText.length > currentTranslator.usage.character_limit) throw console.error(`Lỗi DeepL Translator: Đã đạt đến giới hạn dịch của tài khoản. (${currentTranslator.usage.character_count}/${currentTranslator.usage.character_limit} ký tự).`);

      if (processText.split(/\r?\n/).length <= MAX_LINE && (translatorOption === Translators.DEEPL_TRANSLATE ? (new TextEncoder()).encode(`text=${processText.split(/\r?\n/).map((element) => encodeURIComponent(element)).join('&text=')}&source_lang=${sourceLanguage}&target_lang=${targetLanguage}&tag_handling=xml`) : processText).length <= MAX_LENGTH) {
        switch (translatorOption) {
          case Translators.VIETPHRASE: {
            result = await currentTranslator.translateText(sourceLanguage, targetLanguage, processText, $translationAlgorithmRadio.filter('[checked]').val(), $multiplicationAlgorithmRadio.filter('[checked]').val(), $prioritizeNameOverVietPhraseCheck.prop('checked'), $addDeLeZhaoSwitch.prop('checked'), true, glossary, nameEnabled && targetLanguage === 'vi');
            break;
          }
          default: {
            result = await currentTranslator.translateText(sourceLanguage, targetLanguage, processText);
          }
        }
      } else {
        const inputLines = processText.split(/\r?\n/);
        let queryLines = [];
        const results = [];

        switch (translatorOption) {
          case Translators.DEEPL_TRANSLATE: {
            while (inputLines.length > 0 && queryLines.length + 1 <= MAX_LINE && (new TextEncoder()).encode(`text=${[...queryLines, inputLines[0]].map((element) => encodeURIComponent(element)).join('&text=')}&source_lang=${sourceLanguage}&target_lang=${targetLanguage}&tag_handling=xml`).length <= MAX_LENGTH) {
              if (translateAbortController.signal.aborted) break;
              queryLines.push(inputLines.shift());

              if (inputLines.length === 0 || queryLines.length + 1 > MAX_LINE || (new TextEncoder()).encode(`text=${[...queryLines, inputLines[0]].map((element) => encodeURIComponent(element)).join('&text=')}&source_lang=${sourceLanguage}&target_lang=${targetLanguage}&tag_handling=xml`).length > MAX_LENGTH) {
                results.push(await currentTranslator.translateText(sourceLanguage, targetLanguage, queryLines.join('\n')));
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
                results.push(await currentTranslator.translateText(sourceLanguage, targetLanguage, queryLines.join('\n')));
                queryLines = [];
              }
            }
            break;
          }
        }

        result = results.join('\n');
      }

      if (translateAbortController.signal.aborted) return;
      $('#translate-timer').text(Date.now() - startTime);
      lastSession.inputText = processTextToCheck;
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
    const text = glossaryEnabled && [Translators.BAIDU_FANYI, Translators.PAPAGO].every((element) => translatorOption !== element) ? applyNameToText(inputText, translatorOption, glossary[$glossaryListSelect.val()]) : inputText;
    let sourceLanguage = '';
    let translator = null;

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
        translator = await new Vietphrase();
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
    let result = text;

    switch (translatorOption) {
      case Translators.VIETPHRASE: {
        result = await translator.translateText(sourceLanguage, targetLanguage, text, $translationAlgorithmRadio.filter('[checked]').val(), $multiplicationAlgorithmRadio.filter('[checked]').val(), true, $addDeLeZhaoSwitch.prop('checked'), false, glossary, glossaryEnabled, glossary[$glossaryListSelect.val()]);
        break;
      }
      default: {
        result = await translator.translateText(sourceLanguage, targetLanguage, text);
      }
    }

    return result;
  } catch (error) {
    console.error(error);
    return `Bản dịch thất bại: ${error}`;
  }
}

function reloadGlossaryEntries() {
  let entrySelect = document.createElement('select');
  let entriesList = document.createElement('datalist');

  const defaultOption = document.createElement('option');
  defaultOption.innerText = 'Chọn...';
  defaultOption.value = '';
  entrySelect.appendChild(defaultOption);

  const $downloadButton = $('#download-button');
  const $glossaryExtension = $('#glossary-extension');
  const glossaryList = $glossaryListSelect.val();

  glossary[glossaryList] = glossary[glossaryList].filter(([first], __, array) => !array[first] && (array[first] = 1), {}).toSorted((a, b) => a[1].localeCompare(b[1], 'vi', { ignorePunctuation: true }) || a[0].localeCompare(b[0], 'vi', { sensitivity: 'accent', ignorePunctuation: true }) || b.join('\t').length - a.join('\t').length).map(([first, second]) => [first.trim(), second]);
  glossaryObject = Object.fromEntries(glossary[glossaryList]);

  if (glossary[glossaryList].length > 0) {
    if (glossary[glossaryList].length < 5000) {
      glossary[glossaryList].forEach(([first, second]) => {
        const option = document.createElement('option');
        option.innerText = `${first} → ${second}`;
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
    }

    switch ($glossaryTypeSelect.val()) {
      case GlossaryType.CSV: {
        glossaryData = $.csv.fromArrays(glossary[glossaryList].toSorted((a, b) => b[0].concat(`\t${b[1]}`).length - a[0].concat(`\t${a[1]}`).length || a[1].localeCompare(b[1], 'vi', { ignorePunctuation: true }) || a[0].localeCompare(b[0], 'vi', { ignorePunctuation: true })));
        $glossaryExtension.text('csv');
        break;
      }
      case GlossaryType.VIETPHRASE: {
        switch ($vietPhraseType.val()) {
          case 'QuickTranslate Without Sorting': {
            glossaryData = `\ufeff${glossary[glossaryList].map((element) => element.join('=')).join('\r\n')}`;
            break;
          }
          case 'QuickTranslate': {
            glossaryData = `\ufeff${glossary[glossaryList].toSorted((a, b) => b[0].length - a[0].length || a[0].localeCompare(b[0])).map((element) => element.join('=')).join('\r\n')}`;
            break;
          }
          case 'Sáng Tác Việt': {
            glossaryData = glossary[glossaryList].toSorted((a, b) => a[0].length - b[0].length).map((element) => element.join('=')).join('\n');
            break;
          }
          default: {
            glossaryData = glossary[glossaryList].map((element) => element.join('=')).join('\n');
            break;
          }
        }

        $glossaryExtension.text('txt');
        break;
      }
      default: {
        glossaryData = glossary[glossaryList].toSorted((a, b) => b[0].concat(`\t${b[1]}`).length - a[0].concat(`\t${a[1]}`).length || a[1].localeCompare(b[1], 'vi', { ignorePunctuation: true }) || a[0].localeCompare(b[0], 'vi', { ignorePunctuation: true })).map((element) => element.join('\t')).join('\n');
        $glossaryExtension.text('tsv');
        break;
      }
    }

    $downloadButton.attr('href', URL.createObjectURL(new Blob([glossaryData], { type: `${$glossaryTypeSelect.val()}; charset=UTF-8` })));
    $downloadButton.attr('download', `${$glossaryName.val().length > 0 ? $glossaryName.val() : $glossaryName.attr('placeholder')}.${$glossaryExtension.text()}`);
    $downloadButton.removeClass('disabled');
  } else {
    glossaryData = '';
    $downloadButton.removeAttr('href');
    $downloadButton.removeAttr('download');
    $downloadButton.addClass('disabled');
  }

  $glossaryEntrySelect.html(entrySelect.innerHTML);
  entrySelect = null;
  $('#glossary-entries-list').html(entriesList.innerHTML);
  entriesList = null;
  $glossaryEntrySelect.val(defaultOption.value);
  $('#glossary-entry-counter').text(glossary[glossaryList].length);
  if (isLoaded) $inputTextarea.trigger('input');
  glossaryStorage[glossaryList] = glossary[glossaryList].length < 5000 ? glossary[glossaryList] : [];
  localStorage.setItem('glossary', JSON.stringify(glossaryStorage));
  $glossaryInput.val(null);
}

$(document).ready(async () => {
  $('input[type="file"]').val(null);
  loadAllQuickTranslatorOptions();

  glossary = { ...glossary, ...glossaryStorage };

  await $.ajax({
    method: 'GET',
    url: '/static/datasource/Unihan_Variants.txt',
  }).done((data) => {
    const array = data.split('\n').filter((element) => element.length !== 0 && !element.startsWith('#')).map((element) => element.split('\t'));

    glossary.traditional = array.filter((element) => element.length === 3 && element[1] === 'kTraditionalVariant').map(([first, __, third]) => [String.fromCodePoint(parseInt(first.substring(2), 16)), third.split(' ').filter((element) => third.split(' '). length === 1 || element !== first).map((element) => String.fromCodePoint(parseInt(element.substring(2), 16)))[0]]);
    console.info(`Đã tải xong bộ dữ liệu phổn thể (${glossary.traditional.length})!`);

    glossary.simplified = array.filter((element) => element.length === 3 && element[1] === 'kSimplifiedVariant').map(([first, __, third]) => [String.fromCodePoint(parseInt(first.substring(2), 16)), third.split(' ').filter((element) => third.split(' '). length === 1 || element !== first).map((element) => String.fromCodePoint(parseInt(element.substring(2), 16)))[0]]);
    console.info(`Đã tải xong bộ dữ liệu giản thể (${glossary.simplified.length})!`);
    lastSession = {};
  }).fail((__, ___, errorThrown) => {
    console.error('Không thể tải bộ dữ liệu phổn thể và phổn thể:', errorThrown);
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  });

  try {
    let chinesePhienAmWordList = cjkv.nam.map(([first, second]) => [first, second.split(',').filter((element) => element.length > 0)[0].trimStart().replaceAll(Utils.getTrieRegexPatternFromWords(Object.keys(newAccentObject)), (match) => newAccentObject[match] ?? match)]);
    chinesePhienAmWordList = chinesePhienAmWordList.concat(hanData.names.map(([first, second]) => [first, second.split(',').filter((element) => element.length > 0)[0].replaceAll(Utils.getTrieRegexPatternFromWords(Object.keys(newAccentObject)), (match) => newAccentObject[match] ?? match)]));
    chinesePhienAmWordList = chinesePhienAmWordList.filter((element, __, array) => element.join('=').length > 0 && element.length === 2 && !array[element[0]] && (array[element[0]] = 1), {});
    glossary.hanViet = chinesePhienAmWordList;
    console.info(`Đã tải xong bộ dữ liệu hán việt (${chinesePhienAmWordList.length})!`);
  } catch (error) {
    console.error('Không thể tải bộ dữ liệu hán việt:', error);
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  }

  await $.ajax({
    method: 'GET',
    url: '/static/datasource/Unihan_Readings.txt',
  }).done((data) => {
    glossary.pinyins = data.split('\n').filter((element) => element.length !== 0 && !element.startsWith('#') && element.split('\t')[1] === 'kMandarin').map((element) => element.split('\t')).map(([first, __, third]) => [String.fromCodePoint(parseInt(first.substring(2), 16)), third.split(' ')[0]]);
    console.info(`Đã tải xong bộ dữ liệu bính âm (${glossary.pinyins.size})!`);

    const array = data.split('\n').filter((element) => element.length !== 0 && !element.startsWith('#')).map((element) => element.split('\t'));

    glossary.KunYomis = array.filter((element) => element.length === 3 && element[1] === 'kJapaneseKun').map(([first, __, third]) => [String.fromCodePoint(parseInt(first.substring(2), 16)), third.split(' ')[0].toLowerCase()]);
    console.info(`Đã tải xong bộ dữ liệu Kun'yomi (${glossary.KunYomis.length})!`);
    glossary.OnYomis = array.filter((element) => element.length === 3 && element[1] === 'kJapaneseOn').map(([first, __, third]) => [String.fromCodePoint(parseInt(first.substring(2), 16)), third.split(' ')[0].toLowerCase()]);
    console.info(`Đã tải xong bộ dữ liệu On'yomi (${glossary.OnYomis.length})!`);
    lastSession = {};
  }).fail((__, ___, errorThrown) => {
    console.error('Không thể tải bộ dữ liệu bính âm, Kun\'yomi và On\'yomi:', errorThrown);
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  });

  $defaultVietPhraseFileSelect.change();
  $glossaryListSelect.val('namePhu').change();
  isLoaded = true;
  $inputTextarea.trigger('input');
  lastSession = {};
  console.log('Đã tải xong!');
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
      $resultTextarea.html($resultTextarea.html().split(/<br>|<\/p><p>/).map((element, index) => (index === 0 ? `Đang dịch...${element.slice(12).replaceAll(/./g, ' ')}` : element.replaceAll(/./g, ' '))).join('<br>'));
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
    if (clipText === $($(this).data('target')).val()) return;
    $($(this).data('target')).prop('scrollLeft', 0);
    $($(this).data('target')).prop('scrollTop', 0);

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
  $sourceEntryInput.val(getSelectedTextOrActiveElementText().replaceAll(/\n/g, ' ').trim());

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
    $inputTextarea.trigger('input');
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

  if (isLoaded) {
    if ($fontStackText.val().length === 0) $fontStackText.val($(this).data('font-family') ?? '').change();
    if ($(this).data('font-size') != null) $fontSizeRange.val($(this).data('font-size')).change();
    if ($(this).data('line-height') != null) $lineSpacingRange.val($(this).data('line-height')).change();
    if ($(this).data('text-align') != null) $alignmentSettingsSwitch.prop('checked', $(this).data('text-align') === 'justify').change();
  }

  quickTranslateStorage[getOptionId($(this).parent().parent().parent().attr('id'))] = $(this).text();
  localStorage.setItem('dich_nhanh', JSON.stringify(quickTranslateStorage));
});

$fontStackText.change(function onChange() {
  const values = $(this).val().split(/, */);
  $(this).val(values.join(', '));

  $(document.documentElement).css('--opt-font-family', values.map((element) => {
    const maybeFontStacks = element.startsWith('--') ? `var(${element})` : element;
    return element.includes(' ') ? `'${element}'` : maybeFontStacks;
  }).join(', '));

  const $currentTheme = $themeOptions.filter('.active');
  $('.textarea').css('font-weight', ['Apple Sách - Nguyên bản', 'Google Play Sách'].some((element) => $currentTheme.text().startsWith(element)) && values.some((element) => element.toLowerCase().startsWith('pingfang')) ? 500 : ($currentTheme.data('font-weight') ?? ''));
  quickTranslateStorage[getOptionId($(this).attr('id'))] = values.join(', ');
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

$translatorOptions.click(async function onClick() {
  $translatorOptions.removeClass('active');
  $(this).addClass('active');
  updateLanguageSelect($(this).data('id'), quickTranslateStorage.translator);

  switch ($(this).data('id')) {
    case Translators.BAIDU_FANYI: {
      currentTranslator = new BaiduFanyi();
      break;
    }
    case Translators.DEEPL_TRANSLATE: {
      currentTranslator = await new DeeplTranslate().init();
      break;
    }
    case Translators.GOOGLE_TRANSLATE: {
      currentTranslator = await new GoogleTranslate().init();
      break;
    }
    case Translators.PAPAGO: {
      currentTranslator = await new Papago(uuid).init();
      break;
    }
    case Translators.VIETPHRASE: {
      currentTranslator = new Vietphrase();
      break;
    }
    default: {
      currentTranslator = await new MicrosoftTranslator().init();
      break;
    }
  }

  quickTranslateStorage[getOptionId($(this).parent().parent().parent().attr('id'))] = $(this).data('id');
  localStorage.setItem('dich_nhanh', JSON.stringify(quickTranslateStorage));
  $inputTextarea.trigger('input');
  $retranslateButton.click();
});

$showOriginalTextSwitch.change(function onChange() {
  quickTranslateStorage[getOptionId($(this).attr('id'))] = $(this).prop('checked');
  $retranslateButton.click();
});

$vietPhraseInput.on('change', function onChange() {
  const reader = new FileReader();

  reader.onload = function onLoad() {
    glossary.vietPhrase = this.result.split(/\r?\n|\r/).filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('=')).filter(([first], __, array) => !array[first] && (array[first] = 1), {});
    $vietPhraseEntryCounter.text(glossary.vietPhrase.length);
    console.info(`Đã tải xong tệp ${$vietPhraseInput.prop('files')[0].name} (${$vietPhraseEntryCounter.text()})!`);
    lastSession = {};
  };

  reader.readAsText($(this).prop('files')[0]);
});

$defaultVietPhraseFileSelect.change(async function onChange() {
  const intValue = parseInt($(this).val(), 10);

  if (intValue > 0) {
    switch (intValue) {
      case 1: {
        try {
          glossary.vietPhraseForCombineFile = (await $.ajax({
            method: 'GET',
            url: '/static/datasource/Quick Translator/Vietphrase cho file gộp.txt',
          })).split('\r\n').slice(1).filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('='));

          glossary.vietPhrase = glossary.vietPhraseForCombineFile.concat((await $.ajax({
            method: 'GET',
            url: '/static/datasource/Quick Translator/Vietphrase.txt',
          })).split('\r\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('='))).filter(([first], __, array) => !array[first] && (array[first] = 1), {});

          $vietPhraseEntryCounter.text(glossary.vietPhrase.length);
          console.info(`Đã tải xong tệp VietPhrase (${$vietPhraseEntryCounter.text()})!`);
          lastSession = {};
        } catch (error) {
          console.error('Không tải được tệp VietPhrase:', error);
        }
        break;
      }
      case 2: {
        await $.ajax({
          method: 'GET',
          url: '/static/datasource/Data của thtgiang/VietPhrase.txt',
        }).done((data) => {
          glossary.vietPhrase = data.split('\r\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('=')).filter(([first], __, array) => !array[first] && (array[first] = 1), {});
          $vietPhraseEntryCounter.text(glossary.vietPhrase.length);
          console.info(`Đã tải xong tệp VietPhrase (${$vietPhraseEntryCounter.text()})!`);
          lastSession = {};
        }).fail((__, ___, errorThrown) => {
          console.error('Không tải được tệp VietPhrase:', errorThrown);
        });

        break;
      }
      case 3: {
        await $.ajax({
          method: 'GET',
          url: '/static/datasource/ttvtranslate/VietPhrase.txt',
        }).done((data) => {
          glossary.vietPhrase = data.split('\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('=')).filter(([first], __, array) => !array[first] && (array[first] = 1), {});
          $vietPhraseEntryCounter.text(glossary.vietPhrase.length);
          console.info(`Đã tải xong tệp VietPhrase (${$vietPhraseEntryCounter.text()})!`);
          lastSession = {};
        }).fail((__, ___, errorThrown) => {
          console.error('Không tải được tệp VietPhrase:', errorThrown);
        });

        break;
      }
      case 4: {
        await $.ajax({
          method: 'GET',
          url: '/static/datasource/vn.tangthuvien.ttvtranslate-1.2.2/VietPhrase.txt',
        }).done((data) => {
          glossary.vietPhrase = data.split('\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('=')).filter(([first], __, array) => !array[first] && (array[first] = 1), {});
          $vietPhraseEntryCounter.text(glossary.vietPhrase.length);
          console.info(`Đã tải xong tệp VietPhrase (${$vietPhraseEntryCounter.text()})!`);
          lastSession = {};
        }).fail((__, ___, errorThrown) => {
          console.error('Không tải được tệp VietPhrase:', errorThrown);
        });

        break;
      }
      // no default
    }
  }
});

$resetButton.on('click', () => {
  if (!window.confirm('Bạn có muốn đặt lại tất cả thiết lập chứ?')) return;
  localStorage.setItem('dich_nhanh', JSON.stringify(defaultOptions));
  if (window.confirm('Bạn có muốn tải lại trang ngay chứ?')) window.location.reload();
});

$('#glossary-modal').on('shown.bs.modal', () => {
  $sourceEntryInput.trigger('input');
});

$('#glossary-modal').on('hide.bs.modal', () => {
  $sourceEntryInput.prop('scrollLeft', 0);
  $targetEntryTextarea.prop('scrollTop', 0);
  $glossaryEntrySelect.val('').change();
  $addButton.addClass('disabled');
  $removeButton.addClass('disabled');
});

$glossaryInput.on('change', function onChange() {
  const reader = new FileReader();

  reader.onload = function onLoad() {
    switch ($glossaryInput.prop('files')[0].type) {
      case GlossaryType.CSV: {
        glossary[$glossaryListSelect.val()] = $.csv.toArrays(this.result).filter((element) => element.length >= 2);
        $glossaryTypeSelect.val(GlossaryType.CSV);
        break;
      }
      case GlossaryType.VIETPHRASE: {
        glossary[$glossaryListSelect.val()] = this.result.split(/\r?\n|\r/).filter((element) => element.length > 0 && ($glossaryListSelect.val() !== 'luatNhan' || !element.startsWith('#')) && element.split('=').length === 2).map((element) => element.split('=')).filter(([first], __, array) => !array[first] && (array[first] = 1), {});
        $glossaryTypeSelect.val(GlossaryType.VIETPHRASE);
        break;
      }
      default: {
        glossary[$glossaryListSelect.val()] = this.result.split(/\r?\n|\r/).map((element) => element.split(/\t/)).filter((element) => element.length >= 2);
        $glossaryTypeSelect.val(GlossaryType.TSV);
        break;
      }
    }

    reloadGlossaryEntries();
    $sourceEntryInput.trigger('input');
    lastSession = {};
  };

  reader.readAsText($(this).prop('files')[0]);
});

$('#clear-glossary-button').on('click', () => {
  if (!window.confirm('Bạn có muốn xoá sạch bảng thuật ngữ chứ?')) return;
  glossary[$glossaryListSelect.val()] = [];
  $glossaryName.val(null);
  reloadGlossaryEntries();
  lastSession = {};
});

$glossaryTypeSelect.on('change', () => {
  reloadGlossaryEntries();
});

$vietPhraseType.on('change', () => {
  reloadGlossaryEntries();
});

$glossaryListSelect.change(() => {
  reloadGlossaryEntries();
  if (isLoaded && $sourceEntryInput.val().length > 0 && (Object.hasOwn(glossaryObject, $sourceEntryInput.val()) || window.confirm('Bạn có muốn chuyển đổi lại chứ?'))) $sourceEntryInput.trigger('input');
});

$sourceEntryInput.on('input', async function onInput() {
  const inputText = (new Map(glossary[$glossaryListSelect.val()].map(([first]) => [first.toUpperCase(), first]))).get($(this).val().toUpperCase()) ?? $(this).val();
  $targetEntryTextarea.prop('scrollTop', 0);

  if (inputText.length > 0) {
    const $option = $(`#${$(this).attr('list')} > option`).filter((__, element) => inputText === element.innerText);

    if (Utils.isOnMobile() && $option.length > 0) {
      $(this).val($option.data('value')).trigger('input');
      return;
    }

    if (Object.hasOwn(glossaryObject, inputText)) {
      $targetEntryTextarea.val(applyNameToText(inputText, Translators.VIETPHRASE, glossary[$glossaryListSelect.val()], true)).trigger('input');
      if (glossary[$glossaryListSelect.val()].length < 5000) $glossaryEntrySelect.val(inputText);

      if (!Utils.isOnMobile()) {
        const modalBody = $('#glossary-modal .modal-body');
        const prevModalBodyScrollTop = modalBody.prop('scrollTop');
        $glossaryEntrySelect.prop('options')[$glossaryEntrySelect.prop('selectedIndex')].scrollIntoView({ block: 'center' });
        modalBody.prop('scrollTop', prevModalBodyScrollTop);
      }
    } else {
      $translateEntryButtons.filter(`[data-translator="vietphrase"][data-lang="${$glossaryListSelect.val() === 'vietPhrasePhu' ? 'vi' : 'SinoVietnamese'}"][data-glossary="true"]`).click();
      $targetEntryTextarea.prop('scrollTop', 0);
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

$sourceEntryInput.on('keypress', (event) => {
  if (event.key === 'Enter') {
    $targetEntryTextarea.focus();
    event.preventDefault();
  }
});

$targetEntryTextarea.on('input', function onInput() {
  $(this).val($(this).val().replaceAll(/\n/g, ' '));
});

$targetEntryTextarea.on('keypress', (event) => {
  if (event.key === 'Enter') {
    $addButton.click();
    event.preventDefault();
  }
});

$('#source-entry-dropdown-toggle').on('mousedown', (event) => {
  event.preventDefault();
});

$('.dropdown-scrollable').on('hide.bs.dropdown', function onHideBsDropdown() {
  $(this).find('.dropdown-menu').prop('scrollTop', 0);
});

$dropdownHasCollapse.find('.dropdown-menu button.dropdown-item').on('click', function onClick() {
  if ($(this).data('bs-toggle') === 'collapse') {
    $(this).parent().parent().find('.collapse').each((__, value) => {
      if (!$(value).hasClass('show')) return;
      const bootstrapDropdownHasCollapse = new bootstrap.Collapse(value);
      bootstrapDropdownHasCollapse.hide();
    });
  } else {
    $dropdownHasCollapse.find('.dropdown-menu').each((__, value) => {
      if (!$(value).hasClass('show')) return;
      const bootstrapDropdownHasCollapse = new bootstrap.Dropdown(value);
      bootstrapDropdownHasCollapse.hide();
    });
  }
});

$dropdownHasCollapse.on('show.bs.dropdown', function onHideBsDropdown() {
  if ($(this).find('.dropdown-menu').find('.collapse').toArray().some((element) => $(element).hasClass('show'))) return;
  if ($(this).find('.dropdown-menu').find('.collapse.show-by-default').length === 0) return;
  const bootstrapCollapseInDropdown = new bootstrap.Collapse($(this).find('.dropdown-menu').find('.collapse.show-by-default')[0]);
  bootstrapCollapseInDropdown.show();
});

$('.define-button').on('click', function onClick() {
  if ($sourceEntryInput.val().length > 0) {
    const defineContent = ($sourceEntryInput.val().substring($sourceEntryInput.prop('selectionStart'), $sourceEntryInput.prop('selectionEnd')) || $sourceEntryInput.val()).trim(); // .substring(0, 30)
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
        text = text.replace(/(^|\s|\p{P})(\p{Ll})/u, (__, p1, p2) => p1 + p2.toUpperCase());
      }
    } else {
      text = text.replaceAll(/(^|\s|\p{P})(\p{Ll})/gu, (__, p1, p2) => p1 + p2.toUpperCase());
    }

    $targetEntryTextarea.val(text).trigger('input');
    $targetEntryTextarea.prop('scrollTop', 0);
  }
});

$translateEntryButtons.click(async function onClick() {
  if (!isLoaded) return;
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
  glossaryObject[$sourceEntryInput.val().trim()] = $targetEntryTextarea.val().trim();
  glossary[$glossaryListSelect.val()] = Object.entries(glossaryObject);
  reloadGlossaryEntries();
  if ($translatorOptions.filter($('.active')).data('id') === Translators.VIETPHRASE && !$glossaryListSelect.val().startsWith('name')) lastSession = {};
  $glossaryEntrySelect.change();
  $addButton.addClass('disabled');
  $removeButton.addClass('disabled');
});

$removeButton.on('click', () => {
  if (Object.hasOwn(glossaryObject, $sourceEntryInput.val())) {
    if (!window.confirm('Bạn có muốn xoá cụm từ này chứ?')) return;
    delete glossaryObject[$sourceEntryInput.val()];
    glossary[$glossaryListSelect.val()] = Object.entries(glossaryObject);
    reloadGlossaryEntries();
    if ($translatorOptions.filter($('.active')).data('id') === Translators.VIETPHRASE && !$glossaryListSelect.val().startsWith('name')) lastSession = {};
    $sourceEntryInput.trigger('input');
  } else {
    $glossaryEntrySelect.val('').change();
  }
});

$glossaryEntrySelect.change(function onChange() {
  if ($(this).val().length > 0 && Object.hasOwn(glossaryObject, $(this).val())) {
    $sourceEntryInput.val($(this).val()).trigger('input');
    $removeButton.removeClass('disabled');
  } else {
    $sourceEntryInput.val(null);
    $targetEntryTextarea.prop('scrollTop', 0);
    $targetEntryTextarea.val(null);
    $removeButton.addClass('disabled');
  }

  if (!Utils.isOnMobile()) {
    const modalBody = $('#glossary-modal .modal-body');
    const prevModalBodyScrollTop = modalBody.prop('scrollTop');
    $(this).prop('options')[$(this).prop('selectedIndex')].scrollIntoView({ block: 'center' });
    modalBody.prop('scrollTop', prevModalBodyScrollTop);
  }
});

$glossaryName.on('change', () => {
  reloadGlossaryEntries();
});

$inputTextarea.on('input', function onInput() {
  const value = $(this).val();
  if (value.length === 0) return;

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

  const gapLength = applyNameToText(value, translator, glossary.namePhu).length - value.length;
  $('#input-textarea-counter').text(`${value.length}${value.length > 0 && ($nameSwitch.prop('checked') && (translator === Translators.VIETPHRASE ? $prioritizeNameOverVietPhraseCheck.prop('checked') && targetLanguage === 'vi' : sourceLanguage === languagePairs[0] && targetLanguage === languagePairs[1])) && gapLength > 0 ? ` (+${gapLength})` : ''}`);
});

$inputTextarea.on('input', function onInput() {
  const value = $(this).val();
  const $inputTextareaCounter = $('#input-textarea-counter');

  if (value.length === 0) {
    $inputTextareaCounter.text(value.length);
    return;
  }

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

  const gapLength = applyNameToText(value, translator).length - value.length;
  $inputTextareaCounter.text(`${value.length}${value.length > 0 && ($nameSwitch.prop('checked') && (translator === Translators.VIETPHRASE ? $prioritizeNameOverVietPhraseCheck.prop('checked') && targetLanguage === 'vi' : sourceLanguage === languagePairs[0] && targetLanguage === languagePairs[1])) && gapLength > 0 ? ` (+${gapLength})` : ''}`);
});

$inputTextarea.on('change', function onChange() {
  $(this).trigger('input');
});

$inputTextarea.on('keypress', (event) => {
  if (event.shiftKey && event.key === 'Enter') {
    $translateButton.click();
    $resultTextarea.focus();
    event.preventDefault();
  }
});

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

$resultTextarea.on('drag', (event) => {
  event.preventDefault();
});

$resultTextarea.on('drop', (event) => {
  event.preventDefault();
});

$resultTextarea.on('cut', (event) => {
  event.preventDefault();
});

$resultTextarea.on('paste', (event) => {
  event.preventDefault();
});

$resultTextarea.on('keypress', (event) => (event.key !== 'Enter' || ((event.ctrlKey && $glossaryManagerButton.trigger('mousedown') && $glossaryManagerButton.click()) || ($translateButton.click() && $inputTextarea.focus()))) && event.preventDefault());
