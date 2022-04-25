function loadJNovelClubSpinesContent(book, volume, spineList) {
  let xhr = new XMLHttpRequest();
  let parser = new DOMParser();
  var spines = '';

  for (let i = 0; i < spineList.length; i++) {
    let spineName = spineList[i].replace('.xhtml', '');
    xhr.open("GET", "OEBPS/Text/" + spineName.toString().concat('.xhtml'), false);
    xhr.onload = function() {
      spines += '<div' + (!xhr.responseText.includes('id="' + spineName + '"') ? ' id="' + spineName + '"' : '') + '>' + parser.parseFromString(xhr.responseText, 'text/html').body.innerHTML.replace(/..\/Images\/jnovelclub/g,'https://raw.githubusercontent.com/DoHoaiNam914/CDN/main/tranh-minh-hoa/jnovelclub').replace(/..\/Images/g,'https://raw.githubusercontent.com/DoHoaiNam914/CDN/main/tranh-minh-hoa/' + book +'/' + volume).replace(/..\/Text\//g, '#').replace(/.xhtml/g, '').replace(/\n$/, '').replace(/#toc#/g, '#') + '</div>\n\n\n';
      console.log('Loaded:' + spineList[i]);
    }

    xhr.send();
  }

  document.body.innerHTML = spines;
}