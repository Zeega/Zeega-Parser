// layer.js
define([
    "app"
],

function( Zeega, Layers ) {

    return Zeega.Backbone.Model.extend({
        ready: false,
        state: "waiting", // waiting, loading, ready, destroyed, error

        mode: "player",
        order: [],
        controls: [],

        editorProperties: {
            draggable: true
        },

        defaults: {
            attr: {},
            id: null,
            project_id: null,
            type: null
        },

        url: function() {
            if ( this.isNew() ) {
                return Zeega.api + "projects/" + projectId + "/layers" + this.id;
            } else {
                return Zeega.api + "layers/" + this.id;
            }
        },

        initialize: function() {
            var augmentAttr = _.defaults( this.toJSON().attr, this.attr );

            this.set("attr", augmentAttr );
            
            // var layerClass = LayerPlugin[ this.get("type") ];

            // // init link layer type inside here
            // if ( layerClass ) {
            //     var newAttr;

            //     this.layerClass = new layerClass();

            //     newAttr = _.defaults( this.toJSON().attr, this.layerClass.attr );

            //     this.set({ attr: newAttr });

            //     // create and store the layerClass
            //     this.visual = new layerClass.Visual({
            //         model: this,
            //         attributes: function() {
            //             return _.extend( {}, _.result( this, "domAttributes" ), {
            //                 id: "visual-element-" + this.id,
            //                 "data-layer_id": this.id
            //             });
            //         }.bind( this )
            //     });
            //     // listen to visual element events
            //     this.on( "visual_ready", this.onVisualReady, this );
            //     this.on( "visual_error", this.onVisualError, this );
            // } else {
            //     this.ready = true;
            //     this.state = "error";
            //     console.log( "could not find valid layer type: ", this.get("type") );
            // }
        },

        render: function() {
            // make sure the layer class is loaded or fail gracefully
            if ( this.visual ) {
                // if the layer is ready, then just show it
                if ( this.state == "waiting") {
                    this.state = "loading";
                    this.status.emit("layer_loading", this.toJSON());
                    this.visual.player_onPreload();
                } else if( this.state == "ready" ) {
                    this.visual.play();
                }
            } else {
                console.log("***    The layer "+ this.get("type") +" is missing. ): ", this.id);
            }
        },

        // editor mode skips preload and renders immediately
        enterEditorMode: function() {
            this.mode = "editor",
            this.visual.render();
            this.visual.enterEditorMode();
            this.visual.moveOnStage();
        },

        onVisualReady: function() {
            this.ready = true;
            this.state = "ready";
            this.status.emit("layer_ready", this.toJSON() );
            this.trigger("layer_ready", this.toJSON());
        },

        onVisualError: function() {
            this.ready = true;
            this.state = "error";
            this.trigger("layer_error", this.toJSON());
        },

        updateZIndex: function(z) {
            this.visual.updateZIndex(z);
        },

        pause: function() {
            this.visual.player_onPause();
        },

        play: function() {
            this.visual.player_onPlay();
        },

        exit: function() {
            if ( this.layerClass ) {
                this.visual.player_onExit();
            }
        },

        remove: function() {
            if ( this.layerClass ) {
                this.visual.remove();
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

});
