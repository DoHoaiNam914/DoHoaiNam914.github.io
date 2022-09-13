DoHoaiNamReaderApp = {};

DoHoaiNamReaderApp.setModuleContainerHeight = function () {
  $("#reader").css("width", $(window).innerWidth() + "px");
  $("#reader").css("height", $(window).innerHeight() * 0.87 - 45 + "px");
};

DoHoaiNamReaderApp.parseXMLFromDOM = function (data) {
  var serializer = new XMLSerializer();
  var packageDocumentXML = serializer.serializeToString(data);
  return packageDocumentXML;
};

DoHoaiNamReaderApp.loadAndRenderEpub = function (packageDocumentURL, viewerPreferences) {
  var that = this;

  DoHoaiNamReaderApp.epubViewer = undefined;

  $.ajax({
    url: packageDocumentURL,
    success: function (result) {
      var elementToBindReaderTo = $("#reader")[0];
      $(elementToBindReaderTo).html("");

      if (result.nodeType) {
        result = DoHoaiNamReaderApp.parseXMLFromDOM(result);
      }

      var packageDocumentXML = result;

      DoHoaiNamReaderApp.epubViewer = SimpleReadiumJs(elementToBindReaderTo, viewerPreferences, packageDocumentURL, packageDocumentXML, "lazy");

      DoHoaiNamReaderApp.applyToolbarHandlers();

      DoHoaiNamReaderApp.setModuleContainerHeight();
      DoHoaiNamReaderApp.epubViewer.on("epubLoaded", function () {
        DoHoaiNamReaderApp.epubViewer.showSpineItem(0, function () { });

        if (DoHoaiNamReaderApp.isSmartPhone()) {
          DoHoaiNamReaderApp.epubViewer.setSyntheticLayout(false);
        }

        $(window).on("resize", function () {
          DoHoaiNamReaderApp.setModuleContainerHeight();
          DoHoaiNamReaderApp.epubViewer.resizeContent();
        });
      }, that);

      DoHoaiNamReaderApp.epubViewer.render();
    }
  });
};

DoHoaiNamReaderApp.isSmartPhone = function () {
  return navigator.userAgent.search(/\Wiphone\W|\Wipod\W|\Wandroid\W.+\Wmobile\W/i) >= 0;
};