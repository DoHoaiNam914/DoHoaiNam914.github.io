'use strict';

const Colors = {
  DAY: 'day',
  NIGHT: 'night',
  SEPIA: 'sepia',
};

$('#background-select').change(function onChange() {
  if ($(this).val() !== Colors.WHITE) {
    if ($(document.documentElement).attr('style') != null) {
      Object.values(Colors).forEach((code) => {
        if ($(document.documentElement).attr('style').includes(code)) {
          $(document.documentElement).attr('style', $(document.documentElement).attr('style').replace(new RegExp(`\\s?readium-${code}-on;`), ''));
        }
      });

      $(document.documentElement).attr('style', $(document.documentElement).attr('style').concat(` readium-${$(this).val()}-on;`));
    } else {
      $(document.documentElement).attr('style', `${$(this).val()}-background;`);
    }
  } else if ($(document.documentElement).attr('style') != null) {
    Object.values(Colors).forEach((code) => {
      if ($(document.documentElement).attr('style').includes(code)) {
        $(document.documentElement).attr('style', $(document.documentElement).attr('style').replace(new RegExp(`\\s?readium-${code}-on;`, 'g'), ''));
      }
    });

    if ($(document.documentElement).attr('style') == '') {
      $(document.documentElement).removeAttr('style');
    }
  }
});