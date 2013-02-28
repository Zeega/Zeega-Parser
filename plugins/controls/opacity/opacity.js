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

            options: {
                min: 0,
                max: 1,
                step: 0.001
            },

            create: function() {
                var $input = this.$(".text-input");

                this.$(".opacity-slider").slider({
                    orientation: "vertical",
                    range: "min",
                    step: this.options.step,
                    min: this.options.min,
                    max: this.options.max,
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
                    var val;

                    if ( e.which == 13 ) { // enter
                        $input.blur();
                    } else if ( e.which == 27 ) { // esc
                        $input.val( Math.floor( this.getAttr("opacity") * 100 ) );
                        $input.blur();
                    } else if ( e.which == 38 ) { // arrow up
                        val = (parseInt( $input.val(), 10 ) + 1) / 100;

                        if ( val <= this.options.max ) {
                            this.updateVisual( val );
                            this.updateSlider( val );
                            this.lazyUpdate( val );
                            $input.val( val * 100 );
                        }
                    } else if ( e.which == 40 ) { // arrow up
                        val = ( parseInt( $input.val(), 10 ) - 1 )/ 100;

                        if ( val >= this.options.min ) {
                            this.updateVisual( val );
                            this.updateSlider( val );
                            this.lazyUpdate( val );
                            $input.val( val * 100 );
                        }
                    }
                }.bind( this ));

                $input.blur(function() {
                    this.update({ opacity: $input.val() / 100 });
                }.bind( this ));

            },

            updateSlider: function( value ) {
                this.$(".opacity-slider").slider("value", value );
            },

            onPropertyUpdate: function( model, value ) {
                this.updateVisual( value );
                this.updateSlider( value );
            }

        })
    };


});
