// frame.js
define([
    "app",
    "zeega_parser/modules/frame.model",
    "zeega_parser/modules/layer.collection"
],

function( Zeega, FrameModel, LayerCollection ) {

    return Zeega.Backbone.Collection.extend({
        model: FrameModel,

        initLayers: function( layerCollection, options ) {

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
                    layer.addCollection( frame.layers );
                    layer.pluginsPath = options.pluginsPath;
                });
                frame.listenToLayers();
            });
        },

        // add frame at a specified index.
        // omit index to append frame
        addFrame: function( index ) {
            var newFrame = new FrameModel();

            newFrame.status = Zeega.status;
            newFrame.layers = new LayerCollection();
            newFrame.layers.frame = newFrame;

            newFrame.save().success(function() {
                if ( _.isUndefined( index ) ) {
                    this.push( newFrame );
                } else {
                    this.add( newFrame, { at: index });
                }
            }.bind( this ));

        },

        comparator: function( frame ) {
            return frame.get("_order");
        }
    });

});
