'use strict';

/* global oldAccentObject, Utils */

$(document).ready(async () => {
  const searchParams = new URLSearchParams(window.location.search);
  let paragraph = document.createElement('p');

  const dictionary = searchParams.get('dictionary') ?? 'lac-viet';
  const define = (searchParams.get('define') ?? '').trim().replaceAll(/^\s+|\s+$/g, '').toLowerCase();
  const sectionHeading = document.createElement('h1');

  if (define.length > 0) {
    sectionHeading.innerText = `Từ khoá: ${define}`;
    $(document.body).append(sectionHeading.cloneNode(true));
    $(document.body).append(document.createElement('hr'));
    const statusParagraph = document.createElement('p');
    statusParagraph.innerText = 'Đang tải...';
    $(document.body).append(statusParagraph);
    const oldAccentDefine = define.replaceAll(new RegExp(`${Utils.getTrieRegexPatternFromWords(Object.keys(oldAccentObject)).source}(?= |$)`, 'g'), (match) => oldAccentObject[match] ?? match);
    const pm = new window.DTM_ExactMatcher();

    switch (dictionary) {
      case 'thieuchuu': {
        await $.ajax({
          method: 'GET',
          url: '/static/datasource/cjkvmap.txt',
        }).done((data) => {
          const dataList = data.split(/\r?\n|\r/).map((element) => element.split('|')).filter((element) => element.length === 3);
          const searchResults = dataList.filter(([first, second]) => [define, oldAccentDefine].some((element) => pm.search(second.split('/')[0], element).length > 0 || pm.search(element, first).length > 0 || first.startsWith(element))).map(([first]) => first);

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
        [define, oldAccentDefine].forEach((a) => {
          $.ajax({
            async: false,
            cache: false,
            method: 'GET',
            url: `${Utils.CORS_PROXY}http://nguyendu.com.free.fr/hanviet/ajax.php?query=${encodeURIComponent(a)}&methode=normal`,
          }).done((b) => {
            b.split('|').map((c) => c.split(':')).filter((c) => c.length === 3).forEach(async ([first, second]) => {
              $.ajax({
                async: false,
                cache: false,
                method: 'GET',
                url: `${Utils.CORS_PROXY}http://nguyendu.com.free.fr/hanviet/hv_tim${first === 'Word' ? 'tukep_ndv.php?wordid' : 'chu_ndv.php?unichar'}=${second}`,
              }).done((d) => {
                $(document.body).append($(d)[first === 'Word' ? 19 : 31].innerHTML.replaceAll(/(href|src)="/g, '$&http://nguyendu.com.free.fr/hanviet/').replaceAll(`
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
            dictionaryUrl = 'https://media.githubusercontent.com/media/DoHoaiNam914/DoHoaiNam914.github.io/main/static/datasource/lacviet/lv-%5Bja-vi%5D.tsv';
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
          method: 'GET',
          url: dictionaryUrl,
        }).done((data) => {
          const dataList = data.split('\n').filter((element) => !element.startsWith('##')).map((element) => element.split('\t')).filter((element) => element.length === 2);
          const searchResults = dataList.filter(([first, second]) => [define, oldAccentDefine].some((a) => (['N-V', 'T-V'].some((b) => dict === b) ? (pm.search(a, first).length > 0 || dict !== 'N-V' || second.replaceAll('<span class="east">', '').replaceAll('</span>', '').replaceAll('<b>', '').replaceAll('</b>', '').match(/【([^】]+)】/).some((c) => pm.search(a, c))) || (first.startsWith(a) || dict !== 'N-V' || second.replaceAll('<span class="east">', '').replaceAll('</span>', '').replaceAll('<b>', '').replaceAll('</b>', '').match(/【([^】]+)】/).some((c) => c.startsWith(a))) : first.startsWith(a) || pm.search(first, `${a} `).length > 0 || pm.search(first, ` ${a}`).length > 0))).map(([first]) => first);

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

    statusParagraph.remove();
    [define, oldAccentDefine].some((element) => $(`h1:contains('${element}')`)[0].scrollIntoView());
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