require([
  "zeega_parser/parser"
],

function( Parser ) {
  $.noConflict();
  window.Parsed =  new Parser( window.projectJSON );
  console.log("parsed:", window.Parsed );
  $(window).trigger("parsed")
});
