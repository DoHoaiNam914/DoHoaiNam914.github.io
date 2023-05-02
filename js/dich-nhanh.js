'use strict';

const Services = {
  GOOGLE: 'google',
  MICROSOFT: 'microsoft',
  PAPAGO: 'papago',
  DEEPL: 'deepl'
};

const QUERY_LENGTH = 20;

var sourceSentences;
var translation = '';

$(document).ready(function () {
  const searchParams = new URLSearchParams(window.location.search);

  if (searchParams.get('q') != null) {
    $("#queryText").val(decodeURIComponent(searchParams.get('q'))).change();
    $("#translateButton").click();
  }
});

$("#copyButton").on("click", () => navigator.clipboard.writeText(translation));

$("#pasteButton").on("click", function () {
  navigator.clipboard
    .readText()
    .then((clipText) => $("#queryText").val(clipText).change())
    .finally(function () {
      if ($("#translateButton").text() === 'Sửa') {
        $("#translateButton").click();
        $("#translateButton").click();
      }
    });
});

$(".textarea").on("input", () => resize());

$("#queryText").change(function () {
  resize();
  $("#queryTextCounter").text($("#queryText").val().length);
});

$("#settingsButton").on("click", () => $("#glossaryList").val(-1).change());

$(".option").change(() => localStorage.setItem("translator", JSON.stringify({ service: $(".service.active").attr("id"), source: $("#sourceLangSelect").val(), target: $("#targetLangSelect").val(), intermediary: { enabled: $("#flexSwitchCheckIntermediary").prop("checked"), service: $(".intermediary-service.active").attr("id"), lang: $("#intermediaryLangSelect").val() } })));

$("#translateButton").click(function () {
  if ($(this).text() === 'Dịch') {
    const service = $("#flexSwitchCheckIntermediary").prop("checked") ? $(".intermediary-service.active").attr("id") : $(".service.active").attr("id");

    var sourceLang = $("#sourceLangSelect").val();
    var targetLang = $("#flexSwitchCheckIntermediary").prop("checked") ? $("#intermediaryLangSelect").val() : $("#targetLangSelect").val();

    switch (service) {
      case Services.DEEPL:
        sourceLang = getDeepLFormatSource(sourceLang);
        targetLang = getDeepLFormatTarget(targetLang);
        break;
        
      case Services.MICROSOFT:
        sourceLang = getMicrosoftFormat(sourceLang);
        targetLang = getMicrosoftFormat(targetLang);
        break;
    }

    sourceSentences = $("#queryText").val().split(/\r?\n/);

    if ($("#queryText").val().length > 0) {
      preRequest();
      translate(service, 1, sourceLang, targetLang, sourceSentences, sourceSentences.length > QUERY_LENGTH ? sourceSentences.slice(0, QUERY_LENGTH) : sourceSentences, '');
    }
  } else if ($(this).text() === 'Sửa') {
    $("#translatedText").hide();
    $("#queryText").show(); 
    $("#clearImageButton").removeClass("disabled");
    $("#pasteUrlButton").removeClass("disabled");
    $("#imageFile").removeClass("disabled");
    $("#copyButton").addClass("disabled");
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
    $("#translateButton").click();
    $("#translateButton").click();
  }

  localStorage.setItem("translator", JSON.stringify({ service: $(".service.active").attr("id"), source: $("#sourceLangSelect").val(), target: $("#targetLangSelect").val(), intermediary: { enabled: $("#flexSwitchCheckIntermediary").prop("checked"), service: $(".intermediary-service.active").attr("id"), lang: $("#intermediaryLangSelect").val() } }));
});

$(".intermediary-service").click(function () {
  if (!$(this).hasClass("disabled")) {
    $(".intermediary-service").removeClass("active");
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
    $("#translateButton").click();
    $("#translateButton").click();
  }

  localStorage.setItem("translator", JSON.stringify({ service: $(".service.active").attr("id"), source: $("#sourceLangSelect").val(), target: $("#targetLangSelect").val(), intermediary: { enabled: $("#flexSwitchCheckIntermediary").prop("checked"), service: $(".intermediary-service.active").attr("id"), lang: $("#intermediaryLangSelect").val() } }));
});

async function translate(service, sessionIndex, sourceLang, targetLang, sentences, query, result) {
  let settings;

  switch (service) {
    case Services.DEEPL:
      settings = {
        crossDomain: true,
        url: "https://api-free.deepl.com/v2/translate",
        method: "POST",
        processData: false,
        data: `auth_key=0c9649a5-e8f6-632a-9c42-a9eee160c330:fx&text=${encodeURI(sentences.join('&text='))}${sourceLang !== 'AUTO' ? '&source_lang=' + sourceLang : ''}&target_lang=${targetLang}`
      };

      $.ajax(settings).done(function (data) {
        const combine = [];

        for (let i = 0; i < sentences.length; i++) {
          combine.push([
            sourceSentences[i],
            data.translations[i].text
          ]);
        }

        translation = combine.map((element) => element[1]).join('\n');

        if ($("#flexSwitchCheckIntermediary").prop("checked") && sourceLang !== $("#intermediaryLangSelect").val()) {
          sentences = translation.split(/\r?\n/);

          translation = '';
          preRequest();
          translate($(".service.active").attr("id"), 1, targetLang, getDeepLFormatTarget($("#targetLangSelect").val()), sentences, sentences.length > QUERY_LENGTH ? sentences.slice(0, QUERY_LENGTH) : sentences, '');
        } else {
          $("#translatedText").html(('<p>' + combine.map((sentence) => sentence[1].trim() !== sentence[0].trim() ? '<i>' + sentence.join('</i><br>') : sentence[0]).join('</p><p>') + '</p>').replace(/(<p>)(<\/p>)/g, '$1<br>$2'));
          postRequest();
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
      const accessToken = await fetch('https://edge.microsoft.com/translate/auth')
          .then((response) => response.text());

      if (accessToken == undefined) {
        $("#translatedText").html('<p>Không thể lấy được Access Token từ máy chủ.</p>');
        postRequest();
        break;
      }

      //POST https://api.cognitive.microsofttranslator.com/translate?to=${toLang}&api-version=3.0&includeSentenceLength=true Authorization: Bearer ${accessToken} - Content-Type: application/json - send(data)
      //POST https://api-edge.cognitive.microsofttranslator.com/translate?to=${toLang}&api-version=3.0&includeSentenceLength=true Authorization: Bearer ${accessToken} - Content-Type: application/json - send(data)
      settings = {
        crossDomain: true,
        url: `https://api.cognitive.microsofttranslator.com/translate?from=${sourceLang}&to=${targetLang}&api-version=3.0&textType=html&includeSentenceLength=true`,
        method: "POST",
        headers: {
          "Authorization": "Bearer " + accessToken,
          "Content-Type": "application/json"
        },
        processData: false,
        data: JSON.stringify(query.map((sentence) => ({
            "Text":textPreProcess(sentence, !$("#flexSwitchCheckIntermediary").prop("checked") || sourceLang !== $("#intermediaryLangSelect").val() ? 'intermediary' : service)
        })))
      };

      $.ajax(settings).done(function (data) {
        for (let i = 0; i < query.length; i++) {
          const processedTranslation = textPostProcess(data[i].translations[0].text, service);

          result += ('<p>' + (processedTranslation.trim() !== query[i].trim() ? '<i>' + [...sourceSentences].slice(QUERY_LENGTH * (sessionIndex - 1))[i] + '</i><br>' + processedTranslation : [...sourceSentences].slice(QUERY_LENGTH * (sessionIndex - 1))[i]) + '</p>').replace(/(<p>)(<\/p>)/g, '$1<br>$2');
          translation += textPostProcess(data[i].translations[0].text, !$("#flexSwitchCheckIntermediary").prop("checked") || sourceLang !== $("#intermediaryLangSelect").val() ? 'intermediary' : service) + '\n';
        }

        if ([...sentences].slice(QUERY_LENGTH * (sessionIndex - 1)).every((element, index) => query[index] === element)) {
          if ($("#flexSwitchCheckIntermediary").prop("checked") && sourceLang !== $("#intermediaryLangSelect").val()) {
            sentences = translation.split(/\r?\n/);

            translation = '';
            preRequest();
            translate($(".service.active").attr("id"), 1, targetLang, getMicrosoftFormat($("#targetLangSelect").val()), sentences, sentences.length > QUERY_LENGTH ? sentences.slice(0, QUERY_LENGTH) : sentences, '');
          } else {
            $("#translatedText").html(result); 
            postRequest();
          }
        } else {
          translate(service, sessionIndex + 1, sourceLang, targetLang, sentences, (QUERY_LENGTH * sessionIndex) + QUERY_LENGTH < sentences.length ? sentences.slice(QUERY_LENGTH * sessionIndex, (QUERY_LENGTH * sessionIndex) + QUERY_LENGTH) : sentences.slice(QUERY_LENGTH * sessionIndex), result);
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
        url: `https://translate.googleapis.com/translate_a/t?anno=3&client=gtx&format=html&v=1.0&key&logId=vTE_20230329&sl=${sourceLang}&tl=${targetLang}&tc=${sessionIndex}&sr=1&tk=${zr(query.join('\n')).replace('&tk=', '')}&mode=1`,
        method: 'GET',
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        processData: false,
        data: "q=" + encodeURI(textPreProcess(query.join('&q='), service))
      };

      $.ajax(settings).done(function (data) {
        for (let i = 0; i < query.length; i++) {
          const sentence = textPostProcess((sourceLang === 'auto' ? data[i][0] : data[i]).replace(/(<\/b>)( *<i>)/g, '$1PARABREAK$2').split('PARABREAK').map((element) => element.replace(/<i>.+<\/i>( *<b>.+<\/b>)/g, '$1')).join(''), service);
          result += ('<p>' + (sentence.trim() !== query[i].trim() ? '<i>' + [...sourceSentences].slice(QUERY_LENGTH * (sessionIndex - 1))[i] + '</i><br>' + sentence : [...sourceSentences].slice(QUERY_LENGTH * (sessionIndex - 1))[i]) + '</p>').replace(/(<p>)(<\/p>)/g, '$1<br>$2');
        }

        translation += data.map((sentence) => textPostProcess(decodeHTMLEntity((sourceLang === 'auto' ? sentence[0] : sentence).replace(/(<\/b>)( *<i>)/g, '$1PARABREAK$2').split('PARABREAK').map((element) => element.replace(/<i>.+<\/i>( *)<b>(.+)<\/b>/g, '$1$2')).join('')), !$("#flexSwitchCheckIntermediary").prop("checked") || sourceLang !== $("#intermediaryLangSelect").val() ? 'intermediary' : service)).join('\n');

        if ([...sentences].slice(QUERY_LENGTH * (sessionIndex - 1)).every((element, index) => query[index] === element)) {
          if ($("#flexSwitchCheckIntermediary").prop("checked") && sourceLang !== $("#intermediaryLangSelect").val()) {
            sentences = translation.split(/\r?\n/);

            translation = '';
            preRequest();
            translate($(".service.active").attr("id"), 1, targetLang, $("#targetLangSelect").val(), sentences, sentences.length > QUERY_LENGTH ? sentences.slice(0, QUERY_LENGTH) : sentences, '');
          } else {
            $("#translatedText").html(result); 
            postRequest();
          }
        } else {
          translate(service, sessionIndex + 1, sourceLang, targetLang, sentences, (QUERY_LENGTH * sessionIndex) + QUERY_LENGTH < sentences.length ? sentences.slice(QUERY_LENGTH * sessionIndex, (QUERY_LENGTH * sessionIndex) + QUERY_LENGTH) : sentences.slice(QUERY_LENGTH * sessionIndex), result);
        }
      }).fail(function (jqXHR, textStatus, errorThrown) {
        $("#translatedText").html(`<p>${jqXHR}</p>\n<p>${errorThrown}</p>`);
        postRequest();
      });
      break;
  }
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
  $("#translateButton").addClass("disabled");
  $("#imageFile").addClass("disabled");
  $("#pasteUrlButton").addClass("disabled");
  $("#clearImageButton").addClass("disabled");
  $("#inputGlossary").addClass("disabled");
  $("#translatedText").html(null);
}

function postRequest() {
  $("#queryText").hide();
  $("#translatedText").show();
  resize();
  $("#inputGlossary").removeClass("disabled");
  $("#translateButton").removeClass("disabled");
  $("#copyButton").removeClass("disabled");
  $("#translateButton").text("Sửa");
}

function textPreProcess(text, service) {
  var newText = text;

  if (glossary != null) {
    const glossaryList = [...glossary].reverse().filter((phrase) => newText.includes(phrase[0]));

    for (let i = 0; i < glossaryList.length; i++) {
      if (service === Services.MICROSOFT) {
        newText = newText.replace(new RegExp(glossaryList[i][0], 'g'), `<mstrans:dictionary translation="${glossaryList[i][1]}">GLOSSARY_INDEX_${i}</mstrans:dictionary>`);
        newText = /\p{sc=Latin}/u.test(glossaryList[i][1]) ? newText.replace(/(mstrans:dictionary>)(<mstrans:dictionary)/g, '$1 $2') : newText;
      } else {
        newText = newText.replace(new RegExp(glossaryList[i][0], 'g'), `<span class="notranslate">GLOSSARY_INDEX_${i}</span>`);
        newText = /\p{sc=Latin}/u.test(glossaryList[i][1]) ? newText.replace(/(span>)(<span class="notranslate")/g, '$1 $2') : newText;
      }
    }

    for (let i = glossaryList.length - 1; i >= 0; i--) {
      newText = newText.replace(new RegExp(`GLOSSARY_INDEX_${i}`, 'g'), glossaryList[i][0]);
    }
  }

  return newText;
}

function textPostProcess(text, service) {
  var newText = text;

  if (glossary != undefined && service !== Services.MICROSOFT) {
    const glossaryMap = new Map([...glossary].reverse().filter((phrase) => newText.includes(phrase[0])));

    for (let [key, value] of glossaryMap.entries()) {
      newText = newText.replace(/<span class="notranslate">/g, ' ').replace(/<\/span>/g, ' ').replace(new RegExp(key, 'g'), service === 'intermediary' ? key : value);
    }
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