define([
    "app",
    "zeega_parser/modules/control.view",
    "jqueryUI"
],

function( Zeega, ControlView ) {

    return {
        dropdown: ControlView.extend({

            template: "dropdown/dropdown",

            serialize: function() {
                return _.extend({}, this.model.toJSON(), this._userOptions );
            },

            create: function() {
                this.$("select").val( this.getAttr( this.propertyName ) );
            },

            events: {
                "change select": "onChange"
            },

            onChange: function( e ) {
                var attr = {};

                attr[ this.propertyName ] = this.$("select").val();
                this.update( attr );
                this.updateVisual( this.$("select").val() + this._userOptions.units );
            }

        })
    };


});
