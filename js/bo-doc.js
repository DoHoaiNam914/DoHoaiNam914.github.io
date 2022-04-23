function loadJNovelClubSpinesContent(spines[]) {
  let xhr = new XMLHttpRequest();
  let parser = new DOMParser();
  var spine = '';

  for (let i = 0; i < spines.length; i++) {
    xhr.open("GET", "OEBPS/Text/" + spines[i], false);
    xhr.onload = function() {
      spine += '<div>' + parser.parseFromString(xhr.responseText, 'text/html').body.innerHTML.replace(/..\/Images\/jnovelclub/g,'https://raw.githubusercontent.com/DoHoaiNam914/CDN/main/tranh-minh-hoa/jnovelclub').replace(/..\/Images/g,'https://raw.githubusercontent.com/DoHoaiNam914/CDN/main/tranh-minh-hoa/tinhlinh/volume18').replace(/\n$/, '') + '</div>\n\n\n';
      console.log('Loaded:' + spines[i]);
    }

    xhr.send();
  }

  document.body.innerHTML = spine;
}