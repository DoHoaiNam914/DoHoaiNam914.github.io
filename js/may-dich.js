const Services = {
  GOOGLE: 'google',
  MICROSOFT: 'microsoft',
  PAPAGO: 'papago'
};

$("#queryText").on("input", function () {
  $("#queryTextCounter").text($("#queryText").val().length);
});

$("#translateButton").on("click", function () {
  if ($("#translateButton").text() === 'Dịch') {
    let service = $(".service.active").attr("id");

    var sourceLang = $("#sourceLangSelect").val();
    var targetLang = $("#targetLangSelect").val();

    if (service === Services.MICROSOFT) {
      sourceLang = getMicrosoftLanguageCode(sourceLang);
      targetLang = getMicrosoftLanguageCode(targetLang);
    }

    let sentences = $("#queryText").val().split(/\r?\n/);

    if ($("#queryText").val().length > 0) {
      $(this).attr("disabled", true);
      $("#inputGlossary").attr("disabled", true);
      $("#translatedText").html(null);
      translate(service, sourceLang, targetLang, sentences);
      $("#queryText").hide();
      $("#translatedText").show();
    }
  } else if ($("#translateButton").text() === 'Sửa') {
    $("#translatedText").hide();
    $("#queryText").show();
    $("#translateButton").text("Dịch");
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

$("main.container .textarea").on("input", function () {
  resize();
});

async function translate(service, sourceLang, targetLang, sentences) {
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
          'source': sourceLang,
          'target': targetLang,
          'text': textPreProcess(sentences.join('\n'), service)
        })
      };

      $.ajax(settings).done(function (data) {
        var combine = [];
        
        for (let i = 0; i < sentences.length; i++) {
          combine.push([sentences[i], data.translatedText.split(/\n/)[i]]);
        }

        $("#translatedText").html(textPostProcess(('<p>' + combine.map((sentence) => sentence[0] == sentence[1] ? sentence[0] : sentence.join('\n')).join('\n').replace(/(\n)/g, '</p>$1<p>') + '</p>').replace(/(<p>)(<\/p>)/g, '$1<br>$2'), service));
        resize();
        $("#translateButton").removeAttr("disabled");
        $("#inputGlossary").removeAttr("disabled");
        $("#translateButton").text("Sửa");
      }).fail(function (jqXHR, textStatus, errorThrown) {
        $("#translatedText").html(`<p>${jqXHR}</p>\n<p>${errorThrown}</p>`);
        resize();
        $("#translateButton").removeAttr("disabled");
        $("#inputGlossary").removeAttr("disabled");
        $("#translateButton").text("Sửa");
      });

      break;

    case Services.MICROSOFT:
      let accessToken = await fetch('https://edge.microsoft.com/translate/auth')
          .then((response) => response.text());

      if (accessToken == undefined) {
        $("#translatedText").html('Không thể lấy được Access Token từ máy chủ.');
        resize();
        $("#translateButton").removeAttr("disabled");
        $("#inputGlossary").removeAttr("disabled");
        $("#translateButton").text("Sửa");
        break;
      }

      //POST https://api.cognitive.microsofttranslator.com/translate?to=${toLang}&api-version=3.0&includeSentenceLength=true Authorization: Bearer ${accessToken} - Content-Type: application/json - send(data)
      settings = {
        crossDomain: true,
        url: `https://api.cognitive.microsofttranslator.com/translate?from=${sourceLang}&to=${targetLang}&api-version=3.0&textType=html&includeSentenceLength=true`,
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        processData: false,
        data: JSON.stringify([{
              "Text":textPreProcess(sentences.join('\n'), service)
        }])
      };

      $.ajax(settings).done(function (data) {
        var combine = [];
        
        for (let i = 0; i < sentences.length; i++) {
          combine.push([sentences[i], data[0].translations[0].text.split(/\n/)[i]]);
        }

        $("#translatedText").html(textPostProcess(('<p>' + combine.map((sentence) => sentence[0] == sentence[1] ? sentence[0] : sentence.join('\n')).join('\n').replace(/(\n)/g, '</p>$1<p>') + '</p>').replace(/(<p>)(<\/p>)/g, '$1<br>$2'), service));
        resize();
        $("#translateButton").removeAttr("disabled");
        $("#inputGlossary").removeAttr("disabled");
        $("#translateButton").text("Sửa");
      }).fail(function (jqXHR, textStatus, errorThrown) {
        $("#translatedText").html(`<p>${jqXHR}</p>\n<p>${errorThrown}</p>`);
        resize();
        $("#translateButton").removeAttr("disabled");
        $("#inputGlossary").removeAttr("disabled");
        $("#translateButton").text("Sửa");
      });

      break;

    case Services.GOOGLE:
      //GET https://translate.googleapis.com/translate_a/t?anno=3&client=wt_lib&format=html&v=1.0&key&logId=vTE_20230206&sl=auto&tl=${targetLang}&tc=1&sr=1&tk=419495.97493&mode=1 Content-Type: application/x-www-form-urlencoded - send(query)
      //POST https://translate.googleapis.com/translate_a/t?anno=3&client=te&format=html&v=1.0&key&logId=vTE_20230206&sl=auto&tl=${targetLang}&tc=1&ctt=1&dom=1&sr=1&tk=895688.700602&mode=1 Content-Type: application/x-www-form-urlencoded - send(query)
      //GET https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&hl=vi&dt=t&dt=bd&dj=1${query}
      //GET https://clients5.google.com/translate_a/single?dj=1&dt=t&dt=sp&dt=ld&dt=bd&client=dict-chrome-ex&sl=auto&tl=${targetLang}${query}
      //GET https://translate.google.com/translate_t?source=dict-chrome-ex&sl=auto&tl=${targetLang}${query}
      settings = {
        crossDomain: true,
        url: `https://translate.googleapis.com/translate_a/t?anno=3&client=gtx&format=html&v=1.0&key&logId=vTE_20230206&sl=${sourceLang}&tl=${targetLang}&tc=1&sr=1&tk=419495.97493&mode=1`,
        method: 'GET',
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        processData: false,
        data: 'q=' + encodeURI(textPreProcess(sentences.join('&q='), service))
      };

      $.ajax(settings).done(function (data) {
        var combine = [];

        data.forEach(function (sentencesTrans, index) {
          $("#translatedText").append(textPostProcess(('<p>' + sentences[index] + '</p><p>' + (sourceLang === 'auto' ? sentencesTrans[0] : sentencesTrans) + '</p>').replace(/(<p>)(<\/p>)/g, '$1<br>$2'), service));
        });
  
        resize();
        $("#translateButton").removeAttr("disabled");
        $("#inputGlossary").removeAttr("disabled");
        $("#translateButton").text("Sửa");
      }).fail(function (jqXHR, textStatus, errorThrown) {
        if (textPreProcess($("#queryText").val(), service).length > 2000) {
          $("#translatedText").html('Độ dài văn bản tối đa là 2000 ký tự. Lưu ý: Khi dùng từ vựng thì độ dài văn bản tối đa sẽ ngắn hơn bình thường!');
        } else {
          $("#translatedText").html(`<p>${jqXHR}</p>\n<p>${errorThrown}</p>`);
        }

        resize();
        $("#translateButton").removeAttr("disabled");
        $("#inputGlossary").removeAttr("disabled");
        $("#translateButton").text("Sửa");
      });

      break;
  }
}

function getMicrosoftLanguageCode(languageCode) {
  return languageCode.replace('auto', '').replace('CN', 'CHS').replace('TW', 'CHT');
}

function textPreProcess(text, service) {
  var newText = text;

  if (glossary != undefined) {
    let glossaryList = [...glossary].reverse().filter((phrase) => newText.includes(phrase[0]));

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
    let glossaryMap = new Map([...glossary].reverse().filter((phrase) => newText.includes(phrase[0])));

    for (let [key, value] of glossaryMap.entries()) {
      newText = newText.replace(/<span class="notranslate">/g, '').replace(/<\/span>/g, '').replace(new RegExp(key, 'g'), value);
    }
  }

  return newText;
}

function resize() {
  $("main.container .textarea").css("height", "auto");

  let height = [
    $("#queryText").prop("scrollHeight"),
    $("#translatedText").prop("scrollHeight")
  ].sort((a, b) => b - a)[0];

  if (height > 300) {
    $("main.container .textarea").css("height", height.toString().concat('px'));
  }
}