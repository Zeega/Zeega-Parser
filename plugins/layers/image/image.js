define([
    "app",
    "engine/modules/layer.model",
    "engine/modules/layer.visual.view",

    //plugins
    "engineVendor/jquery.imagesloaded.min"
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
            return _.extend({ css: this.getAnimationCss() }, this.model.toJSON());
        },

        isAnimated: function(){

            if(!_.isNull(this.model.getAttr("zga_uri")) && !_.isUndefined(this.model.getAttr("zga_uri"))){
                return true;
            } else {
                return false;
            }
        },

        init: function() {
            var attr = this.model.get("attr");
            
            if( this.isAnimated() ){
                this.template = "image/zga";
                attr.uri = attr.zga_uri;
                this.model.set( { attr: attr } );
            }

            if ( this.model.getAttr("page_background")) {
                this.model.setAttr( this.model.pageBackgroundPositioning );
                this.visualProperties = ["opacity"];
            }
        },

        visualAfterRender: function(){
            if( this.isAnimated() ) {
                this.initAnimation();
            }
        },

        afterEditorRender: function() {

            if( !this.isAnimated() ){
                this.aspectRatio = this.getAttr("aspectRatio");
            }

            if ( _.isNull( this.getAttr("aspectRatio") ) ) {
                this.determineAspectRatio();
            } else if ( this.model.getAttr("page_background")) {
                this.makePageBackground();
                this.disableDrag();
            }

            this.stopListening( this.model );
            this.model.on("toggle_page_background", this.togglePageBackgroundState, this );
            this.model.on("resized", this.onResize, this );
        },

        onPlay: function() {
            if ( this.model.getAttr("page_background")) {
                this.makePageBackground();
            }
        },

        onResize: function( attr ) {},

        determineAspectRatio: function() {
            var $img = $("<img>")
                .attr("src", this.getAttr("uri") )
                .css({
                    position: "absolute",
                    top: "-1000%",
                    left: "-1000%"
                });

            $img.imagesLoaded();

            if( this.isAnimated() ){
                this.model.saveAttr({
                    aspectRatio: this.aspectRatio
                });
            } else {

                $img.done(function() {
                    var width, height, top, left, imgRatio, workspaceRatio;

                    this.model.saveAttr({
                        aspectRatio: $img.width()/ $img.height()
                    });
                    this.aspectRatio = $img.width()/ $img.height();

                    $img.remove();

                    if ( this.model.getAttr("page_background")) {
                        this.makePageBackground();
                        this.disableDrag();
                    }
                }.bind( this ));
            }
            $("body").append( $img );
        },

        disableDrag: function() {
            this.model.trigger("control_drag_disable");
            this.$el.bind("mousedown.imageDrag", function() {
                if ( this.getAttr("aspectRatio") ) {
                    this.fitToWorkspace();
                    app.emit("toggle_page_background", { type:"image", state: "fit-to-page", action: "drag" });
                }
            }.bind( this ));
        },

        togglePageBackgroundState: function( state ) {

            if ( state.page_background ) {
                this.disableDrag();
                this.makePageBackground();
                app.emit("toggle_page_background", { type:"image", state: "background", action: "toggle-button" });
            } else {
                this.fitToWorkspace();
                app.emit("toggle_page_background", { type:"image", state: "fit-to-page", action: "toggle-button" });
            }
        },

        makePageBackground: function() {
            var vals;

            if ( !this.isAnimated() ) {
                vals = _.extend({}, this.model.pageBackgroundPositioning );
                
                _.each( vals, function( val, key ) {
                    this.$el.css( key, val +"%" );
                }, this );

                
            } else {
                var fullscreenRatio = this.model.pageBackgroundPositioning.width / this.model.pageBackgroundPositioning.height;

                if ( this.aspectRatio >= fullscreenRatio ) {
                    // wider
                    newBGPos = {
                        height: this.model.pageBackgroundPositioning.height,
                        width: this.aspectRatio * this.model.pageBackgroundPositioning.height,
                        top: this.model.pageBackgroundPositioning.top,
                        left: -((this.aspectRatio * this.model.pageBackgroundPositioning.height) - this.model.pageBackgroundPositioning.width ) / 2
                    };
                } else {
                    // taller
                    newBGPos = {
                        height: this.model.pageBackgroundPositioning.width * Math.pow( this.aspectRatio, -1 ),
                        width: this.model.pageBackgroundPositioning.width,
                        top: -(this.model.pageBackgroundPositioning.width * Math.pow( this.aspectRatio, -1 ) - this.model.pageBackgroundPositioning.height ) / 2,
                        left: this.model.pageBackgroundPositioning.left
                    };
                }

                vals = _.extend({}, newBGPos );
                
                _.each( vals, function( val, key ) {
                    this.$el.css( key, val +"%" );
                }, this );

                // this.model.saveAttr(_.extend({ page_background: true }, vals ));
            }

            if ( !this.getAttr("page_background") ) {
                this.model.saveAttr(_.extend({ page_background: true }, vals ));
            }

        },

        fitToWorkspace: function() {
            var workspaceRatio, width, height, top, left;

            this.$el.unbind("mousedown.imageDrag");
            this.model.trigger("control_drag_enable");

            workspaceRatio = this.$workspace().width() / this.$workspace().height();

            if ( this.aspectRatio > workspaceRatio ) {
                width = this.$workspace().width();
                height = width / this.aspectRatio;
            } else {
                height = this.$workspace().height();
                width = height * this.aspectRatio;
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
                aspectRatio: this.aspectRatio,
                page_background: false,
                height: height,
                width: width,
                top: top,
                left: left
            });
        },

        verifyReady: function() {
            var $img = $("<img>")
                .attr("src", this.isAnimated() ? this.getAttr("zga_uri") : this.getAttr("uri"))
                .css({
                    height: "1px",
                    width: "1px",
                    position: "absolute",
                    left: "-1000%",
                    top: "-1000%"
                });
            $("body").append( $img );
            $img.imagesLoaded();

            $img.done(function() {
                this.model.trigger( "layer layer:visual_ready", this.model );
                $img.remove();
            }.bind(this));

            $img.fail(function() {
                $img.remove();
                this.model.trigger("layer layer:visual_error", this.model );
                this.model.trigger("layer layer:visual_ready", this.model );
            }.bind(this));

        },

        getAnimationCss: function() {

            if ( !this.isAnimated() ) return false;

            var animationMeta, css, width, height, frames, delay, percentDuration;

            animationMeta = this.model.getAttr("zga_uri").match(/\d+\d*_/g);
            width  = animationMeta[ 0 ].split("_")[0];
            height = animationMeta[ 1 ].split("_")[0];
            frames = animationMeta[ 2 ].split("_")[0];
            delay  = animationMeta[ 3 ].split("_")[0] === 0 ? 10 : animationMeta[ 3 ].split("_")[0];
            percentDuration = 100.0 / frames;


            this.aspectRatio = parseInt(width, 10 )/parseInt(height, 10);
            this.backgroundSize = frames * 100;
            this.duration = frames * delay / 100.0;

            css = "@"+ this.browserCode() +"keyframes zga-layer-" + this.model.id + "{";

            for (var i = 0; i < frames ; i++ ) {
                css += ( i * percentDuration ) + "%{" +
                    "background-position:0 -" + ( i * 100 ) + "%;" +
                    this.browserCode() + "animation-timing-function:steps(1);" +
                    "}";
            }
            
            css += "}";

            return css;
        },

        initAnimation: function(){
            var webkitCss, mozCss;

            webkitCss = {
                "-webkit-animation-name": "zga-layer-" + this.model.id,
                "-webkit-animation-duration": this.duration + "s",
                "-webkit-animation-iteration-count": "infinite",
                "-webkit-backface-visibility": "hidden"
            };
            mozCss = {
                "animation-name": "zga-layer-" + this.model.id,
                "animation-duration": this.duration + "s",
                "animation-iteration-count": "infinite",
                "backface-visibility": "hidden"
            };

            this.$(".visual-target").css(_.extend( this.browserCode() == "-moz-" ? mozCss : webkitCss, {
                "background-size": "100% " + this.backgroundSize + "%"
            }));
        },

        browserCode: function() {
            var ua = navigator.userAgent;

            if(ua.indexOf('Opera') != -1){
                return '-o-';
            }else if(ua.indexOf('MSIE') != -1){
                return '-ms-';
            }else if(ua.indexOf('WebKit') != -1){
                return '-webkit-';
            }else if(navigator.product == 'Gecko'){
                return '-moz-';
            }else{
                return '';
            }
        }
    });

    return L;
});
