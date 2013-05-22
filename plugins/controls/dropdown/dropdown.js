define([
    "app",
    "zeega_parser/modules/control.view",
    "jqueryUI"
],

function( Zeega, ControlView ) {

    return {
        dropdown: ControlView.extend({

            //propertyName: "checkbox", // autoset
            
            template: "dropdown/dropdown",

            serialize: function() {
                return _.extend({}, this.model.toJSON(), this._userOptions );
            },

            create: function() {
                // this.$("input").attr("checked", this.model.getAttr( this.propertyName ) );
            },

            events: {
                "change select": "onChange"
            },

            onChange: function() {
                // var attr = {};

                // attr[ this.propertyName ] = this.$("input").is(":checked");
                // this.update( attr );
            }

        })
    };


});
