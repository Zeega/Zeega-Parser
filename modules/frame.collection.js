// frame.js
define([
    "app",
    "zeega_parser/modules/frame.model",
    "zeega_parser/modules/layer.collection"
],

function( Zeega, FrameModel, LayerCollection ) {

    return Zeega.Backbone.Collection.extend({
        model: FrameModel,

        initLayers: function( layerCollection ) {
            this.each(function( frame ) {
                var frameLayers = layerCollection.filter(function( layer ) {
                    var invalidLink, index;

                    invalidLink = layer.get("type") == "Link" && layer.get("attr").to_frame == frame.id;
                    index = _.indexOf( frame.get("layers"), layer.id );

                    if ( invalidLink ) {
                        // remove invalid link ids from frames. this kind of sucks
                        // have filipe rm these from the data??
                        frame.put("layers", _.without( frame.get("layers"), layer.id ) );
                        return false;
                    } else if ( index > -1 ) {
                        //console.log( layer, frame, index )
                        layer.order[ frame.id ] = index;
                        return true;
                    }
                    return false;
                });

                frame.layers = new LayerCollection( frameLayers );
                frame.layers.frame = frame;
                frame.layers.sort({ silent: true });
                // update the layer collection attribute
                frame.layers.each(function( layer ) {
                    layer.collection = frame.layers;
                });
            });
        },

        comparator: function( frame ) {
            return frame.get("_order");
        }
    });

});
