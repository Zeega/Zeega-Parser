// frame.js
define([
    "zeega",
    "zeega_parser/modules/frame.model",
    "zeega_parser/modules/layer.collection"
],

function( Zeega, FrameModel, LayerCollection ) {

    return Zeega.Backbone.Collection.extend({
        model: FrameModel,

        initLayers: function( layerCollection ) {
            this.each(function( frame ) {
                var frameLayers = layerCollection.filter(function( layer ) {
                    return _.contains( frame.get("layers"), layer.id );
                });

                frame.layers = new LayerCollection( frameLayers );
            });
        }
    });

});
