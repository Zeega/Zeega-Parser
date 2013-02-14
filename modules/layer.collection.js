// layer.js
define([
    "app",
    "zeega_parser/plugins/layers/_all"
],

function( Zeega, Layers ) {

    return Zeega.Backbone.Collection.extend({

        frame: null,

        initialize: function( models ) {
            _.each( models, function( layer ) {
                this.onAdd( layer );
            }, this );
            this.on("add", this.onAdd, this );
        },

        onAdd: function( layer ) {
            layer.initVisual( Layers[ layer.get("type") ]);
        },

        editorCleanup: function() {
            this.each( function( layer ) {
                layer.editorCleanup();
            });
        },

        comparator: function( layer ) {
            if ( this.frame ) {
                return layer.order[ this.frame.id ];
            }
        }
    });
    
});
