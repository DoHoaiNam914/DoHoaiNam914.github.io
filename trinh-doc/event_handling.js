DoHoaiNamReaderApp.applyToolbarHandlers = function () {
  $("#prevPageBtn").off("click");
  $("#prevPageBtn").on("click", function () {
    DoHoaiNamReaderApp.epubViewer.previousPage(function () { });
  });

  $("#nextPageBtn").off("click");
  $("#nextPageBtn").on("click", function () {
    DoHoaiNamReaderApp.epubViewer.nextPage(function () { });
  });
};

DoHoaiNamReaderApp.epubLinkClicked = function (e) {
  var href;
  var splitHref;
  var spineIndex;
  e.preventDefault();

  if (e.currentTarget.attributes["xlink:href"]) {
    href = e.currentTarget.attributes["xlink:href"].value;
  } else {
    href = e.currentTarget.attributes["href"].value;
  }

  if (href.match("epubcfi")) {
    href = href.trim();
    splitHref = href.split("#");

    DoHoaiNamReaderApp.epubViewer.showPageByCFI(splitHref[1], function () { }, this);        
  } else {
    href = href.trim();
    splitHref = href.split("#");

    spineIndex = DoHoaiNamReaderApp.epub.getSpineIndexByHref(href);

    if (splitHref[1] === undefined) {      
      DoHoaiNamReaderApp.epubViewer.showSpineItem(spineIndex, function () { });
    }
    else {
      DoHoaiNamReaderApp.epubViewer.showPageByElementId(spineIndex, splitHref[1], function () { });
    }
  }
};

DoHoaiNamReaderApp.resizeContent = function () {
  DoHoaiNamReaderApp.epubViewer.resizeContent();
};

DoHoaiNamReaderApp.toggleLayout = function () {
  if (DoHoaiNamReaderApp.viewerPreferences.syntheticLayout) {
    DoHoaiNamReaderApp.epubViewer.setSyntheticLayout(false);
    DoHoaiNamReaderApp.viewerPreferences.syntheticLayout = false;
  } else {
    DoHoaiNamReaderApp.epubViewer.setSyntheticLayout(true);
    DoHoaiNamReaderApp.viewerPreferences.syntheticLayout = true;
  }
};