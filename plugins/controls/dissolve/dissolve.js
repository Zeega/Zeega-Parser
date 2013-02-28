define([
    "app",
    "zeega_parser/modules/control.view",
    "jqueryUI"
],

function( Zeega, ControlView ) {

    return {
        dissolve: ControlView.extend({

            propertyName: "dissolve",
            template: "dissolve/dissolve",

            create: function() {
                this.$("input").attr("checked", this.model.getAttr("dissolve") );
            },

            events: {
                "change input": "onChange"
            },

            onChange: function() {
                this.update({ dissolve: this.$("input").is(":checked") });
            }

        })
    };


});
