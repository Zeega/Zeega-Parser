define([
    "app",
    "zeega_parser/modules/control.view"
],

function( Zeega, ControlView ) {

    return {

        position: ControlView.extend({

            propertyName: "position",

            create: function() {
                this.makeDraggable();
                this.$visual.css("cursor", "move");
            },

            makeDraggable: function() {
                if ( this.model.editorProperties.draggable ) {
                    this.$visualContainer.draggable({
                        stop: function( e, ui ) {
                            var top, left, workspace;

                            workspace = this.$visualContainer.closest(".ZEEGA-workspace");
                            top = ui.position.top / workspace.height() * 100;
                            left = ui.position.left / workspace.width() * 100;
                            this.update({
                                top: top,
                                left: left
                            });

console.log('pos:', top, left, this.model.toJSON() )

                            this.convertToPercents( top, left );
                        }.bind( this )
                    });
                }
            },

            destroy: function() {
                this.$visualContainer.draggable( "destroy" );
            },

            convertToPercents: function( top, left ) {
                this.$visualContainer.css({
                    top: top + "%",
                    left: left + "%"
                });
            }

        }) // end control
    
    }; // end return

});
