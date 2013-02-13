define([
    "app",
    "zeega_parser/modules/control.view",
    "jqueryUI"
],

function( Zeega, ControlView ) {

    return {
        opacity: ControlView.extend({

            propertyName: "opacity",
            template: "opacity/opacity",

            create: function() {
                var $input = this.$(".text-input");

                this.$(".opacity-slider").slider({
                    orientation: "vertical",
                    range: "min",
                    step: 0.001,
                    min: 0,
                    max: 1,
                    value: this.getAttr("opacity"),

                    slide: function( e, ui ) {
                        this.$visual.css({ opacity: ui.value });
                        this.$(".text-input").val( Math.floor( ui.value * 100 ) );
                    }.bind( this ),
                    
                    stop: function( e, ui) {
                        this.update({ opacity: ui.value });
                    }.bind( this )
                });

                $input.on("keyup", function( e ) {
                    if ( e.which == 13 ) { // enter
                        $input.blur();
                    } else if ( e.which == 27 ) { // esc
                        $input.val( Math.floor( this.getAttr("opacity") * 100 ) );
                        $input.blur();
                    }
                }.bind( this ));

                $input.blur(function() {
                    this.update({ opacity: $input.val() / 100 });
                }.bind( this ));
            },

            onPropertyUpdate: function( model, value ) {
                this.$visual.css({ opacity: value });
                this.$(".opacity-slider").slider("value", value );
            }

        })
    };


});
