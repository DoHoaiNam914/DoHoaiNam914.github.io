const TSV = 'text/tab-separated-values';
const CSV = 'text/csv';
const VIETPHRASE = 'text/plain';

var glossary;

$("#inputGlossary").on("input", function () {
  let reader = new FileReader();
  reader.readAsText($(this).prop("files")[0]);
  reader.onload = function () {
    switch ($("#inputGlossary").prop("files")[0].type) {
      case TSV:
        glossary = this.result.split(/\r?\n/).map((element) => element.split('\t')).filter((element) => element.length === 2);
        break;
      case CSV:
        glossary = $.csv.toArrays(this.result);
        break;
      case VIETPHRASE:
        glossary = this.result.split(/\r?\n/).map((element) => element.split('=')).filter((element) => element.length === 2);
        break;
    }

    $("#glossaryType").val($("#inputGlossary").prop("files")[0].type);
    loadGlossary()
  };
});

$("#glossaryType").change(() => loadGlossary());

$("#addButton").on("click", function () {
  if ($("#sourceText").val() === '') {
    glossary = glossary.filter(element => element[0] !== $("#sourceText").val());
    glossary.push(new Array($("#sourceText").val(), $("#targetText").val()));
    loadGlossary();
    $("#inputGlossary").val(null);
  }
});

$("#removeButton").on("click", function () {
  if ($("#glossaryList").val() !== '') {
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
  glossary = new Array();
  loadGlossary()
  $("#inputGlossary").val(null);
});

function loadGlossary() {
  var data = '';

  var glossaryList = '<option value="" selected>Chọn...</option>';

  if (glossary.length >= 1) {
    glossary.sort((a, b) => b[0].length - a[0].length || b[1].length - a[1].length || a[0] - b[0] || a[1] - b[1]);

    let glossaryType = $("#glossaryType").val();
    var values = new Array();
    var dataExtension = 'txt';

    switch (glossaryType) {
      case TSV:
        data = glossary.map((element) => element.join('\t')).join('\r\n');
        dataExtension = 'tsv';
        break;
      case CSV:
        data = glossary.map((element) => `${element[0].includes(',') ? '"' + element[0].replace(/"/g, '""') + '"' : element[0].replace(/"/g, '"""')},${element[1].includes(',') ? '"' + element[1].replace(/"/g, '""') + '"' : element[1].replace(/"/g, '"""')}`).join('\r\n');
        dataExtension = 'csv';
        break;
      case VIETPHRASE:
        data = glossary.map((element) => element.join('=')).join('\r\n')
        break;
    }

    for (let i = 0; i < glossary.length; i++) {
      glossaryList += `\n<option value="${i}">${glossary[i][0]}=${glossary[i][1]}</option>`;
    }

    $("#downloadButton").attr("href", `data:${glossaryType};charset=utf-8,` + encodeURIComponent(data));
    $("#downloadButton").attr("download", `Từ vựng.${dataExtension}`);
    localStorage.setItem("glossary", JSON.stringify(glossary.reduce((accumulator, currentValue) => ({...accumulator, [currentValue[0]]: currentValue[1] }), {})));
  } else {
    $("#downloadButton").removeAttr("href");
    $("#downloadButton").removeAttr("download");
    localStorage.removeItem("glossary");
  }

  $("#glossaryList").html(glossaryList);
  $("#preview").text(data);
  $("#counter").text(glossary.length);
  $("#sourceText").val(null);
  $("#targetText").val(null);
}