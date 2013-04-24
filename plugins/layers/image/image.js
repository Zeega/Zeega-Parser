define([
    "app",
    "zeega_parser/modules/layer.model",
    "zeega_parser/modules/layer.visual.view",
    //plugins
    "plugins/jquery.imagesloaded.min"
],

function( app, Layer, Visual ){

    var L = {};

    L.Image = Layer.extend({

        layerType: "Image",

        attr: {
            title: "Image Layer",
            url: "none",
            left: 0,
            top: 0,
            width: null,
            opacity: 1,
            aspectRatio: null,
            dissolve: true
        },

        controls: [
            "position",
            {
                type: "resize",
                options: { aspectRatio: true }
            },
            "rotate",
            { type: "slider",
                options: {
                    title: "<i class='icon-eye-open icon-white'></i>",
                    propertyName: "opacity",
                    min: 0,
                    max: 1,
                    step: 0.001,
                    css: true
                }
            }
        ]

    });

    L.Image.Visual = Visual.extend({

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
                    var width, height, top, left, imgRatio, workspaceRatio;

                    imgRatio = $img.width()/ $img.height();
                    workspaceRatio = this.$workspace.width() / this.$workspace.height();

                    if ( imgRatio > workspaceRatio ) {
                        width = this.$workspace.width();
                        height = width / imgRatio;
                    } else {
                        height = this.$workspace.height();
                        width = height * imgRatio;
                    }

                    width = width / this.$workspace.width() * 100;
                    height = height / this.$workspace.height() * 100;
                    top = (100 - height) / 2;
                    left = (100 - width) / 2;


                    $img.remove();

                    this.model.saveAttr({
                        aspectRatio: imgRatio,
                        height: height,
                        width: width,
                        top: top,
                        left: left
                    });

                    this.$el.css({
                        height: height + "%",
                        width: width + "%",
                        top: top + "%",
                        left: left + "%"
                    });
                }.bind( this ));
                $("body").append( $img );
            }

        },

        verifyReady: function() {
            var img = app.$( this.$("img") ).imagesLoaded();

            img.done(function() {
                this.model.trigger( "visual_ready", this.model.id );
            }.bind(this));

            img.fail(function() {
                this.model.trigger( "visual_error", this.model.id );
            }.bind(this));
        }
    });

    return L;
});
