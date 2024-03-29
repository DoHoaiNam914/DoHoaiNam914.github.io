'use strict';

$(document).ready(async () => {
  const searchParams = new URLSearchParams(window.location.search);

  const dictionary = searchParams.get('dictionary') ?? 'lac-viet';
  const define = searchParams.get('define').trim().replaceAll(/^\s+|\s+$/g, '').toLowerCase() ?? '';
  const sectionHeading = document.createElement('h1');
  let paragraph = document.createElement('p');

  if (define.length > 0) {
    sectionHeading.innerText = `Từ khoá: ${define}`;
    $(document.body).append(sectionHeading.cloneNode(true));
    $(document.body).append(document.createElement('hr'));

    switch (dictionary) {
      case 'thieuchuu': {
        $.ajax({
          async: false,
          method: 'GET',
          url: '/static/datasource/cjkvmap.txt',
        }).done((data) => {
          data.split(/\r?\n|\r/).map((element) => element.split('|')).filter(([first, second, third]) => [...define].some((element) => first.toLowerCase() === element) || define.split(' ').some((a) => second.split('/')[0].toLowerCase().split(', ').some((b) => b === a) || (define.length >= 2 && third.toLowerCase().includes(define)))).sort((a, b) => [...define].indexOf(a[0]) - [...define].indexOf(b[0]) || define.split(' ').indexOf(b[1].split('/')[0].toLowerCase().split(', ').filter((element) => define.includes(element))[0]) - define.split(' ').indexOf(a[1].split('/')[0].toLowerCase().split(', ').filter((element) => define.includes(element))[0])).forEach(([first, second, third]) => {
            sectionHeading.innerText = first;
            $(document.body).append(sectionHeading.cloneNode(true));

            const bringAttention = document.createElement('b');
            const [sinovietnamesePronunciation, pinyin] = second.split('/');

            bringAttention.innerText = 'Âm Hán-Việt:';
            paragraph = document.createElement('p');
            paragraph.appendChild(bringAttention);
            paragraph.innerText += ` ${sinovietnamesePronunciation}`;
            $(document.body).append(paragraph.cloneNode(true));

            bringAttention.innerText = 'Pinyin:';
            paragraph = document.createElement('p');
            paragraph.appendChild(bringAttention);
            paragraph.innerText += ` ${pinyin}`;
            $(document.body).append(paragraph.cloneNode(true));

            third.split(/\*?\/ /).forEach((element) => {
              paragraph.innerHTML = Utils.convertTextToHtml(element).replaceAll(/{([^}]+)}/g, '<b>$1</b>').replaceAll(/\[(\p{sc=Hani})\]/gu, '<a href="/dich-nhanh/tra-tu-dien.html?dictionary=thieuchuu&define=$1">$1</a>');
              $(document.body).append(paragraph.cloneNode(true));
            });

            $(document.body).append(document.createElement('hr'));
          });
        });

        break;
      }
      case 'td': {
        $.ajax({
          async: false,
          method: 'GET',
          url: `${Utils.CORS_PROXY}http://nguyendu.com.free.fr/hanviet/ajax.php?query=${encodeURIComponent(define)}&methode=normal`,
        }).done((a) => {
          a.split('|').map((element) => element.split(':')).filter((element) => element.length === 3).forEach(async ([first, second]) => {
            await $.ajax({
              method: 'GET',
              url: `${Utils.CORS_PROXY}http://nguyendu.com.free.fr/hanviet/hv_tim${first === 'Word' ? 'tukep_ndv.php?wordid' : 'chu_ndv.php?unichar'}=${second}`,
            }).done((b) => {
              $(document.body).append($(b)[first === 'Word' ? 19 : 31].innerHTML.replaceAll(/(href|src)="/g, '$&http://nguyendu.com.free.fr/hanviet/').replaceAll(`
function init()
{
	loadAd();
}
function loadAd()
{
        if (AdURL && top.pubside1)
        {
                top.pubside1.location.href=AdURL;
        }
}
`, ''));
            });
          });
        });

        break;
      }
      default: {
        const dict = searchParams.get('dict') ?? 'A-V';
        let dictionaryUrl = '/static/datasource/lacviet/lv-[en-vi].tsv';

        switch (dict) {
          case 'V-A': {
            dictionaryUrl = '/static/datasource/lacviet/lv-[vi-en].tsv';
            break;
          }
          case 'N-V': {
            dictionaryUrl = '/static/datasource/lacviet/lv-[ja-vi].tsv';
            break;
          }
          case 'V-N': {
            dictionaryUrl = '/static/datasource/lacviet/lv-[vi-ja].tsv';
            break;
          }
          case 'T-V': {
            dictionaryUrl = '/static/datasource/lacviet/lv-[zh-vi].tsv';
            break;
          }
          case 'V-T': {
            dictionaryUrl = '/static/datasource/lacviet/lv-[vi-zh].tsv';
            break;
          }
          // no default
        }

        $.ajax({
          async: false,
          method: 'GET',
          url: dictionaryUrl,
        }).done((data) => {
          const dataList = data.split('\n').map((element) => element.split('\t')).filter((element) => element.length === 2);
          const chars = [...define];
          const containsPhrase = [];

          for (let i = 0; i < chars.length; i += 1) {
            const foundPhrase = dataList.toSorted((b, c) => c[0].length - b[0].length).find(([first]) => chars.slice(i).join('').toLowerCase().startsWith(first.toLowerCase()));
            if (foundPhrase) containsPhrase.push(foundPhrase[0]);
          }

          dataList.filter(([first, second]) => containsPhrase.includes(first) || first.toLowerCase().startsWith(define) || first.toLowerCase().endsWith(define) || (define.length >= 2 && second.toLowerCase().includes(define))).sort((a, b) => containsPhrase.includes(b[0]) - containsPhrase.includes(b[0]) || b[0].toLowerCase().startsWith(define) - a[0].toLowerCase().startsWith(define) || b[0].toLowerCase().endsWith(define) - a[0].toLowerCase().endsWith(define)).forEach(([first, second]) => {
            sectionHeading.innerText = first;
            $(document.body).append(sectionHeading.cloneNode(true));

            second.split('\\n').forEach((element) => {
              paragraph.innerText = element;
              $(document.body).append(paragraph.cloneNode(true));
            });

            $(document.body).append(document.createElement('hr'));
          });
        });

        break;
      }
    }
  } else {
    paragraph.innerText = 'Vui lòng điền từ cần tra vào tham số "define" để tra từ';
    $(document.body).append(paragraph.cloneNode(true));
  }
});