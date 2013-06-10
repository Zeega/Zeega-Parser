define([
    "app",
    "engine/modules/control.view",
    "engineVendor/jquery-simple-color/jquery.simple-color"
],

function( app, ControlView ) {

    return {
        color: ControlView.extend({

            parentName: "color",
            template: "color/color",

            init: function() {
                this.propertyName = this.options.options.propertyName;
                this.model.on("change", this.onChange, this );
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
                        livePreview: true,
                        onCellEnter: function( hex ) {
                            this.updateVisual( "#" + hex );
                        }.bind( this ),
                        onClose: function() {
                            this.onChange();
                        }.bind( this ),
                        onSelect: function( hex ) {
                            var attr = {};

                            attr[ this.propertyName ] = "#" + hex;
                            this.updateVisual( "#" + hex );
                            this.update( attr );
                        }.bind( this )
                    });
            },

            onChange: function() {
                this.updateVisual( this.getAttr( this.propertyName ) );
            }

        })
    };


});
