var glossary = new Array();

$("#inputGlossary").on("input", function () {
  let reader = new FileReader();
  reader.readAsText(this.files[0]);
  reader.onload = function () {
    switch ($("#inputGlossary").prop("files")[0].type) {
      case 'text/tab-separated-values':
        glossary = this.result.split(/\r?\n/).map((element) => element.split('\t')).filter((element) => element.length === 2);
        break;
      case 'text/csv':
        glossary = $.csv.toArrays(this.result);
        break;
    }

    $("#glossaryType").val($("#inputGlossary").prop("files")[0].type).change();
  };
});

$("#glossaryType").change(() => loadGlossary());

$("#addButton").on("click", function () {
  if ($("#sourceText").val() !== '') {
    if (glossary.length === 0|| glossary[0][0] !== 'source' || glossary[0][1] !== 'target') {
      glossary.push(['source', 'target']);
    }

    glossary.push([$("#sourceText").val(), $("#targetText").val()]);
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

function loadGlossary() {
  if (glossary.length >= 2) {
    glossary.sort((a, b) => (b[0] === 'source' && b[1] === 'target') || b[0].length - a[0].length || b[1].length - a[1].length);
  }

  let glossaryList = '<option value="" selected>Chọn...</option>';
  let data = $("#glossaryType").val() === 'text/csv' ? 'source,target' : 'source\ttarget';

  for (let i = 1; glossary.length >= 2 && i < glossary.length; i++) {
    glossaryList += `\n<option value="${i}">${glossary[i][0]}=${glossary[i][1]}</option>`;
    data += `\r\n${$("#glossaryType").val() === 'text/csv' && glossary[i][0].includes(',') ? '"' + glossary[i][0].replace(/"/g, '""') + '"' : ($("#glossaryType").val() === 'text/csv' ? glossary[i][0].replace(/"/g, '"""') : glossary[i][0])}${$("#glossaryType").val() === 'text/csv' ? ',' : '\t'}${$("#glossaryType").val() === 'text/csv' && glossary[i][1].includes(',') ? '"' + glossary[i][1].replace(/"/g, '""') + '"' : ($("#glossaryType").val() === 'text/csv' ? glossary[i][1].replace(/"/g, '"""') : glossary[i][1])}`;
  }

  $("#glossaryList").html(glossaryList);
  $("#preview").val(data);
  $("#counter").text(glossary.length - 1);

  if (glossary.length >= 2) {
    $("#downloadButton").attr("href", `data:${$("#glossaryType").val()};charset=utf-8,` + encodeURIComponent(data));
    $("#downloadButton").attr("download", `Từ vựng.${$("#glossaryType").val() === 'text/csv' ? 'csv' : 'tsv'}`);
  } else {
    $("#downloadButton").removeAttr("href");
    $("#downloadButton").removeAttr("download");
  }

  $("#sourceText").val(null);
  $("#targetText").val(null);
}