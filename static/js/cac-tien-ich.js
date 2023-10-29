'use strict';

class Utils {
  static CORS_PROXY = 'https://corsproxy.itsdhnam.workers.dev/';

  static convertTextToHtml(text) {
    const paragraph = document.createElement('p');
    paragraph.innerText = text;
    return paragraph.innerHTML.replace(/<br>/g, '\n');
  }

  static convertHtmlToText(html) {
    const paragraph = document.createElement('p');
    paragraph.innerHTML = html;
    return paragraph.innerText;
  }
}