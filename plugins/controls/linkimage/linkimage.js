define([
    "app",
    "zeega_parser/modules/control.view"
],

function( app, ControlView ) {

    return {
        linkimage: ControlView.extend({

            propertyName: "link_type",
            template: "linkimage/linkimage",

            create: function() {
                this.$(".link-image-select").val( this.getAttr("link_type") );
            },

            events: {
                "change .link-image-select": "changeSelect"
            },

            changeSelect: function() {
                var classes = this.$visualContainer.attr("class");

                classes = classes.replace(/link-type-([a-zA-Z0-9_.])*\S/, "");
                this.$visualContainer.attr("class", classes );
                this.$visualContainer.addClass( "link-type-" + this.$(".link-image-select").val() );
                this.update({ link_type: this.$(".link-image-select").val() });
            }


        })
    };


});
