'use strict';

/* global oldAccentObject, Utils */

$(document).ready(async () => {
  const searchParams = new URLSearchParams(window.location.search);
  let paragraph = document.createElement('p');

  const dictionary = searchParams.get('dictionary') ?? 'lac-viet';
  let define = (searchParams.get('define') ?? '').trim().replaceAll(/^\s+|\s+$/g, '').toLowerCase();
  const sectionHeading = document.createElement('h1');

  if (define.length > 0) {
    sectionHeading.innerText = `Từ khoá: ${define}`;
    $(document.body).append(sectionHeading.cloneNode(true));
    $(document.body).append(document.createElement('hr'));
    const pm = new window.DTM_ExactMatcher();

    switch (dictionary) {
      case 'thieuchuu': {
        await $.ajax({
          cache: false,
          method: 'GET',
          url: '/static/datasource/cjkvmap.txt',
        }).done((data) => {
          const dataList = data.split(/\r?\n|\r/).map((element) => element.split('|')).filter((element) => element.length === 3);
          const searchResults = dataList.map(([first]) => first).filter((element) => pm.search(element, define).length > 0 || pm.search(element, define.replaceAll(new RegExp(`${Utils.getTrieRegexPatternFromWords(Object.keys(oldAccentObject)).source}(?= |$)`, 'g'), (match) => oldAccentObject[match] ?? match)).length > 0);

          dataList.filter(([first]) => searchResults.includes(first.toLowerCase())).forEach(([first, second, third]) => {
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
        define = define.replaceAll(new RegExp(`${Utils.getTrieRegexPatternFromWords(Object.keys(oldAccentObject)).source}(?= |$)`, 'g'), (match) => oldAccentObject[match] ?? match);

        await $.ajax({
          cache: false,
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
          case 'V-V': {
            dictionaryUrl = '/static/datasource/lacviet/lv-[vi-vi].tsv';
            break;
          }
          // no default
        }

        await $.ajax({
          cache: false,
          method: 'GET',
          url: dictionaryUrl,
        }).done((data) => {
          const dataList = data.split('\n').filter((element) => !element.startsWith('##')).map((element) => element.split('\t')).filter((element) => element.length === 2);
          const searchResults = dataList.map(([first]) => first).filter((element) => pm.search(element, define).length > 0);

          dataList.filter(([first]) => searchResults.includes(first)).forEach(([first, second]) => {
            sectionHeading.innerText = first;
            $(document.body).append(sectionHeading.cloneNode(true));

            second.replaceAll(/(<\/d-[^>]+>)(<d-[^>]+>)/g, '$1\n$2').split('\n').forEach((element) => {
              paragraph.innerHTML = `${!element.startsWith('<') ? '<' : ''}${element}${!element.endsWith('>') ? '>' : ''}`;
              $(document.body).append(paragraph.cloneNode(true));
            });

            $(document.body).append(document.createElement('hr'));
          });
          $(document.body).find('a[href]').each((__, element) => {
            $(element).attr('href', `/dich-nhanh/tra-tu-dien.html?dictionary=lac-viet&dict=V-V&define=${$(element).attr('href')}`);
          });
        });

        break;
      }
    }
  } else {
    paragraph.innerText = 'Cách dùng: ?dictionary=lac-viet&dict=T-V&define=hello';
    $(document.body).append(paragraph.cloneNode(true));
    paragraph.innerText = '?dictionary = { Từ điển Lạc Việt: lac-viet, Hán Việt tự điển: thieuchuu, Hán Việt Từ Điển Trích Dẫn: td }';
    $(document.body).append(paragraph.cloneNode(true));
    paragraph.innerText = '?dictionary=lac-viet&dict = { Anh - Việt: A-V, Việt - Anh: V-A, Nhật - Việt: N-V, Việt - Nhật: V-N, Trung - Việt: T-V, Việt - Trung: V-T }';
    $(document.body).append(paragraph.cloneNode(true));
    paragraph.innerText = 'Vui lòng điền từ cần tra vào tham số "define" trên thanh địa chỉ để tra từ.';
    $(document.body).append(paragraph.cloneNode(true));
  }
});