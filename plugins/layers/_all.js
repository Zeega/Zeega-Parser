/*

plugin/layer manifest file

this should be auto generated probably!!

*/

define([
    "zeega_parser/plugins/layers/image/image",
    "zeega_parser/plugins/layers/link/link",
    "zeega_parser/plugins/layers/slideshow/slideshow",
    "zeega_parser/plugins/layers/audio/audio",
    "zeega_parser/plugins/layers/rectangle/rectangle",
    "zeega_parser/plugins/layers/text/text",
    "zeega_parser/plugins/layers/text_v2/textV2"
],
function(
    image,
    link,
    slideshow,
    audio,
    rectangle,
    text,
    textV2
) {
    var Plugins = {};
    // extend the plugin object with all the layers
    return _.extend(
        Plugins,
        image,
        link,
        slideshow,
        audio,
        rectangle,
        text,
        textV2
    );
});
