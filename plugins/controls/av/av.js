define([
    "app",
    "zeega_parser/modules/control.view",
    "jqueryUI"
],

function( app, ControlView ) {

    return {
        av: ControlView.extend({

            audio: null,
            $avSlider: null,
            playing: false,
            dragging: false,

            propertyName: "av",
            template: "av/av",

            options: {
                step: 0.04
            },

            create: function() {
                var cueIn, cueOut, max, $avSlider;

                cueIn = this.getAttr("cue_in") || 0;
                cueOut = this.getAttr("cue_out") !== null ? this.getAttr("cue_out") :
                    this.getAttr("duration") !== null ? this.getAttr("duration") : 60;
                max = this.getAttr("duration") || 60;

                if ( this.getAttr("cue_out") === null ) {
                    this.update({ cue_out: cueOut });
                }

                this.$avSlider = this.$(".av-slider");

                this.$avSlider.slider({

                    range: "min",
                    step: 0.1,
                    min: 0,
                    max: max,
                    values: [ cueIn, 0 , cueOut ],

                    slide: function( e, ui ) {
                        this.verifyValues( ui );

                    }.bind( this ),
                    
                    start: function( e, ui ) {
                        this.dragging = true;
                    }.bind( this ),

                    stop: function( e, ui ) {
                        this.verifyValues( ui );
                        this.updateElapsed();
                        this.cueAudio( ui.values[1] );
                        this.dragging = false;

                    }.bind( this ),

                    change: function( e, ui ) {
                        this.updateElapsed();
                    }.bind( this )
                });

                var handles = this.$(".av-slider a");

                $( handles[0] ).addClass("handle-cueIn");
                $( handles[1] ).addClass("handle-playhead");
                $( handles[2] ).addClass("handle-cueOut");

                this.updateElapsed();
                this.listen();
            },

            verifyValues: _.debounce(function( ui ) {
                var values = ui.values;

                if ( values[0] >= values[2] ) {
                    this.$avSlider.slider("values", 2, values[0] + 2 );
                }
                if ( values[1] < values[0] ) {
                    this.$avSlider.slider("values", 1, values[0] + 0.1 );
                } else if ( values[1] >= values[2] ) {
                    this.$avSlider.slider("values", 1, values[2] - 0.1 );
                }

                this.updateCues( values );
            }, 250 ),

            updateCues: function( values ) {
                var cueIn, cueOut, cues = {};

                cueIn = this.getAttr("cue_in");
                cueOut = this.getAttr("cue_out");
                
                if ( cueIn != values[0] ) {
                    cues.cue_in = values[0];
                }
                if ( cueOut != values[2] ) {
                    cues.cue_out = values[2];
                }

                this.update( cues );
            },

            updateElapsed: _.debounce(function() {
                var cue, elap, width;

                cue = parseInt( this.$(".handle-cueIn").css("left"), 10 );
                elap = parseInt( this.$(".handle-playhead").css("left"), 10 );
                width = this.$(".av-slider").width();

                this.$(".ui-slider-range").css({
                    left: ( cue / width * 100 ) + "%",
                    width: ( (elap - cue) / width * 100 ) + "%"
                });

            }, 200),

            cueAudio: function( sec ) {
                this.audio.currentTime = sec;
            },

            listen: function() {
                this.audio = this.model.visual.getAudio();
                this.model.on("play", this.onPlay, this );
                this.model.on("pause", this.onPause, this );
                this.model.on("timeupdate", this.onTimeupdate, this );
            },
            
            onBlur: function() {
                this.$avSlider.slider("destroy");
            },

            onFocus: function() {
                this.create();
            },
            
            onPlay: function( obj ) {
                this.$(".playpause i")
                    .addClass("icon-pause")
                    .removeClass("icon-play");
            },

            onPause: function( obj ) {
                this.$(".playpause i")
                    .removeClass("icon-pause")
                    .addClass("icon-play");
            },

            onTimeupdate: function( obj ) {
                if ( !this.dragging ) {
                    if ( obj.currentTime >= this.getAttr("cue_out") ) {
                        this.audio.pause();
                        this.audio.currentTime = this.getAttr("cue_in");
                    }
                    this.$avSlider.slider("values", 1, obj.currentTime );
                }
            },

            events: {
                "click .playpause": "playpause"
            },

            playpause: function() {
                this.model.visual.playPause();
            }

        })

    };


});
