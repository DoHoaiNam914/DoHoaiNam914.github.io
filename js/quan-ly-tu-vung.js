'use strict';

const GlossaryType = {
  TSV: 'text/tab-separated-values',
  CSV: 'text/csv',
  VIETPHRASE: 'text/plain'
};

var sinoVietnameses = new Map();
const markMap = new Map([
  ['　', ''],
  ['＿', '_'],
  ['—', '—'],
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
  ['「', ' “'],
  ['」', '” '],
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

var glossary = [];

$(document).ready(function () {
  $.get({
    crossDomain: false,
    url: "/datasource/ChinesePhienAmWords.txt",
    processData: false
  }).done(function (data) {
    sinoVietnameses = data.split(/\r?\n/).map((character) => character.split('=')).filter((character) => character.length >= 2);
    console.log('Đã tải xong bộ dữ liệu hán việt!');
  }).fail((jqXHR, textStatus, errorThrown) => window.location.reload());
});

$("#glossaryManagerButton").on("mousedown", function () {
  $("#glossaryList").val(-1).change();
  $("#sourceText").val(window.getSelection().toString()).trigger("input");
});

$("#inputGlossary").on("change", function () {
  const reader = new FileReader();

  reader.onload = function () {
    switch ($("#inputGlossary").prop("files")[0].type) {
      case GlossaryType.TSV:
        glossary = this.result.split(/\r?\n/).map((phrase) => phrase.split(/\t/)).filter((phrase) => phrase.length >= 2);
        break;

      case GlossaryType.CSV:
        glossary = $.csv.toArrays(this.result);
        break;

      case GlossaryType.VIETPHRASE:
        glossary = this.result.split(/\r?\n/).map((phrase) => phrase.split('=')).filter((phrase) => phrase.length >= 2);
        break;
    }

    $("#glossaryType").val($("#inputGlossary").prop("files")[0].type);
    $("#glossaryName").val($("#inputGlossary").prop("files")[0].name.split('.').slice(0, $("#inputGlossary").prop("files")[0].name.split('.').length - 1).join('.'));
    loadGlossary();
  };

  reader.readAsText($(this).prop("files")[0]);
});

$("#glossaryType").change(() => loadGlossary());

$("#sourceText").on("input", function () {
  const glossaryMap = new Map(glossary);
  const data = new Map([...glossaryMap, ...sinoVietnameses].sort((a, b) => b[0].length - a[0].length || a[0].localeCompare(b[0]) || a[1].localeCompare(b[1])));

  if ($(this).val().length > 0) {
    if (glossaryMap.has($(this).val())) {
      $("#glossaryList").val(Array.from(glossaryMap.keys()).indexOf($(this).val())).change();
    } else if (parseInt($("#glossaryList").val()) === -1) {
      var result = []; 
      var tempWord = '';

      for (let i = 0; i < $(this).val().length; i++) {
        if (/\p{sc=Hani}/u.test($(this).val()[i]) && !markMap.has($(this).val()[i])) {
          if (tempWord.length > 0 && i + 1 === $(this).val().length) {
            result.push(tempWord);
            tempWord = '';
          }

          for (let j = Array.from(data)[0][0].length; j >= 1; j--) {
            if (data.get($(this).val().substring(i, i + j)) != undefined) {
              result.push(data.get($(this).val().substring(i, i + j)) ?? $(this).val().substring(i, i + j));
              i += j - 1;
              break;
            }
          }
        } else {
          tempWord += $(this).val()[i];

          if ((tempWord.length > 0 && (/\p{sc=Hani}/u.test($(this).val()[i + 1]) && !markMap.has($(this).val()[i + 1])) || i + 1 === $(this).val().length)) {
            Array.from(markMap).forEach((mark) => tempWord = tempWord.replace(new RegExp(`\\s?(${mark[0]})\\s?`, 'g'), mark[1]).trim());
            tempWord.split(/\s/).forEach((word) => result.push(word));
            tempWord = '';
          }
        }
      }

      $("#targetText").val(result.join(' '));
    } else {
      $("#glossaryList").val(-1);
    }
  } else {
    $("#glossaryList").val(-1).change();
  }
});

$(".deepl-convert").on("click", function () {
  if ($("#sourceText").val().length > 0) {
    settings = {
      crossDomain: true,
      url: "https://api-free.deepl.com/v2/translate",
      method: "POST",
      processData: false,
      data: `auth_key=0c9649a5-e8f6-632a-9c42-a9eee160c330:fx&text=${$("#sourceText").val()}&target_lang=${$(this).data("lang")}`
    };

    $("#sourceText").attr("readonly", true);
    $(".convert").addClass("disabled");
    $.ajax(settings).done(function (data) {
      $("#targetText").val(data.translations[0].text);
      $(".convert").removeClass("disabled");
      $("#sourceText").removeAttr("readonly");
    }).fail(function (jqXHR, textStatus, errorThrown) {
      $(".convert").removeClass("disabled");
      $("#sourceText").removeAttr("readonly");
      console.error(jqXHR, textStatus, errorThrown);
    });
  }
});

$(".google-convert").on("click", function () {
  if ($("#sourceText").val().length > 0) {
    settings = {
      crossDomain: true,
      url: `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${$(this).data("lang")}&hl=vi&dt=t&dt=bd&dj=1&q=${$("#sourceText").val()}`,
      method: 'GET',
      processData: false,
    };

    $("#sourceText").attr("readonly", true);
    $(".convert").addClass("disabled");
    $.ajax(settings).done(function (data) {
      $("#targetText").val(data.sentences[0].trans);
      $(".convert").removeClass("disabled");
      $("#sourceText").removeAttr("readonly");
    }).fail(function (jqXHR, textStatus, errorThrown) {
      $(".convert").removeClass("disabled");
      $("#sourceText").removeAttr("readonly");
      console.error(jqXHR, textStatus, errorThrown);
    });
  }
});

$(".microsoft-convert").on("click", async function () {
  if ($("#sourceText").val().length > 0) {
    const accessToken = await fetch('https://edge.microsoft.com/translate/auth')
      .then((response) => response.text());

    if (accessToken == undefined) {
      console.error('Không thể lấy được Access Token từ máy chủ.');
      return;
    }

    settings = {
      crossDomain: true,
      url: `https://api.cognitive.microsofttranslator.com/translate?to=${$(this).data("lang")}&api-version=3.0&includeSentenceLength=true`,
      method: "POST",
      headers: {
        "Authorization": "Bearer " + accessToken,
        "Content-Type": "application/json"
      },
      processData: false,
      data: JSON.stringify([{
          "Text":$("#sourceText").val()
      }])
    };

    $("#sourceText").attr("readonly", true);
    $(".convert").addClass("disabled");
    $.ajax(settings).done(function (data) {
      $("#targetText").val(data[0].translations[0].text);
      $(".convert").removeClass("disabled");
      $("#sourceText").removeAttr("readonly");
    }).fail(function (jqXHR, textStatus, errorThrown) {
      $(".convert").removeClass("disabled");
      $("#sourceText").removeAttr("readonly");
      console.error(jqXHR, textStatus, errorThrown);
    });
  }
});

$("#addButton").on("click", function () {
  if ($("#sourceText").val().length > 0) {
    const glossaryMap = new Map(glossary);
    glossaryMap.delete($("#sourceText").val());
    glossaryMap.set($("#sourceText").val(), $("#targetText").val());
    glossary = Array.from(glossaryMap);
    loadGlossary();
    $("#inputGlossary").val(null);
  }
});

$(".upperCaseFromAmountButton").on("click", function () {
  if ($("#targetText").val().length > 0) {
    $("#targetText").val($("#targetText").val().split(' ').map((word, index) => (index < $(this).data("amount") && word.charAt(0).toUpperCase() + word.slice(1)) || word.toLowerCase()).join(' '));
  }
});

$(".upperCaseAllButton").on("click", function () {
  if ($("#targetText").val().length > 0) {
    $("#targetText").val($("#targetText").val().split(' ').map((word, index) => word = word.charAt(0).toUpperCase() + word.slice(1)).join(' '));
  }
});

$("#glossaryList").change(function () {
  if (parseInt(this.value) > -1) {
    const data = $("#glossaryList option:selected").text().split(/\t/);
    $("#sourceText").val(data[0]);
    $("#targetText").val(data[1]);
  } else {
    $("#sourceText").val(null);
    $("#targetText").val(null);
  }
});

$("#removeButton").on("click", function () {
  if (parseInt($("#glossaryList").val()) > -1) {
    glossary.splice(parseInt($("#glossaryList").val()), 1);
    loadGlossary();
    $("#inputGlossary").val(null);
  }
});

$("#preview").on("click", function () {
  if (glossary.length > 0) {
    this.select();
  }
});

$("#clearGlossaryButton").on("click", function () {
  glossary = [];
  loadGlossary()
  $("#inputGlossary").val(null);
});

$("#glossaryName").on("input", () => loadGlossary());

function loadGlossary() {
  var data = ''; 
  var glossaryList = '<option value="-1" selected>Chọn...</option>';
  const glossaryType = $("#glossaryType").val();

  $("#fileExtension").text(glossaryType === GlossaryType.TSV ? ".tsv" : (glossaryType === GlossaryType.CSV ? ".csv" : ".txt"));

  if (glossary.length > 0) {

    glossary = glossary.filter(function ([key]) {
      if (!this[key]) return this[key] = 1;
    }, {}).sort((a, b) =>
        b[0].length - a[0].length ||
        a[0].localeCompare(b[0]) ||
        a[1].localeCompare(b[1]));

    glossary.forEach((element, index) => glossaryList +=
        `\n<option value="${index}">${element[0]}\t${element[1]}</option>`);

    switch (glossaryType) {
      case GlossaryType.TSV:
        data = glossary.map((element) =>
            (element.length > 2 ? element.splice(2, glossary.length - 2) :
            element).join('\t')).join('\r\n');
        break;
      case GlossaryType.CSV:
        data = glossary.map((element) =>
            `${element[0].includes(',') ? '"' +
            element[0].replace(/"/g, '""') + '"' :
            element[0].replace(/"/g,
            '"""')},${element[1].includes(',') ? '"' +
            element[1].replace(/"/g, '""') + '"' :
            element[1].replace(/"/g, '"""')}`).join('\r\n');
        break;
      case GlossaryType.VIETPHRASE:
        data = glossary.map((element) =>
            (element.length > 2 ? element.splice(2, glossary.length - 2) :
            element).join('=')).join('\r\n');
        break;
    }

    $("#downloadButton").attr("href",
        `data:${glossaryType};charset=utf-8,${encodeURIComponent(data)}`);
    $("#downloadButton").attr("download", ($("#glossaryName").val().length > 0 ? $("#glossaryName").val() : 'Từ vựng') + $("#fileExtension").text());
  } else {
    $("#downloadButton").removeAttr("href");
    $("#downloadButton").removeAttr("download");
    $("#glossaryName").val(null);
  }

  if (glossary.length <= 20000) {
    $("#glossaryList").html(glossaryList);
    $("#preview").val(data);
  }

  $("#glossaryCounter").text(glossary.length);

  localStorage.setItem("glossary", JSON.stringify({type: glossaryType, data: Object.fromEntries(new Map(glossary))}));

  $("#sourceText").val(null);
  $("#targetText").val(null);
}