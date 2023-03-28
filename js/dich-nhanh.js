class QuickTranslator {
  var chinesephienamwords = new Map();
  var vietphrase = new Map();
  var names = new Map();
  var names2 = new Map();

  var result = [];

  constructor() {
    loadChinesePhienAmWords();

    //vietphrase = new Map(Object.entries(JSON.parse(localStorage.getItem("quicktranslator.vietphrase"))));
    //names = new Map(Object.entries(JSON.parse(localStorage.getItem("quicktranslator.names"))));

    if (vietphrase.length === 0) {
      loadVietPhrase();
    }

    if (names.length === 0) {
      loadNames();
    }
  }


  loadChinesePhienAmWords() {
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
        chinesephienamwords =
            new Map(this.data.split(/\r?\n/).map((element) =>
            element.split('=')).filter((element) => element.length >= 2));
    });
  }

  loadVietPhrase() {
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
        vietphrase =
            new Map(this.data.split(/\r?\n/).map((element) =>
            element.split('=')).filter((element) => element.length >= 2));
    });

    save();
  }

  loadNames() {
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
        names =
            new Map(this.data.split(/\r?\n/).map((element) =>
            element.split('=')).filter((element) => element.length >= 2));
    });

    save();
  }

  save() {
    //localStorage.setItem("quicktranslator.vietphrase", JSON.stringify(vietphrase.reduce((accumulator, currentValue) => ({...accumulator, [currentValue[0]]: currentValue[1] }), {})));
    //localStorage.setItem("quicktranslator.names", JSON.stringify(names.reduce((accumulator, currentValue) => ({...accumulator, [currentValue[0]]: currentValue[1] }), {})));
    localStorage.setItem("quicktranslator.names2", JSON.stringify(names2.reduce((accumulator, currentValue) => ({...accumulator, [currentValue[0]]: currentValue[1] }), {})));
  }

  translate() {
    let method = $(".method.active").attr("id");
    let text = $("#queryText").val();

    let data;
    result = [];
    var tempText = text;
    var tempWord = '';

    switch (method) {
      case Methods.VIETPHRASE:
        data = Object.entries(names2).sort((a, b) => b[0].length - a[0].length);

        for (let i = 0; i < data.length; i++) {
          tempText = tempText.replace(new RegExp(data[i][0], 'g'), data[i][1]);
        }

        data = Object.entries(names).sort((a, b) => b[0].length - a[0].length);

        for (let i = 0; i < data.length; i++) {
          tempText = tempText.replace(new RegExp(data[i][0], 'g'), data[i][1]);
        }

        data = vietphrase.sort((a, b) => b[0].length - a[0].length);

        for (let i = 0; i < tempText.length; i++) {
          phrase:
            for (let j = data[0].length; j >= 1; j--) {
              if (/\p{sc=Hani}/u.test(tempText.substring(i, i + j))) {
                result.push(data.get(tempText[i]));
                break phrase;
              } else {
                tempWord += tempText[i];

                if (tempWord.length > 0 && /\p{sc=Hani}/u.test(tempText[i + 1]) {
                  result.push(tempWord);
                  tempWord = '';
                }

                break phrase;
              }
            }
        }

        tempText = result.join(' ');
        result = [];

      case Methods.HAN_VIET:
        data = chinesephienamwords.sort((a, b) => b[0].length - a[0].length);

        for (let i = 0; i < tempText.length; i++) {
          phrase:
            for (let j = data[0].length; j >= 1; j--) {
              if ((service === Methods.VIETPHRASE &&$("#removeDeLeZhao").val() === false) ||
                  j > 1 || !/[的了着]/.test(tempText[i])) {
                if (/\p{sc=Hani}/u.test(tempText.substring(i, i + j))) {
                  result.push(data.get(tempText[i]));
                  break phrase;
                } else {
                  tempWord += tempText[i];

                  if (tempWord.length > 0 && /\p{sc=Hani}/u.test(tempText[i + 1]) {
                    result.push(tempWord);
                    tempWord = '';
                  }

                  break phrase;
                }
              }
            }
        }

        $("#translatedText").html(result.join(' '));
        break;
    }
  }

  Method = {
    GOOGLE: 'google',
    MICROSOFT: 'microsoft',
    PINYIN: 'pinyin',
    HAN_VIET: 'han_viet',
    VIETPHRASE: 'vietphrase'
  };
}

$(".textarea").on("input", function () {
  $(".textarea").css("height", "auto");
  let height =
      (new Array($("#queryText").prop("scrollHeight"),
      $("#translatedText").prop("scrollHeight")).sort((a, b) => b - a))[0];
  $(".textarea").css("height", height > 300 ? height.toString().concat('px') : "auto");
});

$("#translatedText").on("paste", function (e) {
  e.preventDefault();
  var text = e.clipboardData.getData('text/plain');
  document.execCommand('insertText', false, text);
});