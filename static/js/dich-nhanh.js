'use strict';

const sourceLanguage = $('#source-language');
const targetLanguage = $('#target-language');

const translateButton = $('#translateButton');

const queryTextCounter = $('#queryTextCounter');
const copyButton = $('#copyButton');
const pasteButton = $('#pasteButton');
const retranslateButton = $('#retranslateButton');
const translateTimer = $('#translateTimer');

const queryText = $('#queryText');
const translatedTextArea = $('#translatedText');

const options = $('.option');
const translatorOptions = $('.translator-option');

const flexSwitchCheckGlossary = $('#flexSwitchCheckGlossary');

const fontOptions = $('.font-option');
const fontSizeDisplay = $('#font-size-display');
const fontSize = $('#font-size');
const lineSpacingDisplay = $('#line-spacing-display');
const lineSpacing = $('#line-spacing');
const translators = $('.translator');
const flexSwitchCheckShowOriginal = $('#flexSwitchCheckShowOriginal');
const inputVietphrase = $('#inputVietphrase');
const translationAlgorithm = $('input[name="flexRadioTranslationAlgorithm"]');
const multiplicationAlgorithm = $('input[name="flexRadioMultiplicationAlgorithm"]');

let translator = JSON.parse(localStorage.getItem('translator'));

const DEEPL_AUTH_KEY = 'a4b25ba2-b628-fa56-916e-b323b16502de:fx';
const GOOGLE_API_KEY = 'AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw';

const uuid = crypto.randomUUID();

const VietphraseData = {
  pinyins: {},
  chinesePhienAmWords: {},
  vietphrases: {},
  pronouns: {},
  cacLuatnhan: {}
};

let translateAbortController = null;
let prevTranslation = [];
let prevScrollTop;

$(document).ready(async () => {
  try {
    let pinyinList = [];

    await $.get('/static/datasource/Unihan_Readings.txt').done((data) => {
      pinyinList = data.split(/\r?\n/).filter((element) => element.startsWith('U+')).map((element) => element.substring(2).split(/\t/)).map(([first, second]) => [
        String.fromCodePoint(parseInt(first, 16)),
        second
      ]);
      VietphraseData.pinyins = Object.fromEntries(pinyinList);
    });
    await $.get('/static/datasource/Bính âm.txt').done((data) => pinyinList = [
      ...pinyinList,
      ...data.split(/\r?\n/).map((element) => element.split('=')).sort((a, b) => b[0].length - a[0].length).map(([first, second]) => [
        first,
        second.split('ǀ')[0]
      ]).filter(([first]) => !VietphraseData.pinyins.hasOwnProperty(first))
    ]);
    pinyinList = pinyinList.filter(([first, second]) => first !== '' && second != undefined && !pinyinList[first] && (pinyinList[first] = 1), {});
    VietphraseData.pinyins = Object.fromEntries(pinyinList);
    console.log('Đã tải xong bộ dữ liệu bính âm (%d)!', pinyinList.length);
  } catch (error) {
    console.error('Không thể tải bộ dữ liệu bính âm:', error);
    setTimeout(() => window.location.reload(), 5000);
  }

  try {
    let chinesePhienAmWordList = [
      ...specialSinovietnameseData.map(([first, second, third]) => [
        first,
        (Object.fromEntries(specialSinovietnameseData.filter(([, second]) => !/\p{sc=Hani}/u.test(second)).map(([first, second, third]) => [
          first,
          third ?? second
        ]))[second] ?? third ?? second).split(', ')[0].toLowerCase()
      ]),
      ...hanData.names.map(([first, second]) => [
        first,
        second.split(',').filter((element) => element.length > 0)[0]
      ])
    ];

    await $.get('/static/datasource/ChinesePhienAmWords của thtgiang.txt').done((data) => {
      chinesePhienAmWordList = [
        ...chinesePhienAmWordList,
        ...data.split(/\r?\n/).map((element) => element.split('=')).filter(([first]) => !VietphraseData.chinesePhienAmWords.hasOwnProperty(first))
      ];
      VietphraseData.chinesePhienAmWords = Object.fromEntries(chinesePhienAmWordList);
    });
    await $.get('/static/datasource/TTV Translate.ChinesePhienAmWords.txt').done((data) => {
      chinesePhienAmWordList = [
        ...chinesePhienAmWordList,
        ...data.split(/\r?\n/).map((element) => element.split('=')).filter(([first]) => !VietphraseData.chinesePhienAmWords.hasOwnProperty(first))
      ];
      VietphraseData.chinesePhienAmWords = Object.fromEntries(chinesePhienAmWordList);
    });
    await $.get('/static/datasource/QuickTranslate2020 - ChinesePhienAmWords.txt').done((data) => {
      chinesePhienAmWordList = [
        ...chinesePhienAmWordList,
        ...data.split(/\r?\n/).map((element) => element.split('=')).filter(([first]) => !VietphraseData.chinesePhienAmWords.hasOwnProperty(first))
      ];
      VietphraseData.chinesePhienAmWords = Object.fromEntries(chinesePhienAmWordList);
    });
    await $.get('/static/datasource/Hán việt.txt').done((data) => chinesePhienAmWordList = [
      ...chinesePhienAmWordList,
      ...data.split(/\r?\n/).map((element) => element.split('=')).sort((a, b) => b[0].length - a[0].length).map(([first, second]) => [
        first,
        second.split('ǀ')[0]
      ]).filter(([first]) => !VietphraseData.chinesePhienAmWords.hasOwnProperty(first))
    ]);
    chinesePhienAmWordList = chinesePhienAmWordList.filter(([first, second]) => first !== '' && !/\p{sc=Latin}/u.test(first) && second != undefined && !chinesePhienAmWordList[first] && (chinesePhienAmWordList[first] = 1), {});
    newAccentData.forEach(([first, second]) => chinesePhienAmWordList = chinesePhienAmWordList.map(([first1, second1]) => [
      first1,
      second1.replace(new RegExp(first, 'gi'), second)
    ]));
    VietphraseData.chinesePhienAmWords = Object.fromEntries(chinesePhienAmWordList);
    console.log('Đã tải xong bộ dữ liệu hán việt (%d)!', chinesePhienAmWordList.length);
  } catch (error) {
    console.error('Không thể tải bộ dữ liệu hán việt:', error);
    setTimeout(() => window.location.reload(), 5000);
  }

  await $.get('/static/datasource/Pronouns.txt').done((data) => {
    VietphraseData.pronouns = Object.fromEntries(data.split(/\r?\n/).map((element) => element.split('=')).filter((element) => element.length === 2).map(([first, second]) => [
      first,
      second.split('/')[0]
    ]));
    console.log('Đã tải xong tệp Pronouns.txt (%d)!', Object.entries(VietphraseData.pronouns).length);
  }).fail((jqXHR, textStatus, errorThrown) => {
    console.error('Không tải được tệp Pronouns.txt:', errorThrown);
    setTimeout(() => window.location.reload(), 5000);
  });
  await $.get('/static/datasource/LuatNhan.txt').done((data) => {
    VietphraseData.cacLuatnhan = Object.fromEntries(data.split(/\r?\n/).map((element) => element.split('=')).filter((element) => element.length === 2));
    console.log('Đã tải xong tệp LuatNhan.txt (%d)!', Object.entries(VietphraseData.cacLuatnhan).length);
  }).fail((jqXHR, textStatus, errorThrown) => {
    console.error('Không tải được tệp LuatNhan.txt:', errorThrown);
    setTimeout(() => window.location.reload(), 5000);
  });

  if (Object.entries(VietphraseData.vietphrases).length === 0) {
    $.get('/static/datasource/VietPhrase.txt').done((data) => {
      let vietphraseList = [
        ...data.split(/\r?\n/).map((element) => element.split('=')).filter((element) => element.length === 2).map(([first, second]) => [
          first,
          second.split('/')[0].split('|')[0]
        ]), ...Object.entries(VietphraseData.chinesePhienAmWords)
      ];
      vietphraseList = vietphraseList.filter(([first, second]) => first !== '' && second != undefined && !vietphraseList[first] && (vietphraseList[first] = 1), {});
      if (inputVietphrase.prop('files') == undefined) return;
      VietphraseData.vietphrases = Object.fromEntries(vietphraseList);
      console.log('Đã tải xong tệp VietPhrase.txt (%d)!', vietphraseList.length);
    }).fail((jqXHR, textStatus, errorThrown) => {
      console.error('Không tải được tệp VietPhrase.txt:', errorThrown);
    });
  }

  queryText.trigger('input');
});
$(window).on('keydown', (event) => {
  if ($(document.activeElement).is('body')  && translatedTextArea.is(':visible')) {
    switch (event.key) {
      case 'Home':
        translatedTextArea.prop('scrollTop', 0);
        break;
      case 'End':
        translatedTextArea.prop('scrollTop', translatedTextArea.prop('scrollTopMax'));
        break;
    }
  }
});
$(visualViewport).resize((event) => $('.textarea').css('max-height', event.target.height - ((event.target.width < 1200 ? 23.28703703703703 : 40.33092037228542) / 100) * event.target.height + 'px'));
translateButton.click(function () {
  if (translateAbortController != null) {
    translateAbortController.abort();
    translateAbortController = null;
  }

  switch ($(this).text()) {
    case 'Huỷ':
      translatedTextArea.html(null);
      translatedTextArea.hide();
      queryText.show();
      retranslateButton.addClass('disabled');
      // $('#clearImageButton').removeClass('disabled');
      // $('#pasteUrlButton').removeClass('disabled');
      // $('#imageFile').removeClass('disabled');
      pasteButton.removeClass('disabled');
      copyButton.removeClass('disabled');
      $(this).text('Dịch');
      break;

    case 'Sửa':
      translatedTextArea.html(null);
      translatedTextArea.hide();
      queryText.show();
      // $('#clearImageButton').removeClass('disabled');
      // $('#pasteUrlButton').removeClass('disabled');
      // $('#imageFile').removeClass('disabled');
      retranslateButton.addClass('disabled');
      translateTimer.text(0);
      $(this).text('Dịch');
      break;

    default:
    case 'Dịch':
      if (queryText.val().length > 0) {
        $(this).text('Huỷ');
        translatedTextArea.show();
        queryText.hide();
        copyButton.addClass('disabled');
        pasteButton.addClass('disabled');
        // $('#imageFile').addClass('disabled');
        // $('#pasteUrlButton').addClass('disabled');
        // $('#clearImageButton').addClass('disabled');
        let statusText = translatedTextArea.html().split(/<br>|<\/p><p>/).map((element, index) => index === 0 ? 'Đang dịch...' + element.slice(12).replace(/./g, ' ') : element.replace(/./g, ' ')).join('<br>');
        translatedTextArea.html(statusText);
        translateAbortController = new AbortController();
        translate(queryText.val(), translateAbortController.signal).finally(() => onPostTranslate());
      }
      break;
  }
});
copyButton.on('click', () => {
  const data = translatedTextArea.is(':visible') ? prevTranslation[1] : queryText.val();
  if (data.length > 0) navigator.clipboard.writeText(data);
});
pasteButton.on('click', () => {
  navigator.clipboard.readText().then((clipText) => {
    if (clipText.length > 0) {
      translatedTextArea.prop('scrollTop', 0);
      queryText.val(clipText).trigger('input');
      retranslateButton.click();
    }
  });
});
retranslateButton.click(() => {
  prevScrollTop = translatedTextArea.prop('scrollTop');
  translateButton.text('Dịch').click();
});
queryText.on('input', () => {
  queryText.css('height', 'auto');
  queryText.css('height', queryText.prop('scrollHeight') + 'px');
  $(visualViewport).resize();
  queryTextCounter.text(queryText.val().length);
});
queryText.on('keypress', (event) => {
  if (event.shiftKey && event.key === 'Enter') translateButton.click();
});
translatedTextArea.on('dblclick', () => {
  translateButton.click();
  queryText.focus();
});
translatorOptions.change(() => {
  translator = loadTranslatorOptions();
  localStorage.setItem('translator', JSON.stringify(translator));
  prevTranslation = [];
  retranslateButton.click();
});
fontOptions.click(function () {
  fontOptions.removeClass('active');
  $(this).addClass('active');

  if (!$(this).text().includes('Mặc định')) {
    $(document.body).css('--opt-font-family', `${$(this).text().includes(' ') ? `'${$(this).text()}'` : $(this).text()}, ${$(this).data('additional-fonts') != undefined && $(this).data('additional-fonts').length > 0 ? `${$(this).text().includes(' ') ? `'${$(this).data('additional-fonts')}'` : $(this).data('additional-fonts')}, serif` : 'serif'}`);
  } else if ($(this).text() === 'Phông chữ hệ thống') {
    $(document.body).css('--opt-font-family', 'var(--system-font-family)');
  } else {
    $(document.body).css('--opt-font-family', 'Georgia, serif');
  }

  translator['font'] = $(this).text();
  localStorage.setItem('translator', JSON.stringify(translator));
});
fontSizeDisplay.on('change', function () {
  fontSize.val($(this).val() < parseInt(fontSize.attr('min')) ? fontSize.attr('min') : ($(this).val() > parseInt(fontSize.attr('max')) ? fontSize.attr('max') : $(this).val())).change();
});
fontSize.on('input', function () {
  translator[fontSize.attr('id')] = $(this).val();
  fontSizeDisplay.val(translator[fontSize.attr('id')]);
  $(document.body).css('--opt-font-size', `${1 * translator[fontSize.attr('id')] / 100}rem`);
});
fontSize.change(() => {
  fontSize.trigger('input');
  localStorage.setItem('translator', JSON.stringify(translator));
});

lineSpacingDisplay.on('change', function () {
  lineSpacing.val($(this).val() < parseInt(lineSpacing.attr('min')) ? lineSpacing.attr('min') : ($(this).val() > parseInt(lineSpacing.attr('max')) ? lineSpacing.attr('max') : $(this).val())).change();
});
lineSpacing.on('input', function () {
  translator[lineSpacing.attr('id')] = $(this).val();
  lineSpacingDisplay.val(translator[lineSpacing.attr('id')]);
  $(document.body).css('--opt-line-height', `${1 + (0.5 * translator[lineSpacing.attr('id')] / 100)}em`);
});
lineSpacing.change(() => {
  lineSpacing.trigger('input');
  localStorage.setItem('translator', JSON.stringify(translator));
});
translators.click(function () {
  if (!$(this).hasClass('disabled')) {
    const prevTranslator = translator['translator'];

    const prevSourceLanguageCode = translator['source-language'];
    const prevTargetLanguageCode = translator['target-language'];
    const prevSourceLanguageName = getSourceLanguageName(prevTranslator, prevSourceLanguageCode) ?? '';
    const prevTargetLanguageName = getTargetLanguageName(prevTranslator, prevTargetLanguageCode) ?? '';

    translators.removeClass('active');
    $(this).addClass('active');

    sourceLanguage.html(getSourceLanguageOptions($(this).data('id')));
    const sourceLangSelectOptions = $('#source-language > option');
    sourceLangSelectOptions.each(function (index) {
      if (translators.filter($('.active')).data('id') === prevTranslator && prevSourceLanguageCode != null) {
        sourceLanguage.val(prevSourceLanguageCode);
        return false;
      } else if (prevSourceLanguageCode != null && (prevSourceLanguageName != null && $(this).text().replace(/[()]/g, '') === prevSourceLanguageName.replace(/[()]/g, '') || $(this).val().toLowerCase().split('_')[0] === prevSourceLanguageCode.toLowerCase().split('_')[0] || (prevSourceLanguageName != null && $(this).text().includes($(this).text().split(' ').length === 2 && prevSourceLanguageName.split(' ').length === 2 ? prevSourceLanguageName.replace(/[()]/g, '').split(' ')[1] : prevSourceLanguageName.replace(/[()]/g, '').split(' ')[0]) && $(this).val().toLowerCase().split('_')[0].split('-')[0] === prevSourceLanguageCode.toLowerCase().split('_')[0].split('-')[0]) || ($(this).val().toLowerCase().split('_')[0].split('-')[0] === prevSourceLanguageCode.toLowerCase().split('_')[0].split('-')[0]))) {
        if (translators.filter($('.active')).data('id') === Translators.LINGVANEX && (prevSourceLanguageName === 'EN' || prevSourceLanguageName === 'en')) {
          targetLanguage.val(Lingvanex.Language.filter((element) => element.codeName === 'English (USA)')[0].full_code);
        } else {
          sourceLanguage.val($(this).val());
        }
        return false;
      } else if (index + 1 === sourceLangSelectOptions.length) {
        sourceLanguage.val(getDefaultSourceLanguage(translators.filter($('.active')).data('id')));
      }
    });
    targetLanguage.html(getTargetLanguageOptions($(this).data('id')));
    const targetLangSelectOptions = $('#target-language > option');
    targetLangSelectOptions.each(function (index) {
      if (translators.filter($('.active')).data('id') === prevTranslator && prevTargetLanguageCode != null) {
        targetLanguage.val(prevTargetLanguageCode);
        return false;
      } else if (prevTargetLanguageCode != null && (prevTargetLanguageName != null && $(this).text().replace(/[()]/g, '') === prevTargetLanguageName.replace(/[()]/g, '') || $(this).val().toLowerCase().split('_')[0] === prevTargetLanguageCode.toLowerCase().split('_')[0] || (prevTargetLanguageName != null && $(this).text().includes($(this).text().split(' ').length === 2 && prevTargetLanguageName.split(' ').length === 2 ? prevTargetLanguageName.replace(/[()]/g, '').split(' ')[1] : prevTargetLanguageName.replace(/[()]/g, '').split(' ')[0]) && $(this).val().toLowerCase().split('_')[0].split('-')[0] === prevTargetLanguageCode.toLowerCase().split('_')[0].split('-')[0]) || ($(this).val().toLowerCase().split('_')[0].split('-')[0] === prevTargetLanguageCode.toLowerCase().split('_')[0].split('-')[0]))) {
        if (translators.filter($('.active')).data('id') === Translators.DEEPL_TRANSLATOR && (prevTargetLanguageCode === 'en_US' || prevTargetLanguageCode === 'en')) {
          targetLanguage.val(DeepLTranslator.TargetLanguage.filter((element) => element.name === 'English')[0].language);
        } else if (translators.filter($('.active')).data('id') === Translators.LINGVANEX && (prevTargetLanguageCode === 'EN-US' || prevTargetLanguageCode === 'en')) {
          targetLanguage.val(Lingvanex.Language.filter((element) => element.codeName === 'English (USA)')[0].full_code);
        } else {
          targetLanguage.val($(this).val());
        }
        return false;
      } else if (index + 1 === targetLangSelectOptions.length) {
        targetLanguage.val(getDefaultTargetLanguage(translators.filter($('.active')).data('id')));
      }
    });

    translator['translator'] = $(this).data('id');

    for (let i = 0; i < translatorOptions.length; i++) {
      if (translatorOptions.filter(`:eq(${i})`).attr('id') === 'source-language') {
        translator[translatorOptions.filter(`:eq(${i})`).attr('id')] = translatorOptions.filter(`:eq(${i})`).val();
      } else if (translatorOptions[i].id === 'target-language') {
        translator[translatorOptions.filter(`:eq(${i})`).attr('id')] = translatorOptions.filter(`:eq(${i})`).val();
      }
    }

    localStorage.setItem('translator', JSON.stringify(translator));
    prevTranslation = [];
    retranslateButton.click();
  }
});
inputVietphrase.on('change', function () {
  const reader = new FileReader();
  reader.onload = function () {
    let vietphraseList = this.result.split(/\r?\n/).map((element) => element.split(inputVietphrase.prop('files')[0].type === 'text/tab-separated-values' ? '\t' : '=')).filter((element) => element.length === 2).map(([first, second]) => [
      first,
      second.split('/')[0].split('|')[0]
    ]);
    vietphraseList = [
      ...vietphraseList,
      ...Object.entries(VietphraseData.chinesePhienAmWords)
    ].filter(([first, second]) => first !== '' && second != undefined && !vietphraseList[first] && (vietphraseList[first] = 1), {})
    VietphraseData.vietphrases = Object.fromEntries(vietphraseList);
    console.log('Đã tải xong tệp VietPhrase.txt (%d)!', vietphraseList.length);
    prevTranslation = [];
  };
  reader.readAsText($(this).prop('files')[0]);
});

function loadTranslatorOptions() {
  try {
    const data = {};
    data['font'] = fontOptions.filter($('.active')).text();
    data['translator'] = translators.filter($('.active')).data('id');

    for (let i = 0; i < options.length; i++) {
      if (options.filter(`:eq(${i})`).attr('id').startsWith('flexSwitchCheck') && options.filter(`:eq(${i})`).prop('checked') === true) {
        data[options.filter(`:eq(${i})`).attr('id')] = options.filter(`:eq(${i})`).prop('checked');
      } else if (options.filter(`:eq(${i})`).attr('name') != undefined && options.filter(`:eq(${i})`).attr('name').startsWith('flexRadio') && options.filter(`:eq(${i})`).prop('checked') === true) {
        data[options.filter(`:eq(${i})`).attr('name')] = options.filter(`:eq(${i})`).val();
      } else if (options.filter(`:eq(${i})`).hasClass('form-range')) {
        data[options.filter(`:eq(${i})`).attr('id')] = options.filter(`:eq(${i})`).val();
      } else if (options.filter(`:eq(${i})`).hasClass('form-select')) {
        data[options.filter(`:eq(${i})`).attr('id')] = options.filter(`:eq(${i})`).val();
      }
    }
    return data;
  } catch (error) {
    console.error(error);
    throw error.toString();
  }
}

function getDefaultSourceLanguage(translator) {
  switch (translator) {
    case Translators.DEEPL_TRANSLATOR:
    case Translators.LINGVANEX:
    case Translators.MICROSOFT_TRANSLATOR:
      return '';

    case Translators.VIETPHRASE:
      return 'zh';

    default:
      return 'auto';
  }
}

function getDefaultTargetLanguage(translator) {
  switch (translator) {
    case Translators.DEEPL_TRANSLATOR:
      return 'EN-US';

    case Translators.LINGVANEX:
      return 'vi_VN';

    default:
      return 'vi';
  }
}

function getSourceLanguageName(translator, languageCode) {
  let languageName = '';

  switch (translator) {
    case Translators.DEEPL_TRANSLATOR:
      for (const language of DeepLTranslator.SourceLanguage) {
        if (language.language === languageCode) {
          languageName = language.name;
          break;
        }
      }
      break;

    case Translators.LINGVANEX:
      for (const language of Lingvanex.Language) {
        if (language.full_code === languageCode) {
          languageName = language.codeName.replace('Tiếng ', '');
          break;
        }
      }
      break;

    case Translators.MICROSOFT_TRANSLATOR:
      languageName = MicrosoftTranslator.Language[languageCode] != undefined ? MicrosoftTranslator.Language[languageCode].name.replace('Tiếng ', '') : '';
      break;

    case Translators.PAPAGO:
      languageName = Papago.Language[languageCode] ?? '';
      break;

    default:
    case Translators.GOOGLE_TRANSLATE:
      languageName = GoogleTranslate.SourceLanguage[languageCode] ?? '';
      break;
  }

  return languageName;
}

function getTargetLanguageName(translator, languageCode) {
  let languageName = '';

  switch (translator) {
    case Translators.DEEPL_TRANSLATOR:
      for (const language of DeepLTranslator.TargetLanguage) {
        if (language.language === languageCode) {
          languageName = language.name;
          break;
        }
      }
      break;

    case Translators.LINGVANEX:
      for (const language of Lingvanex.Language) {
        if (language.full_code === languageCode) {
          languageName = language.codeName.replace('Tiếng ', '');
          break;
        }
      }
      break;

    case Translators.PAPAGO:
      languageName = Papago.Language[languageCode] ?? '';
      break;

    case Translators.MICROSOFT_TRANSLATOR:
      languageName = MicrosoftTranslator.Language[languageCode] != undefined ? MicrosoftTranslator.Language[languageCode].name.replace('Tiếng ', '') : '';
      break;

    default:
    case Translators.GOOGLE_TRANSLATE:
      languageName = GoogleTranslate.TargetLanguage[languageCode] ?? '';
      break;
  }

  return languageName;
}

function getSourceLanguageOptions(translator) {
  const sourceLanguageSelect = document.createElement('select');
  const autoDetectOption = document.createElement('option');

  switch (translator) {
    case Translators.DEEPL_TRANSLATOR:
      autoDetectOption.innerText = 'Detect language';
      autoDetectOption.value = '';
      sourceLanguageSelect.appendChild(autoDetectOption);

      for (const language of DeepLTranslator.SourceLanguage) {
        const option = document.createElement('option');
        option.innerText = language.name;
        option.value = language.language;
        sourceLanguageSelect.appendChild(option);
      }
      break;

    case Translators.LINGVANEX:
      autoDetectOption.innerText = '';
      autoDetectOption.value = '';
      sourceLanguageSelect.appendChild(autoDetectOption);

      for (const language of Lingvanex.Language) {
        const option = document.createElement('option');
        option.innerText = language.codeName.replace('Tiếng ', '');
        option.value = language.full_code;
        sourceLanguageSelect.appendChild(option);
      }
      break;

    case Translators.PAPAGO:
      autoDetectOption.innerText = 'Phát hiện ngôn ngữ';
      autoDetectOption.value = 'auto';
      sourceLanguageSelect.appendChild(autoDetectOption);

      for (const langCode in Papago.Language) {
        const option = document.createElement('option');
        option.innerText = Papago.Language[langCode];
        option.value = langCode;
        sourceLanguageSelect.appendChild(option);
      }
      break;

    case Translators.MICROSOFT_TRANSLATOR:
      autoDetectOption.innerText = 'Tự phát hiện';
      autoDetectOption.value = '';
      sourceLanguageSelect.appendChild(autoDetectOption);

      for (const langCode in MicrosoftTranslator.Language) {
        const option = document.createElement('option');
        option.innerText = MicrosoftTranslator.Language[langCode].name.replace('Tiếng ', '');
        option.value = langCode;
        sourceLanguageSelect.appendChild(option);
      }
      break;

    case Translators.VIETPHRASE:
      autoDetectOption.innerText = 'Trung';
      autoDetectOption.value = 'zh';
      sourceLanguageSelect.appendChild(autoDetectOption);
      break;

    default:
    case Translators.GOOGLE_TRANSLATE:
      for (const langCode in GoogleTranslate.SourceLanguage) {
        const option = document.createElement('option');
        option.innerText = GoogleTranslate.SourceLanguage[langCode];
        option.value = langCode;
        sourceLanguageSelect.appendChild(option);
      }
      break;
  }
  return sourceLanguageSelect.innerHTML;
}

function getTargetLanguageOptions(translator) {
  const targetLanguageSelect = document.createElement('select');

  switch (translator) {
    case Translators.DEEPL_TRANSLATOR:
      for (const language of DeepLTranslator.TargetLanguage) {
        const option = document.createElement('option');
        option.innerText = language.name;
        option.value = language.language;
        targetLanguageSelect.appendChild(option);
      }
      break;

    case Translators.LINGVANEX:
      for (const language of Lingvanex.Language) {
        const option = document.createElement('option');
        ;option.innerText = language.codeName.replace('Tiếng ', '');
        option.value = language.full_code;
        targetLanguageSelect.appendChild(option);
      }
      break;

    case Translators.PAPAGO:
      for (const langCode in Papago.Language) {
        const option = document.createElement('option');
        option.innerText = Papago.Language[langCode];
        option.value = langCode;
        targetLanguageSelect.appendChild(option);
      }
      break;

    case Translators.MICROSOFT_TRANSLATOR:
      for (const langCode in MicrosoftTranslator.Language) {
        const option = document.createElement('option');
        option.innerText = MicrosoftTranslator.Language[langCode].name.replace('Tiếng ', '');
        option.value = langCode;
        targetLanguageSelect.appendChild(option);
      }
      break;

    case Translators.VIETPHRASE:
      const pinyinOption = document.createElement('option');
      const sinovietnameseOption = document.createElement('option');
      const vietphraseOption = document.createElement('option');
      pinyinOption.innerText = 'Bính âm';
      pinyinOption.value = 'en';
      targetLanguageSelect.appendChild(pinyinOption);
      sinovietnameseOption.innerText = 'Hán việt';
      sinovietnameseOption.value = 'zh-VN';
      targetLanguageSelect.appendChild(sinovietnameseOption);
      vietphraseOption.innerText = 'Vietphrase';
      vietphraseOption.value = 'vi';
      targetLanguageSelect.appendChild(vietphraseOption);
      break;

    default:
    case Translators.GOOGLE_TRANSLATE:
      for (const langCode in GoogleTranslate.TargetLanguage) {
        const option = document.createElement('option');
        option.innerText = GoogleTranslate.TargetLanguage[langCode];
        option.value = langCode;
        targetLanguageSelect.appendChild(option);
      }
      break;
  }
  return targetLanguageSelect.innerHTML;
}

async function translate(inputText, abortSignal) {
  const startTime = Date.now();

  const translator = translators.filter($('.active')).data('id');
  inputText = inputText.split(/\r?\n/).map((element) => element.trimStart()).join('\n');

  const srcLang = sourceLanguage.val();
  const tgtLang = targetLanguage.val();

  const errorMessage = document.createElement('p');

  try {
    const processText = getProcessTextPreTranslate(inputText);
    let results = [];

    let MAX_LENGTH;
    let MAX_LINE;

    switch (translator) {
      case Translators.DEEPL_TRANSLATOR:
        MAX_LENGTH = 32768;
        MAX_LINE = 50;
        break;

      case Translators.GOOGLE_TRANSLATE:
        MAX_LENGTH = 16272;
        MAX_LINE = 100;
        break;

      case Translators.LINGVANEX:
        MAX_LENGTH = 10000;
        MAX_LINE = processText.split(/\n/).length;
        break;

      case Translators.PAPAGO:
        MAX_LENGTH = 3000;
        MAX_LINE = 1500;
        break;

      case Translators.MICROSOFT_TRANSLATOR:
        MAX_LENGTH = 50000;
        MAX_LINE = 1000;
        break;

      default:
        MAX_LENGTH = getGlossaryAppliedText(processText, translator).length;
        MAX_LINE = processText.split(/\n/).length;
        break;
    }

    if (!abortSignal.aborted && getGlossaryAppliedText(processText, translator).split(/\n/).sort((a, b) => b.length - a.length)[0].length > MAX_LENGTH) {
      errorMessage.innerText = `Bản dịch thất bại: Số lượng từ trong một dòng quá dài (Số lượng từ hợp lệ nhỏ hơn hoặc bằng ${MAX_LENGTH}). [Lưu ý: Khi sử dụng Dynamic Dictionary và Bảo vệ dấu trích đẫn sẽ làm giảm số lượng từ có thể dịch đi.]`;
      translatedTextArea.append(errorMessage);
      onPostTranslate();
      translateAbortController.abort();
    }

    if (abortSignal.aborted) return;

    if (getGlossaryAppliedText(processText, translator) !== prevTranslation[0]) {
      if (!abortSignal.aborted && translator === Translators.DEEPL_TRANSLATOR) {
        const deeplUsage = (await $.get('https://api-free.deepl.com/v2/usage?auth_key=' + DEEPL_AUTH_KEY)) ?? {
          'character_count': 500000,
          'character_limit': 500000,
        };

        if (processText.length > (deeplUsage.character_limit - deeplUsage.character_count)) {
          errorMessage.innerText = `Lỗi DeepL: Đã đạt đến giới hạn dịch của tài khoản. (${deeplUsage.character_count}/${deeplUsage.character_limit} ký tự). [Lưu ý: Khi sử dụng Dynamic Dictionary và Bảo vệ dấu trích đẫn sẽ làm giảm số lượng từ có thể dịch đi.]`;
          translatedTextArea.html(errorMessage);
          onPostTranslate();
          translateAbortController.abort();
        }
      }

      const googleTranslateData = !abortSignal.aborted && translator === Translators.GOOGLE_TRANSLATE ? await GoogleTranslate.getData(translator, GOOGLE_API_KEY) : null;

      if (!abortSignal.aborted && translator === Translators.GOOGLE_TRANSLATE && (googleTranslateData.v == undefined || GoogleTranslate.kq == undefined)) {
        errorMessage.innerText = 'Không thể lấy được Log ID hoặc Token từ element.js.';
        translatedTextArea.html(errorMessage);
        translateAbortController.abort()
        return;
      }

      const lingvanexAuthKey = !abortSignal.aborted && translator === Translators.LINGVANEX ? await Lingvanex.getAuthKey(translator) : null;

      if (!abortSignal.aborted && translator === Translators.LINGVANEX && lingvanexAuthKey == undefined) {
        errorMessage.innerText = 'Không thể lấy được Khoá xác thực từ từ api-base.js.';
        translatedTextArea.html(errorMessage);
        translateAbortController.abort();
        return;
      }

      const papagoVersion = !abortSignal.aborted && translator === Translators.PAPAGO ? await Papago.getVersion(translator) : null;

      if (!abortSignal.aborted && translator === Translators.PAPAGO && papagoVersion == undefined) {
        errorMessage.innerText = 'Không thể lấy được Thông tin phiên bản từ main.js.';
        translatedTextArea.html(errorMessage);
        translateAbortController.abort();
        return;
      }

      const microsoftTranslatorAccessToken = !abortSignal.aborted && translator === Translators.MICROSOFT_TRANSLATOR ? await MicrosoftTranslator.getAccessToken(translator) : null;

      if (!abortSignal.aborted && translator === Translators.MICROSOFT_TRANSLATOR && microsoftTranslatorAccessToken == undefined) {
        errorMessage.innerText = 'Không thể lấy được Access Token từ máy chủ.';
        translatedTextArea.html(errorMessage);
        translateAbortController.abort();
        return;
      }

      const queryLines = processText.split(/\n/);
      let translateLines = [];

      let canTranslate = false;
      let tc = -1;

      if (abortSignal.aborted) return;

      for (let i = 0; i < processText.split(/\n/).length; i++) {
        if (abortSignal.aborted) return;
        if (translateLines.join('\n').length < MAX_LENGTH && translateLines.length < MAX_LINE) {
          translateLines.push(queryLines.shift());

          if (canTranslate === false && (queryLines.length === 0 || translateLines.length >= MAX_LINE || translateLines.join('\n').length >= MAX_LENGTH)) {
            if (translateLines.join('\n').length > MAX_LENGTH || translateLines.length > MAX_LINE) {
              queryLines.splice(0, 0, translateLines.pop());
              i--;
            }

            if (translateLines.length <= MAX_LINE && translateLines.join('\n').length <= MAX_LENGTH) canTranslate = true;
          }
        }

        if (canTranslate && translateLines.length > 0) {
          const translateText = translateLines.join('\n');
          let translatedText;
          tc++;

          switch (translator) {
            case Translators.DEEPL_TRANSLATOR:
              translatedText = await DeepLTranslator.translateText(DEEPL_AUTH_KEY, translateText, srcLang, tgtLang, true);
              break;

            default:
            case Translators.GOOGLE_TRANSLATE:
              translatedText = await GoogleTranslate.translateText(googleTranslateData, translateText, srcLang, tgtLang, true, tc);
              break;

            case Translators.LINGVANEX:
              translatedText = await Lingvanex.translateText(lingvanexAuthKey, translateText, srcLang, tgtLang, true);
              break;

            case Translators.PAPAGO:
              translatedText = await Papago.translateText(papagoVersion, translateText, srcLang, tgtLang, true);
              break;

            case Translators.MICROSOFT_TRANSLATOR:
              translatedText = await MicrosoftTranslator.translateText(microsoftTranslatorAccessToken, translateText, srcLang, tgtLang, true);
              break;

            case Translators.VIETPHRASE:
              if (targetLanguage.val() === 'vi' && Object.keys(VietphraseData.vietphrases).length > 0) {
                translatedText = convertText(translateText, VietphraseData.vietphrases, true, flexSwitchCheckGlossary.prop('checked'), translationAlgorithm.filter(':checked').val(), multiplicationAlgorithm.filter(':checked').val());
              } else if (targetLanguage.val() === 'zh-VN' && Object.keys(VietphraseData.chinesePhienAmWords).length > 0) {
                translatedText = convertText(translateText, VietphraseData.chinesePhienAmWords, true, false, VietPhraseTranslationAlgorithms.PRIORITIZE_LONG_VIETPHRASE_CLUSTERS, VietPhraseMultiplicationAlgorithm.NOT_APPLICABLE);
              } else if (targetLanguage.val() === 'en' && Object.keys(VietphraseData.pinyins).length > 0) {
                translatedText = convertText(translateText, VietphraseData.pinyins, true, false, VietPhraseTranslationAlgorithms.PRIORITIZE_LONG_VIETPHRASE_CLUSTERS, VietPhraseMultiplicationAlgorithm.NOT_APPLICABLE);
              } else if (targetLanguage.val() === 'vi' && Object.keys(VietphraseData.vietphrases).length === 0) {
                errorMessage.innerHTML = 'Nhập tệp VietPhrase.txt nếu có hoặc tải về <a href="https://drive.google.com/drive/folders/0B6fxcJ5qbXgkeTJNTFJJS3lmc3c?resourcekey=0-Ych2OUVug3pkLgCIlzvcuA&usp=sharing">tại đây</a>.';
                translatedTextArea.html(errorMessage);
                onPostTranslate();
                translateAbortController.abort();
              }
              break;
          }

          if (abortSignal.aborted) return;
          results.push(translatedText);
          translateLines = [];
          canTranslate = false;
        }
      }

      if (abortSignal.aborted) return;
      translateTimer.text(Date.now() - startTime);
      prevTranslation = [
        getGlossaryAppliedText(processText, translator),
        results,
        translateTimer.text()
      ];
    } else {
      results = prevTranslation[1];
      translateTimer.text(prevTranslation[2]);
    }

    if (abortSignal.aborted) return;
    translatedTextArea.html(buildTranslatedResult([
      inputText,
      processText
    ], getProcessTextPostTranslate(results.join('\n')), flexSwitchCheckShowOriginal.prop('checked')));
  } catch (error) {
    console.error('Bản dịch thất bại:', Object.keys(error).length > 0 ? error : error.toString());
    errorMessage.innerText = 'Bản dịch thất bại: ' + Object.keys(error).length > 0 ? JSON.stringify(error) : error.toString();
    translatedTextArea.html(errorMessage);
    onPostTranslate();
  }

  translateAbortController = null;
}

function getGlossaryAppliedText(text, translator, glossary = {}) {
  if (Object.keys(glossary).length === 0) glossary = globalThis.glossary;
  const glossaryEntries = Object.entries(glossary).filter(([first]) => text.includes(first));
  let newText = text;

  if (flexSwitchCheckGlossary.prop('checked') && glossaryEntries.length > 0) {
    const lines = text.split(/\n/);
    const results = [];

    for (let i = 0; i < lines.length; i++) {
      let chars = lines[i];

      const glossaryLengths = [
        ...glossaryEntries.map(([first]) => first.length),
        1
      ].sort((a, b) => b - a).filter((element, index, array) => index === array.indexOf(element));
      let tempLine = '';
      let prevPhrase = '';

      for (let j = 0; j < chars.length; j++) {
        for (const glossaryLength of glossaryLengths) {
          if (glossary.hasOwnProperty(chars.substring(j, j + glossaryLength))) {
            if (glossary[chars.substring(j, j + glossaryLength)].length > 0) {
              tempLine += (/[\\p{Lu}\\p{Ll}\\p{Nd}]/u.test(prevPhrase || tempLine[tempLine.length - 1]) ? ' ' : '') + getIgnoreTranslationMarkup([
                chars.substring(j, j + glossaryLength),
                glossary[chars.substring(j, j + glossaryLength)]
              ], translator);
              prevPhrase = glossary[chars.substring(j, j + glossaryLength)];
            }

            j += glossaryLength - 1;
            break;
          } else if (glossaryLength === 1) {
            tempLine += chars[j];
            prevPhrase = '';
            break;
          }
        }
      }

      results.push(tempLine);
    }

    newText = results.join('\n');
  }
  return newText;
}

function buildTranslatedResult(inputTexts, result, showOriginal) {
  const resultDiv = document.createElement('div');

  const inputLines = convertTextToHtml(inputTexts[0]).split(/\n/);
  const processLines = convertTextToHtml(convertText(inputTexts[1], {}, false, false, VietPhraseTranslationAlgorithms.TRANSLATE_FROM_LEFT_TO_RIGHT, VietPhraseMultiplicationAlgorithm.NOT_APPLICABLE).split(/\n/));
  const resultLines = convertTextToHtml(result).split(/\n/);

  try {
    if (showOriginal) {
      let lostLineFixedAmount = 0;

      for (let i = 0; i < inputLines.length; i++) {
        if (i < resultLines.length) {
          if (inputLines[i + lostLineFixedAmount].trim().length === 0 && resultLines[i].trim().length > 0) {
            lostLineFixedAmount++;
            i--;
            continue;
          } else if (translators.filter($('.active')).data('id') === Translators.PAPAGO && resultLines[i].trim().length === 0 && inputLines[i + lostLineFixedAmount].trim().length > 0) {
            lostLineFixedAmount--;
            continue;
          }

          const paragraph = document.createElement('p');
          paragraph.innerHTML = resultLines[i] !== processLines[i + lostLineFixedAmount] ? `<i>${inputLines[i + lostLineFixedAmount]}</i><br>${resultLines[i]}` : processLines[i + lostLineFixedAmount];
          resultDiv.appendChild(paragraph);
        } else if (i + lostLineFixedAmount < inputLines.length) {
          const paragraph = document.createElement('p');
          paragraph.innerHTML = `<i>${inputLines[i + lostLineFixedAmount]}</i>`;
          resultDiv.appendChild(paragraph);
        }
      }
    } else {
      resultDiv.innerHTML = `<p>${resultLines.join('</p><p>')}</p>`;
    }
  } catch (error) {
    resultDiv.innerHTML = `<p>${resultLines.join('</p><p>')}</p>`;
    console.error('Lỗi hiển thị bản dịch:', error.stack);
    throw error.toString();
  }
  return resultDiv.innerHTML.replace(/(<p>)(<\/p>)/g, '$1<br>$2');
}

function convertText(inputText, data, caseSensitive, useGlossary, translationAlgorithm = VietPhraseTranslationAlgorithms.PRIORITIZE_LONG_VIETPHRASE_CLUSTERS, multiplicationAlgorithm = VietPhraseMultiplicationAlgorithm.MULTIPLICATION_BY_PRONOUNS_NAMES) {
  try {
    let glossaryEntries = Object.entries(glossary).filter(([first]) => inputText.includes(first));
    let dataEntries = Object.entries(data).filter(([first]) => inputText.includes(first));
    if (multiplicationAlgorithm > VietPhraseMultiplicationAlgorithm.NOT_APPLICABLE) {
      for (const luatnhan in VietphraseData.cacLuatnhan) {
        let luatnhanData = [];

        if (useGlossary && multiplicationAlgorithm == VietPhraseMultiplicationAlgorithm.MULTIPLICATION_BY_PRONOUNS_NAMES && glossaryEntries.length > 0) {

          for (const element in glossary) {
            luatnhanData.push([
              luatnhan.replace(/\{0}/g, getRegexEscapedReplacement(element)),
              VietphraseData.cacLuatnhan[luatnhan].replace(/\{0}/g, getRegexEscapedReplacement(glossary[element]))
            ]);
          }
        }

        glossaryEntries = [...luatnhanData, ...glossaryEntries];

        for (const pronoun in VietphraseData.pronouns) {
          luatnhanData.push([
            luatnhan.replace(/\{0}/g, getRegexEscapedReplacement(pronoun)),
            VietphraseData.cacLuatnhan[luatnhan].replace(/\{0}/g, getRegexEscapedReplacement(VietphraseData.pronouns[pronoun]))
          ]);
        }

        dataEntries = [...luatnhanData, ...dataEntries];
      }
    }

    glossaryEntries = glossaryEntries.sort((a, b) => b[0].length - a[0].length);
    dataEntries = [
      ...translationAlgorithm === VietPhraseTranslationAlgorithms.PRIORITIZE_LONG_VIETPHRASE_CLUSTERS && useGlossary ? glossaryEntries : [],
      ...dataEntries.sort((a, b) => b[0].length - a[0].length)
    ];
    dataEntries = dataEntries.filter(([first, second]) => first !== '' && second != undefined && !dataEntries[first] && (dataEntries[first] = 1), {});
    data = translationAlgorithm === VietPhraseTranslationAlgorithms.TRANSLATE_FROM_LEFT_TO_RIGHT ? Object.fromEntries(dataEntries) : {};
    const glossaryData = Object.fromEntries(glossaryEntries);
    const punctuationEntries = cjkmap.filter(([first]) => first === '…' || first.split('…').length !== 2);
    const punctuation = Object.fromEntries(punctuationEntries);

    const results = [];
    let result = inputText;
    const lines = inputText.split(/\n/);

    for (let i = 0; i < lines.length; i++) {
      let chars = lines[i];

      if (chars.trim().length === 0) {
        results.push(chars);
        continue;
      }

      const filteredGlossaryEntries = glossaryEntries.filter(([first]) => lines[i].includes(first));
      const filteredDataEntries = dataEntries.filter(([first]) => lines[i].includes(first));
      const filteredPunctuationEntries = punctuationEntries.filter(([first]) => lines[i].includes(first) && (translationAlgorithm !== VietPhraseTranslationAlgorithms.TRANSLATE_FROM_LEFT_TO_RIGHT || !useGlossary || filteredGlossaryEntries.indexOf(first) !== -1));

      if (filteredGlossaryEntries.length === 0 && filteredDataEntries.length === 0 && filteredPunctuationEntries.length === 0) {
        results.push(chars);
        continue;
      }

      if (translationAlgorithm === VietPhraseTranslationAlgorithms.PRIORITIZE_LONG_VIETPHRASE_CLUSTERS) {
        const filteredData = Object.fromEntries(filteredDataEntries);

        for (const property in filteredData) {
          chars = chars.replace(new RegExp(`([\\p{Lu}\\p{Ll}\\p{Nd}])(${getRegexEscapedText(property)})(?=$|${getTrieRegexPatternFromWords(punctuationEntries.filter(([first]) => (/[\p{Ps}\p{Pi}\p{Po}]/u.test(first) && /[\u{3000}-\u{303f}\u{30a0}-\u{30ff}\u{fe30}-\u{fe4f}\u{ff00}-\u{ffef}]/u.test(first)) || /[\p{Pe}\p{Pf}\p{Po}]/u.test(first)).join(''))})`, 'gu'), `$1 ${getRegexEscapedReplacement(filteredData[property])}`)
                       .replace(new RegExp(`(${getRegexEscapedText(property)})(?=$|${getTrieRegexPatternFromWords(punctuationEntries.filter(([first]) => (/[\p{Ps}\p{Pi}\p{Po}]/u.test(first) && /[\u{3000}-\u{303f}\u{30a0}-\u{30ff}\u{fe30}-\u{fe4f}\u{ff00}-\u{ffef}]/u.test(first)) || /[\p{Pe}\p{Pf}\p{Po}]/u.test(first)).join(''))})`, 'g'), getRegexEscapedReplacement(filteredData[property]))
                       .replace(new RegExp(`([\\p{Lu}\\p{Ll}\\p{Nd}])(${getRegexEscapedText(property)})`, 'gu'), `$1 ${getRegexEscapedReplacement(filteredData[property])} `)
                       .replace(new RegExp(`(${getRegexEscapedText(property)})`, 'gu'), `${getRegexEscapedReplacement(filteredData[property])} `);
        }

        filteredPunctuationEntries.forEach(([first, second]) => chars = chars.replace(new RegExp(getRegexEscapedText(first), 'g'), getRegexEscapedReplacement(second)));
        results.push(chars);
      } else if (translationAlgorithm === VietPhraseTranslationAlgorithms.TRANSLATE_FROM_LEFT_TO_RIGHT) {
        const phraseLengths = [
          ...useGlossary ? filteredGlossaryEntries.map(([, second]) => second.length) : [],
          ...filteredDataEntries.map(([first]) => first.length),
          1
        ].sort((a, b) => b - a).filter((element, index, array) => index === array.indexOf(element));
        const phrases = [];
        let tempWord = '';

        chars = useGlossary ? getGlossaryAppliedText(chars, Translators.VIETPHRASE, glossaryData) : chars;

        for (let j = 0; j < chars.length; j++) {
          for (const phraseLength of phraseLengths) {
            if (useGlossary && filteredGlossaryEntries.map(([, second]) => second).indexOf(chars.substring(j, j + phraseLength)) !== -1) {
              if (phrases.length > 0 && ((/[\p{Pe}\p{Pf}]/u.test(chars[j - 1]) && /[\u{3000}-\u{303f}\u{30a0}-\u{30ff}\u{fe30}-\u{fe4f}\u{ff00}-\u{ffef}]/u.test(chars[j - 1])) || /[\p{Ps}\p{Pi}]/u.test(chars[j - 1]))) {
                phrases.push(phrases.pop() + chars.substring(j, j + phraseLength));
              } else {
                phrases.push(chars.substring(j, j + phraseLength));
              }

              j += phraseLength - 1;
              break;
            } else if (data.hasOwnProperty(chars.substring(j, j + phraseLength))) {
              if (data[chars.substring(j, j + phraseLength)].length > 0) {
                if (phrases.length > 0 && ((/[\p{Pe}\p{Pf}]/u.test(chars[j - 1]) && /[\u{3000}-\u{303f}\u{30a0}-\u{30ff}\u{fe30}-\u{fe4f}\u{ff00}-\u{ffef}]/u.test(chars[j - 1])) || /[\p{Ps}\p{Pi}]/u.test(chars[j - 1]))) {
                  phrases.push(phrases.pop() + data[chars.substring(j, j + phraseLength)]);
                } else {
                  phrases.push(data[chars.substring(j, j + phraseLength)]);
                }
              }

              j += phraseLength - 1;
              break;
            } else if (phraseLength === 1) {
              if (punctuation.hasOwnProperty(chars[j])) {
                if (tempWord.length === 0 && phrases.length > 0 && ((/[\p{Ps}\p{Pi}\p{Po}]/u.test(chars[j]) && /[\u{3000}-\u{303f}\u{30a0}-\u{30ff}\u{fe30}-\u{fe4f}\u{ff00}-\u{ffef}]/u.test(chars[j])) || /[\p{Pe}\p{Pf}\p{Po}]/u.test(chars[j]))) {
                  phrases.push(phrases.pop() + punctuation[chars[j]]);
                  break;
                } else {
                  tempWord += punctuation[chars[j]];
                }
              } else if (phrases.length > 0 && /[\p{Pe}\p{Pf}\p{Po}]/u.test(chars[j])) {
                phrases.push(phrases.pop() + chars[j]);
                break;
              } else {
                tempWord += chars[j];
              }

              if (tempWord.length > 0) {
                if (j + 1 === chars.length) {
                  tempWord.substring(0 + (tempWord.startsWith(' ') ? 1 : 0), tempWord.length - (tempWord.endsWith(' ') ? 1 : 0)).split(' ').forEach((element, index, array) => phrases.push(element));
                  tempWord = '';
                  break;
                } else {
                  for (const phraseLength1 of phraseLengths) {
                    if ((useGlossary && filteredGlossaryEntries.map(([, second]) => second).indexOf(chars.substring(j + 1, j + 1 + phraseLength1)) !== -1) || (data.hasOwnProperty(chars.substring(j + 1, j + 1 + phraseLength1)))) {
                      tempWord.substring(0 + (tempWord.startsWith(' ') ? 1 : 0), tempWord.length - (tempWord.endsWith(' ') ? 1 : 0)).split(' ').forEach((element, index, array) => phrases.push(element));
                      tempWord = '';
                      break;
                    }
                  }
                }
              }
            }
          }
        }

        results.push(phrases.join(' ').trimEnd());
      }
    }

    result = results.join('\n');
    return caseSensitive ? result.split(/\n/).map((element => element.replace(/(^|\s*(?:[!\-.:;?]\s+|[''\p{Ps}\p{Pi}]\s*))(\p{Ll})/gu, (match, p1, p2) => p1 + p2.toUpperCase()))).join('\n') : result;
  } catch (error) {
    console.error('Bản dịch lỗi:', error.stack);
    throw error.toString();
  }
}

function getIgnoreTranslationMarkup(text, translator) {
  switch (translator) {
    case Translators.DEEPL_TRANSLATOR:
    case Translators.GOOGLE_TRANSLATE:
 // case Translators.PAPAGO:
      return `<span translate="no">${text[1]}</span>`;

    case Translators.LINGVANEX:
      return `<notranslate>${text[1]}</notranslate>`;

    case Translators.MICROSOFT_TRANSLATOR:
      return `<mstrans:dictionary translation="${/\p{sc=Hani}/u.test(text[0]) && /\p{sc=Latn}/u.test(text[1]) ? ` ${text[1]} ` : text[1]}">${text[0]}</mstrans:dictionary>`;

    default:
      return text[1];
  }
}

function getTrieRegexPatternFromWords(words, prefix = '', suffix = '') {
  const trieData = {};

  for (const word of words) {
    let referenceData = trieData;

    for (const char of word) {
      referenceData[char] = referenceData.hasOwnProperty(char) ? referenceData[char] : {};
      referenceData = referenceData[char];
    }

    referenceData[''] = 1;
  }

  return prefix + getRegexPattern(trieData) + suffix;
}

function getRegexPattern(data) {
  if (data.hasOwnProperty('') && Object.keys(data).length === 1) return '';
  const alternation = [];
  const trie = [];
  let isNoncapturing = false;

  for (const char of Object.keys(data).sort()) {
    if (typeof data[char] === 'object') {
      let recurse = getRegexPattern(data[char]);

      if (recurse != null) {
        alternation.push(getRegexEscapedText(char) + recurse);
      } else {
        trie.push(getRegexEscapedText(char));
      }
    } else {
      isNoncapturing = true;
    }
  }

  const isTrieOnly = alternation.length === 0;

  if (trie.length > 0) {
    if (trie.length === 1) {
      alternation.push(trie[0]);
    } else {
      alternation.push(`[${trie.join('')}]`);
    }
  }

  let result = '';

  if (alternation.length === 1) {
    result = alternation[0];
  } else {
    result = `(?:${alternation.join('|')})`;
  }

  if (isNoncapturing) {
    if (isTrieOnly) {
      result += '?';
    } else {
      result = `(?:${result})?`;
    }
  }

  return result;
}

function getRegexEscapedText(text) {
  return text.replace(/[$()*+\-.\\/?[\]^{|}]/g, '\\$&');
}

function getRegexEscapedReplacement(replacement) {
  return replacement.replace(/\$/g, '$$$&');
}

function convertHtmlToText(html) {
  const paragraph = document.createElement('p');
  paragraph.innerHTML = html;
  return paragraph.innerText;
}

function convertTextToHtml(text) {
  const paragraph = document.createElement('p');
  paragraph.innerText = text;
  return paragraph.innerHTML.replace(/<br>/g, '\n');
}

function getProcessTextPreTranslate(text) {
  try {
    let newText = text;
    if (text.length > 0) {
    }
    return newText;
  } catch (error) {
    console.error('Lỗi xử lý văn bản trước khi dịch:', error.stack);
    throw error.toString();
  }
}

function getProcessTextPostTranslate(text) {
  try {
    let newText = text;
    if (text.length > 0) {
    }
    return newText;
  } catch (error) {
    console.error('Lỗi xử lý văn bản sau khi dịch:', error.stack);
    throw error.toString();
  }
}

function onPostTranslate() {
  translatedTextArea.css('height', 'auto');
  translatedTextArea.css('height', translatedTextArea.prop('scrollHeight') + 'px');
  pasteButton.removeClass('disabled');
  copyButton.removeClass('disabled');
  translators.removeClass('disabled');
  retranslateButton.removeClass('disabled');
  translateButton.text('Sửa');

  if (prevScrollTop != null) {
    translatedTextArea.prop('scrollTop', prevScrollTop);
    prevScrollTop = null;
  }
}

const DeepLTranslator = {
  translateText: async function (authKey, inputText, sourceLang, targetLang, useGlossary = false) {
    try {
      inputText = useGlossary ? getGlossaryAppliedText(convertTextToHtml(inputText), Translators.DEEPL_TRANSLATOR) : convertTextToHtml(inputText);

      const response = await $.ajax({
        url: 'https://api-free.deepl.com/v2/translate?auth_key=' + authKey,
        data: `text=${inputText.split(/\n/).map((sentence) => encodeURIComponent(sentence)).join('&text=')}${sourceLang !== '' ? '&source_lang=' + sourceLang : ''}&target_lang=${targetLang}&tag_handling=html`,
        method: 'POST'
      });
      return convertHtmlToText(response.translations.map((element) => element.text).join('\n'));
    } catch (error) {
      console.error('Bản dịch lỗi:', error.stack);
      throw error.toString();
    }
  },
  SourceLanguage: [
    {
      "language": "BG",
      "name": "Bulgarian"
    },
    {
      "language": "CS",
      "name": "Czech"
    },
    {
      "language": "DA",
      "name": "Danish"
    },
    {
      "language": "DE",
      "name": "German"
    },
    {
      "language": "EL",
      "name": "Greek"
    },
    {
      "language": "EN",
      "name": "English"
    },
    {
      "language": "ES",
      "name": "Spanish"
    },
    {
      "language": "ET",
      "name": "Estonian"
    },
    {
      "language": "FI",
      "name": "Finnish"
    },
    {
      "language": "FR",
      "name": "French"
    },
    {
      "language": "HU",
      "name": "Hungarian"
    },
    {
      "language": "ID",
      "name": "Indonesian"
    },
    {
      "language": "IT",
      "name": "Italian"
    },
    {
      "language": "JA",
      "name": "Japanese"
    },
    {
      "language": "KO",
      "name": "Korean"
    },
    {
      "language": "LT",
      "name": "Lithuanian"
    },
    {
      "language": "LV",
      "name": "Latvian"
    },
    {
      "language": "NB",
      "name": "Norwegian"
    },
    {
      "language": "NL",
      "name": "Dutch"
    },
    {
      "language": "PL",
      "name": "Polish"
    },
    {
      "language": "PT",
      "name": "Portuguese"
    },
    {
      "language": "RO",
      "name": "Romanian"
    },
    {
      "language": "RU",
      "name": "Russian"
    },
    {
      "language": "SK",
      "name": "Slovak"
    },
    {
      "language": "SL",
      "name": "Slovenian"
    },
    {
      "language": "SV",
      "name": "Swedish"
    },
    {
      "language": "TR",
      "name": "Turkish"
    },
    {
      "language": "UK",
      "name": "Ukrainian"
    },
    {
      "language": "ZH",
      "name": "Chinese"
    }
  ],
  TargetLanguage: [
    {
      "language": "BG",
      "name": "Bulgarian",
      "supports_formality": false
    },
    {
      "language": "CS",
      "name": "Czech",
      "supports_formality": false
    },
    {
      "language": "DA",
      "name": "Danish",
      "supports_formality": false
    },
    {
      "language": "DE",
      "name": "German",
      "supports_formality": true
    },
    {
      "language": "EL",
      "name": "Greek",
      "supports_formality": false
    },
    {
      "language": "EN-GB",
      "name": "English (British)",
      "supports_formality": false
    },
    {
      "language": "EN-US",
      "name": "English (American)",
      "supports_formality": false
    },
    {
      "language": "ES",
      "name": "Spanish",
      "supports_formality": true
    },
    {
      "language": "ET",
      "name": "Estonian",
      "supports_formality": false
    },
    {
      "language": "FI",
      "name": "Finnish",
      "supports_formality": false
    },
    {
      "language": "FR",
      "name": "French",
      "supports_formality": true
    },
    {
      "language": "HU",
      "name": "Hungarian",
      "supports_formality": false
    },
    {
      "language": "ID",
      "name": "Indonesian",
      "supports_formality": false
    },
    {
      "language": "IT",
      "name": "Italian",
      "supports_formality": true
    },
    {
      "language": "JA",
      "name": "Japanese",
      "supports_formality": true
    },
    {
      "language": "KO",
      "name": "Korean",
      "supports_formality": false
    },
    {
      "language": "LT",
      "name": "Lithuanian",
      "supports_formality": false
    },
    {
      "language": "LV",
      "name": "Latvian",
      "supports_formality": false
    },
    {
      "language": "NB",
      "name": "Norwegian",
      "supports_formality": false
    },
    {
      "language": "NL",
      "name": "Dutch",
      "supports_formality": true
    },
    {
      "language": "PL",
      "name": "Polish",
      "supports_formality": true
    },
    {
      "language": "PT-BR",
      "name": "Portuguese (Brazilian)",
      "supports_formality": true
    },
    {
      "language": "PT-PT",
      "name": "Portuguese (European)",
      "supports_formality": true
    },
    {
      "language": "RO",
      "name": "Romanian",
      "supports_formality": false
    },
    {
      "language": "RU",
      "name": "Russian",
      "supports_formality": true
    },
    {
      "language": "SK",
      "name": "Slovak",
      "supports_formality": false
    },
    {
      "language": "SL",
      "name": "Slovenian",
      "supports_formality": false
    },
    {
      "language": "SV",
      "name": "Swedish",
      "supports_formality": false
    },
    {
      "language": "TR",
      "name": "Turkish",
      "supports_formality": false
    },
    {
      "language": "UK",
      "name": "Ukrainian",
      "supports_formality": false
    },
    {
      "language": "ZH",
      "name": "Chinese (simplified)",
      "supports_formality": false
    }
  ]
};

const GoogleTranslate = {
  translateText: async function (data, inputText, sourceLanguage, targetLanguage, useGlossary = false, tc = 0) {
    try {
      const querys = useGlossary ? getGlossaryAppliedText(convertTextToHtml(inputText), Translators.GOOGLE_TRANSLATE).split(/\n/) : convertTextToHtml(inputText).split(/\n/);

      /**
       * Google translate Widget
       * Method: POST
       * URL: https://translate.googleapis.com/translate_a/t?anno=3&client=te&format=html&v=1.0&key&logld=v${version}&sl=${sourceLanguage}&tl=${targetLanguage}&tc=0&tk=${lq(querys, ctkk)}
       * `q=${querys.split(/\n/).map((sentence) => encodeURIComponent(sentence)).join('&q=')}`
       *
       * Google Translate
       * Method: GET
       * URL: https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage}&tl=${targetLanguage}&hl=vi&dt=t&dt=bd&dj=1&q=${encodeURIComponent(querys)}
       *
       * Google Translate Websites
       * Method: POST
       * URL: https://translate.googleapis.com/translate_a/t?anno=3&client=wt_lib&format=html&v=1.0&key=&logld=v${version}&sl=${sourceLanguage}&tl=${targetLanguage}&tc=0&tk=${lq(querys, ctkk)}
       * Content-Type: application/x-www-form-urlencoded - `q=${querys.split(/\n/).map((sentence) => encodeURIComponent(sentence)).join('&q=')}`
       *
       * Google Chrome
       * Method: POST
       * URL: https://translate.googleapis.com/translate_a/t?anno=3&client=${(_cac || 'te') + (_cam === 'lib' ? '_lib' : '')}&format=html&v=1.0&key=AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw&logld=v${v || ''}&sl=${sourceLanguage}&tl=${targetLanguage}&tc=0&tk=${lq(querys, ctkk)}
       * Content-Type: application/x-www-form-urlencoded - `q=${querys.split(/\n/).map((sentence) => encodeURIComponent(sentence)).join('&q=')}`
       */
      const response = await $.ajax({
        url: `https://translate.googleapis.com/translate_a/t?anno=3&client=${(data._cac || 'te') + (data._cam === 'lib' ? '_lib' : '')}&format=html&v=1.0&key${data.translateApiKey.length > 0 ? `=${data.translateApiKey}` : ''}&logld=v${data.v || ''}&sl=${sourceLanguage}&tl=${targetLanguage}&tc=${tc}&tk=${this.lq(querys.join(''))}`,
        data: `q=${querys.map((sentence) => encodeURIComponent(sentence)).join('&q=')}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

      return convertHtmlToText(response.map((element) => ((sourceLanguage === 'auto' ? element[0] : element).includes('<i>') ? (sourceLanguage === 'auto' ? element[0] : element).split('</i> <b>').filter((element) => element.includes('</b>')).map((element) => ('<b>' + element.replace(/<i>.+/, ''))).join(' ') : (sourceLanguage === 'auto' ? element[0] : element))).join('\n'));
    } catch (error) {
      console.error('Bản dịch lỗi:', error.stack);
      throw error.toString();
    }
  },
  getData: async function (translator, apiKey = '') {
    if (translator === Translators.GOOGLE_TRANSLATE) {
      try {
        const data = {};

        /**
         * Google translate Widget
         * URL: //translate.google.com/translate_a/element.js?cb=googleTranslateElementInit
         *
         * Google Translate Websites
         * URL: https://translate.google.com/translate_a/element.js?cb=gtElInit&hl=vi&client=wt
         *
         * Google Chrome
         * Method: GET
         * URL: https://translate.googleapis.com/translate_a/element.js?cb=cr.googleTranslate.onTranslateElementLoad&aus=true&clc=cr.googleTranslate.onLoadCSS&jlc=cr.googleTranslate.onLoadJavascript&hl=vi&key=AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw
         * Google-Translate-Element-Mode: library
         */
        const elementJs = await $.ajax({
          url: `${CORS_PROXY}https://translate.googleapis.com/translate_a/element.js?aus=true&hl=vi${apiKey.length > 0 ? `&key=${apiKey}` : ''}`,
          method: 'GET',
          headers: {
            'Google-Translate-Element-Mode': 'library'
          }
        });

        if (elementJs != undefined) {
          data.translateApiKey = apiKey;

          data._cac = elementJs.match(/c\._cac='([a-z]*)'/)[1];
          data._cam = elementJs.match(/c\._cam='([a-z]*)'/)[1];
          this.kq = elementJs.match(/c\._ctkk='(\d+\.\d+)'/)[1];
          // console.log(elementJs.match(/_loadJs\('([^']+)'\)/)[1]);
          data.v = elementJs.match(/_exportVersion\('(TE_\d+)'\)/)[1];
        }
        return data;
      } catch (error) {
        console.error('Không thể lấy được Log ID hoặc Token:' + error);
        throw error.toString()
      }
    }
  },
  Oo: function (a) {
    for (var b = [], c = 0, d = 0; d < a.length; d++) {
      var e = a.charCodeAt(d);
      128 > e ? (b[c++] = e) : (2048 > e ? (b[c++] = (e >> 6) | 192) : (55296 === (e & 64512) && d + 1 < a.length && 56320 === (a.charCodeAt(d + 1) & 64512) ? ((e = 65536 + ((e & 1023) << 10) + (a.charCodeAt(++d) & 1023)), (b[c++] = (e >> 18) | 240), (b[c++] = ((e >> 12) & 63) | 128)) : (b[c++] = (e >> 12) | 224), (b[c++] = ((e >> 6) & 63) | 128)), (b[c++] = (e & 63) | 128));
    }
    return b;
  },
  jq: function (a, b) {
    for (var c = 0; c < b.length - 2; c += 3) {
      var d = b.charAt(c + 2);
      d = "a" <= d ? d.charCodeAt(0) - 87 : Number(d);
      d = "+" === b.charAt(c + 1) ? a >>> d : a << d;
      a = "+" === b.charAt(c) ? (a + d) & 4294967295 : a ^ d;
    }
    return a;
  },
  lq: function (a) {
    var b = this.kq.split("."), c = Number(b[0]) || 0;
    a = this.Oo(a);
    for (var d = c, e = 0; e < a.length; e++) {
      (d += a[e]), (d = this.jq(d, "+-a^+6"));
    }
    d = this.jq(d, "+-3^+b+-f");
    d ^= Number(b[1]) || 0;
    0 > d && (d = (d & 2147483647) + 2147483648);
    b = d % 1e6;
    return b.toString() + "." + (b ^ c);
  },
  SourceLanguage: {
    "auto": "Phát hiện ngôn ngữ",
    "ar": "Ả Rập",
    "sq": "Albania",
    "am": "Amharic",
    "en": "Anh",
    "hy": "Armenia",
    "as": "Assam",
    "ay": "Aymara",
    "az": "Azerbaijan",
    "pl": "Ba Lan",
    "fa": "Ba Tư",
    "bm": "Bambara",
    "xh": "Bantu",
    "eu": "Basque",
    "be": "Belarus",
    "bn": "Bengal",
    "bho": "Bhojpuri",
    "bs": "Bosnia",
    "pt": "Bồ Đào Nha",
    "bg": "Bulgaria",
    "ca": "Catalan",
    "ceb": "Cebuano",
    "ny": "Chichewa",
    "co": "Corsi",
    "ht": "Creole (Haiti)",
    "hr": "Croatia",
    "dv": "Dhivehi",
    "iw": "Do Thái",
    "doi": "Dogri",
    "da": "Đan Mạch",
    "de": "Đức",
    "et": "Estonia",
    "ee": "Ewe",
    "tl": "Filipino",
    "fy": "Frisia",
    "gd": "Gael Scotland",
    "gl": "Galicia",
    "ka": "George",
    "gn": "Guarani",
    "gu": "Gujarat",
    "nl": "Hà Lan",
    "af": "Hà Lan (Nam Phi)",
    "ko": "Hàn",
    "ha": "Hausa",
    "haw": "Hawaii",
    "hi": "Hindi",
    "hmn": "Hmong",
    "hu": "Hungary",
    "el": "Hy Lạp",
    "is": "Iceland",
    "ig": "Igbo",
    "ilo": "Ilocano",
    "id": "Indonesia",
    "ga": "Ireland",
    "jw": "Java",
    "kn": "Kannada",
    "kk": "Kazakh",
    "km": "Khmer",
    "rw": "Kinyarwanda",
    "gom": "Konkani",
    "kri": "Krio",
    "ku": "Kurd (Kurmanji)",
    "ckb": "Kurd (Sorani)",
    "ky": "Kyrgyz",
    "lo": "Lào",
    "la": "Latinh",
    "lv": "Latvia",
    "ln": "Lingala",
    "lt": "Litva",
    "lg": "Luganda",
    "lb": "Luxembourg",
    "ms": "Mã Lai",
    "mk": "Macedonia",
    "mai": "Maithili",
    "mg": "Malagasy",
    "ml": "Malayalam",
    "mt": "Malta",
    "mi": "Maori",
    "mr": "Marathi",
    "mni-Mtei": "Meiteilon (Manipuri)",
    "lus": "Mizo",
    "mn": "Mông Cổ",
    "my": "Myanmar",
    "no": "Na Uy",
    "ne": "Nepal",
    "ru": "Nga",
    "ja": "Nhật",
    "or": "Odia (Oriya)",
    "om": "Oromo",
    "ps": "Pashto",
    "sa": "Phạn",
    "fr": "Pháp",
    "fi": "Phần Lan",
    "pa": "Punjab",
    "qu": "Quechua",
    "eo": "Quốc tế ngữ",
    "ro": "Rumani",
    "sm": "Samoa",
    "cs": "Séc",
    "nso": "Sepedi",
    "sr": "Serbia",
    "st": "Sesotho",
    "sn": "Shona",
    "sd": "Sindhi",
    "si": "Sinhala",
    "sk": "Slovak",
    "sl": "Slovenia",
    "so": "Somali",
    "su": "Sunda",
    "sw": "Swahili",
    "tg": "Tajik",
    "ta": "Tamil",
    "tt": "Tatar",
    "es": "Tây Ban Nha",
    "te": "Telugu",
    "th": "Thái",
    "tr": "Thổ Nhĩ Kỳ",
    "sv": "Thụy Điển",
    "ti": "Tigrinya",
    "zh-CN": "Trung",
    "ts": "Tsonga",
    "tk": "Turkmen",
    "ak": "Twi",
    "uk": "Ukraina",
    "ur": "Urdu",
    "ug": "Uyghur",
    "uz": "Uzbek",
    "vi": "Việt",
    "cy": "Xứ Wales",
    "it": "Ý",
    "yi": "Yiddish",
    "yo": "Yoruba",
    "zu": "Zulu"
  },
  TargetLanguage: {
    "ar": "Ả Rập",
    "sq": "Albania",
    "am": "Amharic",
    "en": "Anh",
    "hy": "Armenia",
    "as": "Assam",
    "ay": "Aymara",
    "az": "Azerbaijan",
    "pl": "Ba Lan",
    "fa": "Ba Tư",
    "bm": "Bambara",
    "xh": "Bantu",
    "eu": "Basque",
    "be": "Belarus",
    "bn": "Bengal",
    "bho": "Bhojpuri",
    "bs": "Bosnia",
    "pt": "Bồ Đào Nha",
    "bg": "Bulgaria",
    "ca": "Catalan",
    "ceb": "Cebuano",
    "ny": "Chichewa",
    "co": "Corsi",
    "ht": "Creole (Haiti)",
    "hr": "Croatia",
    "dv": "Dhivehi",
    "iw": "Do Thái",
    "doi": "Dogri",
    "da": "Đan Mạch",
    "de": "Đức",
    "et": "Estonia",
    "ee": "Ewe",
    "tl": "Filipino",
    "fy": "Frisia",
    "gd": "Gael Scotland",
    "gl": "Galicia",
    "ka": "George",
    "gn": "Guarani",
    "gu": "Gujarat",
    "nl": "Hà Lan",
    "af": "Hà Lan (Nam Phi)",
    "ko": "Hàn",
    "ha": "Hausa",
    "haw": "Hawaii",
    "hi": "Hindi",
    "hmn": "Hmong",
    "hu": "Hungary",
    "el": "Hy Lạp",
    "is": "Iceland",
    "ig": "Igbo",
    "ilo": "Ilocano",
    "id": "Indonesia",
    "ga": "Ireland",
    "jw": "Java",
    "kn": "Kannada",
    "kk": "Kazakh",
    "km": "Khmer",
    "rw": "Kinyarwanda",
    "gom": "Konkani",
    "kri": "Krio",
    "ku": "Kurd (Kurmanji)",
    "ckb": "Kurd (Sorani)",
    "ky": "Kyrgyz",
    "lo": "Lào",
    "la": "Latinh",
    "lv": "Latvia",
    "ln": "Lingala",
    "lt": "Litva",
    "lg": "Luganda",
    "lb": "Luxembourg",
    "ms": "Mã Lai",
    "mk": "Macedonia",
    "mai": "Maithili",
    "mg": "Malagasy",
    "ml": "Malayalam",
    "mt": "Malta",
    "mi": "Maori",
    "mr": "Marathi",
    "mni-Mtei": "Meiteilon (Manipuri)",
    "lus": "Mizo",
    "mn": "Mông Cổ",
    "my": "Myanmar",
    "no": "Na Uy",
    "ne": "Nepal",
    "ru": "Nga",
    "ja": "Nhật",
    "or": "Odia (Oriya)",
    "om": "Oromo",
    "ps": "Pashto",
    "sa": "Phạn",
    "fr": "Pháp",
    "fi": "Phần Lan",
    "pa": "Punjab",
    "qu": "Quechua",
    "eo": "Quốc tế ngữ",
    "ro": "Rumani",
    "sm": "Samoa",
    "cs": "Séc",
    "nso": "Sepedi",
    "sr": "Serbia",
    "st": "Sesotho",
    "sn": "Shona",
    "sd": "Sindhi",
    "si": "Sinhala",
    "sk": "Slovak",
    "sl": "Slovenia",
    "so": "Somali",
    "su": "Sunda",
    "sw": "Swahili",
    "tg": "Tajik",
    "ta": "Tamil",
    "tt": "Tatar",
    "es": "Tây Ban Nha",
    "te": "Telugu",
    "th": "Thái",
    "tr": "Thổ Nhĩ Kỳ",
    "sv": "Thụy Điển",
    "ti": "Tigrinya",
    "zh-CN": "Trung (Giản thể)",
    "zh-TW": "Trung (Phồn thể)",
    "ts": "Tsonga",
    "tk": "Turkmen",
    "ak": "Twi",
    "uk": "Ukraina",
    "ur": "Urdu",
    "ug": "Uyghur",
    "uz": "Uzbek",
    "vi": "Việt",
    "cy": "Xứ Wales",
    "it": "Ý",
    "yi": "Yiddish",
    "yo": "Yoruba",
    "zu": "Zulu"
  }
};

const Lingvanex = {
  translateText: async function (authToken, inputText, from, to, useGlossary = false, tc = 1) {
    try {
      inputText = useGlossary ? getGlossaryAppliedText(inputText, Translators.LINGVANEX) : inputText;

      /**
       * Lingvanex Demo
       * URL: https://api-b2b.backenster.com/b1/api/v3/translate
       * Accept: 'application/json, inputText/javascript, *()/*; q=0.01', Accept-Language: vi-VN,vi;q=0.8,en-US;q=0.5,en;q=0.3, Content-Type: application/x-www-form-urlencoded; charset=UTF-8, Authorization ${authToken} - from=${from}&to=${to}&inputText=${encodeURIComponent(inputText)}&platform=dp&is_return_text_split_ranges=true
       *
       * Brave
       * Method: POST
       * URL: https://translate.brave.com/translate_a/t?anno=3&client=te_lib&format=html&v=1.0&key=qztbjzBqJueQZLFkwTTJrieu8Vw3789u&logld=v${version}&sl=${from}&tl=${to}&tc=${tc}&sr=1&tk=${this.Bn(inputText, ctkk)}&mode=1
       * 'accept-language': vi;q=0.5, content-type: application/x-www-form-urlencoded - `q=${inputText.split(/\n/).map((sentence) => encodeURIComponent(sentence)).join('&q=')}`
       */
      const response = await $.ajax({
        url: 'https://api-b2b.backenster.com/b1/api/v3/translate',
        data: JSON.stringify({
          from: from,
          to: to,
          data: inputText.split(/\n/),
          platform: 'api'
        }),
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          Authorization: authToken
        }
      });

      return response.result;
    } catch (error) {
      console.error('Bản dịch lỗi:', error.stack);
      throw error.toString();
    }
  },
  getAuthKey: async function (translator, apiKey = '') {
    if (translator === Translators.LINGVANEX) {
      try {
        let authToken;
        /**
         * Lingvanex Demo
         * URL: https://lingvanex.com/lingvanex_demo_page/js/api-base.js
         *
         * Brave
         * URL: https://translate.brave.com/static/v1/element.js
         */
        const apiBaseJs = await $.get(`${CORS_PROXY}https://lingvanex.com/lingvanex_demo_page/js/api-base.js`);

        if (apiBaseJs != undefined) authToken = apiBaseJs.match(/B2B_AUTH_TOKEN="([^"]+)"/)[1];
        return authToken;
      } catch (error) {
        console.error('Không thể lấy được Khoá xác thực:' + error);
        throw error.toString()
      }
    }
  },
  Language: [
    {
      "full_code": "af_ZA",
      "code_alpha_1": "af",
      "englishName": "Afrikaans",
      "codeName": "Tiếng Hà Lan (Nam Phi)",
      "flagPath": "static/flags/afrikaans",
      "testWordForSyntezis": "Hallo",
      "rtl": "false",
      "modes": [
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "sq_AL",
      "code_alpha_1": "sq",
      "englishName": "Albanian",
      "codeName": "Tiếng Albania",
      "flagPath": "static/flags/albanian",
      "testWordForSyntezis": "Përshëndetje",
      "rtl": "false",
      "modes": [
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "am_ET",
      "code_alpha_1": "am",
      "englishName": "Amharic",
      "codeName": "Tiếng Amharic",
      "flagPath": "static/flags/amharic",
      "testWordForSyntezis": "ሰላም",
      "rtl": "false",
      "modes": [
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        }
      ]
    },
    {
      "full_code": "ar_EG",
      "code_alpha_1": "ar",
      "englishName": "Arabic (Egypt)",
      "codeName": "Tiếng Ả Rập",
      "flagPath": "static/flags/arabic_eg",
      "testWordForSyntezis": "مرحبا",
      "rtl": "true",
      "modes": [
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        }
      ]
    },
    {
      "full_code": "ar_SA",
      "code_alpha_1": "ar",
      "englishName": "Arabic (Saudi Arabia)",
      "codeName": "Tiếng Ả Rập",
      "flagPath": "static/flags/arabic_sa",
      "testWordForSyntezis": "مرحبا",
      "rtl": "true",
      "modes": [
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Speech recognition",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "ar_AE",
      "code_alpha_1": "ar",
      "englishName": "Arabic (United Arab Emirates)",
      "codeName": "Tiếng Ả Rập",
      "flagPath": "static/flags/arabic_ae",
      "testWordForSyntezis": "مرحبا",
      "rtl": "true",
      "modes": [
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Speech recognition",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "hy_AM",
      "code_alpha_1": "hy",
      "englishName": "Armenian",
      "codeName": "Tiếng Armenia",
      "flagPath": "static/flags/armenian",
      "testWordForSyntezis": "Hi",
      "rtl": "false",
      "modes": [
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "az_AZ",
      "code_alpha_1": "az",
      "englishName": "Azerbaijani",
      "codeName": "Tiếng Azerbaijan",
      "flagPath": "static/flags/azerbaijani",
      "testWordForSyntezis": "Salam",
      "rtl": "false",
      "modes": [
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "eu_ES",
      "code_alpha_1": "eu",
      "englishName": "Basque",
      "codeName": "Tiếng Basque",
      "flagPath": "static/flags/basque",
      "testWordForSyntezis": "Kaixo",
      "rtl": "false",
      "modes": [
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "be_BY",
      "code_alpha_1": "be",
      "englishName": "Belarusian",
      "codeName": "Tiếng Belarus",
      "flagPath": "static/flags/belarusian",
      "testWordForSyntezis": "",
      "rtl": "false",
      "modes": [
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "bn_BD",
      "code_alpha_1": "bn",
      "englishName": "Bengali",
      "codeName": "Tiếng Bengal",
      "flagPath": "static/flags/bengali",
      "testWordForSyntezis": "হ্যালো",
      "rtl": "false",
      "modes": [
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        }
      ]
    },
    {
      "full_code": "bs_BA",
      "code_alpha_1": "bs",
      "englishName": "Bosnian",
      "codeName": "Tiếng Bosnia",
      "flagPath": "static/flags/bosnian",
      "testWordForSyntezis": "Pozdrav",
      "rtl": "false",
      "modes": [
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        }
      ]
    },
    {
      "full_code": "bg_BG",
      "code_alpha_1": "bg",
      "englishName": "Bulgarian",
      "codeName": "Tiếng Bulgaria",
      "flagPath": "static/flags/bulgarian",
      "testWordForSyntezis": "Здравейте",
      "rtl": "false",
      "modes": [
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        }
      ]
    },
    {
      "full_code": "ca_ES",
      "code_alpha_1": "ca",
      "englishName": "Catalan",
      "codeName": "Tiếng Catalan",
      "flagPath": "static/flags/catalan",
      "testWordForSyntezis": "Hola",
      "rtl": "false",
      "modes": [
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Speech recognition",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "ceb_PH",
      "code_alpha_1": "ceb",
      "englishName": "Cebuano",
      "codeName": "Tiếng Cebuano",
      "flagPath": "static/flags/cebuano",
      "testWordForSyntezis": "",
      "rtl": "false",
      "modes": [
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        }
      ]
    },
    {
      "full_code": "ny_MW",
      "code_alpha_1": "ny",
      "englishName": "Chichewa (Nyanja)",
      "codeName": "Tiếng Chichewa",
      "flagPath": "static/flags/chichewa",
      "testWordForSyntezis": "Moni",
      "rtl": "false",
      "modes": [
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        }
      ]
    },
    {
      "full_code": "zh-Hans_CN",
      "code_alpha_1": "zh-Hans",
      "englishName": "Chinese (simplified)",
      "codeName": "Tiếng Trung (Giản Thể)",
      "flagPath": "static/flags/chinese_mandarin",
      "testWordForSyntezis": "你好",
      "rtl": "false",
      "modes": [
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Speech recognition",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "zh-Hant_TW",
      "code_alpha_1": "zh-Hant",
      "englishName": "Chinese (traditional)",
      "codeName": "Tiếng Trung (Phồn thể)",
      "flagPath": "static/flags/chinese_taiwan",
      "testWordForSyntezis": "你好",
      "rtl": "false",
      "modes": [
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "co_FR",
      "code_alpha_1": "co",
      "englishName": "Corsican",
      "codeName": "Tiếng Corsi",
      "flagPath": "static/flags/corsican",
      "testWordForSyntezis": "",
      "rtl": "false",
      "modes": [
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        }
      ]
    },
    {
      "full_code": "ht_HT",
      "code_alpha_1": "ht",
      "englishName": "Creole",
      "codeName": "Tiếng Creole ở Haiti",
      "flagPath": "static/flags/haitian_creole",
      "testWordForSyntezis": "alo",
      "rtl": "false",
      "modes": [
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        }
      ]
    },
    {
      "full_code": "hr_HR",
      "code_alpha_1": "hr",
      "englishName": "Croatian",
      "codeName": "Tiếng Croatia",
      "flagPath": "static/flags/croatian",
      "testWordForSyntezis": "Pozdrav",
      "rtl": "false",
      "modes": [
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        }
      ]
    },
    {
      "full_code": "cs_CZ",
      "code_alpha_1": "cs",
      "englishName": "Czech",
      "codeName": "Tiếng Séc",
      "flagPath": "static/flags/czech",
      "testWordForSyntezis": "Dobrý den",
      "rtl": "false",
      "modes": [
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        }
      ]
    },
    {
      "full_code": "da_DK",
      "code_alpha_1": "da",
      "englishName": "Danish",
      "codeName": "Tiếng Đan Mạch",
      "flagPath": "static/flags/danish",
      "testWordForSyntezis": "Hej",
      "rtl": "false",
      "modes": [
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        }
      ]
    },
    {
      "full_code": "nl_NL",
      "code_alpha_1": "nl",
      "englishName": "Dutch",
      "codeName": "Tiếng Hà Lan",
      "flagPath": "static/flags/dutch",
      "testWordForSyntezis": "Hallo",
      "rtl": "false",
      "modes": [
        {
          "name": "Speech recognition",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        }
      ]
    },
    {
      "full_code": "en_AU",
      "code_alpha_1": "en",
      "englishName": "English (Australian)",
      "codeName": "Tiếng Anh",
      "flagPath": "static/flags/english_au",
      "testWordForSyntezis": "test",
      "rtl": "false",
      "modes": [
        {
          "name": "Speech recognition",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        }
      ]
    },
    {
      "full_code": "en_GB",
      "code_alpha_1": "en",
      "englishName": "English (Great Britain)",
      "codeName": "Tiếng Anh",
      "flagPath": "static/flags/english_uk",
      "testWordForSyntezis": "test",
      "rtl": "false",
      "modes": [
        {
          "name": "Speech recognition",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        }
      ]
    },
    {
      "full_code": "en_US",
      "code_alpha_1": "en",
      "englishName": "English (USA)",
      "codeName": "Tiếng Anh",
      "flagPath": "static/flags/english_us",
      "testWordForSyntezis": "test",
      "rtl": "false",
      "modes": [
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Speech recognition",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "eo_WORLD",
      "code_alpha_1": "eo",
      "englishName": "Esperanto",
      "codeName": "Quốc tế ngữ",
      "flagPath": "static/flags/esperanto",
      "testWordForSyntezis": "Saluton",
      "rtl": "false",
      "modes": [
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Speech recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        }
      ]
    },
    {
      "full_code": "et_EE",
      "code_alpha_1": "et",
      "englishName": "Estonian",
      "codeName": "Tiếng Estonia",
      "flagPath": "static/flags/estonian",
      "testWordForSyntezis": "Tere",
      "rtl": "false",
      "modes": [
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        }
      ]
    },
    {
      "full_code": "fi_FI",
      "code_alpha_1": "fi",
      "englishName": "Finnish",
      "codeName": "Tiếng Phần Lan",
      "flagPath": "static/flags/finnish",
      "testWordForSyntezis": "Moi",
      "rtl": "false",
      "modes": [
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "fr_CA",
      "code_alpha_1": "fr",
      "englishName": "French (Canada)",
      "codeName": "Tiếng Pháp",
      "flagPath": "static/flags/french_canada",
      "testWordForSyntezis": "Salut",
      "rtl": "false",
      "modes": [
        {
          "name": "Speech recognition",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        }
      ]
    },
    {
      "full_code": "fr_FR",
      "code_alpha_1": "fr",
      "englishName": "French (France)",
      "codeName": "Tiếng Pháp",
      "flagPath": "static/flags/french",
      "testWordForSyntezis": "Salut",
      "rtl": "false",
      "modes": [
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Speech recognition",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "fy_NL",
      "code_alpha_1": "fy",
      "englishName": "Frisian",
      "codeName": "Tiếng Frisia",
      "flagPath": "static/flags/frisian",
      "testWordForSyntezis": "Hoi",
      "rtl": "false",
      "modes": [
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "gl_ES",
      "code_alpha_1": "gl",
      "englishName": "Galician",
      "codeName": "Tiếng Galicia",
      "flagPath": "static/flags/galician",
      "testWordForSyntezis": "",
      "rtl": "false",
      "modes": [
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "ka_GE",
      "code_alpha_1": "ka",
      "englishName": "Georgian",
      "codeName": "Tiếng George",
      "flagPath": "static/flags/georgian",
      "testWordForSyntezis": "გამარჯობა",
      "rtl": "false",
      "modes": [
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "de_DE",
      "code_alpha_1": "de",
      "englishName": "German",
      "codeName": "Tiếng Đức",
      "flagPath": "static/flags/german",
      "testWordForSyntezis": "Hallo",
      "rtl": "false",
      "modes": [
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Speech recognition",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "el_GR",
      "code_alpha_1": "el",
      "englishName": "Greek",
      "codeName": "Tiếng Hy Lạp",
      "flagPath": "static/flags/greek",
      "testWordForSyntezis": "Γεια σου",
      "rtl": "false",
      "modes": [
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Speech recognition",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "gu_IN",
      "code_alpha_1": "gu",
      "englishName": "Gujarati",
      "codeName": "Tiếng Gujarat",
      "flagPath": "static/flags/gujarati",
      "testWordForSyntezis": "",
      "rtl": "false",
      "modes": [
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "ha_NE",
      "code_alpha_1": "ha",
      "englishName": "Hausa",
      "codeName": "Tiếng Hausa",
      "flagPath": "static/flags/hausa",
      "testWordForSyntezis": "Hello",
      "rtl": "false",
      "modes": [
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        }
      ]
    },
    {
      "full_code": "haw_US",
      "code_alpha_1": "haw",
      "englishName": "Hawaiian",
      "codeName": "Tiếng Hawaii",
      "flagPath": "static/flags/hawaii",
      "testWordForSyntezis": "",
      "rtl": "false",
      "modes": [
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        }
      ]
    },
    {
      "full_code": "he_IL",
      "code_alpha_1": "he",
      "englishName": "Hebrew",
      "codeName": "Tiếng Do Thái",
      "flagPath": "static/flags/israel",
      "testWordForSyntezis": "שלום",
      "rtl": "true",
      "modes": [
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        }
      ]
    },
    {
      "full_code": "hi_IN",
      "code_alpha_1": "hi",
      "englishName": "Hindi",
      "codeName": "Tiếng Hindi",
      "flagPath": "static/flags/hindi",
      "testWordForSyntezis": "नमस्कार",
      "rtl": "false",
      "modes": [
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        }
      ]
    },
    {
      "full_code": "hmn_CN",
      "code_alpha_1": "hmn",
      "englishName": "Hmong",
      "codeName": "Tiếng Hmong",
      "flagPath": "static/flags/hmong",
      "testWordForSyntezis": "",
      "rtl": "false",
      "modes": [
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        }
      ]
    },
    {
      "full_code": "hu_HU",
      "code_alpha_1": "hu",
      "englishName": "Hungarian",
      "codeName": "Tiếng Hungary",
      "flagPath": "static/flags/hungarian",
      "testWordForSyntezis": "helló",
      "rtl": "false",
      "modes": [
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        }
      ]
    },
    {
      "full_code": "is_IS",
      "code_alpha_1": "is",
      "englishName": "Icelandic",
      "codeName": "Tiếng Iceland",
      "flagPath": "static/flags/icelandic",
      "testWordForSyntezis": "Halló",
      "rtl": "false",
      "modes": [
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        }
      ]
    },
    {
      "full_code": "ig_NG",
      "code_alpha_1": "ig",
      "englishName": "Igbo",
      "codeName": "Tiếng Igbo",
      "flagPath": "static/flags/igbo",
      "testWordForSyntezis": "",
      "rtl": "false",
      "modes": [
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        }
      ]
    },
    {
      "full_code": "id_ID",
      "code_alpha_1": "id",
      "englishName": "Indonesian",
      "codeName": "Tiếng Indonesia",
      "flagPath": "static/flags/indonesian",
      "testWordForSyntezis": "Halo",
      "rtl": "false",
      "modes": [
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        }
      ]
    },
    {
      "full_code": "ga_IE",
      "code_alpha_1": "ga",
      "englishName": "Irish",
      "codeName": "Tiếng Ireland",
      "flagPath": "static/flags/irish",
      "testWordForSyntezis": "",
      "rtl": "false",
      "modes": [
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        }
      ]
    },
    {
      "full_code": "it_IT",
      "code_alpha_1": "it",
      "englishName": "Italian",
      "codeName": "Tiếng Ý",
      "flagPath": "static/flags/italian",
      "testWordForSyntezis": "Ciao",
      "rtl": "false",
      "modes": [
        {
          "name": "Speech recognition",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        }
      ]
    },
    {
      "full_code": "ja_JP",
      "code_alpha_1": "ja",
      "englishName": "Japanese",
      "codeName": "Tiếng Nhật",
      "flagPath": "static/flags/japanese",
      "testWordForSyntezis": "こんにちは",
      "rtl": "false",
      "modes": [
        {
          "name": "Speech recognition",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        }
      ]
    },
    {
      "full_code": "jv_ID",
      "code_alpha_1": "jv",
      "englishName": "Javanese",
      "codeName": "Tiếng Java",
      "flagPath": "static/flags/javanese",
      "testWordForSyntezis": "",
      "rtl": "false",
      "modes": [
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        }
      ]
    },
    {
      "full_code": "kn_IN",
      "code_alpha_1": "kn",
      "englishName": "Kannada",
      "codeName": "Tiếng Kannada",
      "flagPath": "static/flags/kannada",
      "testWordForSyntezis": "",
      "rtl": "false",
      "modes": [
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "kk_KZ",
      "code_alpha_1": "kk",
      "englishName": "Kazakh",
      "codeName": "Tiếng Kazakh",
      "flagPath": "static/flags/kazakh",
      "testWordForSyntezis": "",
      "rtl": "false",
      "modes": [
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Speech recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "km_KH",
      "code_alpha_1": "km",
      "englishName": "Khmer",
      "codeName": "Tiếng Khmer",
      "flagPath": "static/flags/khmer",
      "testWordForSyntezis": "ជំរាបសួរ",
      "rtl": "false",
      "modes": [
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        }
      ]
    },
    {
      "full_code": "rw_RW",
      "code_alpha_1": "rw",
      "englishName": "Kinyarwanda",
      "codeName": "Kinyarwanda",
      "flagPath": "static/flags/kinyarwanda",
      "testWordForSyntezis": "Muraho",
      "rtl": "false",
      "modes": [
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "ko_KR",
      "code_alpha_1": "ko",
      "englishName": "Korean",
      "codeName": "Tiếng Hàn",
      "flagPath": "static/flags/korean",
      "testWordForSyntezis": "안녕하세요",
      "rtl": "false",
      "modes": [
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "ku_IR",
      "code_alpha_1": "ku",
      "englishName": "Kurdish",
      "codeName": "Tiếng Kurd",
      "flagPath": "static/flags/kurdish",
      "testWordForSyntezis": "Slav",
      "rtl": "false",
      "modes": [
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        }
      ]
    },
    {
      "full_code": "ky_KG",
      "code_alpha_1": "ky",
      "englishName": "Kyrgyz",
      "codeName": "Tiếng Kyrgyz",
      "flagPath": "static/flags/kyrgyz",
      "testWordForSyntezis": "",
      "rtl": "false",
      "modes": [
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        }
      ]
    },
    {
      "full_code": "lo_LA",
      "code_alpha_1": "lo",
      "englishName": "Lao",
      "codeName": "Tiếng Lào",
      "flagPath": "static/flags/lao",
      "testWordForSyntezis": "",
      "rtl": "false",
      "modes": [
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        }
      ]
    },
    {
      "full_code": "la_VAT",
      "code_alpha_1": "la",
      "englishName": "Latin",
      "codeName": "Tiếng Latinh",
      "flagPath": "static/flags/latin",
      "testWordForSyntezis": "Salve",
      "rtl": "false",
      "modes": [
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        }
      ]
    },
    {
      "full_code": "lv_LV",
      "code_alpha_1": "lv",
      "englishName": "Latvian",
      "codeName": "Tiếng Latvia",
      "flagPath": "static/flags/latvian",
      "testWordForSyntezis": "labdien",
      "rtl": "false",
      "modes": [
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "lt_LT",
      "code_alpha_1": "lt",
      "englishName": "Lithuanian",
      "codeName": "Tiếng Litva",
      "flagPath": "static/flags/lithuanian",
      "testWordForSyntezis": "labas",
      "rtl": "false",
      "modes": [
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "lb_LU",
      "code_alpha_1": "lb",
      "englishName": "Luxembourgish",
      "codeName": "Tiếng Luxembourg",
      "flagPath": "static/flags/luxembourgish",
      "testWordForSyntezis": "",
      "rtl": "false",
      "modes": [
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        }
      ]
    },
    {
      "full_code": "mk_MK",
      "code_alpha_1": "mk",
      "englishName": "Macedonian",
      "codeName": "Tiếng Macedonia",
      "flagPath": "static/flags/macedonian",
      "testWordForSyntezis": "",
      "rtl": "false",
      "modes": [
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        }
      ]
    },
    {
      "full_code": "mg_MG",
      "code_alpha_1": "mg",
      "englishName": "Malagasy",
      "codeName": "Tiếng Malagasy",
      "flagPath": "static/flags/malagasy",
      "testWordForSyntezis": "",
      "rtl": "false",
      "modes": [
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        }
      ]
    },
    {
      "full_code": "ms_MY",
      "code_alpha_1": "ms",
      "englishName": "Malay",
      "codeName": "Tiếng Mã Lai",
      "flagPath": "static/flags/malay",
      "testWordForSyntezis": "Hello",
      "rtl": "false",
      "modes": [
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        }
      ]
    },
    {
      "full_code": "ml_IN",
      "code_alpha_1": "ml",
      "englishName": "Malayalam",
      "codeName": "Tiếng Malayalam",
      "flagPath": "static/flags/malayalam",
      "testWordForSyntezis": "ഹലോ",
      "rtl": "false",
      "modes": [
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "mt_MT",
      "code_alpha_1": "mt",
      "englishName": "Maltese",
      "codeName": "Tiếng Malta",
      "flagPath": "static/flags/maltese",
      "testWordForSyntezis": "",
      "rtl": "false",
      "modes": [
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "mi_NZ",
      "code_alpha_1": "mi",
      "englishName": "Maori",
      "codeName": "Tiếng Maori",
      "flagPath": "static/flags/maori",
      "testWordForSyntezis": "",
      "rtl": "false",
      "modes": [
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "mr_IN",
      "code_alpha_1": "mr",
      "englishName": "Marathi",
      "codeName": "Tiếng Marathi",
      "flagPath": "static/flags/marathi",
      "testWordForSyntezis": "",
      "rtl": "false",
      "modes": [
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "mn_MN",
      "code_alpha_1": "mn",
      "englishName": "Mongolian",
      "codeName": "Tiếng Mông Cổ",
      "flagPath": "static/flags/mongolian",
      "testWordForSyntezis": "",
      "rtl": "false",
      "modes": [
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        }
      ]
    },
    {
      "full_code": "my_MM",
      "code_alpha_1": "my",
      "englishName": "Myanmar (Burmese)",
      "codeName": "Tiếng Myanmar",
      "flagPath": "static/flags/myanmar",
      "testWordForSyntezis": "ဟလို",
      "rtl": "false",
      "modes": [
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        }
      ]
    },
    {
      "full_code": "ne_NP",
      "code_alpha_1": "ne",
      "englishName": "Nepali",
      "codeName": "Tiếng Nepal",
      "flagPath": "static/flags/nepali",
      "testWordForSyntezis": "नमस्कार",
      "rtl": "false",
      "modes": [
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        }
      ]
    },
    {
      "full_code": "no_NO",
      "code_alpha_1": "no",
      "englishName": "Norwegian",
      "codeName": "Tiếng Na Uy",
      "flagPath": "static/flags/norwegian",
      "testWordForSyntezis": "hallo",
      "rtl": "false",
      "modes": [
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        }
      ]
    },
    {
      "full_code": "or_OR",
      "code_alpha_1": "or",
      "englishName": "Odia",
      "codeName": "Odia",
      "flagPath": "static/flags/odia",
      "testWordForSyntezis": "ନମସ୍କାର",
      "rtl": "false",
      "modes": [
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "ps_AF",
      "code_alpha_1": "ps",
      "englishName": "Pashto",
      "codeName": "Tiếng Pashto",
      "flagPath": "static/flags/pashto",
      "testWordForSyntezis": "",
      "rtl": "true",
      "modes": [
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        }
      ]
    },
    {
      "full_code": "fa_IR",
      "code_alpha_1": "fa",
      "englishName": "Persian",
      "codeName": "Tiếng Ba Tư",
      "flagPath": "static/flags/persian",
      "testWordForSyntezis": "سلام",
      "rtl": "true",
      "modes": [
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Speech recognition",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "pl_PL",
      "code_alpha_1": "pl",
      "englishName": "Polish",
      "codeName": "Tiếng Ba Lan",
      "flagPath": "static/flags/polish",
      "testWordForSyntezis": "Cześć",
      "rtl": "false",
      "modes": [
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Speech recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "pt_PT",
      "code_alpha_1": "pt",
      "englishName": "Portuguese",
      "codeName": "Tiếng Bồ Đào Nha",
      "flagPath": "static/flags/portuguese",
      "testWordForSyntezis": "Olá",
      "rtl": "false",
      "modes": [
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Speech recognition",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "pt_BR",
      "code_alpha_1": "pt",
      "englishName": "Portuguese (Brazil)",
      "codeName": "Tiếng Bồ Đào Nha",
      "flagPath": "static/flags/portuguese_brazil",
      "testWordForSyntezis": "Olá",
      "rtl": "false",
      "modes": [
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Speech recognition",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        }
      ]
    },
    {
      "full_code": "pa_PK",
      "code_alpha_1": "pa",
      "englishName": "Punjabi",
      "codeName": "Tiếng Punjab",
      "flagPath": "static/flags/punjabi",
      "testWordForSyntezis": "",
      "rtl": "false",
      "modes": [
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "ro_RO",
      "code_alpha_1": "ro",
      "englishName": "Romanian",
      "codeName": "Tiếng Rumani",
      "flagPath": "static/flags/romanian",
      "testWordForSyntezis": "bună",
      "rtl": "false",
      "modes": [
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        }
      ]
    },
    {
      "full_code": "ru_RU",
      "code_alpha_1": "ru",
      "englishName": "Russian",
      "codeName": "Tiếng Nga",
      "flagPath": "static/flags/russian",
      "testWordForSyntezis": "Привет",
      "rtl": "false",
      "modes": [
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Speech recognition",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "sm_WS",
      "code_alpha_1": "sm",
      "englishName": "Samoan",
      "codeName": "Tiếng Samoa",
      "flagPath": "static/flags/samoan",
      "testWordForSyntezis": "",
      "rtl": "false",
      "modes": [
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        }
      ]
    },
    {
      "full_code": "gd_GB",
      "code_alpha_1": "gd",
      "englishName": "Scottish",
      "codeName": "Tiếng Gael Scotland",
      "flagPath": "static/flags/scottish_gaelic",
      "testWordForSyntezis": "",
      "rtl": "false",
      "modes": [
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "sr-Cyrl_RS",
      "code_alpha_1": "sr-Cyrl",
      "englishName": "Serbian Kyrilic",
      "codeName": "Serbian Cyrilic",
      "flagPath": "static/flags/serbian",
      "testWordForSyntezis": "Здраво",
      "rtl": "false",
      "modes": [
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "st_LS",
      "code_alpha_1": "st",
      "englishName": "Sesotho",
      "codeName": "Tiếng Sesotho",
      "flagPath": "static/flags/sesotho",
      "testWordForSyntezis": "",
      "rtl": "false",
      "modes": [
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        }
      ]
    },
    {
      "full_code": "sn_ZW",
      "code_alpha_1": "sn",
      "englishName": "Shona",
      "codeName": "Tiếng Shona",
      "flagPath": "static/flags/shona",
      "testWordForSyntezis": "",
      "rtl": "false",
      "modes": [
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        }
      ]
    },
    {
      "full_code": "sd_PK",
      "code_alpha_1": "sd",
      "englishName": "Sindhi",
      "codeName": "Tiếng Sindhi",
      "flagPath": "static/flags/sindhi",
      "testWordForSyntezis": "سلام",
      "rtl": "true",
      "modes": [
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        }
      ]
    },
    {
      "full_code": "si_LK",
      "code_alpha_1": "si",
      "englishName": "Sinhala",
      "codeName": "Tiếng Sinhala",
      "flagPath": "static/flags/sinhala",
      "testWordForSyntezis": "ආයුබෝවන්",
      "rtl": "false",
      "modes": [
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        }
      ]
    },
    {
      "full_code": "sk_SK",
      "code_alpha_1": "sk",
      "englishName": "Slovak",
      "codeName": "Tiếng Slovak",
      "flagPath": "static/flags/slovak",
      "testWordForSyntezis": "dobrý deň",
      "rtl": "false",
      "modes": [
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "sl_SI",
      "code_alpha_1": "sl",
      "englishName": "Slovenian",
      "codeName": "Tiếng Slovenia",
      "flagPath": "static/flags/slovenian",
      "testWordForSyntezis": "zdravo",
      "rtl": "false",
      "modes": [
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "so_SO",
      "code_alpha_1": "so",
      "englishName": "Somali",
      "codeName": "Tiếng Somali",
      "flagPath": "static/flags/somali",
      "testWordForSyntezis": "",
      "rtl": "false",
      "modes": [
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        }
      ]
    },
    {
      "full_code": "es_ES",
      "code_alpha_1": "es",
      "englishName": "Spanish",
      "codeName": "Tiếng Tây Ban Nha",
      "flagPath": "static/flags/spanish",
      "testWordForSyntezis": "Hola",
      "rtl": "false",
      "modes": [
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Speech recognition",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "es_MX",
      "code_alpha_1": "es",
      "englishName": "Spanish (Mexico)",
      "codeName": "Tiếng Tây Ban Nha",
      "flagPath": "static/flags/spanish_mexico",
      "testWordForSyntezis": "Hola",
      "rtl": "false",
      "modes": [
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Speech recognition",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        }
      ]
    },
    {
      "full_code": "es_US",
      "code_alpha_1": "es",
      "englishName": "Spanish (United States)",
      "codeName": "Tiếng Tây Ban Nha",
      "flagPath": "static/flags/english_us",
      "testWordForSyntezis": "Hola",
      "rtl": "false",
      "modes": [
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Speech recognition",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "su_ID",
      "code_alpha_1": "su",
      "englishName": "Sundanese",
      "codeName": "Tiếng Sunda",
      "flagPath": "static/flags/sundanese",
      "testWordForSyntezis": "",
      "rtl": "false",
      "modes": [
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        }
      ]
    },
    {
      "full_code": "sw_TZ",
      "code_alpha_1": "sw",
      "englishName": "Swahili",
      "codeName": "Tiếng Swahili",
      "flagPath": "static/flags/swahili",
      "testWordForSyntezis": "Hello",
      "rtl": "false",
      "modes": [
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        }
      ]
    },
    {
      "full_code": "sv_SE",
      "code_alpha_1": "sv",
      "englishName": "Swedish",
      "codeName": "Tiếng Thụy Điển",
      "flagPath": "static/flags/swedish",
      "testWordForSyntezis": "Hej",
      "rtl": "false",
      "modes": [
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Speech recognition",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        }
      ]
    },
    {
      "full_code": "tl_PH",
      "code_alpha_1": "tl",
      "englishName": "Tagalog",
      "codeName": "Tiếng Filipino",
      "flagPath": "static/flags/tagalog",
      "testWordForSyntezis": "Hello",
      "rtl": "false",
      "modes": [
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Speech recognition",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "tg_TJ",
      "code_alpha_1": "tg",
      "englishName": "Tajik",
      "codeName": "Tiếng Tajik",
      "flagPath": "static/flags/tajik",
      "testWordForSyntezis": "Салом",
      "rtl": "false",
      "modes": [
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        }
      ]
    },
    {
      "full_code": "ta_IN",
      "code_alpha_1": "ta",
      "englishName": "Tamil",
      "codeName": "Tiếng Tamil",
      "flagPath": "static/flags/tamil",
      "testWordForSyntezis": "வணக்கம்",
      "rtl": "false",
      "modes": [
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        }
      ]
    },
    {
      "full_code": "tt_TT",
      "code_alpha_1": "tt",
      "englishName": "Tatar",
      "codeName": "Tatar",
      "flagPath": "static/flags/tatar",
      "testWordForSyntezis": "Сәлам",
      "rtl": "false",
      "modes": [
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "te_IN",
      "code_alpha_1": "te",
      "englishName": "Telugu",
      "codeName": "Tiếng Telugu",
      "flagPath": "static/flags/telugu",
      "testWordForSyntezis": "",
      "rtl": "false",
      "modes": [
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "th_TH",
      "code_alpha_1": "th",
      "englishName": "Thai",
      "codeName": "Tiếng Thái",
      "flagPath": "static/flags/thai",
      "testWordForSyntezis": "สวัสดี",
      "rtl": "false",
      "modes": [
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        }
      ]
    },
    {
      "full_code": "tr_TR",
      "code_alpha_1": "tr",
      "englishName": "Turkish",
      "codeName": "Tiếng Thổ Nhĩ Kỳ",
      "flagPath": "static/flags/turkish",
      "testWordForSyntezis": "Merhaba",
      "rtl": "false",
      "modes": [
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Speech recognition",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "tk_TM",
      "code_alpha_1": "tk",
      "englishName": "Turkmen",
      "codeName": "Turkmen",
      "flagPath": "static/flags/turkmen",
      "testWordForSyntezis": "Salam",
      "rtl": "false",
      "modes": [
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "uk_UA",
      "code_alpha_1": "uk",
      "englishName": "Ukrainian",
      "codeName": "Tiếng Ukraina",
      "flagPath": "static/flags/ukrainian",
      "testWordForSyntezis": "Вітаю",
      "rtl": "false",
      "modes": [
        {
          "name": "Speech recognition",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        }
      ]
    },
    {
      "full_code": "ur_PK",
      "code_alpha_1": "ur",
      "englishName": "Urdu",
      "codeName": "Tiếng Urdu",
      "flagPath": "static/flags/urdu",
      "testWordForSyntezis": "خوش آمدید",
      "rtl": "true",
      "modes": [
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        }
      ]
    },
    {
      "full_code": "ug_CN",
      "code_alpha_1": "ug",
      "englishName": "Uyghur",
      "codeName": "Uyghur",
      "flagPath": "static/flags/uyghur",
      "testWordForSyntezis": "ياخشىمۇسىز",
      "rtl": "true",
      "modes": [
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "uz_UZ",
      "code_alpha_1": "uz",
      "englishName": "Uzbek",
      "codeName": "Tiếng Uzbek",
      "flagPath": "static/flags/uzbek",
      "testWordForSyntezis": "Salom",
      "rtl": "false",
      "modes": [
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        }
      ]
    },
    {
      "full_code": "vi_VN",
      "code_alpha_1": "vi",
      "englishName": "Vietnamese",
      "codeName": "Tiếng Việt",
      "flagPath": "static/flags/vietnamese",
      "testWordForSyntezis": "Xin chào",
      "rtl": "false",
      "modes": [
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Speech recognition",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "cy_GB",
      "code_alpha_1": "cy",
      "englishName": "Welsh",
      "codeName": "Tiếng Xứ Wales",
      "flagPath": "static/flags/welsh",
      "testWordForSyntezis": "Helo",
      "rtl": "false",
      "modes": [
        {
          "name": "Image object recognition",
          "value": true
        },
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        }
      ]
    },
    {
      "full_code": "xh_ZA",
      "code_alpha_1": "xh",
      "englishName": "Xhosa",
      "codeName": "Tiếng Bantu",
      "flagPath": "static/flags/xhosa",
      "testWordForSyntezis": "",
      "rtl": "false",
      "modes": [
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "yi_IL",
      "code_alpha_1": "yi",
      "englishName": "Yiddish",
      "codeName": "Tiếng Yiddish",
      "flagPath": "static/flags/yiddish",
      "testWordForSyntezis": "",
      "rtl": "true",
      "modes": [
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Image recognition",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "yo_NG",
      "code_alpha_1": "yo",
      "englishName": "Yoruba",
      "codeName": "Tiếng Yoruba",
      "flagPath": "static/flags/yoruba",
      "testWordForSyntezis": "",
      "rtl": "false",
      "modes": [
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        }
      ]
    },
    {
      "full_code": "zu_ZA",
      "code_alpha_1": "zu",
      "englishName": "Zulu",
      "codeName": "Zulu",
      "flagPath": "static/flags/afrikaans",
      "testWordForSyntezis": "Sawubona",
      "rtl": "false",
      "modes": [
        {
          "name": "Translate web site",
          "value": true
        },
        {
          "name": "Translation document",
          "value": true
        },
        {
          "name": "Translation",
          "value": true
        },
        {
          "name": "Image object recognition",
          "value": true
        }
      ]
    }
  ]
};

const Papago = {
  translateText: async function (version, inputText, sourceLanguage, targetLanguage, useGlossary = false) {
    try {
      inputText = useGlossary ? getGlossaryAppliedText(inputText, Translators.PAPAGO) : inputText;

      const timeStamp = (new Date()).getTime();

      const response = await $.ajax({
        url: CORS_PROXY + 'https://papago.naver.com/apis/n2mt/translate',
        data: `deviceId=${uuid}&locale=vi&dict=true&dictDisplay=30&honorific=true&instant=false&paging=false&source=${sourceLanguage}&target=${targetLanguage}&text=${encodeURIComponent(inputText)}`,
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Language': 'vi',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'device-type': 'pc', // 'mobile',
          'x-apigw-partnerid': 'papago',
          Authorization: 'PPG ' + uuid + ':' + CryptoJS.HmacMD5(uuid + '\n' + 'https://papago.naver.com/apis/n2mt/translate' + '\n' + timeStamp, version).toString(CryptoJS.enc.Base64),
          Timestamp: timeStamp
        }
      });
      return response.translatedText;
    } catch (error) {
      console.error('Bản dịch lỗi:', error.stack);
      throw error.toString();
    }
  },
  getVersion: async function (translator) {
    if (translator === Translators.PAPAGO) {
      try {
        let version;

        const mainJs = (await $.get(CORS_PROXY + 'https://papago.naver.com')).match(/\/(main.*\.js)/)[1];

        if (mainJs != undefined) {
          version = (await $.get(CORS_PROXY + 'https://papago.naver.com/' + mainJs)).match(/"PPG .*,"(v[^"]*)/)[1];
        }
        return version;
      } catch (error) {
        console.error('Không thể lấy được Thông tin phiên bản: ' + error);
        throw error.toString()
      }
    }
  },
  Language: {
    ko: 'Hàn',
    en: 'Anh',
    ja: 'Nhật',
    'zh-CN': 'Trung (Giản thể)',
    'zh-TW': 'Trung (Phổn thể)',
    es: 'Tây Ban Nha',
    fr: 'Pháp',
    de: 'Đức',
    ru: 'Nga',
    pt: 'Bồ Đào Nha',
    it: 'Ý',
    vi: 'Việt',
    th: 'Thái',
    id: 'Indonesia',
    hi: 'Hindi'
  }
};

const MicrosoftTranslator = {
  translateText: async function (accessToken, inputText, sourceLanguage, targetLanguage, useGlossary = false) {
    try {
      inputText = useGlossary ? getGlossaryAppliedText(inputText, Translators.MICROSOFT_TRANSLATOR) : inputText;

      /**
       * Microsoft Bing Translator
       * const bingTranslatorHTML = await $.get('https://cors-anywhere.herokuapp.com/https://www.bing.com/translator');
       * const IG = bingTranslatorHTML.match(/IG:'([A-Z0-9]+)'/)[1];
       * const IID = bingTranslatorHTML.match(/data-iid='(translator.\d+)'/)[1];
       * const [, key, token] = bingTranslatorHTML.match(/var params_AbusePreventionHelper\s*=\s*\[([0-9]+),\s*'([^']+)',[^\]]*\];/);
       * Method: POST
       * URL: https://www.bing.com/ttranslatev3?isVertical=1&&IG=76A5BF5FFF374A53A1374DE8089BDFF2&IID=translator.5029
       * Content-type: application/x-www-form-urlencoded send(&fromLang=auto-detect&text=inputText&to=targetLanguage&token=kXtg8tfzQrA11KAJyMhp61NCVy-19gPj&key=1687667900500&tryFetchingGenderDebiasedTranslations=true)
       *
       * Microsoft Edge old
       * Method: POST
       * URL: https://api.cognitive.microsofttranslator.com/translate?to=${targetLanguage}&api-version=3.0&includeSentenceLength=true
       * Content-Type: application/json - send(inputText)
       *
       * Microsoft Edge 2
       * Method: POST
       * URL: https://api-edge.cognitive.microsofttranslator.com/translate?to=${targetLanguage}&api-version=3.0&includeSentenceLength=true
       * URL: https://api-edge.cognitive.microsofttranslator.com/translate?from=${sourceLanguage}&to=${targetLanguage}&api-version=3.0&includeSentenceLength=true
       * Authorization: Bearer ${accessToken} - Content-Type: application/json - send(inputText)
       */
      const response = await $.ajax({
        url: `https://api-edge.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${sourceLanguage}&to=${targetLanguage}`,
        data: JSON.stringify(inputText.split(/\n/).map((sentence) => ({'Text': sentence}))),
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Content-Length': JSON.stringify(inputText.split(/\n/).map((sentence) => ({'Text': sentence}))).length
        }
      });
      return response.map((element) => element.translations[0].text).join('\n');
    } catch (error) {
      console.error('Bản dịch lỗi:', error.stack);
      throw error.toString();
    }
  },
  getAccessToken: async function (translator) {
    if (translator === Translators.MICROSOFT_TRANSLATOR) {
      try {
        return await $.get('https://edge.microsoft.com/translate/auth');
      } catch (error) {
        console.error('Không thể lấy được Access Token: ' + error);
        throw error.toString()
      }
    }
  },
  Language: {
    "af": {
      "name": "Tiếng Afrikaans",
      "nativeName": "Afrikaans",
      "dir": "ltr"
    },
    "am": {
      "name": "Tiếng Amharic",
      "nativeName": "አማርኛ",
      "dir": "ltr"
    },
    "ar": {
      "name": "Tiếng Ả Rập",
      "nativeName": "العربية",
      "dir": "rtl"
    },
    "as": {
      "name": "Tiếng Assam",
      "nativeName": "অসমীয়া",
      "dir": "ltr"
    },
    "az": {
      "name": "Tiếng Azerbaijan",
      "nativeName": "Azərbaycan",
      "dir": "ltr"
    },
    "ba": {
      "name": "Tiếng Bashkir",
      "nativeName": "Bashkir",
      "dir": "ltr"
    },
    "bg": {
      "name": "Tiếng Bulgaria",
      "nativeName": "Български",
      "dir": "ltr"
    },
    "bn": {
      "name": "Tiếng Bangla",
      "nativeName": "বাংলা",
      "dir": "ltr"
    },
    "bo": {
      "name": "Tiếng Tây Tạng",
      "nativeName": "བོད་སྐད་",
      "dir": "ltr"
    },
    "bs": {
      "name": "Tiếng Bosnia",
      "nativeName": "Bosnian",
      "dir": "ltr"
    },
    "ca": {
      "name": "Tiếng Catalan",
      "nativeName": "Català",
      "dir": "ltr"
    },
    "cs": {
      "name": "Tiếng Séc",
      "nativeName": "Čeština",
      "dir": "ltr"
    },
    "cy": {
      "name": "Tiếng Wales",
      "nativeName": "Cymraeg",
      "dir": "ltr"
    },
    "da": {
      "name": "Tiếng Đan Mạch",
      "nativeName": "Dansk",
      "dir": "ltr"
    },
    "de": {
      "name": "Tiếng Đức",
      "nativeName": "Deutsch",
      "dir": "ltr"
    },
    "dsb": {
      "name": "Tiếng Hạ Sorbia",
      "nativeName": "Dolnoserbšćina",
      "dir": "ltr"
    },
    "dv": {
      "name": "Tiếng Divehi",
      "nativeName": "ދިވެހިބަސް",
      "dir": "rtl"
    },
    "el": {
      "name": "Tiếng Hy Lạp",
      "nativeName": "Ελληνικά",
      "dir": "ltr"
    },
    "en": {
      "name": "Tiếng Anh",
      "nativeName": "English",
      "dir": "ltr"
    },
    "es": {
      "name": "Tiếng Tây Ban Nha",
      "nativeName": "Español",
      "dir": "ltr"
    },
    "et": {
      "name": "Tiếng Estonia",
      "nativeName": "Eesti",
      "dir": "ltr"
    },
    "eu": {
      "name": "Tiếng Basque",
      "nativeName": "Euskara",
      "dir": "ltr"
    },
    "fa": {
      "name": "Tiếng Ba Tư",
      "nativeName": "فارسی",
      "dir": "rtl"
    },
    "fi": {
      "name": "Tiếng Phần Lan",
      "nativeName": "Suomi",
      "dir": "ltr"
    },
    "fil": {
      "name": "Tiếng Philippines",
      "nativeName": "Filipino",
      "dir": "ltr"
    },
    "fj": {
      "name": "Tiếng Fiji",
      "nativeName": "Na Vosa Vakaviti",
      "dir": "ltr"
    },
    "fo": {
      "name": "Tiếng Faroe",
      "nativeName": "Føroyskt",
      "dir": "ltr"
    },
    "fr": {
      "name": "Tiếng Pháp",
      "nativeName": "Français",
      "dir": "ltr"
    },
    "fr-CA": {
      "name": "Tiếng Pháp (Canada)",
      "nativeName": "Français (Canada)",
      "dir": "ltr"
    },
    "ga": {
      "name": "Tiếng Ireland",
      "nativeName": "Gaeilge",
      "dir": "ltr"
    },
    "gl": {
      "name": "Tiếng Galician",
      "nativeName": "Galego",
      "dir": "ltr"
    },
    "gom": {
      "name": "Konkani",
      "nativeName": "Konkani",
      "dir": "ltr"
    },
    "gu": {
      "name": "Tiếng Gujarati",
      "nativeName": "ગુજરાતી",
      "dir": "ltr"
    },
    "ha": {
      "name": "Tiếng Hausa",
      "nativeName": "Hausa",
      "dir": "ltr"
    },
    "he": {
      "name": "Tiếng Do Thái",
      "nativeName": "עברית",
      "dir": "rtl"
    },
    "hi": {
      "name": "Tiếng Hindi",
      "nativeName": "हिन्दी",
      "dir": "ltr"
    },
    "hr": {
      "name": "Tiếng Croatia",
      "nativeName": "Hrvatski",
      "dir": "ltr"
    },
    "hsb": {
      "name": "Tiếng Thượng Sorbia",
      "nativeName": "Hornjoserbšćina",
      "dir": "ltr"
    },
    "ht": {
      "name": "Tiếng Haiti",
      "nativeName": "Haitian Creole",
      "dir": "ltr"
    },
    "hu": {
      "name": "Tiếng Hungary",
      "nativeName": "Magyar",
      "dir": "ltr"
    },
    "hy": {
      "name": "Tiếng Armenia",
      "nativeName": "Հայերեն",
      "dir": "ltr"
    },
    "id": {
      "name": "Tiếng Indonesia",
      "nativeName": "Indonesia",
      "dir": "ltr"
    },
    "ig": {
      "name": "Tiếng Igbo",
      "nativeName": "Ásụ̀sụ́ Ìgbò",
      "dir": "ltr"
    },
    "ikt": {
      "name": "Inuinnaqtun",
      "nativeName": "Inuinnaqtun",
      "dir": "ltr"
    },
    "is": {
      "name": "Tiếng Iceland",
      "nativeName": "Íslenska",
      "dir": "ltr"
    },
    "it": {
      "name": "Tiếng Italy",
      "nativeName": "Italiano",
      "dir": "ltr"
    },
    "iu": {
      "name": "Tiếng Inuktitut",
      "nativeName": "ᐃᓄᒃᑎᑐᑦ",
      "dir": "ltr"
    },
    "iu-Latn": {
      "name": "Inuktitut (Latin)",
      "nativeName": "Inuktitut (Latin)",
      "dir": "ltr"
    },
    "ja": {
      "name": "Tiếng Nhật",
      "nativeName": "日本語",
      "dir": "ltr"
    },
    "ka": {
      "name": "Tiếng Georgia",
      "nativeName": "ქართული",
      "dir": "ltr"
    },
    "kk": {
      "name": "Tiếng Kazakh",
      "nativeName": "Қазақ Тілі",
      "dir": "ltr"
    },
    "km": {
      "name": "Tiếng Khmer",
      "nativeName": "ខ្មែរ",
      "dir": "ltr"
    },
    "kmr": {
      "name": "Tiếng Kurd (Bắc)",
      "nativeName": "Kurdî (Bakur)",
      "dir": "ltr"
    },
    "kn": {
      "name": "Tiếng Kannada",
      "nativeName": "ಕನ್ನಡ",
      "dir": "ltr"
    },
    "ko": {
      "name": "Tiếng Hàn",
      "nativeName": "한국어",
      "dir": "ltr"
    },
    "ku": {
      "name": "Tiếng Kurd (Trung)",
      "nativeName": "Kurdî (Navîn)",
      "dir": "rtl"
    },
    "ky": {
      "name": "Tiếng Kyrgyz",
      "nativeName": "Кыргызча",
      "dir": "ltr"
    },
    "ln": {
      "name": "Tiếng Lingala",
      "nativeName": "Lingála",
      "dir": "ltr"
    },
    "lo": {
      "name": "Tiếng Lào",
      "nativeName": "ລາວ",
      "dir": "ltr"
    },
    "lt": {
      "name": "Tiếng Litva",
      "nativeName": "Lietuvių",
      "dir": "ltr"
    },
    "lug": {
      "name": "Ganda",
      "nativeName": "Ganda",
      "dir": "ltr"
    },
    "lv": {
      "name": "Tiếng Latvia",
      "nativeName": "Latviešu",
      "dir": "ltr"
    },
    "lzh": {
      "name": "Chinese (Literary)",
      "nativeName": "中文 (文言文)",
      "dir": "ltr"
    },
    "mai": {
      "name": "Tiếng Maithili",
      "nativeName": "Maithili",
      "dir": "ltr"
    },
    "mg": {
      "name": "Tiếng Malagasy",
      "nativeName": "Malagasy",
      "dir": "ltr"
    },
    "mi": {
      "name": "Tiếng Maori",
      "nativeName": "Te Reo Māori",
      "dir": "ltr"
    },
    "mk": {
      "name": "Tiếng Macedonia",
      "nativeName": "Македонски",
      "dir": "ltr"
    },
    "ml": {
      "name": "Tiếng Malayalam",
      "nativeName": "മലയാളം",
      "dir": "ltr"
    },
    "mn-Cyrl": {
      "name": "Mongolian (Cyrillic)",
      "nativeName": "Mongolian (Cyrillic)",
      "dir": "ltr"
    },
    "mn-Mong": {
      "name": "Mongolian (Traditional)",
      "nativeName": "ᠮᠣᠩᠭᠣᠯ ᠬᠡᠯᠡ",
      "dir": "ltr"
    },
    "mr": {
      "name": "Tiếng Marathi",
      "nativeName": "मराठी",
      "dir": "ltr"
    },
    "ms": {
      "name": "Tiếng Mã Lai",
      "nativeName": "Melayu",
      "dir": "ltr"
    },
    "mt": {
      "name": "Tiếng Malta",
      "nativeName": "Malti",
      "dir": "ltr"
    },
    "mww": {
      "name": "Tiếng H’Mông",
      "nativeName": "Hmong Daw",
      "dir": "ltr"
    },
    "my": {
      "name": "Tiếng Miến Điện",
      "nativeName": "မြန်မာ",
      "dir": "ltr"
    },
    "nb": {
      "name": "Tiếng Na Uy (Bokmål)",
      "nativeName": "Norsk Bokmål",
      "dir": "ltr"
    },
    "ne": {
      "name": "Tiếng Nepal",
      "nativeName": "नेपाली",
      "dir": "ltr"
    },
    "nl": {
      "name": "Tiếng Hà Lan",
      "nativeName": "Nederlands",
      "dir": "ltr"
    },
    "nso": {
      "name": "Sesotho sa Leboa",
      "nativeName": "Sesotho sa Leboa",
      "dir": "ltr"
    },
    "nya": {
      "name": "Nyanja",
      "nativeName": "Nyanja",
      "dir": "ltr"
    },
    "or": {
      "name": "Tiếng Odia",
      "nativeName": "ଓଡ଼ିଆ",
      "dir": "ltr"
    },
    "otq": {
      "name": "Tiếng Querétaro Otomi",
      "nativeName": "Hñähñu",
      "dir": "ltr"
    },
    "pa": {
      "name": "Tiếng Punjab",
      "nativeName": "ਪੰਜਾਬੀ",
      "dir": "ltr"
    },
    "pl": {
      "name": "Tiếng Ba Lan",
      "nativeName": "Polski",
      "dir": "ltr"
    },
    "prs": {
      "name": "Tiếng Dari",
      "nativeName": "دری",
      "dir": "rtl"
    },
    "ps": {
      "name": "Tiếng Pashto",
      "nativeName": "پښتو",
      "dir": "rtl"
    },
    "pt": {
      "name": "Tiếng Bồ Đào Nha (Brazil)",
      "nativeName": "Português (Brasil)",
      "dir": "ltr"
    },
    "pt-PT": {
      "name": "Tiếng Bồ Đào Nha (Bồ Đào Nha)",
      "nativeName": "Português (Portugal)",
      "dir": "ltr"
    },
    "ro": {
      "name": "Tiếng Romania",
      "nativeName": "Română",
      "dir": "ltr"
    },
    "ru": {
      "name": "Tiếng Nga",
      "nativeName": "Русский",
      "dir": "ltr"
    },
    "run": {
      "name": "Rundi",
      "nativeName": "Rundi",
      "dir": "ltr"
    },
    "rw": {
      "name": "Tiếng Kinyarwanda",
      "nativeName": "Kinyarwanda",
      "dir": "ltr"
    },
    "sd": {
      "name": "Tiếng Sindhi",
      "nativeName": "سنڌي",
      "dir": "ltr"
    },
    "si": {
      "name": "Tiếng Sinhala",
      "nativeName": "සිංහල",
      "dir": "ltr"
    },
    "sk": {
      "name": "Tiếng Slovak",
      "nativeName": "Slovenčina",
      "dir": "ltr"
    },
    "sl": {
      "name": "Tiếng Slovenia",
      "nativeName": "Slovenščina",
      "dir": "ltr"
    },
    "sm": {
      "name": "Tiếng Samoa",
      "nativeName": "Gagana Sāmoa",
      "dir": "ltr"
    },
    "sn": {
      "name": "Tiếng Shona",
      "nativeName": "chiShona",
      "dir": "ltr"
    },
    "so": {
      "name": "Tiếng Somali",
      "nativeName": "Soomaali",
      "dir": "ltr"
    },
    "sq": {
      "name": "Tiếng Albania",
      "nativeName": "Shqip",
      "dir": "ltr"
    },
    "sr-Cyrl": {
      "name": "Tiếng Serbia (Chữ Kirin)",
      "nativeName": "Српски (ћирилица)",
      "dir": "ltr"
    },
    "sr-Latn": {
      "name": "Tiếng Serbia (Chữ La Tinh)",
      "nativeName": "Srpski (latinica)",
      "dir": "ltr"
    },
    "st": {
      "name": "Sesotho",
      "nativeName": "Sesotho",
      "dir": "ltr"
    },
    "sv": {
      "name": "Tiếng Thụy Điển",
      "nativeName": "Svenska",
      "dir": "ltr"
    },
    "sw": {
      "name": "Tiếng Swahili",
      "nativeName": "Kiswahili",
      "dir": "ltr"
    },
    "ta": {
      "name": "Tiếng Tamil",
      "nativeName": "தமிழ்",
      "dir": "ltr"
    },
    "te": {
      "name": "Tiếng Telugu",
      "nativeName": "తెలుగు",
      "dir": "ltr"
    },
    "th": {
      "name": "Tiếng Thái",
      "nativeName": "ไทย",
      "dir": "ltr"
    },
    "ti": {
      "name": "Tiếng Tigrinya",
      "nativeName": "ትግር",
      "dir": "ltr"
    },
    "tk": {
      "name": "Tiếng Turkmen",
      "nativeName": "Türkmen Dili",
      "dir": "ltr"
    },
    "tlh-Latn": {
      "name": "Tiếng Klingon (Chữ La Tinh)",
      "nativeName": "Klingon (Latin)",
      "dir": "ltr"
    },
    "tlh-Piqd": {
      "name": "Tiếng Klingon (pIqaD)",
      "nativeName": "Klingon (pIqaD)",
      "dir": "ltr"
    },
    "tn": {
      "name": "Setswana",
      "nativeName": "Setswana",
      "dir": "ltr"
    },
    "to": {
      "name": "Tiếng Tonga",
      "nativeName": "Lea Fakatonga",
      "dir": "ltr"
    },
    "tr": {
      "name": "Tiếng Thổ Nhĩ Kỳ",
      "nativeName": "Türkçe",
      "dir": "ltr"
    },
    "tt": {
      "name": "Tiếng Tatar",
      "nativeName": "Татар",
      "dir": "ltr"
    },
    "ty": {
      "name": "Tiếng Tahiti",
      "nativeName": "Reo Tahiti",
      "dir": "ltr"
    },
    "ug": {
      "name": "Tiếng Uyghur",
      "nativeName": "ئۇيغۇرچە",
      "dir": "rtl"
    },
    "uk": {
      "name": "Tiếng Ukraina",
      "nativeName": "Українська",
      "dir": "ltr"
    },
    "ur": {
      "name": "Tiếng Urdu",
      "nativeName": "اردو",
      "dir": "rtl"
    },
    "uz": {
      "name": "Tiếng Uzbek",
      "nativeName": "Uzbek (Latin)",
      "dir": "ltr"
    },
    "vi": {
      "name": "Tiếng Việt",
      "nativeName": "Tiếng Việt",
      "dir": "ltr"
    },
    "xh": {
      "name": "Tiếng Xhosa",
      "nativeName": "isiXhosa",
      "dir": "ltr"
    },
    "yo": {
      "name": "Tiếng Yoruba",
      "nativeName": "Èdè Yorùbá",
      "dir": "ltr"
    },
    "yua": {
      "name": "Tiếng Maya Yucatec",
      "nativeName": "Yucatec Maya",
      "dir": "ltr"
    },
    "yue": {
      "name": "Tiếng Quảng Đông (Phồn Thể)",
      "nativeName": "粵語 (繁體)",
      "dir": "ltr"
    },
    "zh-Hans": {
      "name": "Tiếng Trung (Giản Thể)",
      "nativeName": "中文 (简体)",
      "dir": "ltr"
    },
    "zh-Hant": {
      "name": "Tiếng Trung (Phồn Thể)",
      "nativeName": "繁體中文 (繁體)",
      "dir": "ltr"
    },
    "zu": {
      "name": "Tiếng Zulu",
      "nativeName": "Isi-Zulu",
      "dir": "ltr"
    }
  }
};

const Translators = {
  DEEPL_TRANSLATOR: 'deeplTranslator',
  GOOGLE_TRANSLATE: 'googleTranslate',
  LINGVANEX: 'lingvanex',
  PAPAGO: 'papago',
  MICROSOFT_TRANSLATOR: 'microsoftTranslator',
  VIETPHRASE: 'vietphrase',
};

const VietPhraseTranslationAlgorithms = {
  PRIORITIZE_LONG_VIETPHRASE_CLUSTERS: '0',
  TRANSLATE_FROM_LEFT_TO_RIGHT: '1',
};

const VietPhraseMultiplicationAlgorithm = {
  NOT_APPLICABLE: '0',
  MULTIPLICATION_BY_PRONOUNS: '1',
  MULTIPLICATION_BY_PRONOUNS_NAMES: '2',
};