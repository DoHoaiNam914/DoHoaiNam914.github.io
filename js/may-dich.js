const GOOGLE = 'google';
const MICROSOFT = 'microsoft';
const PAPAGO = 'papago';

const TSV = 'text/tab-separated-values';
const CSV = 'text/csv';

var glossary;

var googleQuery;
var googleLang;
var googleTranslation;

var microsoftQuery;
var microsoftLang;
var microsoftTranslation;

var papagoQuery;
var papagoLang;
var papagoTranslation;

$("#translateButton").on("click", function () {
  let service = $(".service.active").attr("id");
  let sentences = $("#sourceText").val().split('\n');

  if (googleQuery != undefined && $(".service.active").attr("id") === GOOGLE && $("#targetLangSelect").val() === googleLang && textPreProcess(sentences.join('\n'), $(".service.active").attr("id"), true) === googleQuery) {
    $("#translatedText").html(googleTranslation);
  } if (microsoftQuery != undefined && $(".service.active").attr("id") === MICROSOFT && $("#targetLangSelect").val() === microsoftLang && textPreProcess(sentences.join('\n'), $(".service.active").attr("id"), true) === microsoftQuery) {
    $("#translatedText").html(microsoftTranslation);
  } if (papagoQuery != undefined && $(".service.active").attr("id") === PAPAGO && $("#targetLangSelect").val() === papagoLang && textPreProcess(sentences.join('\n'), $(".service.active").attr("id"), true) === papagoQuery) {
    $("#translatedText").html(papagoTranslation);
  } else {
    translate($(".service.active").attr("id"), $("#sourceLangSelect").val(), $("#targetLangSelect").val(), sentences, '', new Array(), 0, sentences.length);
  }
});

$(".textarea").on("input", function () {
  let height = ($("#sourceText").prop("scrollHeight") >= $("#translatedText").prop("scrollHeight") ? $("#sourceText") : $("#translatedText")).prop("scrollHeight");
  $("textarea").css("height", height > 300 ? height.toString().concat('px') : "auto");
});

$(".service").on("click", function () {
  $(".service").removeClass("active");
  $(this).addClass("active");

  if ($(".service.active").attr("id") === PAPAGO) {
    if ($("#sourceLangSelect").val() === 'auto') {
      $("#sourceLangSelect").val("en");
    }

    $("option[value=\"auto\"").attr("disabled", true);
  } else {
    $("option[value=\"auto\"").removeAttr("disabled");
  }
});

$("#inputGlossary").on("input", function () {
  let reader = new FileReader();
  reader.readAsText(this.files[0]);
  reader.onload = function () {
    switch ($("#inputGlossary").prop("files")[0].type) {
      case TSV:
        glossary = this.result.split(/\r?\n/).map((element) => element.split('\t')).filter((element) => element.length === 2);
        break;
      case CSV:
        glossary = $.csv.toArrays(this.result);
        break;
    }
  };
});

$("div.textarea").on("paste", function (e) {
  e.preventDefault();
  var text = e.clipboardData.getData('text/plain');
  document.execCommand('insertText', false, text);
});

async function translate(service, sourceLang, targetLang, sentences, translation, query, index, count) {
  if (index < sentences.length) {
    switch (service) {
      case PAPAGO:
        query.push(textPreProcess(sentences[index], service, false));
        break;
      case MICROSOFT:
        query.push({
            "Text":textPreProcess(sentences[index], service, false)
        });

        break;
      case GOOGLE:
      default:
        query.push(encodeURIComponent(textPreProcess(sentences[index], service, false)));
        break;
    }

    if ((count >= 50 && query.length === 50) || (count < 50 && query.length === count)) {
      let settings;

      switch (service) {
        case PAPAGO:
          settings = {
            crossDomain: true,
            url: "https://api.papago-chrome.com/v2/translate/openapi",
            method: "POST",
            headers: {
              "Content-Type": "application/json; charset=UTF-8"
            },
            processData: false,
            data: JSON.stringify({
              'source' : 'en',
              'target' : 'vi',
              'text' : query.join('\n')
            })
          };

          $.ajax(settings).done(function (data) {
            translation += `<p>${data.translatedText.replace(/\n/g, '</p>\n<p>')}</p>`.replace(/<p><\/p>/g, '<p><br></p>');

            if (count - query.length === 0) {
              $("#translatedText").html(textPostProcess(translation, service));
              papagoQuery = textPreProcess(sentences, service, true);
              papagoLang = targetLang;
              papagoTranslation = $("#translatedText").html();

              let height = ($("#translatedText").prop("scrollHeight") >= $("#sourceText").prop("scrollHeight") ? $("#translatedText") : $("#sourceText")).prop("scrollHeight");

              $("textarea").css("height", height > 300 ? height.toString().concat('px') : "auto");
            } else {
              translate(service, sourceLang, targetLang, sentences, translation, new Array(), index + 1, count - query.length);
            }
          }).fail(function (jqXHR, textStatus, errorThrown) {
            $("#translatedText").html(errorThrown);

            let height = ($("#translatedText").prop("scrollHeight") >= $("#sourceText").prop("scrollHeight") ? $("#translatedText") : $("#sourceText")).prop("scrollHeight");

            $("textarea").css("height", height > 300 ? height.toString().concat('px') : "auto");
          });

          break;
        case MICROSOFT:
          let accessToken = await fetch('https://edge.microsoft.com/translate/auth')
            .then((response) => response.text());

          if (accessToken == undefined) {
            throw new Error('Cannot get a Access Token from the server.');
          }

          //POST https://api.cognitive.microsofttranslator.com/translate?to=${toLang}&api-version=3.0&includeSentenceLength=true Authorization: Bearer ${accessToken} - Content-Type: application/json - send(data)
          settings = {
            crossDomain: true,
            url: `https://api.cognitive.microsofttranslator.com/translate?from=${sourceLang.replace('auto', '').replace('CN', 'CHS').replace('TW', 'CHT')}&to=${targetLang.replace('CN', 'CHS').replace('TW', 'CHT')}&api-version=3.0&textType=html&includeSentenceLength=true`,
            method: "POST",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json"
            },
            processData: false,
            data: JSON.stringify(query)
          };

          $.ajax(settings).done(function (data) {
            var translations = data.translatedText.split('\n');

            translation += `<p>${translations.join('</p>\n<p>')}</p>`.replace(/<p><\/p>/g, '<p><br></p>');

            if (count - query.length === 0) {
              $("#translatedText").html(textPostProcess(translation, service));
              microsoftQuery = textPreProcess(sentences, service, true);
              microsoftLang = targetLang;
              microsoftTranslation = $("#translatedText").html();

              let height = ($("#translatedText").prop("scrollHeight") >= $("#sourceText").prop("scrollHeight") ? $("#translatedText") : $("#sourceText")).prop("scrollHeight");

              $("textarea").css("height", height > 300 ? height.toString().concat('px') : "auto");
            } else {
              translate(service, sourceLang, targetLang, sentences, translation, new Array(), index + 1, count - query.length);
            }
          }).fail(function (jqXHR, textStatus, errorThrown) {
            $("#translatedText").html(errorThrown);

            let height = ($("#translatedText").prop("scrollHeight") >= $("#sourceText").prop("scrollHeight") ? $("#translatedText") : $("#sourceText")).prop("scrollHeight");

            $("textarea").css("height", height > 300 ? height.toString().concat('px') : "auto");
          });

          break;
        case GOOGLE:
        default:
          //POST https://translate.googleapis.com/translate_a/t?anno=3&client=te&format=html&v=1.0&key&sl=auto&tl=${targetLang}&sr=1&mode=1 Content-Type: application/x-www-form-urlencoded - send(query)
          //GET https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&hl=vi&dt=t&dt=bd&dj=1${query}
          //GET https://clients5.google.com/translate_a/single?dj=1&dt=t&dt=sp&dt=ld&dt=bd&client=dict-chrome-ex&sl=auto&tl=${targetLang}${query}
          //GET https://translate.google.com/translate_t?source=dict-chrome-ex&sl=auto&tl=${targetLang}${query}
          settings = {
            crossDomain: true,
            url: `https://translate.googleapis.com/translate_a/t?anno=3&client=dict-chrome-ex&format=html&v=1.0&key&sl=${sourceLang}&tl=${targetLang}&sr=1&mode=1`,
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            processData: false,
            data: `q=${query.join('&q=')}`
          };

          $.ajax(settings).done(function (data) {
            if (sourceLang === 'auto') {
              var translations = new Array();
              data.forEach((element) => translations.push(element[0]));

              translation += `<p>${translations.join('</p>\n<p>')}</p>`.replace(/<p><\/p>/g, '<p><br></p>');
            } else {
              translation += `<p>${data.join('</p>\n<p>')}</p>`.replace(/<p><\/p>/g, '<p><br></p>');
            }

            if (count - query.length === 0) {
              $("#translatedText").html(textPostProcess(translation, service));
              googleQuery = textPreProcess(sentences, service, true);
              googleLang = targetLang;
              googleTranslation = $("#translatedText").html();

              let height = ($("#translatedText").prop("scrollHeight") >= $("#sourceText").prop("scrollHeight") ? $("#translatedText") : $("#sourceText")).prop("scrollHeight");

              $("textarea").css("height", height > 300 ? height.toString().concat('px') : "auto");
            } else {
              translate(service, sourceLang, targetLang, sentences, translation, new Array(), index + 1, count - query.length);
            }
          }).fail(function (jqXHR, textStatus, errorThrown) {
            $("#translatedText").html(errorThrown);

            let height = ($("#translatedText").prop("scrollHeight") >= $("#sourceText").prop("scrollHeight") ? $("#translatedText") : $("#sourceText")).prop("scrollHeight");

            $("textarea").css("height", height > 300 ? height.toString().concat('px') : "auto");
          });

          break;
      }
    } else {
      translate(service, sourceLang, targetLang, sentences, translation, query, index + 1, count);
    }
  }

  function textPreProcess(text, service, pre) {
    var glossaryText = text;

    if (glossary != undefined) {
      for (let i = 1; i < glossary.length; i++) {
        if (pre) {
          glossaryText = glossaryText.replace(new RegExp(glossary[i][0], 'g'), glossary[i][1]);
        } else if (service === 'microsoft') {
          glossaryText = glossaryText.replace(new RegExp(glossary[i][0], 'g'), `<mstrans:dictionary translation="${glossary[i][1]}">GLOSSARY_INDEX_${i}</mstrans:dictionary>`)
        } else {
          glossaryText = glossaryText.replace(new RegExp(glossary[i][0], 'g'), `<span class="notranslate">GLOSSARY_INDEX_${i}</span>`);
        }
      }

      for (let i = glossary.length - 1; pre === false && i >= 1; i--) {
        glossaryText = glossaryText.replace(new RegExp(`GLOSSARY_INDEX_${i}`, 'g'), glossary[i][0]);
      }
    }

    return glossaryText;
  }

  function textPostProcess(text, service) {
    var glossaryText = text;

    for (let i = 1; glossary != undefined && service !== MICROSOFT && i < glossary.length; i++) {
      glossaryText = glossaryText.replace(/<span class="notranslate">/g, '').replace(/<\/span>/g, '')
        .replace(new RegExp(`(\\d|[A-Za-zÀ-ÖØ-öø-ɏḀ-ỿ]|[!),.:;?\\]}’”…—])${glossary[i][0]}(\\d|[A-Za-zÀ-ÖØ-öø-ɏḀ-ỿ]|[(\\[{‘“])`, 'g'), `$1 ${glossary[i][1]} $2`)
        .replace(new RegExp(`(\\d|[A-Za-zÀ-ÖØ-öø-ɏḀ-ỿ]|[!),.:;?\\]}’”…—])${glossary[i][0]}`, 'g'), `$1 ${glossary[i][1]}`)
        .replace(new RegExp(`${glossary[i][0]}(\\d|[A-Za-zÀ-ÖØ-öø-ɏḀ-ỿ]|[(\\[{‘“])`, 'g'), `${glossary[i][1]} $1`)
        .replace(new RegExp(glossary[i][0], 'g'), glossary[i][1]).trim();
    }

    return glossaryText;
  }
}