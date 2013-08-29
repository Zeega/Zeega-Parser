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

        isAnimated: function(){

            if(!_.isNull(this.model.getAttr("zga_uri")) && !_.isUndefined(this.model.getAttr("zga_uri"))){
                return true;
            } else {
                return false;
            }
        },


        visualProperties: [
            "height",
            "width",
            "opacity"
        ],

        serialize: function() {
            return this.model.toJSON();
        },

        init: function() {
     
            var attr = this.model.get("attr");
            
            if( this.isAnimated() ){
                this.template = "image/animation";
                attr.uri = attr.zga_uri;
                this.model.set( { attr: attr } );
                this.setKeyframes();
            } else {
                this.template = "image/image";
            }

            if ( this.model.getAttr("page_background")) {
                this.visualProperties = ["opacity"];
            }
        },

        visualAfterRender: function(){
            if(this.isAnimated()){
                
                this.initAnimation();
            }
        },


        afterEditorRender: function() {

            if(!this.isAnimated()){
                this.aspectRatio = this.getAttr("aspectRatio");
            }

            if ( _.isNull( this.aspectRatio ) ) {
                this.determineAspectRatio();
            }

            if ( this.model.getAttr("page_background")) {
                this.makePageBackground();
                this.disableDrag();
            }

            this.stopListening( this.model );
            this.model.on("toggle_page_background", this.togglePageBackgroundState, this );
            this.model.on("resized", this.onResize, this );
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


             var realAspect = 2.10 / (this.$workspace().height()/this.$workspace().width());
    

            if( this.aspectRatio >= realAspect ){

                
                this.model.pageBackgroundPositioning = {
                    width: this.aspectRatio * 236.72 / realAspect,
                    height: 112.67,
                    top: -6.57277,
                    left: (100 - this.aspectRatio * 236.72 / realAspect)/2
                };

            } else {
                this.model.pageBackgroundPositioning = {
                    width: 236.72,
                    height: 112.67 * realAspect / this.aspectRatio,
                    top: (100 - 112.67 * realAspect / this.aspectRatio)/2,
                    left:  -68.4375
                };
            }

            var vals = _.extend({}, this.model.pageBackgroundPositioning );
            
            _.each( vals, function( val, key ) {
                this.$el.css( key, val +"%" );
            }, this );

            this.model.saveAttr(_.extend({ page_background: true }, vals ));

            this.initAnimation();
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
                .attr("src", this.getAttr("uri"))
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
                this.model.trigger( "visual_ready", this.model.id );
                $img.remove();
            }.bind(this));

            $img.fail(function() {
                $img.remove();
                this.model.trigger("visual_error", this.model.id );
                this.model.trigger("visual_ready", this.model.id );
            }.bind(this));
        },


        setKeyframes: function(){

            //  zga_uri format =  zga_width_height_frames_delay_id.jpg


            var attr=this.model.getAttr("zga_uri").match(/\d+\d*_/g);
            var keyframes = {
                name: "zga-layer-" + this.model.id
            };

            var width  = attr[ 0 ].split("_")[0],
                height = attr[ 1 ].split("_")[0],
                frames = attr[ 2 ].split("_")[0],
                delay  = attr[ 3 ].split("_")[0];

            if (delay == 0 ){
                 delay = 10;
            }

             console.log("delay: " + delay + " & frames: " + frames);


            
            this.aspectRatio = parseInt(width, 10 )/parseInt(height, 10);


            // var realAspect = 2.10 * this.$workspace().height()/this.$workspace().width();
   
            // if( this.aspectRatio >= realAspect ){

            //     this.model.pageBackgroundPositioning = {
            //         width: this.aspectRatio * 236.72 / realAspect,
            //         height: 112.67,
            //         top: -6.57277,
            //         left: (100 - this.aspectRatio * 112.67 / realAspect)/2
            //     };

            // } else {
            //     this.model.pageBackgroundPositioning = {
            //         width: 236.72,
            //         height: 112.67 * realAspect / this.aspectRatio,
            //         top: (100 - 112.67 * realAspect / this.aspectRatio)/2,
            //         left:  -68.4375
            //     };
            // }

            var percentDuration = 100.0 / frames;


            var percent;
            for (var i = 0; i < frames ; i++ ){
                //percent = Math.floor(i * percentDuration);
                percent = i * percentDuration;
                offset =  i * 100.0;
                keyframes[ percent + "%" ] = "background-position: 0 -" +offset + "%; -webkit-animation-timing-function: steps(1);";

            }


            

            this.backgroundSize = frames * 100;
            this.duration = frames * delay / 100.0;

            $.fn.addKeyframe([keyframes]);
            
        },

        initAnimation: function(){

            this.$(".visual-target").css({
                "background-size": "auto " + this.backgroundSize + "%",
                "-webkit-animation-name": "zga-layer-" + this.model.id,
                "-webkit-animation-duration": this.duration + "s",
                "-webkit-animation-iteration-count": "infinite",
                "-webkit-backface-visibility": "hidden"
  

            });
           
        }


    });

    return L;
});
