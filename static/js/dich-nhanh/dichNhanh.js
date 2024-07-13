'use strict';

/* global BaiduTranslate, cjkv, DeepLTranslate, GoogleTranslate, hanData, Papago, MicrosoftTranslator, newAccentObject, Utils, WebNovelGoogleTranslate */

const $copyButtons = $('.copy-button');
const $inputTextarea = $('#input-textarea');
const $pasteButtons = $('.paste-button');
const $resultTextarea = $('#result-textarea');
const $retranslateButton = $('#retranslate-button');
const $sourceLanguageSelect = $('#source-language-select');
const $targetLanguageSelect = $('#target-language-select');
const $toneSelect = $('#tone-select');
const $translateButton = $('#translate-button');
const $translateTimer = $('#translate-timer');
const $translatorDropdown = $('#translator-dropdown');

const Translators = {
  BAIDU_TRANSLATE: 'baiduTranslate',
  DEEPL_TRANSLATE: 'deeplTranslate',
  GOOGLE_TRANSLATE: 'googleTranslate',
  PAPAGO: 'papago',
  MICROSOFT_TRANSLATOR: 'microsoftTranslator',
  VIETPHRASE: 'vietphrase',
  WEBNOVEL_GOOGLE_TRANSLATE: 'webnovelGoogleTranslate',
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

const glossary = {};

let currentTranslator = null;
let translationController = null;

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
    case Translators.WEBNOVEL_GOOGLE_TRANSLATE: {
      Object.entries(WebNovelGoogleTranslate.SOURCE_LANGUAGE_LIST).forEach(([languageCode, name]) => {
        if (!SUPPORTED_LANGUAGES_CODE_LIST.includes(languageCode)) return;
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
    case Translators.WEBNOVEL_GOOGLE_TRANSLATE: {
      Object.entries(WebNovelGoogleTranslate.TARGET_LANGUAGE_LIST).forEach(([languageCode, name]) => {
        if (!SUPPORTED_LANGUAGES_CODE_LIST.includes(languageCode)) return;
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
  const sourceLanguage = currentTranslator.DefaultLanguage.SOURCE_lANGUAGE;
  const targetLanguage = currentTranslator.DefaultLanguage.TARGET_lANGUAGE;
  $sourceLanguageSelect.html(getSourceLangOptionList(translator));
  $sourceLanguageSelect.val(sourceLanguage).change();
  $targetLanguageSelect.html(getTargetLangOptionList(translator));
  $targetLanguageSelect.val(targetLanguage).change();
};

const buildResult = function buildResultContentForTextarea(inputText, result) {
  try {
    const resultDiv = document.createElement('div');
    const resultLines = result.split('\n').map((element) => element.trimStart());
    resultDiv.innerHTML = `<p>${resultLines.map(Utils.convertTextToHtml).join('</p><p>')}</p>`;
    return resultDiv.innerHTML.replaceAll(/(<p>)(<\/p>)/g, '$1<br>$2');
  } catch (error) {
    console.error('Lỗi hiển thị bản dịch:', error);
    throw error.toString();
  }
};

const translate = async function translateContentInTextarea(controller = new AbortController()) {
  try {
    const startTime = Date.now();
    const inputText = $inputTextarea.val();
    await currentTranslator.translateText(inputText, $targetLanguageSelect.val(), $sourceLanguageSelect.val());
    if (controller.signal.aborted) return;
    $resultTextarea.html(buildResult(inputText, currentTranslator.result));
    $translateTimer.text(Date.now() - startTime);
  } catch (error) {
    console.error(error);
    if (controller.signal.aborted) return;
    const paragraph = document.createElement('p');
    paragraph.innerText = `Bản dịch thất bại: ${error}`;
    $resultTextarea.appendChild(paragraph);
  }
};

$(document).ready(() => {
  $('input[type="file"]').val(null);
  $inputTextarea.trigger('input');

  $.ajax({
    cache: false,
    method: 'GET',
    url: '/static/datasource/Unihan_Variants.txt',
  }).done((data) => {
    const array = data.split('\n').filter((element) => element.length > 0 && !element.startsWith('#')).map((element) => element.split('\t'));

    glossary.traditional = array.filter((element) => element.length === 3 && element[1] === 'kTraditionalVariant').map(([first, __, third]) => [String.fromCodePoint(parseInt(first.substring(2), 16)), third.split(' ').filter((element) => third.split(' ').length === 1 || element !== first).map((element) => String.fromCodePoint(parseInt(element.substring(2), 16)))[0]]);
    console.info(`Đã tải xong bộ dữ liệu phổn thể (${glossary.traditional.length})!`);

    glossary.simplified = array.filter((element) => element.length === 3 && element[1] === 'kSimplifiedVariant').map(([first, __, third]) => [String.fromCodePoint(parseInt(first.substring(2), 16)), third.split(' ').filter((element) => third.split(' ').length === 1 || element !== first).map((element) => String.fromCodePoint(parseInt(element.substring(2), 16)))[0]]);
    console.info(`Đã tải xong bộ dữ liệu giản thể (${glossary.simplified.length})!`);
  }).fail((__, ___, errorThrown) => {
    console.error('Không thể tải bộ dữ liệu phổn thể và phổn thể:', errorThrown);
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  });

  $.ajax({
    cache: false,
    method: 'GET',
    url: '/static/datasource/lacviet/lv-[zh-vi].tsv',
  }).done((data) => {
    let hanvietList = data.split('\n').filter((element) => element.includes('Hán Việt:') && /^\p{Script=Hani}+$/u.test(element.split('\t')[0])).map((element) => element.split('\t')).map(([first, second]) => [first, second.replaceAll('<span class="east"> </span>', ' ').match(/Hán Việt:(?: |)[^<]*/g)[0].replace(/Hán Việt: ?/, '').split(/[,;] ?/)[0].toLowerCase()]);
    hanvietList = hanvietList.concat(cjkv.nam.map(([first, second]) => [first, second.split(',').filter((element) => element.length > 0)[0].trimStart().replaceAll(Utils.getTrieRegexPatternFromWords(Object.keys(newAccentObject)), (match) => newAccentObject[match] ?? match)]));
    hanvietList = hanvietList.concat(hanData.names.map(([first, second]) => [first, second.split(',').filter((element) => element.length > 0)[0].replaceAll(Utils.getTrieRegexPatternFromWords(Object.keys(newAccentObject)), (match) => newAccentObject[match] ?? match)]));
    hanvietList = hanvietList.filter((element, __, array) => element.join('=').length > 0 && element.length === 2 && !array[element[0]] && (array[element[0]] = 1), {});
    glossary.hanViet = hanvietList;
    console.info(`Đã tải xong bộ dữ liệu Hán-Việt (${hanvietList.length})!`);
  }).fail((__, ___, errorThrown) => {
    console.error('Không thể tải bộ dữ liệu Hán-Việt:', errorThrown);
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
    console.info(`Đã tải xong bộ dữ liệu bính âm (${glossary.pinyins.length})!`);
    glossary.KunYomis = array.filter((element) => element.length === 3 && element[1] === 'kJapaneseKun').map(([first, __, third]) => [String.fromCodePoint(parseInt(first.substring(2), 16)), third.split(' ')[0].toLowerCase()]);
    console.info(`Đã tải xong bộ dữ liệu Kun'yomi (${glossary.KunYomis.length})!`);
    glossary.OnYomis = array.filter((element) => element.length === 3 && element[1] === 'kJapaneseOn').map(([first, __, third]) => [String.fromCodePoint(parseInt(first.substring(2), 16)), third.split(' ')[0].toLowerCase()]);
    console.info(`Đã tải xong bộ dữ liệu On'yomi (${glossary.OnYomis.length})!`);
  }).fail((__, ___, errorThrown) => {
    console.error('Không thể tải bộ dữ liệu bính âm, Kun\'yomi và On\'yomi:', errorThrown);
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  });

  $translatorDropdown.find('.active').click();
  $inputTextarea.trigger('input');
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
  const target = $($(this).data('target'));

  if (target.length > 0) {
    if (target.attr('id') === $resultTextarea.attr('id') && currentTranslator.result.length > 0) navigator.clipboard.writeText(currentTranslator.result);
    else if (target.val().length > 0) navigator.clipboard.writeText(target.val());
    return;
  }

  if (sessionStorage.getItem($(this).data('target')) != null && sessionStorage.getItem($(this).data('target')).length > 0) navigator.clipboard.writeText(sessionStorage.getItem[$(this).data('target')]);
});

$pasteButtons.on('click', function onClick() {
  navigator.clipboard.readText().then((clipText) => {
    const $targetTextInput = $($(this).data('target'));
    if (clipText === $($(this).data('target')).val()) return;
    $targetTextInput.prop('scrollLeft', 0);
    $targetTextInput.prop('scrollTop', 0);

    if ($targetTextInput.attr('id') === $inputTextarea.attr('id')) {
      $resultTextarea.prop('scrollTop', 0);
      $($(this).data('target')).val(clipText).trigger('input');
      $retranslateButton.click();
    } else {
      $($(this).data('target')).val(clipText).trigger('input');
    }
  });
});

$retranslateButton.on('click', () => {
  if ($translateButton.text() === 'Sửa') $translateButton.text('Dịch').click();
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
  if (event.ctrlKey && event.key === 'Enter') {
    // $glossaryManagerButton.trigger('mousedown');
    // $glossaryManagerButton.click();
    event.preventDefault();
    return;
  }

  if (event.key === 'Enter') {
    $translateButton.click();
    $inputTextarea.focus();
    event.preventDefault();
  }
});

$translatorDropdown.find('.dropdown-item').click(function onClick() {
  $translatorDropdown.find('.dropdown-item').removeClass('active');
  $(this).addClass('active');

  switch ($(this).val()) {
    case Translators.BAIDU_TRANSLATE: {
      currentTranslator = new BaiduTranslate();
      break;
    }
    case Translators.DEEPL_TRANSLATE: {
      while (true) {
        currentTranslator = new DeepLTranslate(DEEPL_AUTH_KEY_LIST[0][0]).init();
        if ((currentTranslator.usage.character_limit - currentTranslator.usage.character_count) >= 100000) break;
        DEEPL_AUTH_KEY_LIST.shift();
      }

      break;
    }
    case Translators.GOOGLE_TRANSLATE: {
      currentTranslator = new GoogleTranslate();
      break;
    }
    case Translators.PAPAGO: {
      currentTranslator = new Papago(UUID);
      break;
    }
    case Translators.WEBNOVEL_GOOGLE_TRANSLATE: {
      currentTranslator = new WebNovelGoogleTranslate();
      break;
    }
    default: {
      currentTranslator = new MicrosoftTranslator($toneSelect.val());
      break;
    }
  }

  loadLangSelectOptions($(this).val());
});

$toneSelect.on('change', () => {
  const $activeTranslator = $translatorDropdown.find('.active');
  if ($activeTranslator.val() === Translators.MICROSOFT_TRANSLATOR) $activeTranslator.click();
});
