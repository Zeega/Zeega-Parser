// layer.js
define([
    "app",
    "zeega_parser/plugins/layers/_all"
],

function( app, Layers ) {

    return app.Backbone.Collection.extend({

        frame: null,

        initialize: function( models ) {
            _.each( models, function( layer ) {
                this.onAdd( layer );
            }, this );
            this.on("add", this.onAdd, this );
            this.on("remove", this.onRemove, this );
        },

        onAdd: function( layer ) {
            if ( layer ) {
                layer.addCollection( this );
                layer.initVisual( Layers[ layer.get("type") ]);
                app.trigger("layer_added", layer );
            } else {
                this.each(function( layer ){
                    layer.addCollection( this );
                    layer.initVisual( Layers[ layer.get("type") ]);
                });
            }
        },

        onRemove: function( layer ) {
            layer.editorCleanup();
            app.trigger("layer_remove", layer );
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
