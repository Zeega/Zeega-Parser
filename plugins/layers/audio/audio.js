define([
    "app",
    "zeega_parser/modules/layer.model",
    "zeega_parser/modules/layer.visual.view"
],

function( app, _Layer, Visual ){

    var Layer = app.module();

    Layer.Audio = _Layer.extend({

        layerType: "Audio",

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

    Layer.Audio.Visual = Visual.extend({

        audio: null,
        ended: false,
        playbackCount: 0,

        template: "audio/audio",

        serialize: function() {
            return this.model.toJSON();
        },

        onPlay: function() {
            this.setAudio();
            this.ended = false;
            this.audio.play();
        },

        onPause: function() {
            this.setAudio();
            this.audio.pause();
        },

        onExit: function() {
            this.setAudio();
            this.audio.pause();
        },

        destroy: function() {
            this.$("audio").attr("src", "");
            this.audio = null;
        },

        editor_onLayerEnter: function() {
            // this.render();
        },

        editor_onLayerExit: function() {
            this.$("audio").attr("src", "");
            this.audio = null;
            this.render();
        },

        playPause: function() {
            this.setAudio();
            if ( this.audio.paused ) {
                this.audio.play();
            } else {
                this.audio.pause();
            }
        },

        setAudio: function() {
            if ( this.audio === null ) {
                this.audio = this.$("#audio-el-" + this.model.id )[0];
                // this.audio = document.getElementById("audio-el-" + this.model.id );
                this.listen();
                this.audio.load();
            }
        },

        getAudio: function() {
            this.setAudio();
            return this.audio;
        },

        verifyReady: function() {

            this.audio = this.$("#audio-el-" + this.model.id )[0];

            this.audio.load();
            this.audio.addEventListener("canplaythrough", function() {
                this.onCanPlay();
            }.bind( this ));
        },

        onCanPlay: _.once(function() {
            this.audio.pause();
            this.audio.currentTime = this.getAttr("cue_in");

            if ( this.getAttr("cue_out") || this.getAttr("loop") ) {
                this.listen();
            }
            this.model.trigger( "visual_ready", this.model.id );
        }),

        listen: _.once(function() {
            // don't need to listen to audio time if there's no cue out!
            if ( this.getAttr("cue_out") !== null ) {
                this.audio.addEventListener("timeupdate", function(){
                    var currentTime = this.audio.currentTime;

                    if ( currentTime >= this.getAttr("cue_out" ) ) {
                        if ( this.getAttr("loop") ) {
                            this.audio.pause();
                            this.audio.currentTime = this.getAttr("cue_in");
                            this.audio.play();
                        } else {
                            this.audio.pause();
                            this.audio.currentTime = this.getAttr("cue_in");
                        }
                    }
                }.bind( this ));
            }

            this.audio.addEventListener("ended", function(){
                if ( this.getAttr("loop") ) {
                    this.audio.pause();
                    this.audio.currentTime = this.getAttr("cue_in");
                    this.audio.play();
                } else {
                    this.audio.pause();
                    this.audio.currentTime = this.getAttr("cue_in");
                }
            }.bind( this ));
        }),

        // listen: function() {
        //     jQuery(this.audio).on("canplay", function() {
        //         this.model.trigger( "visual_ready", this.model.id );
        //         this.model.trigger( "canplay", this.model );
        //         this.model.canplay = true;
        //     }.bind( this ));

        //     _.each( ["play", "pause", "timeupdate"], function( e ) {
        //         jQuery(this.audio).on( e, function() {
        //             this.model.trigger( e, {
        //                 layer: this.model,
        //                 currentTime: this.audio.currentTime,
        //                 duration: this.audio.duration
        //             });
        //         }.bind( this ));
        //     }, this );

        //     // listen for volume changes
        //     this.model.on("change:volume", this.onVolumeChange, this );
        // },

        // onVolumeChange: function( model, vol ) {
        //     console.log('on vol change', vol );
        //     if ( this.audio ) {
        //         this.audio.volume = vol;
        //     }
        // },

        // verifyReady: function() {
        //     this.setAudio();
        //     this.$('audio').on("canplay", function() {
        //         this.audio.pause();
        //         this.model.trigger( "visual_ready", this.model.id );
        //     }.bind( this ));
        // }
    });

    return Layer;
});
