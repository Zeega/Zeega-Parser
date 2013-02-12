define([
    "app",
    "zeega_parser/modules/layer.model",
    "zeega_parser/modules/layer.visual.view"
],
function( Zeega, LayerModel, Visual ) {

    var Layer = Zeega.module();

    Layer.Rectangle = LayerModel.extend({
        // TODO: is the redundant naming necessary? If this program knows
        // this is a Layer, wouldn't "type" be sufficient?
        layerType: "Rectangle",

        attr: {
            citation: false,
            default_controls: false,
            height: 50,
            left: 25,
            linkable: false,
            opacity: 1,
            opacity_hover: 1,
            title: "Rectangle Layer",
            top: 25,
            width: 50
        },

        controls: ["position", "resize", "rotate", "opacity"]

    });

    Layer.Rectangle.Visual = Visual.extend({

        template: "rectangle/rectangle",

        visualProperties: [
            "backgroundColor",
            "height",
            "width",
            "opacity"
        ],

        // TODO: This doesn"t produce a "serialization", perhaps rename
        // to something more appropriate?
        serialize: function() {
            return this.model.toJSON();
        }

  });

  return Layer;
});
