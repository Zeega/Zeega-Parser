define([
    "app",
    "zeega_parser/modules/sequence.collection"
],

function( app, SequenceCollection ) {

    return app.Backbone.Model.extend({

        updated: false,

        defaults: {
            authors: null,
            cover_image: null,
            date_created: null,
            date_published: null,
            date_updated: null,
            description: null,
            enabled: true,
            estimated_time: null,
            frames: [],
            id: null,
            item_id: null,
            layers: [],
            location: null,
            published: true,
            sequences: [],
            tags: "",
            title: "Untitled",
            user_id: null
        },

        defaultOptions: {
            preloadRadius: 2,
            attach: {}
        },

        url : function() {
            return app.api +'projects/' + this.id;
        },

        initialize: function( data, options ) {
            this.options = _.defaults( options, this.defaultOptions );
            this.parser = options.parser;
            this.parseSequences();
        },

        parseSequences: function() {
            this.sequences = new SequenceCollection( this.get("sequences") );
            this.sequences.initFrames( this.get("frames"), this.get("layers"), this.options );

            this._generateFrameSequenceKey();
            this._setInnerSequenceConnections();
            this._setSequenceToSequenceConnections();
            this._setLinkConnections();
            this._setFramePreloadArrays();
            this._setFrameCommonLayers();
            this._attach();
        },

        _generateFrameSequenceKey: function() {
            this.frameKey = {};
            this.sequences.each(function( sequence ) {
                sequence.frames.each(function( frame ) {
                    this.frameKey[ frame.id ] = sequence.id;
                }, this );
            }, this );
        },

        _setInnerSequenceConnections: function() {
            this.sequences.each(function( sequence, i ) {
                var frames = sequence.frames;

                if ( frames.length > 1 ) {
                    var animationStart = null;

                    frames.each(function( frame, j ) {
                        var lastStart = animationStart;

                        // return to the start of an animation sequence
                        animationStart = frame.get("attr").advance && animationStart === null ? frame.id :
                            frame.get("attr").advance && animationStart !== null ? animationStart : null;

                        frame.put({
                            _next: frames.at( j + 1 ) ? frames.at( j + 1 ).id : null,
                            _last: frames.at( j - 1 ) ? frames.at( j - 1 ).id : null,
                            _prev: animationStart && lastStart === null && frames.at( j - 1 ) ? frames.at( j - 1 ).id :
                                animationStart ? animationStart :
                                animationStart === null && lastStart !== null ? lastStart :
                                frames.at( j - 1 ) ? frames.at( j - 1 ).id : null
                        });
                    });
                }
            });
        },

        _setSequenceToSequenceConnections: function() {
            this.sequences.each(function( sequence, i ) {
                var a,b,
                    advanceTo = sequence.get("advance_to"),
                    followingSequence = this.sequences.get( advanceTo );

                if ( advanceTo && followingSequence ) {
                    a = sequence.frames.last();
                    b = followingSequence.frames.at( 0 );

                    a.put({ _next: b.id });
                    b.put({ _prev: a.id });
                } else if( !advanceTo && sequence.frames.last().get('attr').advance ) {
                    a = sequence.frames.last();
                    b = sequence.frames.first();
                    a.put({ _next: b.id });
                    b.put({ _prev: a.id });
                }
            }, this );
        },

        _setLinkConnections: function() {
            this.sequences.each(function( sequence ) {
                sequence.frames.each(function( frame ) {
                    var linksTo = [];

                    frame.layers.each(function( layer ) {
                        if ( layer.get("type") == "Link" && layer.get("attr").to_frame != frame.id ) {
                            var targetFrameID, targetFrame, linksFrom;

                            targetFrameID = parseInt( layer.get("attr").to_frame, 10 );
                            targetFrame = this.getFrame( targetFrameID );
                            linksFrom = [].concat( targetFrame.get("linksFrom") );

                            linksTo.push( targetFrameID );
                            linksFrom.push( frame.id );

                            targetFrame.put("linksFrom", linksFrom );
                        }
                    }, this );

                    frame.put( "linksTo", linksTo );
                }, this );
            }, this );
        },

        _setFramePreloadArrays: function() {
            this.sequences.each(function( sequence ) {
                var nextSequence = sequence.get("advance_to") || false;

                sequence.frames.each(function( frame ) {
                    var nextFrame = frame.get("_next"),
                        prevFrame = frame.get("_prev"),
                        preloadTargets = [ frame.id, nextFrame, prevFrame ];

                    for ( var i = 0; i < this.options.preloadRadius - 1; i++ ) {
                        nextFrame = nextFrame ? this.getFrame( nextFrame ).get("_next") : null;
                        prevFrame = prevFrame ? this.getFrame( prevFrame ).get("_prev") : null;

                        if ( !nextFrame && !prevFrame ) {
                            break;
                        }
                        preloadTargets.push( nextFrame, prevFrame );
                    }

                    if( nextSequence ) {
                        preloadTargets.push( this.sequences.get( nextSequence ).get("frames")[0] );
                    }

                    preloadTargets = preloadTargets.filter( Boolean );

                    this._setConnections( frame );

                    frame.put( "preload_frames",
                        _.union(
                            preloadTargets, frame.get("linksTo"), frame.get("linksFrom")
                        )
                    );

                }, this );
            }, this );

        },

        _setConnections: function( frame ) {
            var prev, next;

            prev = frame.get("_prev"),
            next = frame.get("_next");

            frame.put( "_connections",
                frame.get('attr').advance ? "none" :
                prev & next ? "lr" :
                prev ? "l" :
                next ? "r" : "none"
            );
        },

        _setFrameCommonLayers: function() {
            this.sequences.each(function( sequence ) {
                sequence.frames.each(function( frame ) {
                    var commonLayers = {},
                        linkedFrames = [ "_prev", "_last", "_next", "linksTo", "linksFrom" ].map(function( value ) {
                        return frame.get( value );
                    });

                    linkedFrames = _.compact( _.flatten( linkedFrames ) );

                    _.each( _.uniq( linkedFrames ), function( frameID ) {
                        var targetFrame = this.getFrame( frameID );
                        
                        commonLayers[ frameID ] = _.intersection( targetFrame.get("layers"), frame.get("layers") );
                    }, this );
                    frame.put("common_layers", commonLayers );
                }, this );
            }, this );
        },

        _attach: function() {
            this.sequences.each(function( sequence ) {
                _.extend( sequence, this.options.attach );
                sequence.frames.each(function( frame ) {
                    _.extend( frame, this.options.attach );
                    frame.layers.each(function( layer ) {
                        _.extend( layer, this.options.attach );
                    }, this );
                }, this );
            }, this );
        },

        getProjectJSON: function() {
            var frames = [], layers = [];

            this.sequences.each(function( sequence ) {
                frames = frames.concat( sequence.frames.toJSON() );
                sequence.frames.each(function( frame ) {
                    layers = layers.concat( frame.layers.toJSON() );
                });
            });

            return _.extend({}, this.toJSON(), {
                sequences: this.sequences.toJSON(),
                frames: frames,
                layers: _.uniq( layers )
            });
        },

        getFrame: function( frameID ) {
            console.log( frameID, this.sequences, this.frameKey )
            return this.sequences.get( this.frameKey[ frameID ] ).frames.get( frameID );
        },

        // this is not the best. cache these somewhere in a big collection?
        getLayer: function( layerID ) {
            var layerModel;

            this.sequences.each(function( sequence ) {
                sequence.frames.each(function( frame ) {
                    var layer = frame.layers.get( layerID );

                    if ( layer ) {
                        layerModel = layer;
                        return false;
                    }
                });
            });

            return layerModel;
        },

        /* editor */

        publishProject: function() {

            if ( this.get("date_updated") != this.get("date_published") || this.updated ) {
                var mobile = this.validateMobile();
                
                this.updated = false;
                this.once("sync", this.onProjectPublish, this);

                if ( !this.get("published") ) {
                     this.set({ published: true });
                }
                this.save({
                    publish_update: 1,
                    mobile: mobile
                });
                console.log("already published. published again");
            } else {
                this.trigger("update_buttons");
            }
        },

        onProjectPublish: function( model, response ) {
            this.set({ publish_update: 0 });
        },

        validateMobile: function() {
            var layers, validLayerTypes, maxAudioLayers, valid;
            
            layers = [];
            validLayerTypes = ["Image", "Audio", "Text", "Link", "Rectangle"];
            maxAudioLayers = 1;
            maxFrames = null;
            valid = true;


            this.sequences.each(function( sequence ) {

                if ( maxFrames !== null && ( maxFrames -= sequence.frames.length ) < 0 ) {
                    valid = false;
                    return false;
                }

                sequence.frames.each(function( frame ) {
                    frame.layers.each(function( layer ) {

                        var layerTypeValid = _.contains( validLayerTypes, layer.get("type") );

                        if ( !layerTypeValid ) {
                            valid = false;
                            return false;
                        }

                        // dupe layer. ignore
                        if ( !_.contains( layers, layer.id ) && layer.get("type") == "Audio" && maxFrames-- < 0 ) {
                            layers.push( layer.id );
                            valid = false;
                            return false;
                        } else if ( !_.contains( layers, layer.id ) && layer.get("type") == "Audio" ) {
                            layers.push( layer.id );
                        }
                    });
                });
            });

            return valid;
        }

    });

});