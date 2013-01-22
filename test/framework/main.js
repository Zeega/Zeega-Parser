require([
  "zeega_parser/parser"
],

function( Parser ) {
  $.noConflict();

  window.ZeegaParser = Parser;
  window.parserReady = true;
  $(window).trigger("parser_ready");
});
