define([
    "app",
    "engine/modules/control.view"
],

function( app, ControlView ) {

    return {
        linkto: ControlView.extend({

            propertyName: "to_frame",
            template: "linkto/linkto",

            serialize: function() {
                var targetFrame = app.project.getFrame( this.getAttr("to_frame") );

                if ( targetFrame === false ) {
                    return { thumbnail_url: ""};
                } else {
                    return targetFrame.toJSON();
                }
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
