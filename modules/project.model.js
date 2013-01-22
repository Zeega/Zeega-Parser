// frame.js
define([
    "zeega",
    "zeega_parser/modules/sequence.collection"
],

function( Zeega, SequenceCollection ) {

    return Zeega.Backbone.Model.extend({

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

        initialize: function( data, options ) {
            this.options = _.defaults( options, this.defaultOptions );
            this.parser = options.parser;
            this.parseSequences();
        },

        parseSequences: function() {
            this.sequences = new SequenceCollection( this.get("sequences") );
            this.sequences.initFrames({ frames: this.get("frames"), layers: this.get("layers") });

            this._generateFrameSequenceKey();
            this._setInnerSequenceConnections();
            this._setSequenceToSequenceConnections();
            this._setLinkConnections();
            this._setFramePreloadArrays();
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
                    frames.each(function( frame, j ) {
                        frame.put({
                            _next: frames.at( j + 1 ) ? frames.at( j + 1 ).id : null,
                            _prev: frames.at( j - 1 ) ? frames.at( j - 1 ).id : null
                        });
                    });
                }
            });
        },

        _setSequenceToSequenceConnections: function() {
            this.sequences.each(function( sequence, i ) {
                var advanceTo = sequence.get("advance_to"),
                    followingSequence = this.sequences.get( advanceTo );

                if ( advanceTo && followingSequence ) {
                    var a = sequence.frames.last(),
                        b = followingSequence.frames.at( 0 );

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
                            var targetFrameID = parseInt( layer.get("attr").to_frame, 10 ),
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

                    frame.put( "preload_frames",
                        _.union(
                            preloadTargets, frame.get("linksTo"), frame.get("linksFrom")
                        )
                    );

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

        getFrame: function( frameID ) {
            return this.sequences.get( this.frameKey[ frameID ] ).frames.get( frameID );
        }

    });

});