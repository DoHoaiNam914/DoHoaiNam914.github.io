function loadJNovelClubSpinesContent(book, volume, spineList) {
  let xhr = new XMLHttpRequest();
  let parser = new DOMParser();
  var spines = '';

  for (let i = 0; i < spineList.length; i++) {
    let spineName = spineList[i].replace('.xhtml', '');
    xhr.open("GET", 'https://raw.githubusercontent.com/DoHoaiNam914/CDN/main/' + book.concat('/' + volume.concat('/OEBPS/Text/' + spineName.toString().concat('.xhtml'))), false);
    xhr.onload = function() {
      spines += '<div' + (xhr.responseText.includes('<img') ? ' class="nomargin center"' : '') + (!xhr.responseText.includes('id="' + spineName + '"') ? ' id="' + spineName + '"' : '') + '>' + parser.parseFromString(xhr.responseText, 'application/xhtml+xml').body.innerHTML.replace('xmlns="http://www.w3.org/1999" xmlns:epub="http://www.idpf.org/2007/ops" epub:', '').replace(/..\/Images/g, 'https://raw.githubusercontent.com/DoHoaiNam914/CDN/main/' + book.concat('/' + volume.concat('/OEBPS/Images'))).replace(/..\/Text\//g, '#').replace(/.xhtml/g, '').replace(/\n$/, '').replace(/#toc#/g, '#') + '</div>\n\n\n';
      console.log('Loaded:', spineName);
    }

    xhr.send();
  }

  $(document.body).append(spines);
}