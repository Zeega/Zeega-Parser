define([
    "app",
    "engine/modules/askers/asker.view",
    "backbone"
],

function( app, AskerView ) {

    return Backbone.Model.extend({

        defaults: {
            question: "",
            description: "",
            response: null,
            okay: null,
            cancel: null
        },

        initialize: function() {
            this.view = new AskerView({ model: this });
            this.view.start();

            this.on("change:response", this.onAnswer, this );
        },

        onAnswer: function( model, answer ) {
            this.off("change:response");
            if ( answer && _.isFunction( this.get("okay"))) {
                this.get("okay")( answer );
            } else if ( !answer && _.isFunction( this.get("cancel"))) {
                this.get("cancel")( answer );
            }
        }

    });
});
