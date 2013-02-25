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
            this.on("remove", this.onAdd, this );
        },

        onAdd: function( layer ) {
            layer.addCollection( this );
            layer.initVisual( Layers[ layer.get("type") ]);
            Zeega.trigger("layer_added", layer );
        },

        onRemove: function( layer ) {
            app.trigger("layer_remove", layer );
            console.log('layer removed', layer, this)
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
