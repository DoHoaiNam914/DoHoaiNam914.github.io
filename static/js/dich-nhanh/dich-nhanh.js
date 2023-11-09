// eslint-disable-line
'use strict';

const sourceLanguageSelect = $('#source-language-select');
const targetLanguageSelect = $('#target-language-select');
const translateButton = $('#translate-button');

const copyButtons = $('.copy-button');
const pasteButtons = $('.paste-button');
const retranslateButton = $('#retranslate-button');

const resetButton = $('#reset-button');

const options = $('.option');

const fontOptions = $('.font-option');
const fontSizeRange = $('#font-size-range');
const lineSpacingRange = $('#line-spacing-range');
const alignmentSettingsSwitch = $('#alignment-settings-switch');
const translatorOptions = $('.translator-option');
const showOriginalTextSwitch = $('#show-original-text-switch');
const vietphrasesInput = $('#vietphrases-input');
const prioritizeNameOverVietphraseCheck = $('#prioritize-name-over-vietphrase-check');
const translationAlgorithmRadio = $('.option[name="translation-algorithm-radio"]');
const multiplicationAlgorithmRadio = $('.option[name="multiplication-algorithm-radio"]');

const inputTextarea = $('#input-textarea');
const resultTextarea = $('#result-textarea');

const glossaryInput = $('#glossary-input');
const glossaryType = $('#glossary-type');
const sourcePairInput = $('#source-pair-input')
const targetPairInput = $('#target-pair-input');
const addButton = $('#add-button');
const removeButton = $('#remove-button');
const glossaryDataList = $('#glossary-data-list');
const glossaryName = $('#glossary-name');

const defaultOptions = JSON.parse('{"source_language":"","target_language":"vi","font":"Mặc định","font_size":100,"line_spacing":40,"alignment_settings":true,"translator":"microsoftTranslator","show_original_text":false,"glossary":true,"language_pairs":"zh-vi"}');

let quickTranslateStorage = JSON.parse(localStorage.getItem('dich_nhanh')) ?? {};
let glossary = JSON.parse(localStorage.getItem('glossary')) ?? {};

const vietphraseData = {
    pinyins: {},
    chinesePhienAmWords: {},
    vietphrases: {},
    pronouns: {},
    cacLuatnhan: {}
};

let glossaryData = '';
let translateAbortController = null;
let prevScrollTop = 0;

let lastSession = {};

$(document).ready(async () => {
    loadAllQuickTranslatorOptions();
    reloadGlossaryEntries();

    try {
        let pinyinList = [];

        await $.ajax({
            method: 'GET',
            url: '/static/datasource/Unihan_Readings.txt'
        }).done((data) => {
            pinyinList = data.split(/\r?\n/).filter((element) => element.startsWith('U+')).map((element) => element.substring(2).split(/\t/)).map(([first, second]) => [String.fromCodePoint(parseInt(first, 16)), second]);
            vietphraseData.pinyins = Object.fromEntries(pinyinList);
        });
        await $.ajax({
            method: 'GET',
            url: '/static/datasource/Bính âm.txt'
        }).done((data) => pinyinList = [...pinyinList, ...data.split(/\r?\n/).map((element) => element.split('=')).sort((a, b) => b[0].length - a[0].length).map(([first, second]) => [first, second.split('ǀ')[0]]).filter(([first]) => !vietphraseData.pinyins.hasOwnProperty(first))]);
        pinyinList = pinyinList.filter(([first, second], index, array) => first !== '' && second != undefined && !array[first] && (array[first] = 1), {})
        vietphraseData.pinyins = Object.fromEntries(pinyinList);
        console.log('Đã tải xong bộ dữ liệu bính âm (%d)!', pinyinList.length);
        lastSession = {}
    } catch (error) {
        console.error('Không thể tải bộ dữ liệu bính âm:', error);
        setTimeout(window.location.reload, 5000);
    }

    try {
        let chinesePhienAmWordList = [...specialSinovietnameseData.map(([first, second, third]) => [first, (Object.fromEntries(specialSinovietnameseData.filter(([, second]) => !/\p{sc=Hani}/u.test(second)).map(([first, second, third]) => [first, third ?? second]))[second] ?? third ?? second).split(', ')[0].toLowerCase()]), ...hanData.names.map(([first, second]) => [first, second.split(',').filter((element) => element.length > 0)[0]])];

        await $.ajax({
            method: 'GET',
            url: '/static/datasource/ChinesePhienAmWords của thtgiang.txt'
        }).done((data) => {
            chinesePhienAmWordList = [...chinesePhienAmWordList, ...data.split(/\r?\n/).map((element) => element.split('=')).filter(([first]) => !vietphraseData.chinesePhienAmWords.hasOwnProperty(first))];
            vietphraseData.chinesePhienAmWords = Object.fromEntries(chinesePhienAmWordList);
        });
        await $.ajax({
            method: 'GET',
            url: '/static/datasource/TTV Translate.ChinesePhienAmWords.txt'
        }).done((data) => {
            chinesePhienAmWordList = [...chinesePhienAmWordList, ...data.split(/\r?\n/).map((element) => element.split('=')).filter(([first]) => !vietphraseData.chinesePhienAmWords.hasOwnProperty(first))];
            vietphraseData.chinesePhienAmWords = Object.fromEntries(chinesePhienAmWordList);
        });
        await $.ajax({
            method: 'GET',
            url: '/static/datasource/QuickTranslate2020 - ChinesePhienAmWords.txt'
        }).done((data) => {
            chinesePhienAmWordList = [...chinesePhienAmWordList, ...data.split(/\r?\n/).map((element) => element.split('=')).filter(([first]) => !vietphraseData.chinesePhienAmWords.hasOwnProperty(first))];
            vietphraseData.chinesePhienAmWords = Object.fromEntries(chinesePhienAmWordList);
        });
        await $.ajax({
            method: 'GET',
            url: '/static/datasource/Hán việt.txt'
        }).done((data) => chinesePhienAmWordList = [...chinesePhienAmWordList, ...data.split(/\r?\n/).map((element) => element.split('=')).sort((a, b) => b[0].length - a[0].length).map(([first, second]) => [first, second.split('ǀ')[0]]).filter(([first]) => !vietphraseData.chinesePhienAmWords.hasOwnProperty(first))]);
        chinesePhienAmWordList = chinesePhienAmWordList.filter(([first, second], index, array) => first !== '' && !/\p{sc=Latin}/u.test(first) && second != undefined && !array[first] && (array[first] = 1), {});
        newAccentData.forEach(([a, b]) => chinesePhienAmWordList = chinesePhienAmWordList.map(([c, d]) => [c, d.replace(new RegExp(a, 'gi'), b)]));
        vietphraseData.chinesePhienAmWords = Object.fromEntries(chinesePhienAmWordList);
        console.log('Đã tải xong bộ dữ liệu hán việt (%d)!', chinesePhienAmWordList.length);
        lastSession = {}
    } catch (error) {
        console.error('Không thể tải bộ dữ liệu hán việt:', error);
        setTimeout(window.location.reload, 5000);
    }

    await $.ajax({
        method: 'GET',
        url: '/static/datasource/Pronouns.txt'
    }).done((data) => {
        vietphraseData.pronouns = Object.fromEntries(data.split(/\r?\n/).map((element) => element.split('=')).filter((element) => element.length === 2).map(([first, second]) => [first, second.split('/')[0]]));
        console.log('Đã tải xong tệp Pronouns.txt (%d)!', Object.entries(vietphraseData.pronouns).length);
        lastSession = {}
    }).fail((jqXHR, textStatus, errorThrown) => {
        console.error('Không tải được tệp Pronouns.txt:', errorThrown);
        setTimeout(window.location.reload, 5000);
    });
    await $.ajax({
        method: 'GET',
        url: '/static/datasource/LuatNhan.txt'
    }).done((data) => {
        vietphraseData.cacLuatnhan = Object.fromEntries(data.split(/\r?\n/).map((element) => element.split('=')).filter((element) => element.length === 2));
        console.log('Đã tải xong tệp LuatNhan.txt (%d)!', Object.entries(vietphraseData.cacLuatnhan).length);
        lastSession = {}
    }).fail((jqXHR, textStatus, errorThrown) => {
        console.error('Không tải được tệp LuatNhan.txt:', errorThrown);
        setTimeout(window.location.reload, 5000);
    });

    if (Object.entries(vietphraseData.vietphrases).length === 0) {
        await $.ajax({
            method: 'GET',
            url: '/static/datasource/VietPhrase.txt'
        }).done((data) => {
            let vietphraseList = [...data.split(/\r?\n/).map((element) => element.split('=')).filter((element) => element.length === 2).map(([first, second]) => [first, second.split('/')[0].split('|')[0]]), ...Object.entries(vietphraseData.chinesePhienAmWords)];
            vietphraseList = vietphraseList.filter(([first, second], index, array) => first !== '' && second != undefined && !array[first] && (array[first] = 1), {})
            if (vietphrasesInput.prop('files') == undefined) return;
            vietphraseData.vietphrases = Object.fromEntries(vietphraseList);
            console.log('Đã tải xong tệp VietPhrase.txt (%d)!', vietphraseList.length);
            lastSession = {}
        }).fail((jqXHR, textStatus, errorThrown) => {
            console.error('Không tải được tệp VietPhrase.txt:', errorThrown);
        });
    }

    inputTextarea.trigger('input');
});
$(window).on('keydown', (event) => {
    if ($(document.activeElement).is('body') && resultTextarea.is(':visible')) {
        switch (event.key) {
            case 'Home':
                resultTextarea.prop('scrollTop', 0);
                break;

            case 'End':
                resultTextarea.prop('scrollTop', resultTextarea.prop('scrollTopMax'));
                break;
        }
    }
});
$(visualViewport).resize((event) => $('.textarea').css('max-height', `${event.target.height - ((event.target.width < 1200 ? 23.28703703703703 : 40.33092037228542) / 100) * event.target.height}px`));
translateButton.on('click', function () {
    if (translateAbortController != null) {
        translateAbortController.abort();
        translateAbortController = null;
    }

    const copyButton = $('#action-navbar .copy-button');

    switch ($(this).text()) {
        case 'Huỷ':
        case 'Sửa':
            $('#translate-timer').text(0);
            resultTextarea.html(null);
            resultTextarea.hide();
            inputTextarea.show();
            $(this).text('Dịch');
            copyButton.data('target', '#input-textarea');
            copyButton.removeClass('disabled');
            $('#action-nav .paste-button').removeClass('disabled');
            retranslateButton.addClass('disabled');
            break;

        default:
        case 'Dịch':
            if (inputTextarea.val().length === 0) break;
            copyButton.addClass('disabled');
            $('#action-navbar .paste-button').addClass('disabled');
            resultTextarea.html(resultTextarea.html().split(/<br>|<\/p><p>/).map((element, index) => (index === 0 ? `Đang dịch...${element.slice(12).replace(/./g, ' ')}` : element.replace(/./g, ' '))).join('<br>'));
            inputTextarea.hide();
            resultTextarea.show();
            $(this).text('Huỷ');
            translateAbortController = new AbortController();
            translateTextarea().finally(() => {
                resultTextarea.css('height', 'auto');
                resultTextarea.css('height', `${resultTextarea.prop('scrollHeight')}px`);
                translateButton.text('Sửa');
                const copyButton = $('#action-navbar .copy-button');
                copyButton.data('target', '#result-textarea');
                copyButton.removeClass('disabled');
                $('#action-navbar .paste-button').removeClass('disabled');
                retranslateButton.removeClass('disabled');

                if (prevScrollTop > 0) {
                    resultTextarea.prop('scrollTop', prevScrollTop);
                    prevScrollTop = 0;
                }
            });

            break;
    }
});
copyButtons.on('click', async function () {
    if ($(this).data('target') === '#result-textarea') {
        if (Object.keys(lastSession).length > 0) {
            await navigator.clipboard.writeText(lastSession.result);
        }

        return;
    } else if ($(this).data('target') === '#glossary-data-list') {
        if (glossaryData.length > 0) {
            await navigator.clipboard.writeText(glossaryData);
        }

        return;
    }

    const target = $($(this).data('target'));

    if (target.val().length > 0) {
        await navigator.clipboard.writeText(target.val());
        target.blur();
    }
});
pasteButtons.on('click', async function () {
    await navigator.clipboard.readText().then((clipText) => {
        if ($(this).data('target') === '#input-textarea') {
            resultTextarea.prop('scrollTop', 0);
            $($(this).data('target')).val(clipText).trigger('input');
            retranslateButton.click();
        } else {
            $($(this).data('target')).val(clipText).trigger('input');
        }
    });
});
retranslateButton.click(function () {
    if (!$(this).hasClass('disabled')) {
        prevScrollTop = resultTextarea.prop('scrollTop');
        translateButton.text('Dịch').click();
    }
});
$('#glossary-management-button').on('mousedown', () => {
    glossaryDataList.val('').change();
    sourcePairInput.val(getSelectedTextOrActiveElementText()).trigger('input');
});
options.change(function () {
    const optionId = getOptionId($(this).attr('name') != undefined ? $(this).attr('name') : $(this).attr('id'));
    const optionType = getOptionType($(this).attr('name') != undefined ? $(this).attr('name') : $(this).attr('id'));

    if (optionType !== OptionTypes.SELECT && optionType !== OptionTypes.CHECK && optionType !== OptionTypes.RADIO && optionType !== OptionTypes.SWITCH) return;
    if (optionType === OptionTypes.RADIO) {
        options.filter(`[name="${$(this).attr('name')}"]`).removeAttr('checked');
        $(this).attr('checked', true);
    }

    if (optionType === OptionTypes.CHECK || optionType === OptionTypes.SWITCH) {
        quickTranslateStorage[optionId] = $(this).prop('checked');
    } else {
        quickTranslateStorage[optionId] = $(this).val();
    }

    localStorage.setItem('dich_nhanh', JSON.stringify(quickTranslateStorage));

    if ($(this).hasClass('quick-translate-option')) {
        lastSession = {};
        retranslateButton.click();
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
    $(this).trigger('input');
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
    $(this).trigger('input');
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
    retranslateButton.click();
});
vietphrasesInput.on('change', function () {
    const reader = new FileReader();
    reader.onload = function () {
        let vietphraseList = this.result.split(/\r?\n/).map((element) => element.split(vietphrasesInput.prop('files')[0].type === 'text/tab-separated-values' ? '\t' : '=')).filter((element) => element.length === 2).map(([first, second]) => [first, second.split('/')[0].split('|')[0]]);
        vietphraseList = [...vietphraseList, ...Object.entries(vietphraseData.chinesePhienAmWords)].filter(([first, second], index, array) => first !== '' && second != undefined && !array[first] && (array[first] = 1), {})
        vietphraseData.vietphrases = Object.fromEntries(vietphraseList);
        console.log('Đã tải xong tệp VietPhrase.txt (%d)!', vietphraseList.length);
        lastSession = {};
    };
    reader.readAsText($(this).prop('files')[0]);
});
prioritizeNameOverVietphraseCheck.change(function () {
    quickTranslateStorage[getOptionId($(this).attr('id'))] = $(this).prop('checked');
    localStorage.setItem('dich_nhanh', JSON.stringify(quickTranslateStorage));
    retranslateButton.click();
});
resetButton.on('click', () => {
    if (!window.confirm('Bạn có muốn đặt lại tất cả thiết lập chứ?')) return;
    localStorage.setItem('dich_nhanh', JSON.stringify(defaultOptions));
    if (window.confirm('Bạn có muốn tải lại trang ngay chứ?')) location.reload();
});
glossaryInput.on('change', function () {
    const reader = new FileReader();

    reader.onload = function () {
        switch (glossaryInput.prop('files')[0].type) {
            case GlossaryType.CSV:
                glossary = $.csv.toObjects(this.result);
                glossaryType.val(GlossaryType.CSV);
                break;

            case GlossaryType.VIETPHRASE:
                glossary = Object.fromEntries(this.result.split(/\r?\n/).map((phrase) => phrase.split('=')).filter((phrase) => phrase.length >= 2));
                glossaryType.val(GlossaryType.VIETPHRASE);
                break;

            default:
            case GlossaryType.TSV:
                glossary = Object.fromEntries(this.result.split(/\r?\n/).map((phrase) => phrase.split(/\t/)).filter((phrase) => phrase.length >= 2));
                glossaryType.val(GlossaryType.TSV);
                break;
        }

        glossaryName.val(glossaryInput.prop('files')[0].name.split('.').slice(0, glossaryInput.prop('files')[0].name.split('.').length - 1).join('.'));
        reloadGlossaryEntries();
    };
    reader.readAsText($(this).prop('files')[0]);
});
$('#clear-button').on('click', () => {
    if (!window.confirm('Bạn có muốn xoá sạch bảng thuật ngữ chứ?')) return;
    glossary = {};
    glossaryName.val(null);
    reloadGlossaryEntries();
    glossaryInput.val('');
});
glossaryType.on('change', () => reloadGlossaryEntries());
sourcePairInput.on('input', async function () {
    const inputText = $(this).val();

    if (inputText.length > 0) {
        if (glossary.hasOwnProperty(inputText)) {
            targetPairInput.val(applyGlossaryToText(inputText));
            glossaryDataList.val(inputText);
        } else {
            targetPairInput.val(/\p{sc=Hani}/u.test(inputText) ? await translateText(inputText, Translators.VIETPHRASE, 'sinoVietnamese', true) : inputText);
            glossaryDataList.val('');
        }

        addButton.removeClass('disabled');
        removeButton.removeClass('disabled');
    } else {
        glossaryDataList.val('').change();
        addButton.addClass('disabled');
        removeButton.addClass('disabled');
    }
});
$('.dropdown-toggle').on('click', () => $('.dropdown-scroller').prop('scrollTop', 0));
$('#source-pair-dropdown').on('mousedown', (event) => event.preventDefault());
$('.define-button').on('click', function () {
    if (sourcePairInput.val().length > 0) {
        window.open($(this).data('href').replace('${0}', encodeURIComponent((sourcePairInput.val().substring(sourcePairInput.prop('selectionStart'), sourcePairInput.prop('selectionEnd')) || sourcePairInput.val()).substring(0, 30).trim())));
        sourcePairInput.blur();
    }
});
$('.translate-webpage-button').on('click', function () {
    if (sourcePairInput.val().length > 0) {
        window.open($(this).data('href').replace('${0}', encodeURIComponent(sourcePairInput.val().trimEnd())));
        sourcePairInput.blur();
    }
});
$('.upper-case-button').on('click', function () {
    if (targetPairInput.val().length > 0) targetPairInput.val(targetPairInput.val().split(' ').map((element, index) => element = $(this).data('amount') === '#' ? element.charAt(0).toUpperCase() + element.slice(1) : (index < $(this).data('amount') ? element.charAt(0).toUpperCase() + element.slice(1) : element.toLowerCase())).join(' '));
});
$('.translate-button').on('click', async function () {
    const inputText = sourcePairInput.val();

    const translatorOption = $(this).data('translator');
    const targetLanguage = $(this).data('lang');

    if (inputText.length > 0) {
        targetPairInput.val(await translateText(inputText, translatorOption, targetLanguage, false));
    }
});
addButton.on('click', () => {
    glossary[sourcePairInput.val().trim()] = targetPairInput.val().trim();
    reloadGlossaryEntries();
    glossaryDataList.change();
    glossaryInput.val(null);
});
removeButton.on('click', () => {
    if (glossary.hasOwnProperty(sourcePairInput.val())) {
        if (window.confirm('Bạn có muốn xoá cụm từ này chứ?')) {
            delete glossary[sourcePairInput.val()];
            reloadGlossaryEntries();
            glossaryInput.val(null);
            sourcePairInput.trigger('input');
        }
    } else {
        glossaryDataList.val('').change();
    }
});
glossaryDataList.change(function () {
    if (glossary.hasOwnProperty($(this).val())) {
        sourcePairInput.val($(this).val()).trigger('input');
        removeButton.removeClass('disabled');
    } else {
        sourcePairInput.val(null);
        targetPairInput.val(null);
        removeButton.addClass('disabled');
    }
});
inputTextarea.on('input', function () {
    $(this).css('height', 'auto');
    $(this).css('height', `${$(this).prop('scrollHeight')}px`);
    $(visualViewport).resize();
    $('#input-textarea-counter').text($(this).val().length);
});
inputTextarea.on('keypress', (event) => {
    if (!event.shiftKey && event.key === 'Enter') translateButton.click();
});
resultTextarea.on('dblclick', () => {
    translateButton.click();
    inputTextarea.focus();
});

function getSelectedTextOrActiveElementText() {
    return window.getSelection().toString() || ((document.activeElement.tagName === 'TEXTAREA' || (document.activeElement.tagName === 'INPUT' && /^(?:email|month|number|search|tel|text|url|week)$/i.test(document.activeElement.type))) && typeof document.activeElement.selectionStart === 'number' && document.activeElement.value.slice(document.activeElement.selectionStart, document.activeElement.selectionEnd)) || '';
}

function loadAllQuickTranslatorOptions() {
    if (Object.keys(quickTranslateStorage).length === 0) quickTranslateStorage = getCurrentOptions();

    for (let i = 0; i < options.length; i++) {
        const option = options.eq(i);
        const optionId = getOptionId(option.attr('name') != undefined ? option.attr('name') : option.attr('id'));
        const optionType = getOptionType(option.attr('name') != undefined ? option.attr('name') : option.attr('id'));

        switch (optionType) {
            case OptionTypes.RADIO:
                if (option.val() === quickTranslateStorage[optionId]) {
                    $(`.option[name="${option.attr('name')}"]`).removeAttr('checked');
                    option.attr('checked', true);
                }

                break;

            case OptionTypes.CHECK:
            case OptionTypes.SWITCH:
                option.attr('checked', quickTranslateStorage[optionId]).change();
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
                option.val(quickTranslateStorage[optionId]);
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

    if (translator !== prevTranslator) {
        switch (prevTranslator) {
            case Translators.DEEPL_TRANSLATOR:
                sourceLanguage = DeepLTranslator.getMappedSourceLanguageCode(translator, sourceLanguage) ?? sourceLanguage;
                targetLanguage = DeepLTranslator.getMappedTargetLanguageCode(translator, targetLanguage) ?? targetLanguage;
                break;

            case Translators.GOOGLE_TRANSLATE:
                sourceLanguage = GoogleTranslate.getMappedSourceLanguageCode(translator, sourceLanguage) ?? sourceLanguage;
                targetLanguage = GoogleTranslate.getMappedTargetLanguageCode(translator, targetLanguage) ?? targetLanguage;
                break;

            case Translators.PAPAGO:
                sourceLanguage = Papago.getMappedSourceLanguageCode(translator, sourceLanguage) ?? sourceLanguage;
                targetLanguage = Papago.getMappedTargetLanguageCode(translator, targetLanguage) ?? targetLanguage;
                break;

            case Translators.VIETPHRASE:
                sourceLanguage = Vietphrase.getMappedSourceLanguageCode(translator, sourceLanguage);
                targetLanguage = Vietphrase.getMappedTargetLanguageCode(translator, targetLanguage);
                break;

            default:
            case Translators.MICROSOFT_TRANSLATOR:
                sourceLanguage = MicrosoftTranslator.getMappedSourceLanguageCode(translator, sourceLanguage) ?? sourceLanguage;
                targetLanguage = MicrosoftTranslator.getMappedTargetLanguageCode(translator, targetLanguage) ?? targetLanguage;
                break;
        }
    }

    sourceLanguageSelect.html(getSourceLanguageSelectOptions(translator));
    sourceLanguageSelect.val(sourceLanguage).change();
    targetLanguageSelect.html(getTargetLanguageSelectOptions(translator));
    targetLanguageSelect.val(targetLanguage).change();
}

function getSourceLanguageSelectOptions(translator) {
    const sourceLanguageSelect = document.createElement('select');

    switch (translator) {
        case Translators.DEEPL_TRANSLATOR:
            DeepLTranslator.SOURCE_LANGUAGES.forEach(({language}) => {
                const option = document.createElement('option');
                option.innerText = DeepLTranslator.getSourceLangName(language);
                option.value = language;
                sourceLanguageSelect.appendChild(option);
            });

            break;

        case Translators.GOOGLE_TRANSLATE:
            Object.entries(GoogleTranslate.SOURCE_LANGUAGES).forEach(([languageCode]) => {
                const option = document.createElement('option');
                option.innerText = GoogleTranslate.getSlName(languageCode);
                option.value = languageCode;
                sourceLanguageSelect.appendChild(option);
            });

            break;

        case Translators.PAPAGO:
            Object.entries(Papago.SOURCE_LANGUAGES).forEach(([languageCode]) => {
                const option = document.createElement('option');
                option.innerText = Papago.getSourceName(languageCode);
                option.value = languageCode;
                sourceLanguageSelect.appendChild(option);
            });

            break;

        case Translators.VIETPHRASE:
            Object.entries(Vietphrase.SOURCE_LANGUAGES).forEach(([languageCode]) => {
                const option = document.createElement('option');
                option.innerText = Vietphrase.getSourceLanguageName(languageCode);
                option.value = languageCode;
                sourceLanguageSelect.appendChild(option);
            });

            break;

        default:
        case Translators.MICROSOFT_TRANSLATOR:
            Object.entries(MicrosoftTranslator.FROM_LANGUAGES).forEach(([languageCode]) => {
                const option = document.createElement('option');
                option.innerText = MicrosoftTranslator.getFromName(languageCode);
                option.value = languageCode;
                sourceLanguageSelect.appendChild(option);
            });

            break;
    }

    return sourceLanguageSelect.innerHTML;
}

function getTargetLanguageSelectOptions(translator) {
    const targetLanguageSelect = document.createElement('select');

    switch (translator) {
        case Translators.DEEPL_TRANSLATOR:
            DeepLTranslator.TARGET_LANGUAGES.forEach(({language}) => {
                const option = document.createElement('option');
                option.innerText = DeepLTranslator.getTargetLangName(language);
                option.value = language;
                targetLanguageSelect.appendChild(option);
            });

            break;

        case Translators.GOOGLE_TRANSLATE:
            Object.entries(GoogleTranslate.TARGET_LANGUAGES).forEach(([languageCode]) => {
                const option = document.createElement('option');
                option.innerText = GoogleTranslate.getTlName(languageCode);
                option.value = languageCode;
                targetLanguageSelect.appendChild(option);
            });

            break;

        case Translators.PAPAGO:
            Object.entries(Papago.TARGET_LANGUAGES).forEach(([languageCode]) => {
                const option = document.createElement('option');
                option.innerText = Papago.getTargetName(languageCode);
                option.value = languageCode;
                targetLanguageSelect.appendChild(option);
            });

            break;

        case Translators.VIETPHRASE:
            Object.entries(Vietphrase.TARGET_LANGUAGES).forEach(([languageCode]) => {
                const option = document.createElement('option');
                option.innerText = Vietphrase.getTargetLanguageName(languageCode);
                option.value = languageCode;
                targetLanguageSelect.appendChild(option);
            });

            break;

        default:
        case Translators.MICROSOFT_TRANSLATOR:
            Object.entries(MicrosoftTranslator.TO_LANGUAGES).forEach(([languageCode]) => {
                const option = document.createElement('option');
                option.innerText = MicrosoftTranslator.getToName(languageCode);
                option.value = languageCode;
                targetLanguageSelect.appendChild(option);
            });

            break;
    }

    return targetLanguageSelect.innerHTML;
}

async function translateText(inputText, translatorOption, targetLanguage, useGlossary) {
    try {
        inputText = useGlossary && translatorOption === Translators.VIETPHRASE && prioritizeNameOverVietphraseCheck.prop('checked') ? applyGlossaryToText(inputText, translatorOption) : inputText;
        let translator = null;
        let sourceLanguage = '';

        switch (translatorOption) {
            case Translators.DEEPL_TRANSLATOR:
                translator = await new DeepLTranslator().init();
                sourceLanguage = DeepLTranslator.DETECT_LANGUAGE;
                break;

            case Translators.GOOGLE_TRANSLATE:
                translator = await new GoogleTranslate().init();
                sourceLanguage = GoogleTranslate.DETECT_LANGUAGE;
                break;

            case Translators.PAPAGO:
                translator = await new Papago().init();
                sourceLanguage = Papago.DETECT_LANGUAGE;
                break;

            case Translators.VIETPHRASE:
                translator = await new Vietphrase(vietphraseData, translationAlgorithmRadio.filter('[checked]').val(), multiplicationAlgorithmRadio.filter('[checked]').val(), $('#ttvtranslate-mode-switch').prop('checked'), useGlossary, glossary, prioritizeNameOverVietphraseCheck.prop('checked'));
                sourceLanguage = Vietphrase.DefaultLanguage.SOURCE_LANGUAGE;
                break;

            default:
            case Translators.MICROSOFT_TRANSLATOR:
                translator = await new MicrosoftTranslator().init();
                sourceLanguage = MicrosoftTranslator.AUTODETECT;
                break;
        }

        if (translatorOption === Translators.DEEPL_TRANSLATOR && translator.usage.character_count + inputText.length > translator.usage.character_limit) throw `Lỗi DeepL Translator: Đã đạt đến giới hạn dịch của tài khoản. (${translator.usage.character_count}/${translator.usage.character_limit} ký tự).`;
        return await translator.translateText(sourceLanguage, targetLanguage, inputText);
    } catch (error) {
        console.error(error)
        targetPairInput.val(`Bản dịch thất bại: ${error}`);
    }
}

function applyGlossaryToText(text, translator = '') {
    const glossaryEntries = Object.entries(glossary).filter(([first]) => text.includes(first));
    let newText = text;

    if (glossaryEntries.length > 0) {
        const lines = text.split(/\n/);
        const results = [];

        const glossaryLengths = [...glossaryEntries.map(([first]) => first.length), 1].sort((a, b) => b - a).filter((element, index, array) => element > 0 && index === array.indexOf(element));

        for (let i = 0; i < lines.length; i++) {
            const chars = lines[i];

            let tempLine = '';
            let prevPhrase = '';

            for (let j = 0; j < chars.length; j++) {
                glossaryLengths.forEach((element) => {
                    const phrase = translator === Translators.DEEPL_TRANSLATOR || translator === Translators.GOOGLE_TRANSLATE ? Utils.convertHtmlToText(chars.substring(j, j + element)) : chars.substring(j, j + element);

                    if (glossary.hasOwnProperty(phrase)) {
                        if (glossary[phrase].length > 0) {
                            tempLine += (j > 0 && /[\p{Lu}\p{Ll}\p{Nd}]/u.test(prevPhrase || tempLine[tempLine.length - 1] || '') ? ' ' : '') + getIgnoreTranslationMarkup(phrase, glossary[phrase], translator);
                            prevPhrase = glossary[phrase];
                        }

                        j += element - 1;
                        return false;
                    } else if (element === 1) {
                        tempLine += (j > 0 && /[\p{Lu}\p{Ll}\p{Nd}]/u.test(chars[j]) && /[\p{Lu}\p{Ll}\p{Nd}]/u.test(prevPhrase || '') ? ' ' : '') + (translator === Translators.DEEPL_TRANSLATOR || translator === Translators.GOOGLE_TRANSLATE ? Utils.convertTextToHtml(chars[j]) : chars[j]);
                        prevPhrase = '';
                    }
                });
                results.push(tempLine);
            }

            newText = results.join('\n');
        }
    }
    return newText;
}

function getIgnoreTranslationMarkup(text, translation, translator) {
    switch (translator) {
        case Translators.DEEPL_TRANSLATOR:
        case Translators.GOOGLE_TRANSLATE:
            // case Translators.PAPAGO:
            return `<span translate="no">${Utils.convertTextToHtml(translation)}</span>`;

        case Translators.MICROSOFT_TRANSLATOR:
            return `<mstrans:dictionary translation="${/\p{sc=Hani}/u.test(text) && /\p{sc=Latn}/u.test(translation) ? ` ${translation} ` : translation}">${text}</mstrans:dictionary>`;

        default:
            return translation;
    }
}

function reloadGlossaryEntries() {
    const entrySelect = document.createElement('select');

    const defaultOption = document.createElement('option');
    defaultOption.innerText = 'Chọn...';
    defaultOption.value = '';
    entrySelect.appendChild(defaultOption);

    let glossaryEntries = Object.entries(glossary);

    const downloadButton = $('#download-button');
    const glossaryExtension = $('#glossary-extension');

    if (glossaryEntries.length > 0) {
        glossary = Object.fromEntries(glossaryEntries.sort((a, b) => /\p{Lu}/u.test(b[1][0]) - /\p{Lu}/u.test(a[1][0]) || a[0].startsWith(b[0]) || a[1].localeCompare(b[1], 'vi', {ignorePunctuation: true}) || a[0].localeCompare(b[0], 'vi', {ignorePunctuation: true}) || b[0].length - a[0].length));
        glossaryEntries = Object.entries(glossary);

        glossaryEntries.forEach(([first, second]) => {
            const option = document.createElement('option');
            option.innerText = `${first} → ${second}`;
            option.value = first;
            entrySelect.appendChild(option);
        });

        switch (glossaryType.val()) {
            case GlossaryType.CSV:
                glossaryData = $.csv.fromArrays(glossaryEntries);
                glossaryExtension.text('csv');
                break;

            case GlossaryType.VIETPHRASE:
                glossaryData = glossaryEntries.map((element) => (element.length > 2 ? element.splice(2, glossary.length - 2) : element).join('=')).join('\n');
                glossaryExtension.text('txt');
                break;

            default:
            case GlossaryType.TSV:
                glossaryData = glossaryEntries.map((element) => (element.length > 2 ? element.splice(2, glossary.length - 2) : element).join('\t')).join('\n');
                glossaryExtension.text('tsv');
                break;
        }

        downloadButton.attr('href', URL.createObjectURL(new Blob([glossaryData], {type: `${glossaryType};charset=UTF-8`})));
        downloadButton.attr('download', `${glossaryName.val().length > 0 ? glossaryName.val() : glossaryName.attr('placeholder')}.${glossaryExtension.text()}`);
        downloadButton.removeClass('disabled');
    } else {
        glossaryData = '';
        downloadButton.removeAttr('href');
        downloadButton.removeAttr('download');
        downloadButton.addClass('disabled');
    }

    glossaryDataList.html(entrySelect.innerHTML);
    glossaryDataList.val('');
    $('#glossary-counter').text(glossaryEntries.length);
    localStorage.setItem('glossary', JSON.stringify(glossary));
}

async function translateTextarea() {
    const startTime = Date.now();

    const inputText = inputTextarea.val();

    const translatorOption = translatorOptions.filter($('.active')).data('id');
    const sourceLanguage = sourceLanguageSelect.val();
    const targetLanguage = targetLanguageSelect.val();

    const glossaryEnabled = $('#glossary-switch').prop('checked');

    const languagePairs = $('#language-pairs-select').val();
    const glossaryLanguageSource = languagePairs.split('-')[0];
    const glossaryLanguageTarget = languagePairs.split('-')[1];

    let processText = glossaryEnabled && (translatorOption === Translators.VIETPHRASE ? prioritizeNameOverVietphraseCheck.prop('checked') && targetLanguage === 'vi' : sourceLanguage.split('-')[0].toLowerCase() === glossaryLanguageSource && targetLanguage.split('-')[0].toLowerCase() === glossaryLanguageTarget) ? applyGlossaryToText(inputText, translatorOption) : inputText;
    processText = glossaryEnabled && (translatorOption === Translators.DEEPL_TRANSLATOR || translatorOption === Translators.GOOGLE_TRANSLATE) && sourceLanguage.split('-')[0].toLowerCase() === glossaryLanguageSource && targetLanguage.split('-')[0].toLowerCase() === glossaryLanguageTarget ? Utils.convertHtmlToText(processText) : processText;

    const [MAX_LENGTH, MAX_LINE] = getMaxQueryLengthAndLine(translatorOption, processText);

    if (processText.split(/\n/).sort((a, b) => b.length - a.length)[0].length > MAX_LENGTH) throw `Số lượng từ trong một dòng quá dài (Số lượng từ hợp lệ nhỏ hơn hoặc bằng ${MAX_LENGTH}). [Lưu ý: Khi sử dụng Dynamic Dictionary và Bảo vệ dấu trích đẫn sẽ làm giảm số lượng từ có thể dịch đi.]`;

    try {
        let result = '';

        if (Object.keys(lastSession).length > 0 && lastSession.inputText === (glossaryEnabled && (translatorOption === Translators.VIETPHRASE ? targetLanguage === 'vi' : sourceLanguage.split('-')[0].toLowerCase() === glossaryLanguageSource && targetLanguage.split('-')[0].toLowerCase() === glossaryLanguageTarget) ? applyGlossaryToText(inputText) : inputText) && lastSession.translatorOption === translatorOption && lastSession.sourceLanguage === sourceLanguage && lastSession.targetLanguage === targetLanguage) {
            result = lastSession.result;
        } else {
            const results = [];
            let translator = null;

            switch (translatorOption) {
                case Translators.DEEPL_TRANSLATOR:
                    translator = await new DeepLTranslator().init();
                    break;

                case Translators.GOOGLE_TRANSLATE:
                    translator = await new GoogleTranslate().init();
                    break;

                case Translators.PAPAGO:
                    translator = await new Papago().init();
                    break;

                case Translators.VIETPHRASE:
                    translator = await new Vietphrase(vietphraseData, translationAlgorithmRadio.filter('[checked]').val(), multiplicationAlgorithmRadio.filter('[checked]').val(), $('#ttvtranslate-mode-switch').prop('checked'), glossaryEnabled && targetLanguage === 'vi', glossary, prioritizeNameOverVietphraseCheck.prop('checked'), true);
                    break;

                default:
                case Translators.MICROSOFT_TRANSLATOR:
                    translator = await new MicrosoftTranslator().init();
                    break;
            }

            if (translatorOption === Translators.DEEPL_TRANSLATOR && translator.usage.character_count + inputText.length > translator.usage.character_limit) throw `Lỗi DeepL Translator: Đã đạt đến giới hạn dịch của tài khoản. (${translator.usage.character_count}/${translator.usage.character_limit} ký tự).`;

            if (processText.split(/\r?\n/).length <= MAX_LINE && processText.length <= MAX_LENGTH) {
                result = await translator.translateText(sourceLanguage, targetLanguage, processText);
            } else {
                const inputLines = processText.split(/\r?\n/);
                let queryLines = [];

                while (inputLines.length > 0 && queryLines.length + 1 <= MAX_LINE && [...queryLines, inputLines[0]].join('\n').length <= MAX_LENGTH) {
                    if (translateAbortController.signal.aborted) break;
                    queryLines.push(inputLines.shift());

                    if (inputLines.length === 0 || queryLines.length + 1 >= MAX_LINE || [...queryLines, inputLines[0]].join('\n').length >= MAX_LENGTH) {
                        results.push(await translator.translateText(sourceLanguage, targetLanguage, queryLines.join('\n')));
                        queryLines = [];
                    }
                }

                result = results.join('\n');
            }

            $('#translate-timer').text(Date.now() - startTime);
            lastSession.inputText = glossaryEnabled && (translatorOption === Translators.VIETPHRASE ? targetLanguage === 'vi' : sourceLanguage.split('-')[0].toLowerCase() === glossaryLanguageSource && targetLanguage.split('-')[0].toLowerCase() === glossaryLanguageTarget) ? applyGlossaryToText(inputText) : inputText;
            lastSession.translatorOption = translatorOption;
            lastSession.sourceLanguage = sourceLanguage;
            lastSession.targetLanguage = targetLanguage;
            lastSession.result = result;
        }

        if (translateAbortController.signal.aborted) return;
        resultTextarea.html(buildResult(inputTextarea.val(), result));
    } catch (error) {
        console.error(error)
        const paragraph = document.createElement('p');
        paragraph.innerText = `Bản dịch thất bại: ${error}`;
        resultTextarea.html(paragraph);
        lastSession = {};
    }
}

function getMaxQueryLengthAndLine(translator, text) {
    switch (translator) {
        case Translators.DEEPL_TRANSLATOR:
            return [32768, 50];

        case Translators.GOOGLE_TRANSLATE:
            return [16272, 100];

        case Translators.PAPAGO:
            return [3000, 1500];

        case Translators.MICROSOFT_TRANSLATOR:
            return [50000, 1000];

        default:
            return [applyGlossaryToText(text).length, text.split(/\n/).length];
    }
}

function buildResult(inputText, result) {
    try {
        const resultDiv = document.createElement('div');

        const inputLines = inputText.split(/\r?\n/).map((element) => element.trim());
        const resultLines = result.split(/\r?\n/).map((element) => element.trim());

        if (showOriginalTextSwitch.prop('checked')) {
            let lostLineFixedNumber = 0;

            for (let i = 0; i < inputLines.length; i++) {
                if (i + lostLineFixedNumber < resultLines.length) {
                    if (inputLines[i + lostLineFixedNumber].length === 0 && resultLines[i].length > 0) {
                        lostLineFixedNumber++;
                        i--;
                        continue;
                    } else if (translatorOptions.filter($('.active')).data('id') === Translators.PAPAGO && resultLines[i].length === 0 && inputLines[i + lostLineFixedNumber].length > 0) {
                        lostLineFixedNumber--;
                        continue;
                    }

                    const paragraph = document.createElement('p');
                    let textNode = document.createTextNode(resultLines[i]);

                    if (resultLines[i].length !== inputLines[i + lostLineFixedNumber].length) {
                        const idiomaticText = document.createElement('i');
                        const linebreak = document.createElement('br');
                        idiomaticText.innerText = inputLines[i + lostLineFixedNumber];
                        paragraph.appendChild(idiomaticText);
                        paragraph.appendChild(linebreak.cloneNode(true));
                        textNode = document.createElement('b');
                        textNode.innerText = resultLines[i];
                    }

                    paragraph.appendChild(textNode);
                    resultDiv.appendChild(paragraph);
                } else if (i + lostLineFixedNumber < inputLines.length) {
                    const paragraph = document.createElement('p');
                    const idiomaticText = document.createElement('i');
                    idiomaticText.innerText = inputLines[i + lostLineFixedNumber];
                    paragraph.appendChild(idiomaticText);
                    resultDiv.appendChild(paragraph);
                }
            }
        } else {
            resultDiv.innerHTML = `<p>${resultLines.map(Utils.convertTextToHtml).join('</p><p>')}</p>`;
        }

        return resultDiv.innerHTML.replace(/<p><\/p>/g, '<br>');
    } catch (error) {
        console.error('Lỗi hiển thị bản dịch:', error);
        throw error.toString();
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

const Translators = {
    DEEPL_TRANSLATOR: 'deeplTranslator',
    GOOGLE_TRANSLATE: 'googleTranslate',
    PAPAGO: 'papago',
    MICROSOFT_TRANSLATOR: 'microsoftTranslator',
    VIETPHRASE: 'vietphrase',
};

const GlossaryType = {
    TSV: 'text/tab-separated-values',
    CSV: 'text/csv',
    VIETPHRASE: 'text/plain',
};
