const xhr = new XMLHttpRequest();
const parser = new DOMParser();

function load(volume) {
  $(document.head).load(volume.concat('/content.html'));
  $.get(volume.concat('/content.html'), function(data) {
    data = (new DOMParser()).parseFromString(data, 'text/html');
    $(document.body).html('');
  });
}

function navigate(page) {
  $.get(page.concat(".html"), function(data) {
    data = (new DOMParser()).parseFromString(data, 'text/html')
    $(document.head).html(data.head.innerHTML);
    $(document.body).html(data.body.innerHTML);
  });
}

function loadJNovelClubSpinesContent(book, volume, spineList) {
  var spines = '';

  for (let i = 0; i < spineList.length; i++) {
    let spineName = spineList[i].replace('.xhtml', '').toString();
    xhr.open("GET", volume.concat('/OEBPS/Text/' + spineName.concat('.xhtml')), false);
    xhr.onload = function() {
      let html = parser.parseFromString(xhr.responseText, 'application/xhtml+xml');

      if (i === 0) {
        $(document.head).html(html.head.innerHTML.replace('../Styles', volume.concat('/OEBPS/Styles')));
      }

      spines += '<div' + (xhr.responseText.includes('<img') ? ' class="nomargin center"' : '') + (!xhr.responseText.includes('id="' + spineName + '"') ? ' id="' + spineName + '"' : '') + '>' + parser.parseFromString(xhr.responseText, 'application/xhtml+xml').body.innerHTML.replace(new RegExp('../Images', 'g'), 'https://raw.githubusercontent.com/DoHoaiNam914/CDN/main/light-novel/' + book.concat('/' + volume.concat('/OEBPS/Images'))).replace(new RegExp('../Text/', 'g'), '#').replace(/.xhtml/g, '').replace(/\n$/, '').replace(/#toc#/g, '#').replace(new RegExp('xmlns="http://www.w3.org/1999" xmlns:epub="http://www.idpf.org/2007/ops" epub:', 'g'), '') + '</div>\n\n\n';
    }

    xhr.send();
  }

  $(document.head).append('\n<link rel="stylesheet" href="../../css/style/dohoainam914-jnovelclub-style.css">');
  $(document.body).append(spines);
}

function loadYenPressSpinesContent(book, volume, spineList) {
  var spines = '';

  for (let i = 0; i < spineList.length; i++) {
    let spineName = spineList[i];
    xhr.open("GET", volume.concat('/OEBPS/Text/' + spineName.concat('.xhtml')), false);
    xhr.onload = function() {
      let html = parser.parseFromString(xhr.responseText, 'application/xhtml+xml');

      if (i === 0) {
        $(document.head).html(html.head.innerHTML.replace('../Styles', volume.concat('/OEBPS/Styles')));
      }

      spines += '<div' + (!xhr.responseText.includes('id="' + spineName + '"') ? ' id="' + spineName + '"' : '') + '>' + html.body.innerHTML.replace(new RegExp('../Images', 'g'), 'https://raw.githubusercontent.com/DoHoaiNam914/CDN/main/light-novel/' + book.concat('/' + volume.concat('/OEBPS/Images'))).replace(new RegExp('../Text/', 'g'), '#').replace(/.xhtml/g, '').replace(/\n$/, '').replace(/#cover#/g, '#').replace(/#toc#/g, '#').replace(new RegExp('xmlns="http://www.w3.org/1999" epub:', 'g'), '').replace(new RegExp(' xmlns:epub="http://www.idpf.org/2007/ops"', 'g'), '') + '</div>\n\n\n';
    }

    xhr.send();
  }

  $(document.head).append('\n<link rel="stylesheet" href="../../css/style/dohoainam914-yenpress-style.css">');
  $(document.body).append(spines);
}

function loadJNovelClubSpinesContentOld(book, volume, spineList) {
  var spines = '';

  for (let i = 0; i < spineList.length; i++) {
    let spineName = spineList[i].replace('.xhtml', '').toString();
    xhr.open("GET", volume.concat('/OEBPS/Text/' + spineName.concat('.xhtml')), false);
    xhr.onload = function() {
      let html = parser.parseFromString(xhr.responseText, 'application/xhtml+xml');

      if (i === 0) {
        $(document.head).html(html.head.innerHTML.replace('../Styles', volume.concat('/OEBPS/Styles')));
      }

      spines += '<div' + (xhr.responseText.includes('<img') ? ' class="nomargin center"' : '') + (!xhr.responseText.includes('id="' + spineName + '"') ? ' id="' + spineName + '"' : '') + '>' + parser.parseFromString(xhr.responseText, 'application/xhtml+xml').body.innerHTML.replace(new RegExp('../Images/jnovelclub', 'g'), 'https://raw.githubusercontent.com/DoHoaiNam914/CDN/main/tranh-minh-hoa/jnovelclub').replace(new RegExp('../Images', 'g'), 'https://raw.githubusercontent.com/DoHoaiNam914/CDN/main/tranh-minh-hoa/' + book +'/' + volume).replace(new RegExp('../Text/', 'g'), '#').replace(/.xhtml/g, '').replace(/\n$/, '').replace(/#toc#/g, '#').replace(new RegExp('xmlns="http://www.w3.org/1999" xmlns:epub="http://www.idpf.org/2007/ops" epub:', 'g'), '') + '</div>\n\n\n';
    }

    xhr.send();
  }

  $(document.head).append('\n<link rel="stylesheet" href="../../css/style/dohoainam914-jnovelclub-style.css">');
  $(document.body).append(spines);
}

function loadYenPressSpinesContentOld(book, volume, spineList) {
  var spines = '';

  for (let i = 0; i < spineList.length; i++) {
    let spineName = spineList[i];
    xhr.open("GET", volume.concat('/OEBPS/Text/' + spineName.concat('.xhtml')), false);
    xhr.onload = function() {
      let html = parser.parseFromString(xhr.responseText, 'application/xhtml+xml');

      if (i === 0) {
        $(document.head).html(html.head.innerHTML.replace('../Styles', volume.concat('/OEBPS/Styles')));
      }

      spines += '<div' + (!xhr.responseText.includes('id="' + spineName + '"') ? ' id="' + spineName + '"' : '') + '>' + parser.parseFromString(xhr.responseText, 'application/xhtml+xml').body.innerHTML.replace(new RegExp('../Images', 'g'), 'https://raw.githubusercontent.com/DoHoaiNam914/CDN/main/tranh-minh-hoa/' + book +'/' + volume).replace(new RegExp('../Text/', 'g'), '#').replace(/.xhtml/g, '').replace(/\n$/, '').replace(/#cover#/g, '#').replace(/#toc#/g, '#').replace(new RegExp('xmlns="http://www.w3.org/1999" epub:', 'g'), '').replace(new RegExp(' xmlns:epub="http://www.idpf.org/2007/ops"', 'g'), '') + '</div>\n\n\n';
    }

    xhr.send();
  }

  $(document.head).append('\n<link rel="stylesheet" href="../../css/style/dohoainam914-yenpress-style.css">');
  $(document.body).append(spines);
}