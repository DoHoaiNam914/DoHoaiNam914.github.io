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

var translation = '';

$(document).ready(() => {
  $.get({
    crossDomain: false,
    url: "/datasource/Bính âm.txt",
    processData: false
  }).done((data) => {
    pinyins = new Map(data.split(/\r?\n/).map((character) => character.split('=')).filter((character) => character.length >= 2));
    console.log('Đã tải xong bộ dữ liệu bính âm!');
  }).fail((jqXHR, textStatus, errorThrown) => {
    window.location.reload()
  });

  $.get({
    crossDomain: false,
    url: "/datasource/Hán việt.txt",
    processData: false
  }).done((data) => {
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

  localStorage.setItem("translator", JSON.stringify({ translator: $(".translator.active").data("id"), glossary: $("#flexSwitchCheckGlossary").prop("checked"), source: $("#sourceLangSelect").val(), target: $("#targetLangSelect").val() }));
});

$(".translator").click(function () {
  if (!$(this).hasClass("disabled")) {
    $(".translator").removeClass("active");
    $(this).addClass("active");

    switch ($(this).data("id")) {
      case Translators.DEEPL_TRANSLATOR:
        $(".select-lang").each(function () {
          if ($(this).val() == 'vi') {
            switch ($(this).attr("id")) {
              case 'sourceLangSelect':
                $(this).val("auto").change();
                break;

              case 'targetLangSelect':
                $(this).val("en").change();
                break;
            }
          }
        });

        $(".select-lang option[value=\"vi\"]").attr("disabled", true);
        break;

      default:
        $(".select-lang option[value=\"vi\"]").removeAttr("disabled");
        break;
    }
  }

  if ($("#translateButton").text() == 'Sửa') {
    translation = '';
    $("#translateButton").text("Dịch");
    $("#translateButton").click();
  }

  localStorage.setItem("translator", JSON.stringify({ translator: $(".translator.active").data("id"), glossary: $("#flexSwitchCheckGlossary").prop("checked"), source: $("#sourceLangSelect").val(), target: $("#targetLangSelect").val() }));
});

async function translate() {
  const translator = $(".translator.active").data("id");

  const inputText = $("#queryText").val();
  const sourceLanguage = getLanguageCode(translator === Translators.DEEPL_TRANSLATOR ? translator.concat('Source') : translator, $("#sourceLangSelect").val());
  const targetLanguage = getLanguageCode(translator === Translators.DEEPL_TRANSLATOR ? translator.concat('Target') : translator, $("#targetLangSelect").val());

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

      let canTranlate = false;

      const queryLines = [...textLines];
      let translateLines = [];

      let tc = 1;
      const accessToken = await fetch('https://edge.microsoft.com/translate/auth')
          .then((response) => response.text());

      if (translator === Translators.MICROSOFT_TRANSLATOR && accessToken == undefined) {
        $("#translatedText").html('<p>Không thể lấy được Access Token từ máy chủ.</p>');
        return;
      }

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
          let translatedText;

          switch (translator) {
            case Translators.DEEPL_TRANSLATOR:
              translatedText = await DeepLTranslator.translateText(translateLines.join('\n'), sourceLanguage, targetLanguage);
              break;
            case Translators.MICROSOFT_TRANSLATOR:
              translatedText = await MicrosoftTranslator.translateText(accessToken, translateLines.join('\n'), sourceLanguage, targetLanguage);
              break;
            case Translators.GOOGLE_TRANSLATE:
            default:
              translatedText = await GoogleTranslate.translateText(translateLines.join('\n'), tc, sourceLanguage, targetLanguage);
              tc++;
              break;
          }

          results.push(translatedText);
          translateLines = [];
          canTranlate = false;
        }
      }
    }
  } catch (error) {
    $("#translatedText").html(`<p>Bản dịch thất bại: ${error}</p>`);
    onPostTranslate();
  }

  translation = results.join('\n');
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

function getLanguageCode(translator, languageCode) {
  var newLanguageCode = languageCode;

  switch (translator) {
    case Translators.DEEPL_TRANSLATOR.concat('Source'):
      newLanguageCode = languageCode.split('-')[0].toUpperCase();
      break;
    case Translators.DEEPL_TRANSLATOR.concat('Target'):
      newLanguageCode = languageCode.replace(/(zh)-[A-Z]{2, 2}/, '$1').toUpperCase();
      break;
    case Translators.MICROSOFT_TRANSLATOR:
      newLanguageCode = languageCode.replace('auto', '').replace('-CN', '-CHS').replace('-TW', '-CHT');
      break;
  }

  return newLanguageCode;
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
  translateText: async function (inputText, sourceLanguage = 'AUTO', targetLanguage) {
    try {
      const response = await $.ajax({
        url: 'https://api-free.deepl.com/v2/translate',
        method: 'POST',
        data: `auth_key=0c9649a5-e8f6-632a-9c42-a9eee160c330:fx&text=${inputText.split(/\n/).map((sentence) => encodeURIComponent(sentence)).join('&text=')}${sourceLanguage != 'AUTO' ? '&source_lang=' + sourceLanguage : ''}&target_lang=${targetLanguage}`
      });

      const translatedText = response.translations.map((element) => element.text.trim()).join('\n');
      return translatedText;
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      throw error;
    }
  }
};

const GoogleTranslate = {
  translateText: async function (inputText, tc = 1, sourceLanguage = 'auto', targetLanguage) {
    try {
      /**
       * Method: GET 
       * URL: https://translate.googleapis.com/translate_a/t?anno=3&client=wt_lib&format=html&v=1.0&key&logId=vTE_20230604&sl=${sourceLanguage}&tl=${targetLanguage}&tc=1&sr=1&tk=419495.97493&mode=1
       * Content-Type: application/x-www-form-urlencoded - send(inputText)
       *
       * Method: POST 
       * URL: https://translate.googleapis.com/translate_a/t?anno=3&client=te&format=html&v=1.0&key&logId=vTE_20230604&sl=${sourceLanguage}&tl=${targetLanguage}&tc=1&ctt=1&dom=1&sr=1&tk=895688.700602&mode=1
       * Content-Type: application/x-www-form-urlencoded - send(inputText)
       *
       * Method: GET 
       * URL: https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage}&tl=${targetLanguage}&hl=vi&dt=t&dt=bd&dj=1${inputText}
       */
      const response = await $.ajax({
        url: `https://translate.googleapis.com/translate_a/t?anno=3&client=gtx&format=text&v=1.0&key&logId=vTE_20230604&sl=${sourceLanguage}&tl=${targetLanguage}&tc=${tc}&sr=1${zr(inputText)}&mode=1`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: 'q=' + inputText.split(/\n/).map((sentence) => encodeURIComponent(sentence)).join('&q=')
      });

      const translatedText = sourceLanguage == 'auto' ? response.map((element) => element[0].trim()).join('\n') : response.map((element) => element.trim()).join('\n');
      return translatedText;
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      throw error;
    }
  }
};

var wr = function (a) {
    return function () {
      return a;
    };
  },
  xr = function (a, b) {
    for (var c = 0; c < b.length - 2; c += 3) {
      var d = b.charAt(c + 2),
        d = "a" <= d ? d.charCodeAt(0) - 87 : Number(d),
        d = "+" == b.charAt(c + 1) ? a >>> d : a << d;
      a = "+" == b.charAt(c) ? (a + d) & 4294967295 : a ^ d;
    }
    return a;
  },
  yr = null,
  zr = function (a) {
    var b;
    if (null !== yr) b = yr;
    else {
      b = wr(String.fromCharCode(84));
      var c = wr(String.fromCharCode(75));
      b = [b(), b()];
      b[1] = c();
      b = (yr = window[b.join(c())] || "") || "";
    }
    var d = wr(String.fromCharCode(116)),
      c = wr(String.fromCharCode(107)),
      d = [d(), d()];
    d[1] = c();
    c = "&" + d.join("") + "=";
    d = b.split(".");
    b = Number(d[0]) || 0;
    for (var e = [], f = 0, g = 0; g < a.length; g++) {
      var l = a.charCodeAt(g);
      128 > l
        ? (e[f++] = l)
        : (2048 > l
            ? (e[f++] = (l >> 6) | 192)
            : (55296 == (l & 64512) && g + 1 < a.length && 56320 == (a.charCodeAt(g + 1) & 64512)
                ? ((l = 65536 + ((l & 1023) << 10) + (a.charCodeAt(++g) & 1023)), (e[f++] = (l >> 18) | 240), (e[f++] = ((l >> 12) & 63) | 128))
                : (e[f++] = (l >> 12) | 224),
              (e[f++] = ((l >> 6) & 63) | 128)),
          (e[f++] = (l & 63) | 128));
    }
    a = b;
    for (f = 0; f < e.length; f++) (a += e[f]), (a = xr(a, "+-a^+6"));
    a = xr(a, "+-3^+b+-f");
    a ^= Number(d[1]) || 0;
    0 > a && (a = (a & 2147483647) + 2147483648);
    a %= 1e6;
    return c + (a.toString() + "." + (a ^ b));
  };

const MicrosoftTranslator = {
  translateText: async function (accessToken, inputText, sourceLanguage = '', targetLanguage) {
    try {
      /**
       * Method: POST 
       * URL: https://api.cognitive.microsofttranslator.com/translate?to=${targetLanguage}&api-version=3.0&includeSentenceLength=true 
       * Content-Type: application/json - send(inputText)
       *
       * Method: POST 
       * URL: https://api-edge.cognitive.microsofttranslator.com/translate?to=${targetLanguage}&api-version=3.0&includeSentenceLength=true 
       * Content-Type: application/json - send(inputText)
       */
      const response = await $.ajax({
        url: `https://api.cognitive.microsofttranslator.com/translate?from=${sourceLanguage}&to=${targetLanguage}&api-version=3.0&textType=html&includeSentenceLength=true`,
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'Content-Type': 'application/json'
        },
        data: JSON.stringify(getDynamicDictionaryText(inputText).split(/\n/).map((sentence) => ({ "Text":sentence })))
      });

      const translatedText = response.map((element) => element.translations[0].text.trim()).join('\n');
      return translatedText;
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      throw error;
    }
  }
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

const Translators = {
  DEEPL_TRANSLATOR: 'deeplTranslator',
  GOOGLE_TRANSLATE: 'googleTranslate',
  PAPAGO: 'papago',
  MICROSOFT_TRANSLATOR: 'microsoftTranslator',
  OPENAI_TRANSLATOR: 'openaiTranslator',
};