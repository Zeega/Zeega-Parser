define([
    "app",
    "zeega_parser/modules/control.view"
],

function( Zeega, ControlView ) {

    return {

        textbar: ControlView.extend({

            type: "textbar",
            template: "textbar/textbar",
            propertyName: "textbar",

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

            create: function() {
                this.loadFonts();
                this.setFont();
                this.setSize();
            },

            destroy: function() {
                this.$visualContainer.resizable( "destroy" );
            },

            loadFonts: function() {
                this.$(".font-list").empty();
                _.each( this.fontList, function( fontName ) {
                    console.log("FONT LIST:", fontName )
                    this.$(".font-list").append("<option value='" + fontName + "'>" + fontName + "</option>");
                }, this );
            },

            setFont: function() {
                this.$(".font-list option[value='" + this.getAttr("fontFamily") + "']").prop("selected", true );
            },

            setSize: function() {
                this.$(".size-list option[value='" + this.getAttr("fontSize") + "']").prop("selected", true );
            },

            events: {
                "click .textbar-btn": "btnClick",
                "change .font-list": "changeFont",
                "change .size-list": "changeSize"
            },

            changeFont: function( e ) {
                this.$visual.find('.style-font-family').contents().unwrap();
                this.$visual.wrapInner('<span class="style-font-family" style="font-family:'+ $(e.target).val() +'"/>');
                this.update({ fontFamily : $(e.target).val() });
                this.saveContent();
            },

            changeSize: function( e ) {
                this.model.visual.$el.css( 'fontSize', $(e.target).val() + '%' );
                this.update({ fontSize : $(e.target).val() });
            },

            btnClick: function( e ) {
                var action = $( e.target ).closest("a").data("action");

                this[ action ]();
            },

            bold: function() {
                if( this.$visual.find('.style-bold').length ) {
                    this.$visual.find('.style-bold').contents().unwrap();
                } else {
                    this.$visual.wrapInner('<span class="style-bold" style="font-weight:bold"/>');
                }

                this.saveContent();
            },

            italic: function() {
                if( this.$visual.find('.style-italic').length ) {
                    this.$visual.find('.style-italic').contents().unwrap();
                } else {
                    this.$visual.wrapInner('<span class="style-italic" style="font-style:italic"/>');
                }

                this.saveContent();
            },

            clear: function() {
                var clean = this.getAttr("content").replace(/(<([^>]+)>)/ig, "");

                this.$visual.text( clean );
                this.saveContent();
            },

            saveContent: function() {
                this.lazyUpdate({ content: this.$visual.html() });
            },

            lazyUpdate: _.debounce(function( value ) {
                this.update(value);
            }, 500 )

        }) // end control
    
    }; // end return

});
