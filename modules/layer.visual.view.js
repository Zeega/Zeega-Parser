// layer.js
define([
    "app",
    "zeega_parser/plugins/controls/_all-controls"
],

function( Zeega, Controls ) {

    return Zeega.Backbone.View.extend({

        className: function() {
            return "visual-element visual-" + this.model.get("type").toLowerCase();
        },

        template: "",
        controls: [],

        initialize: function() {
            this.init();
        },

        /* editor fxns */

        enterEditorMode: function() {
            this.loadControls();
        },

        loadControls: function() {
            this.controls = _.map( this.model.controls, function( controlName ) {
                if ( Controls[ controlName ] ) {
                    var control = new Controls[ controlName ]({ model: this.model });

                    this.insertView( control );
                    return control;
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
            this.applyVisualProperties();
            this.visualBeforeRender();
        },

        afterRender: function() {
            if ( this.model.mode == "player") {
                this.verifyReady();
            } else if ( this.model.mode == "editor") {
                this.makeDraggable();
            }
            this.visualAfterRender();
        },

        units: {
            height: "%",
            width: "%"
        },

        applyVisualProperties: function() {
            var css = {};

            _.each( this.visualProperties, function( prop ) {
                css[ prop ] = this.getAttr( prop ) + ( this.units[ prop ] ? this.units[ prop ] : "" );
            }, this );
            this.$el.css( css );
        },

        makeDraggable: function() {
            if ( this.model.editorProperties.draggable ) {
                this.$el.draggable({
                    stop: function( e, ui ) {
                        var workspace = this.$el.closest(".ZEEGA-workspace");

                        this.model.save({
                            top: ui.position.top / workspace.height(),
                            left: ui.position.left / workspace.width()
                        }/*, { patch: true }*/);

                    }.bind( this )
                });
            }
        },


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

        updateZIndex: function( z ) {
            this.$el.css("z-index", z);
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
                left: this.getAttr("left") + "%",
                opacity: this.getAttr("dissolve") ? 0 : this.getAttr("opacity") || 1
            });
            if ( this.getAttr("dissolve") ) {
                this.$el.animate({ "opacity": this.getAttr("opacity") }, 500 );
            }

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

        /* user endpoints */

        init: function() {},
        visualBeforeRender: function() {},
        visualAfterRender: function() {},

        fetch: function( path ) {
            // Initialize done for use in async-mode
            var done;
            // Concatenate the file extension.
            path = Zeega.parserPath + "plugins/layers/" + path + ".html";
            // remove app/templates/ via regexp // hacky? yes. probably.
            path = path.replace("app/templates/","");

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
