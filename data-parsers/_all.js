/*

parser manifest file

this should be auto generated probably!!

*/

define([
    "zeega_parser/data-parsers/zeega-project-model",
    "zeega_parser/data-parsers/zeega-project",
    "zeega_parser/data-parsers/zeega-project-published",
    "zeega_parser/data-parsers/zeega-project-collection",
    "zeega_parser/data-parsers/zeega-collection",
    "zeega_parser/data-parsers/flickr",
    "zeega_parser/data-parsers/youtube"
],
function(
    zProjectModel,
    zProject,
    zProjectPublished,
    zProjectCollection,
    zCollection,
    flickr,
    youtube
) {
    // extend the plugin object with all the layers
//    var Parsers = {};

    return [
        zProjectModel,
        zProject,
        zProjectPublished,
        zProjectCollection,
        zCollection,
        flickr,
        youtube
    ];
});
