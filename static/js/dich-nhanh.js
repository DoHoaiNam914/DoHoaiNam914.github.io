'use strict';

let translator = JSON.parse(localStorage.getItem('translator'));

let pinyins = {};
let sinovietnameses = {};

// const BRAVE_API_KEY = 'qztbjzBqJueQZLFkwTTJrieu8Vw3789u';
const DEEPL_AUTH_KEY = 'a4b25ba2-b628-fa56-916e-b323b16502de:fx';
const GOOGLE_API_KEY = 'AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw';

const uuid = crypto.randomUUID();

let vietphrases = {};
let cacluatnhan = {};
let pronouns = {};

let translateAbortController = null;
let prevTranslation = [];

$(document).ready(async () => {
    try {
        let pinyinList = [];

        $.get('/static/datasource/Unihan_Readings.txt').done((data) => {
            pinyinList = data.split(/\r?\n/).filter((element) => element.match(/^U\+\d+\tkMandarin/)).map((element) => [String.fromCodePoint(parseInt(element.split(/\t/)[0].match(/U\+(\d+)/)[1], 16)), element.split(/\t/)[2]]);
            pinyins = Object.fromEntries(pinyinList);
        });
        await $.get('/static/datasource/Bính âm.txt').done((data) => pinyinList = [...pinyinList, ...data.split(/\r?\n/).map((element) => element.split('=')).sort((a, b) => b[0].length - a[0].length).map(([first, second]) => [first,second.split('ǀ')[0]]).filter(([first]) => !pinyins.hasOwnProperty(first))]);
        pinyinList = pinyinList.filter(([first, second]) => first != '' && second != undefined && !pinyinList[first] && (pinyinList[first] = 1), {});
        pinyins = Object.fromEntries(pinyinList);
        console.log('Đã tải xong bộ dữ liệu bính âm (%d)!', pinyinList.length);
    } catch (error) {
        console.error('Không thể tải bộ dữ liệu bính âm:', error);
        setTimeout(() => window.location.reload(), 5000);
    }

    try {
        let sinovietnameseList = [...specialSinovietnameseData.map(([first, second]) => [first, (Object.fromEntries(specialSinovietnameseData)[second] ?? second).split(', ')[0].toLowerCase()]), ...hanvietData.map(([first, second]) => [first, second.split(',').filter((element) => element.length > 0)[0]])];

        $.get('/static/datasource/ChinesePhienAmWords của thtgiang.txt').done((data) => {
            sinovietnameseList = [...sinovietnameseList, ...data.split(/\r?\n/).map((element) => element.split('=')).filter(([first]) => !sinovietnameses.hasOwnProperty(first))];
            sinovietnameses = Object.fromEntries(sinovietnameseList);
        });
        await $.get('/static/datasource/TTV Translate.ChinesePhienAmWords.txt').done((data) => {
            sinovietnameseList = [...sinovietnameseList, ...data.split(/\r?\n/).map((element) => element.split('=')).filter(([first]) => !sinovietnameses.hasOwnProperty(first))];
            sinovietnameses = Object.fromEntries(sinovietnameseList);
        });
        await $.get('/static/datasource/QuickTranslate2020 - ChinesePhienAmWords.txt').done((data) => {
            sinovietnameseList = [...sinovietnameseList, ...data.split(/\r?\n/).map((element) => element.split('=')).filter(([first]) => !sinovietnameses.hasOwnProperty(first))];
            sinovietnameses = Object.fromEntries(sinovietnameseList);
        });
        await $.get('/static/datasource/Hán việt.txt').done((data) => sinovietnameseList = [...sinovietnameseList, ...data.split(/\r?\n/).map((element) => element.split('=')).sort((a, b) => b[0].length - a[0].length).map(([first, second]) => [first, second.split('ǀ')[0]]).filter(([first]) => !sinovietnameses.hasOwnProperty(first))]);
        sinovietnameseList = sinovietnameseList.filter(([first, second]) => first != '' && !/\p{sc=Latin}/u.test(first) && second != undefined && !sinovietnameseList[first] && (sinovietnameseList[first] = 1), {});
        newAccentData.forEach(([first, second]) => sinovietnameseList = sinovietnameseList.map(([first1, second1]) => [first1, second1.replace(new RegExp(first, 'gi') , second)]));
        sinovietnameses = Object.fromEntries(sinovietnameseList);
        console.log('Đã tải xong bộ dữ liệu hán việt (%d)!', sinovietnameseList.length);
    } catch (error) {
        console.error('Không thể tải bộ dữ liệu hán việt:', error);
        setTimeout(() => window.location.reload(), 5000);
    }

    $.get('/static/datasource/LuatNhan.txt').done((data) => {
        cacluatnhan = Object.fromEntries(data.split(/\r?\n/).map((element) => element.split('=')).filter((element) => element.length == 2));
        console.log('Đã tải xong tệp LuatNhan.txt (%d)!', Object.entries(cacluatnhan).length);
    }).fail((jqXHR, textStatus, errorThrown) => {
        console.error('Không tải được tệp LuatNhan.txt:', errorThrown);
        setTimeout(() => window.location.reload(), 5000);
    });

    $.get('/static/datasource/Pronouns.txt').done((data) => {
        pronouns = Object.fromEntries(data.split(/\r?\n/).map((element) => element.split('=')).filter((element) => element.length == 2).map(([first, second]) => [first, second.split('/')[0]]));
        console.log('Đã tải xong tệp Pronouns.txt (%d)!', Object.entries(pronouns).length);
    }).fail((jqXHR, textStatus, errorThrown) => {
        console.error('Không tải được tệp Pronouns.txt:', errorThrown);
        setTimeout(() => window.location.reload(), 5000);
    });

    if (Object.entries(vietphrases).length == 0) {
        $.get('/static/datasource/VietPhrase.txt').done((data) => {
            let vietphraseList = [...data.split(/\r?\n/).map((element) => element.split('=')).filter((element) => element.length == 2).map(([first, second]) => [first, second.split('/')[0].split('|')[0]]), ...Object.entries(sinovietnameses)];
            vietphraseList = vietphraseList.filter(([first, second]) => first != '' && second != undefined && !vietphraseList[first] && (vietphraseList[first] = 1), {});
            if ($('#inputVietphrase').prop('files') == undefined) {
                return;
            }
            vietphrases = Object.fromEntries(vietphraseList);
            console.log('Đã tải xong tệp VietPhrase.txt (%d)!', vietphraseList.length);
        }).fail((jqXHR, textStatus, errorThrown) => {
            console.error('Không tải được tệp VietPhrase.txt:', errorThrown);
        });
    }

    $('#queryText').trigger('input');
});

$(visualViewport).resize((event) => $('#queryText').css('max-height', event.target.height - 248 + 'px'));

$('#translateButton').click(async function () {
    if (translateAbortController != undefined) {
        translateAbortController.abort();
        translateAbortController = null;
    }

    switch ($(this).text()) {
        default:
        case 'Dịch':
            if ($('#queryText').val().length > 0) {
                $(this).text('Huỷ');
                $('#translatedText').show();
                $('#queryText').hide();
                $('#copyButton').addClass('disabled');
                $('#pasteButton').addClass('disabled');
                $('#imageFile').addClass('disabled');
                $('#pasteUrlButton').addClass('disabled');
                $('#clearImageButton').addClass('disabled');
                $('#translatedText').html('Đang dịch...');
                translateAbortController = new AbortController();
                translate($('#queryText').val(), translateAbortController.signal).finally(() => onPostTranslate());
            }
            break;

        case 'Huỷ':
            $('#translatedText').html(null);
            $('#translatedText').hide();
            $('#queryText').show();
            $('#retranslateButton').addClass('disabled');
            $('#clearImageButton').removeClass('disabled');
            $('#pasteUrlButton').removeClass('disabled');
            $('#imageFile').removeClass('disabled');
            $('#pasteButton').removeClass('disabled');
            $('#copyButton').removeClass('disabled');
            $(this).text('Dịch');
            break;

        case 'Sửa':
            $('#translatedText').html(null);
            $('#translatedText').hide();
            $('#queryText').show();
            $('#clearImageButton').removeClass('disabled');
            $('#pasteUrlButton').removeClass('disabled');
            $('#imageFile').removeClass('disabled');
            $('#retranslateButton').addClass('disabled');
            $('#translateTimer').text(0);
            $(this).text('Dịch');
            break;
    }
});

$('#copyButton').on('click', () => {
    const data = prevTranslation[1].length != undefined ? prevTranslation[1] : $('#queryText').val();

    if (data.length > 0) {
        navigator.clipboard.writeText(data);
    }
});

$('#pasteButton').on('click', () => {
    navigator.clipboard
        .readText()
        .then((clipText) => {
            if (clipText.length > 0) {
                window.scrollTo({top: 0, behavior: 'smooth'});
                $('#queryText').val(clipText).trigger('input');
                $('#retranslateButton').click();
            }
        });
});

$('#retranslateButton').click(() => {
    if ($('#translateButton').text() != 'Dịch') {
        $('#translateButton').text('Dịch').click();
    }
});

$('#queryText').on('input', () => {
    $('#queryText').css('height', 'auto');
    $('#queryText').css('height', $('#queryText').prop('scrollHeight') + 'px');
    $(visualViewport).resize();
    $('#queryTextCounter').text($('#queryText').val().length);
});

$('.modal').on('hidden.bs.modal', () => $(document.body).removeAttr('style'));

$('.modal').on('shown.bs.modal', () => $(document.body).css({
    '-webkit-overflow-scrolling': 'auto',
    overflow: 'hidden',
    'overscroll-behavior': 'none',
    'touch-action': 'none'
}));

$('.option').change(() => {
    translator = loadTranslatorOptions();
    localStorage.setItem('translator', JSON.stringify(translator));
    prevTranslation = [];
    $('#retranslateButton').click();
});

$('.translator').click(function () {
    if (!$(this).hasClass('disabled')) {
        const prevTranslator = translator['translator'];

        const prevSourceLanguageCode = translator['sourceLangSelect'];
        const prevTargetLanguageCode = translator['targetLangSelect'];
        const prevSourceLanguageName = getLanguageName(prevTranslator, prevSourceLanguageCode);
        const prevTargetLanguageName = getLanguageName(prevTranslator, prevTargetLanguageCode);

        $('.translator').removeClass('active');
        $(this).addClass('active');

        $('#sourceLangSelect').html(getSourceLanguageOptions($(this).data('id')));
        $('#sourceLangSelect > option').each(function (index) {
            if ($('.translator.active').data('id') === prevTranslator
                && prevSourceLanguageCode != null) {
                $('#sourceLangSelect').val(prevSourceLanguageCode);
                return false;
            } else if (prevSourceLanguageCode != null && (prevSourceLanguageName != null && $(this).text().replace(/[()]/g, '') == prevSourceLanguageName.replace(/[()]/g, '') || $(this).val().toLowerCase() == prevSourceLanguageCode.toLowerCase() || (prevSourceLanguageName != null && $(this).text().includes($(this).text().split(' ').length == 2 && prevSourceLanguageName.split(' ').length == 2 ? prevSourceLanguageName.replace(/[()]/g, '').split(' ')[1] : prevSourceLanguageName.replace(/[()]/g, '').split(' ')[0]) && $(this).val().toLowerCase().split('-')[0] == prevSourceLanguageCode.toLowerCase().split('-')[0]) || ($(this).val().toLowerCase().split('-')[0] == prevSourceLanguageCode.toLowerCase().split('-')[0]))) {
                $('#sourceLangSelect').val($(this).val());
                return false;
            } else if (index + 1 == $('#sourceLangSelect > option').length) {
                $('#sourceLangSelect').val(
                    getDefaultSourceLanguage($('.translator.active').data('id')));
            }
        });
        $('#targetLangSelect').html(getTargetLanguageOptions($(this).data('id')));
        $('#targetLangSelect > option').each(function (index) {
            if ($('.translator.active').data('id') === prevTranslator
                && prevTargetLanguageCode != null) {
                $('#targetLangSelect').val(prevTargetLanguageCode);
                return false;
            } else if (prevTargetLanguageCode != null && (prevTargetLanguageName != null && $(this).text().replace(/[()]/g, '') == prevTargetLanguageName.replace(/[()]/g, '') || $(this).val().toLowerCase() == prevTargetLanguageCode.toLowerCase() || (prevTargetLanguageName != null && $(this).text().includes($(this).text().split(' ').length == 2 && prevTargetLanguageName.split(' ').length == 2 ? prevTargetLanguageName.replace(/[()]/g, '').split(' ')[1] : prevTargetLanguageName.replace(/[()]/g, '').split(' ')[0]) && $(this).val().toLowerCase().split('-')[0] == prevTargetLanguageCode.toLowerCase().split('-')[0]) || ($(this).val().toLowerCase().split('-')[0] == prevTargetLanguageCode.toLowerCase().split('-')[0]))) {
                if ($('.translator.active').data('id') === Translators.DEEPL_TRANSLATOR && prevTargetLanguageCode == 'en') {
                    $('#targetLangSelect').val('EN-US');
                } else {
                    $('#targetLangSelect').val($(this).val());
                }
                return false;
            } else if (index + 1 == $('#targetLangSelect > option').length) {
                $('#targetLangSelect').val(getDefaultTargetLanguage($('.translator.active').data('id')));
            }
        });

        translator['translator'] = $(this).data('id');

        for (let i = 0; i < $('.option').length; i++) {
            if ($('.option')[i].id == 'sourceLangSelect') {
                translator[$('.option')[i].id] = $('.option')[i].value;
            } else if ($('.option')[i].id == 'targetLangSelect') {
                translator[$('.option')[i].id] = $('.option')[i].value;
            }
        }

        localStorage.setItem('translator', JSON.stringify(translator));
        prevTranslation = [];
        $('#retranslateButton').click();
    }
});

$('#inputVietphrase').on('change', function () {
    const reader = new FileReader();

    reader.onload = function () {
        let vietphraseList = this.result.split(/\r?\n/).map((element) => element.split($('#inputVietphrase').prop('files')[0].type == 'text/tab-separated-values' ? '\t' : '=')).filter((element) => element.length == 2).map(([first, second]) => [first, second.split('/')[0].split('|')[0]]);
        vietphraseList = [...vietphraseList, ...Object.entries(sinovietnameses)].filter(([first, second]) => first != '' && second != undefined && !vietphraseList[first] && (vietphraseList[first] = 1), {})
        vietphrases = Object.fromEntries(vietphraseList);
        console.log('Đã tải xong tệp VietPhrase.txt (%d)!', vietphraseList.length);
    };
    reader.readAsText($(this).prop('files')[0]);
});

function loadTranslatorOptions() {
    const data = {};
    data['translator'] = $('.translator.active').data('id');

    for (let i = 0; i < $('.option').length; i++) {
        if ($('.option')[i].id.startsWith('flexSwitchCheck') && $('.option')[i].checked == true) {
            data[$('.option')[i].id] = $('.option')[i].checked;
        } else if ($('.option')[i].name.startsWith('flexRadio') && $('.option')[i].checked == true) {
            data[$('.option')[i].name] = $('.option')[i].value;
        } else if ($('.option')[i].className.includes('form-select') && $('.option')[i].value != '') {
            data[$('.option')[i].id] = $('.option')[i].value;
        }
    }

    return data;
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

        default:
            return 'vi';
    }
}

function getLanguageName(translator, languageCode) {
    switch (translator) {
        case Translators.DEEPL_TRANSLATOR:
            return DeepLTranslator.SourceLanguage[languageCode] ?? '';

        case Translators.GOOGLE_TRANSLATE:
            return GoogleTranslate.Language[languageCode] ?? '';

        case Translators.LINGVANEX:
            return Lingvanex.Language[languageCode] ?? '';

        case Translators.MICROSOFT_TRANSLATOR:
            return MicrosoftTranslator.Language[languageCode] ?? '';

        case Translators.PAPAGO:
            return Papago.Language[languageCode] ?? '';
    }
}

function getSourceLanguageOptions(translator) {
    const sourceLangSelect = document.createElement('select');
    const autoDetectOption = document.createElement('option');

    switch (translator) {
        case Translators.DEEPL_TRANSLATOR:
            autoDetectOption.innerText = 'Detect language';
            autoDetectOption.value = '';
            sourceLangSelect.appendChild(autoDetectOption);

            for (const langCode in DeepLTranslator.SourceLanguage) {
                const option = document.createElement('option');
                option.innerText = DeepLTranslator.SourceLanguage[langCode];
                option.value = langCode;
                sourceLangSelect.appendChild(option);
            }
            break;

        case Translators.GOOGLE_TRANSLATE:
            autoDetectOption.innerText = 'Phát hiện ngôn ngữ';
            autoDetectOption.value = 'auto';
            sourceLangSelect.appendChild(autoDetectOption);

            for (const langCode in GoogleTranslate.Language) {
                const option = document.createElement('option');
                option.innerText = GoogleTranslate.Language[langCode];
                option.value = langCode;
                sourceLangSelect.appendChild(option);
            }
            break;

        case Translators.LINGVANEX:
            autoDetectOption.innerText = '';
            autoDetectOption.value = '';
            sourceLangSelect.appendChild(autoDetectOption);

            for (const langCode in Lingvanex.Language) {
                const option = document.createElement('option');
                option.innerText = Lingvanex.Language[langCode];
                option.value = langCode;
                sourceLangSelect.appendChild(option);
            }
            break;

        case Translators.PAPAGO:
            autoDetectOption.innerText = 'Phát hiện ngôn ngữ';
            autoDetectOption.value = 'auto';
            sourceLangSelect.appendChild(autoDetectOption);

            for (const langCode in Papago.Language) {
                const option = document.createElement('option');
                option.innerText = Papago.Language[langCode];
                option.value = langCode;
                sourceLangSelect.appendChild(option);
            }
            break;

        case Translators.MICROSOFT_TRANSLATOR:
            autoDetectOption.innerText = 'Tự phát hiện';
            autoDetectOption.value = '';
            sourceLangSelect.appendChild(autoDetectOption);

            for (const langCode in MicrosoftTranslator.Language) {
                const option = document.createElement('option');
                option.innerText = MicrosoftTranslator.Language[langCode];
                option.value = langCode;
                sourceLangSelect.appendChild(option);
            }
            break;

        case Translators.VIETPHRASE:
            autoDetectOption.innerText = 'Tiếng Trung';
            autoDetectOption.value = 'zh';
            sourceLangSelect.appendChild(autoDetectOption);
            break;
    }
    return sourceLangSelect.innerHTML;
}

function getTargetLanguageOptions(translator) {
    const targetLangSelect = document.createElement('select');

    switch (translator) {
        case Translators.DEEPL_TRANSLATOR:
            for (const langCode in DeepLTranslator.TargetLanguage) {
                const option = document.createElement('option');
                option.innerText = DeepLTranslator.TargetLanguage[langCode];
                option.value = langCode;
                targetLangSelect.appendChild(option);
            }
            break;

        case Translators.GOOGLE_TRANSLATE:
            for (const langCode in GoogleTranslate.Language) {
                const option = document.createElement('option');
                option.innerText = GoogleTranslate.Language[langCode];
                option.value = langCode;
                targetLangSelect.appendChild(option);
            }
            break;

        case Translators.LINGVANEX:
            for (const langCode in Lingvanex.Language) {
                const option = document.createElement('option');
                option.innerText = Lingvanex.Language[langCode];
                option.value = langCode;
                targetLangSelect.appendChild(option);
            }
            break;

        case Translators.PAPAGO:
            for (const langCode in Papago.Language) {
                const option = document.createElement('option');
                option.innerText = Papago.Language[langCode];
                option.value = langCode;
                targetLangSelect.appendChild(option);
            }
            break;

        case Translators.MICROSOFT_TRANSLATOR:
            for (const langCode in MicrosoftTranslator.Language) {
                const option = document.createElement('option');
                option.innerText = MicrosoftTranslator.Language[langCode];
                option.value = langCode;
                targetLangSelect.appendChild(option);
            }
            break;

        case Translators.VIETPHRASE:
            const pinyinOption = document.createElement('option');
            const sinovietnameseOption = document.createElement('option');
            const vietphraseOption = document.createElement('option');
            pinyinOption.innerText = 'Bính âm';
            pinyinOption.value = 'en';
            targetLangSelect.appendChild(pinyinOption);
            sinovietnameseOption.innerText = 'Hán việt';
            sinovietnameseOption.value = 'zh-VN';
            targetLangSelect.appendChild(sinovietnameseOption);
            vietphraseOption.innerText = 'Vietphrase';
            vietphraseOption.value = 'vi';
            targetLangSelect.appendChild(vietphraseOption);
            break;
    }
    return targetLangSelect.innerHTML;
}

async function translate(inputText, abortSignal) {
    const startTime = Date.now();
    const translator = $('.translator.active').data('id');

    const sourceLanguage = $('#sourceLangSelect').val();
    const targetLanguage = $('#targetLangSelect').val();

    const isCjkTargetLanguage = !(targetLanguage == 'JA' || targetLanguage == 'KO' || targetLanguage == 'ZH') || !(targetLanguage == 'zh-CN' || targetLanguage == 'zh-TW' || targetLanguage == 'ja' || targetLanguage == 'ko') || !(targetLanguage == 'ko' || targetLanguage == 'ja' || targetLanguage == 'zh-CN' || targetLanguage == 'zh-TW') || !(targetLanguage == 'yue' || targetLanguage == 'lzh' || targetLanguage == 'zh-Hans' || targetLanguage == 'zh-Hant' || targetLanguage == 'ja' || targetLanguage == 'ko');

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
                MAX_LINE = 66;
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
                MAX_LENGTH = getDynamicDictionaryText(processText, false).length;
                MAX_LINE = processText.split(/\n/).length;
                break;
        }

        if (getDynamicDictionaryText(processText, translator === Translators.MICROSOFT_TRANSLATOR).split(/\n/).sort((a, b) => b.length - a.length)[0].length > MAX_LENGTH) {
            errorMessage.innerText = `Bản dịch thất bại: Số lượng từ trong một dòng quá dài (Số lượng từ hợp lệ nhỏ hơn hoặc bằng ${MAX_LENGTH}). [Lưu ý: Khi sử dụng Dynamic Dictionary và Bảo vệ dấu trích đẫn sẽ làm giảm số lượng từ có thể dịch đi.]`;
            $('#translatedText').append(errorMessage);
            onPostTranslate();
            return;
        }

        if (prevTranslation[1] == undefined || getDynamicDictionaryText(processText, translator === Translators.MICROSOFT_TRANSLATOR) != prevTranslation[0]) {
            if (translator === Translators.DEEPL_TRANSLATOR) {
                const deeplUsage = (await $.get('https://api-free.deepl.com/v2/usage?auth_key=' + DEEPL_AUTH_KEY)) ?? {
                    'character_count': 500000,
                    'character_limit': 500000
                };

                if (processText.length > (deeplUsage.character_limit - deeplUsage.character_count)) {
                    errorMessage.innerText = `Lỗi DeepL: Đã đạt đến giới hạn dịch của tài khoản. (${deeplUsage.character_count}/${deeplUsage.character_limit} ký tự). [Lưu ý: Khi sử dụng Dynamic Dictionary và Bảo vệ dấu trích đẫn sẽ làm giảm số lượng từ có thể dịch đi.]`;
                    $('#translatedText').html(errorMessage);
                    onPostTranslate();
                    return;
                }
            }

            const googleTranslateData = translator === Translators.GOOGLE_TRANSLATE ? await GoogleTranslate.getData(translator, GOOGLE_API_KEY) : null;

            if (translator === Translators.GOOGLE_TRANSLATE && (googleTranslateData.version == undefined || googleTranslateData.ctkk == undefined)) {
                errorMessage.innerText = 'Không thể lấy được Log ID hoặc Token từ element.js.';
                $('#translatedText').html(errorMessage);
                return;
            }

            const lingvanexAuthKey = translator === Translators.LINGVANEX ? await Lingvanex.getAuthKey(translator) : null;

            if (translator === Translators.LINGVANEX && lingvanexAuthKey == undefined) {
                errorMessage.innerText = 'Không thể lấy được Khoá xác thực từ từ api-base.js.';
                $('#translatedText').html(errorMessage);
                return;
            }

            const papagoVersion = translator === Translators.PAPAGO ? await Papago.getVersion(translator) : null;

            if (translator === Translators.PAPAGO && papagoVersion == undefined) {
                errorMessage.innerText = 'Không thể lấy được Thông tin phiên bản từ main.js.';
                $('#translatedText').html(errorMessage);
                return;
            }

            const microsoftTranslatorAccessToken = translator === Translators.MICROSOFT_TRANSLATOR ? await MicrosoftTranslator.getAccessToken(translator) : null;

            if (translator === Translators.MICROSOFT_TRANSLATOR && microsoftTranslatorAccessToken == undefined) {
                errorMessage.innerText = 'Không thể lấy được Access Token từ máy chủ.';
                $('#translatedText').html(errorMessage);
                return;
            }

            const queryLines = processText.split(/\n/);
            let translateLines = [];

            let canTranslate = false;
            let tc = -1;

            for (let i = 0; i < processText.split(/\n/).length; i++) {
                if (abortSignal.aborted) return;
                if (translateLines.join('\n').length < MAX_LENGTH && translateLines.length < MAX_LINE) {
                    translateLines.push(queryLines.shift());

                    if (canTranslate == false && (queryLines.length == 0 || translateLines.length >= MAX_LINE || translateLines.join('\n').length >= MAX_LENGTH)) {
                        if (translateLines.join('\n').length > MAX_LENGTH || translateLines.length > MAX_LINE) {
                            queryLines.splice(0, 0, translateLines.pop());
                            i--;
                        }

                        if (translateLines.length <= MAX_LINE && translateLines.join('\n').length <= MAX_LENGTH) {
                            canTranslate = true;
                        }
                    }
                }

                if (canTranslate && translateLines.length > 0) {
                    const translateText = translateLines.join('\n');
                    let translatedText;
                    tc++;

                    switch (translator) {
                        case Translators.DEEPL_TRANSLATOR:
                            translatedText = await DeepLTranslator.translateText(DEEPL_AUTH_KEY, translateText, sourceLanguage, targetLanguage, true);
                            break;

                        default:
                        case Translators.GOOGLE_TRANSLATE:
                            translatedText = await GoogleTranslate.translateText(googleTranslateData, translateText, sourceLanguage, targetLanguage, true, tc);
                            break;

                        case Translators.LINGVANEX:
                            translatedText = await Lingvanex.translateText(lingvanexAuthKey, translateText, sourceLanguage, targetLanguage, true);
                            break;

                        case Translators.PAPAGO:
                            translatedText = await Papago.translateText(papagoVersion, translateText, sourceLanguage, targetLanguage, true);
                            break;

                        case Translators.MICROSOFT_TRANSLATOR:
                            translatedText = await MicrosoftTranslator.translateText(microsoftTranslatorAccessToken, translateText, sourceLanguage, targetLanguage, true);
                            break;

                        case Translators.VIETPHRASE:
                            if ($('#targetLangSelect').val() == 'vi' && Object.entries(
                                vietphrases).length > 0) {
                                translatedText = convertText(translateText, vietphrases, true, $('#flexSwitchCheckGlossary').prop('checked'), $('input[name=\'flexRadioTranslationAlgorithm\']:checked').val(), $('input[name=\'flexRadioMultiplicationAlgorithm\']:checked').val());
                            } else if ($('#targetLangSelect').val() == 'zh-VN' && Object.entries(sinovietnameses).length > 0) {
                                translatedText = convertText(translateText, sinovietnameses, true, false, VietPhraseTranslationAlgorithms.PRIORITIZE_LONG_VIETPHRASE_CLUSTERS, VietPhraseMultiplicationAlgorithm.NOT_APPLICABLE);
                            } else if ($('#targetLangSelect').val() == 'en' && Object.entries(pinyins).length > 0) {
                                translatedText = convertText(translateText, pinyins, true, false, VietPhraseTranslationAlgorithms.PRIORITIZE_LONG_VIETPHRASE_CLUSTERS, VietPhraseMultiplicationAlgorithm.NOT_APPLICABLE);
                            } else if ($('#targetLangSelect').val() == 'vi' && Object.entries(vietphrases).length == 0) {
                                errorMessage.innerHTML = 'Nhập tệp VietPhrase.txt nếu có hoặc tải về <a href="https://drive.google.com/drive/folders/0B6fxcJ5qbXgkeTJNTFJJS3lmc3c?resourcekey=0-Ych2OUVug3pkLgCIlzvcuA&usp=sharing">tại đây</a>';
                                $('#translatedText').html(errorMessage);
                                onPostTranslate();
                                return;
                            }
                            break;
                    }

                    results.push(translatedText);
                    translateLines = [];
                    canTranslate = false;
                }
            }

            $('#translateTimer').text(Math.floor((Date.now() - startTime) / 10) / 100);
            prevTranslation = [getDynamicDictionaryText(processText, translator === Translators.MICROSOFT_TRANSLATOR), results];
        } else {
            results = prevTranslation[1];
        }

        if (abortSignal.aborted) return;
        $('#translatedText').html(buildTranslatedResult([inputText, processText], getProcessTextPostTranslate(results.join('\n')), $('#flexSwitchCheckShowOriginal').prop('checked')));
    } catch (error) {
        console.error('Bản dịch thất bại:', error.stack);
        errorMessage.innerText = 'Bản dịch thất bại: ' + JSON.stringify(error);
        $('#translatedText').html(errorMessage);
        onPostTranslate();
    }

    translateAbortController = null;
}

function buildTranslatedResult(inputTexts, result, showOriginal) {
    const resultDiv = document.createElement('div');

    const inputTextParagraph = document.createElement('p');
    $(inputTextParagraph).text(inputTexts[0]);
    const inputLines = $(inputTextParagraph).html().split(/\n/);

    const processTextParagraph = document.createElement('p');
    $(processTextParagraph).text(convertText(inputTexts[1], {}, false, false, VietPhraseTranslationAlgorithms.TRANSLATE_FROM_LEFT_TO_RIGHT, VietPhraseMultiplicationAlgorithm.NOT_APPLICABLE));
    const processLines = $(processTextParagraph).html().split(/\n/);

    const resultParagraph = document.createElement('p');
    $(resultParagraph).text(result);
    const resultLines = $(resultParagraph).html().split(/\n/);

	try {
		if (showOriginal) {
			let lostLineFixedAmount = 0;

			for (let i = 0; i < inputLines.length; i++) {
				if (i < resultLines.length) {
					if (inputLines[i + lostLineFixedAmount].trim().length == 0 && resultLines[i].trim().length > 0) {
						lostLineFixedAmount++;
						i--;
						continue;
					} else if (resultLines[i].trim().length == 0 && inputLines[i + lostLineFixedAmount].trim().length > 0) {
						lostLineFixedAmount--;
						continue;
					}

					const paragraph = document.createElement('p');
					paragraph.innerHTML = resultLines[i] != processLines[i + lostLineFixedAmount] ? `<i>${inputLines[i + lostLineFixedAmount].trimStart()}</i><br>${resultLines[i].trimStart()}` : processLines[i + lostLineFixedAmount].trimStart();
                    resultDiv.appendChild(paragraph);
				} else if (i + lostLineFixedAmount < inputLines.length) {
					const paragraph = document.createElement('p');
					paragraph.innerHTML = `<i>${inputLines[i + lostLineFixedAmount].trimStart()}</i>`;
                    resultDiv.appendChild(paragraph);
				}
			}
		} else {
            resultDiv.innerHTML = `<p>${resultLines.map((element) => element.trimStart()).join('</p><p>')}</p>`;
		}
	} catch (error) {
        resultDiv.innerHTML = `<p>${resultLines.map((element) => element.trimStart()).join('</p><p>')}</p>`;
        console.error('Lỗi hiển thị bản dịch:', error);
        throw error.toString();
	}
    return resultDiv.innerHTML.replace(/(<p>)(<\/p>)/g, '$1<br>$2');
}

function convertText(inputText, data, caseSensitive, useGlossary, translationAlgorithm = VietPhraseTranslationAlgorithms.PRIORITIZE_LONG_VIETPHRASE_CLUSTERS, multiplicationAlgorithm = VietPhraseMultiplicationAlgorithm.MULTIPLICATION_BY_PRONOUNS_NAMES) {
    try {
        const a=Date.now();
        const glossaryEntries = Object.entries(glossary).filter(([first]) => inputText.includes(first));
        const luatnhanList = [];

        if (multiplicationAlgorithm > VietPhraseMultiplicationAlgorithm.NOT_APPLICABLE) {
            for (const luatnhan in cacluatnhan) {
                if (useGlossary && multiplicationAlgorithm == VietPhraseMultiplicationAlgorithm.MULTIPLICATION_BY_PRONOUNS_NAMES && glossaryEntries.length > 0) {
                    for (const element in glossary) {
                        luatnhanList.push([luatnhan.replace(/\{0}/g, element).replace(/\$/g, '$$$&'), cacluatnhan[luatnhan].replace(/\{0}/g, glossary[element].replace(/\$/g, '$$$&'))]);
                    }
                }

                for (const pronoun in pronouns) {
                    luatnhanList.push([luatnhan.replace(/\{0}/g, pronoun), cacluatnhan[luatnhan].replace(/\{0}/g, pronouns[pronoun])]);
                }
            }
        }

        const luatnhanData = Object.fromEntries(luatnhanList);

        let dataEntries = Object.entries(data);
        data = Object.fromEntries(dataEntries.filter(([first]) => (!useGlossary || !glossary.hasOwnProperty(first)) && inputText.includes(first)).sort((a, b) => b[0].length - a[0].length));
        dataEntries = Object.entries(data);

        const punctuationEntries = cjkmap.filter(([first]) => first == '…' || first.split('…').length != 2);
        const punctuation = Object.fromEntries(punctuationEntries);

        const results = [];
        let result = inputText;
        const lines = inputText.split(/\n/);

        for (let i = 0; i < lines.length; i++) {
            let chars = lines[i];

            const filteredPunctuationEntries = punctuationEntries.filter(([first]) => chars.includes(first));

            if (chars.trim().length == 0) {
                results.push(chars);
                continue;
            }

            const filteredLuatnhanList = luatnhanList.filter(([first]) => chars.includes(first));
            const filteredDataEntries = dataEntries.filter(([first]) => chars.includes(first));
            const filteredGlossaryEntries = glossaryEntries.filter(([first]) => chars.includes(first));

            if (filteredDataEntries.length == 0 && filteredPunctuationEntries.length == 0 && filteredGlossaryEntries.length == 0) {
                results.push(chars);
                continue;
            }

            if (translationAlgorithm == VietPhraseTranslationAlgorithms.PRIORITIZE_LONG_VIETPHRASE_CLUSTERS) {
                const sortedData = Object.fromEntries([...filteredLuatnhanList, ...useGlossary && filteredGlossaryEntries.length > 0 ? filteredGlossaryEntries : [], ...filteredDataEntries].sort((a, b) => b[0].length - a[0].length));

                for (const property in sortedData) {
                    chars = chars.replace(new RegExp(`${property.replace(/[/[\]\-.\\|^$!=()*+?{}]/g, '\\$&')}(?=$|[${filteredPunctuationEntries.map(([first]) => first.replace(/[\]]/, '\\\\$&')).filter((element) => /[\p{Pe}\p{Pf}\p{Po}]/u.test(element)).join('')}])`, 'g'), sortedData[property].replace(/[/[\]\-.\\|^$!=()*+?{}]/g, '\\$&')).replace(new RegExp(property.replace(/[/[\]\-.\\|^$!=()*+?{}]/g, '\\$&'), 'g'), `${sortedData[property].replace(/\$/g, '$$$&')} `);
                    filteredPunctuationEntries.forEach(([first, second]) => chars = chars.replace(new RegExp(first.replace(/[/[\]\-.\\|^$!=()*+?{}]/g, '\\$&'), 'g'), second.replace(/\$/g, '$$$&')));
                }

                results.push(chars);
            } else if (translationAlgorithm == VietPhraseTranslationAlgorithms.TRANSLATE_FROM_LEFT_TO_RIGHT) {
                const luatnhanLengths = [...filteredLuatnhanList.map(([first]) => first.length), 1].sort((a, b) => b - a).filter((element, index, array) => index == array.indexOf(element));
                const glossaryLengths = [...filteredGlossaryEntries.map(([first]) => first.length), 1].sort((a, b) => b - a).filter((element, index, array) => index == array.indexOf(element));
                const phraseLengths = [...filteredDataEntries.map(([first]) => first.length), 1].sort((a, b) => b - a).filter((element, index, array) => index == array.indexOf(element));
                const phrases = [];
                let tempWord = '';

                for (let j = 0; j < chars.length; j++) {
                    if (useGlossary && filteredGlossaryEntries.length > 0) {
                        if (multiplicationAlgorithm == VietPhraseMultiplicationAlgorithm.MULTIPLICATION_BY_PRONOUNS_NAMES && filteredLuatnhanList.length > 0) {
                            for (const luatnhanLength of luatnhanLengths) {
                                if (luatnhanData.hasOwnProperty(chars.substring(j, j + luatnhanLength))) {
                                    if (luatnhanData[chars.substring(j, j + luatnhanLength)].length > 0) {
                                        if (punctuation.hasOwnProperty(chars[j - 1]) && /[\p{Ps}\p{Pi}\p{Po}]/u.test(chars[j - 1])) {
                                            phrases.push((phrases.pop() ?? '') + luatnhanData[chars.substring(j, j + luatnhanLength)]);
                                        } else {
                                            phrases.push(luatnhanData[chars.substring(j, j + luatnhanLength)]);
                                        }
                                    }

                                    j += luatnhanLength;
                                    break;
                                }
                            }
                        }

                        for (const glossaryLength of glossaryLengths) {
                            if (glossary.hasOwnProperty(chars.substring(j, j + glossaryLength))) {
                                if (glossary[chars.substring(j, j + glossaryLength)].length > 0) {
                                    if (punctuation.hasOwnProperty(chars[j - 1]) && /[\p{Ps}\p{Pi}\p{Po}]/u.test(chars[j - 1])) {
                                        phrases.push((phrases.pop() ?? '') + glossary[chars.substring(j, j + glossaryLength)]);
                                    } else {
                                        phrases.push(glossary[chars.substring(j, j + glossaryLength)]);
                                    }
                                }

                                j += glossaryLength;
                                break;
                            }
                        }
                    }

                    if (multiplicationAlgorithm == VietPhraseMultiplicationAlgorithm.MULTIPLICATION_BY_PRONOUNS && filteredLuatnhanList.length > 0) {
                        for (const luatnhanLength of luatnhanLengths) {
                            if (luatnhanData.hasOwnProperty(chars.substring(j, j + luatnhanLength))) {
                                if (luatnhanData[chars.substring(j, j + luatnhanLength)].length > 0) {
                                    if (punctuation.hasOwnProperty(chars[j - 1]) && /[\p{Ps}\p{Pi}\p{Po}]/u.test(chars[j - 1])) {
                                        phrases.push((phrases.pop() ?? '') + luatnhanData[chars.substring(j, j + luatnhanLength)]);
                                    } else {
                                        phrases.push(luatnhanData[chars.substring(j, j + luatnhanLength)]);
                                    }
                                }

                                j += luatnhanLength;
                                break;
                            }
                        }
                    }

                    for (const phraseLength of phraseLengths) {
                        if (data.hasOwnProperty(chars.substring(j, j + phraseLength))) {
                            if (data[chars.substring(j, j + phraseLength)].length > 0) {
                                if (punctuation.hasOwnProperty(chars[j - 1]) && /[\p{Ps}\p{Pi}\p{Po}]/u.test(chars[j - 1])) {
                                    phrases.push((phrases.pop() ?? '') + data[chars.substring(j, j + phraseLength)]);
                                } else {
                                    phrases.push(data[chars.substring(j, j + phraseLength)]);
                                }
                            }

                            j += phraseLength - 1;
                            break;
                        } else if (phraseLength == 1) {
                            if (tempWord.length > 0 && chars[j] == ' ' && !tempWord.includes(' ')) {
                                tempWord.split(' ').forEach((element) => phrases.push(element));
                                tempWord = '';
                            }

                            if (punctuation.hasOwnProperty(chars[j])) {
                                if (tempWord.length == 0 && !lines[i].startsWith(chars[j]) && /[\p{Pe}\p{Pf}\p{Po}]/u.test(chars[j])) {
                                    phrases.push(phrases.pop() + punctuation[chars[j]]);
                                    break;
                                } else {
                                    tempWord += punctuation[chars[j]];
                                }
                            } else {
                                tempWord += chars[j];
                            }

                            if (!punctuation.hasOwnProperty(chars[j]) && tempWord.includes(' ')) {
                                if (j + 1 == chars.length || !chars[j + 1].includes(' ')) {
                                    phrases.push((phrases.pop() ?? '') + tempWord.substring(0, tempWord.length - 1));
                                    tempWord = '';
                                }
                                break;
                            }

                            for (const phraseLength1 of phraseLengths) {
                                if (tempWord.length > 0 && (data.hasOwnProperty(chars.substring(j + 1, j + 1 + phraseLength1)) || j + 1 == chars.length)) {
                                    tempWord.split(' ').forEach((element) => phrases.push(element));
                                    tempWord = '';
                                    break;
                                }
                            }
                            break;
                        }
                    }
                }

                results.push(phrases.join(' ').trim());
            }
        }

        result = results.join('\n');
        return caseSensitive ? result.split(/\n/).map((element => element.replace(/(^|\s*(?:[!\-.:;?]\s+|[''\p{Ps}\p{Pi}]\s*))(\p{Lower})/gu, (match, p1, p2) => p1 + p2.toUpperCase()))).join('\n') : result;
    } catch (error) {
        console.error('Bản dịch lỗi:', error);
        throw error.toString();
    }
}

function getProcessTextPreTranslate(text) {
    try {
        let newText = text;
        if (text.length > 0) {}
        return newText.split(/\n/).map((element) => element.trim()).join('\n');
    } catch (error) {
        console.error('Lỗi xử lý văn bản trước khi dịch:', error);
        throw error.toString();
    }
}

function getProcessTextPostTranslate(text) {
    try {
        let newText = text;
        if (text.length > 0) {}
        return newText.split(/\n/).map((element) => element.trim()).join('\n');
    } catch (error) {
        console.error('Lỗi xử lý văn bản sau khi dịch:', error);
        throw error.toString();
    }
}

function onPostTranslate() {
    $('#translatedText').css('height', 'auto');
    $('#translatedText').css('height', $('#translatedText').prop('scrollHeight') + 'px');
    $('#pasteButton').removeClass('disabled');
    $('#copyButton').removeClass('disabled');
    $('.translator').removeClass('disabled');
    $('#retranslateButton').removeClass('disabled');
    $('#translateButton').text('Sửa');
}

const Lingvanex = {
    translateText: async function (authKey, text, from, to, useGlossary = false, tc = 1) {
        try {
            text = useGlossary ? getDynamicDictionaryText(text, false) : text;

            /**
             * Lingvanex Demo
             * URL: https://api-b2b.backenster.com/b1/api/v3/translate
             * Accept: 'application/json, text/javascript, *\/*; q=0.01', Accept-Language: vi-VN,vi;q=0.8,en-US;q=0.5,en;q=0.3, Content-Type: application/x-www-form-urlencoded; charset=UTF-8, Authorization Bearer a_25rccaCYcBC9ARqMODx2BV2M0wNZgDCEl3jryYSgYZtF1a702PVi4sxqi2AmZWyCcw4x209VXnCYwesx - from=${from}&to=${to}&text=${encodeURIComponent(text)}&platform=dp&is_return_text_split_ranges=true
             *
             * Brave
             * Method: POST
             * URL: https://translate.brave.com/translate_a/t?anno=3&client=te_lib&format=html&v=1.0&key=qztbjzBqJueQZLFkwTTJrieu8Vw3789u&logld=v${version}&sl=${from}&tl=${to}&tc=${tc}&sr=1&tk=${this.Bn(text, ctkk)}&mode=1
             * 'accept-language': vi;q=0.5, content-type: application/x-www-form-urlencoded - `q=${text.split(/\n/).map((sentence) => encodeURIComponent(sentence)).join('&q=')}`
             */
            const response = await $.ajax({
                url: 'https://api-b2b.backenster.com/b1/api/v3/translate',
                data: `${from != '' ? `from=${from}&` : ''}to=${to}&text=${encodeURIComponent(text)}&platform=dp&is_return_text_split_ranges=true`,
                method: 'POST',
                headers: {
                    Accept: 'application/json, text/javascript, */*; q=0.01',
                    'Accept-Language': 'vi-VN,vi;q=0.8,en-US;q=0.5,en;q=0.3',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    Authorization: authKey
                }
            });

            return response.result.text;
        } catch (error) {
            console.error('Bản dịch lỗi:', error);
            throw error.toString();
        }
    },
    getAuthKey: async function (translator, apiKey = '') {
        if (translator === Translators.LINGVANEX) {
            try {
                let authKey;
                /**
                 * Lingvanex Demo
                 * URL: https://lingvanex.com/lingvanex_demo_page/js/api-base.js
                 *
                 * Brave
                 * URL: https://translate.brave.com/static/v1/element.js
                 */
                const apiBaseJs = await $.get(`${CORS_PROXY}https://lingvanex.com/lingvanex_demo_page/js/api-base.js`);

                if (apiBaseJs != undefined) {
                    authKey = apiBaseJs.match(/B2B_AUTH_TOKEN="(Bearer [^"]+)"/)[1];
                }
                return authKey;
            } catch (error) {
                console.error('Không thể lấy được Khoá xác thực:' + error);
                throw error.toString()
            }
        }
    },
    Language: {
        //af: 'Afrikaans', sq: 'Albanian', am: 'Amharic', ar: 'Arabic', hy: 'Armenian', az: 'Azerbaijani', eu: 'Basque', be: 'Belarusian', bn: 'Bengali', bs: 'Bosnian', bg: 'Bulgarian', ca: 'Catalan', ceb: 'Cebuano', ny: 'Chichewa', 'zh-CN': 'Chinese (Simplified)', 'zh-TW': 'Chinese (Traditional)', co: 'Corsican', ht: 'Haitian Creole', hr: 'Croatian', cs: 'Czech', da: 'Danish', nl: 'Dutch', en: 'English', eo: 'Esperanto', et: 'Estonian', fi: 'Finnish', fr: 'French', fy: 'Frisian', gl: 'Galician', ka: 'Georgian', de: 'German', el: 'Greek', gu: 'Gujarati', ha: 'Hausa', haw: 'Hawaiian', iw: 'Hebrew', hi: 'Hindi', hmn: 'Hmong', hu: 'Hungarian', is: 'Icelandic', ig: 'Igbo', id: 'Indonesian', ga: 'Irish', it: 'Italian', ja: 'Japanese', jw: 'Javanese', kn: 'Kannada', kk: 'Kazakh', km: 'Khmer', rw: 'Kinyarwanda', ko: 'Korean', ku: 'Kurdish (Kurmanji)', ky: 'Kyrgyz', lo: 'Lao', la: 'Latin', lv: 'Latvian', lt: 'Lithuanian', lb: 'Luxembourgish', mk: 'Macedonian', mg: 'Malagasy', ms: 'Malay', ml: 'Malayalam', mt: 'Maltese', mi: 'Maori', mr: 'Marathi', mn: 'Mongolian', my: 'Myanmar (Burmese)', ne: 'Nepali', no: 'Norwegian', or: 'Odia', ps: 'Pashto', fa: 'Persian', pl: 'Polish', pt: 'Portuguese', pa: 'Punjabi', ro: 'Romanian', ru: 'Russian', sm: 'Samoan', gd: 'Scots Gaelic', 'sr-Cyrl': 'Serbian Cyrilic', st: 'Sesotho', sn: 'Shona', sd: 'Sindhi', si: 'Sinhala', sk: 'Slovak', sl: 'Slovenian', so: 'Somali', es: 'Spanish', su: 'Sundanese', sw: 'Swahili', sv: 'Swedish', tl: 'Filipino (Tagalog)', tg: 'Tajik', ta: 'Tamil', tt: 'Tatar', te: 'Telugu', th: 'Thai', tr: 'Turkish', tk: 'Turkmen', uk: 'Ukrainian', ur: 'Urdu', ug: 'Uyghur', uz: 'Uzbek', vi: 'Vietnamese', cy: 'Welsh', xh: 'Xhosa', yi: 'Yiddish', yo: 'Yoruba', zu: 'Zulu'
        af_ZA: 'Afrikaans',
        sq_AL: 'Albanian',
        am_ET: 'Amharic',
        ar_SA: 'Arabic',
        hy_AM: 'Armenian',
        az_AZ: 'Azerbaijani',
        eu_ES: 'Basque',
        be_BY: 'Belarusian',
        bn_BD: 'Bengali',
        bs_BA: 'Bosnian',
        bg_BG: 'Bulgarian',
        ca_ES: 'Catalan',
        ceb_PH: 'Cebuano',
        ny_MW: 'Chichewa',
        'zh-Hans_CN': 'Chinese (Simplified)',
        'zh-Hant_TW': 'Chinese (Traditional)',
        co_FR: 'Corsican',
        ht_HT: 'Haitian Creole',
        hr_HR: 'Croatian',
        cs_CZ: 'Czech',
        da_DK: 'Danish',
        nl_NL: 'Dutch',
        en_US: 'English',
        eo_WORLD: 'Esperanto',
        et_EE: 'Estonian',
        fi_FI: 'Finnish',
        fr_CA: 'French',
        fy_NL: 'Frisian',
        gl_ES: 'Galician',
        ka_GE: 'Georgian',
        de_DE: 'German',
        el_GR: 'Greek',
        gu_IN: 'Gujarati',
        ha_NE: 'Hausa',
        haw_US: 'Hawaiian',
        he_IL: 'Hebrew',
        hi_IN: 'Hindi',
        hmn_CN: 'Hmong',
        hu_HU: 'Hungarian',
        is_IS: 'Icelandic',
        ig_NG: 'Igbo',
        id_ID: 'Indonesian',
        ga_IE: 'Irish',
        it_IT: 'Italian',
        ja_JP: 'Japanese',
        jv_ID: 'Javanese',
        kn_IN: 'Kannada',
        kk_KZ: 'Kazakh',
        km_KH: 'Khmer',
        rw_RW: 'Kinyarwanda',
        ko_KR: 'Korean',
        ku_IR: 'Kurdish (Kurmanji)',
        ky_KG: 'Kyrgyz',
        lo_LA: 'Lao',
        la_VAT: 'Latin',
        lv_LV: 'Latvian',
        lt_LT: 'Lithuanian',
        lb_LU: 'Luxembourgish',
        mk_MK: 'Macedonian',
        mg_MG: 'Malagasy',
        ms_MY: 'Malay',
        ml_IN: 'Malayalam',
        mt_MT: 'Maltese',
        mi_NZ: 'Maori',
        mr_IN: 'Marathi',
        mn_MN: 'Mongolian',
        my_MM: 'Myanmar (Burmese)',
        ne_NP: 'Nepali',
        no_NO: 'Norwegian',
        or_OR: 'Odia',
        ps_AF: 'Pashto',
        fa_IR: 'Persian',
        pl_PL: 'Polish',
        pt_PT: 'Portuguese',
        pa_PK: 'Punjabi',
        ro_RO: 'Romanian',
        ru_RU: 'Russian',
        sm_WS: 'Samoan',
        gd_GB: 'Scots Gaelic',
        'sr-Cyrl_RS': 'Serbian Cyrilic',
        st_LS: 'Sesotho',
        sn_ZW: 'Shona',
        sd_PK: 'Sindhi',
        si_LK: 'Sinhala',
        sk_SK: 'Slovak',
        sl_SI: 'Slovenian',
        so_SO: 'Somali',
        es_ES: 'Spanish',
        su_ID: 'Sundanese',
        sw_TZ: 'Swahili',
        sv_SE: 'Swedish',
        tl_PH: 'Filipino (Tagalog)',
        tg_TJ: 'Tajik',
        ta_IN: 'Tamil',
        tt_TT: 'Tatar',
        te_IN: 'Telugu',
        th_TH: 'Thai',
        tr_TR: 'Turkish',
        tk_TK: 'Turkmen',
        uk_UA: 'Ukrainian',
        ur_PK: 'Urdu',
        ug_UG: 'Uyghur',
        uz_UZ: 'Uzbek',
        vi_VN: 'Vietnamese',
        cy_GB: 'Welsh',
        xh_ZA: 'Xhosa',
        yi_IL: 'Yiddish',
        yo_NG: 'Yoruba',
        zu_ZA: 'Zulu'
    }
};

const DeepLTranslator = {
    translateText: async function (authKey, inputText, sourceLanguage, targetLanguage, useGlossary = false) {
        try {
            inputText = useGlossary ? getDynamicDictionaryText(inputText, false) : inputText;

            const response = await $.ajax({
                url: 'https://api-free.deepl.com/v2/translate?auth_key=' + authKey,
                data: `text=${inputText.split(/\n/).map((sentence) => encodeURIComponent(sentence)).join('&text=')}${sourceLanguage != '' ? '&source_lang=' + sourceLanguage : ''}&target_lang=${targetLanguage}`,
                method: 'POST'
            });
            return response.translations.map((element) => element.text.trim()).join('\n');
        } catch (error) {
            console.error('Bản dịch lỗi:', error);
            throw error.toString();
        }
    },
    SourceLanguage: {
        BG: 'Bulgarian',
        CS: 'Czech',
        DA: 'Danish',
        DE: 'German',
        EL: 'Greek',
        EN: 'English',
        ES: 'Spanish',
        ET: 'Estonian',
        FI: 'Finnish',
        FR: 'French',
        HU: 'Hungarian',
        ID: 'Indonesian',
        IT: 'Italian',
        JA: 'Japanese',
        KO: 'Korean',
        LT: 'Lithuanian',
        LV: 'Latvian',
        NB: 'Norwegian (Bokmål)',
        NL: 'Dutch',
        PL: 'Polish',
        PT: 'Portuguese',
        RO: 'Romanian',
        RU: 'Russian',
        SK: 'Slovak',
        SL: 'Slovenian',
        SV: 'Swedish',
        TR: 'Turkish',
        UK: 'Ukrainian',
        ZH: 'Chinese'
    },
    TargetLanguage: {
        BG: 'Bulgarian',
        CS: 'Czech',
        DA: 'Danish',
        DE: 'German',
        EL: 'Greek',
        'EN-GB': 'English (British)',
        'EN-US': 'English (American)',
        ES: 'Spanish',
        ET: 'Estonian',
        FI: 'Finnish',
        FR: 'French',
        HU: 'Hungarian',
        ID: 'Indonesian',
        IT: 'Italian',
        JA: 'Japanese',
        KO: 'Korean',
        LT: 'Lithuanian',
        LV: 'Latvian',
        NB: 'Norwegian (Bokmål)',
        NL: 'Dutch',
        PL: 'Polish',
        'PT-BR': 'Portuguese (Brazilian)',
        'PT-PT': 'Portuguese',
        RO: 'Romanian',
        RU: 'Russian',
        SK: 'Slovak',
        SL: 'Slovenian',
        SV: 'Swedish',
        TR: 'Turkish',
        UK: 'Ukrainian',
        ZH: 'Chinese'
    }
};

const GoogleTranslate = {
    translateText: async function (data, inputText, sourceLanguage, targetLanguage, useGlossary = false, tc = 0) {
        try {
            inputText = useGlossary ? getDynamicDictionaryText(inputText, false) : inputText;

            /**
             * Google translate Widget
             * Method: POST
             * URL: https://translate.googleapis.com/translate_a/t?anno=3&client=te&format=html&v=1.0&key&logld=v${version}&sl=${sourceLanguage}&tl=${targetLanguage}&tc=0&tk=${lq(inputText, ctkk)}
             * `q=${inputText.split(/\n/).map((sentence) => encodeURIComponent(sentence)).join('&q=')}`
             *
             * Google Translate
             * Method: GET
             * URL: https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage}&tl=${targetLanguage}&hl=vi&dt=t&dt=bd&dj=1&q=${encodeURIComponent(inputText)}
             *
             * Google Translate Website
             * Method: POST
             * URL: https://translate.googleapis.com/translate_a/t?anno=3&client=wt_lib&format=html&v=1.0&key=&logld=v${version}&sl=${sourceLanguage}&tl=${targetLanguage}&tc=0&tk=${lq(inputText, ctkk)}
             * Content-Type: application/x-www-form-urlencoded - `q=${inputText.split(/\n/).map((sentence) => encodeURIComponent(sentence)).join('&q=')}`
             *
             * Google Chrome
             * Method: POST
             * URL: https://translate.googleapis.com/translate_a/t?anno=3&client=te_lib&format=html&v=1.0&key=AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw&logld=v${version}&sl=${sourceLanguage}&tl=${targetLanguage}&tc=0&tk=${lq(inputText, ctkk)}
             * content-type: application/x-www-form-urlencoded - `q=${inputText.split(/\n/).map((sentence) => encodeURIComponent(sentence)).join('&q=')}`
             */
            const response = await $.ajax({
			url: `https://translate.googleapis.com/translate_a/t?anno=3&client=${data.cac.length > 0 ? `${data.cac}${data.cam.length > 0 ? `_${data.cam}` : ''}` : 'te_lib'}&format=text&v=1.0&key${data.apiKey.length > 0 ? `=${data.apiKey}` : ''}&logld=v${data.version}&sl=${sourceLanguage}&tl=${targetLanguage}&tc=${tc}&tk=${this.lq(inputText, data.ctkk)}`,
                data: `q=${inputText.split(/\n/).map((sentence) => encodeURIComponent(sentence)).join('&q=')}`,
                method: 'POST',
                headers: {
                    'content-type': 'application/x-www-form-urlencoded'
                }
            });

            return response.map((element) => ((sourceLanguage == 'auto' ? element[0] : element).includes('<i>') ? (sourceLanguage == 'auto' ? element[0] : element).split('</i> <b>').filter((element) => element.includes('</b>')).map((element) => ('<b>' + element.replace(/<i>.+/, ''))).join(' ') : (sourceLanguage == 'auto' ? element[0] : element)).trim()).join('\n');
        } catch (error) {
            console.error('Bản dịch lỗi:', error);
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
                 * URL: https://translate.googleapis.com/translate_a/element.js?aus=true&cb=cr.googleTranslate.onTranslateElementLoad&clc=cr.googleTranslate.onLoadCSS&jlc=cr.googleTranslate.onLoadJavascript&key=AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw&hl=vi
                 */
                const elementJs = await $.get(`${CORS_PROXY}https://translate.googleapis.com/translate_a/element.js?aus=true${apiKey.length > 0 ? `&key=${apiKey}` : ''}&hl=vi&client=gtx`);

                if (elementJs != undefined) {
                    data.cac = elementJs.match(/c\._cac='([a-z]*)'/)[1];
                    data.cam = elementJs.match(/c\._cam='([a-z]*)'/)[1];

                    data.apiKey = apiKey;

                    data.version = elementJs.match(/_exportVersion\('(TE_\d+)'\)/)[1];
                    data.ctkk = elementJs.match(/c\._ctkk='(\d+\.\d+)'/)[1];
                }
                return data;
            } catch (error) {
                console.error('Không thể lấy được Log ID hoặc Token:' + error);
                throw error.toString()
            }
        }
    },
    // https://translate.googleapis.com/_/translate_http/_/js/k=translate_http.tr.vi.kHDxdXNX_xs.O/d=1/exm=el_conf/ed=1/rs=AN8SPfpT9XwieloixvTeQsMmZktnBHnMuw/m=el_main
    Oo: function (a) {
        for (var b = [], c = 0, d = 0; d < a.length; d++) {
            var e = a.charCodeAt(d);
            128 > e
                ? (b[c++] = e)
                : (2048 > e
                    ? (b[c++] = (e >> 6) | 192)
                    : (55296 == (e & 64512) && d + 1 < a.length && 56320 == (a.charCodeAt(d + 1) & 64512)
                        ? ((e = 65536 + ((e & 1023) << 10) + (a.charCodeAt(++d) & 1023)), (b[c++] = (e >> 18) | 240), (b[c++] = ((e >> 12) & 63) | 128))
                        : (b[c++] = (e >> 12) | 224),
                        (b[c++] = ((e >> 6) & 63) | 128)),
                    (b[c++] = (e & 63) | 128));
        }
        return b;
    },
    jq: function (a, b) {
        for (var c = 0; c < b.length - 2; c += 3) {
            var d = b.charAt(c + 2);
            d = "a" <= d ? d.charCodeAt(0) - 87 : Number(d);
            d = "+" == b.charAt(c + 1) ? a >>> d : a << d;
            a = "+" == b.charAt(c) ? (a + d) & 4294967295 : a ^ d;
        }
        return a;
    },
    lq: function (a, kq) {
        var b = kq.split("."),
            c = Number(b[0]) || 0;
        a = this.Oo(a);
        for (var d = c, e = 0; e < a.length; e++) (d += a[e]), (d = this.jq(d, "+-a^+6"));
        d = this.jq(d, "+-3^+b+-f");
        d ^= Number(b[1]) || 0;
        0 > d && (d = (d & 2147483647) + 2147483648);
        b = d % 1e6;
        return b.toString() + "." + (b ^ c);
    },
    Language: {
        af: 'Afrikaans',
        sq: 'Albanian',
        am: 'Amharic',
        ar: 'Arabic',
        hy: 'Armenian',
        as: 'Assamese',
        ay: 'Aymara',
        az: 'Azerbaijani',
        bm: 'Bambara',
        eu: 'Basque',
        be: 'Belarusian',
        bn: 'Bengali',
        bho: 'Bhojpuri',
        bs: 'Bosnian',
        bg: 'Bulgarian',
        ca: 'Catalan',
        ceb: 'Cebuano',
        'zh-CN': 'Chinese (Simplified)',
        'zh-TW': 'Chinese (Traditional)',
        co: 'Corsican',
        hr: 'Croatian',
        cs: 'Czech',
        da: 'Danish',
        dv: 'Dhivehi',
        doi: 'Dogri',
        nl: 'Dutch',
        en: 'English',
        eo: 'Esperanto',
        et: 'Estonian',
        ee: 'Ewe',
        fil: 'Filipino (Tagalog)',
        fi: 'Finnish',
        fr: 'French',
        fy: 'Frisian',
        gl: 'Galician',
        ka: 'Georgian',
        de: 'German',
        el: 'Greek',
        gn: 'Guarani',
        gu: 'Gujarati',
        ht: 'Haitian Creole',
        ha: 'Hausa',
        haw: 'Hawaiian',
        he: 'Hebrew',
        iw: 'Hebrew',
        hi: 'Hindi',
        hmn: 'Hmong',
        hu: 'Hungarian',
        is: 'Icelandic',
        ig: 'Igbo',
        ilo: 'Ilocano',
        id: 'Indonesian',
        ga: 'Irish',
        it: 'Italian',
        ja: 'Japanese',
        jw: 'Javanese',
        kn: 'Kannada',
        kk: 'Kazakh',
        km: 'Khmer',
        rw: 'Kinyarwanda',
        gom: 'Konkani',
        ko: 'Korean',
        kri: 'Krio',
        ku: 'Kurdish',
        ckb: 'Kurdish (Sorani)',
        ky: 'Kyrgyz',
        lo: 'Lao',
        la: 'Latin',
        lv: 'Latvian',
        ln: 'Lingala',
        lt: 'Lithuanian',
        lg: 'Luganda',
        lb: 'Luxembourgish',
        mk: 'Macedonian',
        mai: 'Maithili',
        mg: 'Malagasy',
        ms: 'Malay',
        ml: 'Malayalam',
        mt: 'Maltese',
        mi: 'Maori',
        mr: 'Marathi',
        'mni-Mtei': 'Meiteilon (Manipuri)',
        lus: 'Mizo',
        mn: 'Mongolian',
        my: 'Myanmar (Burmese)',
        ne: 'Nepali',
        no: 'Norwegian',
        ny: 'Nyanja (Chichewa)',
        or: 'Odia (Oriya)',
        om: 'Oromo',
        ps: 'Pashto',
        fa: 'Persian',
        pl: 'Polish',
        pt: 'Portuguese (Portugal, Brazil)',
        pa: 'Punjabi',
        qu: 'Quechua',
        ro: 'Romanian',
        ru: 'Russian',
        sm: 'Samoan',
        sa: 'Sanskrit',
        gd: 'Scots Gaelic',
        nso: 'Sepedi',
        sr: 'Serbian',
        st: 'Sesotho',
        sn: 'Shona',
        sd: 'Sindhi',
        si: 'Sinhala (Sinhalese)',
        sk: 'Slovak',
        sl: 'Slovenian',
        so: 'Somali',
        es: 'Spanish',
        su: 'Sundanese',
        sw: 'Swahili',
        sv: 'Swedish',
        tl: 'Tagalog (Filipino)',
        tg: 'Tajik',
        ta: 'Tamil',
        tt: 'Tatar',
        te: 'Telugu',
        th: 'Thai',
        ti: 'Tigrinya',
        ts: 'Tsonga',
        tr: 'Turkish',
        tk: 'Turkmen',
        ak: 'Twi (Akan)',
        uk: 'Ukrainian',
        ur: 'Urdu',
        ug: 'Uyghur',
        uz: 'Uzbek',
        vi: 'Vietnamese',
        cy: 'Welsh',
        xh: 'Xhosa',
        yi: 'Yiddish',
        yo: 'Yoruba',
        zu: 'Zulu'
    }
};

const Papago = {
    translateText: async function (version, inputText, sourceLanguage, targetLanguage, useGlossary = false) {
        try {
            inputText = useGlossary ? getDynamicDictionaryText(inputText, false) : inputText;

            const timeStamp = (new Date()).getTime();

            const response = await $.ajax({
                url: CORS_PROXY + 'https://papago.naver.com/apis/n2mt/translate',
                data: `deviceId=${uuid}&locale=vi&dict=true&dictDisplay=30&honorific=true&instant=false&paging=false&source=${sourceLanguage}&target=${targetLanguage}&text=${encodeURIComponent(inputText)}`,
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Accept-Language': 'vi',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                 // 'device-type': 'pc' || 'mobile',
                    'x-apigw-partnerid': 'papago',
                    Authorization: 'PPG ' + uuid + ':' + CryptoJS.HmacMD5(uuid + '\n' + 'https://papago.naver.com/apis/n2mt/translate' + '\n' + timeStamp, version).toString(CryptoJS.enc.Base64),
                    Timestamp: timeStamp
                }
            });
            return response.translatedText;
        } catch (error) {
            console.error('Bản dịch lỗi:', error);
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
        ko: 'Korean',
        ja: 'Japanese',
        'zh-CN': 'Chinese (Simplified)',
        'zh-TW': 'Chinese (Traditional)',
        hi: 'Hindi',
        en: 'English',
        es: 'Spanish',
        fr: 'French',
        de: 'German',
        pt: 'Portuguese',
        vi: 'Vietnamese',
        id: 'Indonesian',
        fa: 'Persian',
        ar: 'Arabic',
        mm: 'Burmese',
        th: 'Thai',
        ru: 'Russian',
        it: 'Italian'
    }
};

const MicrosoftTranslator = {
    translateText: async function (accessToken, inputText, sourceLanguage, targetLanguage, useGlossary = false) {
        try {
            inputText = useGlossary ? getDynamicDictionaryText(inputText) : inputText;

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
                url: `https://api-edge.cognitive.microsofttranslator.com/translate?${sourceLanguage != '' ? `from=${sourceLanguage}&` : ''}to=${targetLanguage}&api-version=3.0&includeSentenceLength=true`,
                data: JSON.stringify(inputText.split(/\n/).map((sentence) => ({'Text': sentence}))),
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.map((element) => element.translations[0].text.trim()).join('\n');
        } catch (error) {
            console.error('Bản dịch lỗi:', error);
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
        af: 'Afrikaans',
        sq: 'Albanian',
        am: 'Amharic',
        ar: 'Arabic',
        hy: 'Armenian',
        as: 'Assamese',
        az: 'Azerbaijani (Latin)',
        bn: 'Bangla',
        ba: 'Bashkir',
        eu: 'Basque',
        bs: 'Bosnian (Latin)',
        bg: 'Bulgarian',
        yue: 'Cantonese (Traditional)',
        ca: 'Catalan',
        lzh: 'Chinese (Literary)',
        'zh-Hans': 'Chinese Simplified',
        'zh-Hant': 'Chinese Traditional',
        hr: 'Croatian',
        cs: 'Czech',
        da: 'Danish',
        prs: 'Dari',
        dv: 'Divehi',
        nl: 'Dutch',
        en: 'English',
        et: 'Estonian',
        fo: 'Faroese',
        fj: 'Fijian',
        fil: 'Filipino',
        fi: 'Finnish',
        fr: 'French',
        'fr-ca': 'French (Canada)',
        gl: 'Galician',
        ka: 'Georgian',
        de: 'German',
        el: 'Greek',
        gu: 'Gujarati',
        ht: 'Haitian Creole',
        he: 'Hebrew',
        hi: 'Hindi',
        mww: 'Hmong Daw (Latin)',
        hu: 'Hungarian',
        is: 'Icelandic',
        id: 'Indonesian',
        ikt: 'Inuinnaqtun',
        iu: 'Inuktitut',
        'iu-Latn': 'Inuktitut (Latin)',
        ga: 'Irish',
        it: 'Italian',
        ja: 'Japanese',
        kn: 'Kannada',
        kk: 'Kazakh',
        km: 'Khmer',
        'tlh-Latn': 'Klingon',
        'tlh-Piqd': 'Klingon (plqaD)',
        ko: 'Korean',
        ku: 'Kurdish (Central)',
        kmr: 'Kurdish (Northern)',
        ky: 'Kyrgyz (Cyrillic)',
        lo: 'Lao',
        lv: 'Latvian',
        lt: 'Lithuanian',
        mk: 'Macedonian',
        mg: 'Malagasy',
        ms: 'Malay (Latin)',
        ml: 'Malayalam',
        mt: 'Maltese',
        mi: 'Maori',
        mr: 'Marathi',
        'mn-Cyrl': 'Mongolian (Cyrillic)',
        'mn-Mong': 'Mongolian (Traditional)',
        my: 'Myanmar',
        ne: 'Nepali',
        nb: 'Norwegian',
        or: 'Odia',
        ps: 'Pashto',
        fa: 'Persian',
        pl: 'Polish',
        pt: 'Portuguese (Brazil)',
        'pt-pt': 'Portuguese (Portugal)',
        pa: 'Punjabi',
        otq: 'Queretaro Otomi',
        ro: 'Romanian',
        ru: 'Russian',
        sm: 'Samoan (Latin)',
        'sr-Cyrl': 'Serbian (Cyrillic)',
        'sr-Latn': 'Serbian (Latin)',
        sk: 'Slovak',
        sl: 'Slovenian',
        so: 'Somali (Arabic)',
        es: 'Spanish',
        sw: 'Swahili (Latin)',
        sv: 'Swedish',
        ty: 'Tahitian',
        ta: 'Tamil',
        tt: 'Tatar (Latin)',
        te: 'Telugu',
        th: 'Thai',
        bo: 'Tibetan',
        ti: 'Tigrinya',
        to: 'Tongan',
        tr: 'Turkish',
        tk: 'Turkmen (Latin)',
        uk: 'Ukrainian',
        hsb: 'Upper Sorbian',
        ur: 'Urdu',
        ug: 'Uyghur (Arabic)',
        uz: 'Uzbek (Latin)',
        vi: 'Vietnamese',
        cy: 'Welsh',
        yua: 'Yucatec Maya',
        zu: 'Zulu'
    }
};

function getDynamicDictionaryText(text, isMicrosoftTranslator = true) {
    const glossaryEntries = Object.entries(glossary).filter(([first]) => text.includes(first));
    let newText = text;

    if ($('#flexSwitchCheckGlossary').prop('checked') && (isMicrosoftTranslator || $('#flexSwitchCheckAllowAnothers').prop('checked')) && glossaryEntries.length > 0) {
        const lines = text.split(/\n/);
        const results = [];

        for (let i = 0; i < lines.length; i++) {
            let chars = lines[i];

            const glossaryLengths = [...glossaryEntries.map(([first]) => first.length), 1].sort((a, b) => b - a).filter((element, index, array) => index == array.indexOf(element));
            const phrases = [];
            let tempWord = '';

            for (let j = 0; j < chars.length; j++) {
                for (const glossaryLength of glossaryLengths) {
                    if (glossary.hasOwnProperty(chars.substring(j, j + glossaryLength))) {
                        if (glossary[chars.substring(j, j + glossaryLength)].length > 0) {
                            phrases.push(isMicrosoftTranslator ? `<mstrans:dictionary translation="${glossary[chars.substring(j, j + glossaryLength)]}">${chars.substring(j, j + glossaryLength)}</mstrans:dictionary>` : glossary[chars.substring(j, j + glossaryLength)]);
                        }

                        j += glossaryLength - 1;
                        break;
                    } else if (glossaryLength == 1) {
                        if (tempWord.length > 0 && chars[j] == ' ' && !tempWord.includes(' ')) {
                            tempWord.split(' ').forEach((element) => phrases.push(element));
                            tempWord = '';
                        }

                        tempWord += chars[j];

                        if (tempWord.includes(' ')) {
                            if (j + 1 == chars.length || !chars[j + 1].includes(' ')) {
                                phrases.push((phrases.pop() ?? '') + tempWord.substring(0, tempWord.length - 1));
                                tempWord = '';
                            }
                            break;
                        }

                        for (const glossaryLength1 of glossaryLengths) {
                            if (tempWord.length > 0 && (glossary.hasOwnProperty(chars.substring(j + 1, j + 1 + glossaryLength1)) || j + 1 == chars.length)) {
                                tempWord.split(' ').forEach((element) => phrases.push(element));
                                tempWord = '';
                                break;
                            }
                        }
                        break;
                    }
                }
            }

            results.push(phrases.join(' '));
        }

        newText = results.join('\n');
    }
    return newText;
}

const Translators = {
    DEEPL_TRANSLATOR: 'deeplTranslator',
    GOOGLE_TRANSLATE: 'googleTranslate',
    LINGVANEX: 'lingvanex',
    PAPAGO: 'papago',
    MICROSOFT_TRANSLATOR: 'microsoftTranslator',
    VIETPHRASE: 'vietphrase'
};

const VietPhraseTranslationAlgorithms = {
    PRIORITIZE_LONG_VIETPHRASE_CLUSTERS: 0,
    TRANSLATE_FROM_LEFT_TO_RIGHT: 1
};

const VietPhraseMultiplicationAlgorithm = {
    NOT_APPLICABLE: 0,
    MULTIPLICATION_BY_PRONOUNS: 1,
    MULTIPLICATION_BY_PRONOUNS_NAMES: 2
};