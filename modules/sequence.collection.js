define([
    "zeega",
    "zeega_parser/modules/sequence.model",
    "zeega_parser/modules/frame.collection"
],

function( Zeega, SequenceModel, FrameCollection ) {

    return Zeega.Backbone.Collection.extend({
        model: SequenceModel,

        initFrames: function( options ) {
            this.each(function( sequence ) {
                var seqFrames = options.frames.filter(function( frame ) {
                    return _.contains( sequence.get("frames"), frame.id );
                });

                sequence.frames = new FrameCollection( seqFrames );
                sequence.frames.sequence = sequence;
                sequence.frames.initLayers( options.layers );
            });
            // at this point, all frames should be loaded with layers and layer classes
        }
    });

});