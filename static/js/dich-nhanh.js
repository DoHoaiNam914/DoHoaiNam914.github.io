'use strict';

let translator = JSON.parse(localStorage.getItem("translator"));

const DEEPL_AUTH_KEY = 'a4b25ba2-b628-fa56-916e-b323b16502de:fx';
const uuid = crypto.randomUUID();

let pinyins = {};
let sinovietnameses = {};
let vietphrases = {};
const punctuation = [
  ['－', ' - '],
  ['・', ' '],
  ['，', ', '],
  ['、', ', '],
  ['；', '; '],
  ['：', ': '],
  ['？', '\? '],
  ['！', '! '],
  ['\\.\\.\\.', '... '],
  ['…', '... '],
  ['。', '. '],
  ['\'', '\''],
  ['‘…’', '‘...’'],
  ['"', '"'],
  ['“…”', '“...”'],
  ['(…)', ' (...) '],
  ['（…）', ' (...) '],
  ['[…]', ' [...] '],
  ['〈…〉', '〈...〉'],
  ['《…》', '《...》'],
  ['「…」', ' “...” '],
  ['『…』', ' ‘...’ '],
  ['【…】', '【...】']
];

let translation = '';

$(document).ready(() => {
  $.get("/static/datasource/Unihan_Readings.txt").done(async (data) => {
    let pinyinList = [...data.split(/\r?\n/).filter(
        (element) => element.match(/^U+/) && element.includes('kMandarin')).map(
        (element) => [String.fromCodePoint(
            parseInt(element.split(/\t/)[0].replace('U+', ''), 16)),
          element.split(/\t/)[2]])];
    pinyinList = [...pinyinList,
      ...(await $.get("/static/datasource/Bính âm.txt")).split(
          /\r?\n/).reverse().map((element) => element.split('=')).filter(
          (element) => element.length > 1 || Object.fromEntries(
              pinyinList).hasOwnProperty(element[0])).map(
          (element) => [element[0], element[1].split('ǀ')[0]])].filter(
        ([key]) => !pinyinList[key] && (pinyinList[key] = 1), {});
    pinyins = Object.fromEntries(pinyinList);
    console.log('Đã tải xong bộ dữ liệu bính âm!');

    let sinovietnameseList = [...hanvietData.map((element) => [element[0],
      element[1].split(',')[element[1].match(/^,/) ? 1 : 0]]),
      ...data.split(/\r?\n/).filter(
          (element) => element.match(/^U+/) && element.includes(
              'kVietnamese')).map((element) => [String.fromCodePoint(
          parseInt(element.split(/\t/)[0].replace('U+', ''), 16)),
        element.split(/\t/)[2]])];
    sinovietnameseList = [...sinovietnameseList,
      ...(await $.get("/static/datasource/Hán việt.txt")).split(
          /\r?\n/).reverse().filter(
          (element) => element.length > 1 || Object.fromEntries(
              sinovietnameseList).hasOwnProperty(element[0])).map(
          (element) => element.split('=')).map(
          (element) => [element[0], element[1].split('ǀ')[0]])].filter(
        ([key]) => !sinovietnameseList[key] && (sinovietnameseList[key] = 1),
        {});
    sinovietnameses = Object.fromEntries(sinovietnameseList);
    console.log('Đã tải xong bộ dữ liệu hán việt!');
  }).fail((jqXHR, textStatus, errorThrown) => {
    window.location.reload();
  });

  $("#queryTextCounter").text($("#queryText").val().length);
});

$("#translateButton").click(async function () {
  if ($(this).text() == 'Dịch') {
    if ($("#queryText").val().length > 0) {
      onPreTranslate();
      await translate();
      onPostTranslate();
    }
  } else if ($(this).text() == 'Sửa') {
    $("#translatedText").hide();
    $("#queryText").show();
    $("#clearImageButton").removeClass("disabled");
    $("#pasteUrlButton").removeClass("disabled");
    $("#imageFile").removeClass("disabled");
    $("#reTranslateButton").addClass("disabled");
    translation = '';
    $(this).text("Dịch");
  }
});

$("#copyButton").on("click", () => {
  navigator.clipboard.writeText(
      $("#translateButton").text() == 'Sửa' ? translation : $(
          "#queryText").val());
});

$("#pasteButton").on("click", () => {
  navigator.clipboard
  .readText()
  .then((clipText) => {
    if (clipText.length > 0) {
      $(document.body).scrollTop(0);
      $(document.documentElement).scrollTop(0);
      $("#queryText").val(clipText).trigger("input");

      if ($("#translateButton").text() == 'Sửa') {
        translation = '';
        $("#translateButton").text("Dịch").click();
      }
    }
  });
});

$("#reTranslateButton").on("click", () => {
  translation = '';
  $("#translateButton").text("Dịch").click();
});

$(".textarea").on("input", onInput);

$("#queryText").on("input", () => {
  onInput();
  $("#queryTextCounter").text($("#queryText").val().length);
});

$("#inputVietPhrases").on("change", function () {
  const reader = new FileReader();

  reader.onload = function () {
    let vietphraseList = this.result.split(/\r?\n/).map(
        (phrase) => phrase.split('=')).filter(
        (phrase) => phrase.length == 2).map(
        (element) => [element[0].replace(/([.\[\]()*+?])/g, '\\$1'),
          element[1].split('/')[0].split('|')[0]]);
    vietphraseList = [...vietphraseList,
      ...Object.entries(sinovietnameses)].filter(
        ([key]) => !vietphraseList[key] && (vietphraseList[key] = 1), {})
    vietphrases = Object.fromEntries(vietphraseList);
    console.log('Đã tải xong tệp dữ liệu VietPhrase.txt!');
  }

  reader.readAsText($(this).prop("files")[0]);
});

$(".option").change(() => {
  if ($("#translateButton").text() == 'Sửa') {
    translation = '';
    $("#translateButton").text("Dịch").click();
  }

  localStorage.setItem("translator", JSON.stringify({
    translator: $(".translator.active").data("id"),
    showOriginal: $("#flexSwitchCheckShowOriginal").prop("checked"),
    glossary: $("#flexSwitchCheckGlossary").prop("checked"),
    source: $("#sourceLangSelect").val(),
    target: $("#targetLangSelect").val()
  }));
  translator = JSON.parse(localStorage.getItem("translator"));
});

$(".translator").click(function () {
  if (!$(this).hasClass("disabled")) {
    const prevTranslator = translator.translator;

    const prevSourceLanguage = translator.source;
    const prevTargetLanguage = translator.target;
    const prevSourceLanguageName = getLanguageName(prevTranslator,
        prevSourceLanguage);
    const prevTargetLanguageName = getLanguageName(prevTranslator,
        prevTargetLanguage);

    if ($(this).data("id") === Translators.VIETPHRASE) {
      localStorage.setItem("translator", JSON.stringify({
        translator: $(".translator.active").data("id"),
        showOriginal: $("#flexSwitchCheckShowOriginal").prop("checked"),
        glossary: $("#flexSwitchCheckGlossary").prop("checked"),
        source: $("#sourceLangSelect").val(),
        target: $("#targetLangSelect").val()
      }));
      translator = JSON.parse(localStorage.getItem("translator"));
    }

    $(".translator").removeClass("active");
    $(this).addClass("active");

    $("#sourceLangSelect").html(getSourceLanguageOptions($(this).data("id")));

    $("#sourceLangSelect > option").each(function (index) {
      if ($(".translator.active").data("id") === prevTranslator
          && prevSourceLanguage != null) {
        $("#sourceLangSelect").val(prevSourceLanguage);
        return false;
      } else if (prevSourceLanguage != null && prevSourceLanguageName != null
          && (($(
                      this).val().toLowerCase().split('-')[0]
                  == prevSourceLanguage.toLowerCase().split('-')[0] && $(
                      this).val().toLowerCase().split('-')[1]
                  == prevSourceLanguage.toLowerCase().split('-')[1]) || $(
                  this).text()
              == prevSourceLanguageName || ($(this).val().toLowerCase().split(
                      '-')[0] == prevSourceLanguage.toLowerCase().split('-')[0]
                  && $(
                      this).text().replace(/[()]/g, '').includes(
                      prevSourceLanguageName.includes('Tiếng')
                          ? prevSourceLanguageName.replace(/[()]/g, '').replace(
                              'Tiếng ', '') : prevSourceLanguageName.replace(
                              /[()]/g,
                              '').split(' ')[0])))) {
        $("#sourceLangSelect").val($(this).val()).change();
        return false;
      } else if (index + 1 == $("#targetLangSelect > option").length) {
        switch ($(".translator.active").data("id")) {
          case Translators.GOOGLE_TRANSLATE:
          case Translators.PAPAGO:
            $("#sourceLangSelect").val("auto");
            break;

          case Translators.VIETPHRASE:
            $("#sourceLangSelect").val("zh");
            break;

          default:
            $("#sourceLangSelect").val("");
            break;
        }
      }
    });

    $("#targetLangSelect").html(getTargetLanguageOptions($(this).data("id")));

    $("#targetLangSelect > option").each(function (index) {
      if ($(".translator.active").data("id") === prevTranslator
          && prevTargetLanguage != null) {
        $("#targetLangSelect").val(prevTargetLanguage);
        return false;
      } else if (prevTargetLanguage != null && prevTargetLanguageName != null
          && (($(
                      this).val().toLowerCase().split('-')[0]
                  == prevTargetLanguage.toLowerCase().split('-')[0] && $(
                      this).val().toLowerCase().split('-')[1]
                  == prevTargetLanguage.toLowerCase().split('-')[1]) || $(
                  this).text()
              == prevTargetLanguageName || ($(this).val().toLowerCase().split(
                      '-')[0] == prevTargetLanguage.toLowerCase().split('-')[0]
                  && $(
                      this).text().replace(/[()]/g, '').includes(
                      prevTargetLanguageName.includes('Tiếng')
                          ? prevTargetLanguageName.replace(/[()]/g, '').replace(
                              'Tiếng ', '') : prevTargetLanguageName.replace(
                              /[()]/g,
                              '').split(' ')[0])))) {
        if ($(".translator.active").data("id")
            === Translators.DEEPL_TRANSLATOR && prevTargetLanguageName
            == 'English') {
          $("#targetLangSelect").val("EN-US").change();
        } else {
          $("#targetLangSelect").val($(this).val()).change();
        }
        return false;
      } else if (index + 1 == $("#targetLangSelect > option").length) {

        switch ($(".translator.active").data("id")) {
          case Translators.DEEPL_TRANSLATOR:
            $("#targetLangSelect").val("EN-US");
            break;

          default:
            $("#targetLangSelect").val("vi");
            break;
        }
      }
    });

    if ($(".translator.active").data("id") !== Translators.VIETPHRASE) {
      localStorage.setItem("translator", JSON.stringify({
        translator: $(this).data("id"),
        showOriginal: translator.showOriginal,
        glossary: translator.glossary,
        source: $("#sourceLangSelect").val(),
        target: $("#targetLangSelect").val()
      }));
      translator = JSON.parse(localStorage.getItem("translator"));
    }

    if ($("#translateButton").text() == 'Sửa') {
      translation = '';
      $("#translateButton").text("Dịch").click();
    }
  }
});

function getLanguageName(translator, languageCode) {
  switch (translator) {
    case Translators.DEEPL_TRANSLATOR:
      return DeepLSourceLanguage[languageCode] ?? '';

    case Translators.MICROSOFT_TRANSLATOR:
      return MicrosoftLanguage[languageCode] ?? '';

    case Translators.PAPAGO:
      return PapagoLanguage[languageCode] ?? '';

    case Translators.GOOGLE_TRANSLATE:
      return GoogleLanguage[languageCode] ?? '';
  }
}

function getSourceLanguageOptions(translator) {
  const sourceLangSelect = document.createElement('select');
  const autoDetectOption = document.createElement('option');

  switch (translator) {
    case Translators.DEEPL_TRANSLATOR:
      autoDetectOption.innerText = 'Detect language';
      autoDetectOption.value = '';
      sourceLangSelect.appendChild(autoDetectOption);

      for (const langCode in DeepLSourceLanguage) {
        const option = document.createElement('option');
        option.innerText = DeepLSourceLanguage[langCode];
        option.value = langCode;
        sourceLangSelect.appendChild(option);
      }
      break;

    case Translators.GOOGLE_TRANSLATE:
      autoDetectOption.innerText = 'Phát hiện ngôn ngữ';
      autoDetectOption.value = 'auto';
      sourceLangSelect.appendChild(autoDetectOption);

      for (const langCode in GoogleLanguage) {
        const option = document.createElement('option');
        option.innerText = GoogleLanguage[langCode];
        option.value = langCode;
        sourceLangSelect.appendChild(option);
      }
      break;

    case Translators.PAPAGO:
      autoDetectOption.innerText = 'Phát hiện ngôn ngữ';
      autoDetectOption.value = 'auto';
      sourceLangSelect.appendChild(autoDetectOption);

      for (const langCode in PapagoLanguage) {
        const option = document.createElement('option');
        option.innerText = PapagoLanguage[langCode];
        option.value = langCode;
        sourceLangSelect.appendChild(option);
      }
      break;

    case Translators.MICROSOFT_TRANSLATOR:
      autoDetectOption.innerText = 'Tự phát hiện';
      autoDetectOption.value = '';
      sourceLangSelect.appendChild(autoDetectOption);

      for (const langCode in MicrosoftLanguage) {
        const option = document.createElement('option');
        option.innerText = MicrosoftLanguage[langCode];
        option.value = langCode;
        sourceLangSelect.appendChild(option);
      }
      break;

    case Translators.VIETPHRASE:
      autoDetectOption.innerText = 'Tiếng Trung Quốc';
      autoDetectOption.value = 'zh';
      sourceLangSelect.appendChild(autoDetectOption);
      break;
  }

  return sourceLangSelect.innerHTML;
}

function getTargetLanguageOptions(translator) {
  const targetLangSelect = document.createElement('select');

  switch (translator) {
    case Translators.DEEPL_TRANSLATOR:
      for (const langCode in DeepLTargetLanguage) {
        const option = document.createElement('option');
        option.innerText = DeepLTargetLanguage[langCode];
        option.value = langCode;
        targetLangSelect.appendChild(option);
      }
      break;

    case Translators.GOOGLE_TRANSLATE:
      for (const langCode in GoogleLanguage) {
        const option = document.createElement('option');
        option.innerText = GoogleLanguage[langCode];
        option.value = langCode;
        targetLangSelect.appendChild(option);
      }
      break;

    case Translators.PAPAGO:
      for (const langCode in PapagoLanguage) {
        const option = document.createElement('option');
        option.innerText = PapagoLanguage[langCode];
        option.value = langCode;
        targetLangSelect.appendChild(option);
      }
      break;

    case Translators.MICROSOFT_TRANSLATOR:
      for (const langCode in MicrosoftLanguage) {
        const option = document.createElement('option');
        option.innerText = MicrosoftLanguage[langCode];
        option.value = langCode;
        targetLangSelect.appendChild(option);
      }
      break;

    case Translators.VIETPHRASE:
      const pinyinOption = document.createElement('option');
      const sinovietnameseOption = document.createElement('option');
      const vietphraseOption = document.createElement('option');
      pinyinOption.innerText = 'Bính âm';
      pinyinOption.value = 'en';
      targetLangSelect.appendChild(pinyinOption);
      sinovietnameseOption.innerText = 'Hán việt';
      sinovietnameseOption.value = 'zh-VN';
      targetLangSelect.appendChild(sinovietnameseOption);
      vietphraseOption.innerText = 'Vietphrase';
      vietphraseOption.value = 'vi';
      targetLangSelect.appendChild(vietphraseOption);
      break;
  }

  return targetLangSelect.innerHTML;
}

async function translate() {
  const translator = $(".translator.active").data("id");

  const inputText = $("#queryText").val();
  const sourceLanguage = $("#sourceLangSelect").val();
  const targetLanguage = $("#targetLangSelect").val();

  const results = [];
  const errorMessage = document.createElement("p");

  try {
    let MAX_LENGTH;
    let MAX_LINE;

    switch (translator) {
      case Translators.DEEPL_TRANSLATOR:
        MAX_LENGTH = 32768;
        MAX_LINE = 50;
        break;

      case Translators.GOOGLE_TRANSLATE:
        MAX_LENGTH = 16272;
        MAX_LINE = 128;
        break;

      case Translators.PAPAGO:
        MAX_LENGTH = 5000;
        MAX_LINE = inputText.split(/\n/).length;
        break;

      case Translators.MICROSOFT_TRANSLATOR:
        MAX_LENGTH = 50000;
        MAX_LINE = 1000;
        break;

      default:
        MAX_LENGTH = inputText.length;
        MAX_LINE = inputText.split(/\n/).length;
        break;
    }

    if (inputText.split(/\n/).sort((a, b) => b.length - a.length)[0].length
        > MAX_LENGTH) {
      errorMessage.innerText = `Bản dịch thất bại: Số lượng từ trong một dòng quá dài (Số lượng từ hợp lệ nhỏ hơn hoặc bằng ${MAX_LENGTH})`;
      $("#translatedText").append(errorMessage);
      onPostTranslate();
      return;
    }

    if (translator === Translators.DEEPL_TRANSLATOR) {
      const deeplUsage = (await $.get(
              "https://api-free.deepl.com/v2/usage?auth_key=" + DEEPL_AUTH_KEY))
          ?? {"character_count": 500000, "character_limit": 500000};
      console.log(inputText.length,
          deeplUsage.character_limit - deeplUsage.character_count)
      if (inputText.length > (deeplUsage.character_limit
          - deeplUsage.character_count)) {
        errorMessage.innerText = `Lỗi DeepL: Đã đạt đến giới hạn dịch của tài khoản. (${deeplUsage.character_count}/${deeplUsage.character_limit} ký tự)`;
        $("#translatedText").html(errorMessage);
        onPostTranslate();
        return;
      }
    }

    const googleTranslateData = await getGoogleTranslateData(translator);

    if (translator === Translators.GOOGLE_TRANSLATE
        && (googleTranslateData.logId == undefined || googleTranslateData.ctkk
            == undefined)) {
      errorMessage.innerText = 'Không thể lấy được Log ID hoặc Token từ element.js.';
      $("#translatedText").html(errorMessage);
      return;
    }

    const papagoVersion = await getPapagoVersion(translator);

    if (translator === Translators.PAPAGO && papagoVersion == undefined) {
      errorMessage.innerText = 'Không thể lấy được Thông tin phiên bản từ main.js.';
      $("#translatedText").html(errorMessage);
      return;
    }

    const microsoftTranslatorAccessToken = await getMicrosoftTranslatorAccessToken(
        translator);

    if (translator === Translators.MICROSOFT_TRANSLATOR
        && microsoftTranslatorAccessToken == undefined) {
      errorMessage.innerText = 'Không thể lấy được Access Token từ máy chủ.';
      $("#translatedText").html(errorMessage);
      return;
    }

    const queryLines = inputText.split(/\n/);
    let translateLines = [];

    let canTranslate = false;

    for (let i = 0; i < inputText.split(/\n/).length; i++) {
      if (translateLines.join('\n').length < MAX_LENGTH && translateLines.length
          < MAX_LINE) {
        translateLines.push(queryLines.shift());

        if (queryLines.length == 0 || translateLines.length >= MAX_LINE
            || translateLines.join('\n').length >= MAX_LENGTH) {
          if (translateLines.join('\n').length > MAX_LENGTH
              || translateLines.length > MAX_LINE) {
            queryLines.splice(0, 0, translateLines.pop());
            i--;
          }

          if (translateLines.length <= MAX_LINE && translateLines.join(
              '\n').length <= MAX_LENGTH) {
            canTranslate = true;
          }
        }
      }

      if (canTranslate && translateLines.length > 0) {
        const translateText = translateLines.join('\n');
        let translatedText;

        switch (translator) {
          case Translators.DEEPL_TRANSLATOR:
            translatedText = await DeepLTranslator.translateText(
                DEEPL_AUTH_KEY, translateText, sourceLanguage,
                targetLanguage);
            break;

          default:
          case Translators.GOOGLE_TRANSLATE:
            translatedText = await GoogleTranslate.translateText(
                translateText, googleTranslateData.logId,
                googleTranslateData.ctkk,
                sourceLanguage, targetLanguage);
            break;

          case Translators.PAPAGO:
            translatedText = await Papago.translateText(papagoVersion,
                translateText,
                sourceLanguage, targetLanguage);
            break;

          case Translators.MICROSOFT_TRANSLATOR:
            translatedText = await MicrosoftTranslator.translateText(
                microsoftTranslatorAccessToken, translateText, sourceLanguage,
                targetLanguage);
            break;

          case Translators.VIETPHRASE:
            if ($("#targetLangSelect").val() == 'vi' && Object.entries(
                vietphrases).length > 0) {
              translatedText = convertText(vietphrases,
                  $("#flexSwitchCheckGlossary").prop("checked"),
                  translateText,
                  $("input[name=\"flexRadioTranslationAlgorithm\"]:checked").val()).split(
                  /\n/).map(
                  (element) => element.replace(
                      /(^|\s*[.;:?!\-("'‘“〈《【]\s*)(\p{Ll})/gu,
                      (match, p1, p2) => p1 + p2.toUpperCase())).join('\n');
            } else if ($("#targetLangSelect").val() == 'zh-VN'
                && Object.entries(sinovietnameses).length > 0) {
              translatedText = convertText(sinovietnameses, false,
                  translateText).split(
                  /\n/).map((element) => element.replace(
                  /(^|[.;:?!-]\s+|[("'‘“〈《【])(\p{Ll})/gu,
                  (match, p1, p2) => p1 + p2.toUpperCase())).join('\n');
            } else if ($("#targetLangSelect").val() == 'en'
                && Object.entries(pinyins).length > 0) {
              translatedText = convertText(pinyins, false,
                  translateText).split(/\n/).map(
                  (element) => element.replace(
                      /(^|[.;:?!-]\s+|[("'‘“〈《【])(\p{Ll})/gu,
                      (match, p1, p2) => p1 + p2.toUpperCase())).join('\n');
            } else if ($("#targetLangSelect").val() == 'vi' && Object.entries(
                vietphrases).length == 0) {
              errorMessage.innerHTML = 'Nhập tệp VietPhrase.txt nếu có hoặc tải về <a href="https://drive.google.com/drive/folders/0B6fxcJ5qbXgkeTJNTFJJS3lmc3c?resourcekey=0-Ych2OUVug3pkLgCIlzvcuA&usp=sharing">tại đây</a>';
              $("#translatedText").html(errorMessage);
              onPostTranslate();
              return;
            }
            break;
        }

        results.push(translatedText);
        translateLines = [];
        canTranslate = false;
      }
    }
  } catch (error) {
    errorMessage.innerText = 'Bản dịch thất bại: ' + JSON.stringify(error);
    $("#translatedText").html(errorMessage);
    onPostTranslate();
  }

  translation = results.join('\n');
  $("#translatedText").html(
      buildTranslatedResult(inputText.split(/\n/), translation.split(/\n/),
          $("#flexSwitchCheckShowOriginal").prop("checked")));
}

function convertText(data, useGlossary, inputText,
    translationAlgorithm = 'leftToRightTranslation') {
  try {
    data = Object.fromEntries(Object.entries(data).filter(
        (element) => (!useGlossary || !glossary.hasOwnProperty(element[0]))
            && inputText.includes(element[0])).sort(
        (a, b) => b[0].length - a[0].length));
    const dataEntries = Object.entries(data);
    const lines = inputText.split(/\n/);
    const results = [];

    for (let i = 0; i < lines.length; i++) {
      let chars = lines[i];

      if (useGlossary) {
        const MAX_GLOSSARY_LENGTH = Object.entries(glossary)[0][0].length;
        const phrases = [];
        let tempWord = '';

        for (let j = 0; j < chars.length; j++) {
          for (let k = MAX_GLOSSARY_LENGTH; k >= 1; k--) {
            if (glossary.hasOwnProperty(chars.substring(j, j + k))) {
              phrases.push(glossary[chars.substring(j, j + k)]);
              j += k - 1;
              break;
            } else if (k == 1) {
              if (tempWord.length > 0 && / /.test(chars[j]) && !/ /.test(
                  tempWord)) {
                tempWord.split(' ').forEach((element) => phrases.push(element));
                tempWord = '';
              }

              tempWord += chars[j];

              if (/ /.test(tempWord)) {
                if (!/ /.test(chars[j + 1])) {
                  phrases[phrases.length - 1] += tempWord.substring(0,
                      tempWord.length - 1);
                  tempWord = '';
                }

                break;
              }

              for (let l = MAX_GLOSSARY_LENGTH; l >= 1; l--) {
                if (tempWord.length > 0 && (glossary.hasOwnProperty(
                        chars.substring(j + 1, j + 1 + l)) || j + 1
                    == chars.length)) {
                  tempWord.split(' ').forEach(
                      (element) => phrases.push(element));
                  tempWord = '';
                  break;
                }
              }

              break;
            }
          }
        }

        chars = phrases.join(' ');
      }

      const filteredEntries = [...dataEntries].filter(
          (element) => chars.includes(element[0]));

      if (filteredEntries.length == 0) {
        results.push(chars);
        continue;
      }

      if (translationAlgorithm == 'longPrior') {
        for (const property in Object.fromEntries(filteredEntries)) {
          chars = chars.replace(new RegExp(property, 'g'),
              `${data[property]} `).trimEnd();
        }

        results.push(chars);
      } else {
        const MAX_PHRASE_LENGTH = [...filteredEntries].sort(
            (a, b) => b[0].length - a[0].length)[0][0].length;
        const phrases = [];
        let tempWord = '';

        for (let j = 0; j < chars.length; j++) {
          for (let k = MAX_PHRASE_LENGTH; k >= 1; k--) {
            if (data.hasOwnProperty(chars.substring(j, j + k))) {
              phrases.push(data[chars.substring(j, j + k)]);
              j += k - 1;
              break;
            } else if (k == 1) {
              if (tempWord.length > 0 && / /.test(chars[j]) && !/ /.test(tempWord)) {
                tempWord.split(' ').forEach((element) => phrases.push(element));
                tempWord = '';
              }

              tempWord += chars[j];

              if (/ /.test(tempWord)) {
                if (!/ /.test(chars[j + 1])) {
                  phrases[phrases.length - 1] += tempWord.substring(0,
                      tempWord.length - 1);
                  tempWord = '';
                }

                break;
              }

              for (let l = MAX_PHRASE_LENGTH; l >= 1; l--) {
                if (tempWord.length > 0 && (data.hasOwnProperty(
                        chars.substring(j + 1, j + 1 + l)) || j + 1
                    == chars.length)) {
                  tempWord.split(' ').forEach(
                      (element) => phrases.push(element));
                  tempWord = '';
                  break;
                }
              }

              break;
            }
          }
        }

        results.push(phrases.join(' '));
      }
    }

    let result = results.join('\n');

    [...punctuation].filter(
        (element) => element[0].length == 1 || element[0]
            == '\\.\\.\\.').forEach(
        (element) => result = result.replace(
            new RegExp(` ?${element[0]} ?`, 'g'),
            element[1]).split(/\n/).map((element) => element.trim()).join(
            '\n'));
    [...punctuation].filter(
        (element) => element[0].length == 3 && element[1].length == 5).forEach(
        (element) => result = result.replace(
            new RegExp(`${element[0].split('…')[0]} (.*) ${element[0].split('…')[1]}`,
                'g'),
            `${element[1].split('...')[0]}$1${element[1].split(
                '...')[1]}`).split(
            /\n/).map((element) => element.trim()).join('\n'));
    return result;
  } catch (error) {
    console.error('Bản dịch lỗi:', error);
    throw error;
  }
}

function buildTranslatedResult(textLines, resultLines, showOriginal) {
  let result = document.createElement('div');

  if (showOriginal) {
    let lostLineFixedAmount = 0;

    for (let i = 0; i < textLines.length; i++) {
      if (i < resultLines.length) {
        if (textLines[i + lostLineFixedAmount].trim().length == 0
            && resultLines[i].trim().length > 0) {
          lostLineFixedAmount++;
          i--;
          continue;
        }

        const paragraph = document.createElement('p');
        paragraph.innerHTML = getProcessTextPostTranslate(
            getProcessTextPreTranslate(resultLines[i].trim()))
        !== getProcessTextPostTranslate(getProcessTextPreTranslate(
            textLines[i + lostLineFixedAmount].trim())) ? '<i>' + textLines[i
        + lostLineFixedAmount] + '</i><br>' + resultLines[i] : textLines[i
        + lostLineFixedAmount]
        result.appendChild(paragraph);
      } else {
        result.appendChild(document.createElement('p'));
      }
    }
  } else {
    result.innerHTML = ('<p>' + resultLines.join('</p><p>') + '</p>');
  }

  return result.innerHTML.replace(/(<p>)(<\/p>)/g, '$1<br>$2');
}

function onInput() {
  $("main.container .textarea").css("height", "auto");

  const height = [
    $("#queryText").prop("scrollHeight"),
    $("#translatedText").prop("scrollHeight"),
  ].sort((a, b) => b - a)[0];

  if (height > 300) {
    $("main.container .textarea").css("height", height + "px");
  }
}

function onPreTranslate() {
  $("#translatedText").show();
  $("#queryText").hide();
  $("#translateButton").addClass("disabled");
  $("#reTranslateButton").addClass("disabled");
  $(".translator").addClass("disabled");
  $("select.option").attr("disabled", true);
  $("input.option").attr("disabled", true);
  $(".option:not([disabled])").addClass("disabled");
  $("#copyButton").addClass("disabled");
  $("#pasteButton").addClass("disabled");
  $("#imageFile").addClass("disabled");
  $("#pasteUrlButton").addClass("disabled");
  $("#clearImageButton").addClass("disabled");
  $("#translatedText").html(null);
}

function onPostTranslate() {
  onInput();
  $("#translateButton").removeClass("disabled");
  $(".option").removeAttr("disabled");
  $(".option").removeClass("disabled");
  $("#pasteButton").removeClass("disabled");
  $("#copyButton").removeClass("disabled");
  $(".translator").removeClass("disabled");
  $("#reTranslateButton").removeClass("disabled");
  $("#translateButton").text("Sửa");
}

const DeepLTranslator = {
  translateText: async function (authKey, inputText, sourceLanguage,
      targetLanguage, isConvert = false) {
    try {
      inputText = isConvert ? inputText : getDynamicDictionaryTextForAnothers(
          inputText);

      const response = await $.ajax({
        url: "https://api-free.deepl.com/v2/translate?auth_key=" + authKey,
        data: `text=${(!(targetLanguage == 'JA' || targetLanguage == 'KO'
            || targetLanguage == 'ZH') ? getProcessTextPreTranslate(inputText)
            : inputText).split(/\n/).map(
            (sentence) => encodeURIComponent(sentence)).join(
            '&text=')}${sourceLanguage != '' ? '&source_lang=' + sourceLanguage
            : ''}&target_lang=${targetLanguage}&tag_handling=html`,
        method: "POST"
      });

      return getProcessTextPostTranslate(
          response.translations.map((line) => line.text.trim()).join('\n'));
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      throw error;
    }
  }
};

const DeepLSourceLanguage = {
  'BG': 'Bulgarian',
  'CS': 'Czech',
  'DA': 'Danish',
  'DE': 'German',
  'EL': 'Greek',
  'EN': 'English',
  'ES': 'Spanish',
  'ET': 'Estonian',
  'FI': 'Finnish',
  'FR': 'French',
  'HU': 'Hungarian',
  'ID': 'Indonesian',
  'IT': 'Italian',
  'JA': 'Japanese',
  'KO': 'Korean',
  'LT': 'Lithuanian',
  'LV': 'Latvian',
  'NB': 'Norwegian (Bokmål)',
  'NL': 'Dutch',
  'PL': 'Polish',
  'PT': 'Portuguese',
  'RO': 'Romanian',
  'RU': 'Russian',
  'SK': 'Slovak',
  'SL': 'Slovenian',
  'SV': 'Swedish',
  'TR': 'Turkish',
  'UK': 'Ukrainian',
  'ZH': 'Chinese'
};

const DeepLTargetLanguage = {
  'BG': 'Bulgarian',
  'CS': 'Czech',
  'DA': 'Danish',
  'DE': 'German',
  'EL': 'Greek',
  'EN-GB': 'English (British)',
  'EN-US': 'English (American)',
  'ES': 'Spanish',
  'ET': 'Estonian',
  'FI': 'Finnish',
  'FR': 'French',
  'HU': 'Hungarian',
  'ID': 'Indonesian',
  'IT': 'Italian',
  'JA': 'Japanese',
  'KO': 'Korean',
  'LT': 'Lithuanian',
  'LV': 'Latvian',
  'NB': 'Norwegian (Bokmål)',
  'NL': 'Dutch',
  'PL': 'Polish',
  'PT-BR': 'Portuguese (Brazilian)',
  'PT-PT': 'Portuguese',
  'RO': 'Romanian',
  'RU': 'Russian',
  'SK': 'Slovak',
  'SL': 'Slovenian',
  'SV': 'Swedish',
  'TR': 'Turkish',
  'UK': 'Ukrainian',
  'ZH': 'Chinese'
};

const GoogleTranslate = {
  translateText: async function (inputText, logId, ctkk, sourceLanguage,
      targetLanguage, isConvert = false) {
    try {
      inputText = isConvert ? inputText : getDynamicDictionaryTextForAnothers(
          inputText);

      /**
       * Method: GET
       * URL: https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage}&tl=${targetLanguage}&hl=vi&dt=t&dt=bd&dj=1&q=${encodeURIComponent(inputText)}
       *
       * Method: GET
       * URL: https://translate.googleapis.com/translate_a/t?anno=3&client=wt_lib&format=html&v=1.0&key&logId=v${logId}&sl=${sourceLanguage}&tl=${targetLanguage}&tc=0${Bp(inputText, ctkk)}
       * Content-Type: application/x-www-form-urlencoded - send(encodeURIComponent(inputText))
       *
       * Method: POST
       * URL: https://translate.googleapis.com/translate_a/t?anno=3&client=te&format=html&v=1.0&key&logId=v${logId}&sl=${sourceLanguage}&tl=${targetLanguage}&tc=0${Bp(inputText, ctkk)}
       * send(encodeURIComponent(inputText))
       */
      const response = await $.ajax({
        url: `https://translate.googleapis.com/translate_a/t?anno=3&client=gtx&format=html&v=1.0&key&logId=v${logId}&sl=${sourceLanguage}&tl=${targetLanguage}&tc=0&tk=${Bp(
            getDynamicDictionaryTextForAnothers(inputText), ctkk)}`,
        data: `q=${(!(targetLanguage == 'zh-CN' || targetLanguage == 'zh-TW'
            || targetLanguage == 'ja' || targetLanguage == 'ko')
            ? getProcessTextPreTranslate(inputText) : inputText).split(
            /\n/).map((sentence) => encodeURIComponent(sentence)).join('&q=')}`,
        method: "GET"
      });

      const paragraph = document.createElement('p');
      $(paragraph).html(response.map(
          (line) => ((sourceLanguage == 'auto' ? line[0] : line).includes('<i>')
              ? (sourceLanguage == 'auto' ? line[0] : line).split(
                  '</i> <b>').filter((element) => element.includes('</b>')).map(
                  (element) => ('<b>' + element.replace(/<i>.+/, ''))).join(' ')
              : (sourceLanguage == 'auto' ? line[0] : line)).trim()).join(
          '\n'));
      return getProcessTextPostTranslate($(paragraph).text());
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      throw error;
    }
  }
};

async function getGoogleTranslateData(translator) {
  if (translator === Translators.GOOGLE_TRANSLATE) {
    try {
      const data = {};

      const elementJs = await $.get(
          CORS_PROXY
          + "https://translate.google.com/translate_a/element.js?hl=vi&client=wt");

      if (elementJs != undefined) {
        data.logId = elementJs.match(
            /_exportVersion\('(TE_\d+)'\)/)[1];
        data.ctkk = elementJs.match(/c\._ctkk='(\d+\.\d+)'/)[1];
      }

      return data;
    } catch (error) {
      console.error('Không thể lấy được Log ID hoặc Token:' + error);
      throw error
    }
  }
}

function Ap(a, b) {
  for (var c = 0; c < b.length - 2; c += 3) {
    var d = b.charAt(c + 2);
    d = "a" <= d ? d.charCodeAt(0) - 87 : Number(d);
    d = "+" == b.charAt(c + 1) ? a >>> d : a << d;
    a = "+" == b.charAt(c) ? a + d & 4294967295 : a ^ d
  }
  return a
}

function Bp(a, b) {
  var c = b.split(".");
  b = Number(c[0]) || 0;
  for (var d = [], e = 0, f = 0; f < a.length; f++) {
    var h = a.charCodeAt(f);
    128 > h ? d[e++] = h : (2048 > h ? d[e++] = h >> 6 | 192 : (55296 == (h
        & 64512) && f + 1 < a.length && 56320 == (a.charCodeAt(f + 1) & 64512)
        ? (h = 65536 + ((h & 1023) << 10) + (a.charCodeAt(++f)
            & 1023), d[e++] = h >> 18 | 240, d[e++] = h >> 12 & 63 | 128)
        : d[e++] = h >> 12 | 224, d[e++] = h >> 6 & 63 | 128), d[e++] = h & 63
        | 128)
  }
  a = b;
  for (e = 0; e < d.length; e++) {
    a += d[e], a = Ap(a, "+-a^+6");
  }
  a = Ap(a, "+-3^+b+-f");
  a ^= Number(c[1]) || 0;
  0 > a && (a = (a & 2147483647) + 2147483648);
  c = a % 1E6;
  return c.toString() +
      "." + (c ^ b)
}

const GoogleLanguage = {
  'af': 'Afrikaans',
  'sq': 'Albanian',
  'am': 'Amharic',
  'ar': 'Arabic',
  'hy': 'Armenian',
  'as': 'Assamese',
  'ay': 'Aymara',
  'az': 'Azerbaijani',
  'bm': 'Bambara',
  'eu': 'Basque',
  'be': 'Belarusian',
  'bn': 'Bengali',
  'bho': 'Bhojpuri',
  'bs': 'Bosnian',
  'bg': 'Bulgarian',
  'ca': 'Catalan',
  'ceb': 'Cebuano',
  'zh-CN': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
  'co': 'Corsican',
  'hr': 'Croatian',
  'cs': 'Czech',
  'da': 'Danish',
  'dv': 'Dhivehi',
  'doi': 'Dogri',
  'nl': 'Dutch',
  'en': 'English',
  'eo': 'Esperanto',
  'et': 'Estonian',
  'ee': 'Ewe',
  'fil': 'Filipino (Tagalog)',
  'fi': 'Finnish',
  'fr': 'French',
  'fy': 'Frisian',
  'gl': 'Galician',
  'ka': 'Georgian',
  'de': 'German',
  'el': 'Greek',
  'gn': 'Guarani',
  'gu': 'Gujarati',
  'ht': 'Haitian Creole',
  'ha': 'Hausa',
  'haw': 'Hawaiian',
  'he': 'Hebrew',
  'iw': 'Hebrew',
  'hi': 'Hindi',
  'hmn': 'Hmong',
  'hu': 'Hungarian',
  'is': 'Icelandic',
  'ig': 'Igbo',
  'ilo': 'Ilocano',
  'id': 'Indonesian',
  'ga': 'Irish',
  'it': 'Italian',
  'ja': 'Japanese',
  'jw': 'Javanese',
  'kn': 'Kannada',
  'kk': 'Kazakh',
  'km': 'Khmer',
  'rw': 'Kinyarwanda',
  'gom': 'Konkani',
  'ko': 'Korean',
  'kri': 'Krio',
  'ku': 'Kurdish',
  'ckb': 'Kurdish (Sorani)',
  'ky': 'Kyrgyz',
  'lo': 'Lao',
  'la': 'Latin',
  'lv': 'Latvian',
  'ln': 'Lingala',
  'lt': 'Lithuanian',
  'lg': 'Luganda',
  'lb': 'Luxembourgish',
  'mk': 'Macedonian',
  'mai': 'Maithili',
  'mg': 'Malagasy',
  'ms': 'Malay',
  'ml': 'Malayalam',
  'mt': 'Maltese',
  'mi': 'Maori',
  'mr': 'Marathi',
  'mni-Mtei': 'Meiteilon (Manipuri)',
  'lus': 'Mizo',
  'mn': 'Mongolian',
  'my': 'Myanmar (Burmese)',
  'ne': 'Nepali',
  'no': 'Norwegian',
  'ny': 'Nyanja (Chichewa)',
  'or': 'Odia (Oriya)',
  'om': 'Oromo',
  'ps': 'Pashto',
  'fa': 'Persian',
  'pl': 'Polish',
  'pt': 'Portuguese',
  'pa': 'Punjabi',
  'qu': 'Quechua',
  'ro': 'Romanian',
  'ru': 'Russian',
  'sm': 'Samoan',
  'sa': 'Sanskrit',
  'gd': 'Scots Gaelic',
  'nso': 'Sepedi',
  'sr': 'Serbian',
  'st': 'Sesotho',
  'sn': 'Shona',
  'sd': 'Sindhi',
  'si': 'Sinhala (Sinhalese)',
  'sk': 'Slovak',
  'sl': 'Slovenian',
  'so': 'Somali',
  'es': 'Spanish',
  'su': 'Sundanese',
  'sw': 'Swahili',
  'sv': 'Swedish',
  'tl': 'Tagalog (Filipino)',
  'tg': 'Tajik',
  'ta': 'Tamil',
  'tt': 'Tatar',
  'te': 'Telugu',
  'th': 'Thai',
  'ti': 'Tigrinya',
  'ts': 'Tsonga',
  'tr': 'Turkish',
  'tk': 'Turkmen',
  'ak': 'Twi (Akan)',
  'uk': 'Ukrainian',
  'ur': 'Urdu',
  'ug': 'Uyghur',
  'uz': 'Uzbek',
  'vi': 'Vietnamese',
  'cy': 'Welsh',
  'xh': 'Xhosa',
  'yi': 'Yiddish',
  'yo': 'Yoruba',
  'zu': 'Zulu'
}

const Papago = {
  translateText: async function (version, inputText, sourceLanguage,
      targetLanguage,
      isConvert = false) {
    try {
      inputText = isConvert ? inputText : getDynamicDictionaryTextForAnothers(
          inputText);

      const timeStamp = (new Date()).getTime();

      const response = await $.ajax({
        url: CORS_PROXY + "https://papago.naver.com/apis/n2mt/translate",
        data: `deviceId=${uuid}&locale=vi&dict=true&dictDisplay=30&honorific=true&instant=false&paging=false&source=${sourceLanguage}&target=${targetLanguage}&text=${encodeURIComponent(
            !(targetLanguage == 'ko' || targetLanguage == 'ja' || targetLanguage
                == 'zh-CN' || targetLanguage == 'zh-TW')
                ? getProcessTextPreTranslate(inputText) : inputText)}`,
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-Language": "vi",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          // "device-type": "pc" || "mobile",
          "x-apigw-partnerid": "papago",
          Authorization: "PPG " + uuid + ":" + CryptoJS.HmacMD5(
              uuid + '\n' + 'https://papago.naver.com/apis/n2mt/translate'
              + '\n' + timeStamp,
              version).toString(CryptoJS.enc.Base64),
          Timestamp: timeStamp
        }
      });

      return getProcessTextPostTranslate(response.translatedText);
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      throw error;
    }
  }
};

async function getPapagoVersion(translator) {
  if (translator === Translators.PAPAGO) {
    try {
      let version;

      const mainJs = (await $.get(
          CORS_PROXY + "https://papago.naver.com")).match(/\/(main.*\.js)/)[1];

      if (mainJs != undefined) {
        version = (await $.get(
            CORS_PROXY + "https://papago.naver.com/"
            + mainJs)).match(/"PPG .*,"(v[^"]*)/)[1];
      }

      return version;
    } catch (error) {
      console.error('Không thể lấy được Thông tin phiên bản: ' + error);
      throw error
    }
  }
}

const PapagoLanguage = {
  'ko': 'Korean',
  'ja': 'Japanese',
  'zh-CN': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
  'hi': 'Hindi',
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'pt': 'Portuguese',
  'vi': 'Vietnamese',
  'id': 'Indonesian',
  'fa': 'Persian',
  'ar': 'Arabic',
  'mm': 'Burmese',
  'th': 'Thai',
  'ru': 'Russian',
  'it': 'Italian'
};

const MicrosoftTranslator = {
  translateText: async function (accessToken, inputText, sourceLanguage,
      targetLanguage, isConvert = false) {
    try {
      inputText = isConvert ? inputText : getDynamicDictionaryText(inputText);

      /**
       *const bingTranslatorHTML = await $.get("https://cors-anywhere.herokuapp.com/https://www.bing.com/translator");
       *const IG = bingTranslatorHTML.match(/IG:"([A-Z0-9]+)"/)[1];
       *const IID = bingTranslatorHTML.match(/data-iid="(translator.\d+)"/)[1];
       *const [, key, token] = bingTranslatorHTML.match(/var params_AbusePreventionHelper\s*=\s*\[([0-9]+),\s*"([^"]+)",[^\]]*\];/);
       * Method: POST
       * URL: https://www.bing.com/ttranslatev3?isVertical=1&&IG=76A5BF5FFF374A53A1374DE8089BDFF2&IID=translator.5029
       * Content-type: application/x-www-form-urlencoded send(&fromLang=auto-detect&text=inputText&to=targetLanguage&token=kXtg8tfzQrA11KAJyMhp61NCVy-19gPj&key=1687667900500&tryFetchingGenderDebiasedTranslations=true)
       *
       * Method: POST
       * URL: https://api.cognitive.microsofttranslator.com/translate?to=${targetLanguage}&api-version=3.0&includeSentenceLength=true
       * Content-Type: application/json - send(inputText)
       *
       * Method: POST
       * URL: https://api-edge.cognitive.microsofttranslator.com/translate?to=${targetLanguage}&api-version=3.0&includeSentenceLength=true
       * Authorization: Bearer ${accessToken} - Content-Type: application/json - send(inputText)
       */
      const response = await $.ajax({
        url: `https://api.cognitive.microsofttranslator.com/translate?${sourceLanguage
        != '' ? 'from=' + sourceLanguage + '&'
            : ''}to=${targetLanguage}&api-version=3.0&textType=html&includeSentenceLength=true`,
        data: JSON.stringify(
            (!(targetLanguage == 'yue' || targetLanguage == 'lzh'
                || targetLanguage == 'zh-Hans' || targetLanguage == 'zh-Hant'
                || targetLanguage == 'ja' || targetLanguage == 'ko')
                ? getProcessTextPreTranslate(inputText) : inputText).split(
                /\n/).map((sentence) => ({"Text": sentence}))),
        method: "POST",
        headers: {
          Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json"
        }
      });

      return getProcessTextPostTranslate(
          response.map((element) => element.translations[0].text.trim()).join(
              '\n'));
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      throw error;
    }
  }
};

async function getMicrosoftTranslatorAccessToken(translator) {
  if (translator === Translators.MICROSOFT_TRANSLATOR) {
    try {
      return await $.get(
          "https://edge.microsoft.com/translate/auth");
    } catch (error) {
      console.error('Không thể lấy được Access Token: ' + error);
      throw error
    }
  }
}

function getDynamicDictionaryText(text) {
  let newText = text;

  if ($("#flexSwitchCheckGlossary").prop("checked") && Object.entries(
      glossary).length > 0) {
    const glossaryArray = Object.entries(glossary).filter(
        (element) => text.includes(element[0]));

    for (let i = 0; i < glossaryArray.length; i++) {
      newText = newText.replace(new RegExp(glossaryArray[i][0], 'g'),
          `<mstrans:dictionary translation="${glossaryArray[i][1]}">MSTRANS_DICTIONARY_${i}</mstrans:dictionary>`);
    }

    for (let i = glossaryArray.length - 1; i >= 0; i--) {
      newText = newText.replace(new RegExp(`MSTRANS_DICTIONARY_${i}`, 'g'),
          glossaryArray[i][0]);
    }
  }

  return newText;
}

const MicrosoftLanguage = {
  'af': 'Afrikaans',
  'sq': 'Albanian',
  'am': 'Amharic',
  'ar': 'Arabic',
  'hy': 'Armenian',
  'as': 'Assamese',
  'az': 'Azerbaijani (Latin)',
  'bn': 'Bangla',
  'ba': 'Bashkir',
  'eu': 'Basque',
  'bs': 'Bosnian (Latin)',
  'bg': 'Bulgarian',
  'yue': 'Cantonese (Traditional)',
  'ca': 'Catalan',
  'lzh': 'Chinese (Literary)',
  'zh-Hans': 'Chinese Simplified',
  'zh-Hant': 'Chinese Traditional',
  'hr': 'Croatian',
  'cs': 'Czech',
  'da': 'Danish',
  'prs': 'Dari',
  'dv': 'Divehi',
  'nl': 'Dutch',
  'en': 'English',
  'et': 'Estonian',
  'fo': 'Faroese',
  'fj': 'Fijian',
  'fil': 'Filipino',
  'fi': 'Finnish',
  'fr': 'French',
  'fr-ca': 'French (Canada)',
  'gl': 'Galician',
  'ka': 'Georgian',
  'de': 'German',
  'el': 'Greek',
  'gu': 'Gujarati',
  'ht': 'Haitian Creole',
  'he': 'Hebrew',
  'hi': 'Hindi',
  'mww': 'Hmong Daw (Latin)',
  'hu': 'Hungarian',
  'is': 'Icelandic',
  'id': 'Indonesian',
  'ikt': 'Inuinnaqtun',
  'iu': 'Inuktitut',
  'iu-Latn': 'Inuktitut (Latin)',
  'ga': 'Irish',
  'it': 'Italian',
  'ja': 'Japanese',
  'kn': 'Kannada',
  'kk': 'Kazakh',
  'km': 'Khmer',
  'tlh-Latn': 'Klingon',
  'tlh-Piqd': 'Klingon (plqaD)',
  'ko': 'Korean',
  'ku': 'Kurdish (Central)',
  'kmr': 'Kurdish (Northern)',
  'ky': 'Kyrgyz (Cyrillic)',
  'lo': 'Lao',
  'lv': 'Latvian',
  'lt': 'Lithuanian',
  'mk': 'Macedonian',
  'mg': 'Malagasy',
  'ms': 'Malay (Latin)',
  'ml': 'Malayalam',
  'mt': 'Maltese',
  'mi': 'Maori',
  'mr': 'Marathi',
  'mn-Cyrl': 'Mongolian (Cyrillic)',
  'mn-Mong': 'Mongolian (Traditional)',
  'my': 'Myanmar',
  'ne': 'Nepali',
  'nb': 'Norwegian',
  'or': 'Odia',
  'ps': 'Pashto',
  'fa': 'Persian',
  'pl': 'Polish',
  'pt': 'Portuguese (Brazil)',
  'pt-pt': 'Portuguese (Portugal)',
  'pa': 'Punjabi',
  'otq': 'Queretaro Otomi',
  'ro': 'Romanian',
  'ru': 'Russian',
  'sm': 'Samoan (Latin)',
  'sr-Cyrl': 'Serbian (Cyrillic)',
  'sr-Latn': 'Serbian (Latin)',
  'sk': 'Slovak',
  'sl': 'Slovenian',
  'so': 'Somali (Arabic)',
  'es': 'Spanish',
  'sw': 'Swahili (Latin)',
  'sv': 'Swedish',
  'ty': 'Tahitian',
  'ta': 'Tamil',
  'tt': 'Tatar (Latin)',
  'te': 'Telugu',
  'th': 'Thai',
  'bo': 'Tibetan',
  'ti': 'Tigrinya',
  'to': 'Tongan',
  'tr': 'Turkish',
  'tk': 'Turkmen (Latin)',
  'uk': 'Ukrainian',
  'hsb': 'Upper Sorbian',
  'ur': 'Urdu',
  'ug': 'Uyghur (Arabic)',
  'uz': 'Uzbek (Latin)',
  'vi': 'Vietnamese',
  'cy': 'Welsh',
  'yua': 'Yucatec Maya',
  'zu': 'Zulu'
};

function getDynamicDictionaryTextForAnothers(text) {
  let newText = text;

  if ($("#flexSwitchCheckGlossary").prop("checked") && $(
      "#flexSwitchCheckAllowAnothers").prop("checked") && Object.entries(
      glossary).length > 0) {
    const glossaryArray = Object.entries(glossary).filter(
        (element) => text.includes(element[0]));

    for (let i = 0; i < glossaryArray.length; i++) {
      newText = newText.replace(new RegExp(glossaryArray[i][0], 'g'),
          glossaryArray[i][1]);
    }
  }

  return newText;
}

function getProcessTextPreTranslate(text) {
  let lines = text.split(/\n/);

  const brackets = [...punctuation].filter(
      (element) => element[0].length == 3 && element[1].length == 5);

  if (text.length > 0) {
    for (let i = 0; i < brackets.length; i++) {
      lines = lines.map((element) => element.replace(
          new RegExp(`${brackets[i][0].split('…')[0]}(.*)${brackets[i][0].split('…')[1]}`,
              'g'),
          `\n[OPEN_BRACKET_${i}]\n$1\n[CLOSE_BRACKET_${i}]\n`).replace(
          new RegExp(`${brackets[i][0].split('…')[1]}(.*)${brackets[i][0].split('…')[0]}`,
              'g'), `\n[CLOSE_BRACKET_${i}]\n$1\n[OPEN_BRACKET_${i}]\n`));
    }
  }

  return lines.join('\n');
}

function getProcessTextPostTranslate(text) {
  let newText = text;

  const brackets = [...punctuation].filter(
      (element) => element[0].length == 3 && element[1].length == 5);

  if (text.length > 0) {
    for (let i = 0; i < brackets.length; i++) {
      newText = newText.replace(
          new RegExp(
              `\n\\[OPEN_BRACKET_${i}\\].*?\n+(.*)\n+.*?\\[CLOSE_BRACKET_${i}\\]\n`,
              'gi'),
          ` ${brackets[i][1].split('...')[0]}$1${brackets[i][1].split(
              '...')[1]} `).replace(
          new RegExp(`\n\\[CLOSE_BRACKET_${i}\\].*?\n+(.*)\n+.*?\\[OPEN_BRACKET_${i}\\]\n`,
              'gi'),
          `${brackets[i][1].split('...')[1]} $1 ${brackets[i][1].split(
              '...')[0]}`);
    }
  }

  return newText.split(/\n/).map((element) => element.trim()).join('\n');
}

const Translators = {
  VIETPHRASE: 'vietphrase',
  DEEPL_TRANSLATOR: 'deeplTranslator',
  GOOGLE_TRANSLATE: 'googleTranslate',
  PAPAGO: 'papago',
  MICROSOFT_TRANSLATOR: 'microsoftTranslator',
};