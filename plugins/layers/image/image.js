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
            width: 100,
            opacity: 1,
            aspectRatio: null
        },

        controls: [
            "position",
            {
                type: "resize",
                options: { aspectRatio: true }
            },
            "rotate",
            {
                type: "checkbox",
                options: {
                    title: "fade in",
                    propertyName: "dissolve"
                }
            },
            { type: "slider",
                options: {
                    title: "<i class='icon-eye-open icon-white'></i>",
                    propertyName: "opacity",
                    min: 0,
                    max: 1,
                    step: 0.001,
                    css: true
                }
            },
        ]

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

        afterEditorRender: function() {
            // add height attribute if not already there
            // this may break if the aspect ratio changes
            if ( _.isNull( this.getAttr("aspectRatio") ) ) {
                var $img = $("<img>").attr("src", this.getAttr("uri") ).css({
                    position: "absolute",
                    top: "-1000%",
                    left: "-1000%"
                });

                $img.imagesLoaded();
                $img.done(function() {
                    var pxHeight, pxWidth, height;

                    pxWidth = ( this.getAttr("width") / 100 ) * this.$workspace.width();
                    pxHeight = pxWidth * $img.height() / $img.width();
                    height = pxHeight / this.$workspace.height() * 100;

                    $img.remove();
                    this.update({
                        aspectRatio: $img.width()/ $img.height(),
                        height: height
                    });
                    this.$el.css("height", height + "%" );
                }.bind( this ));
                $("body").append( $img );
            }

        },

        verifyReady: function() {
            var img = Zeega.$( this.$("img") ).imagesLoaded();

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
