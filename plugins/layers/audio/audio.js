define([
    "zeega",
    "zeega_parser/plugins/layers/_layer/_layer"
],

function( Zeega, _Layer ){

    var Layer = Zeega.module();

    Layer.Audio = _Layer.extend({

        layerType: "Audio",

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
            fade_in: 0,
            fade_out: 0,
            opacity: 0,
            citation: true
        }
    });

    Layer.Audio.Visual = _Layer.Visual.extend({
        template: "plugins/audio",

        audio: null,
        ended: false,
        playbackCount: 0,

        serialize: function() {
            return this.model.toJSON();
        },

        onPlay: function() {
            this.ended = false;
            this.audio.play();
        },

        onPause: function() {
            this.audio.pause();
        },

        onExit: function() {
            this.audio.pause();
        },

        verifyReady: function() {
            this.audio = document.getElementById("audio-el-" + this.model.id );
            this.$('audio').on("canplay", function() {
                this.audio.pause();
                this.audio.currentTime = this.getAttr("cue_in");

                if ( this.getAttr("cue_out") || this.getAttr("loop") ) {
                    this.listen();
                }
                this.model.trigger( "visual_ready", this.model.id );
            }.bind( this ));
        },

        listen: function() {

            this.$("audio").on("timeupdate", function(){
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

            this.$("audio").on("ended", function(){
                if ( this.getAttr("loop") ) {
                    this.audio.pause();
                    this.audio.currentTime = this.getAttr("cue_in");
                    this.audio.play();
                } else {
                    this.audio.pause();
                    this.audio.currentTime = this.getAttr("cue_in");
                }
            }.bind( this ));
        } 


    });

    return Layer;
});
