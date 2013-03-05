define([
    "app",
    "zeega_parser/modules/control.view",
    "colorpicker"
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
                return _.extend({}, this.model.toJSON(), { _propertyName: !_.isUndefined( this.options.options ) ? this.options.options.title : this.propertyName });
            },

            create: function() {
                /* plugin: http://www.eyecon.ro/colorpicker/#about */
console.log("COLOR:",this.propertyName, this.model.getAttr( this.propertyName ))
                this.$('.color-selector').ColorPicker({
                    
                    color: this.model.getAttr( this.propertyName ),
                    
                    onShow: function (colpkr) {
                        $( colpkr ).fadeIn(500);
                        
                        return false;
                    },
                    onHide: function (colpkr) {
                        $( colpkr ).fadeOut(500);

                        return false;
                    },
                    onChange: function (hsb, hex, rgb) {
                        var hexValue = "#" + hex;

                        this.$('.color-preview').css("backgroundColor", hexValue );
                        this.updateVisual( hexValue );
                        this.lazyUpdate( hexValue );
                    }.bind( this )
                });
            }

        })
    };


});
