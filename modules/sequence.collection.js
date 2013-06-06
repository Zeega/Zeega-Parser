define([
    "app",
    "engine/modules/sequence.model",
    "engine/modules/frame.collection",
    "engine/modules/layer.collection",
    "engine/plugins/layers/_all"
],

function( app, SequenceModel, FrameCollection, LayerCollection, LayerModels ) {

    return app.Backbone.Collection.extend({
        model: SequenceModel,

        initFrames: function( frames, layers, options ) {
            var layerCollection, classedLayers;

            // generate classed layers and add their visual counterparts
            classedLayers = _.map( layers, function( layer ) {
                var layerModel = new LayerModels[ layer.type ]( layer );

                layerModel.initVisual( LayerModels[ layer.type ] );
                
                return layerModel;
            });

            layerCollection = new LayerCollection( classedLayers );

            this.each(function( sequence ) {
                var seqFrames;

                seqFrames = frames.filter(function( frame ) {
                    var index = _.indexOf( sequence.get("frames"), frame.id );

                    if ( index > -1 ) {
                        frame._order = index;
                        return true;
                    }

                    return false;
                });

                sequence.frames = new FrameCollection( seqFrames );
                sequence.frames.sequence = sequence;
                sequence.frames.initLayers( layerCollection, options );
            });

            this.at(0).initSoundtrackModel( layerCollection );
            // at this point, all frames should be loaded with layers and layer classes
        }
    });

});