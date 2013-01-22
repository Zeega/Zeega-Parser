// frame.js
define([
    "zeega"
],

function( Zeega ) {

    return Zeega.Backbone.Model.extend({

        ready: false,
        // waiting, loading, ready, destroyed
        state: "waiting",
        hasPlayed: false,
        elapsed: 0,

        // frame render as soon as it's loaded. used primarily for the initial frame
        renderOnReady: null,

        defaults: {
            attr: { advance: 0 },
            // ids of frames and their common layers for loading
            common_layers: {},
            controllable: true,
            id: null,
            // ids of layers contained on frame
            layers: [],
            // ids of frames this frame can lead to
            linksTo: [],
            // ids of frames this frame can be accessed from
            linksFrom: [],

            preload_frames: [],
            // id of the next frame
            _next: null,
            // id of the previous frame
            _prev: null,
            thumbnail_url: null
        },

        // for convenience
        getNext: function() {
            return this.get("_next");
        },

        getPrev: function() {
            return this.get("_prev");
        },

        // sets the sequence adjacencies as a string
        setConnections: function() {
            var prev = this.get("_prev"),
                next = this.get("_next");

            this.set( "connections",
                this.get('attr').advance ? "none" :
                prev & next ? "lr" :
                prev ? "l" :
                next ? "r" : "none"
            );
        },

        preload: function() {
            if ( !this.ready ) {
                this.layers.each(function( layer ) {
                    if ( layer.state === "waiting" || layer.state === "loading" ) {
                        layer.on( "layer_ready", this.onLayerReady, this );
                        layer.render();
                    }
                }, this );
            }
        },

        // render from frame.
        render: function( oldID ) {
            var commonLayers;
            // if frame is completely loaded, then just render it
            // else try preloading the layers
           if ( this.ready ) {
                // only render non-common layers. allows for persistent layers
                commonLayers = this.get("common_layers")[ oldID ] || [];
                // if the frame is "ready", then just render the layers
                this.layers.each(function( layer ) {
                    if ( !_.include(commonLayers, layer.id) ) {
                        layer.render();
                    }
                });

                // update status
                this.status.set( "current_frame",this.id );
                // set frame timer
                advance = this.get("attr").advance;
                if ( advance ) {
                    this.startTimer( advance );
                }

                if ( !this.get("_next") && this.get("linksTo").length === 0 ) {
                    this.status.emit("deadend_frame", _.extend({}, this.toJSON() ) );
                }

            } else {
                this.renderOnReady = oldID;
            }
            /* determines the z-index of the layer in relation to other layers on the frame */
            _.each( this.get("layers"), function( layerID, i ) {
                this.layers.get( layerID ).updateZIndex( i );
            }, this );
        },

        onLayerReady: function( layer ) {
            if ( this.isFrameReady() && !this.ready ) {
                this.onFrameReady();
            }

            // TODO: This does nothing?
            // trigger events on layer readiness
            // var states = this.layers.map(function(layer){ return layer.state; });
        },

        onFrameReady: function() {
            var data = {
                frame: this.toJSON(),
                layers: this.layers.toJSON()
            };

            this.ready = true;
            this.state = "ready";
            this.status.emit( "frame_ready", data );
            if ( !_.isNull( this.renderOnReady ) ) {

                this.status.emit( "can_play", data );
                this.render( this.renderOnReady );
                this.renderOnReady = null;
            }
        },

        getLayerStates: function() {
            var layers = _.toArray( this.layers );

            return [
                "ready", "waiting", "loading", "destroyed", "error"
            ].reduce(function( states, which ) {
                var filtereds = layers.filter(function( layer ) {
                    return layer.state === which;
                });

                states[ which ] = filtereds.map(function( layer ) {
                    return layer.attributes;
                });

                return states;
            }, {});
        },

        isFrameReady: function() {
            var states = this.getLayerStates();

            if ( (states.ready.length + states.error.length) === this.layers.length ) {
                return true;
            }
            return false;
        },

        pause: function() {

            // cancel the timer
            // record the current elapsed time on the frame
            // the elapsed time will be subtracted from the total advance time when the timer is restarted in play()
            if( this.timer ) {
                clearTimeout( this.timer );
                this.elapsed += ( new Date().getTime() - this.status.playTimestamp );
            }

            this.layers.each(function( layer ) {
                layer.pause();
            });
        },

        play: function() {
            var advance;

            this.layers.each(function( layer ) {
                layer.play();
            });

            // set frame timer
            advance = this.get("attr").advance;
            if ( advance ) {
                this.startTimer( advance - this.elapsed );
            }
        },

        startTimer: function( ms ) {
            if ( this.timer ) {
                clearTimeout( this.timer );
            }
            this.timer = setTimeout(function() {
                this.relay.set({
                    current_frame: this.get("_next")
                });
            }.bind(this), ms );
        },

        exit: function( newID ) {
            var commonLayers = this.get("common_layers")[ newID ] || [];

            this.elapsed = 0;
            if( this.timer ) {
                clearTimeout( this.timer );
            }
            this.layers.each(function( layer ) {
                if ( !_.include(commonLayers, layer.id) ) {
                    layer.exit();
                }
            });
        },

        unrender: function( newID ) {
            // not sure I need this
        },

        // manages the removal of all child layers
        destroy: function() {
            // do not attempt to destroy if the layer is waiting or destroyed
            if ( this.state !== "waiting" && this.state !== "destroyed" ) {
                this.layers.each(function( layer ) {
                    layer.destroy();
                });
                this.state = "destroyed";
            }
        }

    });
});
