'use strict';

const sourceLanguageSelect = $('#source-language-select');
const targetLanguageSelect = $('#target-language-select');
const translateButton = $('#translate-button');

const copyButton = $('#copy-button');
const pasteButton = $('#paste-button');
const retranslateButton = $('#retranslate-button');

const resetButton = $('#reset-button');

const options = $('.option');

const fontOptions = $('.font-option');
const fontSizeRange = $('#font-size-range');
const lineSpacingRange = $('#line-spacing-range');
const alignmentSettingsSwitch = $('#alignment-settings-switch');
const translatorOptions = $('.translator-option');

const inputTextarea = $('#input-textarea');
const resultTextarea = $('#result-textarea');

let quickTranslateStorage = JSON.parse(localStorage.getItem('dich_nhanh')) ?? {};
let defaultOptions = JSON.parse('{"source_language":"","target_language":"vi","font":"Mặc định","font_size":100,"line_spacing":40,"alignment_settings":true,"translator":"microsoftTranslator"}');

let translateAbortController = null;
let prevScrollTop = 0;

$(document).ready(() => {
  loadAllQuickTranslatorOptions();
});
$(window).on('keydown', (event) => {
  if ($(document.activeElement).is('body') && resultTextarea.is(':visible')) {
    switch (event.key) {
      case 'Home':
        resultTextarea.prop('scrollTop', 0);
        break;
      case 'End':
        translatedTexresultTextareatArea.prop('scrollTop', resultTextarea.prop('scrollTopMax'));
        break;
    }
  }
});
$(visualViewport).resize((event) => $('.textarea').css('max-height', event.target.height - ((event.target.width < 1200 ? 23.28703703703703 : 40.33092037228542) / 100) * event.target.height + 'px'));
translateButton.on('click', function () {
  if (translateAbortController != null) {
    translateAbortController.abort();
    translateAbortController = null;
  }

  switch ($(this).text()) {
    case 'Huỷ':
    case 'Sửa':
      $('#translate-timer').text(0);
      resultTextarea.html(null);
      resultTextarea.hide();
      inputTextarea.show();
      $(this).text('Dịch');
      $('#action-nav .copy-button').data('target', 'input-textarea');
      copyButton.removeClass('disabled');
      pasteButton.removeClass('disabled');
      retranslateButton.addClass('disabled');
      break;

    default:
    case 'Dịch':
      if (inputTextarea.val().length === 0) break;
      copyButton.addClass('disabled');
      pasteButton.addClass('disabled');
      resultTextarea.html(resultTextarea.html().split(/<br>|<\/p><p>/).map((element, index) => index === 0 ? `Đang dịch...${element.slice(12).replace(/./g, ' ')}` : element.replace(/./g, ' ')).join('<br>'));
      inputTextarea.hide();
      resultTextarea.show();
      $(this).text('Huỷ');
      translateAbortController = new AbortController();
      translateTextarea().finally(() => {
        resultTextarea.css('height', 'auto');
        resultTextarea.css('height', resultTextarea.prop('scrollHeight') + 'px');
        translateButton.text('Sửa');
        $('#action-navbar .copy-button').data('target', 'result-textarea');
        copyButton.removeClass('disabled');
        pasteButton.removeClass('disabled');
        retranslateButton.removeClass('disabled');

        if (prevScrollTop > 0) {
          translatedTextArea.prop('scrollTop', prevScrollTop);
          prevScrollTop = 0;
        }
      });
      break;
  }
});
copyButton.on('click', function () {
  const target = $(`#${$(this).data('target')}`);

  if (target.val().length > 0) {
    navigator.clipboard.writeText(target.val());
    target.blur();
  }
});
pasteButton.on('click', function () {
  navigator.clipboard.readText().then((clipText) => $(`#${$(this).data('target')}`).val(clipText).trigger('input'));
});
retranslateButton.click(() => {
  if (translateButton.text() === 'Sửa') {
    prevScrollTop = translatedTextArea.prop('scrollTop');
    translateButton.text('Dịch').click();
  }
});
options.change(function () {
  const optionId = getOptionId($(this).attr('name') != undefined ? $(this).attr('name') : $(this).attr('id'));
  const optionType = getOptionType($(this).attr('name') != undefined ? $(this).attr('name') : $(this).attr('id'));

  if (optionType === OptionTypes.SELECT || optionType === OptionTypes.RADIO) return;
  quickTranslateStorage[optionId] = $(this).val();
  localStorage.setItem('dich_nhanh', JSON.stringify(quickTranslateStorage));
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

  quickTranslateStorage['font'] = $(this).text().includes('Mặc định') ? $(this).text().match(/(.+) \(/)[1] : $(this).text();
  localStorage.setItem('dich_nhanh', JSON.stringify(quickTranslateStorage));
});
fontSizeRange.on('input', function () {
  $('#font-size-display').val(parseInt($(this).val()));
  $(document.body).css('--opt-font-size', `${parseInt($(this).val()) / 100}rem`);
  quickTranslateStorage[getOptionId($(this).attr('id'))] = parseInt($(this).val());
});
$('#font-size-display').on('change', function () {
  fontSizeRange.val($(this).val() < parseInt(fontSizeRange.attr('min')) ? fontSizeRange.attr('min') : ($(this).val() > parseInt(fontSizeRange.attr('max')) ? fontSizeRange.attr('max') : $(this).val())).change();
});
fontSizeRange.change(function () {
  fontSizeRange.trigger('input');
  localStorage.setItem('dich_nhanh', JSON.stringify(quickTranslateStorage));
});
lineSpacingRange.on('input', function () {
  $('#line-spacing-display').val(parseInt($(this).val()));
  $(document.body).css('--opt-line-height', `${1 + (0.5 * parseInt($(this).val()) / 100)}em`);
  quickTranslateStorage[getOptionId($(this).attr('id'))] = parseInt($(this).val());
});
$('#line-spacing-display').on('change', function () {
  lineSpacingRange.val($(this).val() < parseInt(lineSpacingRange.attr('min')) ? lineSpacingRange.attr('min') : ($(this).val() > parseInt(lineSpacingRange.attr('max')) ? lineSpacingRange.attr('max') : $(this).val())).change();
});
lineSpacingRange.change(function () {
  lineSpacingRange.trigger('input');
  localStorage.setItem('dich_nhanh', JSON.stringify(quickTranslateStorage));
});
alignmentSettingsSwitch.change(function () {
  $(document.body).css('--opt-text-align', $(this).prop('checked') ? 'justify' : 'start');
  quickTranslateStorage[getOptionId($(this).attr('id'))] = $(this).prop('checked');
  localStorage.setItem('dich_nhanh', JSON.stringify(quickTranslateStorage));
});
translatorOptions.click(function () {
  translatorOptions.removeClass('active');
  $(this).addClass('active');
  updateLanguageSelect($(this).data('id'), quickTranslateStorage['translator']);
  quickTranslateStorage['translator'] = $(this).data('id');
  localStorage.setItem('dich_nhanh', JSON.stringify(quickTranslateStorage));
  translateButton.text('Dịch').click();
});
resetButton.on('click', () => {
  if (!window.confirm('Bạn có muốn đặt lại tất cả thiết lập chứ?')) return;
  localStorage.setItem('dich_nhanh', JSON.stringify(defaultOptions));
  if (window.confirm('Bạn có muốn tải lại trang chứ?')) location.reload();
});
inputTextarea.on('input', function () {
  $(this).css('height', 'auto');
  $(this).css('height', $(this).prop('scrollHeight') + 'px');
  $(visualViewport).resize();
  queryTextCounter.text($(this).val().length);
});
inputTextarea.on('keypress', (event) => {
  if (!event.shiftKey && event.key === 'Enter') translateButton.click();
});
resultTextarea.on('dblclick', () => {
  translateButton.click();
  queryText.focus();
});

function loadAllQuickTranslatorOptions() {
  if (Object.keys(quickTranslateStorage).length === 0) quickTranslateStorage = getCurrentOptions();

  for (let i = 0; i < options.length; i++) {
    const option = options.eq(i);
    const optionId = getOptionId(option.attr('name') != undefined ? option.attr('name') : option.attr('id'));
    const optionType = getOptionType(option.attr('name') != undefined ? option.attr('name') : option.attr('id'));

    switch (optionType) {
      case OptionTypes.RADIO:
        $(`.option[name="${option.attr('name')}"]`).removeProp('checked');
        option.prop('checked', true).change();
        break;

      case OptionTypes.CHECK:
      case OptionTypes.SWITCH:
        option.prop('checked', quickTranslateStorage[optionId]).change();
        break;

      case OptionTypes.RANGE:
        option.val(quickTranslateStorage[optionId]).change();
        break;

      case OptionTypes.DROPDOWN:
        const values = option.find('.dropdown-menu > li > .dropdown-item');

        switch (optionId) {
          case 'font':
            values.filter(`:contains(${quickTranslateStorage[optionId]})`).click();
            break;

          case 'translator':
            values.filter(`[data-id="${quickTranslateStorage[optionId]}"]`).click();
            break;
        }
        break;

      default:
      case OptionTypes.SELECT:
        option.val(quickTranslateStorage[optionId]).change();
        break;
    }
  }
}

function getCurrentOptions() {
  try {
    const data = {};

    for (let i = 0; i < options.length; i++) {
      const option = options.eq(i);
      const optionId = getOptionId(option.attr('name') != undefined ? option.attr('name') : option.attr('id'));
      const optionType = getOptionType(option.attr('name') != undefined ? option.attr('name') : option.attr('id'));

      switch (optionType) {
        case OptionTypes.RADIO:
          if (option.prop('checked') === true) data[optionId] = option.val();
          break;

        case OptionTypes.CHECK:
        case OptionTypes.SWITCH:
          data[optionId] = option.prop('checked');
          break;

        case OptionTypes.RANGE:
          data[optionId] = parseInt(option.val());
          break;

        case OptionTypes.DROPDOWN:
          const selectedValue = option.find('.dropdown-menu > li > .active');

          switch (optionId) {
            case 'font':
              data.font = selectedValue.text().includes('Mặc định') ? selectedValue.text().match(/(.+) \(/)[1] : selectedValue.text();
              break;

            case 'translator':
              data.translator = selectedValue.data('id');
              break;
          }
          break;

        default:
        case OptionTypes.SELECT:
          data[optionId] = option.val();
          break;
      }
    }
    return data;
  } catch (error) {
    console.error(error);
  }
}

function getOptionId(id) {
  return id.match(/(.+)-(?:select|check|radio|switch|range|dropdown)$/)[1].replace(/-/g, '_');
}

function getOptionType(id) {
  return id.match(/.+-(select|check|radio|switch|range|dropdown)$/)[1];
}

function updateLanguageSelect(translator, prevTranslator) {
  let sourceLanguage = quickTranslateStorage['source_language'];
  let targetLanguage = quickTranslateStorage['target_language'];
  console.log(quickTranslateStorage);
  console.log(1, sourceLanguage, targetLanguage);

  if (translator !== prevTranslator) {
    switch (prevTranslator) {
      case Translators.GOOGLE_TRANSLATE:
        sourceLanguage = GoogleTranslate.getMappedLanguageCode(translator, sourceLanguage) ?? sourceLanguage;
        targetLanguage = GoogleTranslate.getMappedLanguageCode(translator, targetLanguage) ?? targetLanguage;
        break;

      default:
      case Translators.MICROSOFT_TRANSLATOR:
        sourceLanguage = MicrosoftTranslator.getMappedLanguageCode(translator, sourceLanguage) ?? sourceLanguage;
        targetLanguage = MicrosoftTranslator.getMappedLanguageCode(translator, targetLanguage) ?? targetLanguage;
        break;
    }
  }
  console.log(2, sourceLanguage, targetLanguage);

  sourceLanguageSelect.html(getSourceLanguageSelectOptions(translator));
  sourceLanguageSelect.val(sourceLanguage).change();
  targetLanguageSelect.html(getTargetLanguageSelectOptions(translator));
  targetLanguageSelect.val(targetLanguage).change();
}

function getSourceLanguageSelectOptions(translator) {
  const sourceLanguageSelect = document.createElement('select');

  switch (translator) {
    case Translators.GOOGLE_TRANSLATE:
      for (const languageCode in GoogleTranslate.SOURCE_LANGUAGES) {
        const option = document.createElement('option');
        option.innerText = GoogleTranslate.getSourceLanguageName(languageCode);
        option.value = languageCode;
        sourceLanguageSelect.appendChild(option);
      }
      break;

    default:
    case Translators.MICROSOFT_TRANSLATOR:
      for (const languageCode in MicrosoftTranslator.FROM_LANGUAGES) {
        const option = document.createElement('option');
        option.innerText = MicrosoftTranslator.getFromLanguageName(languageCode);
        option.value = languageCode;
        sourceLanguageSelect.appendChild(option);
      }
      break;
  }
  return sourceLanguageSelect.innerHTML;
}

function getTargetLanguageSelectOptions(translator) {
  const targetLanguageSelect = document.createElement('select');

  switch (translator) {
    case Translators.GOOGLE_TRANSLATE:
      for (const languageCode in GoogleTranslate.TARGET_LANGUAGES) {
        const option = document.createElement('option');
        option.innerText = GoogleTranslate.getTargetLanguagesName(languageCode);
        option.value = languageCode;
        targetLanguageSelect.appendChild(option);
      }
      break;

    default:
    case Translators.MICROSOFT_TRANSLATOR:
      for (const languageCode in MicrosoftTranslator.TO_LANGUAGES) {
        const option = document.createElement('option');
        option.innerText = MicrosoftTranslator.getToLanguageName(languageCode);
        option.value = languageCode;
        targetLanguageSelect.appendChild(option);
      }
      break;
  }
  return targetLanguageSelect.innerHTML;
}

async function translateTextarea() {
  const startTime = Date.now();
  const inputText = inputTextarea.val();

  const translatorOption = translatorOptions.filter($('.active')).data('id');

  const sourceLanguage = sourceLanguageSelect.val();
  const targetLanguage = targetLanguageSelect.val();

  const [MAX_LENGTH, MAX_LINE] = getTextMaxLengthAndLine(translatorOption, inputText);

  if (inputText.split(/\n/).sort((a, b) => b.length - a.length)[0].length > MAX_LENGTH) throw new Error(`Số lượng từ trong một dòng quá dài (Số lượng từ hợp lệ nhỏ hơn hoặc bằng ${MAX_LENGTH}). [Lưu ý: Khi sử dụng Dynamic Dictionary và Bảo vệ dấu trích đẫn sẽ làm giảm số lượng từ có thể dịch đi.]`);

  try {
    let result = inputText;
    let results = [];
    let translator = null;

    switch (translatorOption) {
      case Translators.GOOGLE_TRANSLATE:
        translator = await new GoogleTranslate().init();
        break;

      default:
      case Translators.MICROSOFT_TRANSLATOR:
        translator = await new MicrosoftTranslator().init();
        break;
    }

    const inputLines = inputText.split(/\r?\n/);
    let queryLines = [];

    while (inputLines.length > 0 && queryLines.length + 1 <= MAX_LINE && [
      ...queryLines,
      inputLines[0]
    ].join('\n').length <= MAX_LENGTH) {
      if (translateAbortController.signal.aborted) break;
      queryLines.push(inputLines.shift());

      if (inputLines.length === 0 || queryLines.length + 1 >= MAX_LINE || [
        ...queryLines,
        inputLines[0]
      ].join('\n').length >= MAX_LENGTH) {
        results.push(await translator.translateText(sourceLanguage, targetLanguage, queryLines.join('\n')));
        queryLines = [];
      }
    }

    if (translateAbortController.signal.aborted) return;
    result = results.join('\n');
    $('#translate-timer').text(Date.now() - startTime);
    resultTextarea.html(`<p>${result.split(/\n/).join('</p><p>')}</p>`.replace(/(<p>)(<\/p>)/g, '$1<br>$2'));
  } catch (error) {
    console.error(error)
    const paragraph = document.createElement('p');
    paragraph.innerText = `Bản dịch thất bại: ${error}`;
    resultTextarea.html(paragraph);
    translateAbortController = null;
  }
}

function getTextMaxLengthAndLine(translator, text) {
  switch (translator) {
    case Translators.DEEPL_TRANSLATOR:
      return [32768, 50];

    case Translators.GOOGLE_TRANSLATE:
      return [16272, 100];

    case Translators.LINGVANEX:
      return [10000, text.split(/\n/).length];

    case Translators.PAPAGO:
      return [3000, 1500];

    case Translators.MICROSOFT_TRANSLATOR:
      return [50000, 1000];

    default:
      return [
        getGlossaryAppliedText(text, translator).length,
        text.split(/\n/).length
      ];
  }
}

const OptionTypes = {
  SELECT: 'select',
  CHECK: 'check',
  RADIO: 'radio',
  SWITCH: 'switch',
  RANGE: 'range',
  DROPDOWN: 'dropdown',
}