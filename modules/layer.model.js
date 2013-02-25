// layer.js
define([
    "app"
],

function( app ) {

    return app.Backbone.Model.extend({
        ready: false,
        state: "waiting", // waiting, loading, ready, destroyed, error

        mode: "player",
        order: [],
        controls: [],
        visual: null,

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
                return app.api + "projects/" + app.project.id + "/layers";
            } else {
                return app.api + "layers/" + this.id;
            }
        },

        initialize: function() {
            var augmentAttr = _.defaults( this.toJSON().attr, this.attr );

            this.set("attr", augmentAttr );
            this.order = {};
        },

        getAttr: function( attrName ) {
            return this.get("attr")[ attrName ];
        },

        setAttr: function( attrObj ) {
            var attr = this.get("attr");

            this.set("attr", _.extend( attr, attrObj ) );
        },

        saveAttr: function( attrObj ) {
            var attr = this.get("attr");

            this.save("attr", _.extend( attr, attrObj ) );
        },

        initVisual: function( layerClass ) {
            this.visual = new layerClass.Visual({
                model: this,
                attributes: {
                    "data-id": this.id
                }
            });
        },

        addCollection: function( collection ) {
            this.collection = collection;
            this.collection.on("sort", this.onSort, this );
        },

        // when the parent collection is resorted as in a layer shuffle
        onSort: function( collection ) {

            var zIndex = this.order[ collection.frame.id ];
            this.updateZIndex( zIndex );
        },

        editorCleanup: function() {
            // there should probably be more done here
            this.visual.remove();
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

        updateZIndex: function( zIndex ) {
            this.visual.updateZIndex( zIndex );
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
