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
                    var contains = _.contains( frame.get("layers"), layer.id ),
                        invalidLink = layer.get("type") == "Link" && layer.get("attr").to_frame == frame.id;

                    // remove invalid link ids from frames. this kind of sucks
                    // have filipe rm these from the data??
                    if ( invalidLink ) {
                        frame.put("layers", _.without( frame.get("layers"), layer.id ) );
                    }

                    return contains && !invalidLink;
                });


                frame.layers = new LayerCollection( frameLayers );
                frame.layers.each(function( frame ) {
                    frame.collection = frame.layers;
                });
            });
        }
    });

});
