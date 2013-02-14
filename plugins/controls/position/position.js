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
                            top = ui.position.top / workspace.height();
                            left = ui.position.left / workspace.width();

                            this.update({
                                top: top,
                                left: left
                            });
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
                    top: top * 100 + "%",
                    left: left * 100 + "%"
                });
            }

        }) // end control
    
    }; // end return

});
