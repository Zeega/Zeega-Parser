define([
    "app",
    "engine/modules/layer.model",
    "engine/modules/layer.visual.view",
    "engine/modules/askers/asker",

    //plugins
    "engineVendor/jquery.imagesloaded.min"
],

function( app, Layer, Visual, Asker ){

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
                    title: "opacity",
                    propertyName: "opacity",
                    min: 0,
                    max: 1,
                    step: 0.001,
                    css: true
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

            if ( this.model.getAttr("page_background")) {
                this.visualProperties = ["opacity"];
            }

            this.stopListening( this.model );
            this.model.off("toggle_page_background");
            this.model.on("toggle_page_background", this.togglePageBackgroundState, this );
            
            this.model.off("resized");
            this.model.on("resized", this.onResize, this );
        },

        afterEditorRender: function() {
            // add height attribute if not already there
            // this may break if the aspect ratio changes
            if ( _.isNull( this.getAttr("aspectRatio") ) ) {
                this.determineAspectRatio();
            }

            if ( this.model.getAttr("page_background")) {
                this.makePageBackground();
                this.disableDrag();
            }
        },

        onResize: function( attr ) {
            /*
            if ( attr.width > 100 || attr.height > 100 ) {
                new Asker({
                    question: "Make this layer fullscreen?",
                    okay: function() {
                        this.disableDrag();
                        this.makePageBackground();
                    }.bind( this )
                });
            }
            */
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

        disableDrag: function() {
            this.model.trigger("control_drag_disable");
            this.$el.bind("mousedown.imageDrag", function() {

                new Asker({
                    question: "Make this layer positionable?",
                    okay: function() {
                        this.fitToWorkspace();
                    }.bind( this )
                });

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
