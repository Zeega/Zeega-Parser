define([
    "app",
    "engine/modules/layer.model",
    "engine/modules/layer.visual.view",
    "swfObject"
],

function( app, _Layer, Visual ){

    var Layer = {},
        canPlayMpeg;

    Layer.Audio = _Layer.extend({

        layerType: "Audio",
        modelType: "layer",

        canplay: false,

        attr: {
            title: "Audio Layer",
            url: "none",
            left: 0,
            top: 0,
            height: 0,
            width: 0,
            volume: 0.5,
            cue_in: 0,
            cue_out: null,
            duration: null,
            fade_in: 0,
            fade_out: 0,
            loop: false,
            opacity: 0,
            citation: true,
            soundtrack: false
        },

        controls: [
            {
                type: "checkbox",
                options: {
                    title: "loop",
                    propertyName: "loop"
                }
            },
            "av"
        ]
    });

    canPlayMpeg = function(){
        var a = document.createElement('audio');
        return !!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));
    };

    if( canPlayMpeg() ){
        Layer.Audio.Visual = Visual.extend({

            audio: null,
            ended: false,
            playbackCount: 0,

            template: "audio/audio",

            serialize: function() {
                return this.model.toJSON();
            },

            onPlay: function() {
                if ( this.audio ) {
                    this.ended = false;
                    this.audio.play();
                }
            },

            onPause: function() {
                this.setAudio();
                this.audio.pause();
            },

            onExit: function() {
                this.audio.pause();
            },

            destroy: function() {
                this.$("audio").attr("src", "");
                this.audio = null;
            },

            editor_onLayerEnter: function() {},

            editor_onLayerExit: function() {
                this.destroy();
            },

            playPause: function() {
                this.setAudio();
                if ( this.audio.paused ) {
                    this.audio.play();
                } else {
                    this.audio.pause();
                }
            },

            afterPlayerRender: function() {
                this.setAudio();
            },

            setAudio: function() {
                if ( this.audio === null ) {
                    this.audio = this.$("audio")[0];
                    this.audio.load();
                }
            },

            getAudio: function() {
                // this.setAudio();

                return this.audio;
            },

            verifyReady: function() {
                this.audio = this.$("#audio-el-" + this.model.id )[0];

                this.audio.load();
                this.audio.addEventListener("canplay", function() {
                    this.model.state = "ready";
                    this.onCanPlay();
                }.bind( this ));
            },

            init: function() {
                this.onCanPlay = _.once(function() {
                    this.audio.pause();
                    this.model.trigger("layer layer:ready", this.model );
                });
            },

            onVisualReady: function() {

            },

            onCanPlay: function() {}

        });
    } else {

        
        window.onPlayerLoaded = function( containerId ) {
            var k = onPlayerLoaded[ containerId ] && onPlayerLoaded[ containerId ]();
        };

        window.onLoading= function( containerId, value ) {
            var k = onLoading[ containerId ] && onLoading[ containerId ](value);
        };

        window.onStateChange= function( containerId, eventid, eventvalue ) {
            var k = onStateChange[ containerId ] && onStateChange[ containerId ](eventid, eventvalue);
        };

        window.onError= function( containerId, value ) {
            var k = onError[ containerId ] && onError[ containerId ](value);
        };

        Layer.Audio.Visual = Visual.extend({

            audio: null,
            ended: false,
            playbackCount: 0,

            template: "audio/audio-flash",

            serialize: function() {
                return this.model.toJSON();
            },

            init: function() {
                this.paused = true;
            },

            afterRender: function(){
                if ( window.swfobject ) {
                    this.flashVideoInit();
                }
            },



            onPlay: function() {
                this.audio.sendToFlash('play', this.currentTime );
                this.paused = false;
            },

            onPause: function() {
                flashvideoObject.sendToFlash('pause','');
                this.paused = true;
            },

            onExit: function() {
                this.onPause();
            },

            destroy: function() {
                this.onPause();
            },

            editor_onLayerEnter: function() {

            },

            editor_onLayerExit: function() {
                this.onPause();
            },

            playPause: function() {
                
                if ( this.paused ) {
                    this.onPlay();
                } else {
                    this.onPause();
                }
            },

            flashVideoInit: function() {
                var flashvars,
                    params,
                    attributes,
                    containerId = "flash-" + this.model.id;



                $("#audio-"+containerId).on("player-loaded", 
                        $.proxy(function(){
                            this.onPlayerLoaded();
                        }, this)
                    ).on("loading",
                        $.proxy(function( event, value ){
                            this.onLoading( value );
                        }, this)
                    ).on("state-change", 
                        $.proxy(function( event, event_id, value  ){
                            this.onStateChange( event_id, value );
                        }, this)
                    );

                // expose a callback to this scope, that is called from the global callback youtube calls
                onPlayerLoaded[ containerId ] = function() {
                    
                    $("#audio-"+containerId).trigger( "player-loaded" );

                    var src = $("#audio-"+containerId).data("src"),
                        cue_in = $("#audio-"+containerId).data("cue_in");

                    flashvideoObject = document.getElementById (containerId);
                    onLoading[ containerId ] = function (value){
                        $("#audio-"+containerId).trigger( "loading", [ value ] );
                    };

                    onStateChange[ containerId ] = function (event_id, value){
                        $("#audio-"+containerId).trigger( "state-change", [ event_id, value ] );
                    };
                    
                    flashvideoObject.sendToFlash("load", src + ',' + cue_in );
                };

                flashvars = {
                    vidId: containerId
                };

                params = {
                    wmode: "transparent",
                    allowScriptAccess: "always",
                    allownetworking : "all",
                    bgcolor : "#000000"
                };

                attributes = {
                    id: containerId
                };

               
                swfobject.embedSWF("assets/vendor/popcorn/MediaPlayer.swf", containerId, "100%", "100%", "9.0.0", false, flashvars, params, attributes);
                    
            },

            onPlayerLoaded: function(){
                this.audio = document.getElementById( "flash-" + this.model.id );
            },

            onLoading: function( value ){
                if( value == 3 ) {
                    this.model.state = "ready";
                    this.model.trigger( "layer:visual_ready", this.model.id );
                }
            },

            onStateChange: function( event_id, value ){

            },

            onCanPlay: function() {}

            // listen: _.once(function() {
            //     // don't need to listen to audio time if there's no cue out!
            //     if ( this.getAttr("cue_out") !== null ) {
            //         this.audio.addEventListener("timeupdate", function(){
            //             var currentTime = this.audio.currentTime;

            //             if ( currentTime >= this.getAttr("cue_out" ) ) {
            //                 if ( this.getAttr("loop") ) {
            //                     this.audio.pause();
            //                     this.audio.currentTime = this.getAttr("cue_in");
            //                     this.audio.play();
            //                 } else {
            //                     this.audio.pause();
            //                     this.audio.currentTime = this.getAttr("cue_in");
            //                 }
            //             }
            //         }.bind( this ));
            //     }

            //     this.audio.addEventListener("ended", function(){
            //         if ( this.getAttr("loop") ) {
            //             this.audio.pause();
            //             this.audio.currentTime = this.getAttr("cue_in");
            //             this.audio.play();
            //         } else {
            //             this.audio.pause();
            //             this.audio.currentTime = this.getAttr("cue_in");
            //         }
            //     }.bind( this ));
            // })

        });
    }
       

    return Layer;
});
