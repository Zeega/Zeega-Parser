define([
    "app",
    "backbone"
],

function( app ) {

    return Backbone.View.extend({

        template: "app/engine/modules/askers/asker",
        className: "ZEEGA-asker asker-overlay",

        serialize: function() {
            return this.model.toJSON();
        },

        start: function() {
            $("body").append( this.el );
            $("#main").addClass("modal");
            this.render();
            this.$el.fadeIn("fast");
        },

        afterRender: function() {
            $("body").bind("keyup.asker", function( e ) {
                if ( e.which == 13 ) { //enter
                    this.okay();
                } else if ( e.which == 27 ) { // esc
                    this.cancel();
                }
            }.bind( this ));
        },

        events: {
            "click .ask-cancel": "cancel",
            "click .ask-okay": "okay"
        },

        cancel: function() {
            this.model.set("response", false );
            this.close();
        },

        okay: function() {
            this.model.set("response", true );
            this.close();
        },

        close: function() {
            $("#main").removeClass("modal");
            this.$el.fadeOut( 250, function() {
                this.remove();
            }.bind( this ));
            $("body").unbind("keyup.asker");
        }

    });

});
