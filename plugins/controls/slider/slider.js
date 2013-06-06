define([
    "app",
    "engine/modules/control.view",
    "jqueryUI"
],

function( Zeega, ControlView ) {

    return {
        slider: ControlView.extend({

            parentName: "slider",
            template: "slider/slider",

            defaults: {
                min: 0,
                max: 100,
                step: 1,
                // callbacks
                onStart: function() {},
                onSlide: function() {},
                onStop: function() {}
            },

            serialize: function() {
                return _.extend({}, this.model.toJSON(),
                    { 
                        title: this._userOptions.title,
                        _propertyName: this._userOptions.propertyName
                    });
            },

            create: function() {
                var _settings, args, $input = this.$(".text-input");

                _settings = _.defaults( this._userOptions, this.defaults );

                args = {
                    orientation: "vertical",
                    range: "min",
                    value: this.getAttr( this.propertyName ),

                    start: function( e, ui ) {
                        _settings.onStart( e, ui );
                    },

                    slide: function( e, ui ) {

                        if ( this._userOptions.css ) {
                            var value = {};

                            value[ this.propertyName ] = ui.value;
                            this.$visual.css( value );
                        }
                        this.$(".text-input").val( Math.floor( ui.value * 100 ) );
                        _settings.onSlide( e, ui );
                    }.bind( this ),
                    
                    stop: function( e, ui) {
                        var value = {};

                        value[ this.propertyName ] = ui.value;
                        if ( this._userOptions.css ) {
                            this.$visual.css( value );
                        }

                        this.update( value );
                        _settings.onStop( e, ui );
                    }.bind( this )
                };

                _.extend( args, _settings );

                this.$(".control-slider").slider( args );

                $input.on("keyup", function( e ) {
                    var val;

                    if ( e.which == 13 ) { // enter
                        $input.blur();
                    } else if ( e.which == 27 ) { // esc
                        $input.val( Math.floor( this.getAttr( this.propertyName ) * 100 ) );
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
                    var value = {};

                    value[ this.propertyName ] = $input.val() / 100;
                    this.update( value );
                }.bind( this ));

            },

            updateSlider: function( value ) {
                this.$(".control-slider").slider("value", value );
            },

            onPropertyUpdate: function( model, value ) {
                this.updateVisual( value );
                this.updateSlider( value );
            }

        })
    };


});
