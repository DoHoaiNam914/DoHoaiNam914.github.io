'use strict';

/* global $, axios, bootstrap, cjkv */

import BaiduTranslate from '/static/js/dich-nhanh/may-dich/BaiduTranslate.js';
import CoccocEduTranslate from '/static/js/dich-nhanh/may-dich/CoccocEduTranslate.js';
import DeeplTranslate from '/static/js/dich-nhanh/may-dich/DeeplTranslate.js';
import GenerativeAi from '/static/js/dich-nhanh/may-dich/GenerativeAi.js';
import GoogleTranslate from '/static/js/dich-nhanh/may-dich/GoogleTranslate.js';
import Lingvanex from '/static/js/dich-nhanh/may-dich/Lingvanex.js';
import MicrosoftTranslator from '/static/js/dich-nhanh/may-dich/MicrosoftTranslator.js';
import Papago from '/static/js/dich-nhanh/may-dich/Papago.js';
import WebnovelTranslate from '/static/js/dich-nhanh/may-dich/WebnovelTranslate.js';

import Translators from '/static/js/dich-nhanh/Translators.js';

import * as Standardize from '/static/js/Standardize.js';
import * as Utils from '/static/js/Utils.js';

const $addButton = $('#add-button');
const $alignmentRadio = $('input[type="radio"][name="alignment-radio"]');
const $anthropicApiKeyText = $('#anthropic-api-key-text');
const $boldTextSwitch = $('#bold-text-switch');
const $copyButtons = $('.copy-button');
const $deeplAuthKeyText = $('#deepl-auth-key-text');
const $dropdownHasCollapse = $('.dropdown-has-collapse');
const $fontStackText = $('#font-stack-text');
const $fontSizeText = $('#font-size-text');
const $geminiApiKeyText = $('#gemini-api-key-text');
const $glossaryEntryCounter = $('#glossary-entry-counter');
const $glossaryInput = $('#glossary-input');
const $glossaryListSelect = $('#glossary-list-select');
const $glossaryManagerButton = $('#glossary-manager-button');
const $glossaryModal = $('#glossary-modal');
const $inputTextarea = $('#input-textarea');
const $openaiApiKeyText = $('#openai-api-key-text');
const $pasteButtons = $('.paste-button');
const $polishSwitch = $('#polish-switch');
const $removeButton = $('#remove-button');
const $resultTextarea = $('#result-textarea');
const $retranslateButton = $('#retranslate-button');
const $showOriginalTextSwitch = $('#show-original-text-switch');
const $sourceEntryInput = $('#source-entry-input');
const $sourceLanguageSelect = $('#source-language-select');
const $spacingText = $('#spacing-text');
const $targetEntryTextarea = $('#target-entry-textarea');
const $targetLanguageSelect = $('#target-language-select');
const $themeDropdown = $('#theme-dropdown');
const $toneSelect = $('#tone-select');
const $translateButton = $('#translate-button');
const $translateEntryButton = $('#translate-entry-button');
const $translateEntryButtons = $('.translate-entry-button');
const $translateTimer = $('#translate-timer');
const $translatorDropdown = $('#translator-dropdown');
const $upperCaseButtons = $('.upper-case-button');

const FONT_MAPPING = Object.entries({
  'Họ phông chữ hệ thống': '--system-font-family',
  Serif: 'serif',
  'Sans serif': 'sans-serif',
  'Kiểu chữ kiểu cũ': '--oldStyleTf',
  'Kiểu chữ hiện đại': '--modernTf',
  'Kiểu chữ Sans': '--sansTf',
  'Kiểu chữ nhân văn': '--humanistTf',
  'Kiểu chữ Monospace': '--monospaceTf',
  'Họ phông chữ Nhật Bản': '--japaneseFontFamily',
  'Serif Nhật Bản': '--serif-ja',
  'Sans serif Nhật Bản': '--sans-serif-ja',
  'Serif dọc Nhật Bản': '--serif-ja-v',
  'Sans serif dọc Nhật Bản': '--sans-serif-ja-v',
  'Họ phông chữ Trung Quốc': '--chineseFontFamily',
  'Họ phông chữ Đài Loan': '--taiwanFontFamily',
  'Họ phông chữ dự phòng của Amazon Kindle': '--amazon-kindle-fallback-font-family',
  'Họ phông chữ dự phòng của Apple Sách': '--apple-books-fallback-font-family',
  'Họ phông chữ dự phòng của Apple Sách tiếng Trung giản thể': '--apple-books-fallback-font-family-zh_CN',
  'Họ phông chữ dự phòng của Apple Sách tiếng Trung phồn thể cho Đài Loan': '---apple-books-fallback-font-family-zh_TW',
  'Họ phông chữ dự phòng của Apple Sách tiếng Nhật': '--apple-books-fallback-font-family-ja',
  'Họ phông chữ dự phòng của BOOK☆WALKER': '--bookwalker-fallback-font-family',
  'Họ phông chữ dự phòng của Calibre': '--calibre-fallback-font-family',
  'Họ phông chữ dự phòng của Google Play Sách': '--google-play-books-fallback-font-family',
  'Họ phông chữ dự phòng của Google Play Sách tiếng Trung giản thể': '--google-play-books-fallback-font-family-zh_CN',
  'Họ phông chữ dự phòng của Google Play Sách tiếng Trung phồn thể': '--google-play-books-fallback-font-family-zh_TW',
  'Họ phông chữ dự phòng của Google Play Sách tiếng Nhật': '--google-play-books-fallback-font-family-ja',
  'Họ phông chữ dự phòng của Rakuten Kobo': '--rakuten-kobo-fallback-font-family',
  'Họ phông chữ dự phòng của Rakuten Kobo tiếng Nhật': '--rakuten-kobo-fallback-font-family-ja',

  /* Các phông chữ của Waka */
  Bookerly: 'bookerly',
  'Minion Pro': 'minionPro',
  'Noto Serif': 'Noto Serif',
  Roboto: 'roboto',
  'SVN-Times New Roman': 'svnTimesNewRoman',
  Quicksand: 'Quicksand',
  'iCiel Domaine Text': 'icielDomaineText',
  'P22 Typewriter': 'p22Typewriter',
  'SVN-Helvetica Neue': 'svnHelveticaNeue',
  'Trixi Pro': 'trixiPro',

  /* Các phông chữ của Google Play Sách */
  Helvetica: 'helvetica',
  Verdana: 'Verdana',
  Literata: 'Literata',
  Baskerville: 'baskerville',
  Cochin: 'cochin',
  Palatino: 'palatino',
  Times: 'times',

  /* Các phông chữ của Rakuten Kobo */
  Avenir: 'avenir',
  Georgia: 'Georgia',
  OpenDyslexic: 'opendyslexic',
  Optima: 'optima',
  'Trebuchet MS': 'Trebuchet MS',

  /* Các phông chữ của Apple Sách */
  // Athelas: 'athelas',
  // 'Avenir Next': 'avenirNext',
  'Canela Text': 'canelaText',
  Charter: 'charter',
  // 'Iowan Old Style': 'iowanOldStyle',
  'SF Pro Text': 'sfProText',
  'Proxima Nova': 'proximaNova',
  'Publico Text': 'publicoText',
  'New York': 'newYork',
  // Seravek: 'seravek',
  'Times New Roman': 'Times New Roman',

  'Apple SD Gothic Neo': 'appleSdGothicNeo',
  'A-OTF Ryumin Pr5': 'aotfRyuminPr5',
  'Crimson Text': 'Crimson Text',
  HiraginoMin: 'hiraginomin',
  'Hiragino Mincho Pro': 'hiraginoMinchoPro',
  'Hiragino Mincho ProN': 'hiraginoMinchoPron',
  'Hiragino Sans': 'hiraginoSans',
  Lora: 'Lora',
  'PingFang SC': 'pingfangSc',
  'PingFang TC': 'pingfangTc',
  STBShusong: 'stbshusong',
  'STSong TC': 'stsongTc',
  TBMincho: 'tbmincho',
  Thonburi: 'thonburi',
});

const GOOGLE_TRANSLATE_KEY = 'AIzaSyDj3f1TGsnamhL8U5tpvpWw4J27So0IGp8';

const UUID = crypto.randomUUID();

const glossary = {
  simplified: [],
  traditional: [],
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
    ['が', 'ga'],
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
  sinovietnameses: [],
  phonetics: { ...JSON.parse(localStorage.getItem('glossary') ?? JSON.stringify({ phonetics: {} })).phonetics },
  nomenclature: { ...JSON.parse(localStorage.getItem('glossary') ?? JSON.stringify({ nomenclature: {} })).nomenclature },
};

const translators = {};

let currentTranslator = null;
let translationController = null;
let entryTranslationController = null;
let autocompleteTimeout = null;
let isRetranslate = false;

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
    case Translators.COCCOC_EDU_TRANSLATE: {
      CoccocEduTranslate.LANGUAGE_LIST.forEach(({ label, value }) => {
        if (!['auto', 'en', 'vi', 'ja', 'zh-Hans', 'zh-Hant'].includes(value)) return;
        const option = document.createElement('option');
        option.innerText = label;
        option.value = value;
        sourceLanguageSelect.appendChild(option);
      });
      break;
    }
    case Translators.DEEPL_TRANSLATE: {
      [{ language: '', name: 'Detect language' }, ...DeeplTranslate.SOURCE_LANGUAGE_LIST].forEach(({ language, name }) => {
        if (!['', 'EN', 'JA', 'ZH'].includes(language)) return;
        const option = document.createElement('option');
        option.innerText = name;
        option.value = language;
        sourceLanguageSelect.appendChild(option);
      });
      break;
    }
    case Translators.GENERATIVE_AI: {
      [{ label: 'Tự động nhận diện', value: 'Auto-detect' }, ...GenerativeAi.LANGUAGE_LIST].forEach(({ label, value }) => {
        const option = document.createElement('option');
        option.innerText = label;
        option.value = value;
        sourceLanguageSelect.appendChild(option);
      });
      break;
    }
    case Translators.LINGVANEX: {
      [{ full_code: '', englishName: 'Auto-detect language', codeName: 'Ngôn ngữ tự động phát hiện' }, ...Lingvanex.LANGUAGE_LIST].forEach(({ full_code, englishName }) => {
        if (!['', 'zh-Hans_CN', 'zh-Hant_TW', 'en_US', 'ja_JP', 'vi_VN'].includes(full_code)) return;
        const option = document.createElement('option');
        option.innerText = englishName;
        option.value = full_code;
        sourceLanguageSelect.appendChild(option);
      });
      break;
    }
    case Translators.MICROSOFT_TRANSLATOR: {
      Object.entries({ 'auto-detect': { nativeName: 'Auto-detect', name: 'Tự phát hiện' }, ...MicrosoftTranslator.LANGUAGE_LIST }).forEach(([languageCode, { name }]) => {
        if (!['auto-detect', 'en', 'ja', 'zh-Hans', 'zh-Hant', 'vi'].includes(languageCode)) return;
        const option = document.createElement('option');
        option.innerText = name;
        option.value = languageCode;
        sourceLanguageSelect.appendChild(option);
      });
      break;
    }
    case Translators.PAPAGO: {
      Object.entries(Papago.SOURCE_LANGUAGE_LIST).forEach(([languageCode, name]) => {
        if (!['auto', 'en', 'ja', 'zh-CN', 'zh-TW', 'vi'].includes(languageCode)) return;
        const option = document.createElement('option');
        option.innerText = name;
        option.value = languageCode;
        sourceLanguageSelect.appendChild(option);
      });
      break;
    }
    case Translators.WEBNOVEL_TRANSLATE: {
      WebnovelTranslate.LANGUAGE_LIST.sourceLanguages.forEach(({ language, name }) => {
        if (!['auto', 'en', 'ja', 'zh-CN', 'vi'].includes(language)) return;
        const option = document.createElement('option');
        option.innerText = name;
        option.value = language;
        sourceLanguageSelect.appendChild(option);
      });
      break;
    }
    default: {
      [{ language: 'auto', name: 'Phát hiện ngôn ngữ' }, ...GoogleTranslate.LANGUAGE_LIST].forEach(({ language, name }) => {
        if (!['auto', 'en', 'ja', 'zh', 'zh-TW', 'vi'].includes(language)) return;
        const option = document.createElement('option');
        option.innerText = name;
        option.value = language;
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
    case Translators.COCCOC_EDU_TRANSLATE: {
      CoccocEduTranslate.LANGUAGE_LIST.forEach(({ label, value }) => {
        if (!['en', 'vi', 'ja', 'zh-Hans', 'zh-Hant'].includes(value)) return;
        const option = document.createElement('option');
        option.innerText = label;
        option.value = value;
        targetLanguageSelect.appendChild(option);
      });
      break;
    }
    case Translators.DEEPL_TRANSLATE: {
      DeeplTranslate.TARGET_LANGUAGE_LIST.forEach(({ language, name }) => {
        if (!['EN-GB', 'EN-US', 'JA', 'ZH', 'ZH-HANS'].includes(language)) return;
        const option = document.createElement('option');
        option.innerText = name;
        option.value = language;
        targetLanguageSelect.appendChild(option);
      });
      break;
    }
    case Translators.GENERATIVE_AI: {
      GenerativeAi.LANGUAGE_LIST.forEach(({ label, value }) => {
        const option = document.createElement('option');
        option.innerText = label;
        option.value = value;
        targetLanguageSelect.appendChild(option);
      });
      break;
    }
    case Translators.LINGVANEX: {
      Lingvanex.LANGUAGE_LIST.forEach(({ full_code, englishName }) => {
        if (!['zh-Hans_CN', 'zh-Hant_TW', 'en_US', 'ja_JP', 'vi_VN'].includes(full_code)) return;
        const option = document.createElement('option');
        option.innerText = englishName;
        option.value = full_code;
        targetLanguageSelect.appendChild(option);
      });
      break;
    }
    case Translators.MICROSOFT_TRANSLATOR: {
      Object.entries(MicrosoftTranslator.LANGUAGE_LIST).forEach(([languageCode, { name }]) => {
        if (!['en', 'ja', 'zh-Hans', 'zh-Hant', 'vi'].includes(languageCode)) return;
        const option = document.createElement('option');
        option.innerText = name;
        option.value = languageCode;
        targetLanguageSelect.appendChild(option);
      });
      break;
    }
    case Translators.PAPAGO: {
      Object.entries(Papago.TARGET_LANGUAGE_LIST).forEach(([languageCode, name]) => {
        if (!['auto', 'en', 'ja', 'zh-CN', 'zh-TW', 'vi'].includes(languageCode)) return;
        const option = document.createElement('option');
        option.innerText = name;
        option.value = languageCode;
        targetLanguageSelect.appendChild(option);
      });
      break;
    }
    case Translators.WEBNOVEL_TRANSLATE: {
      WebnovelTranslate.LANGUAGE_LIST.targetLanguages.forEach(({ language, name }) => {
        if (!['en', 'ja', 'zh-CN', 'zh-TW', 'vi'].includes(language)) return;
        const option = document.createElement('option');
        option.innerText = name;
        option.value = language;
        targetLanguageSelect.appendChild(option);
      });
      break;
    }
    default: {
      GoogleTranslate.LANGUAGE_LIST.forEach(({ language, name }) => {
        if (!['en', 'ja', 'zh', 'zh-TW', 'vi'].includes(language)) return;
        const option = document.createElement('option');
        option.innerText = name;
        option.value = language;
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

const buildResult = function buildResultContentForTextarea(text, result, activeTranslator) {
  const resultDiv = document.createElement('div');

  try {
    const resultLines = result.split('\n');
    const originalLines = text.split('\n');
    let lostLineFixedNumber = 0;

    for (let i = 0; i < originalLines.length; i += 1) {
      if (i + lostLineFixedNumber >= originalLines.length) break;
      const originalLine = originalLines[i + lostLineFixedNumber];
      const resultLine = resultLines[i] ?? '';

      if (originalLine.replace(/^\s+/, '').trimEnd().length === 0 && resultLine.replace(/^\s+/, '').trimEnd().length > 0) {
        lostLineFixedNumber += 1;
        i -= 1;
      } else if (activeTranslator === Translators.PAPAGO && resultLine.replace(/^\s+/, '').trimEnd().length === 0 && originalLine.replace(/^\s+/, '').trimEnd().length > 0) {
        lostLineFixedNumber -= 1;
      } else {
        const paragraph = document.createElement('p');
        const translation = document.createTextNode(resultLine);
        const lineBreak = document.createElement('br');

        if (originalLines[i + lostLineFixedNumber].replace(/^\s+/, '').trimEnd().length > 0) {
          if ($showOriginalTextSwitch.prop('checked')) {
            const idiomaticText = document.createElement('i');
            idiomaticText.innerText = originalLines[i + lostLineFixedNumber];
            paragraph.appendChild(idiomaticText);
            paragraph.innerHTML += resultLine.replace(/^\s+/, '').trimEnd().length > 0 ? lineBreak.cloneNode(true).outerHTML : '';
          }

          paragraph.appendChild(translation);
        } else {
          paragraph.appendChild(lineBreak.cloneNode(true));
        }

        resultDiv.appendChild(paragraph);
      }
    }
  } catch (error) {
    console.error('Lỗi hiển thị bản dịch:', error);
    const paragraph = document.createElement('p');
    paragraph.appendChild(document.createTextNode(error));
    resultDiv.insertBefore(paragraph, resultDiv.firstChild);
  }

  return resultDiv.innerHTML;
};

const translate = async function translateContentInTextarea(controller = new AbortController()) {
  const $activeTranslator = $translatorDropdown.find('.active');

  try {
    const startTime = Date.now();
    const model = $('#model-select').val();
    const text = $inputTextarea.val();
    const targetLanguage = $targetLanguageSelect.val();

    switch ($activeTranslator.val()) {
      case Translators.GENERATIVE_AI: {
        currentTranslator.controller = controller;
        await currentTranslator.translateText(text, targetLanguage, model, Object.entries(glossary.nomenclature));
        break;
      }
      default: {
        currentTranslator.controller = controller;
        await currentTranslator.translateText(text, targetLanguage, $sourceLanguageSelect.val());
      }
    }

    if (controller.signal.aborted) return;

    if (targetLanguage.startsWith('vi') && $polishSwitch.prop('checked')) {
      if (!isRetranslate) $resultTextarea.html(buildResult(text, currentTranslator.result, $activeTranslator.val()));
      const nomenclature = Object.entries(glossary.nomenclature).filter(([first]) => text.includes(first));
      const lines = text.split('\n');
      const query = lines.map((element) => element.replace(/^\s/, '')).join('\n');
      const rawTranslationLines = currentTranslator.result.split('\n');

      const INSTRUCTIONS = `Edit the following Vietnamese translation in the Rough Translation section. Refer to the following text in the Original Text section. ${nomenclature.length > 0 ? `Accurately map names of people, ethnic groups, species, or place-names, and other concepts listed in the Nomenclature Lookup Table to enhance the accuracy and consistency in your translations. ` : ''}Your translations must convey all the content in the original text ${/\n/.test(query) ? 'line by line ' : ''}and cannot involve explanations or other unnecessary information. Please ensure that the translated text is natural for native speakers with correct grammar and proper word choices. Your output must only contain the translated text without codeblock and cannot include explanations or other information.${nomenclature.length > 0 ? `

Nomenclature Lookup Table:
\`\`\`tsv
source\ttarget
${filteredNomenclature.map((element) => element.join('\t')).join('\n')}
\`\`\`` : ''}`;
      const MESSAGE = `Rough Translation:
\`\`\`txt
${rawTranslationLines.map((element) => element.replace(/^\s/, '')).join('\n')}
\`\`\`

Original Text:
\`\`\`txt
${query}
\`\`\``;

      let generativeAi = translators[Translators.GENERATIVE_AI];

      if (generativeAi == null) {
        generativeAi = new GenerativeAi(UUID.toLowerCase(), $openaiApiKeyText.val(), $geminiApiKeyText.val(), $anthropicApiKeyText.val());
        translators[Translators.GENERATIVE_AI] = generativeAi;
      }

      const isGemini = model.startsWith('gemini');
      const maybeIsClaude = async () => model.startsWith('claude') ? await generativeAi.runClaude(model, INSTRUCTIONS, MESSAGE) : await generativeAi.runOpenai(model, INSTRUCTIONS, MESSAGE);
      let polishResult = isGemini ? await generativeAi.runGemini(model, INSTRUCTIONS, MESSAGE) : await maybeIsClaude();

      if (controller.signal.aborted || polishResult == null) return;
      if (isGemini) polishResult = polishResult.replace(/\n$/, '');
      const lineSeperators = text.split(/(\n)/).filter((element) => element.includes('\n'));
      const lineSeparatorBooleans = polishResult.split(/(\n{1,2})/).filter((element) => element.includes('\n\n')).map((element, index) => element !== lineSeperators[index]);
      polishResult = polishResult.split(lineSeparatorBooleans.reduce((accumulator, currentValue) => accumulator + (currentValue ? 1 : -1), 0) > 0 ? '\n\n' : '\n');
      currentTranslator.result = lines.map((element, index) => (polishResult[index] != null ? (rawTranslationLines[index] ?? element).match(/^\s*/)[0].concat(polishResult[index].replace(/^\s+/, '')) : (rawTranslationLines[index] ?? element))).join('\n');
    }

    $resultTextarea.html(buildResult(text, currentTranslator.result, $activeTranslator.val()));
    if (controller.signal.aborted) return;
    $resultTextarea.find('p > i').on('dblclick', function onDblclick() {
      const range = document.createRange();
      const selection = getSelection();
      range.selectNodeContents(this);
      selection.removeAllRanges();
      selection.addRange(range);
      $glossaryManagerButton.trigger('mousedown');
      $glossaryManagerButton.click();
    });
    $translateTimer.text(Date.now() - startTime);
  } catch (error) {
    console.error(error);
    if (controller.signal.aborted) return;
    const paragraph = document.createElement('p');
    paragraph.innerText = `Bản dịch thất bại: ${error}`;
    $resultTextarea.html(null);
    $resultTextarea.append(paragraph);
  }
};

const reloadGlossary = function reloadActiveGlossary(glossaryList) {
  const glossaryKeys = Object.keys(glossary[glossaryList]);
  const glossaryStorage = { phonetics: glossary.phonetics, nomenclature: glossary.nomenclature };
  $glossaryEntryCounter.text(glossaryKeys.length);
  if (Object.keys(glossaryStorage).includes(glossaryList)) glossary[glossaryList] = Object.fromEntries(Object.entries(glossary[glossaryList]).sort((a, b) => a[1].localeCompare(b[1], 'vi', { ignorePunctuation: true }) || a[0].localeCompare(b[0], 'vi', { ignorePunctuation: true })));
  const autocompleteGlossarySource = glossaryKeys.map((element) => ({ value: element, label: `${element} → ${glossary[glossaryList][element]}` }));
  $sourceEntryInput.autocomplete({
    appendTo: '#glossary-modal .modal-body',
    source: (request, response) => {
      if (autocompleteTimeout != null) clearTimeout(autocompleteTimeout);
      autocompleteTimeout = setTimeout(() => {
        const matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term).replace(/(\s)+$/, '$1?'), 'i');
        response($.grep(autocompleteGlossarySource, (elementOfArray) => elementOfArray.label.split('=').some((element, index) => matcher.test(element) || matcher.test(element.normalize('NFKD').replaceAll(/\p{Mn}/gu, '').replaceAll('đ', 'd').replaceAll('Đ', 'D')))).slice(0, 50));
      }, 300);
    },
    focus: function onFocus(__, ui) {
      if ($(this).val() !== ui.item.value) $(this).trigger('input');
    },
    select: function onSelect(__, ui) {
      if ($(this).val() !== ui.item.value) $(this).val(ui.item.value).trigger('input');
    },
  });

  sessionStorage.setItem('glossary', Object.hasOwn(glossaryStorage, glossaryList) ? Object.entries(glossary[glossaryList]).map((element) => element.join('=')).join('\n') : '');
};

const saveGlossary = function saveGlossaryToLocalStorage() {
  const activeGlossaryList = $glossaryListSelect.val();
  reloadGlossary(activeGlossaryList);
  const glossaryStorage = { phonetics: glossary.phonetics, nomenclature: glossary.nomenclature };
  if (Object.keys(glossaryStorage).includes(activeGlossaryList)) glossary[activeGlossaryList] = Object.fromEntries(Object.entries(glossary[activeGlossaryList]).toSorted((a, b) => a[1].localeCompare(b[1], 'vi', { ignorePunctuation: true }) || a[0].localeCompare(b[0], 'vi', { ignorePunctuation: true })));
  localStorage.setItem('glossary', JSON.stringify(glossaryStorage));
};

const quickTranslate = function translateByMappingGlossary(text, translations) {
  if (translations == null || translations.length === 0) return text;

  const translationsMap = Object.fromEntries(translations.filter(function filter([first]) {
    return !this[first] && (this[first] = 1);
  }, {}));

  const characters = text.split(/(?:)/u);
  const charactersLength = characters.length;
  let startIndex = 0;
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

  if (translations.some(([__, second]) => !/\p{sc=Hani}/u.test(second))) {
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

    return translatedText.replaceAll(/(?:\.{3}|[…、。》」』】！），：；？～])(?![\p{Pc}\p{Pd}\p{Pe}\p{Pf}\p{Po}\s]|$)/gu, (match) => `${PUNCTUATIONS[match] ?? match} `).replaceAll(/([^\s\p{Ps}\p{Pi}])([《「『【（])/gu, (__, p1, p2) => `${p1} ${PUNCTUATIONS[p2] ?? p2}`).replaceAll(/[、。《》「」『』【】！（），：；？～]/g, (match) => PUNCTUATIONS[match] ?? match).replaceAll(/ ?· ?/g, ' ');
  } else {
    return translatedText;
  }
}

const quickTranslateEntry = function quickTranslateForSourceEntryInput(text, currentGlossary = {}) {
  const phonetics = Object.entries(glossary.phonetics).map(([first, second]) => [first, second.split('/')[0]]).map(([first, second]) => [first, second.split('|')[0]]).map(([first, second]) => [first, second.split(/; */)[0]]);
  const sinovietnameses = glossary.sinovietnameses.map(([first,second]) => [first, second.split(',').map((element) => element.trimStart()).filter((element) => element.length > 0)[0]]);
  let hanViet = phonetics.filter(([__, second]) => !/\p{Script_Extensions=Hani}/u.test(second)).concat(sinovietnameses);
  hanViet = phonetics.filter(([__, second]) => /\p{Script_Extensions=Hani}/u.test(second)).map(([first, second]) => [first, quickTranslate(second, hanViet)]).concat(hanViet).map(([first, second]) => [first, second.toLowerCase()]);
  return quickTranslate(text, Object.entries(currentGlossary).concat(hanViet, glossary.romajis).filter(function filter([first]) {
    return !this[first] && (this[first] = 1);
  }, {}));
};

$(document).ready(async () => {
  if (Utils.isOnMobile()) {
    const $textareas = $('.textarea');
    $textareas.css('max-height', `${$(window).height() - (5.6875 * 16) - 15}px`);
  }

  $resultTextarea.attr('contenteditable', !Utils.isOnMobile());
  const autocompleteFontStackTextSource = FONT_MAPPING.map(([first, second]) => ({ value: second, label: first }));
  $fontStackText.autocomplete({
    appendTo: '#settings-modal .modal-body',
    source: (request, response) => {
      const matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term.split(/, */).pop()).replace(/(\s)+$/, '$1?'), 'i');
      response($.grep(autocompleteFontStackTextSource, (elementOfArray) => matcher.test(elementOfArray.label) || matcher.test(elementOfArray.value)));
    },
    focus: () => false,
    select: function onSelect(__, ui) {
      const terms = $(this).val().split(/, */);
      terms.pop();
      terms.push(ui.item.value);
      terms.push('');
      $(this).val(terms.join(', '));
      return false;
    },
  });

  axios.get('/static/datasource/Unihan_Variants.txt').then(({ data }) => {
    const array = data.split('\n').filter((element) => element.length > 0 && !element.startsWith('#')).map((element) => element.split('\t'));

    glossary.traditional = array.filter((element) => element.length === 3 && element[1] === 'kTraditionalVariant').map(([first, __, third]) => [String.fromCodePoint(parseInt(first.substring(2), 16)), third.split(' ').map((element) => element.startsWith('U+') ? String.fromCodePoint(parseInt(element.substring(2), 16)) : element).join(' ')]);
    console.log(`Đã tải xong bộ dữ liệu phồn thể (${glossary.traditional.length})!`);

    glossary.simplified = array.filter((element) => element.length === 3 && element[1] === 'kSimplifiedVariant').map(([first, __, third]) => [String.fromCodePoint(parseInt(first.substring(2), 16)), third.split(' ').map((element) => element.startsWith('U+') ? String.fromCodePoint(parseInt(element.substring(2), 16)) : element).join(' ')]);
    console.log(`Đã tải xong bộ dữ liệu giản thể (${glossary.simplified.length})!`);
  }).catch((error) => {
    console.error('Không thể tải bộ dữ liệu giản thể-phồn thể:', error);
    setTimeout(() => {
      location.reload();
    }, 5000);
  });

  glossary.sinovietnameses = cjkv.nam.map(([first, second]) => [first, Standardize.vosOaoeuy(Standardize.vosYToI(second.normalize()))]);
  console.log(`Đã tải xong bộ dữ liệu Hán-Việt (${glossary.sinovietnameses.length})!`);

  $translatorDropdown.find('.active').click();
  if (localStorage.getItem('DEEPL_AUTH_KEY') != null) $deeplAuthKeyText.val(localStorage.getItem('DEEPL_AUTH_KEY')).change();
  if (localStorage.getItem('OPENAI_API_KEY') != null) $openaiApiKeyText.val(localStorage.getItem('OPENAI_API_KEY')).change();
  if (localStorage.getItem('ANTHROPIC_API_KEY') != null) $anthropicApiKeyText.val(localStorage.getItem('ANTHROPIC_API_KEY')).change();
  if (localStorage.getItem('GEMINI_API_KEY') != null) $geminiApiKeyText.val(localStorage.getItem('GEMINI_API_KEY')).change();
  reloadGlossary($glossaryListSelect.val());
  $inputTextarea.trigger('input');
});

$(window).on('resize', () => {
  if (Utils.isOnMobile()) {
    const $textareas = $('.textarea');
    $textareas.css('max-height', `${$(window).height() - (5.6875 * 16) - 15}px`);
  }
});

$(window).on('keydown', (event) => {
  if (event.ctrlKey && event.key === 'r') event.preventDefault();
});

$(window).on('unload', () => {
  sessionStorage.removeItem('glossary');
  Object.keys(localStorage).filter((element) => element.includes('eruda') || element.startsWith('vConsole')).forEach((element) => {
    localStorage.removeItem(element);
  });
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
      if ($(this).text() === 'Huỷ') {
        translationController.abort();
        isRetranslate = false;
      }

      $resultTextarea.html(null);
      $translateTimer.text(0);
      $resultTextarea.hide();
      $inputTextarea.show();
      $copyButton.data('target', `#${$inputTextarea.attr('id')}`);
      $copyButton.removeClass('disabled');
      $pasteButton.removeClass('disabled');
      $translatorDropdown.find('.dropdown-item').removeClass('disabled');
      $(this).text('Dịch');
      $retranslateButton.addClass('disabled');
      break;
    }
    default: {
      if ($inputTextarea.val().length === 0) break;
      if ($resultTextarea.text().length === 0) $resultTextarea.text('Đang dịch...');
      $inputTextarea.hide();
      $resultTextarea.show();
      $copyButton.addClass('disabled');
      $copyButton.data('target', `#${$resultTextarea.attr('id')}`);
      $pasteButton.addClass('disabled');
      $translatorDropdown.find('.dropdown-item').addClass('disabled');
      translationController = new AbortController();
      $(this).text('Huỷ');
      translate(translationController).finally(() => {
        if (translationController.signal.aborted) {
          translationController = null;
          isRetranslate = false;
          return;
        }

        translationController = null;
        isRetranslate = false;
        $(this).text('Sửa');
        $copyButton.removeClass('disabled');
        $pasteButton.removeClass('disabled');
        $retranslateButton.removeClass('disabled');
        $translatorDropdown.find('.dropdown-item').removeClass('disabled');
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
      if ($translateButton.text() === 'Sửa') $translateButton.text('Dịch').click();
    } else {
      $targetTextInput.val(clipText).trigger('input');
    }
  });
});

$retranslateButton.on('click', () => {
  if ($translateButton.text() !== 'Sửa') return;
  isRetranslate = true;
  $translateButton.text('Dịch').click();
});

$glossaryManagerButton.on('mousedown', () => {
  if ($resultTextarea.is(':visible')) $sourceEntryInput.val((getSelection().toString() || '').replaceAll(/\n/g, ' '));
  if (getSelection != null) window.getSelection().removeAllRanges();
});

$inputTextarea.on('input', function onInput() {
  $('#input-textarea-counter').text($(this).val().replaceAll('\n', $translatorDropdown.find('.active').val() === Translators.GOOGLE_TRANSLATE ? '\r\n' : '\n').length);
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

$resultTextarea.on('keydown', function onKeydown(event) {
  const allowKey = [
    'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'PrintScreen', 'ScrollLock', 'Pause', 'Cancel',
    'Insert', 'Home', 'PageUp', 'NumLock',
    'Tab', 'Enter', 'End', 'PageDown',
    'CapsLock',
    'Shift',
    'Control', 'Meta', 'Alt', 'ContextMenu', 'ArrowLeft', 'ArrowRight',
  ];

  if (event.ctrlKey || allowKey.some((element) => event.key === element)) {
    if (event.ctrlKey && event.key === 'r') $retranslateButton.click();
    return;
  }

  event.preventDefault();

  const scrollAmount = 63;
  const scrollSpeed = 150;

  if (event.key === 'ArrowDown') {
    $(this).stop(false, true).animate({
      scrollTop: `+=${scrollAmount}`,
    }, scrollSpeed);
  } else if (event.key === 'ArrowUp') {
    $(this).stop(false, true).animate({
      scrollTop: `-=${scrollAmount}`,
    }, scrollSpeed);
  }
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

$('.modal').on('blur', () => {
  $(document.body).focus();
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
    $(this).parent().parent().find('.collapse.show').each((__, value) => {
      (new bootstrap.Collapse(value)).hide();
    });
  } else {
    $dropdownHasCollapse.find('.dropdown-menu').each((__, value) => {
      if (!$(value).hasClass('show')) return;
      const bootstrapDropdownHasCollapse = new bootstrap.Dropdown(value);
      bootstrapDropdownHasCollapse.hide();
    });
  }
});

$dropdownHasCollapse.on('hide.bs.dropdown', function onHideBsDropdown() {
  $(this).find('.dropdown-menu').find('.collapse.show').each((__, value) => {
    (new bootstrap.Collapse(value)).hide();
  });
});

$fontStackText.change(function onChange() {
  const values = $(this).val().replaceAll(/['"]/g, '').split(/, */).filter((element) => element.length > 0).map((element) => FONT_MAPPING.some(([first, second]) => first.toLowerCase().startsWith(element.toLowerCase().trim()) || second.toLowerCase().startsWith(element.toLowerCase().trim())) ? FONT_MAPPING.find(([first, second]) => first.toLowerCase().startsWith(element.toLowerCase().trim()) || second.toLowerCase().startsWith(element.toLowerCase().trim()))[1] : element.trim());
  $(this).val(values.join(', '));

  $(document.documentElement).css('--opt-font-family', values.map((element) => {
    const maybeFontStacks = element.startsWith('--') ? `var(${element})` : element;
    return element.includes(' ') ? `'${element}'` : maybeFontStacks;
  }).join(', '));
});

$fontStackText.on('blur', function onBlur() {
  $(this).change();
});

$fontSizeText.change(function onChange() {
  $(this).val(Math.min(parseFloat($(this).attr('max')), Math.max(parseFloat($(this).attr('min')), parseFloat($(this).val()))));
  $(document.documentElement).css('--opt-font-size', `${$(this).val()}em`);
});

$themeDropdown.find('.dropdown-item').on('click', function onClick() {
  const $prevTheme = $themeDropdown.find('.active');
  const prevFontStack = $prevTheme.data('font-family').replaceAll(/['"]/g, '').split(/, */).filter((element) => element.length > 0).map((element) => FONT_MAPPING[element.trim()] ?? element.trim()).join(', ');

  $(document.body).removeClass($prevTheme.val());
  $themeDropdown.find('.dropdown-item').removeClass('active');
  $(this).addClass('active');

  const fontStack = $(this).data('font-family');
  const fontSize = $(this).data('font-size');
  const spacing = $(this).data('line-height');
  const alignment = $(this).data('text-align');
  const fontWeight = $(this).data('font-weight');

  if ($fontStackText.val().length === 0 || (new RegExp(`^${Utils.escapeRegExp($fontStackText.val())}(?:, |$)`)).test(prevFontStack)) $fontStackText.val(fontStack ?? '').change();
  if (fontSize != null) $fontSizeText.val(fontSize).change();
  $(document.body).addClass($(this).val());
  if (alignment != null && alignment.length > 0) $alignmentRadio.prop('checked', false).filter(`#${['com-amazon-kindle-', 'apple-books-quiet-', 'apple-books-focus-', 'bookwalker-'].some((element) => $(this).val().includes(element)) ? 'justify' : 'start'}-alignment-radio`).prop('checked', true).change();
  if (spacing != null) $spacingText.val(spacing).change();
  if (fontWeight != null) $boldTextSwitch.prop('checked', fontWeight === 'bold').change();
});

$spacingText.change(function onChange() {
  $(this).val(Math.min(parseFloat($(this).attr('max')), Math.max(parseFloat($(this).attr('min')), parseFloat($(this).val()))));
  $(document.documentElement).css('--opt-line-height', `${$(this).val()}em`);
});

$alignmentRadio.change(function onChange() {
  $(document.documentElement).css('--opt-text-align', $(this).val());
});

$boldTextSwitch.change(function onChange() {
  $(document.documentElement).css('--opt-font-weight', $(this).prop('checked') ? 'bold' : ($themeDropdown.find('.active').data('font-weight') ?? 'normal'));
});

$translatorDropdown.find('.dropdown-item').click(async function onClick() {
  $translatorDropdown.find('.dropdown-item').removeClass('active');
  $(this).addClass('active');
  const activeTranslator = $(this).val();
  currentTranslator = translators[activeTranslator];
  $('#polish-switch').removeClass('disabled');

  switch (activeTranslator) {
    case Translators.BAIDU_TRANSLATE: {
      if (currentTranslator == null) {
        currentTranslator = new BaiduTranslate();
        translators[activeTranslator] = currentTranslator;
      }

      break;
    }
    case Translators.COCCOC_EDU_TRANSLATE: {
      if (currentTranslator == null) {
        currentTranslator = new CoccocEduTranslate();
        translators[activeTranslator] = currentTranslator;
      }

      break;
    }
    case Translators.DEEPL_TRANSLATE: {
      if (currentTranslator == null) {
        currentTranslator = new DeeplTranslate($deeplAuthKeyText.val());
        translators[activeTranslator] = currentTranslator;
      }

      break;
    }
    case Translators.GENERATIVE_AI: {
      if (currentTranslator == null) {
        currentTranslator = new GenerativeAi(UUID.toLowerCase(), $openaiApiKeyText.val(), $geminiApiKeyText.val(), $anthropicApiKeyText.val());
        translators[activeTranslator] = currentTranslator;
      }

      break;
    }
    case Translators.LINGVANEX: {
      if (currentTranslator == null) {
        currentTranslator = new Lingvanex();
        translators[activeTranslator] = currentTranslator;
      }

      break;
    }
    case Translators.MICROSOFT_TRANSLATOR: {
      if (currentTranslator == null) {
        currentTranslator = new MicrosoftTranslator($toneSelect.val());
        translators[activeTranslator] = currentTranslator;
      }

      break;
    }
    case Translators.PAPAGO: {
      if (currentTranslator == null) {
        currentTranslator = new Papago(UUID);
        translators[activeTranslator] = currentTranslator;
      }

      break;
    }
    case Translators.WEBNOVEL_TRANSLATE: {
      if (currentTranslator == null) {
        currentTranslator = new WebnovelTranslate();
        translators[activeTranslator] = currentTranslator;
      }

      if ($('#polish-switch').prop('checked')) $('#polish-switch').prop('checked', false);
      $('#polish-switch').addClass('disabled');
      break;
    }
    default: {
      if (currentTranslator == null) {
        currentTranslator = new GoogleTranslate(GOOGLE_TRANSLATE_KEY);
        translators[activeTranslator] = currentTranslator;
      }

      break;
    }
  }

  loadLangSelectOptions(activeTranslator);
});

$deeplAuthKeyText.change(function onChange() {
  const $activeTranslator = $translatorDropdown.find('.active');
  translators[Translators.DEEPL_TRANSLATE] = null;
  if ($activeTranslator.val() === Translators.DEEPL_TRANSLATE) $activeTranslator.click();
  if (localStorage.getItem('DEEPL_AUTH_KEY') != null && $(this).val().length === 0) localStorage.removeItem('DEEPL_AUTH_KEY');
  else if (localStorage.getItem('DEEPL_AUTH_KEY') !== $(this).val()) localStorage.setItem('DEEPL_AUTH_KEY', $(this).val());
});

$toneSelect.on('change', () => {
  const $activeTranslator = $translatorDropdown.find('.active');
  if (translators[Translators.MICROSOFT_TRANSLATOR] == null) return;
  translators[Translators.MICROSOFT_TRANSLATOR].setToneAndFetchData($toneSelect.val());
  if ($activeTranslator.val() === Translators.MICROSOFT_TRANSLATOR) $activeTranslator.click();
});

$openaiApiKeyText.change(function onChange() {
  const $activeTranslator = $translatorDropdown.find('.active');
  translators[Translators.GENERATIVE_AI] = null;
  if ($activeTranslator.val() === Translators.GENERATIVE_AI) $activeTranslator.click();
  if (localStorage.getItem('OPENAI_API_KEY') != null && $(this).val().length === 0) localStorage.removeItem('OPENAI_API_KEY');
  else if (($(this).val().startsWith('sk-proj-') || $(this).val().startsWith('sk-svcacct-')) && localStorage.getItem('OPENAI_API_KEY') !== $(this).val()) localStorage.setItem('OPENAI_API_KEY', $(this).val());
});

$anthropicApiKeyText.change(function onChange() {
  const $activeTranslator = $translatorDropdown.find('.active');
  translators[Translators.GENERATIVE_AI] = null;
  if ($activeTranslator.val() === Translators.GENERATIVE_AI) $activeTranslator.click();
  if (localStorage.getItem('ANTHROPIC_API_KEY') != null && $(this).val().length === 0) localStorage.removeItem('ANTHROPIC_API_KEY');
  else if ($(this).val().startsWith('sk-ant-api03-') && localStorage.getItem('ANTHROPIC_API_KEY') !== $(this).val()) localStorage.setItem('ANTHROPIC_API_KEY', $(this).val());
});

$geminiApiKeyText.change(function onChange() {
  const $activeTranslator = $translatorDropdown.find('.active');
  translators[Translators.GENERATIVE_AI] = null;
  if ($activeTranslator.val() === Translators.GENERATIVE_AI) $activeTranslator.click();
  if (localStorage.getItem('GEMINI_API_KEY') != null && $(this).val().length === 0) localStorage.removeItem('GEMINI_API_KEY');
  else if ($(this).val().startsWith('AIzaSyD') && localStorage.getItem('GEMINI_API_KEY') !== $(this).val()) localStorage.setItem('GEMINI_API_KEY', $(this).val());
});

$glossaryModal.on('shown.bs.modal', () => {
  const text = $sourceEntryInput.val();

  if (text.length > 0) {
    if ($sourceEntryInput.autocomplete('option', 'disabled')) $sourceEntryInput.autocomplete('disable');
    const activeGlossaryList = $glossaryListSelect.val();
    const currentGlossary = glossary[activeGlossaryList];

    if (Object.hasOwn(currentGlossary, text)) {
      $targetEntryTextarea.val(currentGlossary[text]);
      $removeButton.removeClass('disabled');
    } else {
      $targetEntryTextarea.val(quickTranslateEntry(text, activeGlossaryList !== 'phonetics' ? currentGlossary : {}));
      $removeButton.addClass('disabled');
    }

    $addButton.removeClass('disabled');
  }

  $sourceEntryInput.autocomplete('enable');
});

$glossaryModal.on('hide.bs.modal', () => {
  $sourceEntryInput.autocomplete('disable');
  if (entryTranslationController != null) entryTranslationController.abort();
  $sourceEntryInput.val(null).trigger('input');
  $addButton.addClass('disabled');
  $removeButton.addClass('disabled');
});

$glossaryInput.on('change', function onChange() {
  const reader = new FileReader();

  reader.onload = function onLoad() {
    glossary[$glossaryListSelect.val()] = Object.fromEntries(this.result.split(/\r?\n|\r/).filter((element) => element.length > 0 && ($glossaryListSelect.val() !== 'luatNhan' || !element.startsWith('#')) && element.split('=').length === 2).map((element) => element.split('=')));
    saveGlossary();
    $sourceEntryInput.trigger('input');
    $glossaryInput.val(null);
  };

  reader.readAsText($(this).prop('files')[0]);
});

$('#clear-glossary-button').on('click', () => {
  if (!confirm('Bạn có muốn xoá sạch bảng thuật ngữ chứ?')) return;
  const activeGlossaryList = $glossaryListSelect.val();
  glossary[activeGlossaryList] = {};
  saveGlossary();
  $sourceEntryInput.trigger('input');
});

$glossaryListSelect.change(function onChange() {
  const activeGlossaryList = $(this).val();
  const text = $sourceEntryInput.val();
  reloadGlossary(activeGlossaryList);

  if (text.length > 0) {
    const currentGlossary = glossary[activeGlossaryList];

    if (Object.hasOwn(currentGlossary, text)) {
      $targetEntryTextarea.val(currentGlossary[text]);
      $removeButton.removeClass('disabled');
    } else {
      if (confirm('Bạn có muốn chuyển đổi lại chứ?')) {
        $targetEntryTextarea.val(quickTranslateEntry(text, activeGlossaryList !== 'phonetics' ? currentGlossary : {}));
      }

      $removeButton.addClass('disabled');
    }

    $addButton.removeClass('disabled');
  }
});

$sourceEntryInput.on('input', async function onInput() {
  const text = $(this).val();

  if (text.length > 0) {
    const activeGlossaryList = $glossaryListSelect.val();
    const currentGlossary = glossary[activeGlossaryList];

    if (Object.hasOwn(currentGlossary, text)) {
      $targetEntryTextarea.val(currentGlossary[text]);
      $removeButton.removeClass('disabled');
    } else {
      $targetEntryTextarea.val(quickTranslateEntry(text, activeGlossaryList !== 'phonetics' ? currentGlossary : {}));
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
  if (event.key !== 'Enter') return;
  $targetEntryTextarea.focus();
  event.preventDefault();
});

$sourceEntryInput.on('blur', () => {
  if (autocompleteTimeout != null) clearTimeout(autocompleteTimeout);
});

$('.define-button').on('click', function onClick() {
  if ($sourceEntryInput.val().length > 0) {
    let defineContent = ($sourceEntryInput.val().substring($sourceEntryInput.prop('selectionStart'), $sourceEntryInput.prop('selectionEnd')) || $sourceEntryInput.val()).trim(); // .substring(0, 30)
    let href = $(this).data('href');

    switch ($(this).data('type') ?? 'encodeURIComponent') {
      case 'char': {
        href = href.replace('%s', defineContent.split(/(?:)/u)[0]);
        break;
      }
      case 'congdongviet': {
        [defineContent] = defineContent.split(/(?:)/u);
        href = href.replace('%d', defineContent.codePointAt(0)).replace('%s', encodeURIComponent(defineContent));
        break;
      }
      default: {
        href = href.replace('%s', encodeURIComponent(defineContent));
        break;
      }
    }

    open(href, '_blank', 'width=1000,height=577');
  }

  if (getSelection != null) getSelection().removeAllRanges();
  else if (document.selection != null) document.selection.empty();
  $sourceEntryInput.blur();
});

$('.translate-webpage-button').on('click', function onClick() {
  if ($sourceEntryInput.val().length > 0) open($(this).data('href').replace('%s', encodeURIComponent($sourceEntryInput.val().trimEnd())), '_blank', 'width=1000,height=577');
  if (getSelection != null) getSelection().removeAllRanges();
  else if (document.selection != null) document.selection.empty();
  $sourceEntryInput.blur();
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

$upperCaseButtons.click(function onClick() {
  if ($targetEntryTextarea.val().length === 0) return;
  let text = $targetEntryTextarea.val().toLowerCase();

  if ($(this).data('amount') !== '#') {
    for (let i = 0; i < $(this).data('amount'); i += 1) {
      text = text.replace(/(^|\s|\p{P})(\p{Ll})/u, (__, p1, p2) => p1 + p2.toUpperCase());
    }
  } else {
    text = text.replaceAll(/(^|\s|\p{P})(\p{Ll})/gu, (__, p1, p2) => p1 + p2.toUpperCase());
  }

  $targetEntryTextarea.val(text);
});

$translateEntryButtons.click(async function onClick() {
  const text = $sourceEntryInput.val();

  if ($translateButton.text() !== 'Huỷ' && text.length > 0) {
    entryTranslationController = new AbortController();
    $translateEntryButton.addClass('disabled');
    $translateEntryButtons.addClass('disabled');
    $sourceEntryInput.attr('readonly', true);
    const activeTranslator = $(this).data('translator');
    const targetLanguage = $(this).data('lang');
    let translator = translators[activeTranslator];

    try {
      switch (activeTranslator) {
        case Translators.BAIDU_TRANSLATE: {
          if (translator == null) {
            translator = new BaiduTranslate();
            translators[activeTranslator] = translator;
          }

          break;
        }
        case Translators.COCCOC_EDU_TRANSLATE: {
          if (translator == null) {
            translator = new CoccocEduTranslate();
            translators[activeTranslator] = translator;
          }

          break;
        }
        case Translators.DEEPL_TRANSLATE: {
          if (translator == null) {
            translator = new DeeplTranslate($deeplAuthKeyText.val());
            translators[activeTranslator] = translator;
          }

          break;
        }
        case Translators.GENERATIVE_AI: {
          if (translator == null) {
            translator = new GenerativeAi(UUID.toLowerCase(), $openaiApiKeyText.val(), $geminiApiKeyText.val(), $anthropicApiKeyText.val());
            translators[activeTranslator] = translator;
          }

          break;
        }
        case Translators.GOOGLE_TRANSLATE: {
          if (translator == null) {
            translator = new GoogleTranslate(GOOGLE_TRANSLATE_KEY);
            translators[activeTranslator] = translator;
          }

          break;
        }
        case Translators.LINGVANEX: {
          if (translator == null) {
            translator = new Lingvanex();
            translators[activeTranslator] = translator;
          }

          break;
        }
        case Translators.MICROSOFT_TRANSLATOR: {
          if (translator == null) {
            translator = new MicrosoftTranslator($toneSelect.val());
            translators[activeTranslator] = translator;
          }

          break;
        }
        case Translators.PAPAGO: {
          if (translator == null) {
            translator = new Papago(UUID);
            translators[activeTranslator] = translator;
          }

          break;
        }
        case Translators.WEBNOVEL_TRANSLATE: {
          if (translator == null) {
            translator = new WebnovelTranslate();
            translators[activeTranslator] = translator;
          }

          break;
        }
      }

      if (translator != null) {
        switch (activeTranslator) {
          case Translators.GENERATIVE_AI: {
            translator.controller = entryTranslationController;
            await translator.translateText(text, targetLanguage, $('#translate-entry-model-select').val());
            break;
          }
          default: {
            translator.controller = entryTranslationController;
            await translator.translateText(text, targetLanguage);
            break;
          }
        }
      }

      if (translator == null || !translator.controller.signal.aborted) {
        if (translator == null) {
          let glossaryMap = {};

          if (targetLanguage === 'phonetics') {
            const phonetics = Object.entries(glossary.phonetics).map(([first, second]) => [first, second.split('/')[0]]).map(([first, second]) => [first, second.split('|')[0]]).map(([first, second]) => [first, second.split(/; */)[0]]);
            const sinovietnameses = glossary.sinovietnameses.map(([first,second]) => [first, second.split(',').map((element) => element.trimStart()).filter((element) => element.length > 0)[0]]);
            glossaryMap = phonetics.filter(([__, second]) => !/\p{Script_Extensions=Hani}/u.test(second)).concat(sinovietnameses);
            glossaryMap = phonetics.filter(([__, second]) => /\p{Script_Extensions=Hani}/u.test(second)).map(([first, second]) => [first, quickTranslate(second, glossaryMap)]).concat(glossaryMap).map(([first, second]) => [first, second.toLowerCase()]);
          } else {
            glossaryMap = glossary[targetLanguage];
          }

          $targetEntryTextarea.val(quickTranslate(text, glossaryMap.concat(glossary.romajis).filter(function filter([first]) {
            return !this[first] && (this[first] = 1);
          }, {})));
        } else {
          $targetEntryTextarea.val(translator.result).trigger('input');
        }
      }
    } catch (error) {
      $targetEntryTextarea.val(error);
      console.error(error);
    }

    entryTranslationController = null;

    if (activeTranslator != null) {
      $translateEntryButton.data('translator', activeTranslator);
      $translateEntryButton.data('lang', targetLanguage);
    }

    $sourceEntryInput.removeAttr('readonly');
    $translateEntryButtons.removeClass('disabled');
    $translateEntryButton.removeClass('disabled');
  }
});

$addButton.click(() => {
  const key = $sourceEntryInput.val();
  if (key.trim().length === 0) return;
  if ($glossaryListSelect.val() === 'namePhu' && Object.hasOwn(glossary.name, key)) delete glossary.name[key];
  glossary[$glossaryListSelect.val()][key] = $targetEntryTextarea.val().trim();
  saveGlossary();
  $addButton.addClass('disabled');
  $removeButton.addClass('disabled');
  $sourceEntryInput.val(null).trigger('input');
});

$removeButton.on('click', () => {
  if (!Object.hasOwn(glossary[$glossaryListSelect.val()], $sourceEntryInput.val()) || !confirm('Bạn có muốn xoá cụm từ này chứ?')) return;
  delete glossary[$glossaryListSelect.val()][$sourceEntryInput.val()];
  saveGlossary();
  $sourceEntryInput.trigger('input');
  $removeButton.addClass('disabled');
});

$translateEntryButton.on('click', function onClick() {
  if ($(this).data('translator') != null) $translateEntryButtons.filter(`[data-translator="${$(this).data('translator')}"][data-lang="${$(this).data('lang')}"]`).click();
});
