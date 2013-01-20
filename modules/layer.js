// layer.js
define([
    "zeega",
    "zeega_parser/plugins/layers/_all"
],

function( Zeega, LayerPlugin ) {

    var Layer = {},

    LayerModel = Zeega.Backbone.Model.extend({
        ready: false,
        state: "waiting", // waiting, loading, ready, destroyed, error

        defaults: {
            attr: {},
            id: null,
            project_id: null,
            type: null
        },

        initialize: function() {
            var layerClass = LayerPlugin[ this.get("type") ];

            // init link layer type inside here
            if ( layerClass ) {
                var newAttr;

                this.layerClass = new layerClass();

                newAttr = _.defaults( this.toJSON().attr, this.layerClass.attr );

                this.set({ attr: newAttr });

                // create and store the layerClass
                this.visualElement = new layerClass.Visual({
                    model: this,
                    attributes: function() {
                        return _.extend( {}, _.result( this, "domAttributes" ), {
                            id: "visual-element-" + this.id,
                            "data-layer_id": this.id
                        });
                    }.bind( this )
                });
                // listen to visual element events
                this.on( "visual_ready", this.onVisualReady, this );
                this.on( "visual_error", this.onVisualError, this );
            } else {
                this.ready = true;
                this.state = "error";
                console.log( "could not find valid layer type: ", this.get("type") );
            }
        },

        
        render: function() {
            // make sure the layer class is loaded or fail gracefully
            if ( this.visualElement ) {
                // if the layer is ready, then just show it
                if ( this.state == "waiting") {
                    this.state = "loading";
                    this.status.emit("layer_loading", this.toJSON());
                    this.visualElement.player_onPreload();
                } else if( this.state == "ready" ) {
                    this.visualElement.play();
                }
            } else {
                console.log("***    The layer "+ this.get("type") +" is missing. ): ", this.id);
            }
        },

        onVisualReady: function() {
            this.ready = true;
            this.state = "ready";
            this.trigger("layer_ready", this.toJSON());
        },

        onVisualError: function() {
            this.ready = true;
            this.state = "error";
            this.trigger("layer_error", this.toJSON());
        },

        updateZIndex: function(z) {
            this.visualElement.updateZIndex(z);
        },

        pause: function() {
            this.visualElement.player_onPause();
        },

        play: function() {
            this.visualElement.player_onPlay();
        },

        exit: function() {
            if ( this.layerClass ) {
                this.visualElement.player_onExit();
            }
        },

        remove: function() {
            if ( this.layerClass ) {
                this.visualElement.remove();
            }
        },

        // removes the layer. destroys players, removes from dom, etc
        destroy: function() {
            // do not attempt to destroy if the layer is waiting or destroyed
            if ( this.state != "waiting" && this.state != "destroyed" ) {
                this.state = "destroyed";
            }
        }

    });

    Layer.Collection = Zeega.Backbone.Collection.extend({
        model: LayerModel
    });

    return Layer;
});
