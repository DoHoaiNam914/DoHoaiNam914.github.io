const Services = {
  GOOGLE: 'google',
  MICROSOFT: 'microsoft',
  PAPAGO: 'papago',
};

var glossaryTypeVietPhrase;

var queryIndex;
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

  var sourceLang = $("#sourceLangSelect").val();
  var targetLang = $("#targetLangSelect").val();

  if (service === Services.MICROSOFT) {
    sourceLang = getMicrosoftLanguageCode(sourceLang);
    targetLang = getMicrosoftLanguageCode(targetLang);
  }

  let sentences = $("#queryText").val().split(/\r?\n/);

  if ($("#glossaryType").val() === GlossaryType.VIETPHRASE) {
    glossaryTypeVietPhrase = $("#glossaryType").val();
    $("#glossaryType").val(GlossaryType.TSV).change();
  }

  if (googleQuery != undefined &&
      service === Services.GOOGLE &&
      sourceLang === googleLang[0] &&
      targetLang === googleLang[1] &&
      textPreProcess(sentences.join('\r\n'), service, true) ===
      googleQuery) {
    $("#translatedText").val(googleTranslation);
    resize();
  } else if (microsoftQuery != undefined &&
      service === Services.MICROSOFT &&
      sourceLang === microsoftLang[0] &&
      targetLang === microsoftLang[1] &&
      textPreProcess(sentences.join('\r\n'), service, true) ===
      microsoftQuery) {
    $("#translatedText").val(microsoftTranslation);
    resize();
  } else if (papagoQuery != undefined &&
      service === Services.PAPAGO &&
      sourceLang === papagoLang[0] &&
      targetLang === papagoLang[1] &&
      textPreProcess(sentences.join('\r\n'), service, true) ===
      papagoQuery) {
    $("#translatedText").val(papagoTranslation);
    resize();
  } else {
    $(this).attr("disabled", true);
    $("#inputGlossary").attr("disabled", true);
    queryIndex = 0;
    translate(service, sourceLang, targetLang, sentences,
        '', new Array(), 0, sentences.length);
  }
});

$(".service").on("click", function () {
  $(".service").removeClass("active");
  $(this).addClass("active");

  if ($(".service.active").attr("id") === Services.PAPAGO) {
    if ($("#sourceLangSelect").val() === 'auto') {
      $("#sourceLangSelect").val("en");
    }

    $("option[value=\"auto\"").attr("disabled", true);
  } else {
    $("option[value=\"auto\"").removeAttr("disabled");
  }
});

$("main.container textarea").on("input", function () {
  resize();
});

async function translate(service, sourceLang, targetLang, sentences, translation, query, index, count) {
  if (index < sentences.length) {
    var queryLength = 50;

    switch (service) {
      case Services.PAPAGO:
        query.push(sentences[index]);
        queryLength = 10;
        break;

      case Services.MICROSOFT:
        query.push({
            "Text":sentences[index]
        });

        break;

      case Services.GOOGLE:
        query.push(sentences[index]);
        break;
    }

    if ((count >= queryLength && query.length === queryLength) ||
        (count < queryLength && query.length === count)) {
      let settings;

      switch (service) {
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
              'source' : sourceLang,
              'target' : targetLang,
              'text' : textPreProcess(query.join('\r\n'), service, false)
            })
          };

          $.ajax(settings).done(function (data) {
            translation += data.translatedText;

            if (count - query.length === 0) {
              $("#translatedText").val(textPostProcess(translation, service));
              papagoQuery = textPreProcess(sentences.join('\r\n'), service, true);
              papagoLang = [
                sourceLang,
                targetLang,
              ];

              papagoTranslation = $("#translatedText").val();

              if (glossaryTypeVietPhrase != undefined) {
                $("#glossaryType").val(glossaryTypeVietPhrase).change();
                glossaryTypeVietPhrase = undefined;
              }

              resize();
              $("#translateButton").removeAttr("disabled");
              $("#inputGlossary").removeAttr("disabled");
            } else {
              translate(service, sourceLang, targetLang, sentences, translation,
                  new Array(), index + 1, count - query.length);
            }
          }).fail(function (jqXHR, textStatus, errorThrown) {
            $("#translatedText").val(errorThrown);

            if (glossaryTypeVietPhrase != undefined) {
              $("#glossaryType").val(glossaryTypeVietPhrase).change();
              glossaryTypeVietPhrase = undefined;
            }

            resize();
            $("#translateButton").removeAttr("disabled");
            $("#inputGlossary").removeAttr("disabled");
          });

          break;

        case Services.MICROSOFT:
          let accessToken = await fetch('https://edge.microsoft.com/translate/auth')
              .then((response) => response.text());

          if (accessToken == undefined) {
            $("#translatedText").val('Không thể lấy được Access Token từ máy chủ.');

            if (glossaryTypeVietPhrase != undefined) {
              $("#glossaryType").val(glossaryTypeVietPhrase).change();
              glossaryTypeVietPhrase = undefined;
            }

            resize();
            $("#translateButton").removeAttr("disabled");
            $("#inputGlossary").removeAttr("disabled");
            break;
          }

          //POST https://api.cognitive.microsofttranslator.com/translate?to=${toLang}&api-version=3.0&includeSentenceLength=true Authorization: Bearer ${accessToken} - Content-Type: application/json - send(data)
          settings = {
            crossDomain: true,
            url:
                `https://api.cognitive.microsofttranslator.com/translate?from=${sourceLang}&to=${targetLang}&api-version=3.0&textType=html&includeSentenceLength=true`,
            method: "POST",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json"
            },
            processData: false,
            data: JSON.stringify(textPreProcess(query, service, false))
          };

          $.ajax(settings).done(function (data) {
            let translations = new Array();

            data.forEach((element) => translations.push(element.translations[0].text));
            translation += translations.join('\r\n');

            if (count - query.length === 0) {
              $("#translatedText").val(textPostProcess(translation, service));
              microsoftQuery = textPreProcess(sentences.join('\r\n'), service, true);
              microsoftLang = [
                sourceLang,
                targetLang,
              ];

              microsoftTranslation = $("#translatedText").val();

              if (glossaryTypeVietPhrase != undefined) {
                $("#glossaryType").val(glossaryTypeVietPhrase).change();
                glossaryTypeVietPhrase = undefined;
              }

              resize();
              $("#translateButton").removeAttr("disabled");
              $("#inputGlossary").removeAttr("disabled");
            } else {
              translate(service, sourceLang, targetLang, sentences, translation,
                  new Array(), index + 1, count - query.length);
            }
          }).fail(function (jqXHR, textStatus, errorThrown) {
            $("#translatedText").val(errorThrown);

            if (glossaryTypeVietPhrase != undefined) {
              $("#glossaryType").val(glossaryTypeVietPhrase).change();
              glossaryTypeVietPhrase = undefined;
            }

            resize();
            $("#translateButton").removeAttr("disabled");
            $("#inputGlossary").removeAttr("disabled");
          });

          break;

        case Services.GOOGLE:
          queryIndex += 1;
          //GET https://translate.googleapis.com/translate_a/t?anno=3&client=wt_lib&format=html&v=1.0&key&logId=vTE_2021115&sl=auto&tl=${targetLang}&tc=1&sr=1&tk=463587.741203892&mode=1 Content-Type	application/x-www-form-urlencoded - send(query)
          //POST https://translate.googleapis.com/translate_a/t?anno=3&client=te&format=html&v=1.0&key&logId=vTE_2021115&sl=auto&tl=${targetLang}&tc=1&ctt=1&dom=1&sr=1&tk=463587.741203892&mode=1 Content-Type: application/x-www-form-urlencoded - send(query)
          //GET https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&hl=vi&dt=t&dt=bd&dj=1${query}
          //GET https://clients5.google.com/translate_a/single?dj=1&dt=t&dt=sp&dt=ld&dt=bd&client=dict-chrome-ex&sl=auto&tl=${targetLang}${query}
          //GET https://translate.google.com/translate_t?source=dict-chrome-ex&sl=auto&tl=${targetLang}${query}
          settings = {
            crossDomain: true,
            url:
                `https://translate.googleapis.com/translate_a/t?anno=3&client=gtx&format=html&v=1.0&key&logId=vTE_2021115&sl=${sourceLang}&tl=${targetLang}&tc=${queryIndex}&sr=1&mode=1`,
            method: 'GET',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            processData: false,
            data: encodeURI(textPreProcess(`q=${query.join('&q=')}`, service, false))
          };

          $.ajax(settings).done(function (data) {
            if (sourceLang === 'auto') {
              var translations = new Array();
              data.forEach((element) =>
                  translations.push(element[0].replace(/<b><i>/g,
                  '[').replace(/<\/i><\/b>/g, ']')));

              translation += translations.join('\r\n');
            } else {
              translation += data.join('\r\n');
            }

            if (count - query.length === 0) {
              $("#translatedText").val(textPostProcess(translation, service));
              googleQuery = textPreProcess(sentences.join('\r\n'), service, true);
              googleLang = [
                sourceLang,
                targetLang,
              ];

              googleTranslation = $("#translatedText").val();

              if (glossaryTypeVietPhrase != undefined) {
                $("#glossaryType").val(glossaryTypeVietPhrase).change();
                glossaryTypeVietPhrase = undefined;
              }

              resize();
              $("#translateButton").removeAttr("disabled");
              $("#inputGlossary").removeAttr("disabled");
            } else {
              translate(service, sourceLang, targetLang, sentences, translation,
                  new Array(), index + 1, count - query.length);
            }
          }).fail(function (jqXHR, textStatus, errorThrown) {
            $("#translatedText").val(errorThrown);

            if (glossaryTypeVietPhrase != undefined) {
              $("#glossaryType").val(glossaryTypeVietPhrase).change();
              glossaryTypeVietPhrase = undefined;
            }

            resize();
            $("#translateButton").removeAttr("disabled");
            $("#inputGlossary").removeAttr("disabled");
          });

          break;
      }
    } else {
      translate(service, sourceLang, targetLang, sentences, translation, query,
          index + 1, count);
    }
  }
}

function getMicrosoftLanguageCode(languageCode) {
  return languageCode.replace('auto', '').replace('CN', 'CHS').replace('TW', 'CHT');
}

function textPreProcess(text, service, pre) {
  var glossaryText = text;

  if (glossary != undefined) {
    let glossaryList = glossary.filter((element) => glossaryText.includes(element[0]));

    for (let i = 0; i < glossaryList.length; i++) {
      if (pre) {
        glossaryText =
            glossaryText.replace(new RegExp(glossaryList[i][0], 'g'), glossaryList[i][1]);
      } else if (service === 'microsoft') {
        glossaryText =
            glossaryText.replace(new RegExp(glossaryList[i][0], 'g'),
            `<mstrans:dictionary translation="${glossaryList[i][1]}">GLOSSARY_INDEX_${i}</mstrans:dictionary>`);
      } else {
        glossaryText =
            glossaryText.replace(new RegExp(glossaryList[i][0], 'g'),
            `<span class="notranslate">GLOSSARY_INDEX_${i}</span>`);
      }
    }

    for (let i = glossaryList.length - 1; pre === false && i >= 0; i--) {
      glossaryText =
          glossaryText.replace(new RegExp(`GLOSSARY_INDEX_${i}`, 'g'), glossaryList[i][0]);
    }
  }

  return glossaryText;
}

function textPostProcess(text, service) {
  var glossaryText = text;

  if (glossary != undefined && service !== Services.MICROSOFT) {
    let glossaryMap = new Map(glossary.filter((element) => glossaryText.includes(element[0])));

    for (let [key, value] of glossaryMap.entries()) {
      glossaryText =
          glossaryText.replace(/<span class="notranslate">/g, ' ').replace(/<\/span>/g,
          ' ').replace(/(\s)\s/g, '$1').replace(new RegExp(key, 'g'), value).trim();
    }
  }

  return glossaryText;
}

function resize() {
  $("main.container textarea").css("height", "auto");

  let height = [
    $("#queryText").prop("scrollHeight"),
    $("#translatedText").prop("scrollHeight"),
  ].sort((a, b) => b - a)[0];

  if (height > 300) {
    $("main.container textarea").css("height", height.toString().concat('px'));
  }
}