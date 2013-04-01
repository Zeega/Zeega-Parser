define([
    "app",
    "zeega_parser/modules/control.view",
    "simpleColorPicker"
],

function( app, ControlView ) {

    return {
        color: ControlView.extend({

            parentName: "color",
            template: "color/color",

            init: function() {
                this.propertyName = this.options.options.propertyName;
            },

            serialize: function() {
                return _.extend({}, this.model.toJSON(), {
                    _title: this.options.options.title,
                    _propertyName: this.propertyName
                });
            },

            create: function() {
                /* plugin: https://github.com/recurser/jquery-simple-color */
                var $colorPicker = this.$(".simple_color");

                $colorPicker
                    .simpleColor({
                        callback: function( hex ) {
                            this.updateVisual( "#" + hex );
                            this.lazyUpdate( "#" + hex );
                        }.bind( this )
                    });
            }

        })
    };


});
