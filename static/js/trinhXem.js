'use strict';

const Loader = {
  J_NOVEL: 'j_novel',
  YENPRESS: 'yenpress',
  CUSTOM: 'custom',
};

$(document).ready(function () {
  const searchParams = new URLSearchParams(window.location.search);

  const book = searchParams.get('sach') ?? 'tinhlinh';
  const volume = searchParams.get('tap') ?? 'volume-23-jnovels';

  $.getJSON(`./${book}/data.json`, function (data) {
    _.each(data[book], function (currentVolume) {
      if (currentVolume.id === volume) {
        if (currentVolume.spine.length > 0) {
          switch (currentVolume.loader) {
            case Loader.J_NOVEL:
              j_novelLoader(book, volume, currentVolume.spine);
              break;

            case Loader.YENPRESS:
              yenpressLoader(book, volume, currentVolume.spine);
              break;

            case Loader.CUSTOM:
              customLoader(book, volume, currentVolume.spine);
              break;
          }
        } else {
          window.location.href = currentVolume.href;
        }
      }
    });
  }).fail(function (jqXHR, textStatus, errorThrown) {
    throw new Error(textStatus);
  });
});

$('#view-select').change(function () {
  if (this.value !== 'pagination') {
    if ($(document.documentElement).attr('style') != undefined) {
      $(document.documentElement).attr('style', $(document.documentElement).attr('style').concat(' readium-scroll-on;'));
    } else {
      $(document.documentElement).attr('style', 'vertical-view;');
    }
  } else if ($(document.documentElement).attr('style') != undefined) {
    $(document.documentElement).attr('style', $(document.documentElement).attr('style').replace(/\s?readium-scroll-on;/g, ''));

    if ($(document.documentElement).attr('style') == '') {
      $(document.documentElement).removeAttr('style');
    }
  }
});

function j_novelLoader(book, volume, spine) {
  for (let i = 0; i < spine.length; i++) {
    const spineHref = spine[i];
    const spineId = spineHref.replace(/Text\/(.+)\.xhtml/, '$1');

    $.get({
      async: false,
      crossDomain: false,
      url: `./${book}/${volume}/${spineHref}`,
      processData: false
    }).done(function (data) {
      if (i === 0) {
        $(document.documentElement).attr('lang', $(data).find('html').attr('lang'));
        $(document.head).html($(data).find('head').html());
        $('meta[content="text/html; charset=UTF-8"]').replaceWith(`<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="initial-scale=1, user-scalable=0, maximum-scale=1">`);
        const stylesheetHref = $('link[rel="stylesheet"]').attr('href').replace('..', `./${book}/${volume}`);
        $('link[rel="stylesheet"]').remove();
        $(document.head).append('<link rel="stylesheet" href="/static/css/styles/ReadiumCSS-before.css">');
        $.get({
          async: false,
          crossDomain: false,
          url: stylesheetHref,
          processData: false
        }).done(function (data) {
          const stylesheet = document.createElement('style');

          stylesheet.type = 'text/css';
          stylesheet.innerText = data.replace(/^body/g, '.body').replace(/(:\s*?.*)serif/g, '$1var(--baseFontFamily)');

          $(document.head).append(stylesheet);
        });
        $(document.head).append('<link rel="stylesheet" href="/static/css/styles/patches/j-novelclub_patch.css">');
        $(document.head).append('<link rel="stylesheet" href="/static/css/styles/ReadiumCSS-after.css">');

        $('#view-select').val(localStorage.getItem('view') ?? 'pagination').change()
        $LAB.setOptions({AlwaysPreserveOrder: true})
        .script('https://code.jquery.com/jquery-3.7.1.min.js')
        .script('/static/js/nen.js').wait(() => $('#mode-select').val(localStorage.getItem('background') || Colors.SEPIA).change());
      }

      const copyButton = document.createElement('button');
      copyButton.className = 'copy-button';
      copyButton.innerText = 'Sao chép';
      copyButton.onclick = () => navigator.clipboard.writeText(document.querySelector(`#${spineId}`).innerText.replaceAll(/\n{2,}/g, ''));
      $(document.body).append('\n', !data.toString().includes('<img') ? copyButton : '', `<div class="body${(data.toString().includes('<img') ? ' nomargin center"' : '"') + (!data.toString().includes('id="' + spineId + '"') ? ` id="${spineId}"` : '')}>${$(data).find('body').html()}</div>\n\n`);
      $('div.body').last().addClass($(data).find('body').attr('class'));
    });
  }

  $('img').each(function () {
    $(this).attr('src', $(this).attr('src').replace(/\.\.\/OEBPS/g, `https://raw.githubusercontent.com/DoHoaiNam914/CDN/main/light-novel/${book}/${volume}/OEBPS`).replace(/\.\./g, `https://raw.githubusercontent.com/DoHoaiNam914/CDN/main/light-novel/${book}/${volume}/OEBPS`));
  });

  $('a[href]').each(function () {
    $(this).attr('href', $(this).attr('href').replace(new RegExp('../Text/(.+).xhtml', 'g'), '#$1').replace(new RegExp('(.+).xhtml', 'g'), '#$1').replace(/toc#/g, ''));
  });

  if (performance.navigation.type === performance.navigation.TYPE_RELOAD && window.location.hash != undefined) {
    window.location.hash = '';
  } else {
    window.location.href = '#';
  }
}

function yenpressLoader(book, volume, spine) {
  for (let i = 0; i < spine.length; i++) {
    const spineHref = spine[i];
    const spineId = spineHref.replace(/Text\/(.+)\.xhtml/, '$1');

    $.get({
      async: false,
      crossDomain: false,
      url: `./${book}/${volume}/${spineHref}`,
      processData: false
    }).done(function (data) {
      if (i === 0) {
        $(document.documentElement).attr('lang', $(data).find('html').attr('lang'));
        $(document.head).html($(data).find('head').html());
        $('meta[content="text/html; charset=UTF-8"]').replaceWith(`<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="initial-scale=1, user-scalable=0, maximum-scale=1">`);
        const stylesheetHref = $('link[rel="stylesheet"]').attr('href').replace('..', `./${book}/${volume}`);
        $('link[rel="stylesheet"]').remove();
        $(document.head).append('<link rel="stylesheet" href="/static/css/styles/ReadiumCSS-before.css">');
        $.get({
          async: false,
          crossDomain: false,
          url: stylesheetHref,
          processData: false
        }).done(function (data) {
          const stylesheet = document.createElement('style');

          stylesheet.type = 'text/css';
          stylesheet.innerText = data.replace(/^body/g, '.body').replace(/(:\s*?.*)serif/g, '$1var(--baseFontFamily)');

          $(document.head).append(stylesheet);
        });
        $(document.head).append(`<link rel="stylesheet" href="/static/css/styles/patches/${book}_patch.css">`);
        $(document.head).append('<link rel="stylesheet" href="/static/css/styles/ReadiumCSS-after.css">');

        $('#view-select').val(localStorage.getItem('view') ?? 'pagination').change()
        $LAB.setOptions({AlwaysPreserveOrder: true})
        .script('https://code.jquery.com/jquery-3.7.1.min.js')
        .script('/static/js/nen.js').wait(() => $('#mode-select').val(localStorage.getItem('background') ?? Colors.SEPIA).change());
      }

      const copyButton = document.createElement('button');
      copyButton.className = 'copy-button';
      copyButton.innerText = 'Sao chép';
      copyButton.onclick = () => navigator.clipboard.writeText(document.querySelector(`#${spineId}`).innerText.replaceAll(/\n{2,}/g, ''));
      $(document.body).append('\n', !data.toString().includes('<img') ? copyButton : '', `<div class="body"${!data.toString().includes('id="' + spineId + '"') ? ` id="${spineId}"` : ''}>${$(data).find('body').html()}</div>\n\n`);
      $('div.body').last().addClass($(data).find('body').attr('class'));
    });
  }

  $('img').each(function () {
    $(this).attr('src', $(this).attr('src').replace(/\.\./g, `https://raw.githubusercontent.com/DoHoaiNam914/CDN/main/light-novel/${book}/${volume}/OEBPS`));
  });

  $('a[href]').each(function () {
    $(this).attr('href', $(this).attr('href').replace(new RegExp('../Text/(.+).xhtml', 'g'), '#$1').replace(/cover#/g, '').replace(/toc#/g, '').replace(/contents#/g, ''));
  });

  if (performance.navigation.type === performance.navigation.TYPE_RELOAD && window.location.hash != undefined) {
    window.location.hash = '';
  } else {
    window.location.href = '#';
  }
}

function customLoader(book, volume, spine) {
  for (let i = 0; i < spine.length; i++) {
    const spineHref = spine[i];
    const spineId = spineHref.replace(/xhtml\/(.+)\.xhtml/, '$1');

    $.get({
      async: false,
      crossDomain: false,
      url: `./${book}/${volume}/${spineHref}`
    }).done(function (data) {
      if ((`${book}_${volume}` === 'tenseislime_20' && i === 4) || (`${book}_${volume}` === 'chua-te-bong-toi_06' && i === 7) || (`${book}_${volume}` === 'tenseislime_21' && i === 5)) {
        $(document.documentElement).addClass('hltr');
        $(document.documentElement).attr('lang', $(data).find('html').attr('xml:lang'));
        $(document.head).html($(data).find('head').html());
        $('meta[content="text/html; charset=UTF-8"]').replaceWith(`<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="initial-scale=1, user-scalable=0, maximum-scale=1">`);
        const stylesheet = $('link[rel="stylesheet"]').prop('outerHTML').replace('..', `./${book}/${volume}`);
        $('link[rel="stylesheet"]').remove();
        $(document.head).append('<link rel="stylesheet" href="/static/css/styles/cjk-horizontal/ReadiumCSS-before.css">');
        $(document.head).append(stylesheet);
        $(document.head).append('<link rel="stylesheet" href="/static/css/styles/ReadiumCSS-ebpaj_fonts_patch.css">');
        $(document.head).append('<link rel="stylesheet" href="/static/css/styles/cjk-horizontal/ReadiumCSS-after.css">');

        $LAB.setOptions({AlwaysPreserveOrder: true})
        .script('https://code.jquery.com/jquery-3.7.1.min.js')
        .script('/static/js/nen.js');
      }

      const copyButton = document.createElement('button');
      copyButton.className = 'copy-button';
      copyButton.innerText = 'Sao chép';
      copyButton.onclick = function () {
        navigator.clipboard.writeText(this.nextSibling.innerText.replaceAll(/\n{2,}/g, ''));
      };

      $(document.body).append('\n', copyButton, `<div class="body"${!data.toString().includes('id="' + spineId + '"') ? ` id="${spineId}"` : ''}>${$(data).find('body').html().replace(/<rt>\p{scx=Hira}+<\/rt>/gu, '').replace(/<rt>(\p{scx=Kana}+)<\/rt>/gu, '（$1）')}</div>\n\n`);
      $('div.body').last().addClass($(data).find('body').attr('class'));
    });
  }

  $('image').each(function () {
    $(this).attr('xlink:href', $(this).attr('xlink:href').replace('..', `https://raw.githubusercontent.com/DoHoaiNam914/CDN/main/light-novel/${book}/${volume}/item`));
  });

  $('img').each(function () {
    $(this).attr('src', $(this).attr('src').replace('..', `https://raw.githubusercontent.com/DoHoaiNam914/CDN/main/light-novel/${book}/${volume}/item`));
  });

  if (performance.navigation.type === performance.navigation.TYPE_RELOAD && window.location.hash != undefined) {
    window.location.hash = '';
  } else {
    window.location.href = '#';
  }
}