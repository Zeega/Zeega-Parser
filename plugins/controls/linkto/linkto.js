define([
    "app",
    "zeega_parser/modules/control.view"
],

function( app, ControlView ) {

    return {
        linkto: ControlView.extend({

            propertyName: "to_frame",
            template: "linkto/linkto",

            serialize: function() {
                console.log("link to", this.getAttr("to_frame") )
                // var targetFrame = 
                return app.project.getFrame( this.getAttr("to_frame") ).toJSON();
            },

            onPropertyUpdate: function( value ) {
                this.render();
            },

            events: {
                "click .control-frame-thumb a": "openModal"
            },

            openModal: function() {
                this.model.visual.startFrameChooser();
            }

        })
    };


});
