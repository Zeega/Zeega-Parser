// frame.js
define([
    "zeega",
    "zeega_parser/modules/sequence"
],

function( Zeega, Sequence ) {

    var ProjectModel = Zeega.Backbone.Model.extend({

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
            this.parseSequences();
        },

        parseSequences: function() {
            this.sequences = new Sequence.Collection( this.get("sequences") );
            this.sequences.initFrames({ frames: this.get("frames"), layers: this.get("layers") });

            this.generateFrameSequenceKey();
            this.setInnerSequenceConnections();
            this.setSequenceToSequenceConnections();
            this.setLinkConnections();

            this.setFramePreloadArrays();
        },

        generateFrameSequenceKey: function() {
            this.frameKey = {};
            this.sequences.each(function( sequence ) {
                sequence.frames.each(function( frame ) {
                    this.frameKey[ frame.id ] = sequence.id;
                }, this );
            }, this );
        },

        setInnerSequenceConnections: function() {
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

        setSequenceToSequenceConnections: function() {
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

        setLinkConnections: function() {
            this.sequences.each(function( sequence ) {
                sequence.frames.each(function( frame ) {
                    var linksTo = [];

                    frame.layers.each(function( layer ) {
                        if ( layer.get("type") == "Link" && layer.get("attr").to_frame != frame.id ) {
                            var targetFrameID = parseInt( layer.get("attr").to_frame, 10 ),
                                targetFrame = this._getFrame( targetFrameID );
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

        setFramePreloadArrays: function() {
            this.sequences.each(function( sequence ) {
                var nextSequence = sequence.get("advance_to") || false;

                sequence.frames.each(function( frame ) {
                    var nextFrame = frame.get("_next"),
                        prevFrame = frame.get("_prev"),
                        preloadTargets = [ nextFrame, prevFrame ];

                    for ( var i = 0; i < this.options.preloadRadius - 1; i++ ) {
                        nextFrame = nextFrame ? this._getFrame( nextFrame ).get("_next") : null;
                        prevFrame = prevFrame ? this._getFrame( prevFrame ).get("_prev") : null;

                        if ( !nextFrame && !prevFrame ) {
                            break;
                        }
                        preloadTargets.push( ahead, behind );
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

        _getFrame: function( frameID ) {
            return this.sequences.get( this.frameKey[ frameID ] ).frames.get( frameID );
        }

    });

    return ProjectModel;
});