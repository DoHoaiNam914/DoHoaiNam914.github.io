'use strict';

var pinyins = new Map();
var sinoVietnameses = new Map();
const markMap = new Map([
  ['　', ' '],
  ['，', ', '],
  ['、', ', '],
  ['；', '; '],
  ['：', ': '],
  ['！', '! '],
  ['？', '\? '],
  ['．', '.'],
  ['。', '. '],
  ['·', '•'],
  ['＇', ' \' '],
  ['＂', ' " '],
  ['（', ' \('],
  ['）', '\) '],
  ['［', ' \['],
  ['］', '\] '],
  ['｛', ' {'],
  ['｝', '} '],
  ['〈', ' <'],
  ['〉', '> '],
  ['《', ' «'],
  ['》', '» '],
  ['「', ' "'],
  ['」', '" '],
  ['『', ' ‘'],
  ['』', '’ '],
  ['【', ' \['],
  ['】', '\] '],
  ['＊', ' * '],
  ['／', '/'],
  ['＆', ' & '],
  ['＃', ' # '],
  ['％', ' % '],
  ['＋', ' + '],
  ['～', ' ~ ']
]);

const DEEPL_AUTH_KEY = 'aa09f88d-ab75-3488-b8a3-18ad27a35870:fx';

var translation = '';

$(document).ready(() => {
  $.get("/datasource/Bính âm.txt").done((data) => {
    pinyins = new Map(data.split(/\r?\n/).map((character) => character.split('=')).filter((character) => character.length >= 2));
    console.log('Đã tải xong bộ dữ liệu bính âm!');
  }).fail((jqXHR, textStatus, errorThrown) => {
    window.location.reload()
  });
  $.get("/datasource/Hán việt.txt").done((data) => {
    sinoVietnameses = new Map(data.split(/\r?\n/).map((character) => character.split('=')).filter((character) => character.length >= 2));
    console.log('Đã tải xong bộ dữ liệu hán việt!');
  }).fail((jqXHR, textStatus, errorThrown) => {
    window.location.reload()
  });
});

$("#translateButton").click(async function () {
  if ($(this).text() == 'Dịch') {
    if ($("#queryText").val().length > 0) {
      onPreTranslate();
      await translate();
      onPostTranslate();
    }
  } else if ($(this).text() == 'Sửa') {
    $("#translatedText").hide();
    $("#queryText").show(); 
    $("#clearImageButton").removeClass("disabled");
    $("#pasteUrlButton").removeClass("disabled");
    $("#imageFile").removeClass("disabled");
    $("#reTranslateButton").addClass("disabled");
    translation = '';
    $(this).text("Dịch");
  }
});

$("#copyButton").on("click", () => {
  navigator.clipboard.writeText($("#translateButton").text() == 'Sửa' ? translation : $("#queryText").val());
});

$("#pasteButton").on("click", () => {
  navigator.clipboard
    .readText()
    .then((clipText) => {
      if (clipText.length > 0) {
        $("#queryText").val(clipText).change();
        if ($("#translateButton").text() == 'Sửa') {
          translation = '';
          $("#translateButton").text("Dịch");
          $("#translateButton").click();
          $(document.body).scrollTop(0);
          $(document.documentElement).scrollTop(0);
        }
      }
    });
});

$("#reTranslateButton").on("click", () => {
  translation = '';
  $("#translateButton").text("Dịch");
  $("#translateButton").click();
});

$(".textarea").on("input", onInput);

$("#queryText").change(() => {
  onInput();
  $("#queryTextCounter").text($("#queryText").val().length);
});

$(".option").change(() => {
  if ($("#translateButton").text() == 'Sửa') {
    translation = '';
    $("#translateButton").text("Dịch");
    $("#translateButton").click();
  }

  localStorage.setItem("translator", JSON.stringify({translator: $(".translator.active").data("id"), showOriginal: $("#flexSwitchCheckShowOriginal").prop("checked"), glossary: $("#flexSwitchCheckGlossary").prop("checked"), source: $("#sourceLangSelect").val(), target: $("#targetLangSelect").val()}));
});

$(".translator").click(function () {
  if (!$(this).hasClass("disabled")) {
    const prevTranslator = $(this).data("id");
    $(".translator").removeClass("active");
    $(this).addClass("active");

    localStorage.setItem("translator", JSON.stringify({translator: $(".translator.active").data("id"), showOriginal: $("#flexSwitchCheckShowOriginal").prop("checked"), glossary: $("#flexSwitchCheckGlossary").prop("checked"), source: $("#sourceLangSelect").val(), target: $("#targetLangSelect").val()}));

    const prevSourceLanguage = (prevTranslator === Translators.DEEPL_TRANSLATOR ? DeepLSourceLanguage[$("#sourceLangSelect").val()] : (prevTranslator === Translators.MICROSOFT_TRANSLATOR ? MicrosoftLanguage[$("#sourceLangSelect").val()] : GoogleLanguage[$("#sourceLangSelect").val()])) ?? '';
    const prevTargetLanguage = (prevTranslator === Translators.DEEPL_TRANSLATOR ? DeepLTargetLanguage[$("#targetLangSelect").val()] : (prevTranslator === Translators.MICROSOFT_TRANSLATOR ? MicrosoftLanguage[$("#targetLangSelect").val()] : GoogleLanguage[$("#targetLangSelect").val()])) ?? '';
    var sourceLanguage = '';
    var targetLanguage = '';

    const autoDetectOption = document.createElement('option');

    $("#targetLangSelect").html(null);

    switch ($(this).data("id")) {
      case Translators.DEEPL_TRANSLATOR:
        autoDetectOption.innerText = 'Detect language';
        autoDetectOption.value = '';

        $("#sourceLangSelect").html(autoDetectOption);

        for (const langCode in DeepLSourceLanguage) {
          const option = document.createElement('option');
          option.innerText = DeepLSourceLanguage[langCode];
          option.value = langCode;

          $("#sourceLangSelect").append(option);

          if (sourceLanguage == '' && option.innerText.replace(/[()]/g, '').includes(prevSourceLanguage.replace(/[()]/g, '').split(' ')[0])) {
            sourceLanguage = langCode;
          }
        }

        $("#sourceLangSelect").val(sourceLanguage || autoDetectOption.value).change();

        for (const langCode in DeepLTargetLanguage) {
          const option = document.createElement('option');
          option.innerText = DeepLTargetLanguage[langCode];
          option.value = langCode;

          if (option.value == 'EN' || option.value == 'PT') {
            option.disabled = true;
          }

          $("#targetLangSelect").append(option);

          if (targetLanguage == '' && option.innerText.replace(/[()]/g, '').includes(prevTargetLanguage.replace(/[()]/g, '').split(' ')[0])) {
            targetLanguage = langCode;
          }
        }

        $("#targetLangSelect").val(targetLanguage || 'EN-US').change();

        break;

      case Translators.GOOGLE_TRANSLATE:
        autoDetectOption.innerText = 'Phát hiện ngôn ngữ';
        autoDetectOption.value = 'auto';

        $("#sourceLangSelect").html(autoDetectOption);

        for (const langCode in GoogleLanguage) {
          const sourceOption = document.createElement('option');
          sourceOption.innerText = GoogleLanguage[langCode];
          sourceOption.value = langCode;

          $("#sourceLangSelect").append(sourceOption).change();

          if (sourceLanguage == '' && sourceOption.innerText.replace(/[()]/g, '').includes(prevSourceLanguage.replace(/[()]/g, '').split(' ')[0])) {
            sourceLanguage = langCode;
          }

          const targetOption = document.createElement('option');
          targetOption.innerText = GoogleLanguage[langCode];
          targetOption.value = langCode;

          $("#targetLangSelect").append(targetOption).change();

          if (targetLanguage == '' && targetOption.innerText.replace(/[()]/g, '').includes(prevTargetLanguage.replace(/[()]/g, '').split(' ')[0])) {
            targetLanguage = langCode;
          }
        }

        $("#sourceLangSelect").val(sourceLanguage || autoDetectOption.value);
        $("#targetLangSelect").val(targetLanguage || 'vi').change();

        break;

      case Translators.MICROSOFT_TRANSLATOR:
        autoDetectOption.innerText = 'Tự phát hiện';
        autoDetectOption.value = '';

        $("#sourceLangSelect").html(autoDetectOption);

        for (const langCode in MicrosoftLanguage) {
          const sourceOption = document.createElement('option');
          sourceOption.innerText = MicrosoftLanguage[langCode];
          sourceOption.value = langCode;

          $("#sourceLangSelect").append(sourceOption);

          if (sourceLanguage == '' && sourceOption.innerText.replace(/[()]/g, '').includes(prevSourceLanguage.replace(/[()]/g, '').split(' ')[0])) {
            sourceLanguage = langCode;
          }

          const targetOption = document.createElement('option');
          targetOption.innerText = MicrosoftLanguage[langCode];
          targetOption.value = langCode;

          $("#targetLangSelect").append(targetOption).change();

          if (targetLanguage == '' && targetOption.innerText.replace(/[()]/g, '').includes(prevTargetLanguage.replace(/[()]/g, '').split(' ')[0])) {
            targetLanguage = langCode;
          }
        }

        $("#sourceLangSelect").val(sourceLanguage || autoDetectOption.value);
        $("#targetLangSelect").val(targetLanguage || 'vi');

        break;
    }
  }

  if ($("#translateButton").text() == 'Sửa') {
    translation = '';
    $("#translateButton").text("Dịch");
    $("#translateButton").click();
  }
});

async function translate() {
  const translator = $(".translator.active").data("id");

  const inputText = $("#queryText").val();
  const sourceLanguage = $("#sourceLangSelect").val();
  const targetLanguage = $("#targetLangSelect").val();

  const textLines = inputText.split(/\n/);
  var result = '';
  const results = [];

  try {
    if ($("#targetLangSelect").val() == 'pinyin' || $("#targetLangSelect").val() == 'sinovietnamese') {
      translation = getConvertedChineseText(new Map([...$("#targetLangSelect").val() == 'pinyin' ? pinyins : sinoVietnameses].sort((a, b) => b[0].length - a[0].length)), inputText);
    } else {
      const MAX_LENGTH = translator === Translators.GOOGLE_TRANSLATE ? 1000 : 5000;

      if (inputText.split(/\n/).sort((a, b) => b.length - a.length)[0].length > MAX_LENGTH) {
        $("#translatedText").html(`<p>Bản dịch thất bại: Số lượng từ trong một dòng quá dài</p>`);
        onPostTranslate();
        return;
      }

      const elementJs = translator === Translators.GOOGLE_TRANSLATE ? await $.get("https://corsproxy.io/?https://translate.google.com/translate_a/element.js?hl=vi&client=wt") : null;

      const version = elementJs != undefined ? elementJs.match(/_exportVersion\('(TE_\d+)'\)/)[1] : null;
      const ctkk = elementJs != undefined ? elementJs.match(/c\._ctkk='(\d+\.\d+)'/)[1] : null;

      if (translator === Translators.GOOGLE_TRANSLATE && version == undefined && ctkk == undefined) {
        $("#translatedText").html('<p>Không thể lấy được Log ID hoặc Token từ máy chủ.</p>');
        return;
      }

      const accessToken = translator === Translators.MICROSOFT_TRANSLATOR ? await $.get("https://edge.microsoft.com/translate/auth") : null;

      if (translator === Translators.MICROSOFT_TRANSLATOR && accessToken == undefined) {
        $("#translatedText").html('<p>Không thể lấy được Access Token từ máy chủ.</p>');
        return;
      }

      const queryLines = [...textLines];
      let translateLines = [];

      let canTranlate = false;

      for (let i = 0; i < textLines.length; i++) {
        translateLines.push(queryLines.shift());

        if (translateLines.join('\n').length >= MAX_LENGTH || queryLines.length == 0) {
          if (translateLines.join('\n').length > MAX_LENGTH) {
            queryLines.splice(0, 0, translateLines.pop());
            i--;
          }

          canTranlate = true;
        }

        if (canTranlate) {
          const translateText = translateLines.join('\n');
          let translatedText;

          switch (translator) {
            case Translators.DEEPL_TRANSLATOR:
              translatedText = await DeepLTranslator.translateText(DEEPL_AUTH_KEY, translateText, sourceLanguage, targetLanguage);
              break;
            case Translators.GOOGLE_TRANSLATE:
            default:
              translatedText = await GoogleTranslate.translateText(translateText, version, ctkk, sourceLanguage, targetLanguage);
              break;
            case Translators.MICROSOFT_TRANSLATOR:
              translatedText = await MicrosoftTranslator.translateText(accessToken, translateText, sourceLanguage, targetLanguage);
              break;
          }

          results.push(translatedText);
          translateLines = [];
          canTranlate = false;
        }
      }
    }
  } catch (error) {
    $("#translatedText").html(`<p>Bản dịch thất bại: ${JSON.stringify(error)}</p>`);
    onPostTranslate();
  }

  translation = results.join('\n');

  if ($("#flexSwitchCheckShowOriginal").prop("checked")) {
    const resultLines = translation.split(/\n/);
    var lostLineFixedAmount = 0;
  
    for (let i = 0; i < textLines.length; i++) {
      if (textLines[i + lostLineFixedAmount].trim().length == 0 && resultLines[i].trim().length > 0) {
        lostLineFixedAmount++;
        i--;
        continue;
      }
  
      result += ('<p>' + (resultLines[i].trim() !== textLines[i + lostLineFixedAmount].trim() ? '<i>' + textLines[i + lostLineFixedAmount] + '</i><br>' + resultLines[i] : textLines[i + lostLineFixedAmount]) + '</p>').replace(/(<p>)(<\/p>)/g, '$1<br>$2');
    }
  } else {
    result = ('<p>' + translation.split(/\n/).join('</p><p>') + '</p>').replace(/(<p>)(<\/p>)/g, '$1<br>$2');
  }

  $("#translatedText").html(result);
}

function getConvertedChineseText(data, text) {
  const lines = text.split(/\n/);
  var result = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    var phrases = [];
    var tempWord = '';

    for (let j = 0; j < line.length; j++) {
      for (let k = [...data][0][0].length; k >= 1; k--) {
        if (data.has(line.substring(j, j + k))) {
          phrases.push(data.get(line.substring(j, j + k)));
          j += k - 1;
          break;
        } else if (k == 1) {
          if (tempWord.length > 0 && /\s/.test(line[j]) && !/\s/.test(tempWord)) {
            tempWord.split(' ').forEach((word) => phrases.push(word));
            tempWord = '';
          }

          tempWord += line[j];

          if (/\s/.test(tempWord)) {
            if (!/\s/.test(line[j + 1])) {
              phrases[phrases.length - 1] += tempWord.substring(0, tempWord.length - 1);
              tempWord = '';
            }

            break;
          }

          for (let l = [...data][0][0].length; l >= 1; l--) {
            if (tempWord.length > 0 && (data.has(line.substring(j + 1, j + 1 + l)) || j + 1 == line.length)) {
              tempWord.split(' ').forEach((word) => phrases.push(word));
              tempWord = '';
              break;
            }
          }

          break;
        }
      }

      continue;
    }

    result.push(phrases.join(' '));
  }

  [...markMap].forEach((mark) => result = result.map((line) => line.replace(new RegExp(` ?(${mark[0]}) ?`, 'g'), mark[1]).trim()));
  return result.join('\n');
}

function onInput() {
  $("main.container .textarea").css("height", "auto");

  const height = [
    $("#queryText").prop("scrollHeight"),
    $("#translatedText").prop("scrollHeight"),
  ].sort((a, b) => b - a)[0];

  if (height > 300) {
    $("main.container .textarea").css("height", height + "px");
  }
}

function onPreTranslate() {
  $("#translatedText").show();
  $("#queryText").hide();
  $("#translateButton").addClass("disabled");
  $("#reTranslateButton").addClass("disabled");
  $(".translator").addClass("disabled");
  $("select.option").attr("disabled", true);
  $("input.option").attr("disabled", true);
  $(".option:not([disabled])").addClass("disabled");
  $("#copyButton").addClass("disabled");
  $("#pasteButton").addClass("disabled");
  $("#imageFile").addClass("disabled");
  $("#pasteUrlButton").addClass("disabled");
  $("#clearImageButton").addClass("disabled");
  $("#translatedText").html(null);
}

function onPostTranslate() {
  onInput();
  $("#translateButton").removeClass("disabled");
  $(".option").removeAttr("disabled");
  $(".option").removeClass("disabled");
  $("#pasteButton").removeClass("disabled");
  $("#copyButton").removeClass("disabled");
  $(".translator").removeClass("disabled");
  $("#reTranslateButton").removeClass("disabled");
  $("#translateButton").text("Sửa");
}

const DeepLTranslator = {
  translateText: async function (authKey, inputText, sourceLanguage, targetLanguage) {
    try {
      const response = await $.ajax({
        url: "https://api-free.deepl.com/v2/translate?auth_key=" + authKey,
        data: `text=${getDynamicDictionaryTextForAnothers(inputText).split(/\n/).map((sentence) => encodeURIComponent(sentence)).join('&text=')}${sourceLanguage != '' ? '&source_lang=' + sourceLanguage : ''}&target_lang=${targetLanguage}&tag_handling=html`,
        method: "POST"
      });

      const translatedText = response.translations.map((line) => line.text.trim()).join('\n');
      return translatedText;
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
  'EN': 'English',
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
  'PT': 'Portuguese',
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
  translateText: async function (inputText, version, ctkk, sourceLanguage, targetLanguage) {
    try {
      /**
       * Method: GET 
       * URL: https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage}&tl=${targetLanguage}&hl=vi&dt=t&dt=bd&dj=1&q=${encodeURIComponent(inputText)}
       *
       * Method: GET 
       * URL: https://translate.googleapis.com/translate_a/t?anno=3&client=wt_lib&format=html&v=1.0&key&logId=v${version}&sl=${sourceLanguage}&tl=${targetLanguage}&tc=0${Bp(inputText, ctkk)}
       * Content-Type: application/x-www-form-urlencoded - send(encodeURIComponent(inputText))
       *
       * Method: POST 
       * URL: https://translate.googleapis.com/translate_a/t?anno=3&client=te&format=html&v=1.0&key&logId=v${version}&sl=${sourceLanguage}&tl=${targetLanguage}&tc=0${Bp(inputText, ctkk)}
       * send(encodeURIComponent(inputText))
       */
      const response = await $.ajax({
        url: `https://translate.googleapis.com/translate_a/t?anno=3&client=gtx&format=html&v=1.0&key&logId=v${version}&sl=${sourceLanguage}&tl=${targetLanguage}&tc=0&tk=${Bp(getDynamicDictionaryTextForAnothers(inputText), ctkk)}`,
        data: `q=${getDynamicDictionaryTextForAnothers(inputText).split(/\n/).map((sentence) => encodeURIComponent(sentence)).join('&q=')}`,
        method: "GET"
      });

      const paragraph = document.createElement('p');
      $(paragraph).html(response.map((line) => ((sourceLanguage == 'auto' ? line[0] : line).includes('<i>') ? (sourceLanguage == 'auto' ? line[0] : line).split('</i> <b>').filter((element) => element.includes('</b>')).map((element) => ('<b>' + element.replace(/<i>.+/, ''))).join(' ') : (sourceLanguage == 'auto' ? line[0] : line)).trim()).join('\n'));

      const translatedText = $(paragraph).text();
      return translatedText;
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      throw error;
    }
  }
};

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
  'zh': 'Chinese (Simplified)',
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
  'jv': 'Javanese',
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

function Ap(a, b) {
    for (var c = 0; c < b.length - 2; c += 3) {
        var d = b.charAt(c + 2);
        d = "a" <= d ? d.charCodeAt(0) - 87 : Number(d);
        d = "+" == b.charAt(c + 1) ? a >>> d : a << d;
        a = "+" == b.charAt(c) ? a + d & 4294967295 : a ^ d
    }
    return a
}

function Bp(a, b) {
    var c = b.split(".");
    b = Number(c[0]) || 0;
    for (var d = [], e = 0, f = 0; f < a.length; f++) {
        var h = a.charCodeAt(f);
        128 > h ? d[e++] = h : (2048 > h ? d[e++] = h >> 6 | 192 : (55296 == (h & 64512) && f + 1 < a.length && 56320 == (a.charCodeAt(f + 1) & 64512) ? (h = 65536 + ((h & 1023) << 10) + (a.charCodeAt(++f) & 1023), d[e++] = h >> 18 | 240, d[e++] = h >> 12 & 63 | 128) : d[e++] = h >> 12 | 224, d[e++] = h >> 6 & 63 | 128), d[e++] = h & 63 | 128)
    }
    a = b;
    for (e = 0; e < d.length; e++) a += d[e], a = Ap(a, "+-a^+6");
    a = Ap(a, "+-3^+b+-f");
    a ^= Number(c[1]) || 0;
    0 > a && (a = (a & 2147483647) + 2147483648);
    c = a % 1E6;
    return c.toString() +
        "." + (c ^ b)
}

const MicrosoftTranslator = {
  translateText: async function (accessToken, inputText, sourceLanguage, targetLanguage) {
    try {
      /**
       *const bingTranslatorHTML = await $.get("https://cors-anywhere.herokuapp.com/https://www.bing.com/translator");
       *const IG = bingTranslatorHTML.match(/IG:"([A-Z0-9]+)"/)[1];
       *const IID = bingTranslatorHTML.match(/data-iid="(translator.\d+)"/)[1];
       *const [, key, token] = bingTranslatorHTML.match(/var params_AbusePreventionHelper\s*=\s*\[([0-9]+),\s*"([^"]+)",[^\]]*\];/);
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
        url: `https://api.cognitive.microsofttranslator.com/translate?${sourceLanguage != '' ? 'from=' + sourceLanguage + '&' : ''}to=${targetLanguage}&api-version=3.0&textType=html&includeSentenceLength=true`,
        data: JSON.stringify(getDynamicDictionaryText(inputText).split(/\n/).map((sentence) => ({"Text": sentence}))),
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });

      const translatedText = response.map((element) => element.translations[0].text.trim()).join('\n');
      return translatedText;
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      throw error;
    }
  }
};

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

function getDynamicDictionaryText(text) {
  var newText = text;

  if ($("#flexSwitchCheckGlossary").prop("checked") && glossary != null) {
    const glossaryList = [...glossary].filter((phrase) => text.includes(phrase[0]));

    for (let i = 0; i < glossaryList.length; i++) {
      newText = newText.replace(new RegExp(glossaryList[i][0], 'g'), `<mstrans:dictionary translation="${glossaryList[i][1]}">GLOSSARY_INDEX_${i}</mstrans:dictionary>`);
    }

    for (let i = glossaryList.length - 1; i >= 0; i--) {
      newText = newText.replace(new RegExp(`GLOSSARY_INDEX_${i}`, 'g'), glossaryList[i][0]);
    }
  }

  return newText;
}

function getDynamicDictionaryTextForAnothers(text) {
  var newText = text;

  if ($("#flexSwitchCheckGlossary").prop("checked") && $("#flexSwitchCheckAllowAnothers").prop("checked") && glossary != null) {
    const glossaryList = [...glossary].filter((phrase) => text.includes(phrase[0]));

    for (let i = 0; i < glossaryList.length; i++) {
      newText = newText.replace(new RegExp(glossaryList[i][0], 'g'), glossaryList[i][1]);
    }
  }

  return newText;
}

const Translators = {
  DEEPL_TRANSLATOR: 'deeplTranslator',
  GOOGLE_TRANSLATE: 'googleTranslate',
  PAPAGO: 'papago',
  MICROSOFT_TRANSLATOR: 'microsoftTranslator',
  OPENAI_TRANSLATOR: 'openaiTranslator',
};