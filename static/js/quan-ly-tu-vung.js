'use strict';

let localGlossary = JSON.parse(localStorage.getItem('glossary'));

let glossary = {};

$('#glossaryManagerButton').on('mousedown', () => {
    $('#glossaryList').val(-1).change();
    $('#sourceEntry').val(getSelectedTextOrActiveElementText()).trigger('input');
});

$('#inputGlossary').on('change', function () {
    const reader = new FileReader();

    reader.onload = function () {
        switch ($('#inputGlossary').prop('files')[0].type) {
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

        $('#glossaryName').val($('#inputGlossary').prop('files')[0].name.split('.').slice(0, $('#inputGlossary').prop('files')[0].name.split('.').length - 1).join('.'));
        $('#glossaryType').val($('#inputGlossary').prop('files')[0].type || 'text/tab-separated-values').change();
    };
    reader.readAsText($(this).prop('files')[0]);
});

$('#clearGlossaryButton').on('click', function () {
    if (window.confirm('Bạn có muốn xoá tập từ vựng này chứ?')) {
        glossary = {};
        loadGlossary();
        $('#inputGlossary').val(null);
    }
});

$('#glossaryType').change(() => loadGlossary());

$('#sourceEntry').on('input', function () {
    if ($(this).val().length > 0) {
        $('#targetEntry').val(convertText($(this).val(), sinovietnameses, false, true, VietPhraseTranslationAlgorithms.LEFT_TO_RIGHT_TRANSLATION));

        if (glossary.hasOwnProperty($(this).val())) {
            $('#glossaryList').val($(this).val());
        } else {
            $('#glossaryList').val(null);
        }
    } else {
        $('#glossaryList').val(null).change();
    }
});

$('.dropdown-toggle').on('click', () => {
    $('.dropdown-scroller').scrollTop(0);
});

$('#sourceEntryMenu').on('mousedown', (event) => event.preventDefault());

$('#clearSourceTextButton').on('click', () => $('#sourceEntry').val(null).trigger('input'));

$('#copySourceTextButton').on('click', () => {
    if ($('#sourceEntry').val().length > 0) {
        navigator.clipboard.writeText($('#sourceEntry').val())
    }
});

$('#pasteSourceTextButton').on('click', () => {
    navigator.clipboard
        .readText()
        .then((clipText) => {
            $('#sourceEntry').val(clipText).trigger('input');
        });
});

$('#pinyinConvertButton').on('click', function () {
    if ($('#sourceEntry').val().length > 0) {
        $('#targetEntry').val(convertText($('#sourceEntry').val(), pinyins, false, false, VietPhraseTranslationAlgorithms.LEFT_TO_RIGHT_TRANSLATION));
    }
});

$('#sinoVietnameseConvertButton').click(function () {
    if ($('#sourceEntry').val().length > 0) {
        $('#targetEntry').val(convertText($('#sourceEntry').val(), sinovietnameses, false, false, VietPhraseTranslationAlgorithms.LEFT_TO_RIGHT_TRANSLATION));
    }
});

$('#lacvietdictionaryButton').on('click', function () {
    if ($('#sourceEntry').val().length > 0) {
        window.open(`http://mobile.coviet.vn/tratu.aspx?k=${encodeURIComponent(($('#sourceEntry').val().substring($('#sourceEntry').prop('selectionStart'), $('#sourceEntry').prop('selectionEnd')) || $('#sourceEntry').val()).substring(0, 30))}&t=ALL`);
    }
});

$('#googleButton').on('click', function () {
    if ($('#sourceEntry').val().length > 0) {
        window.open(`https://www.google.com.vn/search?q=${encodeURIComponent(
            ($('#sourceEntry').val().substring($('#sourceEntry').prop('selectionStart'), $('#sourceEntry').prop('selectionEnd')) || $('#sourceEntry').val()).substring(0, 30))}`);
    }
});
$('#hvdicButton').on('click', function () {
    if ($('#sourceEntry').val().length > 0) {
        window.open(`https://hvdic.thivien.net/whv/${encodeURIComponent(($('#sourceEntry').val().substring($('#sourceEntry').prop('selectionStart'), $('#sourceEntry').prop('selectionEnd')) || $('#sourceEntry').val()).substring(0, 30))}`);
    }
});

$('#nomfoundationButton').on('click', function () {
    if ($('#sourceEntry').val().length > 0) {
        window.open(`http://www.nomfoundation.org/nom-tools/Nom-Lookup-Tool/Nom-Lookup-Tool?uiLang=en&inputText=${encodeURIComponent(($('#sourceEntry').val().substring($('#sourceEntry').prop('selectionStart'), $('#sourceEntry').prop('selectionEnd')) || $('#sourceEntry').val()).substring(0, 30))}`);
    }
});

$('#wikipediaButton').on('click', function () {
    if ($('#sourceEntry').val().length > 0) {
        window.open(`https://vi.wikipedia.org/w/?search=${encodeURIComponent(($('#sourceEntry').val().substring($('#sourceEntry').prop('selectionStart'), $('#sourceEntry').prop('selectionEnd')) || $('#sourceEntry').val()).substring(0, 30))}&ns0=1`);
    }
});

$('#baiduButton').on('click', function () {
    if ($('#sourceEntry').val().length > 0) {
        window.open(`https://www.baidu.com/s?wd=${encodeURIComponent(($('#sourceEntry').val().substring($('#sourceEntry').prop('selectionStart'), $('#sourceEntry').prop('selectionEnd')) || $('#sourceEntry').val()).substring(0, 30))}`);
    }
});

$('#deepltranslatorButton').on('click', function () {
    if ($('#sourceEntry').val().length > 0) {
        window.open(`https://www.deepl.com/translator#auto/en/${encodeURIComponent($('#sourceEntry').val())}`);
    }
});

$('#googletranslateButton').on('click', function () {
    if ($('#sourceEntry').val().length > 0) {
        window.open(`https://translate.google.com/?sl=auto&tl=vi&text=${encodeURIComponent($('#sourceEntry').val())}&op=translate`);
    }
});

$('#papagoButton').on('click', function () {
    if ($('#sourceEntry').val().length > 0) {
        window.open(`https://papago.naver.com/?sk=auto&tk=vi&st=${encodeURIComponent($('#sourceEntry').val())}`);
    }
});

$('#bingtranslatorButton').on('click', function () {
    if ($('#sourceEntry').val().length > 0) {
        window.open(`https://www.bing.com/translator?from=auto-detect&to=vi&text=${encodeURIComponent($('#sourceEntry').val())}`);
    }
});

$('#addButton').on('click', function () {
    if ($('#sourceEntry').val().length > 0) {
        glossary[$('#sourceEntry').val().trim()] = $('#targetEntry').val().trim();
        loadGlossary();
        $('#sourceEntry').val(null);
        $('#targetEntry').val(null);
    }
});

$('#copyTargetTextButton').on('click', () => {
    if ($('#targetEntry').val().length > 0) navigator.clipboard.writeText($('#targetEntry').val())
});

$('#pasteTargetTextButton').on('click', () => {
    navigator.clipboard.readText().then((clipText) => $('#targetEntry').val(clipText).trigger('input'));
});

$('.upperCaseFromAmountButton').on('click', function () {
    if ($('#targetEntry').val().length > 0) $('#targetEntry').val($('#targetEntry').val().split(' ').map((word, index) => (index < $(this).data('amount') && word.charAt(0).toUpperCase() + word.slice(1)) || word.toLowerCase()).join(' '));
});

$('.upperCaseAllButton').on('click', function () {
    if ($('#targetEntry').val().length > 0) $('#targetEntry').val($('#targetEntry').val().split(' ').map((word, index) => word = word.charAt(0).toUpperCase() + word.slice(1)).join(' '));
});

$('.deepl-convert').on('click', async function () {
    if ($('#sourceEntry').val().length > 0) {
        $('#sourceEntry').attr('readonly', true);
        $('.convert').addClass('disabled');

        try {
            const deeplUsage = (await $.get('https://api-free.deepl.com/v2/usage?auth_key=' + DEEPL_AUTH_KEY)) ?? {
                'character_count': 500000,
                'character_limit': 500000
            };

            if ($('#sourceEntry').val().length > (deeplUsage.character_limit - deeplUsage.character_count)) {
                $('#targetEntry').val(`Đã đạt đến giới hạn dịch của tài khoản. (${deeplUsage.character_count}/${deeplUsage.character_limit} ký tự)`);
                return;
            }

            const translatedText = await DeepLTranslator.translateText(DEEPL_AUTH_KEY, $('#sourceEntry').val(), '', $(this).data('lang'));

            $('#targetEntry').val(translatedText);
            $('.convert').removeClass('disabled');
            $('#sourceEntry').removeAttr('readonly');
        } catch (error) {
            $('#targetEntry').val('Bản dịch thất bại: ' + JSON.stringify(error));
            $('.convert').removeClass('disabled');
            $('#sourceEntry').removeAttr('readonly');
        }
    }
});

$('.google-convert').on('click', async function () {
    if ($('#sourceEntry').val().length > 0) {
        $('#sourceEntry').attr('readonly', true);
        $('.convert').addClass('disabled');

        try {
            const data = await getGoogleTranslateData(Translators.GOOGLE_TRANSLATE);

            if (data.logId == undefined || data.ctkk == undefined) {
                $('#targetEntry').val('Không thể lấy được Log ID hoặc Token từ element.js.');
                return;
            }

            const translatedText = await GoogleTranslate.translateText(data, $('#sourceEntry').val(), 'auto', $(this).data('lang'));

            $('#targetEntry').val(translatedText);
            $('.convert').removeClass('disabled');
            $('#sourceEntry').removeAttr('readonly');
        } catch (error) {
            $('#targetEntry').val('Bản dịch thất bại: ' + JSON.stringify(error));
            $('.convert').removeClass('disabled');
            $('#sourceEntry').removeAttr('readonly');
        }
    }
});

$('.papago-convert').on('click', async function () {
    if ($('#sourceEntry').val().length > 0) {
        $('#sourceEntry').attr('readonly', true);
        $('.convert').addClass('disabled');

        try {
            const version = await getPapagoVersion(Translators.PAPAGO);

            if (version == undefined) {
                $('#targetEntry').val('Không thể lấy được Thông tin phiên bản từ main.js.');
                return;
            }

            const translatedText = await Papago.translateText(version, $('#sourceEntry').val(), 'auto', $(this).data('lang'));

            $('#targetEntry').val(translatedText);
            $('.convert').removeClass('disabled');
            $('#sourceEntry').removeAttr('readonly');
        } catch (error) {
            $('#targetEntry').val('Bản dịch thất bại: ' + JSON.stringify(error));
            $('.convert').removeClass('disabled');
            $('#sourceEntry').removeAttr('readonly');
        }
    }
});

$('.microsoft-convert').on('click', async function () {
    if ($('#sourceEntry').val().length > 0) {
        $('#sourceEntry').attr('readonly', true);
        $('.convert').addClass('disabled');

        try {
            const accessToken = await getMicrosoftTranslatorAccessToken(Translators.MICROSOFT_TRANSLATOR);

            if (accessToken == undefined) {
                $('#targetEntry').val('Không thể lấy được Access Token từ máy chủ.');
                return;
            }

            const translatedText = await MicrosoftTranslator.translateText(accessToken, $('#sourceEntry').val(), '', $(this).data('lang'));

            $('#targetEntry').val(translatedText);
            $('.convert').removeClass('disabled');
            $('#sourceEntry').removeAttr('readonly');
        } catch (error) {
            $('#targetEntry').val('Bản dịch thất bại: ' + JSON.stringify(error));
            $('.convert').removeClass('disabled');
            $('#sourceEntry').removeAttr('readonly');
        }
    }
});

$('#glossaryList').change(function () {
    if (glossary.hasOwnProperty(this.value)) {
        $('#sourceEntry').val(this.value).trigger('input');
    } else {
        $('#sourceEntry').val('');
        $('#targetEntry').val('');
    }
});

$('#removeButton').on('click', function () {
    if (window.confirm('Bạn có muốn xoá từ (cụm từ) này chứ?')
        && glossary.hasOwnProperty($('#sourceEntry').val())) {
        delete glossary[$('#sourceEntry').val()];
        loadGlossary();
        $('#sinoVietnameseConvertButton').click();
        $('#inputGlossary').val(null);
    }
});

$('#preview').on('click', function () {
    if (Object.entries(glossary).length > 0) {
        this.select();
    }
});

$('#glossaryName').on('input', () => loadGlossary());

function getSelectedTextOrActiveElementText() {
    return window.getSelection().toString() || (document.activeElement.tagName.toLowerCase() == 'textarea' || (document.activeElement.tagName.toLowerCase() == 'input' && /^(?:text|search|password|tel|url)$/i.test(document.activeElement.type) && typeof document.activeElement.selectionStart == 'number') && document.activeElement.value.slice(document.activeElement.selectionStart, document.activeElement.selectionEnd)) || '';
}

function loadGlossary() {
    let glossaryArray = Object.entries(glossary);

    const glossaryList = document.createElement('select');
    const defaultOption = document.createElement('option');
    defaultOption.innerText = 'Chọn...';
    defaultOption.value = '';
    defaultOption.selected = true;
    glossaryList.appendChild(defaultOption);

    const glossaryType = $('#glossaryType').val();
    let data = '';

    $('#fileExtension').text(glossaryType === GlossaryType.TSV ? 'tsv' : (glossaryType === GlossaryType.CSV ? 'csv' : 'txt'));

    if (glossaryArray.length > 0) {
        glossary = Object.fromEntries(glossaryArray.sort((a, b) => b[0].length - a[0].length || a[1].localeCompare(b[1]) || a[0].localeCompare(b[0])));
        glossaryArray = Object.entries(glossary);

        for (let i = 0; i < glossaryArray.length; i++) {
            const option = document.createElement('option');
            option.innerText = `${glossaryArray[i][0]}\t${glossaryArray[i][1]}`;
            option.value = glossaryArray[i][0];
            glossaryList.appendChild(option);
        }

        switch (glossaryType) {
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

        $('#downloadButton').attr('href', URL.createObjectURL(new Blob([data], {type: glossaryType + ';charset=UTF-8'})));
        $('#downloadButton').attr('download', ($('#glossaryName').val().length > 0 ? $('#glossaryName').val() : 'Từ vựng') + '.' + $('#fileExtension').text());
    } else {
        $('#downloadButton').removeAttr('href');
        $('#downloadButton').removeAttr('download');
        $('#glossaryName').val(null);
    }

    $('#glossaryList').html(glossaryList.innerHTML);
    $('#glossaryCounter').text(glossaryArray.length);
    $('#preview').val(data);

    localStorage.setItem('glossary', JSON.stringify({type: glossaryType, data: glossary}));
    localGlossary = JSON.parse(localStorage.getItem('glossary'));
}

const GlossaryType = {
    TSV: 'text/tab-separated-values',
    CSV: 'text/csv',
    VIETPHRASE: 'text/plain',
};