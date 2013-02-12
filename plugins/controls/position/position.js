define([
    "app",
    "zeega_parser/modules/control.view"
],

function( Zeega, ControlView ) {

    return {
        position: ControlView.extend({

            template: "position/pos",

            initialize: function() {
                console.log('init control view', this);
            },

            serialize: function() {
                return this.model.toJSON();
            }

        })
    };


});
