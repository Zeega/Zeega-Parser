define([
    "app",
    "simpleColorPicker"
],

function( app ) {

    return app.Backbone.View.extend({

        template: "text_v2/textmodal",
        serialize: function() {
            return this.model.toJSON();
        },

        saveContent: null,

        className: "text-modal overlay-dimmer ZEEGA-modal",

        initialize: function() {
            this.saveContent = _.debounce(function() {
                this.model.saveAttr({ content: this.$("textarea").val() });
                this.updateSample();
            }, 1000);
        },

        afterRender: function() {
            var $colorPicker = this.$(".simple-color");

            $colorPicker
                .simpleColor({
                    livePreview: true,
                    onCellEnter: function( hex ) {
                        this.$(".text-sample")
                            .css({
                                color: "#" + hex,
                            });
                    }.bind( this ),
                    // onClose: function() {
                    //     this.onChange();
                    // }.bind( this ),
                    callback: function( hex ) {
                        this.onChangeColor( hex );
                    }.bind( this )
                });

            $("#main").addClass("modal");
            this.loadFonts();
            this.loadSize();
            this.setButtonStates();

            this.updateSample();
        },

        events: {
            "click .modal-close": "closeThis",
            "click .submit": "submit",
            "click .text-btn-italic": "toggleItalics",
            "click .text-btn-bold": "toggleBold",

            "keypress textarea": "onKeypress",
            "change .size-list": "onChangeSize",
            "change .font-list": "onChangeFont",
            "click .text-btn-align-left": "toggleAlignLeft",
            "click .text-btn-align-center": "toggleAlignCenter",
            "click .text-btn-align-right": "toggleAlignRight"
        },

        onChangeColor: function( hex ) {
            this.model.saveAttr({ color: hex });
            this.updateSample();
        },

        onChangeSize: function( e ) {
            console.log("change size:", $( e.target ).val() );
            this.model.setAttr({ fontSize: $( e.target ).val() });

            this.model.saveAttr({ fontSize: $( e.target ).val() });
        },

        onChangeFont: function( e ) {
            this.model.saveAttr({ fontFamily: $( e.target ).val() });
            this.updateSample();
        },

        toggleItalics: function() {
            var italic = this.model.getAttr("italic");

            this.model.saveAttr({ italic: !italic });
            this.updateSample();
            this.setButtonStates();
        },

        toggleAlignLeft: function() {
            this.model.saveAttr({ textAlign: "left" });
            this.updateSample();
            this.setButtonStates();
        },

        toggleAlignCenter: function() {
            this.model.saveAttr({ textAlign: "center" });
            this.updateSample();
            this.setButtonStates();
        },

        toggleAlignRight: function() {
            this.model.saveAttr({ textAlign: "right" });
            this.updateSample();
            this.setButtonStates();
        },

        toggleBold: function() {
            var bold = this.model.getAttr("bold");

            this.model.saveAttr({ bold: !bold })
            this.updateSample();
            this.setButtonStates();
        },

        onKeypress: function( e ) {
            console.log(e.which)

            this.saveContent();
        },

        closeThis: function() {
            $("#main").removeClass("modal");
            this.$el.fadeOut(function() {
                this.$el.attr("style", "");
                this.remove();
            }.bind( this ));
        },

        submit: function() {
            if ( this.selectedFrame !== null ) {
                this.model.saveAttr({ to_frame: this.selectedFrame });
                this.model.trigger("change:to_frame", this.model, this.selectedFrame );
            }
            this.closeThis();
            this.updateVisualElement();
        },

        loadFonts: function() {
            this.$(".font-list").empty();
            _.each( this.model.fontList, function( fontName ) {
                this.$(".font-list").append("<option value='" + fontName + "'>" + fontName + "</option>");
            }, this );
            this.$(".size-list").val( this.model.getAttr("fontFamily") );
        },

        loadSize: function() {
            this.$(".size-list").val( this.model.getAttr("fontSize") );
        },

        setButtonStates: function() {
            this.$(".active").removeClass("active");

            this.$(".text-btn-bold").addClass( this.model.getAttr("bold") ? "active" : "" )
            this.$(".text-btn-italic").addClass( this.model.getAttr("italic") ? "active" : "" )
            this.$(".text-btn-align-left").addClass( this.model.getAttr("textAlign") == "left" ? "active" : "" )
            this.$(".text-btn-align-center").addClass( this.model.getAttr("textAlign") == "center" ? "active" : "" )
            this.$(".text-btn-align-right").addClass( this.model.getAttr("textAlign") == "right" ? "active" : "" )
        },

        updateSample: function() {
            this.$(".text-sample")
                .css({
                    color: "#" + this.model.getAttr("color"),
                    fontWeight: this.model.getAttr("bold") ? "bold" : "normal",
                    fontStyle: this.model.getAttr("italic") ? "italic" : "normal",
                    fontFamily: this.model.getAttr("fontFamily"),
                    textAlign: this.model.getAttr("textAlign"),
                    // fontSize: this.model.getAttr("fontSize") + "%"
                })
                .text( this.model.getAttr("content") );
            this.updateVisualElement();
        },

        updateVisualElement: function() {
            this.model.visual.updateStyle();
        },

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
        }
    });

});