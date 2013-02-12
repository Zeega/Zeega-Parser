// layer.js
define([
    "app"
],

function( Zeega ) {

    return Zeega.Backbone.Collection.extend({

        frame: null,

        comparator: function( layer ) {
            if ( this.frame ) {
                return layer.order[ this.frame.id ];
            }
        }
    });
    
});
