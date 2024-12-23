'use strict'
/* global axios */
import Translator from '/static/js/dich-nhanh/Translator.js'
import * as Utils from '/static/js/Utils.js'
export default class WebnovelTranslate extends Translator {
  /* https://translate-pa.googleapis.com/v1/supportedLanguages?client=gtx&display_language=vi&key=${key} */
  static LANGUAGE_LIST = JSON.parse(`{
  "sourceLanguages": [
    {
      "language": "auto",
      "name": "Phát hiện ngôn ngữ"
    },
    {
      "language": "ar",
      "name": "Ả Rập"
    },
    {
      "language": "ab",
      "name": "Abkhaz"
    },
    {
      "language": "ace",
      "name": "Aceh"
    },
    {
      "language": "ach",
      "name": "Acholi"
    },
    {
      "language": "aa",
      "name": "Afar"
    },
    {
      "language": "sq",
      "name": "Albania"
    },
    {
      "language": "alz",
      "name": "Alur"
    },
    {
      "language": "am",
      "name": "Amharic"
    },
    {
      "language": "en",
      "name": "Anh"
    },
    {
      "language": "hy",
      "name": "Armenia"
    },
    {
      "language": "as",
      "name": "Assam"
    },
    {
      "language": "av",
      "name": "Avar"
    },
    {
      "language": "awa",
      "name": "Awadhi"
    },
    {
      "language": "ay",
      "name": "Aymara"
    },
    {
      "language": "az",
      "name": "Azerbaijan"
    },
    {
      "language": "pl",
      "name": "Ba Lan"
    },
    {
      "language": "fa",
      "name": "Ba Tư"
    },
    {
      "language": "ban",
      "name": "Bali"
    },
    {
      "language": "bal",
      "name": "Baluchi"
    },
    {
      "language": "bm",
      "name": "Bambara"
    },
    {
      "language": "xh",
      "name": "Bantu"
    },
    {
      "language": "bci",
      "name": "Baoulé"
    },
    {
      "language": "ba",
      "name": "Bashkir"
    },
    {
      "language": "eu",
      "name": "Basque"
    },
    {
      "language": "btx",
      "name": "Batak Karo"
    },
    {
      "language": "bts",
      "name": "Batak Simalungun"
    },
    {
      "language": "bbc",
      "name": "Batak Toba"
    },
    {
      "language": "se",
      "name": "Bắc Sami"
    },
    {
      "language": "be",
      "name": "Belarus"
    },
    {
      "language": "bem",
      "name": "Bemba"
    },
    {
      "language": "bn",
      "name": "Bengal"
    },
    {
      "language": "bew",
      "name": "Betawi"
    },
    {
      "language": "bho",
      "name": "Bhojpuri"
    },
    {
      "language": "bik",
      "name": "Bikol"
    },
    {
      "language": "bs",
      "name": "Bosnia"
    },
    {
      "language": "pt-PT",
      "name": "Bồ Đào Nha (Bồ Đào Nha)"
    },
    {
      "language": "pt",
      "name": "Bồ Đào Nha (Brazil)"
    },
    {
      "language": "br",
      "name": "Breton"
    },
    {
      "language": "bg",
      "name": "Bulgaria"
    },
    {
      "language": "bua",
      "name": "Buryat"
    },
    {
      "language": "ca",
      "name": "Catalan"
    },
    {
      "language": "ceb",
      "name": "Cebuano"
    },
    {
      "language": "ch",
      "name": "Chamorro"
    },
    {
      "language": "ce",
      "name": "Chechnya"
    },
    {
      "language": "ny",
      "name": "Chichewa"
    },
    {
      "language": "chk",
      "name": "Chuuk"
    },
    {
      "language": "cv",
      "name": "Chuvash"
    },
    {
      "language": "co",
      "name": "Corsi"
    },
    {
      "language": "ht",
      "name": "Creole (Haiti)"
    },
    {
      "language": "crs",
      "name": "Creole Seychelles"
    },
    {
      "language": "hr",
      "name": "Croatia"
    },
    {
      "language": "fa-AF",
      "name": "Dari"
    },
    {
      "language": "dv",
      "name": "Dhivehi"
    },
    {
      "language": "din",
      "name": "Dinka"
    },
    {
      "language": "iw",
      "name": "Do Thái"
    },
    {
      "language": "doi",
      "name": "Dogri"
    },
    {
      "language": "dov",
      "name": "Dombe"
    },
    {
      "language": "dyu",
      "name": "Dyula"
    },
    {
      "language": "dz",
      "name": "Dzongkha"
    },
    {
      "language": "da",
      "name": "Đan Mạch"
    },
    {
      "language": "de",
      "name": "Đức"
    },
    {
      "language": "et",
      "name": "Estonia"
    },
    {
      "language": "ee",
      "name": "Ewe"
    },
    {
      "language": "fo",
      "name": "Faroese"
    },
    {
      "language": "fj",
      "name": "Fiji"
    },
    {
      "language": "tl",
      "name": "Filipino"
    },
    {
      "language": "fon",
      "name": "Fon"
    },
    {
      "language": "fy",
      "name": "Frisia"
    },
    {
      "language": "fur",
      "name": "Friuli"
    },
    {
      "language": "ff",
      "name": "Fulani"
    },
    {
      "language": "gaa",
      "name": "Gaa"
    },
    {
      "language": "gd",
      "name": "Gael Scotland"
    },
    {
      "language": "gl",
      "name": "Galicia"
    },
    {
      "language": "gn",
      "name": "Guarani"
    },
    {
      "language": "gu",
      "name": "Gujarat"
    },
    {
      "language": "nl",
      "name": "Hà Lan"
    },
    {
      "language": "af",
      "name": "Hà Lan (Nam Phi)"
    },
    {
      "language": "cnh",
      "name": "Hakha Chin"
    },
    {
      "language": "ko",
      "name": "Hàn"
    },
    {
      "language": "ha",
      "name": "Hausa"
    },
    {
      "language": "haw",
      "name": "Hawaii"
    },
    {
      "language": "hil",
      "name": "Hiligaynon"
    },
    {
      "language": "hi",
      "name": "Hindi"
    },
    {
      "language": "hmn",
      "name": "Hmong"
    },
    {
      "language": "hu",
      "name": "Hungary"
    },
    {
      "language": "hrx",
      "name": "Hunsrik"
    },
    {
      "language": "el",
      "name": "Hy Lạp"
    },
    {
      "language": "iba",
      "name": "Iban"
    },
    {
      "language": "is",
      "name": "Iceland"
    },
    {
      "language": "ig",
      "name": "Igbo"
    },
    {
      "language": "ilo",
      "name": "Ilocano"
    },
    {
      "language": "id",
      "name": "Indonesia"
    },
    {
      "language": "ga",
      "name": "Ireland"
    },
    {
      "language": "jw",
      "name": "Java"
    },
    {
      "language": "kac",
      "name": "Jingpo"
    },
    {
      "language": "kl",
      "name": "Kalaallisut"
    },
    {
      "language": "kn",
      "name": "Kannada"
    },
    {
      "language": "kr",
      "name": "Kanuri"
    },
    {
      "language": "pam",
      "name": "Kapampangan"
    },
    {
      "language": "kk",
      "name": "Kazakh"
    },
    {
      "language": "kha",
      "name": "Khasi"
    },
    {
      "language": "km",
      "name": "Khmer"
    },
    {
      "language": "cgg",
      "name": "Kiga"
    },
    {
      "language": "kg",
      "name": "Kikongo"
    },
    {
      "language": "rw",
      "name": "Kinyarwanda"
    },
    {
      "language": "ktu",
      "name": "Kituba"
    },
    {
      "language": "trp",
      "name": "Kokborok"
    },
    {
      "language": "kv",
      "name": "Komi"
    },
    {
      "language": "gom",
      "name": "Konkani"
    },
    {
      "language": "kri",
      "name": "Krio"
    },
    {
      "language": "ku",
      "name": "Kurd (Kurmanji)"
    },
    {
      "language": "ckb",
      "name": "Kurd (Sorani)"
    },
    {
      "language": "ky",
      "name": "Kyrgyz"
    },
    {
      "language": "lo",
      "name": "Lào"
    },
    {
      "language": "ltg",
      "name": "Latgale"
    },
    {
      "language": "la",
      "name": "Latinh"
    },
    {
      "language": "lv",
      "name": "Latvia"
    },
    {
      "language": "lij",
      "name": "Liguria"
    },
    {
      "language": "li",
      "name": "Limburg"
    },
    {
      "language": "ln",
      "name": "Lingala"
    },
    {
      "language": "lt",
      "name": "Litva"
    },
    {
      "language": "lmo",
      "name": "Lombard"
    },
    {
      "language": "lg",
      "name": "Luganda"
    },
    {
      "language": "luo",
      "name": "Luo"
    },
    {
      "language": "lb",
      "name": "Luxembourg"
    },
    {
      "language": "ms",
      "name": "Mã Lai"
    },
    {
      "language": "mk",
      "name": "Macedonia"
    },
    {
      "language": "mad",
      "name": "Madura"
    },
    {
      "language": "mai",
      "name": "Maithili"
    },
    {
      "language": "mak",
      "name": "Makassar"
    },
    {
      "language": "mg",
      "name": "Malagasy"
    },
    {
      "language": "ms-Arab",
      "name": "Malay (Jawi)"
    },
    {
      "language": "ml",
      "name": "Malayalam"
    },
    {
      "language": "mt",
      "name": "Malta"
    },
    {
      "language": "mam",
      "name": "Mam"
    },
    {
      "language": "gv",
      "name": "Manx"
    },
    {
      "language": "mi",
      "name": "Maori"
    },
    {
      "language": "mr",
      "name": "Marathi"
    },
    {
      "language": "mh",
      "name": "Marshall"
    },
    {
      "language": "mwr",
      "name": "Marwadi"
    },
    {
      "language": "mfe",
      "name": "Mauritian Creole"
    },
    {
      "language": "yua",
      "name": "Maya Yucatec"
    },
    {
      "language": "chm",
      "name": "Meadow Mari"
    },
    {
      "language": "mni-Mtei",
      "name": "Meiteilon (Manipuri)"
    },
    {
      "language": "min",
      "name": "Minang"
    },
    {
      "language": "lus",
      "name": "Mizo"
    },
    {
      "language": "mn",
      "name": "Mông Cổ"
    },
    {
      "language": "my",
      "name": "Myanmar"
    },
    {
      "language": "bm-Nkoo",
      "name": "N'Ko"
    },
    {
      "language": "no",
      "name": "Na Uy"
    },
    {
      "language": "nhe",
      "name": "Nahuatl (Đông Huasteca)"
    },
    {
      "language": "nr",
      "name": "Nam Ndebele"
    },
    {
      "language": "ndc-ZW",
      "name": "Ndau"
    },
    {
      "language": "ne",
      "name": "Nepal"
    },
    {
      "language": "ru",
      "name": "Nga"
    },
    {
      "language": "ja",
      "name": "Nhật"
    },
    {
      "language": "nus",
      "name": "Nuer"
    },
    {
      "language": "oc",
      "name": "Occitan"
    },
    {
      "language": "or",
      "name": "Odia (Oriya)"
    },
    {
      "language": "om",
      "name": "Oromo"
    },
    {
      "language": "os",
      "name": "Ossetia"
    },
    {
      "language": "pag",
      "name": "Pangasinan"
    },
    {
      "language": "pap",
      "name": "Papiamento"
    },
    {
      "language": "ps",
      "name": "Pashto"
    },
    {
      "language": "jam",
      "name": "Patois Jamaica"
    },
    {
      "language": "sa",
      "name": "Phạn"
    },
    {
      "language": "fr",
      "name": "Pháp"
    },
    {
      "language": "fi",
      "name": "Phần Lan"
    },
    {
      "language": "pa",
      "name": "Punjab (Gurmukhi)"
    },
    {
      "language": "pa-Arab",
      "name": "Punjab (Shahmukhi)"
    },
    {
      "language": "kek",
      "name": "Q'eqchi'"
    },
    {
      "language": "yue",
      "name": "Quảng Đông"
    },
    {
      "language": "qu",
      "name": "Quechua"
    },
    {
      "language": "eo",
      "name": "Quốc tế ngữ"
    },
    {
      "language": "rom",
      "name": "Romani"
    },
    {
      "language": "ro",
      "name": "Rumani"
    },
    {
      "language": "rn",
      "name": "Rundi"
    },
    {
      "language": "sm",
      "name": "Samoa"
    },
    {
      "language": "sg",
      "name": "Sango"
    },
    {
      "language": "cs",
      "name": "Séc"
    },
    {
      "language": "nso",
      "name": "Sepedi"
    },
    {
      "language": "sr",
      "name": "Serbia"
    },
    {
      "language": "st",
      "name": "Sesotho"
    },
    {
      "language": "shn",
      "name": "Shan"
    },
    {
      "language": "sn",
      "name": "Shona"
    },
    {
      "language": "scn",
      "name": "Sicily"
    },
    {
      "language": "szl",
      "name": "Silesia"
    },
    {
      "language": "sd",
      "name": "Sindhi"
    },
    {
      "language": "si",
      "name": "Sinhala"
    },
    {
      "language": "sk",
      "name": "Slovak"
    },
    {
      "language": "sl",
      "name": "Slovenia"
    },
    {
      "language": "so",
      "name": "Somali"
    },
    {
      "language": "su",
      "name": "Sunda"
    },
    {
      "language": "sus",
      "name": "Susu"
    },
    {
      "language": "sw",
      "name": "Swahili"
    },
    {
      "language": "ss",
      "name": "Swati"
    },
    {
      "language": "ty",
      "name": "Tahiti"
    },
    {
      "language": "tg",
      "name": "Tajik"
    },
    {
      "language": "ber-Latn",
      "name": "Tamazight"
    },
    {
      "language": "ber",
      "name": "Tamazight (Tifinagh)"
    },
    {
      "language": "ta",
      "name": "Tamil"
    },
    {
      "language": "tt",
      "name": "Tatar"
    },
    {
      "language": "es",
      "name": "Tây Ban Nha"
    },
    {
      "language": "bo",
      "name": "Tây Tạng"
    },
    {
      "language": "te",
      "name": "Telugu"
    },
    {
      "language": "tet",
      "name": "Tetum"
    },
    {
      "language": "th",
      "name": "Thái"
    },
    {
      "language": "tr",
      "name": "Thổ Nhĩ Kỳ"
    },
    {
      "language": "sv",
      "name": "Thụy Điển"
    },
    {
      "language": "ka",
      "name": "Tiếng Georgia"
    },
    {
      "language": "iu",
      "name": "Tiếng Inuktut (Âm tiết)"
    },
    {
      "language": "iu-Latn",
      "name": "Tiếng Inuktut (Latinh)"
    },
    {
      "language": "new",
      "name": "Tiếng Nepal Bhasa (tiếng Newar)"
    },
    {
      "language": "fr-CA",
      "name": "Tiếng Pháp (Canada)"
    },
    {
      "language": "sat-Latn",
      "name": "Tiếng Santal (Latinh)"
    },
    {
      "language": "sat",
      "name": "Tiếng Santal (Ol Chiki)"
    },
    {
      "language": "crh",
      "name": "Tiếng Tatar Krym (Kirin)"
    },
    {
      "language": "crh-Latn",
      "name": "Tiếng Tatar Krym (Latinh)"
    },
    {
      "language": "ti",
      "name": "Tigrinya"
    },
    {
      "language": "tiv",
      "name": "Tiv"
    },
    {
      "language": "tpi",
      "name": "Tok Pisin"
    },
    {
      "language": "to",
      "name": "Tonga"
    },
    {
      "language": "zh-CN",
      "name": "Trung"
    },
    {
      "language": "lua",
      "name": "Tshiluba"
    },
    {
      "language": "ts",
      "name": "Tsonga"
    },
    {
      "language": "tn",
      "name": "Tswana"
    },
    {
      "language": "tcy",
      "name": "Tulu"
    },
    {
      "language": "tum",
      "name": "Tumbuka"
    },
    {
      "language": "tk",
      "name": "Turkmen"
    },
    {
      "language": "tyv",
      "name": "Tuva"
    },
    {
      "language": "ak",
      "name": "Twi"
    },
    {
      "language": "udm",
      "name": "Udmurt"
    },
    {
      "language": "uk",
      "name": "Ukraina"
    },
    {
      "language": "ur",
      "name": "Urdu"
    },
    {
      "language": "ug",
      "name": "Uyghur"
    },
    {
      "language": "uz",
      "name": "Uzbek"
    },
    {
      "language": "ve",
      "name": "Venda"
    },
    {
      "language": "vec",
      "name": "Venice"
    },
    {
      "language": "vi",
      "name": "Việt"
    },
    {
      "language": "war",
      "name": "Waray"
    },
    {
      "language": "wo",
      "name": "Wolof"
    },
    {
      "language": "cy",
      "name": "Xứ Wales"
    },
    {
      "language": "it",
      "name": "Ý"
    },
    {
      "language": "sah",
      "name": "Yakut"
    },
    {
      "language": "yi",
      "name": "Yiddish"
    },
    {
      "language": "yo",
      "name": "Yoruba"
    },
    {
      "language": "zap",
      "name": "Zapotec"
    },
    {
      "language": "zu",
      "name": "Zulu"
    }
  ],
  "targetLanguages": [
    {
      "language": "ar",
      "name": "Ả Rập"
    },
    {
      "language": "ab",
      "name": "Abkhaz"
    },
    {
      "language": "ace",
      "name": "Aceh"
    },
    {
      "language": "ach",
      "name": "Acholi"
    },
    {
      "language": "aa",
      "name": "Afar"
    },
    {
      "language": "sq",
      "name": "Albania"
    },
    {
      "language": "alz",
      "name": "Alur"
    },
    {
      "language": "am",
      "name": "Amharic"
    },
    {
      "language": "en",
      "name": "Anh"
    },
    {
      "language": "hy",
      "name": "Armenia"
    },
    {
      "language": "as",
      "name": "Assam"
    },
    {
      "language": "av",
      "name": "Avar"
    },
    {
      "language": "awa",
      "name": "Awadhi"
    },
    {
      "language": "ay",
      "name": "Aymara"
    },
    {
      "language": "az",
      "name": "Azerbaijan"
    },
    {
      "language": "pl",
      "name": "Ba Lan"
    },
    {
      "language": "fa",
      "name": "Ba Tư"
    },
    {
      "language": "ban",
      "name": "Bali"
    },
    {
      "language": "bal",
      "name": "Baluchi"
    },
    {
      "language": "bm",
      "name": "Bambara"
    },
    {
      "language": "xh",
      "name": "Bantu"
    },
    {
      "language": "bci",
      "name": "Baoulé"
    },
    {
      "language": "ba",
      "name": "Bashkir"
    },
    {
      "language": "eu",
      "name": "Basque"
    },
    {
      "language": "btx",
      "name": "Batak Karo"
    },
    {
      "language": "bts",
      "name": "Batak Simalungun"
    },
    {
      "language": "bbc",
      "name": "Batak Toba"
    },
    {
      "language": "se",
      "name": "Bắc Sami"
    },
    {
      "language": "be",
      "name": "Belarus"
    },
    {
      "language": "bem",
      "name": "Bemba"
    },
    {
      "language": "bn",
      "name": "Bengal"
    },
    {
      "language": "bew",
      "name": "Betawi"
    },
    {
      "language": "bho",
      "name": "Bhojpuri"
    },
    {
      "language": "bik",
      "name": "Bikol"
    },
    {
      "language": "bs",
      "name": "Bosnia"
    },
    {
      "language": "pt-PT",
      "name": "Bồ Đào Nha (Bồ Đào Nha)"
    },
    {
      "language": "pt",
      "name": "Bồ Đào Nha (Brazil)"
    },
    {
      "language": "br",
      "name": "Breton"
    },
    {
      "language": "bg",
      "name": "Bulgaria"
    },
    {
      "language": "bua",
      "name": "Buryat"
    },
    {
      "language": "ca",
      "name": "Catalan"
    },
    {
      "language": "ceb",
      "name": "Cebuano"
    },
    {
      "language": "ch",
      "name": "Chamorro"
    },
    {
      "language": "ce",
      "name": "Chechnya"
    },
    {
      "language": "ny",
      "name": "Chichewa"
    },
    {
      "language": "chk",
      "name": "Chuuk"
    },
    {
      "language": "cv",
      "name": "Chuvash"
    },
    {
      "language": "co",
      "name": "Corsi"
    },
    {
      "language": "ht",
      "name": "Creole (Haiti)"
    },
    {
      "language": "crs",
      "name": "Creole Seychelles"
    },
    {
      "language": "hr",
      "name": "Croatia"
    },
    {
      "language": "fa-AF",
      "name": "Dari"
    },
    {
      "language": "dv",
      "name": "Dhivehi"
    },
    {
      "language": "din",
      "name": "Dinka"
    },
    {
      "language": "iw",
      "name": "Do Thái"
    },
    {
      "language": "doi",
      "name": "Dogri"
    },
    {
      "language": "dov",
      "name": "Dombe"
    },
    {
      "language": "dyu",
      "name": "Dyula"
    },
    {
      "language": "dz",
      "name": "Dzongkha"
    },
    {
      "language": "da",
      "name": "Đan Mạch"
    },
    {
      "language": "de",
      "name": "Đức"
    },
    {
      "language": "et",
      "name": "Estonia"
    },
    {
      "language": "ee",
      "name": "Ewe"
    },
    {
      "language": "fo",
      "name": "Faroese"
    },
    {
      "language": "fj",
      "name": "Fiji"
    },
    {
      "language": "tl",
      "name": "Filipino"
    },
    {
      "language": "fon",
      "name": "Fon"
    },
    {
      "language": "fy",
      "name": "Frisia"
    },
    {
      "language": "fur",
      "name": "Friuli"
    },
    {
      "language": "ff",
      "name": "Fulani"
    },
    {
      "language": "gaa",
      "name": "Gaa"
    },
    {
      "language": "gd",
      "name": "Gael Scotland"
    },
    {
      "language": "gl",
      "name": "Galicia"
    },
    {
      "language": "gn",
      "name": "Guarani"
    },
    {
      "language": "gu",
      "name": "Gujarat"
    },
    {
      "language": "nl",
      "name": "Hà Lan"
    },
    {
      "language": "af",
      "name": "Hà Lan (Nam Phi)"
    },
    {
      "language": "cnh",
      "name": "Hakha Chin"
    },
    {
      "language": "ko",
      "name": "Hàn"
    },
    {
      "language": "ha",
      "name": "Hausa"
    },
    {
      "language": "haw",
      "name": "Hawaii"
    },
    {
      "language": "hil",
      "name": "Hiligaynon"
    },
    {
      "language": "hi",
      "name": "Hindi"
    },
    {
      "language": "hmn",
      "name": "Hmong"
    },
    {
      "language": "hu",
      "name": "Hungary"
    },
    {
      "language": "hrx",
      "name": "Hunsrik"
    },
    {
      "language": "el",
      "name": "Hy Lạp"
    },
    {
      "language": "iba",
      "name": "Iban"
    },
    {
      "language": "is",
      "name": "Iceland"
    },
    {
      "language": "ig",
      "name": "Igbo"
    },
    {
      "language": "ilo",
      "name": "Ilocano"
    },
    {
      "language": "id",
      "name": "Indonesia"
    },
    {
      "language": "ga",
      "name": "Ireland"
    },
    {
      "language": "jw",
      "name": "Java"
    },
    {
      "language": "kac",
      "name": "Jingpo"
    },
    {
      "language": "kl",
      "name": "Kalaallisut"
    },
    {
      "language": "kn",
      "name": "Kannada"
    },
    {
      "language": "kr",
      "name": "Kanuri"
    },
    {
      "language": "pam",
      "name": "Kapampangan"
    },
    {
      "language": "kk",
      "name": "Kazakh"
    },
    {
      "language": "kha",
      "name": "Khasi"
    },
    {
      "language": "km",
      "name": "Khmer"
    },
    {
      "language": "cgg",
      "name": "Kiga"
    },
    {
      "language": "kg",
      "name": "Kikongo"
    },
    {
      "language": "rw",
      "name": "Kinyarwanda"
    },
    {
      "language": "ktu",
      "name": "Kituba"
    },
    {
      "language": "trp",
      "name": "Kokborok"
    },
    {
      "language": "kv",
      "name": "Komi"
    },
    {
      "language": "gom",
      "name": "Konkani"
    },
    {
      "language": "kri",
      "name": "Krio"
    },
    {
      "language": "ku",
      "name": "Kurd (Kurmanji)"
    },
    {
      "language": "ckb",
      "name": "Kurd (Sorani)"
    },
    {
      "language": "ky",
      "name": "Kyrgyz"
    },
    {
      "language": "lo",
      "name": "Lào"
    },
    {
      "language": "ltg",
      "name": "Latgale"
    },
    {
      "language": "la",
      "name": "Latinh"
    },
    {
      "language": "lv",
      "name": "Latvia"
    },
    {
      "language": "lij",
      "name": "Liguria"
    },
    {
      "language": "li",
      "name": "Limburg"
    },
    {
      "language": "ln",
      "name": "Lingala"
    },
    {
      "language": "lt",
      "name": "Litva"
    },
    {
      "language": "lmo",
      "name": "Lombard"
    },
    {
      "language": "lg",
      "name": "Luganda"
    },
    {
      "language": "luo",
      "name": "Luo"
    },
    {
      "language": "lb",
      "name": "Luxembourg"
    },
    {
      "language": "ms",
      "name": "Mã Lai"
    },
    {
      "language": "mk",
      "name": "Macedonia"
    },
    {
      "language": "mad",
      "name": "Madura"
    },
    {
      "language": "mai",
      "name": "Maithili"
    },
    {
      "language": "mak",
      "name": "Makassar"
    },
    {
      "language": "mg",
      "name": "Malagasy"
    },
    {
      "language": "ms-Arab",
      "name": "Malay (Jawi)"
    },
    {
      "language": "ml",
      "name": "Malayalam"
    },
    {
      "language": "mt",
      "name": "Malta"
    },
    {
      "language": "mam",
      "name": "Mam"
    },
    {
      "language": "gv",
      "name": "Manx"
    },
    {
      "language": "mi",
      "name": "Maori"
    },
    {
      "language": "mr",
      "name": "Marathi"
    },
    {
      "language": "mh",
      "name": "Marshall"
    },
    {
      "language": "mwr",
      "name": "Marwadi"
    },
    {
      "language": "mfe",
      "name": "Mauritian Creole"
    },
    {
      "language": "yua",
      "name": "Maya Yucatec"
    },
    {
      "language": "chm",
      "name": "Meadow Mari"
    },
    {
      "language": "mni-Mtei",
      "name": "Meiteilon (Manipuri)"
    },
    {
      "language": "min",
      "name": "Minang"
    },
    {
      "language": "lus",
      "name": "Mizo"
    },
    {
      "language": "mn",
      "name": "Mông Cổ"
    },
    {
      "language": "my",
      "name": "Myanmar"
    },
    {
      "language": "bm-Nkoo",
      "name": "N'Ko"
    },
    {
      "language": "no",
      "name": "Na Uy"
    },
    {
      "language": "nhe",
      "name": "Nahuatl (Đông Huasteca)"
    },
    {
      "language": "nr",
      "name": "Nam Ndebele"
    },
    {
      "language": "ndc-ZW",
      "name": "Ndau"
    },
    {
      "language": "ne",
      "name": "Nepal"
    },
    {
      "language": "ru",
      "name": "Nga"
    },
    {
      "language": "ja",
      "name": "Nhật"
    },
    {
      "language": "nus",
      "name": "Nuer"
    },
    {
      "language": "oc",
      "name": "Occitan"
    },
    {
      "language": "or",
      "name": "Odia (Oriya)"
    },
    {
      "language": "om",
      "name": "Oromo"
    },
    {
      "language": "os",
      "name": "Ossetia"
    },
    {
      "language": "pag",
      "name": "Pangasinan"
    },
    {
      "language": "pap",
      "name": "Papiamento"
    },
    {
      "language": "ps",
      "name": "Pashto"
    },
    {
      "language": "jam",
      "name": "Patois Jamaica"
    },
    {
      "language": "sa",
      "name": "Phạn"
    },
    {
      "language": "fr",
      "name": "Pháp"
    },
    {
      "language": "fi",
      "name": "Phần Lan"
    },
    {
      "language": "pa",
      "name": "Punjab (Gurmukhi)"
    },
    {
      "language": "pa-Arab",
      "name": "Punjab (Shahmukhi)"
    },
    {
      "language": "kek",
      "name": "Q'eqchi'"
    },
    {
      "language": "yue",
      "name": "Quảng Đông"
    },
    {
      "language": "qu",
      "name": "Quechua"
    },
    {
      "language": "eo",
      "name": "Quốc tế ngữ"
    },
    {
      "language": "rom",
      "name": "Romani"
    },
    {
      "language": "ro",
      "name": "Rumani"
    },
    {
      "language": "rn",
      "name": "Rundi"
    },
    {
      "language": "sm",
      "name": "Samoa"
    },
    {
      "language": "sg",
      "name": "Sango"
    },
    {
      "language": "cs",
      "name": "Séc"
    },
    {
      "language": "nso",
      "name": "Sepedi"
    },
    {
      "language": "sr",
      "name": "Serbia"
    },
    {
      "language": "st",
      "name": "Sesotho"
    },
    {
      "language": "shn",
      "name": "Shan"
    },
    {
      "language": "sn",
      "name": "Shona"
    },
    {
      "language": "scn",
      "name": "Sicily"
    },
    {
      "language": "szl",
      "name": "Silesia"
    },
    {
      "language": "sd",
      "name": "Sindhi"
    },
    {
      "language": "si",
      "name": "Sinhala"
    },
    {
      "language": "sk",
      "name": "Slovak"
    },
    {
      "language": "sl",
      "name": "Slovenia"
    },
    {
      "language": "so",
      "name": "Somali"
    },
    {
      "language": "su",
      "name": "Sunda"
    },
    {
      "language": "sus",
      "name": "Susu"
    },
    {
      "language": "sw",
      "name": "Swahili"
    },
    {
      "language": "ss",
      "name": "Swati"
    },
    {
      "language": "ty",
      "name": "Tahiti"
    },
    {
      "language": "tg",
      "name": "Tajik"
    },
    {
      "language": "ber-Latn",
      "name": "Tamazight"
    },
    {
      "language": "ber",
      "name": "Tamazight (Tifinagh)"
    },
    {
      "language": "ta",
      "name": "Tamil"
    },
    {
      "language": "tt",
      "name": "Tatar"
    },
    {
      "language": "es",
      "name": "Tây Ban Nha"
    },
    {
      "language": "bo",
      "name": "Tây Tạng"
    },
    {
      "language": "te",
      "name": "Telugu"
    },
    {
      "language": "tet",
      "name": "Tetum"
    },
    {
      "language": "th",
      "name": "Thái"
    },
    {
      "language": "tr",
      "name": "Thổ Nhĩ Kỳ"
    },
    {
      "language": "sv",
      "name": "Thụy Điển"
    },
    {
      "language": "ka",
      "name": "Tiếng Georgia"
    },
    {
      "language": "iu",
      "name": "Tiếng Inuktut (Âm tiết)"
    },
    {
      "language": "iu-Latn",
      "name": "Tiếng Inuktut (Latinh)"
    },
    {
      "language": "new",
      "name": "Tiếng Nepal Bhasa (tiếng Newar)"
    },
    {
      "language": "fr-CA",
      "name": "Tiếng Pháp (Canada)"
    },
    {
      "language": "sat-Latn",
      "name": "Tiếng Santal (Latinh)"
    },
    {
      "language": "sat",
      "name": "Tiếng Santal (Ol Chiki)"
    },
    {
      "language": "crh",
      "name": "Tiếng Tatar Krym (Kirin)"
    },
    {
      "language": "crh-Latn",
      "name": "Tiếng Tatar Krym (Latinh)"
    },
    {
      "language": "ti",
      "name": "Tigrinya"
    },
    {
      "language": "tiv",
      "name": "Tiv"
    },
    {
      "language": "tpi",
      "name": "Tok Pisin"
    },
    {
      "language": "to",
      "name": "Tonga"
    },
    {
      "language": "zh-CN",
      "name": "Trung (Giản thể)"
    },
    {
      "language": "zh-TW",
      "name": "Trung (Phồn thể)"
    },
    {
      "language": "lua",
      "name": "Tshiluba"
    },
    {
      "language": "ts",
      "name": "Tsonga"
    },
    {
      "language": "tn",
      "name": "Tswana"
    },
    {
      "language": "tcy",
      "name": "Tulu"
    },
    {
      "language": "tum",
      "name": "Tumbuka"
    },
    {
      "language": "tk",
      "name": "Turkmen"
    },
    {
      "language": "tyv",
      "name": "Tuva"
    },
    {
      "language": "ak",
      "name": "Twi"
    },
    {
      "language": "udm",
      "name": "Udmurt"
    },
    {
      "language": "uk",
      "name": "Ukraina"
    },
    {
      "language": "ur",
      "name": "Urdu"
    },
    {
      "language": "ug",
      "name": "Uyghur"
    },
    {
      "language": "uz",
      "name": "Uzbek"
    },
    {
      "language": "ve",
      "name": "Venda"
    },
    {
      "language": "vec",
      "name": "Venice"
    },
    {
      "language": "vi",
      "name": "Việt"
    },
    {
      "language": "war",
      "name": "Waray"
    },
    {
      "language": "wo",
      "name": "Wolof"
    },
    {
      "language": "cy",
      "name": "Xứ Wales"
    },
    {
      "language": "it",
      "name": "Ý"
    },
    {
      "language": "sah",
      "name": "Yakut"
    },
    {
      "language": "yi",
      "name": "Yiddish"
    },
    {
      "language": "yo",
      "name": "Yoruba"
    },
    {
      "language": "zap",
      "name": "Zapotec"
    },
    {
      "language": "zu",
      "name": "Zulu"
    }
  ]
}
`)

  public readonly DefaultLanguage: { SOURCE_LANGUAGE: string, TARGET_LANGUAGE: string } = {
    SOURCE_LANGUAGE: 'auto',
    TARGET_LANGUAGE: 'vi'
  }

  private readonly maxContentLengthPerRequest: number = 900
  private readonly clientName: string = 'gtx'
  public async translateText (text: string, targetLanguage: string, sourceLanguage: string | null = null): Promise<string> {
    const isCj: boolean = ['ja', 'zh-CN', 'zh-TW'].some((element) => sourceLanguage === element)
    const EOL: string = isCj ? '||||' : '\\n'
    const lines: string[] = text.split(/(\n)/)
    const cleanedLines: string[] = lines.filter((element) => element !== '\n' && element.replace(/^\s+/, '').length > 0)
    const responses: Array<Promise<{ data: string[][][] }>> = []
    let query: string | string[] = cleanedLines.map((element) => `${isCj ? '\u3000\u3000' : ''}${element}`).join(EOL)
    let request: string[] = []
    query = (isCj ? query.replace(EOL, EOL.repeat(2)) : query).split(new RegExp(`(?<=\\.{3}|[${!isCj ? '!,.:;?' : ''}…${isCj ? '、。！，：；？' : ''}](?:[^${!isCj ? '!,.:;?' : ''}…${isCj ? '、。！，：；？' : ''}]*$${!isCj ? '|\\s+' : ''}|))`))
    while (query.length > 0) {
      request.push((query).shift() as string)
      if (query.length === 0 || request.join('').concat(query[0].trimEnd()).length > this.maxContentLengthPerRequest) {
        responses.push(axios.get(`${Utils.CORS_HEADER_PROXY}http://translate.google.com/translate_a/single`, {
          params: new URLSearchParams(`client=${this.clientName}&ie=UTF-8&oe=UTF-8&dt=bd&dt=ex&dt=ld&dt=md&dt=rw&dt=rm&dt=ss&dt=t&dt=at&dt=gt&dt=qc&sl=${sourceLanguage ?? this.DefaultLanguage.SOURCE_LANGUAGE}&tl=${targetLanguage}&hl=${targetLanguage}&q=${encodeURIComponent(request.join('').trimEnd())}`),
          signal: this.controller.signal
        }))
        request = []
      }
    }
    const result: string = await Promise.all(responses).then(function (responses) {
      const results: string[] = responses.map(({ data: [a] }) => a.filter(([, second]) => second != null).map(([b, second]) => [second, b.replaceAll(new RegExp(` ?${isCj ? '(?:\\|[ |]*|[ |]*\\|)' : Utils.getTrieRegexPatternFromWords([EOL].sort((a, b) => b.length - a.length)).source as string}\\s*`, 'g'), '\n')]).map(([b, second]) => {
        const adjustedText: string = isCj ? b.replace(EOL.repeat(2), EOL) : b
        const lineCountDifference: number = [...adjustedText.matchAll(new RegExp(Utils.escapeRegExp(EOL), 'g'))].length - [...second.matchAll(/\n/g)].length
        return (lineCountDifference < 0 ? second.replace(new RegExp(`\\n{${Math.abs(lineCountDifference)}}$`), '') : second).concat('\n'.repeat(lineCountDifference > 0 ? lineCountDifference : 0))
      })).flat().join('').split('\n')
      const translationMap: { [key: string]: string } = Object.fromEntries(cleanedLines.map((element, index) => [element, results[index]]))
      return lines.map(element => translationMap[element]).join('')
    }).catch((error: {}) => {
      throw error
    })
    super.translateText(text, targetLanguage, sourceLanguage)
    return result
  }
}
