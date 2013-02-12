define([
    "app",
    "zeega_parser/modules/layer.model",
    "zeega_parser/modules/layer.visual.view",
    //plugins
    "plugins/jquery.imagesloaded.min"
],

function( Zeega, _Layer, Visual ){

    var Layer = Zeega.module();

    Layer.Image = _Layer.extend({

        layerType: "Image",

        attr: {
            title: "Image Layer",
            url: "none",
            left: 0,
            top: 0,
            height: 100,
            width: 100,
            opacity: 1,
            aspect: 1.33
        },

        editorProperties: {
            draggable: true //default
        }

    });

    Layer.Image.Visual = Visual.extend({

        template: "image/image",

        visualProperties: [
            "height",
            "width",
            "opacity"
        ],

        serialize: function() {
            return this.model.toJSON();
        },

        verifyReady: function() {
            var img = Zeega.$( this.$el ).imagesLoaded();

            img.done(function() {
                this.model.trigger( "visual_ready", this.model.id );
            }.bind(this));

            img.fail(function() {
                this.model.trigger( "visual_error", this.model.id );
            }.bind(this));
        }
    });

    return Layer;
});
