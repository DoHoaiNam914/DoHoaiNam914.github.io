'use strict';

const GlossaryType = {
  TSV: 'text/tab-separated-values',
  CSV: 'text/csv',
  VIETPHRASE: 'text/plain'
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

$("#clearGlossaryButton").on("click", function () {
  if (window.confirm("Bạn có muốn xoá tập từ vựng chứ?")) {
    glossary = [];
    loadGlossary()
    $("#inputGlossary").val(null);
  }
});

$("#glossaryType").change(() => loadGlossary());

$("#sourceText").on("input", function () {
  const glossaryMap = new Map(glossary);

  if ($(this).val().length > 0) {
    $("#targetText").val(getConvertedWords(new Map((glossary.length > 0 ?glossary.concat(Array.from(sinoVietnameses)) : Array.from(sinoVietnameses)).sort((a, b) => b[0].length - a[0].length)), $(this).val()));

    if (glossaryMap.has($(this).val())) {
      $("#glossaryList").val(Array.from(glossaryMap.keys()).indexOf($(this).val()));
    } else {
      $("#glossaryList").val(-1);
    }
  } else {
    $("#glossaryList").val(-1).change();
  }
});

$("#sourceTextMenu").on("mousedown", (event) => event.preventDefault());

$("#clearSourceTextButton").on("click", () => $("#sourceText").val(null).trigger("input"));

$("#copySourceTextButton").on("click", () => navigator.clipboard.writeText($("#sourceText").val()));

$("#pasteSourceTextButton").on("click", () => navigator.clipboard.readText().then((clipText) => $("#sourceText").val(clipText).trigger("input")));

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

$("#pasteTargetTextButton").on("click", () => navigator.clipboard.readText().then((clipText) => $("#targetText").val(clipText).trigger("input")));

$("#pinyinConvertButton").on("click", function () {
  if ($("#sourceText").val().length > 0) {
    $("#targetText").val(getConvertedWords(new Map(Array.from(pinyins).sort((a, b) => b[0].length - a[0].length)), $("#sourceText").val()));
  }
});

$("#sinoVietnameseConvertButton").click(function () {
  if ($("#sourceText").val().length > 0) {
    $("#targetText").val(getConvertedWords(new Map(Array.from(sinoVietnameses).sort((a, b) => b[0].length - a[0].length)), $("#sourceText").val()));
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
  if (window.confirm('Bạn có muốn xoá từ này chứ?') && parseInt($("#glossaryList").val()) > -1) {
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
    glossary = glossary.filter(function ([key]) {
      if (!this[key]) return this[key] = 1;
    }, {}).sort((a, b) =>
        a[1].localeCompare(b[1]) ||
        b[0].length - a[0].length ||
        a[0].localeCompare(b[0]));

    glossary.forEach((element, index) => glossaryList +=
        `\n<option value="${index}">${element[0]}\t${element[1]}</option>`);

    switch (glossaryType) {
      case GlossaryType.TSV:
        data = glossary.map((element) =>
            (element.length > 2 ? element.splice(2, glossary.length - 2) :
            element).join('\t')).join('\n');
        break;
      case GlossaryType.CSV:
        data = glossary.map((element) =>
            `${element[0].includes(',') ? '"' +
            element[0].replace(/"/g, '""') + '"' :
            element[0].replace(/"/g,
            '"""')},${element[1].includes(',') ? '"' +
            element[1].replace(/"/g, '""') + '"' :
            element[1].replace(/"/g, '"""')}`).join('\n');
        break;
      case GlossaryType.VIETPHRASE:
        data = glossary.map((element) =>
            (element.length > 2 ? element.splice(2, glossary.length - 2) :
            element).join('=')).join('\n');
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

  localStorage.setItem("glossary", JSON.stringify({type: glossaryType, data: Object.fromEntries(new Map(glossary))}));
}