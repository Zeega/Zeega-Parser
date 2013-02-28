/*

plugin/layer manifest file

this should be auto generated probably!!

*/

define([
    "zeega_parser/plugins/controls/position/position",
    "zeega_parser/plugins/controls/opacity/opacity",
    "zeega_parser/plugins/controls/resize/resize",
    "zeega_parser/plugins/controls/dissolve/dissolve",
    "zeega_parser/plugins/controls/color/color",
    "zeega_parser/plugins/controls/linkto/linkto"
],
function(
    Position,
    Opacity,
    Resize,
    Dissolve,
    Color,
    LinkTo
) {

    return _.extend(
        Position,
        Opacity,
        Resize,
        Dissolve,
        Color,
        LinkTo
    );
});
