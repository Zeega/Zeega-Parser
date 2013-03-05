define([
    "app",
    "zeega_parser/modules/control.view"
],

function( Zeega, ControlView ) {

    return {

        resize: ControlView.extend({

            type: "resize",
            propertyName: "resize",

            create: function() {
                this.makeResizable();
            },

            makeResizable: function() {
                var args = {
                    stop: function( e, ui ) {
                        var attr = {}, width, height;

                        attr.width = this.$visualContainer.width() / this.$workspace.width() * 100;
                        if ( this.options.options != "e" ) {
                            attr.height = this.$visualContainer.height() / this.$workspace.height() * 100;
                        }
                       
                        this.update( attr );
                        this.updateCSS( attr );
                    }.bind( this )
                };

                this.$visualContainer.resizable( _.extend({}, args, this.options.options ) );
            },

            destroy: function() {
                this.$visualContainer.resizable( "destroy" );
            },

            updateCSS: function( attr ) {
                var workspace = this.$visualContainer.closest(".ZEEGA-workspace");

                var css = {
                    top: this.$visualContainer.position().top / workspace.height() * 100 + "%",
                    left: this.$visualContainer.position().left / workspace.width() * 100 + "%"
                };

                _.each( attr, function( value, key ) {
                    css[ key ] = value + "%";
                });

                this.$visualContainer.css( css );
            }

        }) // end control
    
    }; // end return

});
