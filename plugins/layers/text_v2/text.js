define([
    "app",
    "zeega_parser/modules/layer.model",
    "zeega_parser/modules/layer.visual.view",
    "zeega_parser/plugins/layers/text_v2/textmodal"
],
function( Zeega, _Layer, Visual, TextModal ) {

    var Layer = Zeega.module();

    Layer.TextV2 = _Layer.extend({
        // TODO: is the redundant naming necessary? If this program knows
        // this is a Layer, wouldn't "type" be sufficient?
        layerType: "TextV2",

        attr: {
            citation: false,
            color: "#FFF",
            content: "text",
            fontSize: 200,
            fontFamily: "Archivo Black",
            default_controls: true,
            left: 30,
            opacity: 1,
            title: "Text Layer",
            top: 40,
            width: 25,
            dissolve: true,

            bold: false,
            italic: false,
            textAlign: "left"
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
        ],
    });

    Layer.TextV2.Visual = Visual.extend({

        textModal: null,

        template: "text_v2/text",

        visualProperties: [
            "top",
            "left",
            "width",
            "opacity"
        ],

        serialize: function() {
            return this.model.toJSON();
        },

        saveContent: null,

        updateStyle: function() {
            console.log("update style", this.model.getAttr("content"), this.model.toJSON() )
            this.$(".visual-target").text( this.model.getAttr("content") );
            
            this.$el.css({
                    color: "#" + this.model.get("attr").color,
                    fontWeight: this.model.getAttr("bold") ? "bold" : "normal",
                    fontStyle: this.model.getAttr("italic") ? "italic" : "normal",
                    fontFamily: this.model.getAttr("fontFamily"),
                    fontSize: this.model.getAttr("fontSize") + "%",
                    textAlign: this.model.getAttr("textAlign")
                });
                
        },

        afterEditorRender: function() {

            if ( this.textModal === null ) {
                this.textModal = new TextModal({ model: this.model });
            }

            this.$el.css({
                color: "#" + this.model.get("attr").color,
                fontSize: this.model.get("attr").fontSize + "%",
                fontFamily: this.model.get("attr").fontFamily
            });

            this.$el.click(function() {
                console.log("launch text modal");
                $("body").append( this.textModal.el );
                this.textModal.render();

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
        }, 500 )
  });

  return Layer;
});
