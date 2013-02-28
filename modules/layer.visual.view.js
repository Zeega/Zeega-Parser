// layer.js
define([
    "app",
    "zeega_parser/plugins/controls/_all-controls"
],

function( app, Controls ) {

    return app.Backbone.View.extend({

        className: function() {
            return "visual-element visual-" + this.model.get("type").toLowerCase();
        },

        template: "",
        controls: [],
        _allowedControls: [ "resize", "position" ],
        $visual: null,
        $workspace: null,

        initialize: function() {
            this.init();

            this.model.off("blur focus");
            this.model.on("focus", this.onFocus, this );
            app.on("layersBlur", this.onBlur, this );
        },

        events: {},
        editorEvents: {
            "click": "onClick"
        },

        onClick: function() {
            app.trigger("layersBlur");
            this.model.trigger("focus");
            app.status.set("currentLayer", this.model );
        },

        /* editor fxns */
        enterEditorMode: function() {
            this.loadControls();
            this.delegateEvents( _.extend( this.events, this.editorEvents ));
        },

        onFocus: function() {
            this.$el.addClass('active');
        },

        onBlur: function() {
            this.$el.removeClass('active');
        },

        loadControls: function() {
            this.controls = _.map( this.model.controls, function( controlType ) {

                if ( _.contains( this._allowedControls, controlType ) || _.contains( this._allowedControls, controlType.type ) ) {
                    var control;

                    if ( _.isObject( controlType ) && Controls[ controlType.type ] ) {
                        control = new Controls[ controlType.type ]({ model: this.model, options: controlType.options });
                        this.insertView( ".controls-inline", control );
                    } else if ( Controls[ controlType ] ) {
                        control = new Controls[ controlType ]({ model: this.model });
                        this.insertView( ".controls-inline", control );

                        return control;
                    }
                }
                return false;
            }, this );
            this.controls = _.compact( this.controls );
        },

        beforeRender: function() {
            if ( this.model.mode == "player") {
                this.moveOffStage();
            } else if ( this.model.mode == "editor") {

            }
            this.visualBeforeRender();
        },

        afterRender: function() {
            this.$visual = this.$(".visual-target");
            this.$workspace = this.$el.closest(".ZEEGA-workspace");
            
            if ( this.model.mode == "player") {
                this.verifyReady();
            } else if ( this.model.mode == "editor") {
                this.afterEditorRender();
            }
            this.applyVisualProperties();
            this.visualAfterRender();
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

        // default verify fxn. return ready immediately
        verifyReady: function() {
            this.model.trigger("visual_ready", this.model.id );
        },

        player_onPreload: function() {
            this.render();
        },

        player_onPlay: function() {
            if ( this.getAttr("blink_on_start") ) {
                this.glowOnFrameStart();
            }
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


        glowOnFrameStart: function() {
            this.model.visualElement.$el.addClass("glow-blink");
            _.delay(function() {
                this.model.visualElement.$el.removeClass("glow-blink");
            }.bind( this ), 1000 );
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
                //opacity: this.getAttr("dissolve") ? 0 : this.getAttr("opacity") || 1
            });
            // if ( this.getAttr("dissolve") ) {
            //     this.$el.animate({ "opacity": this.getAttr("opacity") }, 500 );
            // }

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
            // Concatenate the file extension.
            path = app.parserPath + "plugins/layers/" + path + ".html";
            // remove app/templates/ via regexp // hacky? yes. probably.
            path = path.replace("app/templates/","");

            // If cached, use the compiled template.
            if ( JST[ path ] ) {
                return JST[ path ];
            } else {
                // Put fetch into `async-mode`.
                done = this.async();
                // Seek out the template asynchronously.
                return app.$.ajax({ url: app.root + path }).then(function( contents ) {
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
