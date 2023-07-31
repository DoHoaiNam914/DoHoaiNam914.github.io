'use strict';

let localGlossary =  JSON.parse(localStorage.getItem("glossary")) || {type: $("#glossaryType").val(), data: []};

var glossary = [];

$("#glossaryManagerButton").on("mousedown", () => {
  $("#glossaryList").val(-1).change();
  $("#sourceEntry").val(getSelectedTextOrActiveElementText()).trigger("input");
});

$("#inputGlossary").on("change", function () {
  const reader = new FileReader();

  reader.onload = function () {
    switch ($("#inputGlossary").prop("files")[0].type) {
      case GlossaryType.CSV:
        glossary = $.csv.toArrays(this.result);
        break;

      case GlossaryType.TSV:
        glossary = this.result.split(/\r?\n/).map((phrase) => phrase.split(/\t/)).filter((phrase) => phrase.length >= 2);
        break;

      case 'text/plain':
        glossary = this.result.split(/\r?\n/).map((phrase) => phrase.split('=')).filter((phrase) => phrase.length >= 2);
        break;
    }

    $("#glossaryType").val($("#inputGlossary").prop("files")[0].type.replace('text/plain', GlossaryType.TSV));
    $("#glossaryName").val($("#inputGlossary").prop("files")[0].name.split('.').slice(0, $("#inputGlossary").prop("files")[0].name.split('.').length - 1).join('.'));
    loadGlossary(); 
  };

  reader.readAsText($(this).prop("files")[0]);
});

$("#clearGlossaryButton").on("click", function () {
  if (window.confirm("Bạn có muốn xoá tập từ vựng này chứ?")) {
    glossary = [];
    loadGlossary();
    $("#inputGlossary").val(null);
  }
});

$("#glossaryType").change(() => loadGlossary());

$("#sourceEntry").on("input", function () {
  const glossaryMap = new Map(glossary);

  if ($(this).val().length > 0) {
    $("#targetEntry").val(getConvertedChineseText(new Map([...glossary, ...[...sinoVietnameses].filter((character) => !glossaryMap.has(character[0]))].sort((a, b) => b[0].length - a[0].length)), $(this).val()));

    if (glossaryMap.has($(this).val())) {
      $("#glossaryList").val([...glossaryMap.keys()].indexOf($(this).val()));
    } else {
      $("#glossaryList").val(-1);
    }
  } else {
    $("#glossaryList").val(-1).change();
  }
});

$(".dropdown-toggle").on("click", () => { $(".dropdown-scroller").scrollTop(0); });

$("#sourceEntryMenu").on("mousedown", (event) => event.preventDefault());

$("#clearSourceTextButton").on("click", () => $("#sourceEntry").val(null).trigger("input"));

$("#copySourceTextButton").on("click", () => navigator.clipboard.writeText($("#sourceEntry").val()));

$("#pasteSourceTextButton").on("click", () => {
  navigator.clipboard
    .readText()
    .then((clipText) => {
      $("#sourceEntry").val(clipText).trigger("input");
    });
});;

$("#lacvietdictionaryButton").on("click", function () {
  if ($("#sourceEntry").val().length > 0) {
    window.open(`http://mobile.coviet.vn/tratu.aspx?k=${encodeURIComponent(($("#sourceEntry").val().substring($("#sourceEntry").prop("selectionStart"), $("#sourceEntry").prop("selectionEnd")) || $("#sourceEntry").val()).substring(0, 30))}&t=ALL`);
  }
});

$("#hvdicButton").on("click", function () {
  if ($("#sourceEntry").val().length > 0) {
    window.open(`https://hvdic.thivien.net/whv/${encodeURIComponent(($("#sourceEntry").val().substring($("#sourceEntry").prop("selectionStart"), $("#sourceEntry").prop("selectionEnd")) || $("#sourceEntry").val()).substring(0, 30))}`);
  }
});

$("#googleButton").on("click", function () {
  if ($("#sourceEntry").val().length > 0) {
    window.open(`https://www.google.com.vn/search?q=${encodeURIComponent(($("#sourceEntry").val().substring($("#sourceEntry").prop("selectionStart"), $("#sourceEntry").prop("selectionEnd")) || $("#sourceEntry").val()).substring(0, 30))}`);
  }
});

$("#wikipediaButton").on("click", function () {
  if ($("#sourceEntry").val().length > 0) {
    window.open(`https://vi.wikipedia.org/w/?search=${encodeURIComponent(($("#sourceEntry").val().substring($("#sourceEntry").prop("selectionStart"), $("#sourceEntry").prop("selectionEnd")) || $("#sourceEntry").val()).substring(0, 30))}&ns0=1`);
  }
});

$("#baiduButton").on("click", function () {
  if ($("#sourceEntry").val().length > 0) {
    window.open(`https://www.baidu.com/s?wd=${encodeURIComponent(($("#sourceEntry").val().substring($("#sourceEntry").prop("selectionStart"), $("#sourceEntry").prop("selectionEnd")) || $("#sourceEntry").val()).substring(0, 30))}`);
  }
});

$("#deepltranslatorButton").on("click", function () {
  if ($("#sourceEntry").val().length > 0) {
    window.open(`https://www.deepl.com/translator#auto/en/${encodeURIComponent($("#sourceEntry").val())}`);
  }
});

$("#googletranslateButton").on("click", function () {
  if ($("#sourceEntry").val().length > 0) {
    window.open(`https://translate.google.com/?sl=auto&tl=vi&text=${encodeURIComponent($("#sourceEntry").val())}&op=translate`);
  }
});

$("#papagoButton").on("click", function () {
  if ($("#sourceEntry").val().length > 0) {
    window.open(`https://papago.naver.com/?sk=auto&tk=vi&st=${encodeURIComponent($("#sourceEntry").val())}`);
  }
});

$("#bingtranslatorButton").on("click", function () {
  if ($("#sourceEntry").val().length > 0) {
    window.open(`https://www.bing.com/translator?from=auto-detect&to=vi&text=${encodeURIComponent($("#sourceEntry").val())}`);
  }
});

$("#addButton").on("click", function () {
  if ($("#sourceEntry").val().length > 0) {
    const glossaryMap = new Map(glossary);
    glossaryMap.delete($("#sourceEntry").val().trim());
    glossaryMap.set($("#sourceEntry").val().trim(), $("#targetEntry").val().trim());
    glossary = [...glossaryMap];
    loadGlossary();
    $("#sourceEntry").val(null);
    $("#targetEntry").val(null);
    $("#inputGlossary").val(null);
  }
});

$("#copyTargetTextButton").on("click", () => navigator.clipboard.writeText($("#targetEntry").val()));

$("#pasteTargetTextButton").on("click", () => {
  navigator.clipboard
    .readText()
    .then((clipText) => {
      $("#targetEntry").val(clipText).trigger("input");
    });
});

$(".upperCaseFromAmountButton").on("click", function () {
  if ($("#targetEntry").val().length > 0) {
    $("#targetEntry").val($("#targetEntry").val().split(' ').map((word, index) => (index < $(this).data("amount") && word.charAt(0).toUpperCase() + word.slice(1)) || word.toLowerCase()).join(' '));
  }
});

$(".upperCaseAllButton").on("click", function () {
  if ($("#targetEntry").val().length > 0) {
    $("#targetEntry").val($("#targetEntry").val().split(' ').map((word, index) => word = word.charAt(0).toUpperCase() + word.slice(1)).join(' '));
  }
});

$("#pinyinConvertButton").on("click", function () {
  if ($("#sourceEntry").val().length > 0) {
    $("#targetEntry").val(getConvertedChineseText(new Map([...pinyins].sort((a, b) => b[0].length - a[0].length)), $("#sourceEntry").val()));
  }
});

$("#sinoVietnameseConvertButton").click(function () {
  if ($("#sourceEntry").val().length > 0) {
    $("#targetEntry").val(getConvertedChineseText(new Map([...sinoVietnameses].sort((a, b) => b[0].length - a[0].length)), $("#sourceEntry").val()));
  }
});

$(".deepl-convert").on("click", async function () {
  if ($("#sourceEntry").val().length > 0) {
    $("#sourceEntry").attr("readonly", true);
    $(".convert").addClass("disabled");

    try {
      const translatedText = await DeepLTranslator.translateText(DEEPL_AUTH_KEY, $("#sourceEntry").val(), '', $(this).data("lang"), true);

      $("#targetEntry").val(translatedText);
      $(".convert").removeClass("disabled");
      $("#sourceEntry").removeAttr("readonly");
    } catch (error) {
      $("#targetEntry").val('Bản dịch thất bại: ' + JSON.stringify(error));
      $(".convert").removeClass("disabled");
      $("#sourceEntry").removeAttr("readonly");
    }
  }
});

$(".google-convert").on("click", async function () {
  if ($("#sourceEntry").val().length > 0) {
    $("#sourceEntry").attr("readonly", true);
    $(".convert").addClass("disabled");

    try {
      const elementJs = await $.get("https://corsproxy.io/?https://translate.google.com/translate_a/element.js?hl=vi&client=wt");

      const version = elementJs != undefined ? elementJs.match(/_exportVersion\('(TE_\d+)'\)/)[1] : null;
      const ctkk = elementJs != undefined ? elementJs.match(/c\._ctkk='(\d+\.\d+)'/)[1] : null;

      if (version == undefined && ctkk == undefined) {
        $("#targetEntry").val('Không thể lấy được Log ID hoặc Token từ máy chủ.');
        return;
      }

      const translatedText = await GoogleTranslate.translateText($("#sourceEntry").val(), version, ctkk, 'auto', $(this).data("lang"), true);

      $("#targetEntry").val(translatedText);
      $(".convert").removeClass("disabled");
      $("#sourceEntry").removeAttr("readonly");
    } catch (error) {
      $("#targetEntry").val('Bản dịch thất bại: ' + JSON.stringify(error));
      $(".convert").removeClass("disabled");
      $("#sourceEntry").removeAttr("readonly");
    }
  }
});

$(".microsoft-convert").on("click", async function () {
  if ($("#sourceEntry").val().length > 0) {
    $("#sourceEntry").attr("readonly", true);
    $(".convert").addClass("disabled");

    try {
      const accessToken = await $.get("https://edge.microsoft.com/translate/auth");

      if (accessToken == undefined) {
        $("#targetEntry").val('Không thể lấy được Access Token từ máy chủ.');
        return;
      }

      const translatedText = await MicrosoftTranslator.translateText(accessToken, $("#sourceEntry").val(), '', $(this).data("lang"), true);

      $("#targetEntry").val(translatedText);
      $(".convert").removeClass("disabled");
      $("#sourceEntry").removeAttr("readonly");
    } catch (error) {
      $("#targetEntry").val('Bản dịch thất bại: ' + JSON.stringify(error));
      $(".convert").removeClass("disabled");
      $("#sourceEntry").removeAttr("readonly");
    }
  }
});

$("#glossaryList").change(function () {
  if (parseInt(this.value) > -1) {
    const data = $("#glossaryList option:selected").text().split(/\t/);
    $("#sourceEntry").val(data[0]).trigger("input");
  } else {
    $("#sourceEntry").val("");
    $("#targetEntry").val("");
  }
});

$("#removeButton").on("click", function () {
  if (window.confirm('Bạn có muốn xoá từ (cụm từ) này chứ?') && parseInt($("#glossaryList").val()) > -1) {
    glossary.splice(parseInt($("#glossaryList").val()), 1);
    loadGlossary();
    $("#sinoVietnameseConvertButton").click();
    $("#inputGlossary").val(null);
  }
});

$("#preview").on("click", function () {
  if (glossary.length > 0) {
    this.select();
  }
});

$("#glossaryName").on("input", () => loadGlossary());

function getSelectedTextOrActiveElementText() {
  return window.getSelection().toString() || (document.activeElement.tagName.toLowerCase() == 'textarea' || (document.activeElement.tagName.toLowerCase() == 'input' && /^(?:text|search|password|tel|url)$/i.test(document.activeElement.type) && typeof document.activeElement.selectionStart == 'number') && document.activeElement.value.slice(document.activeElement.selectionStart, document.activeElement.selectionEnd)) || '';
}

function loadGlossary() {
  var data = ''; 
  var glossaryList = '<option value="-1" selected>Chọn...</option>';
  const glossaryType = $("#glossaryType").val();

  $("#fileExtension").text(glossaryType === GlossaryType.TSV ? "tsv" : (glossaryType === GlossaryType.CSV ? "csv" : "txt"));

  if (glossary.length > 0) {
    glossary = glossary.filter(([key])  => !glossary[key] && (glossary[key] = 1), {}).sort((a, b) => b[0].length - a[0].length || a[1].localeCompare(b[1]) || a[0].localeCompare(b[0]));

    glossary.forEach((element, index) => {
      glossaryList += `\n<option value="${index}">${element[0]}\t${element[1]}</option>`;
    });

    switch (glossaryType) {
      case GlossaryType.CSV:
        data = glossary.map((element) => `${element[0].includes(',') ? '"' + element[0].replace(/"/g, '""') + '"' : element[0].replace(/"/g, '"""')},${element[1].includes(',') ? '"' + element[1].replace(/"/g, '""') + '"' : element[1].replace(/"/g, '"""')}`).join('\n');
        break;

      case GlossaryType.TSV:
        data = glossary.map((element) => (element.length > 2 ? element.splice(2, glossary.length - 2) : element).join('\t')).join('\n');
        break;
    }

    $("#downloadButton").attr("href", URL.createObjectURL(new Blob([data], {type: glossaryType + ';charset=UTF-8'})));
    $("#downloadButton").attr("download", ($("#glossaryName").val().length > 0 ? $("#glossaryName").val() : 'Từ vựng') + '.' + $("#fileExtension").text());
  } else {
    $("#downloadButton").removeAttr("href");
    $("#downloadButton").removeAttr("download");
    $("#glossaryName").val(null);
  }

  if (glossary.length <= 50000) {
    $("#glossaryList").html(glossaryList);
    $("#preview").val(data);
  }

  $("#glossaryCounter").text(glossary.length);

  localStorage.setItem("glossary", JSON.stringify({type: glossaryType, data: Object.fromEntries(new Map(glossary))}));
  localGlossary = JSON.parse(localStorage.getItem("glossary"));
}

const GlossaryType = {
  TSV: 'text/tab-separated-values',
  CSV: 'text/csv',
};