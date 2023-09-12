'use strict';

let translator = JSON.parse(localStorage.getItem("translator"));

const DEEPL_AUTH_KEY = 'a4b25ba2-b628-fa56-916e-b323b16502de:fx';
const uuid = crypto.randomUUID();

let pinyins = {};
let sinovietnameses = {};
let vietphrases = {};

const extendsSinovietnamese = {
  '团长': 'đoàn trưởng',
  '少爷': 'thiếu gia',
  '传功': 'truyền công',
  '县': 'huyện',
  '姐': 'thư',
  '将': 'tướng',
}

let translateTask;
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
    sinovietnameses = {
      ...extendsSinovietnamese, ...Object.fromEntries(sinovietnameseList)
    };
    console.log('Đã tải xong bộ dữ liệu hán việt!');
  }).fail((jqXHR, textStatus, errorThrown) => {
    window.location.reload();
  });
  $("#queryText").trigger("input");
});

$(visualViewport).resize((event) => {
  $("#queryText").css("max-height", event.target.height - 248 + "px");
});

$("#translateButton").click(async function () {
  if (translateTask != undefined) {
    translator.terminate();
  }

  if ($(this).text() == 'Dịch') {
    if ($("#queryText").val().length > 0) {
      $("#translatedText").show();
      $("#queryText").hide();
      $("#copyButton").addClass("disabled");
      $("#pasteButton").addClass("disabled");
      $("#imageFile").addClass("disabled");
      $("#pasteUrlButton").addClass("disabled");
      $("#clearImageButton").addClass("disabled");
      $("#translatedText").html(null);
      translateTask = await translate($("#queryText").val()).finally(
          () => onPostTranslate());
    }
  } else if ($(this).text() == 'Sửa') {
    $("#translatedText").hide();
    $("#queryText").show();
    $("#clearImageButton").removeClass("disabled");
    $("#pasteUrlButton").removeClass("disabled");
    $("#imageFile").removeClass("disabled");
    $("#retranslateButton").addClass("disabled");
    translation = '';
    $(this).text("Dịch");
  }
});

$("#copyButton").on("click", () => {
  const data = $("#translateButton").text() == 'Sửa' ? translation : $(
      "#queryText").val();

  if (data.length > 0) {
    navigator.clipboard.writeText(data);
  }
});

$("#pasteButton").on("click", () => {
  navigator.clipboard
  .readText()
  .then((clipText) => {
    if (clipText.length > 0) {
      window.scrollTo({top: 0, behavior: 'smooth'});
      $("#queryText").val(clipText).trigger("input");
      if ($("#translateButton").text() == 'Sửa') $("#retranslateButton").click();
    }
  });
});

$("#retranslateButton").click(() => {
  translation = '';
  $("#translateButton").text("Dịch").click();
});

$("#queryText").on("input", () => {
  $("#queryText").css("height", "auto");
  $("#queryText").css("height", $("#queryText").prop("scrollHeight") + "px");
  $("#queryTextCounter").text($("#queryText").val().length);
});

$(".modal").on("hidden.bs.modal", () => $(document.body).removeAttr("style"));

$(".modal").on("shown.bs.modal", () => $(document.body).css("overflow", "hidden"));

$(".option").change(() => {
  translator = loadTranslatorOptions();
  localStorage.setItem("translator", JSON.stringify(translator));
  if ($("#translateButton").text() == 'Sửa') $("#retranslateButton").click();
});

$(".translator").click(function () {
  if (!$(this).hasClass("disabled")) {
    const prevTranslator = translator['translator'];

    const prevSourceLanguageCode = translator['sourceLangSelect'];
    const prevTargetLanguageCode = translator['targetLangSelect'];
    const prevSourceLanguageName = getLanguageName(prevTranslator,
        prevSourceLanguageCode);
    const prevTargetLanguageName = getLanguageName(prevTranslator,
        prevTargetLanguageCode);

    $(".translator").removeClass("active");
    $(this).addClass("active");
    console.log($(this).data("id"));

    $("#sourceLangSelect").html(getSourceLanguageOptions($(this).data("id")));

    $("#sourceLangSelect > option").each(function (index) {
      if ($(".translator.active").data("id") === prevTranslator
          && prevSourceLanguageCode != null) {
        $("#sourceLangSelect").val(prevSourceLanguageCode);
        return false;
      } else if (prevSourceLanguageCode != null && (prevSourceLanguageName != null && $(this).text().replace(/[()]/g, '') == prevSourceLanguageName.replace(/[()]/g, '') || $(this).val().toLowerCase() == prevSourceLanguageCode.toLowerCase() || (prevSourceLanguageName != null && $(this).text().includes($(this).text().split(' ').length == 2 && prevSourceLanguageName.split(' ').length == 2 ? prevSourceLanguageName.replace(/[()]/g, '').split(' ')[1] : prevSourceLanguageName.replace(/[()]/g, '').split(' ')[0]) && $(this).val().toLowerCase().split('-')[0] == prevSourceLanguageCode.toLowerCase().split('-')[0]) || ($(this).val().toLowerCase().split('-')[0] == prevSourceLanguageCode.toLowerCase().split('-')[0]))) {
        $("#sourceLangSelect").val($(this).val());
        return false;
      } else if (index + 1 == $("#sourceLangSelect > option").length) {
        $("#sourceLangSelect").val(
            getDefaultSourceLanguage($(".translator.active").data("id")));
      }
    });

    $("#targetLangSelect").html(getTargetLanguageOptions($(this).data("id")));

    $("#targetLangSelect > option").each(function (index) {
      if ($(".translator.active").data("id") === prevTranslator
          && prevTargetLanguageCode != null) {
        $("#targetLangSelect").val(prevTargetLanguageCode);
        return false;
      } else if (prevTargetLanguageCode != null && (prevTargetLanguageName != null && $(this).text().replace(/[()]/g, '') == prevTargetLanguageName.replace(/[()]/g, '') || $(this).val().toLowerCase() == prevTargetLanguageCode.toLowerCase() || (prevTargetLanguageName != null && $(this).text().includes($(this).text().split(' ').length == 2 && prevTargetLanguageName.split(' ').length == 2 ? prevTargetLanguageName.replace(/[()]/g, '').split(' ')[1] : prevTargetLanguageName.replace(/[()]/g, '').split(' ')[0]) && $(this).val().toLowerCase().split('-')[0] == prevTargetLanguageCode.toLowerCase().split('-')[0]) || ($(this).val().toLowerCase().split('-')[0] == prevTargetLanguageCode.toLowerCase().split('-')[0]))) {
        if ($(".translator.active").data("id") === Translators.DEEPL_TRANSLATOR && prevTargetLanguageName == 'English') {
          $("#targetLangSelect").val("EN-US");
        } else {
          $("#targetLangSelect").val($(this).val());
        }
        return false;
      } else if (index + 1 == $("#targetLangSelect > option").length) {
        $("#targetLangSelect").val(
            getDefaultTargetLanguage($(".translator.active").data("id")));
      }
    });

    translator['translator'] = $(this).data("id");

    for (let i = 0; i < $(".option").length; i++) {
      if ($(".option")[i].id == 'sourceLangSelect') {
        translator[$(".option")[i].id] = $(".option")[i].value;
      } else if ($(".option")[i].id == 'targetLangSelect') {
        translator[$(".option")[i].id] = $(".option")[i].value;
      }
    }

    localStorage.setItem("translator", JSON.stringify(translator));
    if ($("#translateButton").text() == 'Sửa') $("#retranslateButton").click();
  }
});

$("#inputVietPhrases").on("change", function () {
  const reader = new FileReader();

  reader.onload = function () {
    let vietphraseList = this.result.split(/\r?\n/).map((phrase) => phrase.split($("#inputVietPhrases").prop("files")[0].type == 'text/tab-separated-values' ? '\t' : '=')).filter((phrase) => phrase.length == 2).map((element) => [element[0].replace(/[/\[\]\-.\\|^$!=<()*+?{}]/g, '\\$&'), element[1].split('/')[0].split('|')[0]]);
    vietphraseList = [...vietphraseList,
      ...Object.entries(sinovietnameses)].filter(
        ([key]) => !vietphraseList[key] && (vietphraseList[key] = 1), {})
    vietphrases = Object.fromEntries(vietphraseList);
    console.log('Đã tải xong tệp dữ liệu VietPhrase.txt!');
  }
  reader.readAsText($(this).prop("files")[0]);
});

function loadTranslatorOptions() {
  const data = {};
  data['translator'] = $(".translator.active").data("id");

  for (let i = 0; i < $(".option").length; i++) {
    if ($(".option")[i].id.startsWith('flexSwitchCheck') && $(
        ".option")[i].checked == true) {
      data[$(".option")[i].id] = $(".option")[i].checked;
    } else if ($(".option")[i].name.startsWith('flexRadio') && $(
        ".option")[i].checked == true) {
      data[$(".option")[i].name] = $(".option")[i].value;
    } else if ($(".option")[i].className.includes('form-select') && $(
        ".option")[i].value != '') {
      data[$(".option")[i].id] = $(".option")[i].value;
    }
  }

  return data;
}

function getDefaultSourceLanguage(translator) {
  switch (translator) {
    case Translators.DEEPL_TRANSLATOR:
    case Translators.MICROSOFT_TRANSLATOR:
      return '';

    case Translators.VIETPHRASE:
      return 'zh';

    default:
      return 'auto';
  }
}

function getDefaultTargetLanguage(translator) {
  switch (translator) {
    case Translators.DEEPL_TRANSLATOR:
      return 'EN-US';

    default:
      return 'vi';
  }
}

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
      autoDetectOption.innerText = 'Tiếng Trung';
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

async function translate(inputText) {
  const translator = $(".translator.active").data("id");

  const sourceLanguage = $("#sourceLangSelect").val();
  const targetLanguage = $("#targetLangSelect").val();

  const isCjkTargetLanguage = !(targetLanguage == 'JA' || targetLanguage == 'KO'
          || targetLanguage == 'ZH') || !(targetLanguage == 'zh-CN'
          || targetLanguage == 'zh-TW' || targetLanguage == 'ja' || targetLanguage
          == 'ko') || !(targetLanguage == 'ko' || targetLanguage == 'ja'
          || targetLanguage == 'zh-CN' || targetLanguage == 'zh-TW')
      || !(targetLanguage == 'yue' || targetLanguage == 'lzh' || targetLanguage
          == 'zh-Hans' || targetLanguage == 'zh-Hant' || targetLanguage == 'ja'
          || targetLanguage == 'ko');

  const errorMessage = document.createElement("p");

  try {
    const processText = getProcessTextPreTranslate(inputText,
        $("#flexSwitchCheckProtectQuotationMarks").prop("checked") && translator
        !== Translators.VIETPHRASE && isCjkTargetLanguage);
    const results = [];

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
        MAX_LENGTH = 3000;
        MAX_LINE = 1500;
        break;

      case Translators.MICROSOFT_TRANSLATOR:
        MAX_LENGTH = 50000;
        MAX_LINE = 1000;
        break;

      default:
        MAX_LENGTH = processText.length;
        MAX_LINE = processText.split(/\n/).length;
        break;
    }

    if (processText.split(/\n/).sort((a, b) => b.length - a.length)[0].length
        > MAX_LENGTH) {
      errorMessage.innerText = `Bản dịch thất bại: Số lượng từ trong một dòng quá dài (Số lượng từ hợp lệ nhỏ hơn hoặc bằng ${MAX_LENGTH}). [Lưu ý: Khi sử dụng Dynamic Dictionary và Bảo vệ dấu trích đẫn sẽ làm giảm số lượng từ có thể dịch đi.]`;
      $("#translatedText").append(errorMessage);
      onPostTranslate();
      return;
    }

    if (translator === Translators.DEEPL_TRANSLATOR) {
      const deeplUsage = (await $.get(
              "https://api-free.deepl.com/v2/usage?auth_key=" + DEEPL_AUTH_KEY))
          ?? {"character_count": 500000, "character_limit": 500000};

      if (processText.length > (deeplUsage.character_limit
          - deeplUsage.character_count)) {
        errorMessage.innerText = `Lỗi DeepL: Đã đạt đến giới hạn dịch của tài khoản. (${deeplUsage.character_count}/${deeplUsage.character_limit} ký tự). [Lưu ý: Khi sử dụng Dynamic Dictionary và Bảo vệ dấu trích đẫn sẽ làm giảm số lượng từ có thể dịch đi.]`;
        $("#translatedText").html(errorMessage);
        onPostTranslate();
        return;
      }
    }

    const googleTranslateData = translator === Translators.GOOGLE_TRANSLATE
        ? await getGoogleTranslateData(translator) : null;

    if (translator === Translators.GOOGLE_TRANSLATE
        && (googleTranslateData.logId == undefined || googleTranslateData.ctkk
            == undefined)) {
      errorMessage.innerText = 'Không thể lấy được Log ID hoặc Token từ element.js.';
      $("#translatedText").html(errorMessage);
      return;
    }

    const papagoVersion = translator === Translators.PAPAGO
        ? await getPapagoVersion(translator) : null;

    if (translator === Translators.PAPAGO && papagoVersion == undefined) {
      errorMessage.innerText = 'Không thể lấy được Thông tin phiên bản từ main.js.';
      $("#translatedText").html(errorMessage);
      return;
    }

    const microsoftTranslatorAccessToken = translator
    === Translators.MICROSOFT_TRANSLATOR
        ? await getMicrosoftTranslatorAccessToken(translator) : null;

    if (translator === Translators.MICROSOFT_TRANSLATOR
        && microsoftTranslatorAccessToken == undefined) {
      errorMessage.innerText = 'Không thể lấy được Access Token từ máy chủ.';
      $("#translatedText").html(errorMessage);
      return;
    }

    const queryLines = processText.split(/\n/);
    let translateLines = [];

    let canTranslate = false;

    for (let i = 0; i < processText.split(/\n/).length; i++) {
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
                targetLanguage, true);
            break;

          default:
          case Translators.GOOGLE_TRANSLATE:
            translatedText = await GoogleTranslate.translateText(
                googleTranslateData, translateText, sourceLanguage,
                targetLanguage, true);
            break;

          case Translators.PAPAGO:
            translatedText = await Papago.translateText(papagoVersion,
                translateText,
                sourceLanguage, targetLanguage, true);
            break;

          case Translators.MICROSOFT_TRANSLATOR:
            translatedText = await MicrosoftTranslator.translateText(
                microsoftTranslatorAccessToken, translateText, sourceLanguage,
                targetLanguage, true);
            break;

          case Translators.VIETPHRASE:
            if ($("#targetLangSelect").val() == 'vi' && Object.entries(
                vietphrases).length > 0) {
              translatedText = convertText(translateText, vietphrases, true,
                  $("#flexSwitchCheckGlossary").prop("checked"),
                  $("input[name=\"flexRadioTranslationAlgorithm\"]:checked").val());
            } else if ($("#targetLangSelect").val() == 'zh-VN'
                && Object.entries(sinovietnameses).length > 0) {
              translatedText = convertText(translateText, sinovietnameses, true,
                  false,
                  VietPhraseTranslationAlgorithms.LEFT_TO_RIGHT_TRANSLATION);
            } else if ($("#targetLangSelect").val() == 'en' && Object.entries(
                pinyins).length > 0) {
              translatedText = convertText(translateText, pinyins, true, false,
                  VietPhraseTranslationAlgorithms.LEFT_TO_RIGHT_TRANSLATION);
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

    translation = getProcessTextPostTranslate(results.join('\n'));
    $("#translatedText").html(buildTranslatedResult(
        [inputText, getProcessTextPostTranslate(processText)], translation,
        $("#flexSwitchCheckShowOriginal").prop("checked")));
  } catch (error) {
    errorMessage.innerText = 'Bản dịch thất bại: ' + JSON.stringify(error);
    $("#translatedText").html(errorMessage);
    onPostTranslate();
  }
}

function buildTranslatedResult(inputTexts, translation, showOriginal) {
  let result = document.createElement('div');

  const inputTextParagraph = document.createElement('p');
  $(inputTextParagraph).text(inputTexts[0]);
  const inputLines = $(inputTextParagraph).html().split(/\n/);

  const processTextParagraph = document.createElement('p');
  $(inputTextParagraph).text(inputTexts[1]);
  const processLines = $(processTextParagraph).html().split(/\n/);

  const translationParagraph = document.createElement('p');
  $(translationParagraph).text(translation);
  const resultLines = $(translationParagraph).html().split(/\n/);

  if (showOriginal) {
    let lostLineFixedAmount = 0;

    for (let i = 0; i < inputLines.length; i++) {
      if (i < resultLines.length) {
        if (inputLines[i + lostLineFixedAmount].trim().length == 0
            && resultLines[i].trim().length > 0) {
          lostLineFixedAmount++;
          i--;
          continue;
        }

        const paragraph = document.createElement('p');
        paragraph.innerHTML = resultLines[i].trim() != processLines[i
        + lostLineFixedAmount] ? `<i>${inputLines[i
            + lostLineFixedAmount].trimStart()}</i><br>${resultLines[i].trimStart()}`
            : processLines[i + lostLineFixedAmount].trimStart();
        result.appendChild(paragraph);
      } else {
        const paragraph = document.createElement('p');
        paragraph.innerHTML = `<i>${inputLines[i
        + lostLineFixedAmount].trimStart()}</i>`;
        result.appendChild(paragraph);
      }
    }
  } else {
    result.innerHTML = `<p>${resultLines.map(
        (element) => element.trimStart()).join('</p><p>')}</p>`;
  }
  return result.innerHTML.replace(/(<p>)(<\/p>)/g, '$1<br>$2');
}

function convertText(inputText, data, caseSensitive, useGlossary,
    translationAlgorithm) {
  try {
    data = Object.fromEntries(Object.entries(data).filter(
        (element) => (!useGlossary || !glossary.hasOwnProperty(element[0]))
            && inputText.includes(element[0])).sort(
        (a, b) => b[0].length - a[0].length));
    const glossaryEntries = Object.entries(glossary).filter(
        (element) => inputText.includes(element[0]));
    const dataEntries = Object.entries(data);

    const punctuationEntries = [...cjkmap].filter(
        (element) => element[0] == '…' || element[0].split('…').length != 2);
    const punctuation = Object.fromEntries(punctuationEntries);

    const results = [];
    let result = inputText;
    const lines = getProcessTextPreTranslate(inputText, true).split(/\n/);

    for (let i = 0; i < lines.length; i++) {
      let chars = lines[i];

      if (chars.trim().length == 0 || /^\[(?:OPEN|CLOSE)_BRACKET_\d+\]/.test(
          chars)) {
        punctuationEntries.forEach((element) => chars = chars.replace(
            new RegExp(element[0].replace(/[/\[\]\-.\\|^$!=<()*+?{}]/g, '\\$&'),
                'g'), element[1]));
        results.push(chars);
        continue;
      }

      const filteredEntries = [...dataEntries].filter(
          (element) => chars.includes(element[0]));

      if (useGlossary && glossaryEntries.length > 0) {
        const MAX_GLOSSARY_LENGTH = glossaryEntries[0][0].length;
        const phrases = [];
        let tempWord = '';

        for (let j = 0; j < chars.length; j++) {
          for (let k = MAX_GLOSSARY_LENGTH; k >= 1; k--) {
            if (glossary.hasOwnProperty(chars.substring(j, j + k))) {
              phrases.push(glossary[chars.substring(j, j + k)]);
              j += k - 1;
              break;
            } else if (k == 1) {
              if (tempWord.length > 0 && /\p{White_Space}/u.test(chars[j])
                  && !/\p{White_Space}/u.test(
                      tempWord)) {
                tempWord.split(' ').forEach((element) => phrases.push(element));
                tempWord = '';
              }

              tempWord += chars[j];

              if (/\p{White_Space}/u.test(tempWord)) {
                if (!/\p{White_Space}/u.test(chars[j + 1])) {
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

      if (filteredEntries.length == 0) {
        results.push(chars);
        continue;
      }

      if (translationAlgorithm
          === VietPhraseTranslationAlgorithms.LONG_VIETPHRASE_PRIOR) {
        for (const property in Object.fromEntries(filteredEntries)) {
          punctuationEntries.forEach((element) => chars = chars.replace(
              new RegExp(
                  element[0].replace(/[/\[\]\-.\\|^$!=<()*+?{}]/g, '\\$&'),
                  'g'), element[1]));
          chars = chars.replace(
              new RegExp(`${property}(?=$|(?:[!,.:;?]\\s+|["'\\p{Pe}\\p{Pf}]\\s*))`,
                  'gu'), data[property]).replace(new RegExp(property, 'g'),
              `${data[property]} `);
        }

        results.push(chars);
      } else if (translationAlgorithm
          === VietPhraseTranslationAlgorithms.LEFT_TO_RIGHT_TRANSLATION) {
        const MAX_PHRASE_LENGTH = [...filteredEntries].sort(
            (a, b) => b[0].length - a[0].length)[0][0].length;
        const phrases = [];
        let tempWord = '';

        for (let j = 0; j < chars.length; j++) {
          for (let k = MAX_PHRASE_LENGTH; k >= 1; k--) {
            if (data.hasOwnProperty(chars.substring(j, j + k))) {
              if (data[chars.substring(j, j + k)].length > 0) {
                if (punctuation.hasOwnProperty(chars[j - 1]) && /[\u{3000}-\u{303f}\u{30a0}-\u{30ff}\u{fe30}-\u{fe4f}\u{ff00}-\u{ff60}]/u.test(chars[j - 1])) {
                  phrases.push((phrases.pop() ?? '') + data[chars.substring(j, j + k)]);
                } else {
                  phrases.push(data[chars.substring(j, j + k)]);
                }
              }

              j += k - 1;
              break;
            } else if (k == 1) {
              if (tempWord.length > 0 && /\p{White_Space}/u.test(chars[j])
                  && !/\p{White_Space}/u.test(
                      tempWord)) {
                tempWord.split(' ').forEach((element) => phrases.push(element));
                tempWord = '';
              }

              if (punctuation.hasOwnProperty(chars[j])) {
                if (lines[i].startsWith(chars[j]) || tempWord.length > 0) {
                  tempWord += punctuation[chars[j]];
                } else {
                  phrases.push((phrases.pop() ?? '') + punctuation[chars[j]]);
                  break;
                }
              } else {
                tempWord += chars[j];
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

    result = getProcessTextPostTranslate(results.join('\n'));
    return caseSensitive ? result.split(/\n/).map((element => element.replace(
        /(^|\s*(?:[!\-.:;?]\s+|["'\p{Ps}\p{Pi}]\s*))(\p{Lower})/gu,
        (match, p1, p2) => p1 + p2.toUpperCase()))).join('\n') : result;
  } catch (error) {
    console.error('Bản dịch lỗi:', error);
    throw error;
  }
}

function getProcessTextPreTranslate(text, doProtectQuotationMarks) {
  let newText = text;

  if (text.length > 0) {
    try {
      if (doProtectQuotationMarks) {
        const brackets = [...cjkmap].filter(
            (element) => element[0] != '…' && element[0].split('…').length
                == 2);

        for (let i = 0; i < brackets.length; i++) {
          newText = newText.replace(
              new RegExp(`${brackets[i][0].split('…')[0]}(?!(?:OPEN|CLOSE)_BRACKET_\\d+)`,
                  'g'), `[OPEN_BRACKET_${i}]`).replace(
              new RegExp(brackets[i][0].split('…')[1], 'g'),
              (match, offset) => {
                for (let j = i; j >= 0; j--) {
                  if (/CLOSE_BRACKET_\d+/.test(
                      newText.substring(offset - `CLOSE_BRACKET_${j}`.length,
                          offset)) || /OPEN_BRACKET_\d+/.test(
                      newText.substring(offset - `OPEN_BRACKET_${j}`.length,
                          offset))) {
                    return match;
                  } else if (j == 0) {
                    return `[CLOSE_BRACKET_${i}]`;
                  }
                }
              });
        }

        newText = newText.replace(/(\[OPEN_BRACKET_\d+\])/g, '\n$1\n').replace(/(\[CLOSE_BRACKET_\d+\])([!,.:;?\u{3001}\u{3002}\u{ff01}\u{ff0c}\u{ff0e}\u{ff1a}\{ff1b}\u{ff1f}]?)/gu, '\n$1$2\n');
      }
    } catch (error) {
      console.error('Lỗi xử lý văn bản trước khi dịch:', error);
      throw error;
    }
  }

  return newText.split(/\n/).map((element) => element.trim()).join('\n');
}

function getProcessTextPostTranslate(text) {
  let newText = text;

  if (text.length > 0) {
    try {
      const brackets = [...cjkmap].filter(
          (element) => element[0] != '…' && element[0].split('…').length == 2);

      for (let i = brackets.length - 1; i >= 0; i--) {
        if (/[\u{3000}-\u{303f}\u{30a0}-\u{30ff}\u{fe30}-\u{fe4f}\u{ff00}-\u{ff60}]/u.test(
            brackets[i][1])) {
          newText = newText.replace(
              new RegExp(`\\p{White_Space}?\n\\[OPEN_BRACKET_${i}\\]\n`, 'giu'),
              brackets[i][1].split('...')[0]).replace(
              new RegExp(`\n\\[CLOSE_BRACKET_${i}\\](.*)\n`, 'gi'),
              `${brackets[i][1].split('...')[1]}$1`);
        } else {
          newText = newText.replace(
              new RegExp(`\n\\[OPEN_BRACKET_${i}\\]\n`, 'gi'),
              ` ${brackets[i][1].split('...')[0]}`).replace(
              new RegExp(`\n\\[CLOSE_BRACKET_${i}\\](.*)\n`, 'gi'),
              `${brackets[i][1].split('...')[1]}$1 `);
        }
      }
    } catch (error) {
      console.error('Lỗi xử lý văn bản sau khi dịch:', error);
      throw error;
    }
  }

  return newText.split(/\n/).map((element) => element.trim()).join('\n');
}

function onPostTranslate() {
  $("#translatedText").css("height", "auto");
  $("#translatedText").css("height",
      $("#translatedText").prop("scrollHeight") + "px");
  $("#pasteButton").removeClass("disabled");
  $("#copyButton").removeClass("disabled");
  $(".translator").removeClass("disabled");
  $("#retranslateButton").removeClass("disabled");
  $("#translateButton").text("Sửa");
}

const DeepLTranslator = {
  translateText: async function (authKey, inputText, sourceLanguage,
      targetLanguage, useGlossary = false) {
    try {
      inputText = useGlossary ? getDynamicDictionaryText(inputText, false)
          : inputText;

      const response = await $.ajax({
        url: "https://api-free.deepl.com/v2/translate?auth_key=" + authKey,
        data: `text=${inputText.split(/\n/).map(
            (sentence) => encodeURIComponent(sentence)).join(
            '&text=')}${sourceLanguage != '' ? '&source_lang=' + sourceLanguage
            : ''}&target_lang=${targetLanguage}&tag_handling=html`,
        method: "POST"
      });
      return response.translations.map((line) => line.text.trim()).join('\n');
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
  translateText: async function (data, inputText, sourceLanguage,
      targetLanguage, useGlossary = false) {
    try {
      inputText = useGlossary ? getDynamicDictionaryText(inputText, false)
          : inputText;

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
        url: `https://translate.googleapis.com/translate_a/t?anno=3&client=gtx&format=html&v=1.0&key&logId=v${data.logId}&sl=${sourceLanguage}&tl=${targetLanguage}&tc=0&tk=${Bp(
            inputText, data.ctkk)}`,
        data: `q=${inputText.split(/\n/).map(
            (sentence) => encodeURIComponent(sentence)).join('&q=')}`,
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
      return $(paragraph).text();
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
      useGlossary = false) {
    try {
      inputText = useGlossary ? getDynamicDictionaryText(inputText, false)
          : inputText;

      const timeStamp = (new Date()).getTime();

      const response = await $.ajax({
        url: CORS_PROXY + "https://papago.naver.com/apis/n2mt/translate",
        data: `deviceId=${uuid}&locale=vi&dict=true&dictDisplay=30&honorific=true&instant=false&paging=false&source=${sourceLanguage}&target=${targetLanguage}&text=${encodeURIComponent(
            inputText)}`,
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
      return response.translatedText;
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
      targetLanguage, useGlossary = false) {
    try {
      inputText = useGlossary ? getDynamicDictionaryText(inputText) : inputText;

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
        != '' ? `from=${sourceLanguage}&`
            : ''}to=${targetLanguage}&api-version=3.0&textType=html&includeSentenceLength=true`,
        data: JSON.stringify(inputText.split(
            /\n/).map((sentence) => ({"Text": sentence}))),
        method: "POST",
        headers: {
          Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json"
        }
      });
      return response.map(
          (element) => element.translations[0].text.trim()).join('\n');
    } catch (error) {
      console.error('Bản dịch lỗi:', error);
      throw error;
    }
  }
};

async function getMicrosoftTranslatorAccessToken(translator) {
  if (translator === Translators.MICROSOFT_TRANSLATOR) {
    try {
      return await $.get("https://edge.microsoft.com/translate/auth");
    } catch (error) {
      console.error('Không thể lấy được Access Token: ' + error);
      throw error
    }
  }
}

function getDynamicDictionaryText(text, isMicrosoftTranslator = true) {
  const glossaryEntries = Object.entries(glossary).filter(
      (element) => text.includes(element[0]));
  let newText = text;

  if ($("#flexSwitchCheckGlossary").prop("checked") && (isMicrosoftTranslator
          || $("#flexSwitchCheckAllowAnothers").prop("checked"))
      && glossaryEntries.length > 0) {
    const lines = text.split(/\n/);
    const results = [];

    for (let i = 0; i < lines.length; i++) {
      let chars = lines[i];

      const MAX_GLOSSARY_LENGTH = glossaryEntries[0][0].length;
      const phrases = [];
      let tempWord = '';

      for (let j = 0; j < chars.length; j++) {
        for (let k = MAX_GLOSSARY_LENGTH; k >= 1; k--) {
          if (glossary.hasOwnProperty(chars.substring(j, j + k))) {
            phrases.push(isMicrosoftTranslator
                ? `<mstrans:dictionary translation="${glossary[chars.substring(
                    j, j + k)]}">${chars.substring(j,
                    j + k)}</mstrans:dictionary>` : glossary[chars.substring(j,
                    j + k)]);
            j += k - 1;
            break;
          } else if (k == 1) {
            if (tempWord.length > 0 && /\p{White_Space}/u.test(chars[j])
                && !/\p{White_Space}/u.test(
                    tempWord)) {
              tempWord.split(' ').forEach((element) => phrases.push(element));
              tempWord = '';
            }

            tempWord += chars[j];

            if (/\p{White_Space}/u.test(tempWord)) {
              if (!/\p{White_Space}/u.test(chars[j + 1])) {
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

      results.push(phrases.join(' '));
    }

    newText = results.join('\n');
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

const Translators = {
  VIETPHRASE: 'vietphrase',
  DEEPL_TRANSLATOR: 'deeplTranslator',
  GOOGLE_TRANSLATE: 'googleTranslate',
  PAPAGO: 'papago',
  MICROSOFT_TRANSLATOR: 'microsoftTranslator',
};

const VietPhraseTranslationAlgorithms = {
  LEFT_TO_RIGHT_TRANSLATION: 'leftToRightTranslation',
  LONG_VIETPHRASE_PRIOR: 'longVietPhrasePrior',
};