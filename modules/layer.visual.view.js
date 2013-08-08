// layer.js
define([
    "app",
    "engine/plugins/controls/_all-controls"
],

function( app, Controls ) {

    return app.Backbone.Layout.extend({

        className: function() {
            return "visual-element visual-" + this.model.get("type").toLowerCase();
        },

        template: "",
        controls: [],
        _allowedControls: [ "resize", "position" ],
        $visual: null,

        listenToFrame: null,

        initialize: function() {
            this.init();

            if ( this.model.zeega.get("mode") == "editor" ) {
                this.model.off("blur focus");
                this.model.on("focus", this.onFocus, this );
                this.model.on("blur", this.onBlur, this );

                this.listenToFrame = _.once(function() {
                    this.model.collection.page.on("focus", this.editor_onLayerEnter, this );
                    this.model.collection.page.on("blur", this.editor_onLayerExit, this );
                }.bind( this ));
            }
        },

        afterInit: function() {
            if ( this.model.zeega.get("mode") == "editor" ) {
                this.listenToFrame();

                // this.loadControls();
                this.delegateEvents( _.extend( this.events, this.editorEvents ));
            } else if ( this.model.zeega.get("mode") == "player" ) {

            }
        },

        events: {},
        editorEvents: {
            "click": "onClick"
        },

        onClick: function() {
            if ( this.model.zeega.get("mode") == "editor") {
                app.zeega.setCurrentLayer( this.model );
            }
        },

        onFocus: function() {
            this.$el.addClass('active');
        },

        onBlur: function() {
            this.$el.removeClass('active');
        },

        loadControls: function() {
            _.each( this.model._controls, function( control ) {
                if ( _.contains( this._allowedControls, control.type ) ) {
                    this.$(".controls-inline").append( control.el );
                    control.render();
                }
            }, this );
        },

        beforePlayerRender: function() {},

        beforeRender: function() {

            console.log("&& before VIZ render", this.model.zeega.cid , this.model.zeega.get("mode"), this.model );
            if ( this.model.zeega.get("mode") == "player") {
                this.className = this._className + " " + this.className;
                this.beforePlayerRender();

                this.model.getTarget().append( this.el );

                this.$el.addClass( "visual-element-" + this.model.get("type").toLowerCase() );
                this.moveOffStage();
                this.applyStyles();
            } else if ( this.model.zeega.get("mode") == "editor") {

            }
            this.visualBeforeRender();
        },

        $workspace: function() {
            return this.$el.closest(".ZEEGA-workspace");
        },

        afterRender: function() {
            this.$visual = this.$(".visual-target");

            if ( this.model.zeega.get("mode") == "player") {
                this.verifyReady();
                this.afterPlayerRender();
            } else if ( this.model.zeega.get("mode") == "editor") {
                this.loadControls();
                this.afterEditorRender();
            }
            this.applyVisualProperties();
            this.visualAfterRender();
        },

        applyStyles: function() {
            this.$el.css({
                height: this.getAttr("height") + "%", // photos need a height!
                width: this.getAttr("width") + "%"
            });
        },

        units: {
            height: "%",
            width: "%"
        },

        containerAttributes: ["height", "width"],

        applyVisualProperties: function() {
            var mediaTargetCSS = {},
                containerCSS = {};
            _.each( this.visualProperties, function( prop ) {
                if ( _.contains( this.containerAttributes, prop ) ) {
                    containerCSS[ prop ] = this.getAttr( prop ) + ( this.units[ prop ] ? this.units[ prop ] : "" );
                } else {
                    mediaTargetCSS[ prop ] = this.getAttr( prop ) + ( this.units[ prop ] ? this.units[ prop ] : "" );
                }
            }, this );
            this.$el.css( containerCSS );
            this.$(".visual-target").css( mediaTargetCSS );
        },

        afterEditorRender: function() {},
        afterPlayerRender: function() {},

        // default verify fxn. return ready immediately
        verifyReady: function() {
            this.model.trigger("layer layer:visual_ready", this.model );
        },

        player_onPlay: function() {
            this.onPlay();
        },

        player_onPause: function() {
            this.onPause();
        },

        player_onExit: function() {
            this.pause();
            this.moveOffStage();
            this.onExit();
        },

        player_onUnrender: function() {},
        player_onRenderError: function() {},

        onPreload: function() {},
        onPlay: function() {},
        onPause: function() {},
        onExit: function() {},

        player_onPreload: function() {
            this.render();
        },

        updateZIndex: function( zIndex ) {
            this.$el.css("z-index", zIndex );
        },

        editor_onLayerEnter: function() {},
        editor_onLayerExit: function() {},
        editor_onControlsOpen: function() {},
        editor_onControlsClosed: function() {},

        moveOffStage: function() {
            this.$el.css({
                top: "-1000%",
                left: "-1000%"
            });
        },

        moveOnStage: function() {
            this.$el.css({
                top: this.getAttr("top") + "%",
                left: this.getAttr("left") + "%"
            });
        },

        play: function() {
            this.isPlaying = true;
            this.moveOnStage();
            this.player_onPlay();
        },

        pause: function() {
            this.isPlaying = false;
            this.player_onPause();
        },

        playPause: function() {
            if ( this.isPlaying !== false ) {
                this.isPlaying = false;
                this.player_onPause();
            } else {
                this.isPlaying = true;
                this.player_onPlay();
            }
        },

        // convenience fxn
        getAttr: function( key ) {
            return this.model.get("attr")[key];
        },

        update: function( attributes ) {
            this.model.save( attributes );
        },

        /* user endpoints */

        init: function() {},
        visualBeforeRender: function() {},
        visualAfterRender: function() {},

        fetch: function( path ) {
            // Initialize done for use in async-mode
            var done;
 
            path = "app/engine/plugins/layers/"+ path + ".html";

            // If cached, use the compiled template.
            if ( JST[ path ] ) {
                return JST[ path ];
            } else {
                // Put fetch into `async-mode`.
                done = this.async();
                // Seek out the template asynchronously.
                return app.$.ajax({ url: path }).then(function( contents ) {
                    done(
                      JST[ path ] = _.template( contents )
                    );
                });
            }
        },

        serialize: function() {
            return this.model.toJSON();
        }

    });

});
