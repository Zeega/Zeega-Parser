// layer.js
define([
    "app",
    "zeega_parser/modules/layer.model"
],

function( Zeega, LayerModel ) {

    return Zeega.Backbone.Collection.extend({
        model: LayerModel,

        frame: null,

        comparator: function( layer ) {
            if ( this.frame ) {
                return layer.order[ this.frame.id ];
            }
        }
    });
    
});
