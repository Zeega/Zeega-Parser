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
    "zeega_parser/data-parsers/flickr"
],
function(
    zProjectModel,
    zProject,
    zProjectPublished,
    zProjectCollection,
    zCollection,
    flickr
) {
    // extend the plugin object with all the layers
    var Parsers = {};

    return _.extend(
        Parsers,
        zProjectModel,
        zProject,
        zProjectPublished,
        zProjectCollection,
        zCollection,
        flickr
    );
});
