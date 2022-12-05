const colors = [
  'white',
  'sepia',
  'cream',
  'gray',
  'black',
];

$("#background-select").change(function () {
  if (this.value !== 'white') {
    if ($(document.documentElement).attr("style") != undefined) {
      colors.forEach(function (code) {
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
    colors.forEach(function (code) {
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