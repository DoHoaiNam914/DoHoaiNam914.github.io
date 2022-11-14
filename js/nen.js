$("#backgroundSelect").on("change", function () {
  if (this.value !== 'white') {
    $(document.documentElement).attr("style", $(document.documentElement).attr("style") != undefined ? $(document.documentElement).attr("style").replace(/ ?black;/g, '')
        .replace(/ ?sepia;/g, '')
        .replace(/ ?cream;/g, '')
        .concat(' ' + this.value.concat(';')) : this.value.concat(';'));
    $.cookie('background', this.value, { expires: 365 });
  } else if ($(document.documentElement).attr("style") != undefined) {
    $(document.documentElement).attr("style", document.documentElement.getAttribute('style').replace(/ ?black;/g, '')
      .replace(/ ?sepia;/g, '')
      .replace(/ ?cream;/g, ''));
    $.removeCookie('background');
  } else {
    $(document.documentElement).removeAttr("style");
  }
});