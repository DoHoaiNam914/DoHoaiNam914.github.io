'use strict';

function bookLibraryLoader() {
  $.getJSON('./library.json', function (data) {
    if (data.library.length > 0) {
      $(".row").html(null);

      _.each(data.library, function (book) {
        $(".row").append(`
<div class="col">
  <div class="card shadow-sm">
    <img src="${book.cover}" class="card-img-top">
    <div class="card-body">
      <a class="h5 card-title" href="?thu-vien=${book.id}">${book.title}</a>
      <p class="card-text">${book.description.split(/\n/).join('</p>\n      <p class="card-text">')}</p>
    </div>
  </div>
</div>
`);
      });
    }
  }).fail(function (jqXHR, textStatus, errorThrown) {
    throw new Error(textStatus);
  });
}

function volumeLibraryLoader() {
  const book = (new URLSearchParams(window.location.search)).get('thu-vien');

  $.getJSON(`./${book}/data.json`, function (data) {
    if (data[book].length > 0) {
      $(".row").html(null);

      _.each(data[book], function (volume) {
        $(".row").append(`
<div class="col">
  <div class="card shadow-sm">
    <img src="${volume.cover}" class="card-img-top">
    <div class="card-body">
      <a class="h5 card-title" href="${volume.spine.length > 0 ?
          `./trinh-xem.html?sach=${book}&tap=${volume.id}` :
          volume.href}">${volume.title}</a>
      <p class="card-text">${book.description.split(/\n/).join('</p>\n      <p class="card-text">')}</p>
    </div>
  </div>
</div>
`);
      });
    }
  }).fail(function (jqXHR, textStatus, errorThrown) {
    throw new Error(textStatus);
  });
}