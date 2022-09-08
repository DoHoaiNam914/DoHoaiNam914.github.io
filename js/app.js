const xhr = new XMLHttpRequest();
const parser = new DOMParser();

$(document).ready(function () {
  let searchParams = new URLSearchParams(window.location.search);

  if (searchParams.has('tap')) {
    $.get(searchParams.get('tap').concat('/content.html')).done((data) => $(document.head).html(parser.parseFromString(data, 'text/html').head.innerHTML));
    $(document.body).html(`<form>
  <div style="position: fixed; right: 8px; top: 8px;">
    <select id="background_select">
      <option value="white">Trắng</option>
      <option value="black">Đen</option>
      <option value="sepia">Sepia</option>
      <option value="cream">Kem</option>
    </select>
  </div>
</form>
<script>
  $("#background_select").on("change", function () {
    if (this.value != 'white') {
      $(document.documentElement).attr("style", $(document.documentElement).attr("style") != null ? document.documentElement.getAttribute('style').replace(/ black;/g, '').replace(/black;/g, '').replace(/ sepia;/g, '').replace(/sepia;/g, '').replace(/ cream;/g, '').replace(/cream;/g, '').concat(' ' + this.value.concat(';')) : this.value.concat(';'));
      Cookies.set('background', this.value, { expires: 365 });
    } else {
      $(document.documentElement).attr("style", $(document.documentElement).attr("style") != null ? document.documentElement.getAttribute('style').replace(/ black;/g, '').replace(/black;/g, '').replace(/ sepia;/g, '').replace(/sepia;/g, '').replace(/ cream;/g, '').replace(/cream;/g, '') : "");
      Cookies.remove('background');
    }
  });
</script>`);
  }
});

function loadYenPressSpinesContent(book, volume, spineList) {
  for (let i = 0; i < spineList.length; i++) {
    let spineName = spineList[i];
    xhr.onreadystatechange = function () {
      if (this.readyState === this.DONE) {
        let html = parser.parseFromString(this.responseText, 'application/xhtml+xml');

        if (i === 0) {
          $(document.documentElement).attr("lang", html.documentElement.getAttribute('lang'));
          $(document.head).html(html.head.innerHTML.replace(new RegExp(' xmlns="http://www.w3.org/1999/xhtml"', 'g'), '').toString());
          $("meta[content=\"text/html; charset=UTF-8\"]").replaceWith(`<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="initial-scale=1, user-scalable=0, maximum-scale=1">`);
          $(document.head).append(`<script src="https://code.jquery.com/jquery-3.6.0.min.js" integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>
<script src="../../js/js.cookie.js"></script>`);
          $(document.head).append("<link rel=\"stylesheet\" href=\"../../css/styles/DoHoaiNamStyle-before.css\">\n" + $("link[href=\"../Styles/stylesheet.css\"]").prop("outerHTML").replace('..', volume.concat('/OEBPS')) + "\n<link rel=\"stylesheet\" href=\"../../css/styles/DoHoaiNamStyle-after.css\">");
          $("link[href=\"../Styles/stylesheet.css\"]").remove();
          $("#background_select").val(Cookies.get('background') || "white").change();
        }

        $(document.body).append("\n<div" + (!this.responseText.includes('id="' + spineName + '"') ? " id=\"" + spineName + "\"" : "") + ">" + html.body.innerHTML.toString().replace(new RegExp(' xmlns="http://www.w3.org/1999/xhtml"', 'g'), '').replace(/epub:/g, '').replace(new RegExp(' xmlns:epub="http://www.idpf.org/2007/ops"', 'g'), '').replace(new RegExp('../Images', 'g'), 'https://raw.githubusercontent.com/DoHoaiNam914/CDN/main/light-novel/' + book.concat('/' + volume.concat('/OEBPS/Images'))).replace(new RegExp('../Text/', 'g'), '#').replace(/.xhtml/g, '').replace(/#cover#/g, '#').replace(/#toc#/g, '#') + "</div>\n\n");
      }
    };

    xhr.open("GET", volume.concat('/OEBPS/Text/' + spineName.concat('.xhtml')), false);
    xhr.send();
  }

  if (window.location.hash != null) {
    window.location.hash = '';
  } else {
    window.location.href = '#';
  }
}

function loadJNovelClubSpinesContent(book, volume, spineList) {
  for (let i = 0; i < spineList.length; i++) {
    let spineName = spineList[i].replace('.xhtml', '').toString();
    xhr.onreadystatechange = function () {
      if (this.readyState === this.DONE) {
        let html = parser.parseFromString(spineName === 'toc' ? this.responseText.replace(new RegExp('<a href="', 'g'), '<a href="#') : this.responseText, 'application/xhtml+xml');

        if (i === 0) {
          $(document.documentElement).attr("lang", html.documentElement.getAttribute('lang'));
          $(document.head).html(html.head.innerHTML.replace(new RegExp(' xmlns="http://www.w3.org/1999/xhtml"', 'g'), '').toString());
          $("meta[content=\"text/html; charset=UTF-8\"]").replaceWith(`<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="initial-scale=1, user-scalable=0, maximum-scale=1">`);
          $(document.head).append(`<script src="https://code.jquery.com/jquery-3.6.0.min.js" integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>
<script src="../../js/js.cookie.js"></script>`);
          $(document.head).append("<link rel=\"stylesheet\" href=\"../../css/styles/DoHoaiNamStyle-before.css\">\n" + $("link[href=\"../Styles/stylesheet.css\"]").prop("outerHTML").replace('..', volume.concat('/OEBPS')) + "\n  <link rel=\"stylesheet\" href=\"../../css/styles/DoHoaiNamStyle-after.css\">");
          $("link[href=\"../Styles/stylesheet.css\"]").remove();
          $("#background_select").val(Cookies.get('background') || "white").change();
        }

        $(document.body).append("\n<div" + (this.responseText.includes('<img') ? " class=\"nomargin center\"" : "") + (!this.responseText.includes('id="' + spineName + '"') ? " id=\"" + spineName + "\"" : "") + ">" + html.body.innerHTML.toString().replace(new RegExp(' xmlns="http://www.w3.org/1999/xhtml"', 'g'), '').replace(/epub:/g, '').replace(new RegExp(' xmlns:epub="http://www.idpf.org/2007/ops"', 'g'), '').replace(new RegExp('../Images', 'g'), 'https://raw.githubusercontent.com/DoHoaiNam914/CDN/main/light-novel/' + book.concat('/' + volume.concat('/OEBPS/Images'))).replace(new RegExp('../Text/', 'g'), '').replace(/.xhtml/g, '').replace(/#toc#/g, '#') + "</div>\n\n");
      }
    };

    xhr.open("GET", volume.concat('/OEBPS/Text/' + spineName.concat('.xhtml')), false);
    xhr.send();
  }

  if (window.location.hash != null) {
    window.location.hash = '';
  } else {
    window.location.href = '#';
  }
}