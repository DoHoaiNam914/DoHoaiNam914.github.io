'use strict';

const LANG_FORMAT = new Map([
  ['auto', 'vie+eng+jpn_vert+jpn+chi_tra+chi_tra_vert+chi_sim+chi_sim_vert'],
  ['en', 'eng'],
  ['ja', 'jpn+jpn_vert'],
  ['zh-CN', 'chi_sim+chi_sim_vert'],
  ['zh-TW', 'chi_tra+chi_tra_vert'],
  ['vi', 'vie']
]);

const { createWorker, PSM, OEM } = Tesseract;
const recognize = async (image, langs, options) => {
  const worker = await createWorker(options);
  await worker.loadLanguage(langs);
  await worker.initialize(langs);
  await worker.setParameters({
      tessedit_pageseg_mode: /*$("#pagesegMode").val().replace('SINGLE_BLOCK', lang.includes('_vert') ? PSM.SINGLE_BLOCK_VERT_TEXT : */PSM.SINGLE_BLOCK/*)*/,
      tessedit_ocr_engine_mode: OEM.LSTM_ONLY
    });
  return worker.recognize(image)
    .finally(async () => {
      await worker.terminate();
    });
};

$("#imageFile").on("change", async function () {
  $("#clearImageButton").attr("disabled", true);

  let recognization = await recognize(this.files[0], LANG_FORMAT.get($("#sourceLangSelect").val()), {
    workerPath: '/lib/worker.min.js',
    langPath: 'https://tessdata.projectnaptha.com/4.0.0_best',
    corePath: '/lib/tesseract-core.wasm.js',
    logger: (m) => console.log(m),
    errorHandler: () => $("#clearImageButton").removeAttr("disabled")
  });

  $("#queryText").val(recognization.data.text).change();
  $("#clearImageButton").removeAttr("disabled");
});

$("#clearImageButton").on("click", () => $("#imageFile").val(null));