/*

plugin/layer manifest file

this should be auto generated probably!!

*/

define([
    "engine/plugins/controls/position/position",
    "engine/plugins/controls/slider/slider",
    "engine/plugins/controls/resize/resize",
    "engine/plugins/controls/checkbox/checkbox",
    "engine/plugins/controls/color/color",
    "engine/plugins/controls/linkto/linkto",
    "engine/plugins/controls/linkimage/linkimage",
    "engine/plugins/controls/av/av",
    "engine/plugins/controls/dropdown/dropdown"
],
function(
    Position,
    Slider,
    Resize,
    Checkbox,
    Color,
    LinkTo,
    LinkImage,
    AV,
    Dropdown
) {

    return _.extend(
        Position,
        Slider,
        Resize,
        Checkbox,
        Color,
        LinkTo,
        LinkImage,
        AV,
        Dropdown
    );
});
