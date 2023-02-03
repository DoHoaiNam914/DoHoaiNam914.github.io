const GlossaryType = {
  TSV: 'text/tab-separated-values',
  CSV: 'text/csv',
  VIETPHRASE: 'text/plain',
};

var vietnameseHanPhonetics = new Map();

var glossary = [];

$(document).ready(function () {
  $.get({
    crossDomain: false,
    url: "/datasource/ChinesePhienAmWords.txt",
    processData: false
  }).done(function (data) {
    vietnameseHanPhonetics = new
        Map(data.split(/\r?\n/).map((phonetic) =>
        phonetic.split('=')).filter((phonetic) =>
        phonetic.length === 2));
  }).fail((jqXHR, textStatus, errorThrown) => window.location.reload());
});

$("#inputGlossary").on("input", function () {
  let reader = new FileReader();

  reader.onload = function () {
    switch ($("#inputGlossary").prop("files")[0].type) {
      case GlossaryType.TSV:
        glossary =
            this.result.split(/\r?\n/).map((element) =>
            element.split(/\t/)).filter((element) =>
            element.length === 2);
        break;

      case GlossaryType.CSV:
        glossary = $.csv.toArrays(this.result);
        break;

      case GlossaryType.VIETPHRASE:
        glossary =
            this.result.split(/\r?\n/).map((element) =>
            element.split('=')).filter((element) =>
            element.length === 2);
        break;
    }

    $("#glossaryType").val($("#inputGlossary").prop("files")[0].type);
    loadGlossary();
  };

  reader.readAsText($(this).prop("files")[0]);
});

$("#glossaryType").change(() => loadGlossary());

$("#sourceText").on("input", function () {
  let glossaryMap = new Map(glossary);

  if (this.value.length > 0) {
    if (glossaryMap.has(this.value)) {
      $("#glossaryList").val(Array.from(glossaryMap.keys()).indexOf(this.value)).change();
    } else if (parseInt($("#glossaryList").val()) < 0) {
      let chars = this.value.split('');
      var targetText = '';

      for (let i = 0; i < chars.length; i++) {
        if (/\p{sc=Hani}/u.test(chars[i])) {
          targetText +=
            vietnameseHanPhonetics.get(chars[i]) +
            (/\p{sc=Hani}/u.test(chars[i + 1]) ? ' ' : '');
        } else {
          targetText += chars[i];
        }
      }

      $("#targetText").val(targetText);
    } else {
      $("#glossaryList").val(-1);
    }
  } else {
    $("#glossaryList").val(-1).change();
  }
});

$("#addButton").on("click", function () {
  if ($("#sourceText").val().length > 0) {
    let glossaryMap = new Map(glossary);
    glossaryMap.delete($("#sourceText").val());
    glossaryMap.set($("#sourceText").val(), $("#targetText").val());
    glossary = Array.from(glossaryMap);
    loadGlossary();
    $("#inputGlossary").val(null);
  }
});

$("#glossaryList").change(function () {
  if (parseInt(this.value) > -1) {
    let data = $("#glossaryList option:selected").text().split(/\t/);
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

$("#clearButton").on("click", function () {
  glossary = [];
  loadGlossary()
  $("#inputGlossary").val(null);
});

function loadGlossary() {
  var data = '';

  var glossaryList = '<option value="-1" selected>Chọn...</option>';

  if (glossary.length > 0) {
    let glossaryType = $("#glossaryType").val();
    glossary.sort((a, b) =>
        b[0].length - a[0].length ||
        a[0].localeCompare(b[0]) ||
        a[1].localeCompare(b[1]));

    glossary.forEach((element, index) => glossaryList +=
        `\n<option value="${index}">${element[0]}\t${element[1]}</option>`);

    var dataExtension = 'txt';

    switch (glossaryType) {
      case GlossaryType.TSV:
        data = glossary.map((element) => element.join('\t')).join('\r\n');
        dataExtension = 'tsv';
        break;
      case GlossaryType.CSV:
        data = glossary.map((element) =>
            `${element[0].includes(',') ? '"' +
            element[0].replace(/"/g, '""') + '"' :
            element[0].replace(/"/g,
            '"""')},${element[1].includes(',') ? '"' +
            element[1].replace(/"/g, '""') + '"' :
            element[1].replace(/"/g, '"""')}`).join('\r\n');
        dataExtension = 'csv';
        break;
      case GlossaryType.VIETPHRASE:
        data = glossary.map((element) => element.join('=')).join('\r\n')
        break;
    }

    $("#downloadButton").attr("href",
        `data:${glossaryType};charset=utf-8,` +
        encodeURIComponent(data));
    $("#downloadButton").attr("download", `Từ vựng.${dataExtension}`);
  } else {
    $("#downloadButton").removeAttr("href");
    $("#downloadButton").removeAttr("download");
  }

  $("#glossaryList").html(glossaryList);
  $("#preview").val(data);
  $("#counter").text(glossary.length);

  localStorage.setItem("glossary", JSON.stringify(Object.fromEntries(new Map(glossary))));

  $("#sourceText").val(null);
  $("#targetText").val(null);
}