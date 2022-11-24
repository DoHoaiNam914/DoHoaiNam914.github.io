const J_NOVEL = 'j_novel';
const YENPRESS = 'yenpress';
const CUSTOM = 'custom';

$(document).ready(function () {
  let searchParams = new URLSearchParams(window.location.search);

  book = searchParams.get('sach') || 'tinhlinh';
  volume = searchParams.get('tap') || 'volume-10';

  $.getJSON('/light-novel/data.json', function (data) {
    _.each(data.library[0][book], function (currentVolume) {
      if (currentVolume.id === volume) {
        switch (currentVolume.loader) {
          case J_NOVEL:
            j_novelLoader(book, volume, currentVolume.spine);
            break;
          case YENPRESS:
            yenpressLoader(book, volume, currentVolume.spine);
            break;
          case CUSTOM:
            customLoader(book, volume, currentVolume.spine);
            break;
        }
      }
    });
  }).fail(function (jqXHR, textStatus, errorThrown) {
    throw new Error(textStatus);
  });
});

function j_novelLoader(book, volume, spine) {
  for (let i = 0; i < spine.length; i++) {
    let spineName = spine[i].replace('.xhtml', '');
    let settings = {
      async: false,
      crossDomain: false,
      url: `${book}/${volume}/Text/${spineName.concat('.xhtml')}`,
      processData: false
    };

    $.get(settings).done(function (data) {
      if (i === 0) {
        $(document.documentElement).attr("lang", $(data).find("html").attr("lang"));
        $(document.head).html($(data).find("head").html());
        $("meta[content=\"text/html; charset=UTF-8\"]").replaceWith(`<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="initial-scale=1, user-scalable=0, maximum-scale=1">`);
        let stylesheet = $("link[rel=\"stylesheet\"]").prop("outerHTML").replace('..', `./${book}/${volume}`);
        $("link[rel=\"stylesheet\"]").remove();
        $(document.head).append(`<link rel="stylesheet" href="/css/styles/DoHoaiNamStyle-before.css">\n${stylesheet}\n<link rel="stylesheet" href="/css/styles/DoHoaiNamStyle/j-novelclub_patch.css">\n<link rel="stylesheet" href="/css/styles/DoHoaiNamStyle-after.css">`);
        $(document.head).append(`<script src="/lib/LAB.js"></script>
<script>
  $LAB.setOptions({AlwaysPreserveOrder:true})
    .script("/lib/jquery-3.6.1.js")
    .script("/lib/js.cookie.js");
</script>`);
        $(document.body).html(`<form>
  <div class="notranslate" style="bottom: 8px; left: 8px; position: fixed;">
    <select id="backgroundSelect">
      <option value="white" selected>Trắng</option>
      <option value="black">Đen</option>
      <option value="sepia">Sepia</option>
      <option value="cream">Kem</option>
    </select>
  </div>
</form>
<script>
  $LAB
    .script("/js/nen.js").wait(() => $("#backgroundSelect").val(localStorage.getItem("background") || "white").change());
</script>`);
      }

      $(document.body).append(`\n<div class="body${data.toString().includes('<img') ? ' nomargin center"' : '"'}${!data.toString().includes('id="' + spineName + '"') ? ` id="${spineName}"` : ''}>${$(data).find("body").html()}</div>\n\n`);
      $("div.body").last().addClass($(data).find("body").attr("class"));
    });
  }

  $("img").each(function () {
    $(this).attr("src", $(this).attr("src").replace(/\.\./g, `https://raw.githubusercontent.com/DoHoaiNam914/CDN/main/light-novel/${book}/${volume}/OEBPS`));
  });

  $("a[href]").each(function () {
    $(this).attr("href", $(this).attr("href").replace(new RegExp('../Text/(.+).xhtml', 'g'), '#$1').replace(/toc#/g, ''));
  });

  if (performance.navigation.type === performance.navigation.TYPE_RELOAD && window.location.hash != undefined) {
    window.location.hash = '';
  } else {
    window.location.href = '#';
  }
}

function yenpressLoader(book, volume, spine) {
  for (let i = 0; i < spine.length; i++) {
    let spineName = spine[i].replace('id_cover_xhtml', 'cover').replace('.xhtml', '');
    let settings = {
      async: false,
      crossDomain: false,
      url: `${book}/${volume}/Text/${spineName.concat('.xhtml')}`,
      processData: false
    };

    $.get(settings).done(function (data) {
      if (i === 0) {
        $(document.documentElement).attr("lang", $(data).find("html").attr("lang"));
        $(document.head).html($(data).find("head").html());
        $("meta[content=\"text/html; charset=UTF-8\"]").replaceWith(`<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="initial-scale=1, user-scalable=0, maximum-scale=1">`);
        let stylesheet = $("link[rel=\"stylesheet\"]").prop("outerHTML").replace('..', `./${book}/${volume}`);
        $("link[rel=\"stylesheet\"]").remove();
        $(document.head).append(`<link rel="stylesheet" href="/css/styles/DoHoaiNamStyle-before.css">\n${stylesheet}\n<link rel="stylesheet" href="/css/styles/DoHoaiNamStyle/${book}_patch.css">\n<link rel="stylesheet" href="/css/styles/DoHoaiNamStyle-after.css">`);
        $(document.head).append(`<script src="/lib/LAB.js"></script>
<script>
  $LAB.setOptions({AlwaysPreserveOrder:true})
    .script("/lib/jquery-3.6.1.js")
    .script("/lib/js.cookie.js");
</script>`);
        $(document.body).html(`<form>
  <div class="notranslate" style="bottom: 8px; left: 8px; position: fixed;">
    <select id="backgroundSelect">
      <option value="white" selected>Trắng</option>
      <option value="black">Đen</option>
      <option value="sepia">Sepia</option>
      <option value="cream">Kem</option>
    </select>
  </div>
</form>
<script>
  $LAB
    .script("/js/nen.js").wait(() => $("#backgroundSelect").val(localStorage.getItem("background") || "white").change());
</script>`);
      }

      $(document.body).append(`\n<div class="body"${!data.toString().includes('id="' + spineName + '"') ? ` id="${spineName}"` : ''}>${$(data).find("body").html()}</div>\n\n`);
      $("div.body").last().addClass($(data).find("body").attr("class"));
    });
  }

  $("img").each(function () {
    $(this).attr("src", $(this).attr("src").replace(/\.\./g, `https://raw.githubusercontent.com/DoHoaiNam914/CDN/main/light-novel/${book}/${volume}/OEBPS`));
  });

  $("a[href]").each(function () {
    $(this).attr("href", $(this).attr("href").replace(new RegExp('../Text/(.+).xhtml', 'g'), '#$1').replace(/cover#/g, '').replace(/toc#/g, ''));
  });

  if (performance.navigation.type === performance.navigation.TYPE_RELOAD && window.location.hash != undefined) {
    window.location.hash = '';
  } else {
    window.location.href = '#';
  }
}

function customLoader(book, volume, spine) {
  switch (`${book}_${volume}`) {
    case 'tinhlinh_22-junpaku-no-houteishiki':
      for (let i = 0; i < spine.length; i++) {
        let spineName = spine[i];
        let settings = {
          async: false,
          crossDomain: false,
          url: `${book}/${volume}/${spineName}`,
          processData: false
        };

        $.get(settings).done(function (data) {
          let html = !spineName.includes('xhtml') ? (new DOMParser()).parseFromString(data, 'application/xhtml+xml') : undefined;

          if (i === 5) {
            $(document.documentElement).attr("lang", $(html.documentElement).attr("xml:lang"));
            $(document.documentElement).addClass("hltr1");
            $(document.head).html($(html.head).html());
            $("meta[content=\"text/html; charset=UTF-8\"]").replaceWith(`<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="initial-scale=1, user-scalable=0, maximum-scale=1">`);
            let stylesheet = `${$("link[href=\"../stylesheet.css\"]").prop("outerHTML").replace('..', `./${book}/${volume}`)}\n${$("link[href=\"../page_styles.css\"]").prop("outerHTML").replace('..', `./${book}/${volume}`)}`;
            $("link[href=\"../stylesheet.css\"]").remove();
            $("link[href=\"../page_styles.css\"]").remove();
            $(document.head).append(`<link rel="stylesheet" href="/css/styles/DoHoaiNamStyle-before.css">\n${stylesheet}\n<link rel="stylesheet" href="/css/styles/DoHoaiNamStyle-after.css">`);
            $(document.head).append(`<script src="/lib/LAB.js"></script>
<script>
  $LAB.setOptions({AlwaysPreserveOrder:true})
    .script("/lib/jquery-3.6.1.js")
    .script("/lib/js.cookie.js");
</script>`);
            $(document.body).prepend(`<form>
  <div class="notranslate" style="bottom: 8px; left: 8px; position: fixed;">
    <select id="backgroundSelect">
      <option value="white" selected>Trắng</option>
      <option value="black">Đen</option>
      <option value="sepia">Sepia</option>
      <option value="cream">Kem</option>
    </select>
  </div>
</form>
<script>
  $LAB
    .script("/js/nen.js").wait(() => $("#backgroundSelect").val(localStorage.getItem("background") || "white").change());
</script>`);
          }

          $(document.body).append(`\n<div class="body">${(html != undefined ? $(html.body).html() : $(data).find("body").html()).replace(new RegExp('<ruby><rb>(\\p{scx=Hani}+)</rb><rt>\\p{sc=Hira}+</rt></ruby>', 'gu'), '$1').replace(/<rt>/g, '（<rtc>').replace(/<\/rt>/g, '</rtc>）')}</div>\n\n`);
          $("div.body").last().addClass((html != undefined ? $(html.body) : $(data).find("body")).attr("class"));
        });
      }

      $("image").each(function () {
        $(this).attr("xlink:href", $(this).attr("xlink:href").replace('..', `https://raw.githubusercontent.com/DoHoaiNam914/CDN/main/light-novel/${book}/${volume}`).replace(new RegExp('cover.jpeg', 'g'), `https://raw.githubusercontent.com/DoHoaiNam914/CDN/main/light-novel/${book}/${volume}/cover.jpeg`));
      });

      $("img").each(function () {
        $(this).attr("src", $(this).attr("src").replace('..', `https://raw.githubusercontent.com/DoHoaiNam914/CDN/main/light-novel/${book}/${volume}`));
      });

      $("a[href]").each(function () {
        $(this).attr("href", $(this).attr("href").replace(/part(.+)\.html/g, ''));
      });

      if (performance.navigation.type === performance.navigation.TYPE_RELOAD && window.location.hash != undefined) {
        window.location.hash = '';
      } else {
        window.location.href = '#';
      }

      break;
    case 'tenseislime_20':
      for (let i = 0; i < spine.length; i++) {
        let spineName = spine[i];
        let settings = {
          async: false,
          crossDomain: false,
          url: `${book}/${volume}/xhtml/${spineName.concat('.xhtml')}`,
          processData: false
        };

        $.get(settings).done(function (data) {
          if (i === 4) {
            $(document.documentElement).addClass("hltr");
            $(document.documentElement).attr("lang", $(data).find("html").attr("xml:lang"));
            $(document.head).html($(data).find("head").html());
            $("meta[content=\"text/html; charset=UTF-8\"]").replaceWith(`<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="initial-scale=1, user-scalable=0, maximum-scale=1">`);
            let stylesheet = $("link[rel=\"stylesheet\"]").prop("outerHTML").replace('..', `./${book}/${volume}`);
            $("link[rel=\"stylesheet\"]").remove();
            $("style[id=\"koboSpanStyle\"]").remove();
            $(document.head).append(`<link rel="stylesheet" href="/css/styles/DoHoaiNamStyle-before.css">\n${stylesheet}\n<link rel="stylesheet" href="/css/styles/DoHoaiNamStyle-after.css">`);
            $(document.head).append(`<script src="/lib/LAB.js"></script>
<script>
  $LAB.setOptions({AlwaysPreserveOrder:true})
    .script("/lib/jquery-3.6.1.js")
    .script("/lib/js.cookie.js");
</script>`);
            $(document.body).prepend(`<form>
  <div class="notranslate" style="bottom: 8px; left: 8px; position: fixed;">
    <select id="backgroundSelect">
      <option value="white" selected>Trắng</option>
      <option value="black">Đen</option>
      <option value="sepia">Sepia</option>
      <option value="cream">Kem</option>
    </select>
  </div>
</form>
<script>
  $LAB
    .script("/js/nen.js").wait(() => $("#backgroundSelect").val(localStorage.getItem("background") || "white").change());
</script>`);
          }

          $(document.body).append(`\n<div class="body">${$(data).find("body").html().replace(new RegExp('<ruby>(<span xmlns="http://www.w3.org/1999/xhtml" class="koboSpan" id="kobo.\\d+.1">\\p{scx=Hani}+</span>)<rt>\\p{sc=Hira}+</rt></ruby>', 'gu'), '$1').replace(/<rt>/g, '（<rtc>').replace(/<\/rt>/g, '</rtc>）')}</div>\n\n`);
          $("div.body").last().addClass($(data).find("body").attr("class"));
        });
      }

      $("image").each(function () {
        $(this).attr("xlink:href", $(this).attr("xlink:href").replace('..', `https://raw.githubusercontent.com/DoHoaiNam914/CDN/main/light-novel/${book}/${volume}/item`));
      });

      $("img").each(function () {
        $(this).attr("src", $(this).attr("src").replace('..', `https://raw.githubusercontent.com/DoHoaiNam914/CDN/main/light-novel/${book}/${volume}/item`));
      });

      if (performance.navigation.type === performance.navigation.TYPE_RELOAD && window.location.hash != undefined) {
        window.location.hash = '';
      } else {
        window.location.href = '#';
      }

      break;
  }
}