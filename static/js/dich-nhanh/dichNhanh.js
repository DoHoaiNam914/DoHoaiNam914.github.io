'use strict';

/* global bootstrap, BaiduTranslate, cjkv, CocCocEduTranslate, DeepLTranslate, GoogleGemini, GoogleTranslate, Lingvanex, MicrosoftTranslator, newAccentObject, Papago, Utils, Vietphrase, WebnovelTranslate */

const $addButton = $('#add-button');
const $addDeLeZhaoSwitch = $('#add-de-le-zhao-switch');
const $alignmentRadio = $('input[type="radio"][name="alignment-radio"]');
const $artificialIntelligenceSelect = $('#artificial-intelligence-select');
const $boldTextSwitch = $('#bold-text-switch');
const $copyButtons = $('.copy-button');
const $defaultVietPhraseFileSelect = $('#default-viet-phrase-file-select');
const $dropdownHasCollapse = $('.dropdown-has-collapse');
const $fontStackText = $('#font-stack-text');
const $fontSizeText = $('#font-size-text');
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

const FONT_MAPPING = {
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
  'Apple SD Gothic Neo': 'appleSDGothicNeo',
  'A-OTF Ryumin Pr5': 'aOTFRyuminPr5',
  Bookerly: 'bookerly',
  'Canela Text': 'canelaText',
  Charter: 'charter',
  'Crimson Text': 'crimsonText',
  HiraginoMin: 'hiraginoMin',
  'Hiragino Mincho Pro': 'hiraginoMinchoPro',
  'Hiragino Mincho ProN': 'hiraginoMinchoProN',
  'Hiragino Sans': 'hiraginoSans',
  Literata: 'literata',
  'New York': 'newYork',
  'Noto Serif': 'notoSerif',
  'PingFang SC': 'pingFangSC',
  'PingFang TC': 'pingFangTC',
  'Proxima Nova': 'proximaNova',
  'Publico Text': 'publicoText',
  Roboto: 'roboto',
  'SF Pro Text': 'sfProText',
  STBShusong: 'stbShusong',
  STSongTC: 'stSongTC',
  TBMincho: 'tbMincho',
  Thonburi: 'thonburi',
  /* Các phông chữ của Waka */
  'Minion Pro': 'minionPro',
  'SVN-Times New Roman': 'svnTimesNewRoman',
  Quicksand: 'quicksand',
  'iCiel Domaine Text': 'iCielDomaineText',
  'P22 Typewriter': 'p22Typewriter',
  'SVN-Helvetica Neue': 'svnHelveticaNeue',
  'Trixi Pro': 'trixiPro',
  /* Các phông chữ của Google Play Sách */
  Helvetica: 'helvetica',
  Verdana: 'Verdana',
  Baskerville: 'baskerville',
  Cochin: 'cochin',
  Palatino: 'palatino',
  Times: 'times',
  /* Các phông chữ của Rakuten Kobo */
  Avenir: 'avenir',
  OpenDyslexic: 'openDyslexic',
  Optima: 'optima',
  'Trebuchet MS': 'Trebuchet MS',
};

const Translators = {
  BAIDU_TRANSLATE: 'baiduTranslate',
  COCCOC_EDU_TRANSLATE: 'coccocEduTranslate',
  DEEPL_TRANSLATE: 'deeplTranslate',
  GOOGLE_GEMINI: 'googleGemini',
  GOOGLE_TRANSLATE: 'googleTranslate',
  LINGVANEX: 'lingvanex',
  MICROSOFT_TRANSLATOR: 'microsoftTranslator',
  PAPAGO: 'papago',
  VIETPHRASE: 'vietphrase',
  WEBNOVEL_TRANSLATE: 'webnovelTranslate',
};

const DEEPL_AUTH_KEY_LIST = [
  ['0c9649a5-e8f6-632a-9c42-a9eee160c330:fx', 168314],
  ['4670812e-ea92-88b1-8b82-0812f3f4009b:fx', 340202],
  ['47c6c989-9eaa-5b30-4ee6-b2e4f1ebd530:fx', 191240],
  ['9e00d743-da37-8466-8e8d-18940eeeaf88:fx', 78643],
  // ['a4b25ba2-b628-fa56-916e-b323b16502de:fx', 238323],
  // ['aa09f88d-ab75-3488-b8a3-18ad27a35870:fx', 500000],
  ['e5a36703-2001-1b8b-968c-a981fdca7036:fx', 38919],
  ['f114d13f-f882-aebe-2dee-0ef57f830218:fx', 499994],
  // ['f1414922-db81-5454-67bd-9608cdca44b3:fx', 154587],
  ['f8ff5708-f449-7a57-65b0-6ac4524cf64c:fx', 500000],
].toSorted((a, b) => a[1] - b[1]);

const GEMINI_API_KEY = 'AIzaSyD5e2NPw_Vmgr_eUXtNX4tGMYl0lmsQQW4';

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
  KunYomis: [],
  OnYomis: [],
  SinoVietnameses: [],
  phonetics: { ...JSON.parse(localStorage.getItem('glossary') ?? JSON.stringify({ phonetics: {} })).phonetics },
  terminologies: { ...JSON.parse(localStorage.getItem('glossary') ?? JSON.stringify({ terminologies: {} })).terminologies },
  hanViet: [],
  vietPhrase: {},
  name: {},
  namePhu: { ...JSON.parse(localStorage.getItem('glossary') ?? JSON.stringify({ namePhu: {} })).namePhu },
  luatNhan: {},
  pronoun: {},
};

const translators = {};
let currentTranslator = null;
let translationController = null;
let entryTranslationController = null;
let autocompleteTimeout = null;

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
      CocCocEduTranslate.LANGUAGE_LIST.forEach(({ label, value }) => {
        if (!['auto', 'en', 'vi', 'ja', 'zh-Hans', 'zh-Hant'].includes(value)) return;
        const option = document.createElement('option');
        option.innerText = label;
        option.value = value;
        sourceLanguageSelect.appendChild(option);
      });
      break;
    }
    case Translators.DEEPL_TRANSLATE: {
      DeepLTranslate.SOURCE_LANGUAGE_LIST.forEach(({ language, name }) => {
        if (!['', 'EN', 'JA', 'ZH'].includes(language)) return;
        const option = document.createElement('option');
        option.innerText = name;
        option.value = language;
        sourceLanguageSelect.appendChild(option);
      });
      break;
    }
    case Translators.GOOGLE_GEMINI: {
      const option = document.createElement('option');
      option.innerText = GoogleGemini.LANGUAGE_LIST[0].label;
      option.value = GoogleGemini.LANGUAGE_LIST[0].value;
      sourceLanguageSelect.appendChild(option);
      break;
    }
    case Translators.LINGVANEX: {
      Lingvanex.LANGUAGE_LIST.forEach(({ full_code, englishName }) => {
        if (!['', 'zh-Hans_CN', 'zh-Hant_TW', 'en_AU', 'en_GB', 'en_US', 'ja_JP', 'vi_VN'].includes(full_code)) return;
        const option = document.createElement('option');
        option.innerText = englishName;
        option.value = full_code;
        sourceLanguageSelect.appendChild(option);
      });
      break;
    }
    case Translators.MICROSOFT_TRANSLATOR: {
      Object.entries(MicrosoftTranslator.SOURCE_LANGUAGE_LIST).forEach(([languageCode, { name }]) => {
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
    case Translators.VIETPHRASE: {
      Object.entries(Vietphrase.SOURCE_LANGUAGE_LIST).forEach(([languageCode, name]) => {
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
      GoogleTranslate.LANGUAGE_LIST.forEach(({ language, name }) => {
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
      CocCocEduTranslate.LANGUAGE_LIST.forEach(({ label, value }) => {
        if (!['en', 'vi', 'ja', 'zh-Hans', 'zh-Hant'].includes(value)) return;
        const option = document.createElement('option');
        option.innerText = label;
        option.value = value;
        targetLanguageSelect.appendChild(option);
      });
      break;
    }
    case Translators.DEEPL_TRANSLATE: {
      DeepLTranslate.TARGET_LANGUAGE_LIST.forEach(({ language, name }) => {
        if (!['EN-GB', 'EN-US', 'JA', 'ZH', 'ZH-HANS'].includes(language)) return;
        const option = document.createElement('option');
        option.innerText = name;
        option.value = language;
        targetLanguageSelect.appendChild(option);
      });
      break;
    }
    case Translators.GOOGLE_GEMINI: {
      GoogleGemini.LANGUAGE_LIST.forEach(({ label, value }) => {
        if (!['English', 'Japanese', 'Chinese (Simplified)', 'Chinese (Traditional)', 'Vietnamese'].includes(value)) return;
        const option = document.createElement('option');
        option.innerText = label;
        option.value = value;
        targetLanguageSelect.appendChild(option);
      });
      break;
    }
    case Translators.LINGVANEX: {
      Lingvanex.LANGUAGE_LIST.forEach(({ full_code, englishName }) => {
        if (!['zh-Hans_CN', 'zh-Hant_TW', 'en_AU', 'en_GB', 'en_US', 'ja_JP', 'vi_VN'].includes(full_code)) return;
        const option = document.createElement('option');
        option.innerText = englishName;
        option.value = full_code;
        targetLanguageSelect.appendChild(option);
      });
      break;
    }
    case Translators.MICROSOFT_TRANSLATOR: {
      Object.entries(MicrosoftTranslator.TARGET_LANGUAGE_LIST).forEach(([languageCode, { name }]) => {
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
    case Translators.VIETPHRASE: {
      Object.entries(Vietphrase.TARGET_LANGUAGE_LIST).forEach(([languageCode, name]) => {
        const option = document.createElement('option');
        option.innerText = name;
        option.value = languageCode;
        targetLanguageSelect.appendChild(option);
      });
      break;
    }
    case Translators.WEBNOVEL_TRANSLATE: {
      WebnovelTranslate.LANGUAGE_LIST.targetLanguages.forEach(({ language, name }) => {
        if (!['en', 'ja', 'zh-CN', 'vi'].includes(language)) return;
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

const polishTranslation = async function polishTranslationWithArtificialIntelligence(artificialIntelligence, text, rawTranslation, nameEnabled) {
  const MAX_TOKENS_PER_RESPONSE = 8192;
  let result = rawTranslation;

  try {
    if (artificialIntelligence !== 'none') {
      const terminologies = Object.entries(glossary.terminologies).filter(([first]) => text.includes(first));
      const names = Object.entries(glossary.namePhu).filter(([first]) => text.includes(first));
      const lines = text.split('\n');
      const rawTranslationLines = rawTranslation.split('\n');
      let response = await $.ajax({
        data: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Translate the text in the VĂN BẢN GỐC section into Vietnamese. In that text, regardless of whether it is a title or content, everything must be translated. Refer to the rough translation in the BẢN DỊCH THÔ section to ensure consistency. ${terminologies.length > 0 || names.length > 0 ? `Prioritize applying ${terminologies.length > 0 ? 'the terms listed in the BẢNG TRA CỨU THUẬT NGỮ section ' : ''}${names.length > 0 ? `${terminologies.length > 0 ? 'and ' : ''}the proper names listed in the BẢNG CHÚ GIẢI TÊN section ` : ''}over anything else to enhance the accuracy and consistency of the translation. ` : ''}Your translations must convey all the content in the original text and cannot involve explanations or other unnecessary information. Please ensure that the translated text is natural for native speakers with correct grammar and proper word choices. Your output must only contain the translated text and cannot include explanations or other information. The output must be unformatted raw text.`,
                },
              ],
            },
            {
              role: 'model',
              parts: [
                {
                  text: 'Please provide the text you would like to have translated into Vietnamese in the VĂN BẢN GỐC section.',
                },
              ],
            },
            {
              role: 'user',
              parts: [
                {
                  text: `## VĂN BẢN GỐC:
\`\`\`txt
${lines.map((element) => element.replace(/^\s+/g, '')).join('\n')}
\`\`\`

## BẢN DỊCH THÔ:
\`\`\`txt
${rawTranslationLines.map((element) => element.replace(/^\s+/g, '')).join('\n')}
\`\`\`${terminologies.length > 0 || names.length > 0 ? `

${terminologies.length > 0 ? `## BẢNG TRA CỨU THUẬT NGỮ:
\`\`\`tsv
source\ttarget
${terminologies.map((element) => element.join('\t')).join('\n')}
\`\`\`` : ''}${names.length > 0 ? `${terminologies.length > 0 ? '\n\n' : ''}## BẢNG TRA CỨU TÊN RIÊNG:
\`\`\`tsv
source\ttarget
${names.map((element) => element.join('\t')).join('\n')}
\`\`\`` : ''}` : ''}`,
                },
              ],
            },
          ],
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_NONE',
            },
          ],
          generationConfig: {
            temperature: 1,
            topK: 64,
            topP: 0.95,
            maxOutputTokens: 8192,
            responseMimeType: 'text/plain',
          },
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      });
      if (response.candidates == null) return result;
response = response.candidates[0].content.parts[0].text.split('\n').filter((element) => element.replace(/^\s+/, '').length > 0);
      response = Object.fromEntries(lines.filter((element) => element.replace(/^\s+/, '').length > 0).map((element, index) => [element, response[index]]));
      result = lines.map((element, index) => (response[element] != null ? (rawTranslationLines[index] ?? element).match(/^\s*/)[0].concat(response[element].replace(/^\s+/g, '')) : rawTranslationLines[index] ?? element)).join('\n');
    }
  } catch (error) {
    throw error;
  }

  return result;
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
    const text = $inputTextarea.val().split('\n').filter((element) => $activeTranslator.val() !== Translators.WEBNOVEL_TRANSLATE || element.replace(/^\s+/, '').trimEnd().length > 0).join('\n');
    const targetLanguage = $targetLanguageSelect.val();

    switch ($activeTranslator.val()) {
      case Translators.GOOGLE_GEMINI: {
        currentTranslator.controller = controller;
        await currentTranslator.translateText(text, targetLanguage, glossary);
        break;
      }
      case Translators.VIETPHRASE: {
        await currentTranslator.translateText(text, targetLanguage, glossary, {
          autocapitalize: true,
          nameEnabled: true,
        });
        break;
      }
      default: {
        currentTranslator.controller = controller;
        await currentTranslator.translateText(text, targetLanguage, $sourceLanguageSelect.val());
      }
    }

    if (controller.signal.aborted) return;
    $resultTextarea.html(buildResult(text, currentTranslator.result, $activeTranslator.val()));

    if (targetLanguage.startsWith('vi')) {
      const polishResult = (await polishTranslation($artificialIntelligenceSelect.val(), text, currentTranslator.result)) ?? currentTranslator.result;
      if (controller.signal.aborted) return;
      currentTranslator.result = polishResult;
      $resultTextarea.html(buildResult(text, currentTranslator.result, $activeTranslator.val()));
    }

    if (controller.signal.aborted) return;
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
      $resultTextarea.html(null);
      $resultTextarea.append(paragraph);
    }

    if (translators[$activeTranslator.val()] != null) {
      switch ($activeTranslator.val()) {
        case Translators.LINGVANEX: {
          translators[$activeTranslator.val()].fetchApiKey();
          break;
        }
        case Translators.MICROSOFT_TRANSLATOR: {
          translators[$activeTranslator.val()].fetchData();
          break;
        }
        case Translators.PAPAGO: {
          translators[$activeTranslator.val()].fetchVersion();
          break;
        }
      }
      
      currentTranslator = translators[$activeTranslator.val()];
    }
  }
};

const reloadGlossary = function reloadActiveGlossary(glossaryList) {
  const glossaryKeys = Object.keys(glossary[glossaryList]);
  $glossaryEntryCounter.text(glossaryKeys.length);

  const glossaryStorage = { phonetics: glossary.phonetics, terminologies: glossary.terminologies, namePhu: glossary.namePhu };
  if (Object.keys(glossaryStorage).includes(glossaryList)) glossary[glossaryList] = Object.fromEntries(Object.entries(glossary[glossaryList]).sort((a, b) => a[1].localeCompare(b[1], 'vi', { ignorePunctuation: true }) || a[0].localeCompare(b[0], 'vi', { ignorePunctuation: true })));

  const autocompleteGlossarySource = glossaryKeys.map((element) => ({ value: element, label: `${element} → ${glossary[glossaryList][element]}` }));
  $sourceEntryInput.autocomplete({
    appendTo: '#glossary-modal .modal-body',
    source: (request, response) => {
      if (autocompleteTimeout != null) clearTimeout(autocompleteTimeout);
      autocompleteTimeout = setTimeout(() => {
        const matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), 'i');
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

  const glossaryStorage = { phonetics: glossary.phonetics, terminologies: glossary.terminologies, namePhu: glossary.namePhu };
  if (Object.keys(glossaryStorage).includes(activeGlossaryList)) glossary[activeGlossaryList] = Object.fromEntries(Object.entries(glossary[activeGlossaryList]).sort((a, b) => a[1].localeCompare(b[1], 'vi', { ignorePunctuation: true }) || a[0].localeCompare(b[0], 'vi', { ignorePunctuation: true })));
  localStorage.setItem('glossary', JSON.stringify(glossaryStorage));

  if (['terminologies', 'vietPhrase', 'name', 'namePhu', 'luatNhan', 'pronoun'].some((element) => activeGlossaryList === element)) {
    const activeTranslator = $translatorDropdown.find('.active').val();
    const addDeLeZhaoEnabled = $addDeLeZhaoSwitch.prop('checked');
    const multiplicationAlgorithm = $multiplicationAlgorithmRadio.filter('[checked]').val();

    if (activeTranslator === Translators.VIETPHRASE) {
      switch (activeGlossaryList) {
        case 'terminologies':
        case 'vietPhrase':
        case 'pronoun': {
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
          translators[activeTranslator] = currentTranslator;
          break;
        }
      }

      translators[activeTranslator] = currentTranslator;
    } else if (translators[Translators.VIETPHRASE] != null) {
      switch (activeGlossaryList) {
        case 'vietPhrase':
        case 'pronoun': {
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
};

$(document).ready(async () => {
  if (Utils.isOnMobile()) {
    const $textareas = $('.textarea');
    $textareas.css('max-height', `${$(window).height() - (5.6875 * 16) - 15}px`);
  }

  $resultTextarea.attr('contenteditable', !Utils.isOnMobile());
  sessionStorage.removeItem('glossary');
  const autocompleteFontStackTextSource = Object.entries(FONT_MAPPING).map(([first, second]) => ({ value: second, label: first }));
  $fontStackText.autocomplete({
    appendTo: '#settings-modal .modal-body',
    source: (request, response) => {
      const matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term.split(/, */).pop()), 'i');
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
  $inputTextarea.trigger('input');

  $.ajax({
    method: 'GET',
    url: '/static/datasource/Unihan_Variants.txt',
  }).done((data) => {
    const array = data.split('\n').filter((element) => element.length > 0 && !element.startsWith('#')).map((element) => element.split('\t'));

    glossary.traditional = array.filter((element) => element.length === 3 && element[1] === 'kTraditionalVariant').map(([first, __, third]) => [String.fromCodePoint(parseInt(first.substring(2), 16)), third.split(' ').map((element) => element.startsWith('U+') ? String.fromCodePoint(parseInt(element.substring(2), 16)) : element).join(' ')]);
    console.log(`Đã tải xong bộ dữ liệu phồn thể (${glossary.traditional.length})!`);

    glossary.simplified = array.filter((element) => element.length === 3 && element[1] === 'kSimplifiedVariant').map(([first, __, third]) => [String.fromCodePoint(parseInt(first.substring(2), 16)), third.split(' ').map((element) => element.startsWith('U+') ? String.fromCodePoint(parseInt(element.substring(2), 16)) : element).join(' ')]);
    console.log(`Đã tải xong bộ dữ liệu giản thể (${glossary.simplified.length})!`);
  }).fail((__, ___, errorThrown) => {
    console.error('Không thể tải bộ dữ liệu giản thể-phồn thể:', errorThrown);
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  });

  $.ajax({
    method: 'GET',
    url: '/static/datasource/Unihan_Readings.txt',
  }).done((data) => {
    const array = data.split('\n').filter((element) => element.length > 0 && !element.startsWith('#')).map((element) => element.split('\t'));
    glossary.pinyins = array.filter((element) => element.length === 3 && element[1] === 'kMandarin').map(([first, __, third]) => [String.fromCodePoint(parseInt(first.substring(2), 16)), third.normalize()]);
    console.log(`Đã tải xong bộ dữ liệu bính âm Quan thoại (${glossary.pinyins.length})!`);
    glossary.KunYomis = array.filter((element) => element.length === 3 && element[1] === 'kJapaneseKun').map(([first, __, third]) => [String.fromCodePoint(parseInt(first.substring(2), 16)), third.normalize()]);
    console.log(`Đã tải xong bộ dữ liệu Kun'yomi (${glossary.KunYomis.length})!`);
    glossary.OnYomis = array.filter((element) => element.length === 3 && element[1] === 'kJapaneseOn').map(([first, __, third]) => [String.fromCodePoint(parseInt(first.substring(2), 16)), third.normalize()]);
    console.log(`Đã tải xong bộ dữ liệu On'yomi (${glossary.OnYomis.length})!`);
  }).fail((__, ___, errorThrown) => {
    console.error('Không thể tải bộ dữ liệu bính âm, Kun\'yomi và On\'yomi:', errorThrown);
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  });

  try {
    glossary.SinoVietnameses = cjkv.nam.map(([first, second]) => [first, second.normalize().split(',').map((element) => element.replaceAll(Utils.getTrieRegexPatternFromWords(Object.keys(newAccentObject)), (match) => newAccentObject[match] ?? match)).join(',')]);
    console.log(`Đã tải xong bộ dữ liệu Hán-Việt (${glossary.SinoVietnameses.length})!`);
  } catch (error) {
    console.error('Không thể tải bộ dữ liệu Hán-Việt:', error);
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  }

  $translatorDropdown.find('.active').click();
  $inputTextarea.trigger('input');
  reloadGlossary($glossaryListSelect.val());
});

$(window).on('keydown', (event) => {
  if (event.ctrlKey && event.key === 'r') event.preventDefault();
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
          return;
        }

        translationController = null;
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

// $dropdownHasCollapse.on('hide.bs.dropdown', function onHideBsDropdown() {
//   $(this).find('.dropdown-menu').find('.collapse.show').each((__, value) => {
//     (new bootstrap.Collapse(value)).hide();
//   });
// });

$fontStackText.change(function onChange() {
  const values = $(this).val().replaceAll(/['"]/g, '').split(/, */).filter((element) => element.length > 0).map((element) => FONT_MAPPING[element.trim()] ?? element.trim());
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

  if ($fontStackText.val().length === 0 || prevFontStack.startsWith($fontStackText.val())) $fontStackText.val(fontStack ?? '').change();
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

$translatorDropdown.find('.dropdown-item').click(function onClick() {
  $translatorDropdown.find('.dropdown-item').removeClass('active');
  $(this).addClass('active');
  const activeTranslator = $(this).val();
  currentTranslator = translators[activeTranslator];

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
        currentTranslator = new CocCocEduTranslate();
        translators[activeTranslator] = currentTranslator;
      }

      break;
    }
    case Translators.DEEPL_TRANSLATE: {
      while (currentTranslator == null || (currentTranslator instanceof DeepLTranslate && (currentTranslator.usage.character_limit - currentTranslator.usage.character_count) < 100000)) {
        currentTranslator = new DeepLTranslate(DEEPL_AUTH_KEY_LIST[0][0]);

        if ((currentTranslator.usage.character_limit - currentTranslator.usage.character_count) >= 100000) {
          translators[activeTranslator] = currentTranslator;
          break;
        }

        DEEPL_AUTH_KEY_LIST.shift();
      }

      break;
    }
    case Translators.GOOGLE_GEMINI: {
      if (currentTranslator == null) {
        currentTranslator = new GoogleGemini(GEMINI_API_KEY);
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
    case Translators.VIETPHRASE: {
      if (currentTranslator == null) {
        currentTranslator = new Vietphrase($addDeLeZhaoSwitch.prop('checked'), $multiplicationAlgorithmRadio.filter('[checked]').val());
        translators[activeTranslator] = currentTranslator;
      }

      break;
    }
    case Translators.WEBNOVEL_TRANSLATE: {
      if (currentTranslator == null) {
        currentTranslator = new WebnovelTranslate();
        translators[activeTranslator] = currentTranslator;
      }
  
      break;
    }
    default: {
      if (currentTranslator == null) {
        currentTranslator = new GoogleTranslate();
        translators[activeTranslator] = currentTranslator;
      }

      break;
    }
  }

  loadLangSelectOptions(activeTranslator);
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
    switch (intValue) {
      case 1:
      case 2: {
        if (glossary.dataByThtgiangPronoun == null || glossary.dataByThtgiangPronoun.length === 0) {
          await $.ajax({
            cache: false,
            method: 'GET',
            url: '/static/datasource/Quick Translator/Pronouns.txt',
          }).done((data) => {
            glossary.dataByThtgiangPronoun = data.split('\r\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('=')).map(([first, second]) => [first, second.normalize()]);
          }).fail((__, ___, errorThrown) => {
            glossary.dataByThtgiangPronoun = null;
            console.error('Không tải được tệp Quick Translator\'s Pronouns:', errorThrown);
          });
        }

        glossary.pronoun = {
          ...Object.fromEntries(glossary.dataByThtgiangPronoun.filter(function filter([first]) {
            return !this[first] && (this[first] = 1);
          }, {})),
        };

        console.log(`Đã tải xong tệp Pronouns (${Object.keys(glossary.pronoun).length})!`);

        if (glossary.dataByThtgiangLuatNhan == null || glossary.dataByThtgiangLuatNhan.length === 0) {
          await $.ajax({
            cache: false,
            method: 'GET',
            url: '/static/datasource/Quick Translator/LuatNhan.txt',
          }).done((data) => {
            glossary.dataByThtgiangLuatNhan = data.split('\r\n').filter((element) => element.length > 0 && !element.startsWith('#') && element.split('=').length === 2).map((element) => element.split('=')).map(([first, second]) => [first, second.normalize()]);
          }).fail((__, ___, errorThrown) => {
            glossary.dataByThtgiangLuatNhan = null;
            console.error('Không tải được tệp Quick Translator\'s LuatNhan:', errorThrown);
          });
        }

        glossary.luatNhan = {
          ...Object.fromEntries(glossary.dataByThtgiangLuatNhan.filter(function filter([first]) {
            return !this[first] && (this[first] = 1);
          }, {})),
        };

        console.log(`Đã tải xong tệp LuatNhan (${Object.keys(glossary.luatNhan).length})!`);

        if (glossary.quickTranslatorHanViet == null || glossary.quickTranslatorHanViet.length === 0) {
          await $.ajax({
            cache: false,
            method: 'GET',
            url: '/static/datasource/Quick Translator/ChinesePhienAmWords.txt',
          }).done((data) => {
            glossary.quickTranslatorHanViet = data.split('\r\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('=')).map(([first, second]) => [first, second.normalize()]);
          }).fail((__, ___, errorThrown) => {
            glossary.quickTranslatorHanViet = null;
            console.error('Không tải được tệp Quick Translator\'s ChinesePhienAmWords:', errorThrown);
          });
        }

        glossary.hanViet = glossary.quickTranslatorHanViet.filter(function filter([first]) {
          return !this[first] && (this[first] = 1);
        }, {});
        console.log(`Đã tải xong tệp ChinesePhienAmWords (${glossary.hanViet.length})!`);

        if (glossary.quickTranslatorName == null || glossary.quickTranslatorName.length === 0) {
          await $.ajax({
            method: 'GET',
            url: '/static/datasource/Quick Translator/Names.txt',
          }).done((data) => {
            glossary.quickTranslatorName = data.split('\r\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('=')).map(([first, second]) => [first, second.normalize()]);
          }).fail((__, ___, errorThrown) => {
            glossary.quickTranslatorName = null;
            console.error('Không tải được tệp Quick Translator\'s Names:', errorThrown);
          });
        }

        glossary.name = {
          ...Object.fromEntries(glossary.quickTranslatorName.filter(function filter([first]) {
            return !this[first] && (this[first] = 1);
          }, {})),
        };

        console.log(`Đã tải xong tệp Names (${Object.keys(glossary.name).length})!`);

        if (glossary.quickTranslatorVietphraseForMergeFiles == null || glossary.quickTranslatorVietphraseForMergeFiles.length === 0) {
          await $.ajax({
            method: 'GET',
            url: '/static/datasource/Quick Translator/Vietphrase cho file gộp.txt',
          }).done((data) => {
            glossary.quickTranslatorVietphraseForMergeFiles = data.split('\r\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('=')).map(([first, second]) => [first, second.normalize()]);
          }).fail(() => {
            glossary.quickTranslatorVietphraseForMergeFiles = null;
          });
        }

        if (glossary.quickTranslatorVietPhrase == null || glossary.quickTranslatorVietPhrase.length === 0) {
          await $.ajax({
            method: 'GET',
            url: '/static/datasource/Quick Translator/Vietphrase.txt',
          }).done((data) => {
            glossary.quickTranslatorVietPhrase = data.split('\r\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('=')).map(([first, second]) => [first, second.normalize()]);
          }).fail((__, ___, errorThrown) => {
            glossary.quickTranslatorVietPhrase = null;
            console.error('Không tải được tệp Quick Translator\'s VietPhrase:', errorThrown);
          });
        }

        if (intValue === 2) {
          glossary.vietPhrase = glossary.quickTranslatorVietphraseForMergeFiles != null && glossary.quickTranslatorVietPhrase != null ? Object.fromEntries(glossary.quickTranslatorVietphraseForMergeFiles.concat(glossary.quickTranslatorVietPhrase).filter(function filter([first]) {
            return !this[first] && (this[first] = 1);
          }, {})) : {};
        } else {
          glossary.vietPhrase = {
            ...Object.fromEntries(glossary.quickTranslatorVietPhrase.filter(function filter([first]) {
              return !this[first] && (this[first] = 1);
            }, {})),
          };
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
            glossary.dataByThtgiangPronoun = data.split('\r\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('=')).map(([first, second]) => [first, second.normalize()]);
          }).fail((__, ___, errorThrown) => {
            glossary.dataByThtgiangPronoun = null;
            console.error('Không tải được tệp Data của thtgiang\'s Pronouns:', errorThrown);
          });
        }

        glossary.pronoun = {
          ...Object.fromEntries(glossary.dataByThtgiangPronoun.filter(function filter([first]) {
            return !this[first] && (this[first] = 1);
          }, {})),
        };

        console.log(`Đã tải xong tệp Pronouns (${Object.keys(glossary.pronoun).length})!`);

        if (glossary.dataByThtgiangLuatNhan == null || glossary.dataByThtgiangLuatNhan.length === 0) {
          await $.ajax({
            cache: false,
            method: 'GET',
            url: '/static/datasource/Data của thtgiang/LuatNhan.txt',
          }).done((data) => {
            glossary.dataByThtgiangLuatNhan = data.split('\r\n').filter((element) => element.length > 0 && !element.startsWith('#') && element.split('=').length === 2).map((element) => element.split('=')).map(([first, second]) => [first, second.normalize()]);
          }).fail((__, ___, errorThrown) => {
            glossary.dataByThtgiangLuatNhan = null;
            console.error('Không tải được tệp Data của thtgiang\'s LuatNhan:', errorThrown);
          });
        }

        glossary.luatNhan = {
          ...Object.fromEntries(glossary.dataByThtgiangLuatNhan.filter(function filter([first]) {
            return !this[first] && (this[first] = 1);
          }, {})),
        };

        console.log(`Đã tải xong tệp LuatNhan (${Object.keys(glossary.luatNhan).length})!`);

        if (glossary.dataByThtgiangHanViet == null || glossary.dataByThtgiangHanViet.length === 0) {
          await $.ajax({
            cache: false,
            method: 'GET',
            url: '/static/datasource/Data của thtgiang/ChinesePhienAmWords.txt',
          }).done((data) => {
            glossary.dataByThtgiangHanViet = data.split('\r\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('=')).map(([first, second]) => [first, second.normalize()]);
          }).fail((__, ___, errorThrown) => {
            glossary.dataByThtgiangHanViet = null;
            console.error('Không tải được tệp Data của thtgiang\'s ChinesePhienAmWords:', errorThrown);
          });
        }

        glossary.hanViet = glossary.dataByThtgiangHanViet.filter(function filter([first]) {
          return !this[first] && (this[first] = 1);
        }, {});
        console.log(`Đã tải xong tệp ChinesePhienAmWords (${glossary.hanViet.length})!`);

        if (glossary.dataByThtgiangName == null || glossary.dataByThtgiangName.length === 0) {
          await $.ajax({
            method: 'GET',
            url: '/static/datasource/Data của thtgiang/Names.txt',
          }).done((data) => {
            glossary.dataByThtgiangName = data.split('\r\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('=')).map(([first, second]) => [first, second.normalize()]);
          }).fail((__, ___, errorThrown) => {
            glossary.dataByThtgiangName = null;
            console.error('Không tải được tệp Data của thtgiang\'s Names:', errorThrown);
          });
        }

        glossary.name = {
          ...Object.fromEntries(glossary.dataByThtgiangName.filter(function filter([first]) {
            return !this[first] && (this[first] = 1);
          }, {})),
        };

        console.log(`Đã tải xong tệp Names (${Object.keys(glossary.name).length})!`);

        if (glossary.dataByThtgiangVietPhrase == null || glossary.dataByThtgiangVietPhrase.length === 0) {
          await $.ajax({
            method: 'GET',
            url: '/static/datasource/Data của thtgiang/VietPhrase.txt',
          }).done((data) => {
            glossary.dataByThtgiangVietPhrase = data.split('\r\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('=')).map(([first, second]) => [first, second.normalize()]);
          }).fail((__, ___, errorThrown) => {
            glossary.dataByThtgiangVietPhrase = null;
            console.error('Không tải được tệp Data của thtgiang\'s VietPhrase:', errorThrown);
          });
        }

        glossary.vietPhrase = {
          ...Object.fromEntries(glossary.dataByThtgiangVietPhrase.filter(function filter([first]) {
            return !this[first] && (this[first] = 1);
          }, {})),
        };

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
            glossary.ttvtranslateHanViet = data.split('\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('=')).map(([first, second]) => [first, second.normalize()]);
          }).fail((__, ___, errorThrown) => {
            glossary.ttvtranslateHanViet = null;
            console.error('Không tải được tệp ttvtranslate\'s ChinesePhienAmWords:', errorThrown);
          });
        }

        glossary.hanViet = glossary.ttvtranslateHanViet.filter(function filter([first]) {
          return !this[first] && (this[first] = 1);
        }, {});
        console.log(`Đã tải xong tệp ChinesePhienAmWords (${glossary.hanViet.length})!`);

        if (glossary.ttvtranslateName == null || glossary.ttvtranslateName.length === 0) {
          await $.ajax({
            method: 'GET',
            url: '/static/datasource/ttvtranslate/Names.txt',
          }).done((data) => {
            glossary.ttvtranslateName = data.split('\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('=')).map(([first, second]) => [first, second.normalize()]);
          }).fail((__, ___, errorThrown) => {
            glossary.ttvtranslateName = null;
            console.error('Không tải được tệp ttvtranslate\'s Names:', errorThrown);
          });
        }

        glossary.name = {
          ...Object.fromEntries(glossary.ttvtranslateName.filter(function filter([first]) {
            return !this[first] && (this[first] = 1);
          }, {})),
        };

        console.log(`Đã tải xong tệp Names (${Object.keys(glossary.name).length})!`);

        if (glossary.ttvtranslateVietPhrase == null || glossary.ttvtranslateVietPhrase.length === 0) {
          await $.ajax({
            method: 'GET',
            url: '/static/datasource/ttvtranslate/VietPhrase.txt',
          }).done((data) => {
            glossary.ttvtranslateVietPhrase = data.split('\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('=')).map(([first, second]) => [first, second.normalize()]);
          }).fail((__, ___, errorThrown) => {
            glossary.ttvtranslateVietPhrase = null;
            console.error('Không tải được tệp ttvtranslate\'s VietPhrase:', errorThrown);
          });
        }

        glossary.vietPhrase = {
          ...Object.fromEntries(glossary.ttvtranslateVietPhrase.filter(function filter([first]) {
            return !this[first] && (this[first] = 1);
          }, {})),
        };

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
            glossary.translateHanViet = data.split('\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('=')).map(([first, second]) => [first, second.normalize()]);
          }).fail((__, ___, errorThrown) => {
            glossary.translateHanViet = null;
            console.error('Không tải được tệp Translate\'s ChinesePhienAmWords:', errorThrown);
          });
        }

        glossary.hanViet = glossary.translateHanViet.filter(function filter([first]) {
          return !this[first] && (this[first] = 1);
        }, {});
        console.log(`Đã tải xong tệp ChinesePhienAmWords (${glossary.hanViet.length})!`);

        if (glossary.translateName == null || glossary.translateName.length === 0) {
          await $.ajax({
            method: 'GET',
            url: '/static/datasource/Translate/Names.txt',
          }).done((data) => {
            glossary.translateName = data.split('\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('=')).map(([first, second]) => [first, second.normalize()]);
          }).fail((__, ___, errorThrown) => {
            glossary.translateName = null;
            console.error('Không tải được tệp Translate\'s Names:', errorThrown);
          });
        }

        glossary.name = {
          ...Object.fromEntries(glossary.translateName.filter(function filter([first]) {
            return !this[first] && (this[first] = 1);
          }, {})),
        };

        console.log(`Đã tải xong tệp Names (${Object.keys(glossary.name).length})!`);

        if (glossary.translateVietPhrase == null || glossary.translateVietPhrase.length === 0) {
          await $.ajax({
            method: 'GET',
            url: '/static/datasource/Translate/VietPhrase.txt',
          }).done((data) => {
            glossary.translateVietPhrase = data.split('\n').filter((element) => element.length > 0 && element.split('=').length === 2).map((element) => element.split('=')).map(([first, second]) => [first, second.normalize()]);
          }).fail((__, ___, errorThrown) => {
            glossary.translateVietPhrase = null;
            console.error('Không tải được tệp Translate\'s VietPhrase:', errorThrown);
          });
        }

        glossary.vietPhrase = {
          ...Object.fromEntries(glossary.translateVietPhrase.filter(function filter([first]) {
            return !this[first] && (this[first] = 1);
          }, {})),
        };

        console.log(`Đã tải xong tệp VietPhrase (${Object.keys(glossary.vietPhrase).length})!`);
        break;
      }
      // no default
    }
  }

  const activeGlossaryList = $glossaryListSelect.val();
  if (['vietPhrase', 'name', 'luatNhan', 'pronoun'].some((element) => activeGlossaryList === element)) reloadGlossary(activeGlossaryList);
});

$addDeLeZhaoSwitch.on('change', () => {
  if ($translatorDropdown.find('.active').val() === Translators.VIETPHRASE) currentTranslator.vietPhrase = null;
});

$multiplicationAlgorithmRadio.on('change', () => {
  if ($translatorDropdown.find('.active').val() === Translators.VIETPHRASE) {
    currentTranslator.name = null;
    currentTranslator.vietPhrase = null;
  }
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
      (new Promise((resolve) => {
        $translateEntryButtons.filter(`[data-translator="vietphrase"][data-lang="${activeGlossaryList === 'vietPhrase' ? 'vi' : 'SinoVietnamese'}"]`).click();
        resolve();
      })).then(() => {
        if (['name', 'namePhu'].some((element) => activeGlossaryList === element)) $upperCaseButtons.filter('[data-amount="#"]').click();
      });
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
    if ($sourceEntryInput.val().length > 0) $sourceEntryInput.trigger('input');
    $glossaryInput.val(null);
  };

  reader.readAsText($(this).prop('files')[0]);
});

$('#clear-glossary-button').on('click', () => {
  if (!window.confirm('Bạn có muốn xoá sạch bảng thuật ngữ chứ?')) return;
  const activeGlossaryList = $glossaryListSelect.val();
  glossary[activeGlossaryList] = {};
  saveGlossary();
});

$glossaryListSelect.change(function onChange() {
  const activeGlossaryList = $(this).val();
  reloadGlossary(activeGlossaryList);

  if ($sourceEntryInput.val().length > 0) {
    const currentGlossary = glossary[activeGlossaryList];

    if (Object.hasOwn(currentGlossary, $sourceEntryInput.val())) {
      $targetEntryTextarea.val(currentGlossary[$sourceEntryInput.val()]);
      $removeButton.removeClass('disabled');
    } else {
      if (window.confirm('Bạn có muốn chuyển đổi lại chứ?')) {
        (new Promise((resolve) => {
          $translateEntryButtons.filter(`[data-translator="vietphrase"][data-lang="${activeGlossaryList === 'vietPhrase' ? 'vi' : 'SinoVietnamese'}"]`).click();
          resolve();
        })).then(() => {
          if (['name', 'namePhu'].some((element) => activeGlossaryList === element)) $upperCaseButtons.filter('[data-amount="#"]').click();
        });
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
      (new Promise((resolve) => {
        $translateEntryButtons.filter(`[data-translator="vietphrase"][data-lang="${activeGlossaryList === 'vietPhrase' ? 'vi' : 'SinoVietnamese'}"]`).click();
        resolve();
      })).then(() => {
        if (['name', 'namePhu'].some((element) => activeGlossaryList === element)) $upperCaseButtons.filter('[data-amount="#"]').click();
      });
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

    window.open(href, '_blank', 'width=1000,height=577');
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
    $translateEntryButtons.addClass('disabled');
    $sourceEntryInput.attr('readonly', true);
    const activeTranslator = $(this).data('translator');
    let translator = translators[activeTranslator];
    const targetLanguage = $(this).data('lang');
    const nameEnabled = $(this).data('name-enabled');
    const artificialIntelligence = $(this).data('artificial-intelligence');

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
            translator = new CocCocEduTranslate();
            translators[activeTranslator] = translator;
          }

          break;
        }
        case Translators.DEEPL_TRANSLATE: {
          while (translator == null || (translator instanceof DeepLTranslate && (translator.usage.character_limit - translator.usage.character_count) < 1000)) {
            translator = new DeepLTranslate(DEEPL_AUTH_KEY_LIST[0][0]);

            if ((translator.usage.character_limit - translator.usage.character_count) >= 1000) {
              translators[activeTranslator] = translator;
              break;
            }

            DEEPL_AUTH_KEY_LIST.shift();
          }

          break;
        }
        case Translators.GOOGLE_GEMINI: {
          if (translator == null) {
            translator = new GoogleGemini(GEMINI_API_KEY);
            translators[activeTranslator] = translator;
          }

          break;
        }
        case Translators.GOOGLE_TRANSLATE: {
          if (translator == null) {
            translator = new GoogleTranslate();
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
        default: {
          if (translator == null) {
            translator = new Vietphrase($addDeLeZhaoSwitch.prop('checked'), $multiplicationAlgorithmRadio.filter('[checked]').val());
            translators[activeTranslator] = translator;
          }

          break;
        }
      }

      switch (activeTranslator) {
        case Translators.GOOGLE_GEMINI: {
          translator.controller = entryTranslationController;
          await translator.translateText(text, targetLanguage, { ...glossary, namePhu: nameEnabled != null && Boolean(nameEnabled) !== false ? glossary.namePhu : {} });
          break;
        }
        case Translators.VIETPHRASE: {
          await translator.translateText(text, targetLanguage, glossary, {
            autocapitalize: false,
            nameEnabled: nameEnabled != null && Boolean(nameEnabled) !== false,
          });
          break;
        }
        default: {
          translator.controller = entryTranslationController;
          await translator.translateText(text, targetLanguage);
          break;
        }
      }

      if (targetLanguage.startsWith('vi')) translator.result = await polishTranslation(artificialIntelligence ?? 'none', text, translator.result);

      if (!translator.controller.signal.aborted) {
        $targetEntryTextarea.val(translator.result.replace(/^\s+/, '')).trigger('input');

        if (activeTranslator !== Translators.VIETPHRASE || (nameEnabled != null && Boolean(nameEnabled) !== false)) {
          $translateEntryButton.data('translator', activeTranslator);
          $translateEntryButton.data('lang', targetLanguage);
          $translateEntryButton.data('name-enabled', nameEnabled != null ? Boolean(nameEnabled) !== false : null);
          $translateEntryButton.data('artificial-intelligence', artificialIntelligence ?? null);
        }
      }
    } catch (error) {
      $targetEntryTextarea.val(error);
      console.error(error);

      if (translators[activeTranslator] != null) {
        switch (activeTranslator) {
          case Translators.LINGVANEX: {
            translators[activeTranslator].fetchApiKey();
            break;
          }
          case Translators.MICROSOFT_TRANSLATOR: {
            translators[activeTranslator].fetchData();
            break;
          }
          case Translators.PAPAGO: {
            translators[activeTranslator].fetchVersion();
            break;
          }
        }
      }
    }

    $sourceEntryInput.removeAttr('readonly');
    $translateEntryButtons.removeClass('disabled');
    entryTranslationController = null;
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
  if (!Object.hasOwn(glossary[$glossaryListSelect.val()], $sourceEntryInput.val()) || !window.confirm('Bạn có muốn xoá cụm từ này chứ?')) return;
  delete glossary[$glossaryListSelect.val()][$sourceEntryInput.val()];
  saveGlossary();
  $sourceEntryInput.trigger('input');
  $removeButton.addClass('disabled');
});

$translateEntryButton.on('click', function onClick() {
  if ($(this).data('translator') != null) $translateEntryButtons.filter(`[data-translator="${$(this).data('translator')}"][data-lang="${$(this).data('lang')}"]${$(this).data('name-enabled') != null ? `[data-name-enabled="${$(this).data('name-enabled')}"]` : ''}${$(this).data('artificial-intelligence') != null ? `[data-artificial-intelligence="${$(this).data('artificial-intelligence')}"]` : ''}`).click();
});
