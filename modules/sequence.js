// frame.js
define([
    "zeega",
    "zeega_parser/modules/frame",
    "zeega_parser/modules/layer"
],

function( Zeega, Frame, Layer ) {

    var Sequence = {},

    SequenceModel = Zeega.Backbone.Model.extend({

        defaults: {
            advance_to: null,
            attr: {},
            description: null,
            frames: [],
            id: null,
            persistent_layers: [],
            title: ""
        }

    });

    Sequence.Collection = Zeega.Backbone.Collection.extend({
        model: SequenceModel,

        initFrames: function( options ) {
            this.each(function( sequence ) {
                var seqFrames = options.frames.filter(function( frame ) {
                    return _.contains( sequence.get("frames"), frame.id );
                });

                sequence.frames = new Frame.Collection( seqFrames );
                sequence.frames.sequence = sequence;
                sequence.frames.initLayers( options.layers );
            });
            // at this point, all frames should be loaded with layers and layer classes
        }

    });

    return Sequence;
});