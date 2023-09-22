'use strict';

let translator = JSON.parse(localStorage.getItem('translator'));

let pinyins = {};
let sinovietnameses = {};

const DEEPL_AUTH_KEY = 'a4b25ba2-b628-fa56-916e-b323b16502de:fx';
const GOOGLE_API_KEY = 'AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw';

const uuid = crypto.randomUUID();

let vietphrases = {};
let cacluatnhan = {};
let pronouns = {};

const extendsSinovietnamese = {
    '骑士长': 'KỴ SĨ TRƯỞNG',

    '掌柜': 'CHƯỞNG QUỸ',
    '团长': 'ĐOÀN TRƯỞNG',
    '师姐': 'SƯ TỶ',
    '天相': 'THIÊN TƯỚNG',
    '仙长': 'TIÊN TRƯỞNG',
    '长辈': 'TRƯỞNG BỐI',
    '长老': 'TRƯỞNG LÃO',
    '将领': 'TƯỚNG LĨNH',
    '将军': 'TƯỚNG QUÂN',
    '将士': 'TƯỚNG SĨ',
    '姐妹': 'TỶ MUỘI',
    '姐夫': 'TỶ PHU',
    '姐姐': 'TỶ TỶ',
    '王朝': 'VƯƠNG TRIỀU',

    '玑': 'CƠ',
    '柜': 'CỰ, QUỸ',
    '正': 'CHÍNH',
    '摇': 'DAO',
    '台': 'ĐÀI',
    '衡': 'HOÀNH',// HÀNH, HOÀNH
    '县': 'HUYỆN',
    '期': 'KỲ',// KI, CƠ, KỲ
    '骑': 'KỴ',
    '吕': 'LÃ, LỮ',// LỮ, LÃ
    '儿': 'NHI',
    '厅': 'SẢNH',
    '刺': 'THÍCH',// SI, THÍCH, THỨ
    '生': 'SINH',
    '山': 'SƠN',
    '层': 'TẦNG',// TẰNG TẦNG
    '栖': 'THÊ, TÊ, TÂY',
    '少': 'THIẾU', // THIỂU, THIẾU
    '姐': 'THƯ',
    '璇': 'TOÀN',
    '朝': 'TRIÊU',// TRIỀU, TRÀO, TRIÊU
    '传': 'TRUYỀN, TRUYỆN',
    '长': 'TRƯỜNG, TRÀNG, TRƯỞNG',
    '将': 'TƯƠNG, TƯỚNG',
    '燕': 'YÊN, YẾN'
};

let translateAbortController;

$(document).ready(async () => {
    try {
        let pinyinList = [];

        $.get('/static/datasource/Unihan_Readings.txt').done((data) => {
            pinyinList = data.split(/\r?\n/).filter((element) => element.match(/^U\+\d+\tkMandarin/)).map((element) => [String.fromCodePoint(parseInt(element.split(/\t/)[0].match(/U\+(\d+)/)[1], 16)), element.split(/\t/)[2]]);
            pinyins = Object.fromEntries(pinyinList);
        });
        await $.get('/static/datasource/Bính âm.txt').done((data) => pinyinList = [...pinyinList, ...data.split(/\r?\n/).map((element) => element.split('=')).sort((a, b) => b[0].length - a[0].length).map((element) => [element[0], element[1].split('ǀ')[0]]).filter((element) => !pinyins.hasOwnProperty(element[0]))]);
        pinyinList = pinyinList.filter(([key, value]) => key != '' && value != undefined && !pinyinList[key] && (pinyinList[key] = 1), {});
        pinyins = Object.fromEntries(pinyinList);
        console.log('Đã tải xong bộ dữ liệu bính âm (%d)!', pinyinList.length);
    } catch (error) {
        console.error('Không thể tải bộ dữ liệu bính âm:', error);
        setTimeout(() => window.location.reload(), 5000);
    }

    try {
        let sinovietnameseList = [...Object.entries(extendsSinovietnamese).map((element) => [element[0], element[1].replace('element[1]', extendsSinovietnamese[element[1]] ?? element[1]).split(', ')[0].toLowerCase()]), ...hanvietData.map((element) => [element[0], element[1].split(',').filter((element1) => element1.length > 0)[0]])];

        $.get('/static/datasource/ChinesePhienAmWords của thtgiang.txt').done((data) => {
            sinovietnameseList = [...sinovietnameseList, ...data.split(/\r?\n/).map((element) => element.split('=')).filter((element) => !sinovietnameses.hasOwnProperty(element[0]))];
            sinovietnameses = Object.fromEntries(sinovietnameseList);
        });
        await $.get('/static/datasource/TTV Translate.ChinesePhienAmWords.txt').done((data) => {
            sinovietnameseList = [...sinovietnameseList, ...data.split(/\r?\n/).map((element) => element.split('=')).filter((element) => !sinovietnameses.hasOwnProperty(element[0]))];
            sinovietnameses = Object.fromEntries(sinovietnameseList);
        });
        await $.get('/static/datasource/QuickTranslate2020 - ChinesePhienAmWords.txt').done((data) => {
            sinovietnameseList = [...sinovietnameseList, ...data.split(/\r?\n/).map((element) => element.split('=')).filter((element) => !sinovietnameses.hasOwnProperty(element[0]))];
            sinovietnameses = Object.fromEntries(sinovietnameseList);
        });
        await $.get('/static/datasource/Hán việt.txt').done((data) => sinovietnameseList = [...sinovietnameseList, ...data.split(/\r?\n/).map((element) => element.split('=')).sort((a, b) => b[0].length - a[0].length).map((element) => [element[0], element[1].split('ǀ')[0]]).filter((element) => !sinovietnameses.hasOwnProperty(element[0]))]);
        sinovietnameseList = sinovietnameseList.filter(([key, value]) => key != '' && !/\p{sc=Latin}/u.test(key) && value != undefined && !sinovietnameseList[key] && (sinovietnameseList[key] = 1), {});
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
        pronouns = Object.fromEntries(data.split(/\r?\n/).map((element) => element.split('=')).filter((element) => element.length == 2).map((element) => [element[0], element[1].split('/')[0]]));
        console.log('Đã tải xong tệp Pronouns.txt (%d)!', Object.entries(pronouns).length);
    }).fail((jqXHR, textStatus, errorThrown) => {
        console.error('Không tải được tệp Pronouns.txt:', errorThrown);
        setTimeout(() => window.location.reload(), 5000);
    });

    if (Object.entries(vietphrases).length == 0) {
        $.get('/static/datasource/VietPhrase.txt').done((data) => {
            let vietphraseList = [...data.split(/\r?\n/).map((element) => element.split('=')).filter((element) => element.length == 2).map((element) => [element[0], element[1].split('/')[0].split('|')[0]]), ...Object.entries(sinovietnameses)];
            vietphraseList = vietphraseList.filter(([key, value]) => key != '' && value != undefined && !vietphraseList[key] && (vietphraseList[key] = 1), {});
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
            $(this).text('Dịch');
            break;
    }
});

$('#copyButton').on('click', () => {
    const data = $('#translatedText').text() > 0 ? $('#translatedText').text() : $('#queryText').val();

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
        $('#retranslateButton').click();
    }
});

$('#inputVietphrase').on('change', function () {
    const reader = new FileReader();

    reader.onload = function () {
        let vietphraseList = this.result.split(/\r?\n/).map((element) => element.split($('#inputVietphrase').prop('files')[0].type == 'text/tab-separated-values' ? '\t' : '=')).filter((element) => element.length == 2).map((element) => [element[0], element[1].split('/')[0].split('|')[0]]);
        vietphraseList = [...vietphraseList, ...Object.entries(sinovietnameses)].filter(([key, value]) => key != '' && value != undefined && !vietphraseList[key] && (vietphraseList[key] = 1), {})
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
            return DeepLSourceLanguage[languageCode] ?? '';

        case Translators.MICROSOFT_TRANSLATOR:
            return MicrosoftLanguage[languageCode] ?? '';

        case Translators.PAPAGO:
            return PapagoLanguage[languageCode] ?? '';

        case Translators.GOOGLE_TRANSLATE:
            return GoogleLanguage[languageCode] ?? '';
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

            for (const langCode in DeepLSourceLanguage) {
                const option = document.createElement('option');
                option.innerText = DeepLSourceLanguage[langCode];
                option.value = langCode;
                sourceLangSelect.appendChild(option);
            }
            break;

        case Translators.GOOGLE_TRANSLATE:
            autoDetectOption.innerText = 'Phát hiện ngôn ngữ';
            autoDetectOption.value = 'auto';
            sourceLangSelect.appendChild(autoDetectOption);

            for (const langCode in GoogleLanguage) {
                const option = document.createElement('option');
                option.innerText = GoogleLanguage[langCode];
                option.value = langCode;
                sourceLangSelect.appendChild(option);
            }
            break;

        case Translators.PAPAGO:
            autoDetectOption.innerText = 'Phát hiện ngôn ngữ';
            autoDetectOption.value = 'auto';
            sourceLangSelect.appendChild(autoDetectOption);

            for (const langCode in PapagoLanguage) {
                const option = document.createElement('option');
                option.innerText = PapagoLanguage[langCode];
                option.value = langCode;
                sourceLangSelect.appendChild(option);
            }
            break;

        case Translators.MICROSOFT_TRANSLATOR:
            autoDetectOption.innerText = 'Tự phát hiện';
            autoDetectOption.value = '';
            sourceLangSelect.appendChild(autoDetectOption);

            for (const langCode in MicrosoftLanguage) {
                const option = document.createElement('option');
                option.innerText = MicrosoftLanguage[langCode];
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
            for (const langCode in DeepLTargetLanguage) {
                const option = document.createElement('option');
                option.innerText = DeepLTargetLanguage[langCode];
                option.value = langCode;
                targetLangSelect.appendChild(option);
            }
            break;

        case Translators.GOOGLE_TRANSLATE:
            for (const langCode in GoogleLanguage) {
                const option = document.createElement('option');
                option.innerText = GoogleLanguage[langCode];
                option.value = langCode;
                targetLangSelect.appendChild(option);
            }
            break;

        case Translators.PAPAGO:
            for (const langCode in PapagoLanguage) {
                const option = document.createElement('option');
                option.innerText = PapagoLanguage[langCode];
                option.value = langCode;
                targetLangSelect.appendChild(option);
            }
            break;

        case Translators.MICROSOFT_TRANSLATOR:
            for (const langCode in MicrosoftLanguage) {
                const option = document.createElement('option');
                option.innerText = MicrosoftLanguage[langCode];
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
    const translator = $('.translator.active').data('id');

    const sourceLanguage = $('#sourceLangSelect').val();
    const targetLanguage = $('#targetLangSelect').val();

    const isCjkTargetLanguage = !(targetLanguage == 'JA' || targetLanguage == 'KO' || targetLanguage == 'ZH') || !(targetLanguage == 'zh-CN' || targetLanguage == 'zh-TW' || targetLanguage == 'ja' || targetLanguage == 'ko') || !(targetLanguage == 'ko' || targetLanguage == 'ja' || targetLanguage == 'zh-CN' || targetLanguage == 'zh-TW') || !(targetLanguage == 'yue' || targetLanguage == 'lzh' || targetLanguage == 'zh-Hans' || targetLanguage == 'zh-Hant' || targetLanguage == 'ja' || targetLanguage == 'ko');

    const errorMessage = document.createElement('p');

    try {
        const processText = getProcessTextPreTranslate(inputText, $('#flexSwitchCheckProtectQuotationMarks').prop('checked') && translator !== Translators.VIETPHRASE && isCjkTargetLanguage);
        const results = [];

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

        const googleTranslateData = translator === Translators.GOOGLE_TRANSLATE ? await getGoogleTranslateData(translator, GOOGLE_API_KEY) : null;

        if (translator === Translators.GOOGLE_TRANSLATE && (googleTranslateData.version == undefined || googleTranslateData.ctkk == undefined)) {
            errorMessage.innerText = 'Không thể lấy được Log ID hoặc Token từ element.js.';
            $('#translatedText').html(errorMessage);
            return;
        }

        const papagoVersion = translator === Translators.PAPAGO ? await getPapagoVersion(translator) : null;

        if (translator === Translators.PAPAGO && papagoVersion == undefined) {
            errorMessage.innerText = 'Không thể lấy được Thông tin phiên bản từ main.js.';
            $('#translatedText').html(errorMessage);
            return;
        }

        const microsoftTranslatorAccessToken = translator === Translators.MICROSOFT_TRANSLATOR ? await getMicrosoftTranslatorAccessToken(translator) : null;

        if (translator === Translators.MICROSOFT_TRANSLATOR && microsoftTranslatorAccessToken == undefined) {
            errorMessage.innerText = 'Không thể lấy được Access Token từ máy chủ.';
            $('#translatedText').html(errorMessage);
            return;
        }

        const queryLines = processText.split(/\n/);
        let translateLines = [];

        let canTranslate = false;

        for (let i = 0; i < processText.split(/\n/).length; i++) {
            if (abortSignal.aborted) return;
            if (translateLines.join('\n').length < MAX_LENGTH && translateLines.length < MAX_LINE) {
                translateLines.push(queryLines.shift());

                if (queryLines.length == 0 || translateLines.length >= MAX_LINE || translateLines.join('\n').length >= MAX_LENGTH) {
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

                switch (translator) {
                    case Translators.DEEPL_TRANSLATOR:
                        translatedText = await DeepLTranslator.translateText(DEEPL_AUTH_KEY, translateText, sourceLanguage, targetLanguage, true);
                        break;

                    default:
                    case Translators.GOOGLE_TRANSLATE:
                        translatedText = await GoogleTranslate.translateText(googleTranslateData, translateText, sourceLanguage, targetLanguage, true);
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

        if (abortSignal.aborted) return;
        $('#translatedText').html(buildTranslatedResult([inputText, inputText], getProcessTextPostTranslate(results.join('\n')), $('#flexSwitchCheckShowOriginal').prop('checked')));
    } catch (error) {
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
        throw error;
	}
    return resultDiv.innerHTML.replace(/(<p>)(<\/p>)/g, '$1<br>$2');
}

function convertText(inputText, data, caseSensitive, useGlossary, translationAlgorithm = VietPhraseTranslationAlgorithms.PRIORITIZE_LONG_VIETPHRASE_CLUSTERS, multiplicationAlgorithm = VietPhraseMultiplicationAlgorithm.MULTIPLICATION_BY_PRONOUNS_NAMES) {
    try {
        const glossaryEntries = Object.entries(glossary).filter((element) => inputText.includes(element[0]));
        const luatnhanList = [];

        if (multiplicationAlgorithm > VietPhraseMultiplicationAlgorithm.NOT_APPLICABLE) {
            for (const luatnhan in cacluatnhan) {
                for (const pronoun in pronouns) {
                    luatnhanList.push([luatnhan.replace(/\{0}/g, pronoun), cacluatnhan[luatnhan].replace(/\{0}/g, pronouns[pronoun])]);
                }

                if (useGlossary && multiplicationAlgorithm == VietPhraseMultiplicationAlgorithm.MULTIPLICATION_BY_PRONOUNS_NAMES && glossaryEntries.length > 0) {
                    for (const element in glossary) {
                        luatnhanList.push([luatnhan.replace(/\{0}/g, element).replace(/\$/g, '$$$&'), cacluatnhan[luatnhan].replace(/\{0}/g, glossary[element].replace(/\$/g, '$$$&'))]);
                    }
                }
            }
        }

        let dataEntries = [...luatnhanList, ...Object.entries(data)];
        data = Object.fromEntries(dataEntries.filter((element) => (!useGlossary || !glossary.hasOwnProperty(element[0])) && inputText.includes(element[0])).sort((a, b) => b[0].length - a[0].length));
        dataEntries = Object.entries(data);

        const punctuationEntries = cjkmap.filter((element) => element[0] == '…' || element[0].split('…').length != 2);
        const punctuation = Object.fromEntries(punctuationEntries);

        const results = [];
        let result = inputText;
        const lines = inputText.split(/\n/);

        for (let i = 0; i < lines.length; i++) {
            let chars = lines[i];

            const filteredPunctuationEntries = punctuationEntries.filter((element) => chars.includes(element[0]));

            if (chars.trim().length == 0) {
                results.push(chars);
                continue;
            }

            const filteredDataEntries = dataEntries.filter((element) => chars.includes(element[0]));
            const filteredGlossaryEntries = glossaryEntries.filter((element) => chars.includes(element[0]))

            if (filteredDataEntries.length == 0 && filteredPunctuationEntries.length == 0 && filteredGlossaryEntries.length == 0) {
                results.push(chars);
                continue;
            }

            if (translationAlgorithm == VietPhraseTranslationAlgorithms.PRIORITIZE_LONG_VIETPHRASE_CLUSTERS) {
                for (const property in Object.fromEntries([...useGlossary && filteredGlossaryEntries.length > 0 ? filteredGlossaryEntries : [], ...filteredDataEntries])) {
                    filteredPunctuationEntries.forEach((element) => chars = chars.replace(new RegExp(element[0].replace(/[/[\]\-.\\|^$!=()*+?{}]/g, '\\$&'), 'g'), element[1].replace(/\$/g, '$$$&')));
                    chars = chars.replace(new RegExp(`${property.replace(/[/[\]\-.\\|^$!=()*+?{}]/g, '\\$&')}(?=$|(?:[!,.:;?]\\s+|['"\\p{Pe}\\p{Pf}]\\s*))`, 'gu'), data[property].replace(/[/[\]\-.\\|^$!=()*+?{}]/g, '\\$&')).replace(new RegExp(property.replace(/[/[\]\-.\\|^$!=()*+?{}]/g, '\\$&'), 'g'), `${data[property].replace(/\$/g, '$$$&')} `);
                }

                results.push(chars);
            } else if (translationAlgorithm == VietPhraseTranslationAlgorithms.TRANSLATE_FROM_LEFT_TO_RIGHT) {
                const glossaryLengths = [...filteredGlossaryEntries.map((element) => element[0].length), 1].sort((a, b) => b - a).filter((element, index, array) => index == array.indexOf(element));
                const phraseLengths = [...useGlossary && glossaryLengths.length > 1 ? glossaryLengths : [], ...filteredDataEntries.map((element) => element[0].length), 1].sort((a, b) => b - a).filter((element, index, array) => index == array.indexOf(element));
                const phrases = [];
                let tempWord = '';

                for (let j = 0; j < chars.length; j++) {
                    if (useGlossary && glossaryEntries.length > 0) {
                        for (const glossaryLength of glossaryLengths) {
                            if (glossary.hasOwnProperty(chars.substring(j, j + glossaryLength))) {
                                if (glossary[chars.substring(j, j + glossaryLength)] != undefined) {
                                    if (punctuation.hasOwnProperty(chars[j - 1]) && /[\p{Ps}\p{Pi}\p{Po}]/u.test(chars[j - 1])) {
                                        phrases.push((phrases.pop() ?? '') + glossary[chars.substring(j, j + glossaryLength)]);
                                    } else {
                                        phrases.push(glossary[chars.substring(j, j + glossaryLength)]);
                                    }
                                }
    
                                j += glossaryLength - 1;
                                break;
                            }
                        }
                    }

                    for (const phraseLength of phraseLengths) {
                        if (data.hasOwnProperty(chars.substring(j, j + phraseLength))) {
                            if (data[chars.substring(j, j + phraseLength)] != undefined) {
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
        throw error;
    }
}

function getProcessTextPreTranslate(text, doProtectQuotationMarks) {
    let lines = text.split(/\n/);

    if (text.length > 0) {
        try {
            if (doProtectQuotationMarks) {
                const brackets = cjkmap.filter((element) => element[0] != '…' && element[0].split('…').length == 2).map((element) => [element[0].replace(/[/[\]\-.\\|^$!=()*+?{}]/g, '\\$&'), element[1]]);

                lines = lines.map((element) => {
                    for (let i = 0; i < brackets.length; i++) {
                        if ((new RegExp(`[${brackets[i][0].split('…')[0]}${brackets[i][0].split('…')[1]}]`)).test(element)) {
                            return element.replace(new RegExp(`^${brackets[i][0].split('…')[0]}(.*)${brackets[i][0].split('…')[1]}(\\u{3002}?)$`, 'gu'), `[OPEN_BRACKET_${i}]\n$1\n[CLOSE_BRACKET_${i}]$2`);
                        }
                    }

                    return element;
                });
            }
        } catch (error) {
            console.error('Lỗi xử lý văn bản trước khi dịch:', error);
            throw error;
        }
    }

    return lines.join('\n');
}

function getProcessTextPostTranslate(text) {
    let newText = text;

    if (text.length > 0) {
        try {
            const brackets = cjkmap.filter((element) => element[1] != '...' && element[1].split('...').length == 2);

            for (let i = brackets.length - 1; i >= 0; i--) {
                newText = newText.replace(new RegExp(`\\[OPEN_BRACKET_${i}\\].*\n+(.*)\n*\\[CLOSE_BRACKET_${i}\\]`, 'gi'), `${brackets[i][1].split('...')[0]}$1${brackets[i][1].split('...')[1]}`).replace(new RegExp(`\\[OPEN_BRACKET_${i}\\].*\n+`, 'gi'), brackets[i][1].split('...')[0]).replace(new RegExp(`\n*\\[CLOSE_BRACKET_${i}\\]`, 'gi'), brackets[i][1].split('...')[1]);
            }
        } catch (error) {
            console.error('Lỗi xử lý văn bản sau khi dịch:', error);
            throw error;
        }
    }

    return newText.split(/\n/).map((element) => element.trim()).join('\n');
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

const DeepLTranslator = {
    translateText: async function (authKey, inputText, sourceLanguage, targetLanguage, useGlossary = false) {
        try {
            inputText = useGlossary ? getDynamicDictionaryText(inputText, false) : inputText;

            const response = await $.ajax({
                url: 'https://api-free.deepl.com/v2/translate?auth_key=' + authKey,
                data: `text=${inputText.split(/\n/).map((sentence) => encodeURIComponent(sentence)).join('&text=')}${sourceLanguage != '' ? '&source_lang=' + sourceLanguage : ''}&target_lang=${targetLanguage}&tag_handling=html`,
                method: 'POST'
            });
            return response.translations.map((line) => line.text.trim()).join('\n');
        } catch (error) {
            console.error('Bản dịch lỗi:', error);
            throw error;
        }
    }
};

const DeepLSourceLanguage = {
    'BG': 'Bulgarian',
    'CS': 'Czech',
    'DA': 'Danish',
    'DE': 'German',
    'EL': 'Greek',
    'EN': 'English',
    'ES': 'Spanish',
    'ET': 'Estonian',
    'FI': 'Finnish',
    'FR': 'French',
    'HU': 'Hungarian',
    'ID': 'Indonesian',
    'IT': 'Italian',
    'JA': 'Japanese',
    'KO': 'Korean',
    'LT': 'Lithuanian',
    'LV': 'Latvian',
    'NB': 'Norwegian (Bokmål)',
    'NL': 'Dutch',
    'PL': 'Polish',
    'PT': 'Portuguese',
    'RO': 'Romanian',
    'RU': 'Russian',
    'SK': 'Slovak',
    'SL': 'Slovenian',
    'SV': 'Swedish',
    'TR': 'Turkish',
    'UK': 'Ukrainian',
    'ZH': 'Chinese'
};

const DeepLTargetLanguage = {
    'BG': 'Bulgarian',
    'CS': 'Czech',
    'DA': 'Danish',
    'DE': 'German',
    'EL': 'Greek',
    'EN-GB': 'English (British)',
    'EN-US': 'English (American)',
    'ES': 'Spanish',
    'ET': 'Estonian',
    'FI': 'Finnish',
    'FR': 'French',
    'HU': 'Hungarian',
    'ID': 'Indonesian',
    'IT': 'Italian',
    'JA': 'Japanese',
    'KO': 'Korean',
    'LT': 'Lithuanian',
    'LV': 'Latvian',
    'NB': 'Norwegian (Bokmål)',
    'NL': 'Dutch',
    'PL': 'Polish',
    'PT-BR': 'Portuguese (Brazilian)',
    'PT-PT': 'Portuguese',
    'RO': 'Romanian',
    'RU': 'Russian',
    'SK': 'Slovak',
    'SL': 'Slovenian',
    'SV': 'Swedish',
    'TR': 'Turkish',
    'UK': 'Ukrainian',
    'ZH': 'Chinese'
};

const GoogleTranslate = {
    translateText: async function (data, inputText, sourceLanguage, targetLanguage, useGlossary = false) {
        try {
            inputText = useGlossary ? getDynamicDictionaryText(inputText, false) : inputText;

            /**
             * Method: GET
             * URL: https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage}&tl=${targetLanguage}&hl=vi&dt=t&dt=bd&dj=1&q=${encodeURIComponent(inputText)}
             *
             * Method: GET
             * URL: https://translate.googleapis.com/translate_a/t?anno=3&client=wt_lib&format=html&v=1.0&key&logId=v${logId}&sl=${sourceLanguage}&tl=${targetLanguage}&tc=0${Bp(inputText, ctkk)}
             * Content-Type: application/x-www-form-urlencoded - send(encodeURIComponent(inputText))
             *
             * Method: POST
             * URL: https://translate.googleapis.com/translate_a/t?anno=3&client=te&format=html&v=1.0&key&logId=v${logId}&sl=${sourceLanguage}&tl=${targetLanguage}&tc=0${Bp(inputText, ctkk)}
             * send(encodeURIComponent(inputText))
             */
            const response = await $.ajax({
			url: `${CORS_PROXY}https://translate.googleapis.com/translate_a/t?anno=3&client=${data.cac.length > 0 ? `${data.cac}${data.cam.length > 0 ? `_${data.cam}` : ''}` : 'te_lib'}&format=html&v=1.0&key${data.apiKey.length > 0 ? `=${data.apiKey}` : ''}&logId=v${data.version}&sl=${sourceLanguage}&tl=${targetLanguage}&tc=0&tk=${Bp(inputText, data.ctkk)}`,
                data: `q=${inputText.split(/\n/).map((sentence) => encodeURIComponent(sentence)).join('&q=')}`,
                method: 'GET'
            });

            const paragraph = document.createElement('p');
            $(paragraph).html(response.map((line) => ((sourceLanguage == 'auto' ? line[0] : line).includes('<i>') ? (sourceLanguage == 'auto' ? line[0] : line).split('</i> <b>').filter((element) => element.includes('</b>')).map((element) => ('<b>' + element.replace(/<i>.+/, ''))).join(' ') : (sourceLanguage == 'auto' ? line[0] : line)).trim()).join('\n'));
            return $(paragraph).text();
        } catch (error) {
            console.error('Bản dịch lỗi:', error);
            throw error;
        }
    }
};

async function getGoogleTranslateData(translator, apiKey = '') {
    if (translator === Translators.GOOGLE_TRANSLATE) {
        try {
            const data = {};

            const elementJs = await $.get(`${CORS_PROXY}https://translate.googleapis.com/translate_a/element.js?aus=true&cb=cr.googleTranslate.onTranslateElementLoad&clc=cr.googleTranslate.onLoadCSS&jlc=cr.googleTranslate.onLoadJavascript${apiKey.length > 0 ? `&key=${apiKey}` : ''}&hl=vi&client=gtx`);

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
            throw error
        }
    }
}

function Ap(a, b) {
    for (var c = 0; c < b.length - 2; c += 3) {
        var d = b.charAt(c + 2);
        d = 'a' <= d ? d.charCodeAt(0) - 87 : Number(d);
        d = '+' == b.charAt(c + 1) ? a >>> d : a << d;
        a = '+' == b.charAt(c) ? a + d & 4294967295 : a ^ d
    }
    return a
}

function Bp(a, b) {
    var c = b.split('.');
    b = Number(c[0]) || 0;
    for (var d = [], e = 0, f = 0; f < a.length; f++) {
        var h = a.charCodeAt(f);
        128 > h ? d[e++] = h : (2048 > h ? d[e++] = h >> 6 | 192 : (55296 == (h
            & 64512) && f + 1 < a.length && 56320 == (a.charCodeAt(f + 1) & 64512)
            ? (h = 65536 + ((h & 1023) << 10) + (a.charCodeAt(++f)
                & 1023), d[e++] = h >> 18 | 240, d[e++] = h >> 12 & 63 | 128)
            : d[e++] = h >> 12 | 224, d[e++] = h >> 6 & 63 | 128), d[e++] = h & 63
            | 128)
    }
    a = b;
    for (e = 0; e < d.length; e++) {
        a += d[e], a = Ap(a, '+-a^+6');
    }
    a = Ap(a, '+-3^+b+-f');
    a ^= Number(c[1]) || 0;
    0 > a && (a = (a & 2147483647) + 2147483648);
    c = a % 1E6;
    return c.toString() +
        '.' + (c ^ b)
}

const GoogleLanguage = {
    'af': 'Afrikaans',
    'sq': 'Albanian',
    'am': 'Amharic',
    'ar': 'Arabic',
    'hy': 'Armenian',
    'as': 'Assamese',
    'ay': 'Aymara',
    'az': 'Azerbaijani',
    'bm': 'Bambara',
    'eu': 'Basque',
    'be': 'Belarusian',
    'bn': 'Bengali',
    'bho': 'Bhojpuri',
    'bs': 'Bosnian',
    'bg': 'Bulgarian',
    'ca': 'Catalan',
    'ceb': 'Cebuano',
    'zh-CN': 'Chinese (Simplified)',
    'zh-TW': 'Chinese (Traditional)',
    'co': 'Corsican',
    'hr': 'Croatian',
    'cs': 'Czech',
    'da': 'Danish',
    'dv': 'Dhivehi',
    'doi': 'Dogri',
    'nl': 'Dutch',
    'en': 'English',
    'eo': 'Esperanto',
    'et': 'Estonian',
    'ee': 'Ewe',
    'fil': 'Filipino (Tagalog)',
    'fi': 'Finnish',
    'fr': 'French',
    'fy': 'Frisian',
    'gl': 'Galician',
    'ka': 'Georgian',
    'de': 'German',
    'el': 'Greek',
    'gn': 'Guarani',
    'gu': 'Gujarati',
    'ht': 'Haitian Creole',
    'ha': 'Hausa',
    'haw': 'Hawaiian',
    'he': 'Hebrew',
    'iw': 'Hebrew',
    'hi': 'Hindi',
    'hmn': 'Hmong',
    'hu': 'Hungarian',
    'is': 'Icelandic',
    'ig': 'Igbo',
    'ilo': 'Ilocano',
    'id': 'Indonesian',
    'ga': 'Irish',
    'it': 'Italian',
    'ja': 'Japanese',
    'jw': 'Javanese',
    'kn': 'Kannada',
    'kk': 'Kazakh',
    'km': 'Khmer',
    'rw': 'Kinyarwanda',
    'gom': 'Konkani',
    'ko': 'Korean',
    'kri': 'Krio',
    'ku': 'Kurdish',
    'ckb': 'Kurdish (Sorani)',
    'ky': 'Kyrgyz',
    'lo': 'Lao',
    'la': 'Latin',
    'lv': 'Latvian',
    'ln': 'Lingala',
    'lt': 'Lithuanian',
    'lg': 'Luganda',
    'lb': 'Luxembourgish',
    'mk': 'Macedonian',
    'mai': 'Maithili',
    'mg': 'Malagasy',
    'ms': 'Malay',
    'ml': 'Malayalam',
    'mt': 'Maltese',
    'mi': 'Maori',
    'mr': 'Marathi',
    'mni-Mtei': 'Meiteilon (Manipuri)',
    'lus': 'Mizo',
    'mn': 'Mongolian',
    'my': 'Myanmar (Burmese)',
    'ne': 'Nepali',
    'no': 'Norwegian',
    'ny': 'Nyanja (Chichewa)',
    'or': 'Odia (Oriya)',
    'om': 'Oromo',
    'ps': 'Pashto',
    'fa': 'Persian',
    'pl': 'Polish',
    'pt': 'Portuguese',
    'pa': 'Punjabi',
    'qu': 'Quechua',
    'ro': 'Romanian',
    'ru': 'Russian',
    'sm': 'Samoan',
    'sa': 'Sanskrit',
    'gd': 'Scots Gaelic',
    'nso': 'Sepedi',
    'sr': 'Serbian',
    'st': 'Sesotho',
    'sn': 'Shona',
    'sd': 'Sindhi',
    'si': 'Sinhala (Sinhalese)',
    'sk': 'Slovak',
    'sl': 'Slovenian',
    'so': 'Somali',
    'es': 'Spanish',
    'su': 'Sundanese',
    'sw': 'Swahili',
    'sv': 'Swedish',
    'tl': 'Tagalog (Filipino)',
    'tg': 'Tajik',
    'ta': 'Tamil',
    'tt': 'Tatar',
    'te': 'Telugu',
    'th': 'Thai',
    'ti': 'Tigrinya',
    'ts': 'Tsonga',
    'tr': 'Turkish',
    'tk': 'Turkmen',
    'ak': 'Twi (Akan)',
    'uk': 'Ukrainian',
    'ur': 'Urdu',
    'ug': 'Uyghur',
    'uz': 'Uzbek',
    'vi': 'Vietnamese',
    'cy': 'Welsh',
    'xh': 'Xhosa',
    'yi': 'Yiddish',
    'yo': 'Yoruba',
    'zu': 'Zulu'
}

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
            throw error;
        }
    }
};

async function getPapagoVersion(translator) {
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
            throw error
        }
    }
}

const PapagoLanguage = {
    'ko': 'Korean',
    'ja': 'Japanese',
    'zh-CN': 'Chinese (Simplified)',
    'zh-TW': 'Chinese (Traditional)',
    'hi': 'Hindi',
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'pt': 'Portuguese',
    'vi': 'Vietnamese',
    'id': 'Indonesian',
    'fa': 'Persian',
    'ar': 'Arabic',
    'mm': 'Burmese',
    'th': 'Thai',
    'ru': 'Russian',
    'it': 'Italian'
};

const MicrosoftTranslator = {
    translateText: async function (accessToken, inputText, sourceLanguage, targetLanguage, useGlossary = false) {
        try {
            inputText = useGlossary ? getDynamicDictionaryText(inputText) : inputText;

            /**
             *const bingTranslatorHTML = await $.get('https://cors-anywhere.herokuapp.com/https://www.bing.com/translator');
             *const IG = bingTranslatorHTML.match(/IG:'([A-Z0-9]+)'/)[1];
             *const IID = bingTranslatorHTML.match(/data-iid='(translator.\d+)'/)[1];
             *const [, key, token] = bingTranslatorHTML.match(/var params_AbusePreventionHelper\s*=\s*\[([0-9]+),\s*'([^']+)',[^\]]*\];/);
             * Method: POST
             * URL: https://www.bing.com/ttranslatev3?isVertical=1&&IG=76A5BF5FFF374A53A1374DE8089BDFF2&IID=translator.5029
             * Content-type: application/x-www-form-urlencoded send(&fromLang=auto-detect&text=inputText&to=targetLanguage&token=kXtg8tfzQrA11KAJyMhp61NCVy-19gPj&key=1687667900500&tryFetchingGenderDebiasedTranslations=true)
             *
             * Method: POST
             * URL: https://api.cognitive.microsofttranslator.com/translate?to=${targetLanguage}&api-version=3.0&includeSentenceLength=true
             * Content-Type: application/json - send(inputText)
             *
             * Method: POST
             * URL: https://api-edge.cognitive.microsofttranslator.com/translate?to=${targetLanguage}&api-version=3.0&includeSentenceLength=true
             * Authorization: Bearer ${accessToken} - Content-Type: application/json - send(inputText)
             */
            const response = await $.ajax({
                url: `https://api.cognitive.microsofttranslator.com/translate?${sourceLanguage != '' ? `from=${sourceLanguage}&` : ''}to=${targetLanguage}&api-version=3.0&textType=html&includeSentenceLength=true`,
                data: JSON.stringify(inputText.split(/\n/).map((sentence) => ({'Text': sentence}))),
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + accessToken,
                    'Content-Type': 'application/json'
                }
            });
            return response.map((element) => element.translations[0].text.trim()).join('\n');
        } catch (error) {
            console.error('Bản dịch lỗi:', error);
            throw error;
        }
    }
};

async function getMicrosoftTranslatorAccessToken(translator) {
    if (translator === Translators.MICROSOFT_TRANSLATOR) {
        try {
            return await $.get('https://edge.microsoft.com/translate/auth');
        } catch (error) {
            console.error('Không thể lấy được Access Token: ' + error);
            throw error
        }
    }
}

function getDynamicDictionaryText(text, isMicrosoftTranslator = true) {
    const glossaryEntries = Object.entries(glossary).filter((element) => text.includes(element[0]));
    let newText = text;

    if ($('#flexSwitchCheckGlossary').prop('checked') && (isMicrosoftTranslator || $('#flexSwitchCheckAllowAnothers').prop('checked')) && glossaryEntries.length > 0) {
        const lines = text.split(/\n/);
        const results = [];

        for (let i = 0; i < lines.length; i++) {
            let chars = lines[i];

            const glossaryLengths = [...glossaryEntries.map((element) => element[0].length), 1].sort((a, b) => b - a).filter((element, index, array) => index == array.indexOf(element));
            const phrases = [];
            let tempWord = '';

            for (let j = 0; j < chars.length; j++) {
                for (const glossaryLength of glossaryLengths) {
                    if (glossary.hasOwnProperty(chars.substring(j, j + glossaryLength))) {
                        if (glossary[chars.substring(j, j + glossaryLength)] != undefined) {
                            phrases.push(isMicrosoftTranslator ? `<mstrans:dictionary translation='${glossary[chars.substring(j, j + glossaryLength)]}'>${chars.substring(j, j + glossaryLength)}</mstrans:dictionary>` : glossary[chars.substring(j, j + glossaryLength)]);
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

const MicrosoftLanguage = {
    'af': 'Afrikaans',
    'sq': 'Albanian',
    'am': 'Amharic',
    'ar': 'Arabic',
    'hy': 'Armenian',
    'as': 'Assamese',
    'az': 'Azerbaijani (Latin)',
    'bn': 'Bangla',
    'ba': 'Bashkir',
    'eu': 'Basque',
    'bs': 'Bosnian (Latin)',
    'bg': 'Bulgarian',
    'yue': 'Cantonese (Traditional)',
    'ca': 'Catalan',
    'lzh': 'Chinese (Literary)',
    'zh-Hans': 'Chinese Simplified',
    'zh-Hant': 'Chinese Traditional',
    'hr': 'Croatian',
    'cs': 'Czech',
    'da': 'Danish',
    'prs': 'Dari',
    'dv': 'Divehi',
    'nl': 'Dutch',
    'en': 'English',
    'et': 'Estonian',
    'fo': 'Faroese',
    'fj': 'Fijian',
    'fil': 'Filipino',
    'fi': 'Finnish',
    'fr': 'French',
    'fr-ca': 'French (Canada)',
    'gl': 'Galician',
    'ka': 'Georgian',
    'de': 'German',
    'el': 'Greek',
    'gu': 'Gujarati',
    'ht': 'Haitian Creole',
    'he': 'Hebrew',
    'hi': 'Hindi',
    'mww': 'Hmong Daw (Latin)',
    'hu': 'Hungarian',
    'is': 'Icelandic',
    'id': 'Indonesian',
    'ikt': 'Inuinnaqtun',
    'iu': 'Inuktitut',
    'iu-Latn': 'Inuktitut (Latin)',
    'ga': 'Irish',
    'it': 'Italian',
    'ja': 'Japanese',
    'kn': 'Kannada',
    'kk': 'Kazakh',
    'km': 'Khmer',
    'tlh-Latn': 'Klingon',
    'tlh-Piqd': 'Klingon (plqaD)',
    'ko': 'Korean',
    'ku': 'Kurdish (Central)',
    'kmr': 'Kurdish (Northern)',
    'ky': 'Kyrgyz (Cyrillic)',
    'lo': 'Lao',
    'lv': 'Latvian',
    'lt': 'Lithuanian',
    'mk': 'Macedonian',
    'mg': 'Malagasy',
    'ms': 'Malay (Latin)',
    'ml': 'Malayalam',
    'mt': 'Maltese',
    'mi': 'Maori',
    'mr': 'Marathi',
    'mn-Cyrl': 'Mongolian (Cyrillic)',
    'mn-Mong': 'Mongolian (Traditional)',
    'my': 'Myanmar',
    'ne': 'Nepali',
    'nb': 'Norwegian',
    'or': 'Odia',
    'ps': 'Pashto',
    'fa': 'Persian',
    'pl': 'Polish',
    'pt': 'Portuguese (Brazil)',
    'pt-pt': 'Portuguese (Portugal)',
    'pa': 'Punjabi',
    'otq': 'Queretaro Otomi',
    'ro': 'Romanian',
    'ru': 'Russian',
    'sm': 'Samoan (Latin)',
    'sr-Cyrl': 'Serbian (Cyrillic)',
    'sr-Latn': 'Serbian (Latin)',
    'sk': 'Slovak',
    'sl': 'Slovenian',
    'so': 'Somali (Arabic)',
    'es': 'Spanish',
    'sw': 'Swahili (Latin)',
    'sv': 'Swedish',
    'ty': 'Tahitian',
    'ta': 'Tamil',
    'tt': 'Tatar (Latin)',
    'te': 'Telugu',
    'th': 'Thai',
    'bo': 'Tibetan',
    'ti': 'Tigrinya',
    'to': 'Tongan',
    'tr': 'Turkish',
    'tk': 'Turkmen (Latin)',
    'uk': 'Ukrainian',
    'hsb': 'Upper Sorbian',
    'ur': 'Urdu',
    'ug': 'Uyghur (Arabic)',
    'uz': 'Uzbek (Latin)',
    'vi': 'Vietnamese',
    'cy': 'Welsh',
    'yua': 'Yucatec Maya',
    'zu': 'Zulu'
};

const Translators = {
    VIETPHRASE: 'vietphrase',
    DEEPL_TRANSLATOR: 'deeplTranslator',
    GOOGLE_TRANSLATE: 'googleTranslate',
    PAPAGO: 'papago',
    MICROSOFT_TRANSLATOR: 'microsoftTranslator'
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