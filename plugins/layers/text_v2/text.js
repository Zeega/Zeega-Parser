define([
    "app",
    "zeega_parser/modules/layer.model",
    "zeega_parser/modules/layer.visual.view",
    "zeega_parser/plugins/layers/text_v2/textmodal"
],
function( app, _Layer, Visual, TextModal ) {

    var Layer = app.module();

    Layer.TextV2 = _Layer.extend({
        // TODO: is the redundant naming necessary? If this program knows
        // this is a Layer, wouldn't "type" be sufficient?
        layerType: "TextV2",

        attr: {
            citation: false,
            color: "#FFF",
            content: "text",
            fontSize: 100,
            fontFamily: "Archivo Black",
            default_controls: true,
            left: 12.5,
            opacity: 1,
            title: "Text Layer",
            top: 40,
            width: 75,
            dissolve: true,

            bold: false,
            italic: false,
            textAlign: "left",
            lineHeight: 1,
            mobileTextPosition: "middle" // top, middle, bottom
        },

        controls: [
            "position",
            {
                type: "resize",
                options: {
                    aspectRatio: false,
                    handles: "se"
                }
            },
            { type: "slider",
                options: {
                    title: "<i class='icon-eye-open icon-white'></i>",
                    propertyName: "opacity",
                    min: 0,
                    max: 1,
                    step: 0.001,
                    css: true
                }
            }
        ],

        fontList: [
            "Allerta Stencil",
            "Antic",
            "Archivo Black",
            "Arial",
            "Bilbo Swash Caps",
            "Cabin Sketch",
            "Codystar",
            "Cutive Mono",
            "Dosis",
            "Ewert",
            "Fascinate",
            "Faster One",
            "Finger Paint",
            "Georgia",
            "Great Vibes",
            "Londrina Outline",
            "Londrina Sketch",
            "Monofett",
            "Montserrat",
            "New Rocker",
            "Nobile",
            "Nova Mono",
            "Orbitron",
            "Sorts Mill Goudy",
            "Poiret One",
            "Pontano Sans",
            "Trocchi",
            "Ultra",
            "Verdana",
            "Wendy One",
            "Yellowtail"
        ]
    });

    Layer.TextV2.Visual = Visual.extend({

        textModal: null,
        transforming: false,

        template: "text_v2/text-v2",

        init: function() {
            // if ( app.attributes.mobile ) {
            //     window.onorientationchange = function(){ this.moveOnStage(); }.bind(this);
            // }
        },

        visualProperties: [
            "top",
            "left",
            "width",
            "opacity",
            "lineHeight"
        ],

        serialize: function() {
            return this.model.toJSON();
        },

        saveContent: null,

        applyStyles: function() {
            if ( app.attributes.mobile ) {
                this.$el.css({
                    width: (window.innerWidth - 60 ) + "px",
                    left: 0,
                    right: 0,
                    margin: "auto"
                });
            } else {
                this.$el.css({
                    left: this.getAttr("left") + "%",
                    width: this.getAttr("width") + "%"
                });
            }
        },

        moveOnStage: function() {
            var css = {};

            if ( app.attributes.mobile ) {
                var zHeight = $(".ZEEGA-player-window").height(),
                    zWidth = $(".ZEEGA-player-window").width();

                if ( this.getAttr("mobileTextPosition") == "middle" ) {
                   var heightPercent = this.$el.height() / window.innerHeight; // middle
                   
                   css.top = (50 - heightPercent * 100 / 2) + "%";
                    
                } else if ( this.getAttr("mobileTextPosition") == "top" ) {
                    var marginTop = (zHeight - window.innerHeight) / 2;

                    css.top = (marginTop + 30) + "px";
                } else {
                    // bottom
                    var marginBottom = (zHeight - window.innerHeight) / 2;

                    css.top = "auto";
                    css.bottom = (marginBottom + 30) + "px";
                }

                _.extend( css, {
                    width: window.innerWidth - 30 + "px",
                    left: 0,
                    right: 0,
                    margin: "auto",
                    color: this.model.get("attr").color,
                    fontWeight: this.model.getAttr("bold") ? "bold" : "normal",
                    fontStyle: this.model.getAttr("italic") ? "italic" : "normal",
                    fontFamily: this.model.getAttr("fontFamily"),
                    fontSize: this.model.getAttr("fontSize") + "%",
                    textAlign: this.model.getAttr("textAlign"),
                    lineHeight: this.model.getAttr("lineHeight") + "em"
                });

                this.$el.css(css );
            } else {
                this.$el.css({
                    top: this.getAttr("top") + "%",
                    left: this.getAttr("left") + "%"
                });
            }

        },

        // ## TODO Simplify this - 5/3/2013
        updateStyle: function() {
            var css = {
                color: this.model.get("attr").color,
                fontWeight: this.model.getAttr("bold") ? "bold" : "normal",
                fontStyle: this.model.getAttr("italic") ? "italic" : "normal",
                fontFamily: this.model.getAttr("fontFamily"),
                fontSize: this.model.getAttr("fontSize") + "%",
                textAlign: this.model.getAttr("textAlign"),
                lineHeight: this.model.getAttr("lineHeight") + "em"
            };

            this.$(".visual-target")
                .css( css )
                .text( this.model.getAttr("content") );

            this.$el.css( css );
        },

        afterEditorRender: function() {

            if ( this.textModal === null ) {
                this.textModal = new TextModal({ model: this.model });
            }

            this.$(".visual-target").css({
                color: this.model.get("attr").color,
                fontSize: this.model.get("attr").fontSize + "%",
                fontFamily: this.model.get("attr").fontFamily
            });

            this.$el.unbind("mouseup");

            this.$el.bind("mouseup", function() {

                if ( !this.transforming ) {
                    $("body").append( this.textModal.el );
                    this.textModal.render();
                }

            }.bind( this ));

            this.on("sync", function() {
                this.updateStyle();
            });
        },

        convertToPercents: function( top, left ) {
            this.$el.css({
                top: top + "%",
                left: left + "%"
            });
        },

        lazyUpdate: _.debounce(function( value ) {
            var attr = {};
            
            attr[ this.propertyName ] = value;
            this.model.saveAttr( attr );
        }, 500 ),

        beforePlayerRender: function() {
            this.updateStyle();
        }
  });

  return Layer;
});
