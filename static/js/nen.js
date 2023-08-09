'use strict';

const Colors = {
  WHITE: 'white',
  SEPIA: 'sepia',
  CREAM: 'cream',
  GRAY: 'gray',
  BLACK: 'black'
};

$("#background-select").change(function () {
  if (this.value !== Colors.WHITE) {
    if ($(document.documentElement).attr("style") != undefined) {
      Object.values(Colors).forEach(function (code) {
        if ($(document.documentElement).attr("style").includes(code)) {
          $(document.documentElement).attr("style",
              $(document.documentElement).attr("style").replace(new RegExp(`\s?${code}-background;`), ''));
        }
      });

      $(document.documentElement).attr("style",
          $(document.documentElement).attr("style").concat(` ${this.value}-background;`));
    } else {
      $(document.documentElement).attr("style", `${this.value}-background;`);
    }
  } else if ($(document.documentElement).attr("style") != undefined) {
    Object.values(Colors).forEach(function (code) {
      if ($(document.documentElement).attr("style").includes(code)) {
        $(document.documentElement).attr("style",
            $(document.documentElement).attr("style").replace(new RegExp(`\s?${code}-background;`, 'g'), ''));
      }
    });

    if ($(document.documentElement).attr("style") == '') {
      $(document.documentElement).removeAttr("style")
    }
  }

  localStorage.setItem("background", this.value);
});