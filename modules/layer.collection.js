// layer.js
define([
    "app"
],

function( app ) {

    return app.Backbone.Collection.extend({

        page: null,
        zeega: null,
        state: "waiting",

        initialize: function( models ) {
            if ( this.zeega.get("mode") == "editor" ) {
                this.initEditorListeners();
            } else if ( this.zeega.get("mode") == "player" ) {
                this.initPlayerListeners();
            }
        },

        initPlayerListeners: function() {
            this.on("layer:visual_ready", this.onVisualReady, this );
        },

        initEditorListeners: function() {
            this.on("add", this.onAdd, this );
            this.on("remove", this.onRemove, this );
        },

        // preloads all the layers in the collection
        preload: function() {
            this.each(function( layer ) {
                layer.render();
            });
        },

        onVisualReady: function( layer ) {
            var allReady = this.every(function( layer ) { return layer.state == "ready"; });

            if ( allReady ) {
                this.off("layer:visual_ready");
                this.state = "ready";
                this.page.trigger("layers layers:ready", this );
            }
        },

        play: function() {
            this.each(function( layer, i ) {
                layer.updateZIndex( layer.get("_order") );
                layer.play();
            }, this );
        },







        // onAdd: function( layer ) {

        //     if( layer.mode == "editor" ){
        //         if ( layer ) {
        //             layer.addCollection( this );
        //             layer.initVisual( Layers[ layer.get("type") ]);
        //             app.trigger("layer_added", layer );
        //         } else {
        //             this.each(function( layer ){
        //                 layer.addCollection( this );
        //                 layer.initVisual( Layers[ layer.get("type") ]);
        //             });
        //         }
        //     }
        // },

        onRemove: function( layer ) {
            layer.editorCleanup();
            layer.destroy();
            app.trigger("layer_remove", layer );
        },

        editorCleanup: function() {
            this.each( function( layer ) {
                layer.editorCleanup();
            });
        },

        comparator: function( layer ) {
            return this.get("_order");
            // if ( this.page ) {
            //     return layer.order[ this.page.id ];
            // }
        }
    });
    
});
