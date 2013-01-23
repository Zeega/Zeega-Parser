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
                frame.layers.each(function( frame ) {
                    frame.collection = frame.layers;
                });
            });
        },

        comparator: function( frame ) {
            return frame.get("_order");
        }
    });

});
