/*

plugin/layer manifest file

this should be auto generated probably!!

*/

define([
    "zeega_parser/plugins/controls/position/position",
    "zeega_parser/plugins/controls/opacity/opacity"
],
function(
    Position,
    Opacity
) {

    return _.extend(
        Position,
        Opacity
    );
});
