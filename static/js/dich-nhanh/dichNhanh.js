'use strict';

/* global bootstrap, BaiduTranslate, cjkv, DeepLTranslate, GoogleTranslate, hanData, Papago, MicrosoftTranslator, newAccentObject, Utils, Vietphrase */

const $addButton = $('#add-button');
const $addDeLeZhaoSwitch = $('#add-de-le-zhao-switch');
const $copyButtons = $('.copy-button');
const $defaultVietPhraseFileSelect = $('#default-viet-phrase-file-select');
const $dropdownHasCollapse = $('.dropdown-has-collapse');
const $fontStackText = $('#font-stack-text');
const $glossaryEntryCounter = $('#glossary-entry-counter');
const $glossaryInput = $('#glossary-input');
const $glossaryListSelect = $('#glossary-list-select');
const $glossaryManagerButton = $('#glossary-manager-button');
const $glossaryModal = $('#glossary-modal');
const $inputTextarea = $('#input-textarea');
const $multiplicationAlgorithmRadio = $('input[type="radio"][name="multiplication-algorithm-radio"]');
const $pasteButtons = $('.paste-button');
const $removeButton = $('#remove-button');
const $resultTextarea = $('#result-textarea');
const $retranslateButton = $('#retranslate-button');
const $showOriginalTextSwitch = $('#show-original-text-switch');
const $sourceEntryInput = $('#source-entry-input');
const $sourceLanguageSelect = $('#source-language-select');
const $targetEntryTextarea = $('#target-entry-textarea');
const $targetLanguageSelect = $('#target-language-select');
const $toneSelect = $('#tone-select');
const $translateButton = $('#translate-button');
const $translateEntryButtons = $('.translate-entry-button');
const $translateTimer = $('#translate-timer');
const $translatorDropdown = $('#translator-dropdown');

const Translators = {
  BAIDU_TRANSLATE: 'baiduTranslate',
  DEEPL_TRANSLATE: 'deeplTranslate',
  GOOGLE_TRANSLATE: 'googleTranslate',
  PAPAGO: 'papago',
  MICROSOFT_TRANSLATOR: 'microsoftTranslator',
  VIETPHRASE: 'vietphrase',
};

const SUPPORTED_LANGUAGES_CODE_LIST = ['', 'auto', 'auto-detect', 'en', 'EN', 'EN-US', 'ja', 'JA', 'ZH', 'zh-CN', 'zh-Hans', 'zh-TW', 'zh-Hant', 'vi'];

const DEEPL_AUTH_KEY_LIST = [
  ['0c9649a5-e8f6-632a-9c42-a9eee160c330:fx', 308163],
  ['4670812e-ea92-88b1-8b82-0812f3f4009b:fx', 52154],
  ['47c6c989-9eaa-5b30-4ee6-b2e4f1ebd530:fx', 500000],
  ['9e00d743-da37-8466-8e8d-18940eeeaf88:fx', 100970],
  ['a4b25ba2-b628-fa56-916e-b323b16502de:fx', 238323],
  // ['aa09f88d-ab75-3488-b8a3-18ad27a35870:fx', 500000],
  ['e5a36703-2001-1b8b-968c-a981fdca7036:fx', 500000],
  ['f114d13f-f882-aebe-2dee-0ef57f830218:fx', 499998],
  ['f1414922-db81-5454-67bd-9608cdca44b3:fx', 154587],
  ['f8ff5708-f449-7a57-65b0-6ac4524cf64c:fx', 21501],
].toSorted((a, b) => a[1] - b[1]);

const UUID = crypto.randomUUID();

const glossary = {
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
  SinoVietnameses: { ...JSON.parse(localStorage.getItem('glossary') ?? JSON.stringify({ SinoVietnameses: {} })).SinoVietnameses },
  vietPhrase: {},
  name: {},
  namePhu: { ...JSON.parse(localStorage.getItem('glossary') ?? JSON.stringify({ namePhu: {} })).namePhu },
  luatNhan: {},
  pronoun: {},
};

const translators = {};
let currentTranslator = null;
let translationController = null;
let lastTranslateEntryButton = null;

const getSourceLangOptionList = function getSourceLanguageOptionListHtmlFromTranslator(translator) {
  const sourceLanguageSelect = document.createElement('select');

  switch (translator) {
    case Translators.BAIDU_TRANSLATE: {
      Object.entries(BaiduTranslate.SOURCE_LANGUAGE_LIST).forEach(([languageCode, name]) => {
        const option = document.createElement('option');
        option.innerText = name;
        option.value = languageCode;
        sourceLanguageSelect.appendChild(option);
      });

      break;
    }
    case Translators.DEEPL_TRANSLATE: {
      DeepLTranslate.SOURCE_LANGUAGE_LIST.forEach(({ language, name }) => {
        if (!SUPPORTED_LANGUAGES_CODE_LIST.includes(language)) return;
        const option = document.createElement('option');
        option.innerText = name;
        option.value = language;
        sourceLanguageSelect.appendChild(option);
      });

      break;
    }
    case Translators.GOOGLE_TRANSLATE: {
      Object.entries(GoogleTranslate.SOURCE_LANGUAGE_LIST).forEach(([languageCode, name]) => {
        if (!SUPPORTED_LANGUAGES_CODE_LIST.includes(languageCode)) return;
        const option = document.createElement('option');
        option.innerText = name;
        option.value = languageCode;
        sourceLanguageSelect.appendChild(option);
      });

      break;
    }
    case Translators.PAPAGO: {
      Object.entries(Papago.SOURCE_LANGUAGE_LIST).forEach(([languageCode, name]) => {
        if (!SUPPORTED_LANGUAGES_CODE_LIST.includes(languageCode)) return;
        const option = document.createElement('option');
        option.innerText = name;
        option.value = languageCode;
        sourceLanguageSelect.appendChild(option);
      });

      break;
    }
    case Translators.VIETPHRASE: {
      Object.entries(Vietphrase.SOURCE_LANGUAGE_LIST).forEach(([languageCode, name]) => {
        const option = document.createElement('option');
        option.innerText = name;
        option.value = languageCode;
        sourceLanguageSelect.appendChild(option);
      });

      break;
    }
    default: {
      Object.entries(MicrosoftTranslator.SOURCE_LANGUAGE_LIST).forEach(([languageCode, { name }]) => {
        if (!SUPPORTED_LANGUAGES_CODE_LIST.includes(languageCode)) return;
        const option = document.createElement('option');
        option.innerText = name;
        option.value = languageCode;
        sourceLanguageSelect.appendChild(option);
      });

      break;
    }
  }

  return sourceLanguageSelect.innerHTML;
};

const getTargetLangOptionList = function getTargetLanguageOptionListHtmlFromTranslator(translator) {
  const targetLanguageSelect = document.createElement('select');

  switch (translator) {
    case Translators.BAIDU_TRANSLATE: {
      Object.entries(BaiduTranslate.TARGET_LANGUAGE_LIST).forEach(([languageCode, name]) => {
        const option = document.createElement('option');
        option.innerText = name;
        option.value = languageCode;
        targetLanguageSelect.appendChild(option);
      });

      break;
    }
    case Translators.DEEPL_TRANSLATE: {
      DeepLTranslate.TARGET_LANGUAGE_LIST.forEach(({ language, name }) => {
        if (!SUPPORTED_LANGUAGES_CODE_LIST.includes(language)) return;
        const option = document.createElement('option');
        option.innerText = name;
        option.value = language;
        targetLanguageSelect.appendChild(option);
      });

      break;
    }
    case Translators.GOOGLE_TRANSLATE: {
      Object.entries(GoogleTranslate.TARGET_LANGUAGE_LIST).forEach(([languageCode, name]) => {
        if (!SUPPORTED_LANGUAGES_CODE_LIST.includes(languageCode)) return;
        const option = document.createElement('option');
        option.innerText = name;
        option.value = languageCode;
        targetLanguageSelect.appendChild(option);
      });

      break;
    }
    case Translators.PAPAGO: {
      Object.entries(Papago.TARGET_LANGUAGE_LIST).forEach(([languageCode, name]) => {
        if (!SUPPORTED_LANGUAGES_CODE_LIST.includes(languageCode)) return;
        const option = document.createElement('option');
        option.innerText = name;
        option.value = languageCode;
        targetLanguageSelect.appendChild(option);
      });

      break;
    }
    case Translators.VIETPHRASE: {
      Object.entries(Vietphrase.TARGET_LANGUAGE_LIST).forEach(([languageCode, name]) => {
        const option = document.createElement('option');
        option.innerText = name;
        option.value = languageCode;
        targetLanguageSelect.appendChild(option);
      });

      break;
    }
    default: {
      Object.entries(MicrosoftTranslator.TARGET_LANGUAGE_LIST).forEach(([languageCode, { name }]) => {
        if (!SUPPORTED_LANGUAGES_CODE_LIST.includes(languageCode)) return;
        const option = document.createElement('option');
        option.innerText = name;
        option.value = languageCode;
        targetLanguageSelect.appendChild(option);
      });

      break;
    }
  }

  return targetLanguageSelect.innerHTML;
};

const loadLangSelectOptions = function loadLanguageListByTranslatorToHtmlOptions(translator) {
  const sourceLanguage = currentTranslator.DefaultLanguage.SOURCE_LANGUAGE;
  const targetLanguage = currentTranslator.DefaultLanguage.TARGET_LANGUAGE;
  $sourceLanguageSelect.html(getSourceLangOptionList(translator));
  $sourceLanguageSelect.val(sourceLanguage);
  $targetLanguageSelect.html(getTargetLangOptionList(translator));
  $targetLanguageSelect.val(targetLanguage);
};

const buildResult = function buildResultContentForTextarea(text, result) {
  try {
    const resultDiv = document.createElement('div');

    const originalLines = text.split('\n').map((element) => element.replace(/^\s+/, '').trim());
    const resultLines = result.split('\n').map((element) => element.replace(/^\s+/, '').trim());

    if ($showOriginalTextSwitch.prop('checked')) {
      let lostLineFixedNumber = 0;

      for (let i = 0; i < originalLines.length; i += 1) {
        if (i + lostLineFixedNumber < resultLines.length) {
          if (originalLines[i + lostLineFixedNumber].length === 0 && resultLines[i].length > 0) {
            lostLineFixedNumber += 1;
            i -= 1;
          } else if ($translatorDropdown.find('.active').val() === Translators.PAPAGO && resultLines[i].length === 0 && originalLines[i + lostLineFixedNumber].length > 0) {
            lostLineFixedNumber -= 1;
          } else {
            const paragraph = document.createElement('p');

            if (originalLines[i + lostLineFixedNumber].length > 0) {
              const idiomaticText = document.createElement('i');
              idiomaticText.innerText = originalLines[i + lostLineFixedNumber];
              paragraph.appendChild(idiomaticText);
              paragraph.innerHTML += resultLines[i].trim().length > 0 ? document.createElement('br').outerHTML : '';
              const attentionText = document.createElement('b');
              attentionText.innerText = resultLines[i];
              paragraph.appendChild(attentionText);
            } else {
              paragraph.innerText = resultLines[i];
            }

            resultDiv.appendChild(paragraph);
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

    return resultDiv.innerHTML;
  } catch (error) {
    console.error('Lỗi hiển thị bản dịch:', error);
    return error;
  }
};

const translate = async function translateContentInTextarea(controller = new AbortController()) {
  const activeTranslator = $translatorDropdown.find('.active').val();

  try {
    const startTime = Date.now();
    const text = $inputTextarea.val();
    const targetLanguage = $targetLanguageSelect.val();

    switch (activeTranslator) {
      case Translators.VIETPHRASE: {
        await currentTranslator.translateText(text, targetLanguage, glossary, {
          autocapitalize: true,
          nameEnabled: true,
        });
        break;
      }
      default: {
        await currentTranslator.translateText(text, targetLanguage, $sourceLanguageSelect.val());
      }
    }

    if (controller.signal.aborted) return;
    $resultTextarea.html(buildResult(text, currentTranslator.result));
    $resultTextarea.find('p > i').on('dblclick', function onClick() {
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(this);
      selection.removeAllRanges();
      selection.addRange(range);
      $glossaryManagerButton.trigger('mousedown');
      $glossaryManagerButton.click();
    });
    $translateTimer.text(Date.now() - startTime);
  } catch (error) {
    console.error(error);

    if (!controller.signal.aborted) {
      const paragraph = document.createElement('p');
      paragraph.innerText = `Bản dịch thất bại: ${error}`;
      $resultTextarea.appendChild(paragraph);
    }

    translators[activeTranslator] = null;
    $translatorDropdown.find('.active').click();
  }
};

const saveGlossary = function saveGlossaryToLocalStorage() {
  const glossaryList = $glossaryListSelect.val();
  $glossaryEntryCounter.text(Object.keys(glossary[glossaryList]).length);

  if (['vietPhrase', 'name', 'namePhu', 'luatNhan', 'pronoun'].some((element) => glossaryList === element)) {
    const activeTranslator = $translatorDropdown.find('.active').val();
    const addDeLeZhaoEnabled = $addDeLeZhaoSwitch.prop('checked');
    const multiplicationAlgorithm = $multiplicationAlgorithmRadio.filter('[checked]').val()

    if (activeTranslator === Translators.VIETPHRASE) {
      switch (glossaryList) {
        case 'vietPhrase': {
          currentTranslator.vietPhrase = null;
          break;
        }
        case 'name':
        case 'namePhu': {
          currentTranslator.name = null;
          break;
        }
        default: {
          currentTranslator = new Vietphrase(addDeLeZhaoEnabled, multiplicationAlgorithm);
          break;
        }
      }

      translators[activeTranslator] = currentTranslator;
    } else if (translators[Translators.VIETPHRASE] != null) {
      switch (glossaryList) {
        case 'vietPhrase': {
          translators[Translators.VIETPHRASE].vietPhrase = null;
          break;
        }
        case 'name':
        case 'namePhu': {
          translators[Translators.VIETPHRASE].name = null;
          break;
        }
        default: {
          translators[Translators.VIETPHRASE] = null;
          break;
        }
      }
    }
  }

  const { SinoVietnameses, namePhu } = glossary;
  localStorage.setItem('glossary', JSON.stringify({ SinoVietnameses, namePhu }));
  if (Object.hasOwn(JSON.parse(localStorage.setItem('glossary')), glossaryList)) sessionStorage.setItem('glossary', Object.entries(glossary[glossaryList]).map((element) => element.join('=')).join('\n'));
};

$(document).ready(async () => {
  $resultTextarea.attr('contenteditable', !Utils.isOnMobile());
  $inputTextarea.trigger('input');

  $.ajax({
    cache: false,
    method: 'GET',
    url: '/static/datasource/Unihan_Variants.txt',
  }).done((data) => {
    const array = data.split('\n').filter((element) => element.length > 0 && !element.startsWith('#')).map((element) => element.split('\t'));

    glossary.traditional = array.filter((element) => element.length === 3 && element[1] === 'kTraditionalVariant').map(([first, __, third]) => [String.fromCodePoint(parseInt(first.substring(2), 16)), third.split(' ').filter((element) => third.split(' ').length === 1 || element !== first).map((element) => String.fromCodePoint(parseInt(element.substring(2), 16)))[0]]);
    console.log(`Đã tải xong bộ dữ liệu phổn thể (${glossary.traditional.length})!`);

    glossary.simplified = array.filter((element) => element.length === 3 && element[1] === 'kSimplifiedVariant').map(([first, __, third]) => [String.fromCodePoint(parseInt(first.substring(2), 16)), third.split(' ').filter((element) => third.split(' ').length === 1 || element !== first).map((element) => String.fromCodePoint(parseInt(element.substring(2), 16)))[0]]);
    console.log(`Đã tải xong bộ dữ liệu giản thể (${glossary.simplified.length})!`);
  }).fail((__, ___, errorThrown) => {
    console.error('Không thể tải bộ dữ liệu giản thể-phổn thể:', errorThrown);
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  });

  $.ajax({
    cache: false,
    method: 'GET',
    url: '/static/datasource/Unihan_Readings.txt',
  }).done((data) => {
    const array = data.split('\n').filter((element) => element.length > 0 && !element.startsWith('#')).map((element) => element.split('\t'));
    glossary.pinyins = array.filter((element) => element.length === 3 && element[1] === 'kMandarin').map(([first, __, third]) => [String.fromCodePoint(parseInt(first.substring(2), 16)), third.split(' ')[0]]);
    console.log(`Đã tải xong bộ dữ liệu bính âm (${glossary.pinyins.length})!`);
    glossary.KunYomis = array.filter((element) => element.length === 3 && element[1] === 'kJapaneseKun').map(([first, __, third]) => [String.fromCodePoint(parseInt(first.substring(2), 16)), third.split(' ')[0].toLowerCase()]);
    console.log(`Đã tải xong bộ dữ liệu Kun'yomi (${glossary.KunYomis.length})!`);
    glossary.OnYomis = array.filter((element) => element.length === 3 && element[1] === 'kJapaneseOn').map(([first, __, third]) => [String.fromCodePoint(parseInt(first.substring(2), 16)), third.split(' ')[0].toLowerCase()]);
    console.log(`Đã tải xong bộ dữ liệu On'yomi (${glossary.OnYomis.length})!`);
  }).fail((__, ___, errorThrown) => {
    console.error('Không thể tải bộ dữ liệu bính âm, Kun\'yomi và On\'yomi:', errorThrown);
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  });

  try {
    let hanvietList = (await $.ajax({
      cache: false,
      method: 'GET',
      url: '/static/datasource/HanVietGhep.tsv',
    })).split('\n').map((element) => element.split('\t'));
    hanvietList = hanvietList.concat((await $.ajax({
      cache: false,
      method: 'GET',
      url: '/static/datasource/lacviet/lv-[zh-vi].tsv',
    })).split('\n').map((element) => (!element.startsWith('#') ? element.split('\t') : element)).filter((a) => typeof a !== 'string' && /^\p{Script=Hani}+$/u.test(a[0]) && [...a[1].replaceAll('<span class="east"> </span>', ' ').matchAll(/Hán Việt: *[^<]*/g)].filter(([first]) => first.replace(/Hán Việt: */, '').length > 0).length > 0).map(([a, second]) => [a, [...second.replaceAll('<span class="east"> </span>', ' ').matchAll(/Hán Việt: *[^<]*/g)].filter(([b]) => b.replace(/Hán Việt: */, '').length > 0)[0][0].replace(/Hán Việt: */, '').split(/[,;] */)[0].trim().toLowerCase()]));
    hanvietList = hanvietList.concat(cjkv.nam.map(([first, second]) => [first, second.split(',').filter((element) => element.length > 0)[0].trimStart().replaceAll(Utils.getTrieRegexPatternFromWords(Object.keys(newAccentObject)), (match) => newAccentObject[match] ?? match)]));
    hanvietList = hanvietList.concat(hanData.names.map(([first, second]) => [first, second.split(',').filter((element) => element.length > 0)[0].replaceAll(Utils.getTrieRegexPatternFromWords(Object.keys(newAccentObject)), (match) => newAccentObject[match] ?? match)]));
    hanvietList = hanvietList.filter(function filter(element) {
      return element.join('=').length > 0 && element.length === 2 && !this[element[0]] && (this[element[0]] = 1);
    }, {});
    glossary.hanViet = hanvietList;
    console.log(`Đã tải xong bộ dữ liệu Hán-Việt (${hanvietList.length})!`);
  } catch (error) {
    console.error('Không thể tải bộ dữ liệu Hán-Việt:', error);
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  }

  $translatorDropdown.find('.active').click();
  $inputTextarea.trigger('input');
  $defaultVietPhraseFileSelect.change();
});

$('.language-select').on('change', () => {
  $retranslateButton.click();
});

$translateButton.on('click', function onClick() {
  const $copyButton = $copyButtons.filter(`[data-target="#${$inputTextarea.attr('id')}"]`);
  const $pasteButton = $pasteButtons.filter(`[data-target="#${$inputTextarea.attr('id')}"]`);

  switch ($(this).text()) {
    case 'Huỷ':
    case 'Sửa': {
      if ($(this).text() === 'Huỷ') translationController.abort();
      $resultTextarea.html(null);
      $translateTimer.text(0);
      $resultTextarea.hide();
      $inputTextarea.show();
      $copyButton.data('target', `#${$inputTextarea.attr('id')}`);
      $copyButton.removeClass('disabled');
      $pasteButton.removeClass('disabled');
      $(this).text('Dịch');
      $retranslateButton.addClass('disabled');
      break;
    }
    default: {
      if ($inputTextarea.val().length === 0) break;
      $resultTextarea.html($resultTextarea.html().split(/<br>|<\/p><p>/).map((element, index) => (index === 0 ? `Đang dịch...${element.slice(12).replaceAll(/./g, ' ')}` : element.replaceAll(/./g, ' '))).join('<br>'));
      $inputTextarea.hide();
      $resultTextarea.show();
      $copyButton.addClass('disabled');
      $pasteButton.addClass('disabled');
      $copyButton.data('target', `#${$resultTextarea.attr('id')}`);
      translationController = new AbortController();
      $(this).text('Huỷ');
      translate(translationController).finally(() => {
        if (translationController.signal.aborted) {
          translationController = null;
          return;
        }

        translationController = null;
        $(this).text('Sửa');
        $copyButton.removeClass('disabled');
        $pasteButton.removeClass('disabled');
        $retranslateButton.removeClass('disabled');
      });
      break;
    }
  }
});

$copyButtons.on('click', function onClick() {
  const target = $(this).data('target');
  const $target = $(target);

  if ($target.length > 0) {
    if ($target.attr('id') === $resultTextarea.attr('id') && currentTranslator.result.length > 0) navigator.clipboard.writeText(currentTranslator.result);
    else if ($target.val().length > 0) navigator.clipboard.writeText($target.val());
    return;
  }

  if (sessionStorage.getItem(target) != null && sessionStorage.getItem(target).length > 0) navigator.clipboard.writeText(sessionStorage.getItem(target));
});

$pasteButtons.on('click', function onClick() {
  navigator.clipboard.readText().then((clipText) => {
    const $targetTextInput = $($(this).data('target'));
    if (clipText === $targetTextInput.val()) return;
    $targetTextInput.prop('scrollLeft', 0);
    $targetTextInput.prop('scrollTop', 0);

    if ($targetTextInput.attr('id') === $inputTextarea.attr('id')) {
      $resultTextarea.prop('scrollTop', 0);
      $targetTextInput.val(clipText).trigger('input');
      $retranslateButton.click();
    } else {
      $targetTextInput.val(clipText).trigger('input');
    }
  });
});

$retranslateButton.on('click', () => {
  if ($translateButton.text() === 'Sửa') $translateButton.text('Dịch').click();
});

$glossaryManagerButton.on('mousedown', () => {
  if ($resultTextarea.is(':visible')) $sourceEntryInput.val((window.getSelection().toString() || '').replaceAll(/\n/g, ' '));
  if (window.getSelection) window.getSelection().removeAllRanges();
});

$inputTextarea.on('input', function onInput() {
  $('#input-textarea-counter').text($(this).val().length);
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
  if (event.key === 'Enter') {
    if (event.ctrlKey) {
      $glossaryManagerButton.trigger('mousedown');
      $glossaryManagerButton.click();
    } else if (event.key === 'Enter') {
      $translateButton.click();
      $inputTextarea.focus();
    }

    event.preventDefault();
  }
});

$('.modal textarea, .modal input[type="text"]').on('blur', function onBlur() {
  $(this).prop('scrollLeft', 0);
  $(this).prop('scrollTop', 0);
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

$fontStackText.change(function onChange() {
  const values = $(this).val().split(/, */).filter((element) => element.length > 0).map((element) => element.trim());
  $(this).val(values.join(', '));

  $(document.documentElement).css('--opt-font-family', values.map((element) => {
    const maybeFontStacks = element.startsWith('--') ? `var(${element})` : element;
    return element.includes(' ') ? `'${element}'` : maybeFontStacks;
  }).join(', '));
});

$translatorDropdown.find('.dropdown-item').click(function onClick() {
  $translatorDropdown.find('.dropdown-item').removeClass('active');
  $(this).addClass('active');
  const activeTranslator = $(this).val();
  currentTranslator = translators[activeTranslator];

  switch (activeTranslator) {
    case Translators.BAIDU_TRANSLATE: {
      if (currentTranslator == null) currentTranslator = new BaiduTranslate();
      break;
    }
    case Translators.DEEPL_TRANSLATE: {
      while (currentTranslator == null || (currentTranslator.usage.character_limit - currentTranslator.usage.character_count) < 100000) {
        currentTranslator = new DeepLTranslate(DEEPL_AUTH_KEY_LIST[0][0]);
        if ((currentTranslator.usage.character_limit - currentTranslator.usage.character_count) >= 100000) break;
        DEEPL_AUTH_KEY_LIST.shift();
      }

      break;
    }
    case Translators.GOOGLE_TRANSLATE: {
      if (currentTranslator == null) currentTranslator = new GoogleTranslate();
      break;
    }
    case Translators.PAPAGO: {
      if (currentTranslator == null) currentTranslator = new Papago(UUID);
      break;
    }
    case Translators.VIETPHRASE: {
      if (currentTranslator == null) currentTranslator = new Vietphrase($addDeLeZhaoSwitch.prop('checked'), $multiplicationAlgorithmRadio.filter('[checked]').val());
      break;
    }
    default: {
      if (currentTranslator == null) currentTranslator = new MicrosoftTranslator($toneSelect.val());
      break;
    }
  }

  translators[activeTranslator] = currentTranslator;
  loadLangSelectOptions(activeTranslator);
  $retranslateButton.click();
});

$showOriginalTextSwitch.on('change', () => {
  $retranslateButton.click();
});

$toneSelect.on('change', () => {
  const $activeTranslator = $translatorDropdown.find('.active');

  if ($activeTranslator.val() === Translators.MICROSOFT_TRANSLATOR) {
    translators[$activeTranslator.val()] = null;
    $activeTranslator.click();
  }
});

$defaultVietPhraseFileSelect.change(async function onChange() {
  const intValue = parseInt($(this).val(), 10);

  if (intValue > 0) {
    const hanVietFirstList = glossary.hanViet.map(([first]) => first);

    switch (intValue) {
      case 1:
      case 2: {
        if (glossary.dataByThtgiangPronoun == null || glossary.dataByThtgiangPronoun.length === 0) {
          await $.ajax({
            cache: false,
            method: 'GET',
            url: '/static/datasource/Quick Translator/Pronouns.txt',
          }).done((data) => {
            glossary.dataByThtgiangPronoun = data.split('\r\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('='));
          }).fail((__, ___, errorThrown) => {
            glossary.dataByThtgiangPronoun = null;
            console.error('Không tải được tệp Quick Translator\'s Pronouns:', errorThrown);
          });
        }

        glossary.pronoun = { ...Object.fromEntries(glossary.dataByThtgiangPronoun.filter(function filter([first]) {
          return !this[first] && (this[first] = 1);
        }, {})) };
        console.log(`Đã tải xong tệp Pronouns (${Object.keys(glossary.pronoun).length})!`);

        if (glossary.dataByThtgiangLuatNhan == null || glossary.dataByThtgiangLuatNhan.length === 0) {
          await $.ajax({
            cache: false,
            method: 'GET',
            url: '/static/datasource/Quick Translator/LuatNhan.txt',
          }).done((data) => {
            glossary.dataByThtgiangLuatNhan = data.split('\r\n').filter((element) => element.length > 0 && !element.startsWith('#') && element.split('=').length === 2).map((element) => element.split('='));
          }).fail((__, ___, errorThrown) => {
            glossary.dataByThtgiangLuatNhan = null;
            console.error('Không tải được tệp Quick Translator\'s LuatNhan:', errorThrown);
          });
        }

        glossary.luatNhan = { ...Object.fromEntries(glossary.dataByThtgiangLuatNhan.filter(function filter([first]) {
          return !this[first] && (this[first] = 1);
        }, {})) };
        console.log(`Đã tải xong tệp LuatNhan (${Object.keys(glossary.luatNhan).length})!`);

        if (glossary.quickTranslatorHanViet == null || glossary.quickTranslatorHanViet.length === 0) {
          await $.ajax({
            cache: false,
            method: 'GET',
            url: '/static/datasource/Quick Translator/ChinesePhienAmWords.txt',
          }).done((data) => {
            glossary.quickTranslatorHanViet = data.split('\r\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('='));
          }).fail((__, ___, errorThrown) => {
            glossary.quickTranslatorHanViet = null;
            console.error('Không tải được tệp Quick Translator\'s ChinesePhienAmWords:', errorThrown);
          });
        }

        if (glossary.quickTranslatorName == null || glossary.quickTranslatorName.length === 0) {
          await $.ajax({
            cache: false,
            method: 'GET',
            url: '/static/datasource/Quick Translator/Names.txt',
          }).done((data) => {
            glossary.quickTranslatorName = data.split('\r\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('='));
          }).fail((__, ___, errorThrown) => {
            glossary.quickTranslatorName = null;
            console.error('Không tải được tệp Quick Translator\'s Names:', errorThrown);
          });
        }

        glossary.name = { ...Object.fromEntries(glossary.quickTranslatorName.filter(function filter([first]) {
          return !this[first] && (this[first] = 1);
        }, {})) };
        console.log(`Đã tải xong tệp Names (${Object.keys(glossary.name).length})!`);

        if (glossary.quickTranslatorVietphraseForMergeFiles == null || glossary.quickTranslatorVietphraseForMergeFiles.length === 0) {
          await $.ajax({
            cache: false,
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
            cache: false,
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
          glossary.vietPhrase = glossary.quickTranslatorVietphraseForMergeFiles != null && glossary.quickTranslatorVietPhrase != null ? Object.fromEntries(glossary.quickTranslatorVietphraseForMergeFiles.concat(glossary.quickTranslatorVietPhrase, glossary.quickTranslatorHanViet.filter(([first]) => hanVietFirstList.includes(first))).filter(function filter([first]) {
            return !this[first] && (this[first] = 1);
          }, {})) : {};
        } else {
          glossary.vietPhrase = { ...Object.fromEntries(glossary.quickTranslatorVietPhrase.concat(glossary.quickTranslatorHanViet.filter(([first]) => hanVietFirstList.includes(first))).filter(function filter([first]) {
            return !this[first] && (this[first] = 1);
          }, {})) };
        }

        console.log(`Đã tải xong tệp VietPhrase (${Object.keys(glossary.vietPhrase).length})!`);
        break;
      }
      case 3: {
        if (glossary.dataByThtgiangPronoun == null || glossary.dataByThtgiangPronoun.length === 0) {
          await $.ajax({
            cache: false,
            method: 'GET',
            url: '/static/datasource/Data của thtgiang/Pronouns.txt',
          }).done((data) => {
            glossary.dataByThtgiangPronoun = data.split('\r\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('='));
          }).fail((__, ___, errorThrown) => {
            glossary.dataByThtgiangPronoun = null;
            console.error('Không tải được tệp Data của thtgiang\'s Pronouns:', errorThrown);
          });
        }

        glossary.pronoun = { ...Object.fromEntries(glossary.dataByThtgiangPronoun.filter(function filter([first]) {
          return !this[first] && (this[first] = 1);
        }, {})) };
        console.log(`Đã tải xong tệp Pronouns (${Object.keys(glossary.pronoun).length})!`);

        if (glossary.dataByThtgiangLuatNhan == null || glossary.dataByThtgiangLuatNhan.length === 0) {
          await $.ajax({
            cache: false,
            method: 'GET',
            url: '/static/datasource/Data của thtgiang/LuatNhan.txt',
          }).done((data) => {
            glossary.dataByThtgiangLuatNhan = data.split('\r\n').filter((element) => element.length > 0 && !element.startsWith('#') && element.split('=').length === 2).map((element) => element.split('='));
          }).fail((__, ___, errorThrown) => {
            glossary.dataByThtgiangLuatNhan = null;
            console.error('Không tải được tệp Data của thtgiang\'s LuatNhan:', errorThrown);
          });
        }

        glossary.luatNhan = { ...Object.fromEntries(glossary.dataByThtgiangLuatNhan.filter(function filter([first]) {
          return !this[first] && (this[first] = 1);
        }, {})) };
        console.log(`Đã tải xong tệp LuatNhan (${Object.keys(glossary.luatNhan).length})!`);

        if (glossary.dataByThtgiangHanViet == null || glossary.dataByThtgiangHanViet.length === 0) {
          await $.ajax({
            cache: false,
            method: 'GET',
            url: '/static/datasource/Data của thtgiang/ChinesePhienAmWords.txt',
          }).done((data) => {
            glossary.dataByThtgiangHanViet = data.split('\r\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('='));
          }).fail((__, ___, errorThrown) => {
            glossary.dataByThtgiangHanViet = null;
            console.error('Không tải được tệp Data của thtgiang\'s ChinesePhienAmWords:', errorThrown);
          });
        }

        if (glossary.dataByThtgiangName == null || glossary.dataByThtgiangName.length === 0) {
          await $.ajax({
            cache: false,
            method: 'GET',
            url: '/static/datasource/Data của thtgiang/Names.txt',
          }).done((data) => {
            glossary.dataByThtgiangName = data.split('\r\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('='));
          }).fail((__, ___, errorThrown) => {
            glossary.dataByThtgiangName = null;
            console.error('Không tải được tệp Data của thtgiang\'s Names:', errorThrown);
          });
        }

        glossary.name = { ...Object.fromEntries(glossary.dataByThtgiangName.filter(function filter([first]) {
          return !this[first] && (this[first] = 1);
        }, {})) };
        console.log(`Đã tải xong tệp Names (${Object.keys(glossary.name).length})!`);

        if (glossary.dataByThtgiangVietPhrase == null || glossary.dataByThtgiangVietPhrase.length === 0) {
          await $.ajax({
            cache: false,
            method: 'GET',
            url: '/static/datasource/Data của thtgiang/VietPhrase.txt',
          }).done((data) => {
            glossary.dataByThtgiangVietPhrase = data.split('\r\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('='));
          }).fail((__, ___, errorThrown) => {
            glossary.dataByThtgiangVietPhrase = null;
            console.error('Không tải được tệp Data của thtgiang\'s VietPhrase:', errorThrown);
          });
        }

        glossary.vietPhrase = { ...Object.fromEntries(glossary.dataByThtgiangVietPhrase.concat(glossary.dataByThtgiangHanViet.filter(([first]) => hanVietFirstList.includes(first))).filter(function filter([first]) {
          return !this[first] && (this[first] = 1);
        }, {})) };
        console.log(`Đã tải xong tệp VietPhrase (${Object.keys(glossary.vietPhrase).length})!`);
        break;
      }
      case 4: {
        if (glossary.ttvtranslateHanViet == null || glossary.ttvtranslateHanViet.length === 0) {
          await $.ajax({
            cache: false,
            method: 'GET',
            url: '/static/datasource/ttvtranslate/ChinesePhienAmWords.txt',
          }).done((data) => {
            glossary.ttvtranslateHanViet = data.split('\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('='));
          }).fail((__, ___, errorThrown) => {
            glossary.ttvtranslateHanViet = null;
            console.error('Không tải được tệp ttvtranslate\'s ChinesePhienAmWords:', errorThrown);
          });
        }

        if (glossary.ttvtranslateName == null || glossary.ttvtranslateName.length === 0) {
          await $.ajax({
            cache: false,
            method: 'GET',
            url: '/static/datasource/ttvtranslate/Names.txt',
          }).done((data) => {
            glossary.ttvtranslateName = data.split('\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('='));
          }).fail((__, ___, errorThrown) => {
            glossary.ttvtranslateName = null;
            console.error('Không tải được tệp ttvtranslate\'s Names:', errorThrown);
          });
        }

        glossary.name = { ...Object.fromEntries(glossary.ttvtranslateName.filter(function filter([first]) {
          return !this[first] && (this[first] = 1);
        }, {})) };
        console.log(`Đã tải xong tệp Names (${Object.keys(glossary.name).length})!`);

        if (glossary.ttvtranslateVietPhrase == null || glossary.ttvtranslateVietPhrase.length === 0) {
          await $.ajax({
            cache: false,
            method: 'GET',
            url: '/static/datasource/ttvtranslate/VietPhrase.txt',
          }).done((data) => {
            glossary.ttvtranslateVietPhrase = data.split('\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('='));
          }).fail((__, ___, errorThrown) => {
            glossary.ttvtranslateVietPhrase = null;
            console.error('Không tải được tệp ttvtranslate\'s VietPhrase:', errorThrown);
          });
        }

        glossary.vietPhrase = { ...Object.fromEntries(glossary.ttvtranslateVietPhrase.concat(glossary.ttvtranslateHanViet.filter(([first]) => hanVietFirstList.includes(first))).filter(function filter([first]) {
          return !this[first] && (this[first] = 1);
        }, {})) };
        console.log(`Đã tải xong tệp VietPhrase (${Object.keys(glossary.vietPhrase).length})!`);
        break;
      }
      case 5: {
        if (glossary.translateHanViet == null || glossary.translateHanViet.length === 0) {
          await $.ajax({
            cache: false,
            method: 'GET',
            url: '/static/datasource/Translate/ChinesePhienAmWords.txt',
          }).done((data) => {
            glossary.translateHanViet = data.split('\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('='));
          }).fail((__, ___, errorThrown) => {
            glossary.translateHanViet = null;
            console.error('Không tải được tệp Translate\'s Names:', errorThrown);
          });
        }

        if (glossary.translateName == null || glossary.translateName.length === 0) {
          await $.ajax({
            cache: false,
            method: 'GET',
            url: '/static/datasource/Translate/Names.txt',
          }).done((data) => {
            glossary.translateName = data.split('\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('='));
          }).fail((__, ___, errorThrown) => {
            glossary.translateName = null;
            console.error('Không tải được tệp Translate\'s Names:', errorThrown);
          });
        }

        glossary.name = { ...Object.fromEntries(glossary.translateName.filter(function filter([first]) {
          return !this[first] && (this[first] = 1);
        }, {})) };
        console.log(`Đã tải xong tệp Names (${Object.keys(glossary.name).length})!`);

        if (glossary.translateVietPhrase == null || glossary.translateVietPhrase.length === 0) {
          await $.ajax({
            cache: false,
            method: 'GET',
            url: '/static/datasource/Translate/VietPhrase.txt',
          }).done((data) => {
            glossary.translateVietPhrase = data.split('\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('='));
          }).fail((__, ___, errorThrown) => {
            glossary.translateVietPhrase = null;
            console.error('Không tải được tệp Translate\'s VietPhrase:', errorThrown);
          });
        }

        glossary.vietPhrase = { ...Object.fromEntries(glossary.translateVietPhrase.concat(glossary.translateHanViet.filter(([first]) => hanVietFirstList.includes(first))).filter(function filter([first]) {
          return !this[first] && (this[first] = 1);
        }, {})) };
        console.log(`Đã tải xong tệp VietPhrase (${Object.keys(glossary.vietPhrase).length})!`);
        break;
      }
      // no default
    }
  }

  saveGlossary();
});

$addDeLeZhaoSwitch.on('change', () => {
  if ($translatorDropdown.find('.active').val() === Translators.VIETPHRASE) {
    currentTranslator.vietPhrase = null;
    $retranslateButton.click();
  }
});

$multiplicationAlgorithmRadio.on('change', () => {
  if ($translatorDropdown.find('.active').val() === Translators.VIETPHRASE) {
    currentTranslator.name = null;
    currentTranslator.vietPhrase = null;
    $retranslateButton.click();
  }
});

$glossaryModal.on('shown.bs.modal', () => {
  const text = $sourceEntryInput.val();

  if (text.length > 0) {
    const isGlossaryExist = false;
    ['namePhu', 'name', 'vietPhrase'].some((element) => {
      if (Object.hasOwn(glossary[element], text)) {
        if ($glossaryListSelect.val() === element) return true;
        $glossaryListSelect.val(element).change();
        isGlossaryExist = true;
        return true;
      }

      return false;
    });
    if (lastTranslateEntryButton != null) lastTranslateEntryButton.click();
    else if (!isGlossaryExist) $sourceEntryInput.trigger('input');
  }
});

$glossaryModal.on('hide.bs.modal', () => {
  if (translationController != null) translationController.abort();
  $sourceEntryInput.val(null).trigger('input');
  $addButton.addClass('disabled');
  $removeButton.addClass('disabled');
});

$glossaryInput.on('change', function onChange() {
  const reader = new FileReader();

  reader.onload = function onLoad() {
    glossary[$glossaryListSelect.val()] = Object.fromEntries(this.result.split(/\r?\n|\r/).filter((element) => element.length > 0 && ($glossaryListSelect.val() !== 'luatNhan' || !element.startsWith('#')) && element.split('=').length === 2).map((element) => element.split('=')));
    saveGlossary();
    if ($sourceEntryInput.val().length > 0) $sourceEntryInput.trigger('input');
  };

  reader.readAsText($(this).prop('files')[0]);
});

$('#clear-glossary-button').on('click', () => {
  if (!window.confirm('Bạn có muốn xoá sạch bảng thuật ngữ chứ?')) return;
  const glossaryList = $glossaryListSelect.val();
  glossary[glossaryList] = {};
  saveGlossary();

  if ($translatorDropdown.find('.active').val() === Translators.VIETPHRASE) {
    switch (glossaryList) {
      case 'vietPhrase': {
        currentTranslator.vietPhrase = null;
        break;
      }
      case 'name':
      case 'namePhu': {
        currentTranslator.name = null;
        break;
      }
      case 'luatNhan':
      case 'pronoun': {
        currentTranslator.vietPhrase = null;
        currentTranslator.name = null;
        break;
      }
      // no default
    }
  }
});

$glossaryListSelect.change(function onChange() {
  const glossaryList = glossary[$(this).val()];
  $glossaryEntryCounter.text(Object.keys(glossaryList).length);
  if (Object.hasOwn(JSON.parse(localStorage.setItem('glossary')), glossaryList)) sessionStorage.setItem('glossary', Object.entries(glossaryList).map((element) => element.join('=')).join('\n'));
  if ($sourceEntryInput.val().length > 0 && (Object.hasOwn(glossaryList, $sourceEntryInput.val()) || window.confirm('Bạn có muốn chuyển đổi lại chứ?'))) $sourceEntryInput.trigger('input');
});

$sourceEntryInput.on('input', async function onInput() {
  const text = $(this).val();

  if (text.length > 0) {
    const currentGlossary = glossary[$glossaryListSelect.val()];

    if (Object.hasOwn(currentGlossary, text)) {
      $targetEntryTextarea.val(currentGlossary[text]);
      $removeButton.removeClass('disabled');
    } else {
      $translateEntryButtons.filter(`[data-translator="vietphrase"][data-lang="${$glossaryListSelect.val() === 'vietPhrase' ? 'vi' : 'SinoVietnamese'}"]`).click();
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

$targetEntryTextarea.on('input', function onInput() {
  $(this).val($(this).val().replaceAll(/\n/g, ' '));
});

$targetEntryTextarea.on('keypress', (event) => {
  if (event.key === 'Enter') {
    $addButton.click();
    event.preventDefault();
  }
});

$('.define-button').on('click', function onClick() {
  if ($sourceEntryInput.val().length > 0) {
    let defineContent = ($sourceEntryInput.val().substring($sourceEntryInput.prop('selectionStart'), $sourceEntryInput.prop('selectionEnd')) || $sourceEntryInput.val()).trim(); // .substring(0, 30)

    if ($(this).data('type') != null || $(this).data('type') !== 'encodeURIText') {
      switch ($(this).data('type')) {
        case 'char': {
          [defineContent] = defineContent.split(/(?:)/u);
          break;
        }
        case 'codePoint': {
          defineContent = defineContent.codePointAt();
          break;
        }
        // no default
      }
    } else {
      defineContent = encodeURIComponent(defineContent);
    }

    window.open($(this).data('href').replace('%s', defineContent), '_blank', 'width=1000,height=577');
  }

  if (window.getSelection) window.getSelection().removeAllRanges();
  else if (document.selection) document.selection.empty();
  $sourceEntryInput.blur();
});

$('.translate-webpage-button').on('click', function onClick() {
  if ($sourceEntryInput.val().length > 0) window.open($(this).data('href').replace('%s', encodeURIComponent($sourceEntryInput.val().trimEnd())), '_blank', 'width=1000,height=577');
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
  }
});

$translateEntryButtons.click(async function onClick() {
  const text = $sourceEntryInput.val();

  if ($translateButton.text() !== 'Huỷ' && text.length > 0) {
    translationController = new AbortController();
    $translateEntryButtons.addClass('disabled');
    $sourceEntryInput.attr('readonly', true);
    const activeTranslator = $(this).data('translator');
    let translator = translators[activeTranslator];
    const targetLanguage = $(this).data('lang');

    try {
      switch (activeTranslator) {
        case Translators.BAIDU_TRANSLATE: {
          if (translator == null) translator = new BaiduTranslate();
          break;
        }
        case Translators.DEEPL_TRANSLATE: {
          while (translator == null || (translator.usage.character_limit - translator.usage.character_count) < 100000) {
            translator = new DeepLTranslate(DEEPL_AUTH_KEY_LIST[0][0]);
            if ((translator.usage.character_limit - translator.usage.character_count) >= 100000) break;
            DEEPL_AUTH_KEY_LIST.shift();
          }

          break;
        }
        case Translators.GOOGLE_TRANSLATE: {
          if (translator == null) translator = new GoogleTranslate();
          break;
        }
        case Translators.MICROSOFT_TRANSLATOR: {
          if (translator == null) translator = new MicrosoftTranslator($toneSelect.val());
          break;
        }
        case Translators.PAPAGO: {
          if (translator == null) translator = new Papago(UUID);
          break;
        }
        default: {
          if (translator == null) translator = new Vietphrase($addDeLeZhaoSwitch.prop('checked'), $multiplicationAlgorithmRadio.filter('[checked]').val());
          await translator.translateText(text, targetLanguage, glossary, {
            autocapitalize: false,
            nameEnabled: false,
          });
          break;
        }
      }

      translators[activeTranslator] = translator;

      if (!translationController.signal.aborted) {
        $targetEntryTextarea.val(activeTranslator === Translators.VIETPHRASE ? translator.result : await translator.translateText(text, targetLanguage)).trigger('input');
        lastTranslateEntryButton = $(this);
      }

      if (activeTranslator === Translators.VIETPHRASE) lastTranslateEntryButton = null;
      $sourceEntryInput.removeAttr('readonly');
      $translateEntryButtons.removeClass('disabled');
      translationController = null;
    } catch (error) {
      console.error(error);
      translators[activeTranslator] = null;
      lastTranslateEntryButton = null;
    }
  }
});

$addButton.click(() => {
  if ($sourceEntryInput.val().length === 0) return;
  if ($glossaryListSelect.val() === 'namePhu' && Object.hasOwn(glossary.name, $sourceEntryInput.val())) delete glossary.name[$sourceEntryInput.val()];
  if (Object.hasOwn(glossary[$glossaryListSelect.val()], $sourceEntryInput.val())) delete glossary[$glossaryListSelect.val()][$sourceEntryInput.val()];
  glossary[$glossaryListSelect.val()][$sourceEntryInput.val()] = $targetEntryTextarea.val();
  saveGlossary();
  $addButton.addClass('disabled');
  $removeButton.addClass('disabled');
  $sourceEntryInput.val(null).trigger('input');
});

$removeButton.on('click', () => {
  if (!Object.hasOwn(glossary[$glossaryListSelect.val()], $sourceEntryInput.val()) || !window.confirm('Bạn có muốn xoá cụm từ này chứ?')) return;
  delete glossary[$glossaryListSelect.val()][$sourceEntryInput.val()];
  saveGlossary();
  $translateEntryButtons.filter(`[data-translator="vietphrase"][data-lang="${$glossaryListSelect.val() === 'vietPhrase' ? 'vi' : 'SinoVietnamese'}"]`).click();
  $removeButton.addClass('disabled');
});
