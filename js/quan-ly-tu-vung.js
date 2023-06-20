'use strict';

const GlossaryType = {
  TSV: 'text/tab-separated-values',
  CSV: 'text/csv',
};

var glossary = [];

$("#glossaryManagerButton").on("mousedown", function () {
  $("#glossaryList").val(-1).change();
  $("#sourceText").val(window.getSelection().toString()).trigger("input");
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
    loadGlossary()
    $("#inputGlossary").val(null);
  }
});

$("#glossaryType").change(() => loadGlossary());

$("#sourceText").on("input", function () {
  const glossaryMap = new Map(glossary);

  if ($(this).val().length > 0) {
    $("#targetText").val(getConvertedChineseText(new Map((glossary.length > 0 ?glossary.concat(Array.from(sinoVietnameses)) : Array.from(sinoVietnameses)).sort((a, b) => b[0].length - a[0].length)), $(this).val()));

    if (glossaryMap.has($(this).val())) {
      $("#glossaryList").val(Array.from(glossaryMap.keys()).indexOf($(this).val()));
    } else {
      $("#glossaryList").val(-1);
    }
  } else {
    $("#glossaryList").val(-1).change();
  }
});

$(".dropdown-toggle").on("click", () => { $(".dropdown-scroller").scrollTop(0); });

$("#sourceTextMenu").on("mousedown", (event) => event.preventDefault());

$("#clearSourceTextButton").on("click", () => $("#sourceText").val(null).trigger("input"));

$("#copySourceTextButton").on("click", () => navigator.clipboard.writeText($("#sourceText").val()));

$("#pasteSourceTextButton").on("click", () => {
  navigator.clipboard
    .readText()
    .then((clipText) => {
      $("#sourceText").val(clipText).trigger("input");
    });
});;

$("#lacvietdictionaryButton").on("click", function () {
  if ($("#sourceText").val().length > 0) {
    window.open(`http://mobile.coviet.vn/tratu.aspx?k=${encodeURIComponent($("#sourceText").val().substring($("#sourceText").prop("selectionStart"), $("#sourceText").prop("selectionEnd")) || $("#sourceText").val())}&t=ALL`);
  }
});

$("#nomfoundationButton").on("click", function () {
  if ($("#sourceText").val().length > 0) {
    window.open(`http://www.nomfoundation.org/nom-tools/Nom-Lookup-Tool/Nom-Lookup-Tool?uiLang=en&input_type=rqn_or_hn&inputText=${encodeURIComponent($("#sourceText").val().substring($("#sourceText").prop("selectionStart"), $("#sourceText").prop("selectionEnd")) || $("#sourceText").val())}`);
  }
});

$("#hvdicButton").on("click", function () {
  if ($("#sourceText").val().length > 0) {
    window.open(`https://hvdic.thivien.net/whv/${encodeURIComponent($("#sourceText").val().substring($("#sourceText").prop("selectionStart"), $("#sourceText").prop("selectionEnd")) || $("#sourceText").val())}`);
  }
});

$("#googleButton").on("click", function () {
  if ($("#sourceText").val().length > 0) {
    window.open(`https://www.google.com/search?q=${encodeURIComponent($("#sourceText").val().substring($("#sourceText").prop("selectionStart"), $("#sourceText").prop("selectionEnd")) || $("#sourceText").val())}`);
  }
});

$("#baiduButton").on("click", function () {
  if ($("#sourceText").val().length > 0) {
    window.open(`https://www.baidu.com/s?wd=${encodeURIComponent($("#sourceText").val().substring($("#sourceText").prop("selectionStart"), $("#sourceText").prop("selectionEnd")) || $("#sourceText").val())}`);
  }
});

$("#deepltranslatorButton").on("click", function () {
  if ($("#sourceText").val().length > 0) {
    window.open(`https://www.deepl.com/translator#auto/en/${encodeURIComponent($("#sourceText").val())}`);
  }
});

$("#googletranslateButton").on("click", function () {
  if ($("#sourceText").val().length > 0) {
    window.open(`https://translate.google.com/?sl=auto&tl=vi&text=${encodeURIComponent($("#sourceText").val())}&op=translate`);
  }
});

$("#papagoButton").on("click", function () {
  if ($("#sourceText").val().length > 0) {
    window.open(`https://papago.naver.com/?sk=auto&tk=vi&st=${encodeURIComponent($("#sourceText").val())}`);
  }
});

$("#bingtranslatorButton").on("click", function () {
  if ($("#sourceText").val().length > 0) {
    window.open(`https://www.bing.com/translator?from=&to=vi&text=${encodeURIComponent($("#sourceText").val())}`);
  }
});

$("#addButton").on("click", function () {
  if ($("#sourceText").val().length > 0) {
    const glossaryMap = new Map(glossary);
    glossaryMap.delete($("#sourceText").val());
    glossaryMap.set($("#sourceText").val(), $("#targetText").val());
    glossary = Array.from(glossaryMap);
    loadGlossary();
    $("#sourceText").val(null);
    $("#targetText").val(null);
    $("#inputGlossary").val(null);
  }
});

$("#copyTargetTextButton").on("click", () => navigator.clipboard.writeText($("#targetText").val()));

$("#pasteTargetTextButton").on("click", () => {
  navigator.clipboard
    .readText()
    .then((clipText) => {
      $("#targetText").val(clipText).trigger("input");
    });
});

$("#pinyinConvertButton").on("click", function () {
  if ($("#sourceText").val().length > 0) {
    $("#targetText").val(getConvertedChineseText(new Map(Array.from(pinyins).sort((a, b) => b[0].length - a[0].length)), $("#sourceText").val()));
  }
});

$("#sinoVietnameseConvertButton").click(function () {
  if ($("#sourceText").val().length > 0) {
    $("#targetText").val(getConvertedChineseText(new Map(Array.from(sinoVietnameses).sort((a, b) => b[0].length - a[0].length)), $("#sourceText").val()));
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

$(".deepl-convert").on("click", async function () {
  if ($("#sourceText").val().length > 0) {
    $("#sourceText").attr("readonly", true);
    $(".convert").addClass("disabled");

    try {
      const translatedText = await DeepLTranslator.translateText($("#sourceText").val(), '', $(this).data("lang"));

      $("#targetText").val(translatedText);
      $(".convert").removeClass("disabled");
      $("#sourceText").removeAttr("readonly");
    } catch (error) {
      console.error(`Bản dịch thất bại: ${error}`);
      $(".convert").removeClass("disabled");
      $("#sourceText").removeAttr("readonly");
    }
  }
});

$(".google-convert").on("click", async function () {
  if ($("#sourceText").val().length > 0) {
    $("#sourceText").attr("readonly", true);
    $(".convert").addClass("disabled");

    try {
      const translatedText = await GoogleTranslate.translateText($("#sourceText").val(), 1, 'auto', $(this).data("lang"));

      $("#targetText").val(translatedText);
      $(".convert").removeClass("disabled");
      $("#sourceText").removeAttr("readonly");
    } catch (error) {
      console.error(`Bản dịch thất bại: ${error}`);
      $(".convert").removeClass("disabled");
      $("#sourceText").removeAttr("readonly");
    }
  }
});

$(".microsoft-convert").on("click", async function () {
  if ($("#sourceText").val().length > 0) {
    $("#sourceText").attr("readonly", true);
    $(".convert").addClass("disabled");

    try {
      const accessToken = await fetch('https://edge.microsoft.com/translate/auth')
          .then((response) => response.text());

      if (accessToken == undefined) {
        console.error('Không thể lấy được Access Token từ máy chủ.');
        return;
      }

      const translatedText = await MicrosoftTranslator.translateText(accessToken, $("#sourceText").val(), '', $(this).data("lang"));

      $("#targetText").val(translatedText);
      $(".convert").removeClass("disabled");
      $("#sourceText").removeAttr("readonly");
    } catch (error) {
      console.error(`Bản dịch thất bại: ${error}`);
      $(".convert").removeClass("disabled");
      $("#sourceText").removeAttr("readonly");
    }
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

function loadGlossary() {
  var data = ''; 
  var glossaryList = '<option value="-1" selected>Chọn...</option>';
  const glossaryType = $("#glossaryType").val();

  $("#fileExtension").text(glossaryType === GlossaryType.TSV ? "tsv" : (glossaryType === GlossaryType.CSV ? "csv" : "txt"));

  if (glossary.length > 0) {
    glossary = glossary.filter(([key])  => !glossary[key] && (glossary[key] = 1), {}).sort((a, b) => b[0].length - a[0].length || a[1].localeCompare(b[1]) || a[0].localeCompare(b[0]));

    glossary.forEach((element, index) => {
      glossaryList +=
        `\n<option value="${index}">${element[0]}\t${element[1]}</option>`;
    });

    switch (glossaryType) {
      case GlossaryType.CSV:
        data = glossary.map((element) => `${element[0].includes(',') ? '"' + element[0].replace(/"/g, '""') + '"' : element[0].replace(/"/g, '"""')},${element[1].includes(',') ? '"' + element[1].replace(/"/g, '""') + '"' : element[1].replace(/"/g, '"""')}`).join('\n');
        break;

      case GlossaryType.TSV:
        data = glossary.map((element) => (element.length > 2 ? element.splice(2, glossary.length - 2) : element).join('\t')).join('\n');
        break;
    }

    $("#downloadButton").attr("href",
        `data:${glossaryType};charset=utf-8,${encodeURIComponent(data)}`);
    $("#downloadButton").attr("download", ($("#glossaryName").val().length > 0 ? $("#glossaryName").val() : 'Từ vựng') + '.' + $("#fileExtension").text());
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

  localStorage.setItem("glossary", JSON.stringify({ type: glossaryType, data: Object.fromEntries(new Map(glossary)) }));
}