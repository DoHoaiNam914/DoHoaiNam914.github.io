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
const $boldTextSwitch = $('#bold-text-switch');
const $alignmentSettingsSwitch = $('#alignment-settings-switch');
const $formatSettingsSwitch = $('#format-settings-switch');
const $translatorOptions = $('.translator-option');
const $showOriginalTextSwitch = $('#show-original-text-switch');
const $defaultVietPhraseFileSelect = $('#default-viet-phrase-file-select');
const $addDeLeZhaoSwitch = $('#add-de-le-zhao-switch');
const $multiplicationAlgorithmRadio = $('.option[name="multiplication-algorithm-radio"]');

const $resetButton = $('#reset-button');

const $nameSwitch = $('#name-switch');
const $glossaryInput = $('#glossary-input');
const $glossaryTypeSelect = $('#glossary-type-select');
const $vietPhraseType = $('#viet-phrase-type-select');
const $glossaryListSelect = $('#glossary-list-select');
const $sourceEntryInput = $('#source-entry-input');
const $dropdownHasCollapse = $('.dropdown-has-collapse');
const $targetEntryTextarea = $('#target-entry-textarea');
const $translateEntryButtons = $('.translate-entry-button');
const $addButton = $('#add-button');
const $removeButton = $('#remove-button');
const $glossaryName = $('#glossary-name');

const defaultOptions = JSON.parse('{"source_language":"","target_language":"vi","translator":"microsoftTranslator","font_stack":"","font_size":100,"line_spacing":40,"bold-text":true,"alignment_settings":true,"format_settings":true,"show_original_text":false,"default_viet_phrase_file":"4","add_de_le_zhao":false,"multiplication_algorithm":"0","name":true,"glossary_type":"text/plain"}');

const SUPPORTED_LANGUAGES = ['', 'EN', 'JA', 'ZH', 'EN-US', 'auto', 'en', 'ja', 'zh-CN', 'zh-TW', 'vi', 'lzh', 'yue', 'zh-Hans', 'zh-Hant'];

let isLoaded = false;

let quickTranslateStorage = JSON.parse(localStorage.getItem('dich_nhanh')) ?? {};
const glossaryStorage = JSON.parse(localStorage.getItem('glossary')) ?? {};

const deeplAuthKeys = [
  ['0c9649a5-e8f6-632a-9c42-a9eee160c330:fx', 181],
  ['4670812e-ea92-88b1-8b82-0812f3f4009b:fx', 220980],
  ['47c6c989-9eaa-5b30-4ee6-b2e4f1ebd530:fx', 500000],
  ['9e00d743-da37-8466-8e8d-18940eeeaf88:fx', 370570],
  ['a4b25ba2-b628-fa56-916e-b323b16502de:fx', 14527],
  ['aa09f88d-ab75-3488-b8a3-18ad27a35870:fx', 500000],
  ['e5a36703-2001-1b8b-968c-a981fdca7036:fx', 19],
  ['f114d13f-f882-aebe-2dee-0ef57f830218:fx', 500000],
  ['f1414922-db81-5454-67bd-9608cdca44b3:fx', 500000],
  ['f8ff5708-f449-7a57-65b0-6ac4524cf64c:fx', 500000],
].toSorted((a, b) => a[1] - b[1]);

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
    ['は', 'ha', 'wa'],
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
    ['へ', 'he', 'e'],
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
    ['を', 'wo', 'o'],
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
    ['ヘ', 'he', 'e'],
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
    ['ヲ', 'wo', 'o'],
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
  SinoVietnameses: {},
  vietPhrase: {},
  vietPhrasePhu: {},
  name: {},
  namePhu: {},
  luatNhan: {},
  pronoun: {},
};

// eslint-disable-next-line no-var
var glossaryData = '';

let currentTranslator = null;
let translateAbortController = null;
let prevScrollTop = 0;
let vietPhraseTimeout = null;
let isOnGlossaryListChange = false

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
            case 'theme': {
              data.theme = selectedValue.text();
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
          case 'theme': {
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

  const nameEnabled = $nameSwitch.prop('checked');

  const [MAX_LENGTH, MAX_LINE] = getMaxQueryLengthAndLine(translatorOption, inputText);

  if (translatorOption !== Translators.DEEPL_TRANSLATE && inputText.split('\n').toSorted((a, b) => b.length - a.length)[0].length > MAX_LENGTH) throw console.error(`Số lượng từ trong một dòng quá dài (Số lượng từ hợp lệ nhỏ hơn hoặc bằng ${MAX_LENGTH}).`);

  try {
    const inputTextForCheck = nameEnabled && translatorOption === Translators.VIETPHRASE && targetLanguage === 'vi' ? Vietphrase.quickTranslate(inputText, Object.entries(glossary.namePhu)) : inputText;
    let result = '';

    if (Object.keys(lastSession).length > 0 && lastSession.inputText === inputTextForCheck && lastSession.translatorOption === translatorOption && lastSession.sourceLanguage === sourceLanguage && lastSession.targetLanguage === targetLanguage) {
      result = lastSession.result;
    } else {
      if (translatorOption === Translators.DEEPL_TRANSLATE && currentTranslator.usage.character_count + inputText.length > currentTranslator.usage.character_limit) throw console.error(`Lỗi DeepL Translator: Đã đạt đến giới hạn dịch của tài khoản. (${currentTranslator.usage.character_count}/${currentTranslator.usage.character_limit} ký tự).`);

      if (inputText.split(/\r?\n/).length <= MAX_LINE && (translatorOption === Translators.DEEPL_TRANSLATE ? (new TextEncoder()).encode(`text=${inputText.split(/\r?\n/).map((element) => encodeURIComponent(element)).join('&text=')}&source_lang=${sourceLanguage}&target_lang=${targetLanguage}&tag_handling=xml`) : inputText).length <= MAX_LENGTH) {
        switch (translatorOption) {
          case Translators.VIETPHRASE: {
            result = currentTranslator.translateText(sourceLanguage, targetLanguage, inputText, {
              nameEnabled,
              multiplicationAlgorithm: $multiplicationAlgorithmRadio.filter('[checked]').val(),
              addDeLeZhao: $addDeLeZhaoSwitch.prop('checked'),
              autocapitalize: true,
            }, glossary);
            break;
          }
          default: {
            result = await currentTranslator.translateText(sourceLanguage, targetLanguage, inputText);
          }
        }
      } else {
        const inputLines = inputText.split(/\r?\n/);
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
      lastSession.inputText = inputTextForCheck;
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
    let sourceLanguage = '';
    let translator = null;

    switch (translatorOption) {
      case Translators.BAIDU_FANYI: {
        translator = new BaiduFanyi();
        sourceLanguage = BaiduFanyi.AUTOMATIC_DETECTION;
        break;
      }
      case Translators.DEEPL_TRANSLATE: {
        while (true) {
          translator = await new DeeplTranslate(deeplAuthKeys[0][0]).init();
          if (translator.usage.character_count + inputText.length <= translator.usage.character_limit) break;
          deeplAuthKeys.shift();
        }

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
        translator = new Vietphrase();
        sourceLanguage = Vietphrase.DefaultLanguage.SOURCE_LANGUAGE;
        break;
      }
      default: {
        translator = await new MicrosoftTranslator().init();
        sourceLanguage = MicrosoftTranslator.AUTODETECT;
        break;
      }
    }

    if (translatorOption === Translators.DEEPL_TRANSLATE && translator.usage.character_count + inputText.length > translator.usage.character_limit) return `Lỗi DeepL Translator: Đã đạt đến giới hạn dịch của tài khoản. (${translator.usage.character_count}/${translator.usage.character_limit} ký tự).`;
    let result = inputText;

    switch (translatorOption) {
      case Translators.VIETPHRASE: {
        result = translator.translateText(sourceLanguage, targetLanguage, inputText, {
          nameEnabled: glossaryEnabled,
          multiplicationAlgorithm: $multiplicationAlgorithmRadio.filter('[checked]').val(),
          addDeLeZhao: $addDeLeZhaoSwitch.prop('checked'),
          autocapitalize: false,
        }, glossary);
        break;
      }
      default: {
        result = await translator.translateText(sourceLanguage, targetLanguage, inputText);
      }
    }

    return result;
  } catch (error) {
    console.error(error);
    return `Bản dịch thất bại: ${error}`;
  }
}

function reloadGlossaryEntries() {
  const $downloadButton = $('#download-button');
  const $glossaryExtension = $('#glossary-extension');
  const selectGlossaryList = $glossaryListSelect.val();
  const glossaryList = glossary[selectGlossaryList];

  const glossaryKeys = Object.keys(glossaryList);

  const glossaryListForAutocomplete = [];
  let glossaryEntryList = [];

  for (let i = 0; i < glossaryKeys.length; i += 1) {
    const key = glossaryKeys[i];
    const value = glossaryList[key];
    glossaryListForAutocomplete.push({ label: `${key}=${value}`, value: key });
    glossaryEntryList.push([key, value, key.length, key.split(/(?:)/u).length]);
  }

  let debounceTimeout = null;

  $sourceEntryInput.autocomplete({
    appendTo: '#glossary-modal .modal-body',
    minLength: 1,
    position: {
      my: 'left bottom',
      at: 'left top',
    },
    source: (request, response) => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        const matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), 'i');
        response($.grep(glossaryListForAutocomplete, (elementOfArray) => elementOfArray.label.split('=').some((element, index) => (index === 0 || !/\p{sc=Latn}/u.test(element) || element.length >= 2) && (matcher.test(element) || matcher.test(element.normalize('NFKD').replaceAll(/\p{Mn}/gu, '').replaceAll('đ', 'd').replaceAll('Đ', 'D'))))).slice(0, 20));
      }, 300);
    },
    focus: () => {
      $sourceEntryInput.trigger('input');
    },
    select: (__, ui) => {
      $sourceEntryInput.val(ui.item.value).trigger('input');
    },
  });

  const glossaryLength = glossaryKeys.length;

  if (glossaryLength > 0) {
    const glossaryDataCopyButton = $copyButtons.filter('[data-target="glossaryData"]');
    glossaryDataCopyButton.addClass('disabled');
    $downloadButton.addClass('disabled');

    switch (['vietPhrase', 'name'].every((element) => selectGlossaryList !== element) ? $glossaryTypeSelect.val() : GlossaryType.VIETPHRASE) {
      case GlossaryType.CSV: {
        glossaryData = $.csv.fromArrays(glossaryEntryList.toSorted((a, b) => b[3] - a[3] || a[1].localeCompare(b[1], 'vi', { ignorePunctuation: true }) || a[0].localeCompare(b[0], 'vi', { ignorePunctuation: true })).map(([first, second]) => [first, second]));
        $glossaryExtension.text('csv');
        break;
      }
      case GlossaryType.VIETPHRASE: {
        switch ($vietPhraseType.val()) {
          case 'QuickTranslate Without Sorting': {
            glossaryData = `\ufeff${glossaryEntryList.map((element) => element.slice(0, -2).join('=')).join('\r\n')}`;
            break;
          }
          case 'QuickTranslate': {
            glossaryData = `\ufeff${glossaryEntryList.toSorted((a, b) => b[2] - a[2] || a[0].localeCompare(b[0])).map((element) => element.slice(0, -2).join('=')).join('\r\n')}`;
            break;
          }
          case 'Sáng Tác Việt': {
            glossaryData = glossaryEntryList.toSorted().toSorted((a, b) => a[2] - b[2]).map((element) => element.slice(0, -2).join('=')).join('\n');
            break;
          }
          default: {
            glossaryData = glossaryEntryList.map((element) => element.slice(0, -2).join('=')).join('\n');
            break;
          }
        }

        $glossaryExtension.text('txt');
        break;
      }
      default: {
        glossaryData = glossaryEntryList.toSorted((a, b) => b[3] - a[3] || a[1].localeCompare(b[1], 'vi', { ignorePunctuation: true }) || a[0].localeCompare(b[0], 'vi', { ignorePunctuation: true })).map((element) => element.slice(0, -2).join('\t')).join('\n');
        $glossaryExtension.text('tsv');
        break;
      }
    }

    glossaryEntryList = null;
    glossaryDataCopyButton.removeClass('disabled');
    $downloadButton.attr('href', URL.createObjectURL(new Blob([glossaryData], { type: `${$glossaryTypeSelect.val()}; charset=UTF-8` })));
    $downloadButton.attr('download', `${$glossaryName.val().length > 0 ? $glossaryName.val() : $glossaryName.attr('placeholder')}.${$glossaryExtension.text()}`);
    $downloadButton.removeClass('disabled');
  } else {
    glossaryData = '';
    $downloadButton.removeAttr('href');
    $downloadButton.removeAttr('download');
    $downloadButton.addClass('disabled');
  }

  $('#glossary-entry-counter').text(glossaryLength);
  if (isLoaded) $inputTextarea.trigger('input');
  if (['vietPhrase', 'name'].every((element) => selectGlossaryList !== element)) glossaryStorage[selectGlossaryList] = glossaryLength < 5000 ? glossaryList : {};
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
    const array = data.split('\n').filter((element) => element.length > 0 && !element.startsWith('#')).map((element) => element.split('\t'));

    glossary.traditional = array.filter((element) => element.length === 3 && element[1] === 'kTraditionalVariant').map(([first, __, third]) => [String.fromCodePoint(parseInt(first.substring(2), 16)), third.split(' ').filter((element) => third.split(' ').length === 1 || element !== first).map((element) => String.fromCodePoint(parseInt(element.substring(2), 16)))[0]]);
    console.info(`Đã tải xong bộ dữ liệu phổn thể (${glossary.traditional.length})!`);

    glossary.simplified = array.filter((element) => element.length === 3 && element[1] === 'kSimplifiedVariant').map(([first, __, third]) => [String.fromCodePoint(parseInt(first.substring(2), 16)), third.split(' ').filter((element) => third.split(' ').length === 1 || element !== first).map((element) => String.fromCodePoint(parseInt(element.substring(2), 16)))[0]]);
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
    glossary.pinyins = data.split('\n').filter((element) => element.length > 0 && !element.startsWith('#') && element.split('\t')[1] === 'kMandarin').map((element) => element.split('\t')).map(([first, __, third]) => [String.fromCodePoint(parseInt(first.substring(2), 16)), third.split(' ')[0]]);
    console.info(`Đã tải xong bộ dữ liệu bính âm (${glossary.pinyins.length})!`);

    const array = data.split('\n').filter((element) => element.length > 0 && !element.startsWith('#')).map((element) => element.split('\t'));

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
  lastSession = {};
  $inputTextarea.trigger('input');
  isLoaded = true;
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
  const target = $($(this).data('target'));

  if (target.length > 0 && target.val().length > 0) {
    if (target.attr('id') === 'result-textarea') {
      if (Object.keys(lastSession).length > 0) {
        await navigator.clipboard.writeText(lastSession.result);
      }
    } else {
      await navigator.clipboard.writeText(target.val());
    }

    return;
  }

  if (Object.hasOwn(window, $(this).data('target'))) {
    if (window[$(this).data('target')].length > 0) {
      await navigator.clipboard.writeText(window[$(this).data('target')]);
    }
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
  const prevThemeFontFamily = ($themeOptions.filter('.active').data('font-family') ?? '').replace(/^, /, '');
  $themeOptions.removeClass('active');
  $(this).addClass('active');
  const isDarkMode = $('#bd-theme').next().find('.active').data('bs-theme-value') === 'auto' ? window.matchMedia('(prefers-color-scheme: dark)').matches : $('#bd-theme').next().find('.active').data('bs-theme-value') === 'dark';

  $('.textarea').css({
    'background-color': $(this).data('dark-background-color') != null && isDarkMode ? $(this).data('dark-background-color') : ($(this).data('background-color') ?? ''),
    color: $(this).data('dark-foreground-color') != null && isDarkMode ? $(this).data('dark-foreground-color') : ($(this).data('foreground-color') ?? ''),
  });

  if (isLoaded) {
    if ($fontStackText.val().length === 0 || prevThemeFontFamily.startsWith($fontStackText.val())) $fontStackText.val($(this).data('font-family') ?? '').change();
    if ($(this).data('font-size') != null) $fontSizeRange.val($(this).data('font-size')).change();
    if ($(this).data('line-height') != null) $lineSpacingRange.val($(this).data('line-height')).change();
    $boldTextSwitch.prop('checked', $(this).data('bold-text') != null && Boolean($(this).data('bold-text'))).change();
    if ($(this).data('text-align') != null) $alignmentSettingsSwitch.prop('checked', $(this).data('text-align') === 'justify').change();
  }

  quickTranslateStorage[getOptionId($(this).parent().parent().parent().attr('id'))] = $(this).text();
  localStorage.setItem('dich_nhanh', JSON.stringify(quickTranslateStorage));
});

$fontStackText.change(function onChange() {
  const values = $(this).val().split(/, */).filter((element) => element.length > 0).map((element) => element.trim());
  $(this).val(values.join(', '));

  $(document.documentElement).css('--opt-font-family', values.map((element) => {
    const maybeFontStacks = element.startsWith('--') ? `var(${element})` : element;
    return element.includes(' ') ? `'${element}'` : maybeFontStacks;
  }).join(', '));

  const $currentTheme = $themeOptions.filter('.active');
  $('.textarea').css('font-weight', $currentTheme.data('font-weight') ?? '');
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

$boldTextSwitch.off('change');

$boldTextSwitch.change(function onChange() {
  $(document.documentElement).css('--opt-font-weight', $(this).prop('checked') ? 'bold' : 'normal');
  quickTranslateStorage[getOptionId($(this).attr('id'))] = $(this).prop('checked');
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

$translatorOptions.on('click', async function onClick() {
  $translatorOptions.removeClass('active');
  $(this).addClass('active');
  updateLanguageSelect($(this).data('id'), quickTranslateStorage.translator);

  switch ($(this).data('id')) {
    case Translators.BAIDU_FANYI: {
      currentTranslator = new BaiduFanyi();
      break;
    }
    case Translators.DEEPL_TRANSLATE: {
      while (true) {
        currentTranslator = await new DeeplTranslate(deeplAuthKeys[0][0]).init();
        if ((currentTranslator.usage.character_limit - currentTranslator.usage.character_count) >= 100000) break;
        deeplAuthKeys.shift();
      }

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

$defaultVietPhraseFileSelect.change(async function onChange() {
  const intValue = parseInt($(this).val(), 10);

  if (intValue > 0) {
    switch (intValue) {
      case 1:
      case 2: {
        if (glossary.dataByThtgiangPronoun == null || glossary.dataByThtgiangPronoun.length === 0) {
          await $.ajax({
            method: 'GET',
            url: '/static/datasource/Quick Translator/Pronouns.txt',
          }).done((data) => {
            glossary.dataByThtgiangPronoun = data.split('\r\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('='));
          }).fail((__, ___, errorThrown) => {
            glossary.dataByThtgiangPronoun = null;
            console.error('Không tải được tệp Quick Translator\'s Pronouns:', errorThrown);
          });
        }

        glossary.pronoun = Object.fromEntries(glossary.dataByThtgiangPronoun) ?? {};
        console.info(`Đã tải xong tệp Pronouns (${Object.keys(glossary.pronoun).length})!`);

        if (glossary.dataByThtgiangLuatNhan == null || glossary.dataByThtgiangLuatNhan.length === 0) {
          await $.ajax({
            method: 'GET',
            url: '/static/datasource/Quick Translator/LuatNhan.txt',
          }).done((data) => {
            glossary.dataByThtgiangLuatNhan = data.split('\r\n').filter((element) => element.length > 0 && !element.startsWith('#') && element.split('=').length === 2).map((element) => element.split('='));
          }).fail((__, ___, errorThrown) => {
            glossary.dataByThtgiangLuatNhan = null;
            console.error('Không tải được tệp Quick Translator\'s LuatNhan:', errorThrown);
          });
        }

        glossary.luatNhan = Object.fromEntries(glossary.dataByThtgiangLuatNhan) ?? {};
        console.info(`Đã tải xong tệp LuatNhan (${Object.keys(glossary.luatNhan).length})!`);

        if (glossary.dataByThtgiangHanViet == null || glossary.dataByThtgiangHanViet.length === 0) {
          await $.ajax({
            method: 'GET',
            url: '/static/datasource/Quick Translator/ChinesePhienAmWords.txt',
          }).done((data) => {
            glossary.dataByThtgiangHanViet = data.split('\r\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('='));
          }).fail((__, ___, errorThrown) => {
            glossary.dataByThtgiangHanViet = null;
            console.error('Không tải được tệp Quick Translator\'s ChinesePhienAmWords:', errorThrown);
          });
        }

        glossary.vietPhrasePhu = Object.fromEntries(glossary.dataByThtgiangHanViet) ?? {};
        console.info(`Đã tải xong tệp ChinesePhienAmWords (${Object.keys(glossary.vietPhrasePhu).length})!`);

        if (glossary.quickTranslatorName == null || glossary.quickTranslatorName.length === 0) {
          await $.ajax({
            method: 'GET',
            url: '/static/datasource/Quick Translator/Names.txt',
          }).done((data) => {
            glossary.quickTranslatorName = data.split('\r\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('='));
          }).fail((__, ___, errorThrown) => {
            glossary.quickTranslatorName = null;
            console.error('Không tải được tệp Quick Translator\'s Names:', errorThrown);
          });
        }

        glossary.name = Object.fromEntries(glossary.quickTranslatorName) ?? {};
        console.info(`Đã tải xong tệp Names (${Object.keys(glossary.name).length})!`);

        if (glossary.quickTranslatorVietphraseForMergeFiles == null || glossary.quickTranslatorVietphraseForMergeFiles.length === 0) {
          await $.ajax({
            method: 'GET',
            url: '/static/datasource/Quick Translator/Vietphrase cho file gộp.txt',
          }).done((data) => {
            glossary.quickTranslatorVietphraseForMergeFiles = data.split('\r\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('='));
          }).fail(() => {
            glossary.quickTranslatorVietphraseForMergeFiles = null;
          });
        }

        if (glossary.quickTranslatorVietPhrase == null || glossary.quickTranslatorVietPhrase.length === 0) {
          await $.ajax({
            method: 'GET',
            url: '/static/datasource/Quick Translator/Vietphrase.txt',
          }).done((data) => {
            glossary.quickTranslatorVietPhrase = data.split('\r\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('='));
          }).fail((__, ___, errorThrown) => {
            glossary.quickTranslatorVietPhrase = null;
            console.error('Không tải được tệp Quick Translator\'s VietPhrase:', errorThrown);
          });
        }

        if (intValue === 2) {
          glossary.vietPhrase = glossary.quickTranslatorVietphraseForMergeFiles != null && glossary.quickTranslatorVietPhrase != null ? Object.fromEntries(glossary.quickTranslatorVietphraseForMergeFiles.concat(glossary.quickTranslatorVietPhrase)) : {};
        } else {
          glossary.vietPhrase = Object.fromEntries(glossary.quickTranslatorVietPhrase) ?? {};
        }

        console.info(`Đã tải xong tệp VietPhrase (${Object.keys(glossary.vietPhrase).length})!`);
        break;
      }
      case 3: {
        if (glossary.dataByThtgiangPronoun == null || glossary.dataByThtgiangPronoun.length === 0) {
          await $.ajax({
            method: 'GET',
            url: '/static/datasource/Data của thtgiang/Pronouns.txt',
          }).done((data) => {
            glossary.dataByThtgiangPronoun = data.split('\r\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('='));
          }).fail((__, ___, errorThrown) => {
            glossary.dataByThtgiangPronoun = null;
            console.error('Không tải được tệp Data của thtgiang\'s Pronouns:', errorThrown);
          });
        }

        glossary.pronoun = Object.fromEntries(glossary.dataByThtgiangPronoun) ?? {};
        console.info(`Đã tải xong tệp Pronouns (${Object.keys(glossary.pronoun).length})!`);

        if (glossary.dataByThtgiangLuatNhan == null || glossary.dataByThtgiangLuatNhan.length === 0) {
          await $.ajax({
            method: 'GET',
            url: '/static/datasource/Data của thtgiang/LuatNhan.txt',
          }).done((data) => {
            glossary.dataByThtgiangLuatNhan = data.split('\r\n').filter((element) => element.length > 0 && !element.startsWith('#') && element.split('=').length === 2).map((element) => element.split('='));
          }).fail((__, ___, errorThrown) => {
            glossary.dataByThtgiangLuatNhan = null;
            console.error('Không tải được tệp Data của thtgiang\'s LuatNhan:', errorThrown);
          });
        }

        glossary.luatNhan = Object.fromEntries(glossary.dataByThtgiangLuatNhan) ?? {};
        console.info(`Đã tải xong tệp LuatNhan (${Object.keys(glossary.luatNhan).length})!`);

        if (glossary.dataByThtgiangHanViet == null || glossary.dataByThtgiangHanViet.length === 0) {
          await $.ajax({
            method: 'GET',
            url: '/static/datasource/Data của thtgiang/ChinesePhienAmWords.txt',
          }).done((data) => {
            glossary.dataByThtgiangHanViet = data.split('\r\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('='));
          }).fail((__, ___, errorThrown) => {
            glossary.dataByThtgiangHanViet = null;
            console.error('Không tải được tệp Data của thtgiang\'s ChinesePhienAmWords:', errorThrown);
          });
        }

        glossary.vietPhrasePhu = Object.fromEntries(glossary.dataByThtgiangHanViet) ?? {};
        console.info(`Đã tải xong tệp ChinesePhienAmWords (${Object.keys(glossary.vietPhrasePhu).length})!`);

        if (glossary.dataByThtgiangName == null || glossary.dataByThtgiangName.length === 0) {
          await $.ajax({
            method: 'GET',
            url: '/static/datasource/Data của thtgiang/Names.txt',
          }).done((data) => {
            glossary.dataByThtgiangName = data.split('\r\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('='));
          }).fail((__, ___, errorThrown) => {
            glossary.dataByThtgiangName = null;
            console.error('Không tải được tệp Data của thtgiang\'s Names:', errorThrown);
          });
        }

        glossary.name = Object.fromEntries(glossary.dataByThtgiangName) ?? {};
        console.info(`Đã tải xong tệp Names (${Object.keys(glossary.name).length})!`);

        if (glossary.dataByThtgiangVietPhrase == null || glossary.dataByThtgiangVietPhrase.length === 0) {
          await $.ajax({
            method: 'GET',
            url: '/static/datasource/Data của thtgiang/VietPhrase.txt',
          }).done((data) => {
            glossary.dataByThtgiangVietPhrase = data.split('\r\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('='));
          }).fail((__, ___, errorThrown) => {
            glossary.dataByThtgiangVietPhrase = null;
            console.error('Không tải được tệp Data của thtgiang\'s VietPhrase:', errorThrown);
          });
        }

        glossary.vietPhrase = Object.fromEntries(glossary.dataByThtgiangVietPhrase) ?? {};
        console.info(`Đã tải xong tệp VietPhrase (${Object.keys(glossary.vietPhrase).length})!`);
        break;
      }
      case 4: {
        if (glossary.ttvtranslateHanViet == null || glossary.ttvtranslateHanViet.length === 0) {
          await $.ajax({
            method: 'GET',
            url: '/static/datasource/ttvtranslate/ChinesePhienAmWords.txt',
          }).done((data) => {
            glossary.ttvtranslateHanViet = data.split('\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('='));
          }).fail((__, ___, errorThrown) => {
            glossary.ttvtranslateHanViet = null;
            console.error('Không tải được tệp ttvtranslate\'s ChinesePhienAmWords:', errorThrown);
          });
        }

        glossary.vietPhrasePhu = Object.fromEntries(glossary.ttvtranslateHanViet) ?? {};
        console.info(`Đã tải xong tệp ChinesePhienAmWords (${Object.keys(glossary.vietPhrasePhu).length})!`);

        if (glossary.ttvtranslateName == null || glossary.ttvtranslateName.length === 0) {
          await $.ajax({
            method: 'GET',
            url: '/static/datasource/ttvtranslate/Names.txt',
          }).done((data) => {
            glossary.ttvtranslateName = data.split('\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('='));
          }).fail((__, ___, errorThrown) => {
            glossary.ttvtranslateName = null;
            console.error('Không tải được tệp ttvtranslate\'s Names:', errorThrown);
          });
        }

        glossary.name = Object.fromEntries(glossary.ttvtranslateName) ?? {};
        console.info(`Đã tải xong tệp Names (${Object.keys(glossary.name).length})!`);

        if (glossary.ttvtranslateVietPhrase == null || glossary.ttvtranslateVietPhrase.length === 0) {
          await $.ajax({
            method: 'GET',
            url: '/static/datasource/ttvtranslate/VietPhrase.txt',
          }).done((data) => {
            glossary.ttvtranslateVietPhrase = data.split('\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('='));
          }).fail((__, ___, errorThrown) => {
            glossary.ttvtranslateVietPhrase = null;
            console.error('Không tải được tệp ttvtranslate\'s VietPhrase:', errorThrown);
          });
        }

        glossary.vietPhrase = Object.fromEntries(glossary.ttvtranslateVietPhrase) ?? {};
        console.info(`Đã tải xong tệp VietPhrase (${Object.keys(glossary.vietPhrase).length})!`);
        break;
      }
      case 5: {
        if (glossary.translateHanViet == null || glossary.translateHanViet.length === 0) {
          await $.ajax({
            method: 'GET',
            url: '/static/datasource/Translate/ChinesePhienAmWords.txt',
          }).done((data) => {
            glossary.translateHanViet = data.split('\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('='));
          }).fail((__, ___, errorThrown) => {
            glossary.translateHanViet = null;
            console.error('Không tải được tệp Translate\'s Names:', errorThrown);
          });
        }

        glossary.vietPhrasePhu = Object.fromEntries(glossary.translateHanViet) ?? {};
        console.info(`Đã tải xong tệp ChinesePhienAmWords (${Object.keys(glossary.vietPhrasePhu).length})!`);

        if (glossary.translateName == null || glossary.translateName.length === 0) {
          await $.ajax({
            method: 'GET',
            url: '/static/datasource/Translate/Names.txt',
          }).done((data) => {
            glossary.translateName = data.split('\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('='));
          }).fail((__, ___, errorThrown) => {
            glossary.translateName = null;
            console.error('Không tải được tệp Translate\'s Names:', errorThrown);
          });
        }

        glossary.name = Object.fromEntries(glossary.translateName) ?? {};
        console.info(`Đã tải xong tệp Names (${Object.keys(glossary.name).length})!`);

        if (glossary.translateVietPhrase == null || glossary.translateVietPhrase.length === 0) {
          await $.ajax({
            method: 'GET',
            url: '/static/datasource/Translate/VietPhrase.txt',
          }).done((data) => {
            glossary.translateVietPhrase = data.split('\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('='));
          }).fail((__, ___, errorThrown) => {
            glossary.translateVietPhrase = null;
            console.error('Không tải được tệp Translate\'s VietPhrase:', errorThrown);
          });
        }

        glossary.vietPhrase = Object.fromEntries(glossary.translateVietPhrase) ?? {};
        console.info(`Đã tải xong tệp VietPhrase (${Object.keys(glossary.vietPhrase).length})!`);
        break;
      }
      // no default
    }

    if (['vietPhrase', 'name'].some((element) => $glossaryListSelect.val() === element)) reloadGlossaryEntries();
    lastSession = {};
  }
});

$resetButton.on('click', () => {
  if (!window.confirm('Bạn có muốn đặt lại tất cả thiết lập chứ?')) return;
  localStorage.setItem('dich_nhanh', JSON.stringify(defaultOptions));
  if (window.confirm('Bạn có muốn tải lại trang ngay chứ?')) window.location.reload();
});

$('#glossary-modal').on('shown.bs.modal', () => {
  if ($sourceEntryInput.val().length > 0) {
    if (!$sourceEntryInput.autocomplete('option', 'disabled')) $sourceEntryInput.autocomplete('disable');
    $sourceEntryInput.trigger('input');
  }

  $sourceEntryInput.autocomplete('enable');
});

$('#glossary-modal').on('hide.bs.modal', () => {
  clearTimeout(vietPhraseTimeout);
  $sourceEntryInput.autocomplete('disable');
  $sourceEntryInput.prop('scrollLeft', 0);
  $targetEntryTextarea.prop('scrollTop', 0);
  $sourceEntryInput.val(null).trigger('input');
  $addButton.addClass('disabled');
  $removeButton.addClass('disabled');
});

$glossaryInput.on('change', function onChange() {
  const reader = new FileReader();

  reader.onload = function onLoad() {
    switch ($glossaryInput.prop('files')[0].type) {
      case GlossaryType.CSV: {
        glossary[$glossaryListSelect.val()] = $.csv.toObjects(this.result);
        $glossaryTypeSelect.val(GlossaryType.CSV);
        break;
      }
      case GlossaryType.VIETPHRASE: {
        glossary[$glossaryListSelect.val()] = Object.fromEntries(this.result.split(/\r?\n|\r/).filter((element) => element.length > 0 && ($glossaryListSelect.val() !== 'luatNhan' || !element.startsWith('#')) && element.split('=').length === 2).map((element) => element.split('=')));
        $glossaryTypeSelect.val(GlossaryType.VIETPHRASE);
        break;
      }
      default: {
        glossary[$glossaryListSelect.val()] = Object.fromEntries(this.result.split(/\r?\n|\r/).map((element) => element.split(/\t/)).map((element) => element.slice(0, 2)));
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
  glossary[$glossaryListSelect.val()] = {};
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

$glossaryListSelect.change(function onChange() {
  isOnGlossaryListChange = true;
  reloadGlossaryEntries();
  if (isLoaded && $sourceEntryInput.val().length > 0 && (Object.hasOwn(glossary[$(this).val()], $sourceEntryInput.val()) || window.confirm('Bạn có muốn chuyển đổi lại chứ?'))) $sourceEntryInput.trigger('input');
  isOnGlossaryListChange = false;
});

$sourceEntryInput.on('input', async function onInput() {
  const inputText = $(this).val();
  $targetEntryTextarea.prop('scrollTop', 0);
  clearTimeout(vietPhraseTimeout);

  if (inputText.length > 0) {
    if (Object.hasOwn(glossary[$glossaryListSelect.val()], inputText)) {
      $targetEntryTextarea.val(glossary[$glossaryListSelect.val()][inputText]).trigger('input');
      $removeButton.removeClass('disabled');
    } else {
      vietPhraseTimeout = setTimeout(() => {
        $translateEntryButtons.filter(`[data-translator="vietphrase"][data-lang="${$glossaryListSelect.val().startsWith('vietPhrase') ? 'vi' : 'SinoVietnamese'}"]`).click();
        $targetEntryTextarea.prop('scrollTop', 0);
      }, !isOnGlossaryListChange && $glossaryListSelect.val().startsWith('vietPhrase') ? 500 : 0);
      $removeButton.addClass('disabled');
    }

    $addButton.removeClass('disabled');
  } else {
    $targetEntryTextarea.val(null);
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

$sourceEntryInput.on('focus', function onBlur() {
  $(this).autocomplete('search', $(this).val());
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

  if (window.getSelection) window.getSelection().removeAllRanges();
  else if (document.selection) document.selection.empty();
  $sourceEntryInput.blur();
});

$('.translate-webpage-button').on('click', function onClick() {
  if ($sourceEntryInput.val().length > 0) window.open($(this).data('href').replace('{0}', encodeURIComponent($sourceEntryInput.val().trimEnd())), '_blank', 'width=1000,height=577');
  if (window.getSelection) window.getSelection().removeAllRanges();
  else if (document.selection) document.selection.empty();
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
  if ($glossaryListSelect.val() === 'namePhu' && Object.hasOwn(glossary.name, $sourceEntryInput.val().trim())) delete glossary.name[$sourceEntryInput.val().trim()];
  if (Object.hasOwn(glossary[$glossaryListSelect.val()], $sourceEntryInput.val().trim())) delete glossary[$glossaryListSelect.val()][$sourceEntryInput.val().trim()];
  glossary[$glossaryListSelect.val()][$sourceEntryInput.val().trim()] = $targetEntryTextarea.val().trim();
  reloadGlossaryEntries();
  if ($translatorOptions.filter($('.active')).data('id') === Translators.VIETPHRASE && !$glossaryListSelect.val() !== 'namePhu') lastSession = {};
  $addButton.addClass('disabled');
  $removeButton.addClass('disabled');
  $sourceEntryInput.val(null).trigger('input');
});

$removeButton.on('click', () => {
  if (!Object.hasOwn(glossary[$glossaryListSelect.val()], $sourceEntryInput.val()) || !window.confirm('Bạn có muốn xoá cụm từ này chứ?')) return;
  delete glossary[$glossaryListSelect.val()][$sourceEntryInput.val().trim()];
  reloadGlossaryEntries();
  if ($translatorOptions.filter($('.active')).data('id') === Translators.VIETPHRASE && $glossaryListSelect.val() !== 'namePhu') lastSession = {};
  $translateEntryButtons.filter(`[data-translator="vietphrase"][data-lang="${$glossaryListSelect.val().startsWith('vietPhrase') ? 'vi' : 'SinoVietnamese'}"]`).click();
  $targetEntryTextarea.prop('scrollTop', 0);
});

$glossaryName.on('change', () => {
  reloadGlossaryEntries();
});

$inputTextarea.on('input', function onInput() {
  const value = $(this).val();
  const $inputTextareaCounter = $('#input-textarea-counter');

  if (value.length === 0) {
    $inputTextareaCounter.text(value.length);
    return;
  }

  const translator = $translatorOptions.filter($('.active')).data('id');

  let targetLanguage = $targetLanguageSelect.val();

  switch (translator) {
    case Translators.BAIDU_FANYI: {
      targetLanguage = BaiduFanyi.getMappedTargetLanguageCode(Translators.GOOGLE_TRANSLATE, targetLanguage).split('-')[0].toLowerCase();
      break;
    }
    case Translators.DEEPL_TRANSLATE: {
      targetLanguage = DeeplTranslate.getMappedTargetLanguageCode(Translators.GOOGLE_TRANSLATE, targetLanguage).split('-')[0].toLowerCase();
      break;
    }
    case Translators.PAPAGO: {
      targetLanguage = Papago.getMappedTargetLanguageCode(Translators.GOOGLE_TRANSLATE, targetLanguage).split('-')[0].toLowerCase();
      break;
    }
    case Translators.MICROSOFT_TRANSLATOR: {
      targetLanguage = MicrosoftTranslator.getMappedTargetLanguageCode(Translators.GOOGLE_TRANSLATE, targetLanguage).split('-')[0].toLowerCase();
      break;
    }
    case Translators.VIETPHRASE: {
      targetLanguage = Vietphrase.getMappedTargetLanguageCode(Translators.GOOGLE_TRANSLATE).split('-')[0].toLowerCase();
      break;
    }
    default: {
      targetLanguage = targetLanguage.split('-')[0].toLowerCase();
      break;
    }
  }

  const gapLength = (translator === Translators.VIETPHRASE && targetLanguage === 'vi' ? Vietphrase.quickTranslate(value, Object.entries(glossary.namePhu)) : value).length - value.length;
  $inputTextareaCounter.text(`${value.length}${value.length > 0 && gapLength > 0 ? ` (+${gapLength})` : ''}`);
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
  document.execCommand('copy');
  event.preventDefault();
});

$resultTextarea.on('paste', (event) => {
  event.preventDefault();
});

$resultTextarea.on('keypress', (event) => {
  if (event.ctrlKey && event.key === 'Enter') {
    $glossaryManagerButton.trigger('mousedown');
    $glossaryManagerButton.click();
    event.preventDefault();
    return;
  }

  if (event.key === 'Enter') {
    $translateButton.click();
    $inputTextarea.focus();
    event.preventDefault();
  }
});
