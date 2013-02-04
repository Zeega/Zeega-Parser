define([
    "zeega",
    "zeega_parser/plugins/layers/_layer/_layer",
    "zeega_parser/plugins/layers/video/video"
],

function( Zeega, _Layer, VideoLayer ){

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
                this.model.trigger( "visual_ready", this.model.id );
            }.bind( this ));
        }

    });

    return Layer;
});
