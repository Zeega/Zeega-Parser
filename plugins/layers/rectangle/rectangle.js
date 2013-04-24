define([
    "app",
    "zeega_parser/modules/layer.model",
    "zeega_parser/modules/layer.visual.view"
],
function( app, LayerModel, Visual ) {

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
            width: 100,
            dissolve: true
        },

        controls: [
            "position",
            "resize",
            "rotate",
            { type: "slider",
                options: {
                    title: "opacity",
                    propertyName: "opacity",
                    min: 0,
                    max: 1,
                    step: 0.001,
                    css: true
                }
            },
            { type: "color",
                options: {
                    title: "color",
                    propertyName: "backgroundColor"
                }
            }
        ]

    });

    Layer.Rectangle.Visual = Visual.extend({

        template: "rectangle",

        visualProperties: [
            "backgroundColor",
            "height",
            "width",
            "opacity"
        ],

        serialize: function() {
            return this.model.toJSON();
        },

        beforePlayerRender: function() {
            // update the rectangle style
            var style = {
                "background-color": this.getAttr("backgroundColor"),
                "height": this.getAttr("height") + "%",
                "opacity": this.getAttr("opacity")
            };

            this.$el.css( style );
        }

  });

  return Layer;
});
