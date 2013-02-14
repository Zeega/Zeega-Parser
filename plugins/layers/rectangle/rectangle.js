define([
    "app",
    "zeega_parser/modules/layer.model",
    "zeega_parser/modules/layer.visual.view"
],
function( Zeega, LayerModel, Visual ) {

    var Layer = {};

    Layer.Rectangle = LayerModel.extend({
        // TODO: is the redundant naming necessary? If this program knows
        // this is a Layer, wouldn't "type" be sufficient?
        layerType: "Rectangle",

        attr: {
            backgroundColor: "#FF00FF",
            citation: false,
            height: 100,
            left: 0,
            linkable: false,
            opacity: 0.75,
            title: "Color Layer",
            top: 0,
            width: 100
        },

        controls: [
            "position",
            "resize",
            "rotate",
            "opacity"
        ]

    });

    Layer.Rectangle.Visual = Visual.extend({

        template: "rectangle/rectangle",

        visualProperties: [
            "backgroundColor",
            "height",
            "width",
            "opacity"
        ],

        serialize: function() {
            return this.model.toJSON();
        }

  });

  return Layer;
});
