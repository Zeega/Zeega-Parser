/*

parser manifest file

this should be auto generated probably!!

*/

define([
    "engine/data-parsers/zeega-project-model",
    "engine/data-parsers/zeega-project",
    "engine/data-parsers/zeega-project-published",
    "engine/data-parsers/zeega-project-collection",
    "engine/data-parsers/zeega-collection",
    "engine/data-parsers/flickr"
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
