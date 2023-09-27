'use strict';

const glossaryManagerButton = $('#glossaryManagerButton');

const inputGlossary = $('#inputGlossary');
const clearGlossaryButton = $('#clearGlossaryButton');
const glossaryType = $('#glossaryType');
const sourceEntry = $('#sourceEntry');
const targetEntry = $('#targetEntry');

const clearSourceTextButton = $('#clearSourceTextButton');
const copyEntryButton = $('.copy-entryButton');
const pasteEntryButton = $('.paste-entryButton');

let localGlossary = JSON.parse(localStorage.getItem('glossary'));

let glossary = {};

glossaryManagerButton.on('mousedown', () => {
    $('#glossaryList').val(-1).change();
    sourceEntry.val(getSelectedTextOrActiveElementText()).trigger('input');
});

inputGlossary.on('change', function () {
    const reader = new FileReader();

    reader.onload = function () {
        switch (inputGlossary.prop('files')[0].type) {
            default:
            case GlossaryType.TSV:
                glossary = Object.fromEntries(this.result.split(/\r?\n/).map((phrase) => phrase.split(/\t/)).filter((phrase) => phrase.length >= 2));
                break;

            case GlossaryType.CSV:
                glossary = $.csv.toObjects(this.result);
                break;

            case GlossaryType.VIETPHRASE:
                glossary = Object.fromEntries(this.result.split(/\r?\n/).map((phrase) => phrase.split('=')).filter((phrase) => phrase.length >= 2));
                break;
        }

        $('#glossaryName').val(inputGlossary.prop('files')[0].name.split('.').slice(0, inputGlossary.prop('files')[0].name.split('.').length - 1).join('.'));
        glossaryType.val(inputGlossary.prop('files')[0].type || 'text/tab-separated-values').change();
    };
    reader.readAsText($(this).prop('files')[0]);
});

clearGlossaryButton.on('click', () => {
    if (window.confirm('Bạn có muốn xoá tập từ vựng này chứ?')) {
        glossary = {};
        loadGlossary();
        inputGlossary.val(null);
    }
});

glossaryType.change(() => loadGlossary());

sourceEntry.on('input', function () {
    if ($(this).val().length > 0) {
        targetEntry.val(convertText($(this).val(), sinovietnameses, false, true, VietPhraseTranslationAlgorithms.PRIORITIZE_LONG_VIETPHRASE_CLUSTERS, VietPhraseMultiplicationAlgorithm.NOT_APPLICABLE));

        if (glossary.hasOwnProperty($(this).val())) {
            $('#glossaryList').val($(this).val());
        } else {
            $('#glossaryList').val(null);
        }
    } else {
        $('#glossaryList').val(null).change();
    }
});
$('.dropdown-toggle').on('click', () => $('.dropdown-scroller').scrollTop(0));
$('.sourceEntry-menu').on('mousedown', (event) => event.preventDefault());
clearSourceTextButton.on('click', () => sourceEntry.val(null).trigger('input'));
copyEntryButton.on('click', function () {
    const entry = $(`#${$(this).data('for')}`);

    if (entry.val().length > 0) {
        navigator.clipboard.writeText((entry.val().substring(entry.prop('selectionStart'), entry.prop('selectionEnd')) || entry.val()).substring(0, 30));
        entry.blur();
    }
});

pasteEntryButton.on('click', () => {
    navigator.clipboard
        .readText()
        .then((clipText) => {
            $(`#${$(this).data('for')}`).val(clipText).trigger('input');
        });
});

$('.convert-button').on('click', () => {
    if (sourceEntry.val().length > 0) {
        const a = Object.entries(dichNhanhJs);
        for (let i = 0; i < a.length; i++) {console.log(Object.keys({a[i]})[0]);
            if (Object.keys({a[i]})[0] == $(this).data('data')) targetEntry.val(convertText(sourceEntry.val(), variable, false, false, VietPhraseTranslationAlgorithms.PRIORITIZE_LONG_VIETPHRASE_CLUSTERS, VietPhraseMultiplicationAlgorithm.NOT_APPLICABLE));
        }
    }
});

$('#lacvietdictionaryButton').on('click', () => {
    if (sourceEntry.val().length > 0) {
        window.open(`http://mobile.coviet.vn/tratu.aspx?k=${encodeURIComponent((sourceEntry.val().substring(sourceEntry.prop('selectionStart'), sourceEntry.prop('selectionEnd')) || sourceEntry.val()).substring(0, 30))}&t=ALL`);
        sourceEntry.blur();
    }
});

$('#googleButton').on('click', () => {
    if (sourceEntry.val().length > 0) {
        window.open(`https://www.google.com.vn/search?q=${encodeURIComponent((sourceEntry.val().substring(sourceEntry.prop('selectionStart'), sourceEntry.prop('selectionEnd')) || sourceEntry.val()).substring(0, 30))}`);
        sourceEntry.blur();
    }
});

$('#wikipediaButton').on('click', () => {
    if (sourceEntry.val().length > 0) {
        window.open(`https://vi.wikipedia.org/w/?search=${encodeURIComponent((sourceEntry.val().substring(sourceEntry.prop('selectionStart'), sourceEntry.prop('selectionEnd')) || sourceEntry.val()).substring(0, 30))}&ns0=1`);
        sourceEntry.blur();
    }
});

$('#hvdicButton').on('click', () => {
    if (sourceEntry.val().length > 0) {
        window.open(`https://hvdic.thivien.net/whv/${encodeURIComponent((sourceEntry.val().substring(sourceEntry.prop('selectionStart'), sourceEntry.prop('selectionEnd')) || sourceEntry.val()).substring(0, 30))}`);
        sourceEntry.blur();
    }
});

$('#naverDictButton').on('click', () => {
    if (sourceEntry.val().length > 0) {
        window.open(`https://english.dict.naver.com/english-chinese-dictionary/#/search?query=${encodeURIComponent((sourceEntry.val().substring(sourceEntry.prop('selectionStart'), sourceEntry.prop('selectionEnd')) || sourceEntry.val()).substring(0, 30))}`);
        sourceEntry.blur();
    }
});

$('#baiduButton').on('click', () => {
    if (sourceEntry.val().length > 0) {
        window.open(`https://www.baidu.com/s?wd=${encodeURIComponent((sourceEntry.val().substring(sourceEntry.prop('selectionStart'), sourceEntry.prop('selectionEnd')) || sourceEntry.val()).substring(0, 30))}`);
        sourceEntry.blur();
    }
});

$('#deepltranslatorButton').on('click', () => {
    if (sourceEntry.val().length > 0) {
        window.open(`https://www.deepl.com/translator#auto/en/${encodeURIComponent(sourceEntry.val())}`);
        sourceEntry.blur();
    }
});

$('#googletranslateButton').on('click', () => {
    if (sourceEntry.val().length > 0) {
        window.open(`https://translate.google.com/?sl=auto&tl=vi&text=${encodeURIComponent(sourceEntry.val())}&op=translate`);
        sourceEntry.blur();
    }
});

$('#papagoButton').on('click', () => {
    if (sourceEntry.val().length > 0) {
        window.open(`https://papago.naver.com/?sk=auto&tk=vi&st=${encodeURIComponent(sourceEntry.val())}`);
        sourceEntry.blur();
    }
});

$('#bingtranslatorButton').on('click', () => {
    if (sourceEntry.val().length > 0) {
        window.open(`https://www.bing.com/translator?from=auto-detect&to=vi&text=${encodeURIComponent(sourceEntry.val())}`);
        sourceEntry.blur();
    }
});

$('#addButton').on('click', () => {
    if (sourceEntry.val().length > 0) {
        glossary[sourceEntry.val().trim()] = targetEntry.val().trim();
        loadGlossary();
        sourceEntry.val(null);
        targetEntry.val(null);
    }
});

$('#copyTargetTextButton').on('click', () => {
    if (targetEntry.val().length > 0) navigator.clipboard.writeText(targetEntry.val())
});

$('#pasteTargetTextButton').on('click', () => {
    navigator.clipboard.readText().then((clipText) => targetEntry.val(clipText).trigger('input'));
});

$('.upperCaseFromAmountButton').on('click', function () {
    if (targetEntry.val().length > 0) targetEntry.val(targetEntry.val().split(' ').map((word, index) => index < $(this).data('amount') ? word.charAt(0).toUpperCase() + word.slice(1) : word.toLowerCase()).join(' '));
});

$('.upperCaseAllButton').on('click', () => {
    if (targetEntry.val().length > 0) targetEntry.val(targetEntry.val().split(' ').map((word, index) => word = word.charAt(0).toUpperCase() + word.slice(1)).join(' '));
});

$('.lingvanex-convert').on('click', async function () {
    if (sourceEntry.val().length > 0) {
        sourceEntry.attr('readonly', true);
        $('.convert').addClass('disabled');

        try {
            const authKey = await Lingvanex.getAuthKey(Translators.LINGVANEX);

            if (authKey == undefined) {
                targetEntry.val('Không thể lấy được Khoá xác thực từ từ api-base.js.');
                return;
            }

            const translatedText = await Lingvanex.translateText(authKey, sourceEntry.val(), '', $(this).data('lang'));

            targetEntry.val(translatedText);
            $('.convert').removeClass('disabled');
            sourceEntry.removeAttr('readonly');
        } catch (error) {
            targetEntry.val('Bản dịch thất bại: ' + JSON.stringify(error));
            $('.convert').removeClass('disabled');
            sourceEntry.removeAttr('readonly');
        }
    }
});

$('.deepl-convert').on('click', async function () {
    if (sourceEntry.val().length > 0) {
        sourceEntry.attr('readonly', true);
        $('.convert').addClass('disabled');

        try {
            const deeplUsage = (await $.get('https://api-free.deepl.com/v2/usage?auth_key=' + DEEPL_AUTH_KEY)) ?? {
                'character_count': 500000,
                'character_limit': 500000
            };

            if (sourceEntry.val().length > (deeplUsage.character_limit - deeplUsage.character_count)) {
                targetEntry.val(`Đã đạt đến giới hạn dịch của tài khoản. (${deeplUsage.character_count}/${deeplUsage.character_limit} ký tự)`);
                return;
            }
            
            const translatedText = await DeepLTranslator.translateText(DEEPL_AUTH_KEY, sourceEntry.val(), '', $(this).data('lang'));

            targetEntry.val(translatedText);
            $('.convert').removeClass('disabled');
            sourceEntry.removeAttr('readonly');
        } catch (error) {
            targetEntry.val('Bản dịch thất bại: ' + JSON.stringify(error));
            $('.convert').removeClass('disabled');
            sourceEntry.removeAttr('readonly');
        }
    }
});

$('.google-convert').on('click', async function () {
    if (sourceEntry.val().length > 0) {
        sourceEntry.attr('readonly', true);
        $('.convert').addClass('disabled');

        try {
            const data = await GoogleTranslate.getData(Translators.GOOGLE_TRANSLATE, GOOGLE_API_KEY);

            if (data.version == undefined || data.ctkk == undefined) {
                targetEntry.val('Không thể lấy được Log ID hoặc Token từ element.js.');
                return;
            }

            const translatedText = await GoogleTranslate.translateText(data, sourceEntry.val(), 'auto', $(this).data('lang'));

            targetEntry.val(translatedText);
            $('.convert').removeClass('disabled');
            sourceEntry.removeAttr('readonly');
        } catch (error) {
            targetEntry.val('Bản dịch thất bại: ' + JSON.stringify(error));
            $('.convert').removeClass('disabled');
            sourceEntry.removeAttr('readonly');
        }
    }
});

$('.papago-convert').on('click', async function () {
    if (sourceEntry.val().length > 0) {
        sourceEntry.attr('readonly', true);
        $('.convert').addClass('disabled');

        try {
            const version = await Papago.getVersion(Translators.PAPAGO);

            if (version == undefined) {
                targetEntry.val('Không thể lấy được Thông tin phiên bản từ main.js.');
                return;
            }

            const translatedText = await Papago.translateText(version, sourceEntry.val(), 'auto', $(this).data('lang'));

            targetEntry.val(translatedText);
            $('.convert').removeClass('disabled');
            sourceEntry.removeAttr('readonly');
        } catch (error) {
            targetEntry.val('Bản dịch thất bại: ' + JSON.stringify(error));
            $('.convert').removeClass('disabled');
            sourceEntry.removeAttr('readonly');
        }
    }
});

$('.microsoft-convert').on('click', async function () {
    if (sourceEntry.val().length > 0) {
        sourceEntry.attr('readonly', true);
        $('.convert').addClass('disabled');

        try {
            const accessToken = await MicrosoftTranslator.getAccessToken(Translators.MICROSOFT_TRANSLATOR);

            if (accessToken == undefined) {
                targetEntry.val('Không thể lấy được Access Token từ máy chủ.');
                return;
            }

            const translatedText = await MicrosoftTranslator.translateText(accessToken, sourceEntry.val(), '', $(this).data('lang'));

            targetEntry.val(translatedText);
            $('.convert').removeClass('disabled');
            sourceEntry.removeAttr('readonly');
        } catch (error) {
            targetEntry.val('Bản dịch thất bại: ' + JSON.stringify(error));
            $('.convert').removeClass('disabled');
            sourceEntry.removeAttr('readonly');
        }
    }
});

$('#glossaryList').change(function () {
    if (glossary.hasOwnProperty(this.value)) {
        sourceEntry.val(this.value).trigger('input');
    } else {
        sourceEntry.val('');
        targetEntry.val('');
    }
});

$('#removeButton').on('click', () => {
    if (window.confirm('Bạn có muốn xoá từ (cụm từ) này chứ?')
        && glossary.hasOwnProperty(sourceEntry.val())) {
        delete glossary[sourceEntry.val()];
        loadGlossary();
        $('#sinoVietnameseConvertButton').click();
        inputGlossary.val(null);
    }
});

$('#preview').on('click', function () {
    if (Object.entries(glossary).length > 0) {
        this.select();
    }
});

$('#glossaryName').on('input', () => loadGlossary());

function getSelectedTextOrActiveElementText() {
    return window.getSelection().toString() || ((document.activeElement.tagName == 'TEXTAREA' || (document.activeElement.tagName == 'INPUT' && /^(?:email|month|number|search|tel|text|url|week)$/i.test(document.activeElement.type))) && typeof document.activeElement.selectionStart == 'number' && document.activeElement.value.slice(document.activeElement.selectionStart, document.activeElement.selectionEnd)) || '';
}

function loadGlossary() {
    let glossaryArray = Object.entries(glossary);

    const glossaryList = document.createElement('select');
    const defaultOption = document.createElement('option');
    defaultOption.innerText = 'Chọn...';
    defaultOption.value = '';
    defaultOption.selected = true;
    glossaryList.appendChild(defaultOption);

    const currentType = glossaryType.val();
    let data = '';

    $('#fileExtension').text(currentType === GlossaryType.TSV ? 'tsv' : (currentType === GlossaryType.CSV ? 'csv' : 'txt'));

    if (glossaryArray.length > 0) {
        glossary = Object.fromEntries(glossaryArray.sort((a, b) => b[0].length - a[0].length || a[1].localeCompare(b[1]) || a[0].localeCompare(b[0])));
        glossaryArray = Object.entries(glossary);

        for (let i = 0; i < glossaryArray.length; i++) {
            const option = document.createElement('option');
            option.innerText = `${glossaryArray[i][0]}\t${glossaryArray[i][1]}`;
            option.value = glossaryArray[i][0];
            glossaryList.appendChild(option);
        }

        switch (currentType) {
            case GlossaryType.TSV:
                data = glossaryArray.map((element) => (element.length > 2 ? element.splice(2, glossary.length - 2) : element).join('\t')).join('\n');
                break;

            case GlossaryType.CSV:
                data = $.csv.fromArrays(glossaryArray);
                break;

            case GlossaryType.VIETPHRASE:
                data = glossaryArray.map((element) => (element.length > 2 ? element.splice(2, glossary.length - 2) : element).join('=')).join('\n');
                break;
        }

        $('#downloadButton').attr('href', URL.createObjectURL(new Blob([data], {type: currentType + ';charset=UTF-8'})));
        $('#downloadButton').attr('download', ($('#glossaryName').val().length > 0 ? $('#glossaryName').val() : 'Từ vựng') + '.' + $('#fileExtension').text());
    } else {
        $('#downloadButton').removeAttr('href');
        $('#downloadButton').removeAttr('download');
        $('#glossaryName').val(null);
    }

    $('#glossaryList').html(glossaryList.innerHTML);
    $('#glossaryCounter').text(glossaryArray.length);
    $('#preview').val(data);

    localStorage.setItem('glossary', JSON.stringify({type: currentType, data: glossary}));
    localGlossary = JSON.parse(localStorage.getItem('glossary'));
}

const GlossaryType = {
    TSV: 'text/tab-separated-values',
    CSV: 'text/csv',
    VIETPHRASE: 'text/plain',
};