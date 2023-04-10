'use strict';

const { createWorker, PSM, OEM } = Tesseract;

const options = {
  corePath: '/lib/tesseract-core.wasm.js',
  langPath: 'https://tessdata.projectnaptha.com/4.0.0_best',
  workerPath: '/lib/worker.min.js',
  logger: (m) => console.log(m),
  errorHandler: function (m) {
    $("#recognizeImage").hide();
    $("#clearImageButton").removeAttr("disabled");
    $(".image-input").removeAttr("disabled");
    console.error(m);
  },
};

$(".inputType").click(function () {
  $(".inputType").removeClass("active");
  $(this).addClass("active");

  switch ($(this).attr("id")) {
    case 'url':
      $("#imageFile").hide();
      $("#imageURL").show();
      $("#pasteUrlButton").show()
      break;
    case 'local':
      $("#imageURL").hide();
      $("#pasteUrlButton").hide();
      $("#imageFile").show(); 
      break;
  }
});

$("#imageFile").on("change", () => $("#imageURL").val(URL.createObjectURL($("#imageFile").prop("files")[0])).change());

$("#imageURL").change(function () {
  if (!$(this).val().includes('http')) return;

  $(".image-input").attr("disabled", true);
  $("#clearImageButton").attr("disabled", true);

  let img = new Image();
  img.crossOrigin = 'Anonymous';

  img.onload = function () {
    let input = cv.imread(this);
      if ($("#flexCheckGrayscale").prop("checked")) {
      cv.cvtColor(input, input, cv.COLOR_RGBA2GRAY, 0);
    }

    if ($("#flexCheckThreshold").prop("checked")) {
      cv.threshold(input, input, 127, 255, $("#flexCheckGrayscale").prop("checked") ? cv.THRESH_BINARY_INV : cv.THRESH_BINARY);
    }

    cv.imshow('recognizeImage', input); 
    $("#recognizeImage").show();
    input.delete();

    recognize(
        document.querySelector('#recognizeImage').toDataURL(),
        $("#recognizeLangsSelect").val().join('+'),
        {
          tessedit_pageseg_mode: $("#recognizeLangsSelect").val().join('+').includes('_vert') ? PSM.AUTO : PSM.SINGLE_BLOCK,
          tessedit_ocr_engine_mode: OEM.LSTM_ONLY,
        }).then(function ({ data: { blocks, text } }) {
          cv.imshow('recognizeImage', cv.imread(img));

          if (blocks.length > 0) {
            _.each(blocks[0].paragraphs[0].lines, function (line) {
              let output = cv.imread('recognizeImage');
              cv.rectangle(output, new cv.Point(line.bbox.x0, line.bbox.y0), new cv.Point(line.bbox.x1, line.bbox.y1), new cv.Scalar(255, 0, 0, 255), 2);
              cv.imshow('recognizeImage', output);
              output.delete();
            });
          }

          $("#queryText").val(text).change();
          $(".image-input").removeAttr("disabled");
          $("#clearImageButton").removeAttr("disabled");
        });
  };

  img.src = $(this).val();
});

$("#imageURL").on("dragend", (event) => event.dataTransfer != null && $(this).val(event.dataTransfer.getData('text/plain')).change());

$("#imageURL").on("moveend", (event) => event.dataTransfer != null && $(this).val(event.dataTransfer.getData('text/plain')).change());

$("#pasteUrlButton").on("click", () => navigator.clipboard.readText().then((text) => $("#imageURL").val(text).change()));

$("#clearImageButton").on("click", function () {
  $("#recognizeImage").hide();
  $(".image-input").removeAttr("disabled");
  $("#recognizeImage").hide();
  $(".image-input").val(null); 
});

$(".option").on("change", () => localStorage.setItem("recognizer", JSON.stringify({langs: $("#recognizeLangsSelect").val(), grayscale: $("#flexCheckGrayscale").prop("checked"), threshold: $("#flexCheckThreshold").prop("checked")})));

async function recognize(image, langs, parameters) {
  const worker = await createWorker(options);
  await worker.loadLanguage(langs);
  await worker.initialize(langs);
  await worker.setParameters(parameters);
  return worker.recognize(image)
    .finally(async () => await worker.terminate());
}