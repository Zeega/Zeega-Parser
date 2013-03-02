define([
    "app",
    "zeega_parser/modules/control.view",
    "jqueryUI"
],

function( Zeega, ControlView ) {

    return {
        checkbox: ControlView.extend({

            //propertyName: "checkbox", // autoset
            
            template: "checkbox/checkbox",

            serialize: function() {
                console.log('CB', _.extend({}, this.model.toJSON(), this._userOptions ), this._userOptions );
                return _.extend({}, this.model.toJSON(), this._userOptions );
            },

            create: function() {
                this.$("input").attr("checked", this.model.getAttr( this.propertyName ) );
            },

            events: {
                "change input": "onChange"
            },

            onChange: function() {
                var attr = {};

                attr[ this.propertyName ] = this.$("input").is(":checked");
                this.update( attr );
            }

        })
    };


});
