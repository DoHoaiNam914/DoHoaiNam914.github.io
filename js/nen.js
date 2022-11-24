$("#backgroundSelect").on("change", function () {
  if (this.value !== 'white') {
    $(document.documentElement).attr("style", $(document.documentElement).attr("style") != undefined ? $(document.documentElement).attr("style").replace(/ ?black;/g, '')
        .replace(/ ?sepia;/g, '')
        .replace(/ ?cream;/g, '')
        .concat(' ' + this.value.concat(';')) : this.value.concat(';'));
    localStorage.setItem("background", this.value);
  } else if ($(document.documentElement).attr("style") != undefined) {
    $(document.documentElement).attr("style", document.documentElement.getAttribute('style').replace(/ ?black;/g, '')
      .replace(/ ?sepia;/g, '')
      .replace(/ ?cream;/g, ''));
    localStorage.removeItem("background");
  } else {
    $(document.documentElement).removeAttr("style");
  }
});