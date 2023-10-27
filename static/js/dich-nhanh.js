'use strict';

const quickTranslateStorage = JSON.parse(localStorage.getItem('dich-nhanh')) ?? {};

const inputTextarea = $('.input-textarea');

const options = $('.option');

const fontOptions = $('.font-option');
const fontSize = $('#font-size');
const lineSpacing = $('#line-spacing');
const alignmentSettings = $('#alignment-settings');

$(document).ready(() => {
  if (Object.keys(quickTranslateStorage).length === 0) return;

  fontOptions.filter(`:contains(${quickTranslateStorage.font})`).click();

  for (let i = 0; i < options.length; i++) {
    if (quickTranslateStorage[options.filter(`:eq(${i})`).attr('name')] == undefined && quickTranslateStorage[options.filter(`:eq(${i})`).attr('id')] == undefined) continue;

    if (options.filter(`:eq(${i})`).attr('name') != undefined && options.filter(`:eq(${i})`).attr('name').startsWith('flexRadio') && options.filter(`:eq(${i})`).val() === quickTranslateStorage[options.filter(`:eq(${i})`).attr('name')]) {
      $(`.option[name="${options.filter(`:eq(${i})`).attr('name')}"]`).removeProp('checked');
      options.filter(`:eq(${i})`).prop('checked', true);
    } else if (options.filter(`:eq(${i})`).attr('id').startsWith('flexSwitchCheck')) {
      options.filter(`:eq(${i})`).prop('checked', quickTranslateStorage[options.filter(`:eq(${i})`).attr('id')]);
    } else if (options.filter(`:eq(${i})`).hasClass('form-range')) {
      options.filter(`:eq(${i})`).val(parseInt(quickTranslateStorage[options.filter(`:eq(${i})`).attr('id')]));
    } else if (options.filter(`:eq(${i})`).hasClass('form-select')) {
      options.filter(`:eq(${i})`).val(quickTranslateStorage[options.filter(`:eq(${i})`).attr('id')]);
    }

    if (!options.filter(`:eq(${i})`).hasClass('translator-option')) {
      options.filter(`:eq(${i})`).change();
    }
  }
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

  quickTranslateStorage.font = $(this).text().split(' (')[0];
  localStorage.setItem('dich-nhanh', JSON.stringify(quickTranslateStorage));
});
fontSize.on('input', function () {
  quickTranslateStorage[$(this).attr('id')] = $(this).val();
  $('#font-size-display').val(quickTranslateStorage[$(this).attr('id')]);
  $(document.body).css('--opt-font-size', `${1 * quickTranslateStorage[$(this).attr('id')] / 100}rem`);
});
$('#font-size-display').on('change', function () {
  fontSize.val($(this).val() < parseInt(fontSize.attr('min')) ? fontSize.attr('min') : ($(this).val() > parseInt(fontSize.attr('max')) ? fontSize.attr('max') : $(this).val())).change();
});
fontSize.change(function () {
  $(this).trigger('input');
  localStorage.setItem('dich-nhanh', JSON.stringify(quickTranslateStorage));
});
lineSpacing.on('input', function () {
  quickTranslateStorage[$(this).attr('id')] = $(this).val();
  $('#line-spacing-display').val(quickTranslateStorage[$(this).attr('id')]);
  $(document.body).css('--opt-line-height', `${1 + (0.5 * quickTranslateStorage[$(this).attr('id')] / 100)}em`);
});
$('#line-spacing-display').on('change', function () {
  lineSpacing.val($(this).val() < parseInt(lineSpacing.attr('min')) ? lineSpacing.attr('min') : ($(this).val() > parseInt(lineSpacing.attr('max')) ? lineSpacing.attr('max') : $(this).val())).change();
});
lineSpacing.change(function () {
  $(this).trigger('input');
  localStorage.setItem('dich-nhanh', JSON.stringify(quickTranslateStorage));
});
alignmentSettings.change(function () {
  quickTranslateStorage[$(this).attr('id')] = $(this).prop('checked');
  $(document.body).css('--opt-text-align', quickTranslateStorage[$(this).attr('id')] ? 'justify' : 'start');
  localStorage.setItem('dich-nhanh', JSON.stringify(quickTranslateStorage));
});