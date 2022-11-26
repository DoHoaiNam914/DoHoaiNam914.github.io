const Methods = {
  HAN_VIET: 'han_viet',
  VIETPHRASE: 'vietphrase',
};

var chinesephienamwords = new Array();
var names = new Array();
var vietphrase = new Array();

$(document).ready(function () {
  let settings = {
    crossDomain: false,
    url: "/datasource/ChinesePhienAmWords.txt",
    method: "GET",
    processData: false
  };

  $.ajax(settings).done(function () {
    let reader = new FileReader();
    reader.readAsText();
    reader.onload = function (data) {
      chinesephienamwords = this.data.split(/\r?\n/).map((chinesephienamword) => chinesephienamword.split('=')).filter((chinesephienamword) => chinesephienamword.length === 2);
  });
  
  vietphrase = Object.entries(JSON.parse(localStorage.getItem("ttvtranslate.vietphrase")));
  names = Object.entries(JSON.parse(localStorage.getItem("ttvtranslate.names")));

  if (vietphrase.length === 0) {
    loadVietPhrase();
  }

  if (names.length === 0) {
    loadNames();
  }

  onload();
});

function loadVietPhrase() {
  let settings = {
    crossDomain: false,
    url: "/datasource/VietPhrase.txt",
    method: "GET",
    processData: false
  };

  $.ajax(settings).done(function () {
    let reader = new FileReader();
    reader.readAsText();
    reader.onload = function (data) {
      vietphrase = this.data.split(/\r?\n/).map((vp) => vp.split('=')).filter((vp) => vp.length === 2);
  });
}

function loadNames() {
  let settings = {
    crossDomain: false,
    url: "/datasource/Names.txt",
    method: "GET",
    processData: false
  };

  $.ajax(settings).done(function () {
    let reader = new FileReader();
    reader.readAsText();
    reader.onload = function (data) {
      names = this.data.split(/\r?\n/).map((name) => name.split('=')).filter((name) => name.length === 2);
  });
}

function onload() {
  localStorage.setItem("ttvtranslate.vietphrase", JSON.stringify(vietphrase.reduce((accumulator, currentValue) => ({...accumulator, [currentValue[0]]: currentValue[1] }), {})));
  localStorage.setItem("ttvtranslate.names", JSON.stringify(names.reduce((accumulator, currentValue) => ({...accumulator, [currentValue[0]]: currentValue[1] }), {})));
}

$("#translateButton").on("click", function () {
  let service = $(".service.active").attr("id");
  let sourceLang = $("#sourceLangSelect").val();
  let targetLang = $("#targetLangSelect").val();
  let sentences = $("#queryText").val().split('\n');

  var result;

  switch (service) {
    case HAN_VIET:
    case Methods.VIETPHRASE:
      if ($("#removeDeLeZhao").val() === true) {
        sentences = sentences.map((sentence) => sentence.replace(/[的了着]/g, ''));
      }

      for (let i = chinesephienamwords.length - 1; i >= 0; i--) {
        result = sentences.map((sentence) => sentence.replace(new RegExp(chinesephienamwords[i][0], 'g'), chinesephienamwords[i][1]));
      }

      $("#translatedText").html(`<p>${result.join('<\p>\n<p>'}</p>`);
      break;
  }
});

$(".textarea").on("input", function () {
  $(".textarea").css("height", "auto");
  let height = (new Array($("#queryText").prop("scrollHeight"), $("#translatedText").prop("scrollHeight")).sort((a, b) => b - a))[0];
  $(".textarea").css("height", height > 300 ? height.toString().concat('px') : "auto");
});

$("#translatedText").on("paste", function (e) {
  e.preventDefault();
  var text = e.clipboardData.getData('text/plain');
  document.execCommand('insertText', false, text);
});