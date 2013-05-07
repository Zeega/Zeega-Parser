/*

plugin/layer manifest file

this should be auto generated probably!!

*/

define([
    "zeega_parser/plugins/controls/position/position",
    "zeega_parser/plugins/controls/slider/slider",
    "zeega_parser/plugins/controls/resize/resize",
    "zeega_parser/plugins/controls/checkbox/checkbox",
    "zeega_parser/plugins/controls/color/color",
    "zeega_parser/plugins/controls/linkto/linkto",
    "zeega_parser/plugins/controls/linkimage/linkimage",
    "zeega_parser/plugins/controls/av/av"
],
function(
    Position,
    Slider,
    Resize,
    Checkbox,
    Color,
    LinkTo,
    LinkImage,
    AV
) {

    return _.extend(
        Position,
        Slider,
        Resize,
        Checkbox,
        Color,
        LinkTo,
        LinkImage,
        AV
    );
});
