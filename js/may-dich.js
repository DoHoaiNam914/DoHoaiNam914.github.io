const Services = {
  GOOGLE: 'google',
  MICROSOFT: 'microsoft',
  PAPAGO: 'papago',
};

var googleQuery;
var googleLang;
var googleTranslation;

var queryIndex;

var microsoftQuery;
var microsoftLang;
var microsoftTranslation;

var papagoQuery;
var papagoLang;
var papagoTranslation;

$("#translateButton").on("click", function () {
  let service = $(".service.active").attr("id");
  let sourceLang =
      service === Services.MICROSOFT ?
      $("#sourceLangSelect").val().replace('auto',
      '').replace('CN', 'CHS').replace('TW', 'CHT') :
      $("#sourceLangSelect").val();
  let targetLang =
      service === Services.MICROSOFT ?
      $("#targetLangSelect").val().replace('CN',
      'CHS').replace('TW', 'CHT') :
      $("#targetLangSelect").val();
  let sentences = $("#queryText").val().split(/\n/);

  if (googleQuery != undefined &&
      service === Services.GOOGLE &&
      sourceLang === googleLang[0] &&
      targetLang === googleLang[1] &&
      textPreProcess(sentences.join(/\n/), service, true) ===
      googleQuery) {
    $("#translatedText").html(googleTranslation);
    resize();
  } else if (microsoftQuery != undefined &&
      service === Services.MICROSOFT &&
      sourceLang === microsoftLang[0] &&
      targetLang === microsoftLang[1] &&
      textPreProcess(sentences.join(/\n/), service, true) ===
      microsoftQuery) {
    $("#translatedText").html(microsoftTranslation);
    resize();
  } else if (papagoQuery != undefined &&
      service === Services.PAPAGO &&
      sourceLang === papagoLang[0] &&
      targetLang === papagoLang[1] &&
      textPreProcess(sentences.join(/\n/), service, true) ===
      papagoQuery) {
    $("#translatedText").html(papagoTranslation);
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

$(".textarea").on("input", function () {
  resize();
});

$("#translatedText").on("paste", function (e) {
  e.preventDefault();
  document.execCommand('insertText', false,
      e.clipboardData.getData('text/plain'));
});

function resize() {
  $(".textarea").css("height", "auto");

  let height = [
    $("#queryText").prop("scrollHeight"),
    $("#translatedText").prop("scrollHeight"),
  ].sort((a, b) => b - a)[0];

  $(".textarea").css("height", height > 300 ?
      height.toString().concat('px') : "auto");
}

async function translate(service, sourceLang, targetLang, sentences, translation, query, index, count) {
  if (index < sentences.length) {
    var queryLength = 50;

    switch (service) {
      case Services.PAPAGO:
        query.push(textPreProcess(sentences[index], service, false));
        queryLength = 10;
        break;

      case Services.MICROSOFT:
        query.push({
            "Text":textPreProcess(sentences[index], service, false)
        });

        break;

      case Services.GOOGLE:
        query.push(encodeURIComponent(textPreProcess(sentences[index], service, false)));
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
              'text' : query.join(/\n/)
            })
          };

          $.ajax(settings).done(function (data) {
            translation +=
                `<p>${data.translatedText.replace(/\n/g,
                '</p>\n<p>')}</p>`.replace(/<p><\/p>/g,
                '<p><br></p>');

            if (count - query.length === 0) {
              $("#translatedText").html(textPostProcess(translation, service));
              papagoQuery = textPreProcess(sentences.join(/\n/), service, true);
              papagoLang = [
                sourceLang,
                targetLang,
              ];

              papagoTranslation = $("#translatedText").html();
              resize();
              $("#translateButton").removeAttr("disabled");
              $("#inputGlossary").removeAttr("disabled");
            } else {
              translate(service, sourceLang, targetLang, sentences, translation,
                  new Array(), index + 1, count - query.length);
            }
          }).fail(function (jqXHR, textStatus, errorThrown) {
            $("#translatedText").html(errorThrown);
            resize();
            $("#translateButton").removeAttr("disabled");
            $("#inputGlossary").removeAttr("disabled");
          });

          break;

        case Services.MICROSOFT:
          let accessToken = await
              fetch('https://edge.microsoft.com/translate/auth')
              .then((response) => response.text());

          if (accessToken == undefined) {
            $("#translatedText").html('Không thể lấy được Access Token từ máy chủ.');
            resize();
            $("#translateButton").removeAttr("disabled");
            $("#inputGlossary").removeAttr("disabled");
            break;
          }

          //POST https://api.cognitive.microsofttranslator.com/translate?to=${toLang}&api-version=3.0&includeSentenceLength=true Authorization: Bearer ${accessToken} - Content-Type: application/json - send(data)
          settings = {
            crossDomain: true,
            url: `https://api.cognitive.microsofttranslator.com/translate?from=${sourceLang.replace('auto',
                '').replace('CN', 'CHS').replace('TW',
                'CHT')}&to=${targetLang.replace('CN', 'CHS').replace('TW',
                'CHT')}&api-version=3.0&textType=html&includeSentenceLength=true`,
            method: "POST",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json"
            },
            processData: false,
            data: JSON.stringify(query)
          };

          $.ajax(settings).done(function (data) {
            var translations = new Array();
            data.forEach((element) =>
                translations.push(element.translations[0].text));

            translation +=
                `<p>${translations.join('</p>\n<p>')}</p>`.replace(/<p><\/p>/g,
                '<p><br></p>');

            if (count - query.length === 0) {
              $("#translatedText").html(textPostProcess(translation, service));
              microsoftQuery = textPreProcess(sentences.join(/\n/), service, true);
              microsoftLang = [
                sourceLang.replace('auto', '').replace('CN',
                    'CHS').replace('TW', 'CHT'),
                targetLang.replace('CN', 'CHS').replace('TW', 'CHT'),
              ];

              microsoftTranslation = $("#translatedText").html();
              resize();
              $("#translateButton").removeAttr("disabled");
              $("#inputGlossary").removeAttr("disabled");
            } else {
              translate(service, sourceLang, targetLang, sentences, translation,
                  new Array(), index + 1, count - query.length);
            }
          }).fail(function (jqXHR, textStatus, errorThrown) {
            $("#translatedText").html(errorThrown);
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
            url: `https://translate.googleapis.com/translate_a/t?anno=3&client=gtx&format=html&v=1.0&key&logId=vTE_2021115&sl=${sourceLang}&tl=${targetLang}&tc=${queryIndex}&sr=1&mode=1`,
            method: 'GET',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            processData: false,
            data: `q=${query.join('&q=')}`
          };

          $.ajax(settings).done(function (data) {
            if (sourceLang === 'auto') {
              var translations = new Array();
              data.forEach((element) =>
                  translations.push(element[0].replace(/<b><i>/g,
                  '[').replace(/<\/i><\/b>/g, ']')));

              translation +=
                  `<p>${translations.join('</p>\n<p>')}</p>`.replace(/<p><\/p>/g,
                  '<p><br></p>');
            } else {
              translation +=
                  `<p>${data.join('</p>\n<p>')}</p>`.replace(/<p><\/p>/g,
                  '<p><br></p>');
            }

            if (count - query.length === 0) {
              $("#translatedText").html(textPostProcess(translation, service));
              googleQuery = textPreProcess(sentences.join(/\n/), service, true);
              googleLang = [
                sourceLang,
                targetLang,
              ];

              googleTranslation = $("#translatedText").html();
              resize();
              $("#translateButton").removeAttr("disabled");
              $("#inputGlossary").removeAttr("disabled");
            } else {
              translate(service, sourceLang, targetLang, sentences, translation,
                  new Array(), index + 1, count - query.length);
            }
          }).fail(function (jqXHR, textStatus, errorThrown) {
            $("#translatedText").html(errorThrown);
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

function textPreProcess(text, service, pre) {
  var glossaryText = text;

  if (glossary != undefined) {
    for (let element of glossary) {
      if (pre) {
        glossaryText =
            glossaryText.replace(new RegExp(element[0], 'g'), element[1]);
      } else if (service === 'microsoft') {
        glossaryText =
            glossaryText.replace(new RegExp(element[0], 'g'),
            `<mstrans:dictionary translation="${element[1]}">GLOSSARY_INDEX_${i}</mstrans:dictionary>`)
      } else {
        glossaryText =
            glossaryText.replace(new RegExp(element[0], 'g'),
            `<span class="notranslate">GLOSSARY_INDEX_${i}</span>`);
      }
    }

    for (let i = glossary.size - 1; pre === false && i >= 1; i--) {
      glossaryText =
          glossaryText.replace(new RegExp(`GLOSSARY_INDEX_${i}`, 'g'), glossary[i][0]);
    }
  }

  return glossaryText;
}

function textPostProcess(text, service) {
  var glossaryText = text;

  if (glossary != undefined && service !== Services.MICROSOFT) {
    for (let element of glossary) {
      glossaryText =
          glossaryText.replace(/<span class="notranslate">/g, ' ').replace(/<\/span>/g,
          ' ').replace(/(\s)\s/g, '$1').replace(new RegExp(element[0], 'g'),
          element[1]).trim();
    }
  }

  return glossaryText;
}