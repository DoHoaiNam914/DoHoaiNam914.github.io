$("#backgroundSelect").change(function () {
  if (this.value !== 'white') {
    $(document.documentElement).attr("style",
        $(document.documentElement).attr("style") != undefined ?
        $(document.documentElement).attr("style").replace(/\s?black;/g,
        '').replace(/\s?sepia;/g, '').replace(/\s?cream;/g,
        '').concat(' ' + this.value.concat(';')) :
        this.value.concat(';'));
    localStorage.setItem("background", this.value);
  } else if ($(document.documentElement).attr("style") != undefined) {
    $(document.documentElement).attr("style", 
        document.documentElement.getAttribute('style').replace(/\s?black;/g,
        '').replace(/\s?sepia;/g, '').replace(/\s?cream;/g, ''));
    localStorage.removeItem("background");
  } else {
    $(document.documentElement).removeAttr("style");
  }
});