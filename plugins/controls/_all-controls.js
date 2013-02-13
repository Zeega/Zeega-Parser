/*

plugin/layer manifest file

this should be auto generated probably!!

*/

define([
    "zeega_parser/plugins/controls/position/position",
    "zeega_parser/plugins/controls/opacity/opacity",
    "zeega_parser/plugins/controls/resize/resize"
],
function(
    Position,
    Opacity,
    Resize
) {

    return _.extend(
        Position,
        Opacity,
        Resize
    );
});
