const xhr = new XMLHttpRequest();
const parser = new DOMParser();

$(document).ready(function () {
  let searchParams = new URLSearchParams(window.location.search);

  if (searchParams.has('trang')) {
    $.get("trang" + searchParams.get('trang').concat('.html'), function(data) {
      data = parser.parseFromString(data, 'text/html');
      $(document.head).html(data.head.innerHTML);
      $(document.body).html(data.body.innerHTML);
    });
  } else if (searchParams.has('tap')) {
    if (window.location.hash != '') {
      window.location.hash = '';
    }

    $(document.body).html('');
    $(document.head).load(searchParams.get('tap').concat('/content.html'));
  } else {
    $.get("trang1.html", function(data) {
      data = parser.parseFromString(data, 'text/html')
      $(document.head).html(data.head.innerHTML);
      $(document.body).html(data.body.innerHTML);
    });
  }
});

function loadYenPressSpinesContent(book, volume, spineList) {
  for (let i = 0; i < spineList.length; i++) {
    let spineName = spineList[i];
    xhr.open("GET", volume.concat('/OEBPS/Text/' + spineName.concat('.xhtml')), false);
    xhr.onload = function() {
      let html = parser.parseFromString(xhr.responseText, 'application/xhtml+xml');

      if (i === 0) {
        $(document.documentElement).attr("lang", html.documentElement.getAttribute('lang'));
        $(document.head).html(html.head.innerHTML.replace(new RegExp(' xmlns="http://www.w3.org/1999/xhtml"', 'g'), ''));
        $("link[href=\"../Styles/stylesheet.css\"]").replaceWith('<link rel="stylesheet" href="../../css/style/DoHoaiNamStyle-before.css">\n<link rel="stylesheet" href="../../css/style/DoHoaiNamStyle-ebpaj_fonts_patch.css">\n' + $("link[href=\"../Styles/stylesheet.css\"]").prop('outerHTML').replace('..', volume.concat('/OEBPS')) + '\n<link rel="stylesheet" href="../../css/style/DoHoaiNamStyle-after.css">');
      }

      $(document.body).append("\n<div" + (!xhr.responseText.includes('id="' + spineName + '"') ? " id=\"" + spineName + "\"" : "") + ">" + html.body.innerHTML.toString().replace(new RegExp(' xmlns="http://www.w3.org/1999/xhtml"', 'g'), '').replace(new RegExp(' xmlns:epub="http://www.idpf.org/2007/ops"', 'g'), '').replace(new RegExp('epub:', 'g'), '').replace(new RegExp('../Images', 'g'), 'https://raw.githubusercontent.com/DoHoaiNam914/CDN/main/light-novel/' + book.concat('/' + volume.concat('/OEBPS/Images'))).replace(new RegExp('../Text/', 'g'), '#').replace(/.xhtml/g, '').replace(/#cover#/g, '#').replace(/#toc#/g, '#') + "</div>\n\n");
    }

    xhr.send();
  }
}

function loadJNovelClubSpinesContent(book, volume, spineList) {
  for (let i = 0; i < spineList.length; i++) {
    let spineName = spineList[i].replace('.xhtml', '').toString();
    xhr.open("GET", volume.concat('/OEBPS/Text/' + spineName.concat('.xhtml')), false);
    xhr.onload = function() {
      let html = parser.parseFromString(spineName === 'toc' ? xhr.responseText.replace(new RegExp('<a href="', 'g'), '<a href="#') : xhr.responseText, 'application/xhtml+xml');

      if (i === 0) {
        $(document.documentElement).attr("lang", html.documentElement.getAttribute('lang'));
        $(document.head).html(html.head.innerHTML.replace(new RegExp(' xmlns="http://www.w3.org/1999/xhtml"', 'g'), ''));
        $("link[href=\"../Styles/stylesheet.css\"]").replaceWith('<link rel="stylesheet" href="../../css/style/DoHoaiNamStyle-before.css">\n  <link rel="stylesheet" href="../../css/style/DoHoaiNamStyle-ebpaj_fonts_patch.css">\n  ' + $("link[href=\"../Styles/stylesheet.css\"]").prop('outerHTML').replace('..', volume.concat('/OEBPS')) + '\n  <link rel="stylesheet" href="../../css/style/DoHoaiNamStyle-after.css">');
      }

      $(document.body).append("\n<div" + (xhr.responseText.includes('<img') ? " class=\"nomargin center\"" : "") + (!xhr.responseText.includes('id="' + spineName + '"') ? " id=\"" + spineName + "\"" : "") + ">" + html.body.innerHTML.toString().replace(new RegExp('xmlns="http://www.w3.org/1999" xmlns:epub="http://www.idpf.org/2007/ops" epub:', 'g'), '').replace(new RegExp('../Images', 'g'), 'https://raw.githubusercontent.com/DoHoaiNam914/CDN/main/light-novel/' + book.concat('/' + volume.concat('/OEBPS/Images'))).replace(new RegExp('../Text/', 'g'), '#').replace(/.xhtml/g, '').replace(/#toc#/g, '#') + "</div>\n\n");
    }

    xhr.send();
  }
}

function loadYenPressSpinesContentOld(book, volume, spineList) {
  for (let i = 0; i < spineList.length; i++) {
    let spineName = spineList[i];
    xhr.open("GET", volume.concat('/OEBPS/Text/' + spineName.concat('.xhtml')), false);
    xhr.onload = function() {
      let html = parser.parseFromString(xhr.responseText, 'application/xhtml+xml');

      if (i === 0) {
        $(document.documentElement).attr("lang", html.documentElement.getAttribute('lang'));
        $(document.head).html(html.head.innerHTML.replace(new RegExp(' xmlns="http://www.w3.org/1999/xhtml"', 'g'), ''));
        $("link[href=\"../Styles/stylesheet.css\"]").replaceWith('<link rel="stylesheet" href="../../css/style/DoHoaiNamStyle-before.css">\n<link rel="stylesheet" href="../../css/style/DoHoaiNamStyle-ebpaj_fonts_patch.css">\n' + $("link[href=\"../Styles/stylesheet.css\"]").prop('outerHTML').replace('..', volume.concat('/OEBPS')) + '\n<link rel="stylesheet" href="../../css/style/DoHoaiNamStyle-after.css">');
      }

      $(document.body).append("\n<div" + (!xhr.responseText.includes('id="' + spineName + '"') ? " id=\"" + spineName + "\"" : "") + ">" + html.body.innerHTML.toString().replace(new RegExp(' xmlns="http://www.w3.org/1999/xhtml"', 'g'), '').replace(new RegExp(' xmlns:epub="http://www.idpf.org/2007/ops"', 'g'), '').replace(new RegExp('epub:', 'g'), '').replace(new RegExp('../Images', 'g'), 'https://raw.githubusercontent.com/DoHoaiNam914/CDN/main/tranh-minh-hoa/' + book +'/' + volume).replace(new RegExp('../Text/', 'g'), '#').replace(/.xhtml/g, '').replace(/#cover#/g, '#').replace(/#toc#/g, '#') + "</div>\n\n");
    }

    xhr.send();
  }
}

function loadJNovelClubSpinesContentOld(book, volume, spineList) {
  var spines = '';

  for (let i = 0; i < spineList.length; i++) {
    let spineName = spineList[i].replace('.xhtml', '').toString();
    xhr.open("GET", volume.concat('/OEBPS/Text/' + spineName.concat('.xhtml')), false);
    xhr.onload = function() {
      let html = parser.parseFromString(xhr.responseText, 'application/xhtml+xml');

      if (i === 0) {
        $(document.documentElement).attr("lang", html.documentElement.getAttribute('lang'));
        $(document.head).html(html.head.innerHTML.replace(new RegExp(' xmlns="http://www.w3.org/1999/xhtml"', 'g'), ''));
        $("link[href=\"../Styles/stylesheet.css\"]").replaceWith('<link rel="stylesheet" href="../../css/style/DoHoaiNamStyle-before.css">\n  <link rel="stylesheet" href="../../css/style/DoHoaiNamStyle-ebpaj_fonts_patch.css">\n  ' + $("link[href=\"../Styles/stylesheet.css\"]").prop('outerHTML').replace('..', volume.concat('/OEBPS')) + '\n  <link rel="stylesheet" href="../../css/style/DoHoaiNamStyle-after.css">');
      }

      $(document.body).append("\n<div" + (xhr.responseText.includes('<img') ? " class=\"nomargin center\"" : "") + (!xhr.responseText.includes('id="' + spineName + '"') ? " id=\"" + spineName + "\"" : "") + ">" + html.body.innerHTML.toString().replace(new RegExp('xmlns="http://www.w3.org/1999" xmlns:epub="http://www.idpf.org/2007/ops" epub:', 'g'), '').replace(new RegExp('../Images/jnovelclub', 'g'), 'https://raw.githubusercontent.com/DoHoaiNam914/CDN/main/tranh-minh-hoa/jnovelclub').replace(new RegExp('../Images', 'g'), 'https://raw.githubusercontent.com/DoHoaiNam914/CDN/main/tranh-minh-hoa/' + book +'/' + volume).replace(new RegExp('../Text/', 'g'), '#').replace(/.xhtml/g, '').replace(/#toc#/g, '#') + "</div>\n\n");
    }

    xhr.send();
  }
}
