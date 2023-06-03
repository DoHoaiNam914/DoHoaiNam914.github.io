'use strict';

const Services = {
  GOOGLE: 'google',
  MICROSOFT: 'microsoft',
  PAPAGO: 'papago',
  DEEPL: 'deepl'
};

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

const QUERY_LENGTH = 20;

var accessToken;

var sourceSentences;
var translation = '';

$(document).ready(function () {
  $.get({
    crossDomain: false,
    url: "/datasource/Bính âm.txt",
    processData: false
  }).done(function (data) {
    pinyins = new Map(data.split(/\r?\n/).map((character) => character.split('=')).filter((character) => character.length >= 2));
    console.log('Đã tải xong bộ dữ liệu bính âm!');
  }).fail((jqXHR, textStatus, errorThrown) => window.location.reload());

  $.get({
    crossDomain: false,
    url: "/datasource/Hán việt.txt",
    processData: false
  }).done(function (data) {
    sinoVietnameses = new Map(data.split(/\r?\n/).map((character) => character.split('=')).filter((character) => character.length >= 2));
    console.log('Đã tải xong bộ dữ liệu hán việt!');
  }).fail((jqXHR, textStatus, errorThrown) => window.location.reload());
});

$("#copyButton").on("click", () => navigator.clipboard.writeText($("#translateButton").text() === 'Sửa' ? translation : $("#queryText").val()));

$("#pasteButton").on("click", function () {
  navigator.clipboard
    .readText()
    .then((clipText) => clipText.length > 0 && $("#queryText").val(clipText).change())
    .finally(function () {
      if ($("#translateButton").text() === 'Sửa') {
        translation = '';
        $("#translateButton").text("Dịch");
        $("#translateButton").click();
      }
    });
});

$("#reTranslateButton").on("click", function () {
  translation = '';
  $("#translateButton").text("Dịch");
  $("#translateButton").click();
});

$(".textarea").on("input", () => resize());

$("#queryText").change(function () {
  resize();
  $("#queryTextCounter").text($("#queryText").val().length);
});

$(".option").change(function () {
  if ((($(this).attr("id") !== 'intermediaryLangSelect' && $(this).attr("id") !== 'flexSwitchCheckIntermediary') || $("#flexSwitchCheckIntermediary").prop("checked")) && $("#translateButton").text() === 'Sửa') {
    translation = '';
    $("#translateButton").text("Dịch");
    $("#translateButton").click();
  }

  localStorage.setItem("translator", JSON.stringify({ service: $(".service.active").attr("id"), source: $("#sourceLangSelect").val(), target: $("#targetLangSelect").val(), intermediaryTranslator: { enabled: $("#flexSwitchCheckIntermediary").prop("checked"), service: $(".intermediary-service.active").attr("id"), lang: $("#intermediaryLangSelect").val() } }));
});

$("#translateButton").click(function () {
  if ($(this).text() === 'Dịch') {
    const service = $("#flexSwitchCheckIntermediary").prop("checked") ? $(".intermediary-service.active").attr("id") : $(".service.active").attr("id");

    var sourceLang = $("#sourceLangSelect").val();
    var targetLang = $("#flexSwitchCheckIntermediary").prop("checked") && $("#targetLangSelect").val() !== 'pinyin' && $("#targetLangSelect").val() !== 'sinovietnamese' ? $("#intermediaryLangSelect").val() : $("#targetLangSelect").val();

    sourceSentences = $("#queryText").val().split(/\n/);

    if ($("#queryText").val().length > 0) {
      preRequest();

      if (targetLang === 'pinyin' || targetLang === 'sinovietnamese') {
        var result = '';

        translation = getConvertedWords(new Map(Array.from(targetLang === 'pinyin' ? pinyins : sinoVietnameses).sort((a, b) => b[0].length - a[0].length)), sourceSentences.join('\n'));

        const lines = translation.split(/\n/);

        for (let i = 0; i < sourceSentences.length; i++) {
          result += ('<p>' + (lines[i].trim() !== sourceSentences[i].trim() ? '<i>' + sourceSentences[i] + '</i><br>' + lines[i] : sourceSentences[i]) + '</p>').replace(/(<p>)(<\/p>)/g, '$1<br>$2');
        }

        $("#translatedText").html(result);
        postRequest();
      } else {
        translate(service, 1, sourceLang, targetLang, sourceSentences, sourceSentences.length > QUERY_LENGTH ? sourceSentences.slice(0, QUERY_LENGTH) : sourceSentences, '', 0);
      }
    }
  } else if ($(this).text() === 'Sửa') {
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

$(".service").click(function () {
  if (!$(this).hasClass("disabled")) {
    $(".service").removeClass("active");
    $(this).addClass("active");

    switch ($(this).attr("id")) {
      case Services.DEEPL:
        $(".select-lang").each(function () {
          if ($(this).val() === 'vi') {
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

        $(".select-lang option[value=\"vi\"]").addClass("disabled");
        break;

      default:
        $(".select-lang option[value=\"vi\"]").removeClass("disabled");
        break;
    }
  }

  if ($("#translateButton").text() === 'Sửa') {
    translation = '';
    $("#translateButton").text("Dịch");
    $("#translateButton").click();
  }

  localStorage.setItem("translator", JSON.stringify({ service: $(".service.active").attr("id"), source: $("#sourceLangSelect").val(), target: $("#targetLangSelect").val(), intermediaryTranslator: { enabled: $("#flexSwitchCheckIntermediary").prop("checked"), service: $(".intermediary-service.active").attr("id"), lang: $("#intermediaryLangSelect").val() } }));
});

$("#flexSwitchCheckIntermediary").on("change", function () {
  if ($("#translateButton").text() === 'Sửa') {
    translation = '';
    $("#translateButton").text("Dịch");
    $("#translateButton").click();
  }
});

$(".intermediary-service").click(function () {
  if (!$(this).hasClass("disabled")) {
    $(".intermediary-service").removeClass("active");
    $(this).addClass("active");

    switch ($(this).attr("id")) {
      case Services.DEEPL:
        if ($("#intermediaryLangSelect").val() === 'vi') {
          $("#intermediaryLangSelect").val("en").change();
        }

        $("#intermediaryLangSelect option[value=\"vi\"]").addClass("disabled");
        break;

      default:
        $("#intermediaryLangSelect option[value=\"vi\"]").removeClass("disabled");
        break;
    }
  }

  if ($("#flexSwitchCheckIntermediary").prop("checked") && $("#translateButton").text() === 'Sửa') {
    translation = '';
    $("#translateButton").text("Dịch");
    $("#translateButton").click();
  }

  localStorage.setItem("translator", JSON.stringify({ service: $(".service.active").attr("id"), source: $("#sourceLangSelect").val(), target: $("#targetLangSelect").val(), intermediaryTranslator: { enabled: $("#flexSwitchCheckIntermediary").prop("checked"), service: $(".intermediary-service.active").attr("id"), lang: $("#intermediaryLangSelect").val() } }));
});

async function translate(service, sessionIndex, sourceLang, targetLang, sentences, query, result, lostLineFixedAmount) {
  let settings;

  switch (service) {
    case Services.DEEPL:
      settings = {
        crossDomain: true,
        url: "https://api-free.deepl.com/v2/translate",
        method: "POST",
        processData: false,
        data: `auth_key=0c9649a5-e8f6-632a-9c42-a9eee160c330:fx&text=${encodeURI(textPreProcess(query.join('&text='), service))}${sourceLang !== 'auto' ? '&source_lang=' + getDeepLFormatSource(sourceLang) : ''}&target_lang=${getDeepLFormatTarget(targetLang)}&tag_handling=html`
      };

      $.ajax(settings).done(function (data) {
        const sourceQuery = Array.from(sourceSentences).slice(QUERY_LENGTH * (sessionIndex - 1));

        for (let i = 0; i < query.length; i++) {
          const processedTranslation = textPostProcess(data.translations[i].text, $("#flexSwitchCheckIntermediary").prop("checked") && sourceLang !== $("#intermediaryLangSelect").val() ? 'intermediary' : service);

          if (sourceQuery[i + lostLineFixedAmount].trim().length === 0 && processedTranslation.trim().length > 0) {
            lostLineFixedAmount++;
            i--;
            continue;
          }

          result += ('<p>' + (processedTranslation.trim() !== sourceQuery[i + lostLineFixedAmount].trim() ? '<i>' + sourceQuery[i + lostLineFixedAmount] + '</i><br>' + processedTranslation : sourceQuery[i + lostLineFixedAmount]) + '</p>').replace(/(<p>)(<\/p>)/g, '$1<br>$2');
        }

        translation += data.translations.map((sentence) => textPostProcess(decodeHTMLEntity(sentence.text), $("#flexSwitchCheckIntermediary").prop("checked") && sourceLang !== $("#intermediaryLangSelect").val() ? 'intermediary' : service)).join('\n');

        if (Array.from(sentences).slice(QUERY_LENGTH * (sessionIndex - 1)).every((element, index) => query[index] === element)) {
          if ($("#flexSwitchCheckIntermediary").prop("checked") && sourceLang !== $("#intermediaryLangSelect").val()) {
            sentences = translation.split(/\r?\n/);

            translation = '';
            preRequest();
            translate($(".service.active").attr("id"), 1, targetLang, $("#targetLangSelect").val(), sentences, sentences.length > QUERY_LENGTH ? sentences.slice(0, QUERY_LENGTH) : sentences, '', 0);
          } else {
            $("#translatedText").html(result);
            postRequest();
          }
        } else {
          translate(Services.DEEPL, sessionIndex + 1, sourceLang, targetLang, sentences, (QUERY_LENGTH * sessionIndex) + QUERY_LENGTH < sentences.length ? sentences.slice(QUERY_LENGTH * sessionIndex, (QUERY_LENGTH * sessionIndex) + QUERY_LENGTH) : sentences.slice(QUERY_LENGTH * sessionIndex), result, lostLineFixedAmount);
        }
      }).fail(function (jqXHR, textStatus, errorThrown) {
        $("#translatedText").html(`<p>${jqXHR}</p><br><p>${errorThrown}</p>`);
        postRequest();
      });
      break;

    case Services.PAPAGO:
      settings = {
        crossDomain: true,
        url: "https://api.papago-chrome.com/v2/translate/openapi",
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=UTF-8"
        },
        processData: false,
        data: JSON.stringify({
          'source': sourceLang,
          'target': targetLang,
          'text': textPreProcess(sentences.join('<br>'), service)
        })
      };

      $.ajax(settings).done(function (data) {
        const combine = [];

        for (let i = 0; i < sentences.length; i++) {
          combine.push([
            sentences[i],
            textPostProcess(data.translatedText.split(/<br>/)[i], service)
          ]);
        }

        $("#translatedText").html(('<p>' + combine.map((sentence) => sentence[1].trim() !== sentence[0].trim() ? '<i>' + sentence.join('</i><br>') : sentence[0]).join('</p><p>') + '</p>').replace(/(<p>)(<\/p>)/g, '$1<br>$2'));
        translation = combine.map((element) => element[1]).join('\n');
        postRequest();
      }).fail(function (jqXHR, textStatus, errorThrown) {
        $("#translatedText").html(`<p>${jqXHR}</p><br><p>${errorThrown}</p>`);
        postRequest();
      });
      break;

    case Services.MICROSOFT:
      if (accessToken == null) {
        accessToken = await fetch('https://edge.microsoft.com/translate/auth')
            .then((response) => response.text());
      }

      if (accessToken == undefined) {
        $("#translatedText").html('<p>Không thể lấy được Access Token từ máy chủ.</p>');
        postRequest();
        break;
      }

      //POST https://api.cognitive.microsofttranslator.com/translate?to=${toLang}&api-version=3.0&includeSentenceLength=true Authorization: Bearer ${accessToken} - Content-Type: application/json - send(data)
      //POST https://api-edge.cognitive.microsofttranslator.com/translate?to=${toLang}&api-version=3.0&includeSentenceLength=true Authorization: Bearer ${accessToken} - Content-Type: application/json - send(data)
      settings = {
        crossDomain: true,
        url: `https://api.cognitive.microsofttranslator.com/translate?from=${getMicrosoftFormat(sourceLang)}&to=${getMicrosoftFormat(targetLang)}&api-version=3.0&textType=html&includeSentenceLength=true`,
        method: "POST",
        headers: {
          "Authorization": "Bearer " + accessToken,
          "Content-Type": "application/json"
        },
        processData: false,
        data: JSON.stringify(query.map((sentence) => ({
            "Text":textPreProcess(sentence, service)
        })))
      };

      $.ajax(settings).done(function (data) {
        const sourceQuery = Array.from(sourceSentences).slice(QUERY_LENGTH * (sessionIndex - 1));

        for (let i = 0; i < query.length; i++) {
          const processedTranslation = textPostProcess(data[i].translations[0].text, $("#flexSwitchCheckIntermediary").prop("checked") && sourceLang !== $("#intermediaryLangSelect").val() ? 'intermediary' : service);

          if (sourceQuery[i + lostLineFixedAmount].trim().length === 0 && processedTranslation.trim().length > 0) {
            lostLineFixedAmount++;
            i--;
            continue;
          }

          result += ('<p>' + (processedTranslation.trim() !== sourceQuery[i + lostLineFixedAmount].trim() ? '<i>' + sourceQuery[i + lostLineFixedAmount] + '</i><br>' + processedTranslation : sourceQuery[i + lostLineFixedAmount]) + '</p>').replace(/(<p>)(<\/p>)/g, '$1<br>$2');
        }

        translation += data.map((sentence) => textPostProcess(decodeHTMLEntity(sentence.translations[0].text), $("#flexSwitchCheckIntermediary").prop("checked") && sourceLang !== $("#intermediaryLangSelect").val() ? 'intermediary' : service)).join('\n');

        if (Array.from(sentences).slice(QUERY_LENGTH * (sessionIndex - 1)).every((element, index) => query[index] === element)) {
          if ($("#flexSwitchCheckIntermediary").prop("checked") && sourceLang !== $("#intermediaryLangSelect").val()) {
            sentences = translation.split(/\r?\n/);

            translation = '';
            preRequest();
            translate($(".service.active").attr("id"), 1, targetLang, $("#targetLangSelect").val(), sentences, sentences.length > QUERY_LENGTH ? sentences.slice(0, QUERY_LENGTH) : sentences, '', 0);
          } else {
            $("#translatedText").html(result); 
            postRequest();
          }
        } else {
          translate(Services.MICROSOFT, sessionIndex + 1, sourceLang, targetLang, sentences, (QUERY_LENGTH * sessionIndex) + QUERY_LENGTH < sentences.length ? sentences.slice(QUERY_LENGTH * sessionIndex, (QUERY_LENGTH * sessionIndex) + QUERY_LENGTH) : sentences.slice(QUERY_LENGTH * sessionIndex), result, lostLineFixedAmount);
        }
      }).fail(function (jqXHR, textStatus, errorThrown) {
        $("#translatedText").html(`<p>${jqXHR}</p><br><p>${errorThrown}</p>`);
        postRequest();
      });
      break;

    case Services.GOOGLE:
      //GET https://translate.googleapis.com/translate_a/t?anno=3&client=wt_lib&format=html&v=1.0&key&logId=vTE_20230329&sl=${sourceLang}&tl=${targetLang}&tc=1&sr=1&tk=419495.97493&mode=1 Content-Type: application/x-www-form-urlencoded - send(query)
      //POST https://translate.googleapis.com/translate_a/t?anno=3&client=te&format=html&v=1.0&key&logId=vTE_20230329&sl=${sourceLang}&tl=${targetLang}&tc=1&ctt=1&dom=1&sr=1&tk=895688.700602&mode=1 Content-Type: application/x-www-form-urlencoded - send(query)
      //GET https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&hl=vi&dt=t&dt=bd&dj=1${query}
      //GET https://clients5.google.com/translate_a/single?dj=1&dt=t&dt=sp&dt=ld&dt=bd&client=dict-chrome-ex&sl=${sourceLang}&tl=${targetLang}${query}
      //GET https://translate.google.com/translate_t?source=dict-chrome-ex&sl=${sourceLang}&tl=${targetLang}${query}
      settings = {
        crossDomain: true,
        url: `https://translate.googleapis.com/translate_a/t?anno=3&client=gtx&format=html&v=1.0&key&logId=vTE_20230329&sl=${sourceLang}&tl=${targetLang}&tc=${sessionIndex}&sr=1${zr(query.join('\n'))}&mode=1`,
        method: 'GET',
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        processData: false,
        data: "q=" + encodeURI(textPreProcess(query.join('&q='), service))
      };

      $.ajax(settings).done(function (data) {
        const sourceQuery = Array.from(sourceSentences).slice(QUERY_LENGTH * (sessionIndex - 1));
        for (let i = 0; i < query.length; i++) {
          const processedTranslation = textPostProcess((sourceLang === 'auto' ? data[i][0] : data[i]).replace(/(<\/b>)( *<i>)/g, '$1PARABREAK$2').split('PARABREAK').map((element) => element.replace(/<i>.+<\/i>( *<b>.+<\/b>)/g, '$1')).join(''), $("#flexSwitchCheckIntermediary").prop("checked") && sourceLang !== $("#intermediaryLangSelect").val() ? 'intermediary' : service);

          if (sourceQuery[i + lostLineFixedAmount].trim().length === 0 && processedTranslation.trim().length > 0) {
            lostLineFixedAmount++;
            i--;
            continue;
          }

          result += ('<p>' + (processedTranslation.trim() !== sourceQuery[i + lostLineFixedAmount].trim() ? '<i>' + sourceQuery[i + lostLineFixedAmount] + '</i><br>' + processedTranslation : sourceQuery[i + lostLineFixedAmount]) + '</p>').replace(/(<p>)(<\/p>)/g, '$1<br>$2');
        }

        translation += data.map((sentence) => textPostProcess(decodeHTMLEntity((sourceLang === 'auto' ? sentence[0] : sentence).replace(/(<\/b>)( *<i>)/g, '$1PARABREAK$2').split('PARABREAK').map((element) => element.replace(/<i>.+<\/i>( *)<b>(.+)<\/b>/g, '$1$2')).join('')), $("#flexSwitchCheckIntermediary").prop("checked") && sourceLang !== $("#intermediaryLangSelect").val() ? 'intermediary' : service)).join('\n');

        if (Array.from(sentences).slice(QUERY_LENGTH * (sessionIndex - 1)).every((element, index) => query[index] === element)) {
          if ($("#flexSwitchCheckIntermediary").prop("checked") && sourceLang !== $("#intermediaryLangSelect").val()) {
            sentences = translation.split(/\r?\n/);

            translation = '';
            preRequest();
            translate($(".service.active").attr("id"), 1, targetLang, $("#targetLangSelect").val(), sentences, sentences.length > QUERY_LENGTH ? sentences.slice(0, QUERY_LENGTH) : sentences, '', 0);
          } else {
            $("#translatedText").html(result); 
            postRequest();
          }
        } else {
          translate(Services.GOOGLE, sessionIndex + 1, sourceLang, targetLang, sentences, (QUERY_LENGTH * sessionIndex) + QUERY_LENGTH < sentences.length ? sentences.slice(QUERY_LENGTH * sessionIndex, (QUERY_LENGTH * sessionIndex) + QUERY_LENGTH) : sentences.slice(QUERY_LENGTH * sessionIndex), result, lostLineFixedAmount);
        }
      }).fail(function (jqXHR, textStatus, errorThrown) {
        $("#translatedText").html(`<p>${jqXHR}</p>\n<p>${errorThrown}</p>`);
        postRequest();
      });
      break;
  }
}

function getConvertedWords(data, text) {
  const lines = text.split(/\n/);
  var result = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    var phrases = [];
    var tempWord = '';

    for (let j = 0; j < line.length; j++) {
      for (let k = Array.from(data)[0][0].length; k >= 1; k--) {
        if (data.has(line.substring(j, j + k)) && !markMap.has(line[j])) {
          phrases.push(data.get(line.substring(j, j + k)));
          j += k - 1;
          break;
        } else if (k === 1) {
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

          if ((tempWord.length > 0 && data.has(line[j + 1]) && !markMap.has(line[j + 1])) || j + 1 === line.length) {
            tempWord.split(' ').forEach((word) => phrases.push(word));
            tempWord = '';
          }

          break;
        }
      }

      continue;
    }

    result.push(phrases.join(' '));
  }

  Array.from(markMap).forEach((mark) => result = result.map((line) => line.replace(new RegExp(` ?(${mark[0]}) ?`, 'g'), mark[1]).trim()));
  return result.join('\n');
}

function decodeHTMLEntity(text) {
  const div = document.createElement('div');
  $(div).html(text); 
  return $(div).text();
}

function getMicrosoftFormat(languageCode) {
  return languageCode.replace('auto', '').replace('-CN', '-CHS').replace('-TW', '-CHT');
}

function getDeepLFormatSource(languageCode) {
  return languageCode.split('-')[0].toUpperCase();
}

function getDeepLFormatTarget(languageCode) {
  return languageCode.replace(/(zh)-[A-Z]{2,2}/, '$1').toUpperCase();
}

function preRequest() {
  $("#translatedText").show();
  $("#queryText").hide();
  $("#translateButton").addClass("disabled");
  $("#reTranslateButton").addClass("disabled");
  $(".service").addClass("disabled");
  $(".intermediary-service").addClass("disabled");
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

function postRequest() {
  resize();
  $("#translateButton").removeClass("disabled");
  $(".option").removeAttr("disabled");
  $(".option").removeClass("disabled");
  $("#pasteButton").removeClass("disabled");
  $("#copyButton").removeClass("disabled");
  $(".service").removeClass("disabled");
  $(".intermediary-service").removeClass("disabled");
  $("#reTranslateButton").removeClass("disabled");
  accessToken = null;
  $("#translateButton").text("Sửa");
}

function textPreProcess(text, service) {
  var newText = text;

  if (glossary != null) {
    const glossaryList = Array.from(glossary).filter((phrase) => text.includes(phrase[0]));

    for (let i = 0; i < glossaryList.length; i++) {
      if (service === Services.MICROSOFT) {
        newText = newText.replace(new RegExp(glossaryList[i][0], 'g'), `<mstrans:dictionary translation="${glossaryList[i][1]}">GLOSSARY_INDEX_${i}</mstrans:dictionary>`);
        newText = /\p{sc=Latin}|\d/u.test(glossaryList[i][1]) ? newText.replace(/(mstrans:dictionary>)(<mstrans:dictionary)/g, '$1 $2') : newText;
      } else {
        newText = newText.replace(new RegExp(glossaryList[i][0], 'g'), `GLOSSARY_INDEX_${i}`);
      }
    }

    for (let i = glossaryList.length - 1; i >= 0; i--) {
      newText = newText.replace(new RegExp(`GLOSSARY_INDEX_${i}`, 'g'), service === Services.MICROSOFT ? glossaryList[i][0] : glossaryList[i][1]);
    }
  }

  return newText;
}

function textPostProcess(text, service) {
  var newText = text;

  if (glossary != undefined && service === 'intermediary') {
    newText = newText.replace(/<span class="notranslate">/g, ' ').replace(/<\/span>/g, ' ');
  }

  return newText;
}

function resize() {
  $("main.container .textarea").css("height", "auto");

  const height = [
    $("#queryText").prop("scrollHeight"),
    $("#translatedText").prop("scrollHeight"),
  ].sort((a, b) => b - a)[0];

  if (height > 300) {
    $("main.container .textarea").css("height", height + "px");
  }
}

var yr = null;

var wr = function(a) {
    return function() {
        return a
    }
}
    , xr = function(a, b) {
    for (var c = 0; c < b.length - 2; c += 3) {
        var d = b.charAt(c + 2)
            , d = "a" <= d ? d.charCodeAt(0) - 87 : Number(d)
            , d = "+" == b.charAt(c + 1) ? a >>> d : a << d;
        a = "+" == b.charAt(c) ? a + d & 4294967295 : a ^ d
    }
    return a
};

var zr = function (a) {
    var b;
    if (null !== yr)
        b = yr;
    else {
        b = wr(String.fromCharCode(84));
        var c = wr(String.fromCharCode(75));
        b = [b(), b()];
        b[1] = c();
        b = (yr = window[b.join(c())] || "") || ""
    }
    var d = wr(String.fromCharCode(116))
        , c = wr(String.fromCharCode(107))
        , d = [d(), d()];
    d[1] = c();
    c = "&" + d.join("") + "=";
    d = b.split(".");
    b = Number(d[0]) || 0;
    for (var e = [], f = 0, g = 0; g < a.length; g++) {
        var l = a.charCodeAt(g);
        128 > l ? e[f++] = l : (2048 > l ? e[f++] = l >> 6 | 192 : (55296 == (l & 64512) && g + 1 < a.length && 56320 == (a.charCodeAt(g + 1) & 64512) ? (l = 65536 + ((l & 1023) << 10) + (a.charCodeAt(++g) & 1023),
            e[f++] = l >> 18 | 240,
            e[f++] = l >> 12 & 63 | 128) : e[f++] = l >> 12 | 224,
            e[f++] = l >> 6 & 63 | 128),
            e[f++] = l & 63 | 128)
    }
    a = b;
    for (f = 0; f < e.length; f++)
        a += e[f],
            a = xr(a, "+-a^+6");
    a = xr(a, "+-3^+b+-f");
    a ^= Number(d[1]) || 0;
    0 > a && (a = (a & 2147483647) + 2147483648);
    a %= 1E6;
    return c + (a.toString() + "." + (a ^ b))
}