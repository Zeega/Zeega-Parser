define([
    "app",
    "engine/modules/layer.model",
    "engine/modules/layer.visual.view"
],
function( app, LayerModel, Visual ) {

    var Layer = {};

    Layer.Rectangle = LayerModel.extend({
        // TODO: is the redundant naming necessary? If this program knows
        // this is a Layer, wouldn't "type" be sufficient?
        layerType: "Rectangle",

        attr: {
            backgroundColor: "#FFFFFF",
            citation: false,
            // height: 100,
            // left: 0,
            linkable: false,
            opacity: 0.75,
            title: "Color Layer",
            // top: 0,
            // width: 100,
            dissolve: true,

            height: 112.67,
            width: 236.72,
            top: -6.57277,
            left: -68.4375,

            page_background: true
        },

        pageBackgroundPositioning: {
            height: 112.67,
            width: 236.72,
            top: -6.57277,
            left: -68.4375
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
            },{
                type: "checkbox",
                options: {
                    title: "fullscreen",
                    save: false,
                    propertyName: "page_background",
                    triggerEvent: "toggle_page_background"
                }
            }
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
        },

        afterEditorRender: function() {

            if ( this.model.getAttr("page_background")) {
                this.makePageBackground();
                this.disableDrag();
            }

            this.stopListening( this.model );
            this.model.on("toggle_page_background", this.togglePageBackgroundState, this );
        },

        beforePlayerRender: function() {
            // update the rectangle style
            var style = {
                "background-color": this.getAttr("backgroundColor"),
                "height": this.getAttr("height") + "%",
                "opacity": this.getAttr("opacity")
            };

            this.$el.css( style );
        },

        disableDrag: function() {
            this.model.trigger("control_drag_disable");
            this.$el.bind("mousedown.rectangleDrag", function() {
                this.fitToWorkspace();
            }.bind( this ));
        },

        togglePageBackgroundState: function( state ) {
            if ( state.page_background ) {
                this.disableDrag();
                this.makePageBackground();
            } else {
                this.fitToWorkspace();
            }
        },

        makePageBackground: function() {
            _.each( this.model.pageBackgroundPositioning, function( val, key ) {
                this.$el.css( key, val +"%" );
            }, this );
            this.model.saveAttr( this.model.pageBackgroundPositioning );
        },

        fitToWorkspace: function() {
            var width = 100,
                height = 100,
                top = 0,
                left = 0;

            this.$el.unbind("mousedown.rectangleDrag");
            this.model.trigger("control_drag_enable");

            this.$el.css({
                height: height + "%",
                width: width + "%",
                top: top + "%",
                left: left + "%"
            });
            this.model.saveAttr({
                page_background: false,
                height: height,
                width: width,
                top: top,
                left: left
            });
        }

  });

  return Layer;
});
