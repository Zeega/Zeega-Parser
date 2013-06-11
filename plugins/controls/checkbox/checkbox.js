define([
    "app",
    "engine/modules/control.view",
    "jqueryUI"
],

function( Zeega, ControlView ) {

    return {
        checkbox: ControlView.extend({

            template: "checkbox/checkbox",

            init: function() {
                this.model.on("change:attr", this.heardChange, this );
            },

            heardChange: function( model, attr ) {
                this.render();
            },

            serialize: function() {
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
                if ( this._userOptions.save ) this.update( attr );

                if ( this._userOptions.triggerEvent ) {
                    this.model.trigger( this._userOptions.triggerEvent, attr );
                }
            }

        })
    };


});
