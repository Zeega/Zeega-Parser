define([
    "app",
    "zeega_parser/modules/control.view"
],

function( Zeega, ControlView ) {

    return {

        resize: ControlView.extend({

            propertyName: "resize",

            create: function() {
                this.makeResizable();
            },

            makeResizable: function() {
                var args = {
                    stop: function( e, ui ) {
                        var width, height;

                        height = this.$visualContainer.height() / this.$workspace.height() * 100;
                        width = this.$visualContainer.width() / this.$workspace.width() * 100;

                        this.update({
                            height: height,
                            width: width
                        });
                        this.convertToPercents( width, height );
                    }.bind( this )
                };

                this.$visualContainer.resizable( _.extend({}, args, this.options.options ) );
            },

            destroy: function() {
                this.$visualContainer.resizable( "destroy" );
            },

            convertToPercents: function( width, height ) {
                this.$visualContainer.css({
                    width: width + "%",
                    height: height + "%"
                });
            }

        }) // end control
    
    }; // end return

});
