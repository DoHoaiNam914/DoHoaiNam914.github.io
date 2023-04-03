const GlossaryType = {
  TSV: 'text/tab-separated-values',
  CSV: 'text/csv',
  VIETPHRASE: 'text/plain'
};

var sinoVietnameses = new Map();
const mark = new Map([
  ['　', ''],
  ['_', '_'],
  ['＿', '_'],
  ['-', '-'],
  ['—', '—'],
  [',', ','],
  ['，', ','],
  ['、', ','],
  [';', ';'],
  ['；', ';'],
  [':', ':'],
  ['：', ':'],
  ['!', '!'],
  ['！', '!'],
  ['?', '?'],
  ['？', '?'],
  ['.', '.'],
  ['．', '.'],
  ['…', '…'],
  ['。', '.'],
  ['·', '•'],
  ['\'', '\''],
  ['＇', '\''],
  ['‘', '‘'],
  ['’', '’'],
  ['"', '"'],
  ['＂', '"'],
  ['“', '“'],
  ['”', '”'],
  ['„', '„'],
  ['(', '('],
  ['（', '('],
  [')', ')'],
  ['）', ')'],
  ['[', '['],
  ['［', '['],
  [']', ']'],
  ['］', ']'],
  ['｛', '{'],
  ['｝', '}'],
  ['〈', '<'],
  ['〉', '>'],
  ['《', '«'],
  ['》', '»'],
  ['「', '“'],
  ['」', '”'],
  ['『', '‘'],
  ['』', '’'],
  ['【', '['],
  ['】', ']'],
  ['*', '*'],
  ['＊', '*'],
  ['／', '/'],
  ['&', '&'],
  ['＆', '&'],
  ['#', '#'],
  ['＃', '#'],
  ['%', '%'],
  ['％', '%'],
  ['+', '+'],
  ['＋', '+'],
  ['~', '~'],
  ['～', '~']
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

$("#settingsButton").on("click", function () {
  $("#glossaryList").val(-1).change();
});

$("#inputGlossary").on("input", function () {
  let reader = new FileReader();

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
  let glossaryMap = new Map(glossary);
  let data = new Map([...sinoVietnameses].sort((a, b) => b[0].length - a[0].length || a[0].localeCompare(b[0]) ||  a[1].localeCompare(b[1])));

  if (this.value.length > 0) {
    if (glossaryMap.has(this.value)) {
      $("#glossaryList").val(Array.from(glossaryMap.keys()).indexOf(this.value)).change();
    } else if (parseInt($("#glossaryList").val()) < 0) {
      var result = []; 
      var tempWord = '';

      for (let i = 0; i < this.value.length; i++) {
        if (mark.has(this.value[i])) {
          tempWord += mark.get(this.value[i]);

          if (tempWord.length > 0 && (/\p{sc=Hani}/u.test(this.value[i + 1]) || i + 1 === this.value.length)) {
            tempWord.split(/\s/).forEach((word) => result.push(word));
            tempWord = '';
          }
        } else if (/\p{sc=Hani}/u.test(this.value[i])) {
          if (tempWord.length > 0 && i + 1 === this.value.length) {
            result.push(tempWord);
            tempWord = '';
          }

          for (let j = Array.from(data)[0][0].length; j >= 1; j--) {
            if (data.get(this.value.substring(i, i + j)) != undefined) {
              result.push(data.get(this.value.substring(i, i + j)) || this.value.substring(i, i + j));
              i += j - 1;
              break;
            }
          }
        } else {
          tempWord += this.value[i];

          if (tempWord.length > 0 && (/\p{sc=Hani}/u.test(this.value[i + 1]) || i + 1 === this.value.length)) {
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

$("#glossaryName").on("input", () => loadGlossary());

function loadGlossary() {
  var data = ''; 
  var glossaryList = '<option value="-1" selected>Chọn...</option>';
  let glossaryType = $("#glossaryType").val();

  $("#fileExtension").text(glossaryType === GlossaryType.TSV ? ".tsv" : (glossaryType === GlossaryType.CSV ? ".csv" : ".txt"));

  if (glossary.length > 0) {

    glossary = glossary.filter(function ([key]) {
      if (!this[key]) return this[key] = 1;
    }, {}).sort((a, b) =>
        a[0].length - b[0].length ||
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