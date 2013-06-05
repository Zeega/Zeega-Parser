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
            page_background: true,
            aspectRatio: null,
            dissolve: true
        },

        pageBackgroundPositioning: {
            height: 112.67,
            width: 236.72,
            top: -6.57277,
            left: -68.4375
        },

        controls: [
            "position",
            {
                type: "resize",
                options: { aspectRatio: true }
            },
            "rotate",
            {
                type: "slider",
                options: {
                    title: "<i class='icon-eye-open icon-white'></i>",
                    propertyName: "opacity",
                    min: 0,
                    max: 1,
                    step: 0.001,
                    css: true
                }
            },{
                type: "checkbox",
                options: {
                    title: "<i class='icon-resize-full icon-white'></i>",
                    propertyName: "page_background",
                    triggerEvent: "toggle_page_background"
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

        init: function() {
            window.JST["app/zeega-parser/plugins/layers/image/image.html"] = null;

            if ( this.model.getAttr("page_background")) {
                this.visualProperties = ["opacity"];
            }

            this.model.on("toggle_page_background", this.togglePageBackgroundState, this );
        },

        afterEditorRender: function() {
            // add height attribute if not already there
            // this may break if the aspect ratio changes
            if ( _.isNull( this.getAttr("aspectRatio") ) ) {
                this.determineAspectRatio();
            }

            if ( this.model.getAttr("page_background")) {
                this.makePageBackground();
            }
        },

        determineAspectRatio: function() {
            var $img = $("<img>").attr("src", this.getAttr("uri") ).css({
                position: "absolute",
                top: "-1000%",
                left: "-1000%"
            });

            $img.imagesLoaded();
            $img.done(function() {
                var width, height, top, left, imgRatio, workspaceRatio;

                this.model.saveAttr({
                    aspectRatio: $img.width()/ $img.height()
                });

                $img.remove();
            }.bind( this ));
            $("body").append( $img );
        },

        visualAfterRender: function() {
            if ( this.model.getAttr("page_background")) {
                this.disableDrag();
            }
        },

        disableDrag: function() {
            this.model.trigger("control_drag_disable");
            this.$el.bind("mousedown.imageDrag", function() {
                if ( confirm("make layer positionable?") ) {
                    this.fitToWorkspace();
                }
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
            var workspaceRatio, width, height, top, left;

            this.$el.unbind("mousedown.imageDrag");
            this.model.trigger("control_drag_enable");

            workspaceRatio = this.$workspace().width() / this.$workspace().height();

            if ( this.getAttr("aspectRatio") > workspaceRatio ) {
                width = this.$workspace().width();
                height = width / this.getAttr("aspectRatio");
            } else {
                height = this.$workspace().height();
                width = height * this.getAttr("aspectRatio");
            }

            width = width / this.$workspace().width() * 100;
            height = height / this.$workspace().height() * 100;
            top = (100 - height) / 2;
            left = (100 - width) / 2;

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
