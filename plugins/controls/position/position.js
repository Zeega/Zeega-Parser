define([
    "app",
    "zeega_parser/modules/control.view"
],

function( Zeega, ControlView ) {

    return {

        position: ControlView.extend({

            type: "position",
            propertyName: "position",

            create: function() {
                this.makeDraggable();
                this.$visual.css("cursor", "move");
            },

            makeDraggable: function() {
                
                if ( this.model.editorProperties.draggable ) {

                    this.$visualContainer.draggable({
                        start: function( e, ui ) {
                            this.model.visual.transforming = true;
                        }.bind( this ),
                        stop: function( e, ui ) {
                            var top, left, workspace;

                            this.model.visual.transforming = false;

                            workspace = this.$visualContainer.closest(".ZEEGA-workspace");
                            top = ui.position.top / workspace.height() * 100;
                            left = ui.position.left / workspace.width() * 100;
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
                    top: top + "%",
                    left: left + "%"
                });
            }

        }) // end control
    
    }; // end return

});
