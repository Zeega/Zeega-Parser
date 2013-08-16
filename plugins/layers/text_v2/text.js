define([
    "app",
    "engine/modules/layer.model",
    "engine/modules/layer.visual.view",
    "engine/plugins/layers/text_v2/textmodal"
],
function( app, _Layer, Visual, TextModal ) {

    var Layer = {};

    Layer.TextV2 = _Layer.extend({
        // TODO: is the redundant naming necessary? If this program knows
        // this is a Layer, wouldn't "type" be sufficient?
        layerType: "TextV2",

        attr: {
            citation: false,
            color: "#FFF",
            content: "",
            fontSize: 200,
            fontFamily: "Archivo Black",
            default_controls: true,
            left: 12.5,
            opacity: 1,
            title: "Text Layer",
            top: 40,
            width: 75,
            dissolve: true,
            to_frame: null,

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
                    handles: "e"
                }
            },
            { type: "slider",
                options: {
                    title: "opacity",
                    propertyName: "opacity",
                    min: 0,
                    max: 1,
                    step: 0.001,
                    css: true
                }
            },{
                type: "color",
                options: {
                    title: "color",
                    propertyName: "color"
                }
            },{
                type: "dropdown",
                options: {
                    title: "font size",
                    propertyName: "fontSize",
                    units: "%",
                    optionList: [
                        { title: "8", value: 100 },
                        { title: "10", value: 125 },
                        { title: "12", value: 150 },
                        { title: "14", value: 175 },
                        { title: "18", value: 200 },
                        { title: "24", value: 250 },
                        { title: "36", value: 375 },
                        { title: "48", value: 500 },
                        { title: "72", value: 800 },
                        { title: "144", value: 1600 },
                        { title: "200", value: 2400 },
                        { title: "300", value: 3600 }
                    ]
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
            "Impact",
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

        visualProperties: [
            "top",
            "left",
            "width",
            "opacity",
            "lineHeight"
        ],

        init: function() {
            this.model.off("resized");
            this.model.on("resized", this.onResize, this );
        },

        onResize: function() {
            this.$el.css({ height: "auto"});
        },

        serialize: function() {
            return this.model.toJSON();
        },

        saveContent: null,

        applyStyles: function() {

            this.$el.css({
                left: this.getAttr("left") + "%",
                width: this.getAttr("width") + "%"
            });
        },

        moveOnStage: function() {
            var css = {};

            this.$el.css({
                top: this.getAttr("top") + "%",
                left: this.getAttr("left") + "%"
            });

            if ( !_.isNull( this.getAttr("to_frame")) && !_.isUndefined ( this.getAttr("to_frame") ) ) {
                this.$el.addClass("linked-layer link-reveal");
                setTimeout(function() {
                    this.$el.removeClass("link-reveal");
                }.bind( this ), 750 );
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
        },

        afterEditorRender: function() {
            if ( this.textModal === null ) {
                this.textModal = new TextModal({ model: this.model });
                if ( this.model.get("attr").content === "" ) {
                    this.launchTextModal();
                }
            }

            this.$(".visual-target").css({
                color: this.model.get("attr").color,
                fontSize: this.model.get("attr").fontSize + "%",
                fontFamily: this.model.get("attr").fontFamily
            });

            this.on("sync", function() {
                this.updateStyle();
            });
        },

        launchTextModal: function() {
            if ( !this.transforming && this.model.zeega.get("mode") == "editor" ) {
                $("body").append( this.textModal.el );
                this.textModal.render();
            }
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
            var css = {
                color: this.model.get("attr").color,
                fontWeight: this.model.getAttr("bold") ? "bold" : "normal",
                fontStyle: this.model.getAttr("italic") ? "italic" : "normal",
                fontFamily: this.model.getAttr("fontFamily"),
                fontSize: this.model.getAttr("fontSize") + "%",
                textAlign: this.model.getAttr("textAlign"),
                lineHeight: this.model.getAttr("lineHeight") + "em"
            };
            this.$el.css( css );
        },

        events: {
            "mousedown": "onMouseDown",
            "mouseup": "onMouseUp"
        },

        mousedown: false,

        onMouseDown: function() {
            this.mousedown = true;
        },

        onMouseUp: function() {
            if ( this.mousedown ) {
                this.launchTextModal();
                if ( this.model.zeega.get("mode") == "editor" ) {
                    app.zeega.setCurrentLayer( this.model );
                }
            }
            this.mousedown = false;
        }
  });

  return Layer;
});
