// layer.js
define([
    "app",
    "zeega_parser/plugins/controls/_all-controls"
],

function( app, Controls ) {

    return app.Backbone.LayoutView.extend({

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
            this.model.on("blur", this.onBlur, this );

            this.listenToFrame = _.once(function() {
                this.model.collection.frame.on("focus", this.editor_onLayerEnter, this );
                this.model.collection.frame.on("blur", this.editor_onLayerExit, this );
            }.bind( this ));
        },

        events: {},
        editorEvents: {
            "click": "onClick"
        },

        onClick: function() {
            app.status.setCurrentLayer( this.model );
        },

        /* editor fxns */
        enterEditorMode: function() {
            this.listenToFrame();

            // this.loadControls();
            this.delegateEvents( _.extend( this.events, this.editorEvents ));
        },

        listenToFrame: null,

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
                    // this.insertView( ".controls-inline", control );
                }
            }, this );
        },

        beforePlayerRender: function() {},
        // beforeRender: function() {
        //     // working from _layer
        //     var target = this.model.status.target ? this.model.status.target.find(".ZEEGA-player-window") :
        //                                 $(".ZEEGA-workspace");

        //     this.className = this._className + " " + this.className;
        //     this.beforePlayerRender();

        //     target.append( this.el );
        //     //Zeega.$( target ).append( this.el );

        //     this.$el.addClass( "visual-element-" + this.model.get("type").toLowerCase() );
        //     this.moveOffStage();
        //     this.applyStyles();
        // },

        beforeRender: function() {
            if ( this.model.mode == "player") {
                var target = this.model.status.target ? this.model.status.target.find(".ZEEGA-player-window") :
                                            $(".ZEEGA-workspace");

                this.className = this._className + " " + this.className;
                this.beforePlayerRender();

                target.append( this.el );
                //Zeega.$( target ).append( this.el );

                this.$el.addClass( "visual-element-" + this.model.get("type").toLowerCase() );
                this.moveOffStage();
                this.applyStyles();
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
                this.loadControls();
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

        // default verify fxn. return ready immediately
        verifyReady: function() {
            this.model.trigger("visual_ready", this.model.id );
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

        player_onPreload: function() {
            this.render();
        },

        glowOnFrameStart: function() {
            this.model.visual.$el.addClass("glow-blink");
            _.delay(function() {
                this.model.visual.$el.removeClass("glow-blink");
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
 
            path = app.parserPath + "plugins/layers/"+ path + ".html";
            // If cached, use the compiled template.
            if ( JST[ path ] ) {
                return JST[ path ];
            } else {
                // Put fetch into `async-mode`.
                done = this.async();
                // Seek out the template asynchronously.
                return Zeega.$.ajax({ url: Zeega.root + path }).then(function( contents ) {
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
