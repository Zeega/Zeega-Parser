/*

plugin/layer manifest file

this should be auto generated probably!!

*/

define([
    "zeega_parser/plugins/layers/image/image",
    "zeega_parser/plugins/layers/link/link",
    "zeega_parser/plugins/layers/audio/audio",
    "zeega_parser/plugins/layers/rectangle/rectangle",
    "zeega_parser/plugins/layers/text/text",
    "zeega_parser/plugins/layers/text_v2/text",
    "zeega_parser/plugins/layers/youtube/youtube",
    "zeega_parser/plugins/layers/end_page/endpage"
],
function(
    image,
    link,
    audio,
    rectangle,
    text,
    textV2,
    youtube,
    endpage
) {
    var Plugins = {};
    // extend the plugin object with all the layers
    return _.extend(
        Plugins,
        image,
        link,
        audio,
        rectangle,
        text,
        textV2,
        youtube,
        endpage
    );
});
