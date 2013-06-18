/*

plugin/layer manifest file

this should be auto generated probably!!

*/

define([
    "engine/plugins/layers/image/image",
    "engine/plugins/layers/link/link",
    "engine/plugins/layers/audio/audio",
    "engine/plugins/layers/rectangle/rectangle",
    "engine/plugins/layers/text_v2/text",
    "engine/plugins/layers/end_page/endpage"
],
function(
    image,
    link,
    audio,
    rectangle,
    textV2,
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
        textV2,
        endpage
    );
});
