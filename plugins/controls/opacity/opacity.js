define([
    "app",
    "zeega_parser/modules/control.view"
],

function( Zeega, ControlView ) {

    return {
        opacity: ControlView.extend({

            template: "opacity/opacity",

            initialize: function() {
//                console.log('init control view', this);
            },

            serialize: function() {
                return this.model.toJSON();
            }

        })
    };


});
