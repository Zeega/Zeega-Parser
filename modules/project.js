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

        initialize: function() {
            this.parseSequences();
        },

        parseSequences: function() {
            this.sequences = new Sequence.Collection( this.get("sequences") );
            this.sequences.initFrames({ frames: this.get("frames"), layers: this.get("layers") });
            
            this.setInnerSequenceConnections();
            this.setSequenceToSequenceConnections();
            this.setLinkConnections();

            this.setPreload();
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

        },

        setPreload: function() {

        }

    });

    return ProjectModel;
});