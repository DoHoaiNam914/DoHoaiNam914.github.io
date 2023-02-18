const Methods = {
  PINYIN: 'pinyin',
  HAN_VIET: 'han_viet',
  VIETPHRASE: 'vietphrase'
};

var chinesephienamwords = new Array();
var vietphrase = new Array();
var names = new Array();
var names2 = new Array();

$(document).ready(function () {
  loadChinesePhienAmWords();

  vietphrase = Object.entries(JSON.parse(localStorage.getItem("quicktranslate.vietphrase")));
  names = Object.entries(JSON.parse(localStorage.getItem("quicktranslate.names")));

  if (vietphrase.length === 0) {
    loadVietPhrase();
  }

  if (names.length === 0) {
    loadNames();
  }
});

$("#translateButton").on("click", function () {
  let service = $(".service.active").attr("id");
  let sourceLang = $("#sourceLangSelect").val();
  let targetLang = $("#targetLangSelect").val();
  let sentences = $("#queryText").val();

  var result;

  switch (service) {
    case Methods.HAN_VIET:
      chinesephienamwords.forEach(function (word) {
        result =
            sentences.replace(new RegExp(word[0], 'g'), word[1]);
      }

      $("#translatedText").html(result);
      break;

    case Methods.VIETPHRASE:
      if ($("#removeDeLeZhao").val() === true) {
        sentences =
            sentences.map((sentence) =>
            sentence.replace(/[的了着]/g, ''));
      }

      chinesephienamwords.forEach(function (word) {
        result =
            sentences.replace(new RegExp(word[0], 'g'), word[1]);
      }

      $("#translatedText").html(result);
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

function loadChinesePhienAmWords() {
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
}

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

  onload();
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

  onload();
}

function onload() {
  localStorage.setItem("quicktranslate.vietphrase", JSON.stringify(vietphrase.reduce((accumulator, currentValue) => ({...accumulator, [currentValue[0]]: currentValue[1] }), {})));
  localStorage.setItem("quicktranslate.names", JSON.stringify(names.reduce((accumulator, currentValue) => ({...accumulator, [currentValue[0]]: currentValue[1] }), {})));
  localStorage.setItem("quicktranslate.names2", JSON.stringify(names2.reduce((accumulator, currentValue) => ({...accumulator, [currentValue[0]]: currentValue[1] }), {})));
}