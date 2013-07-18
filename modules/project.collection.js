define([
    "app",
    "engine/modules/project.model"
],

function( app, ProjectModel ) {

    return app.Backbone.Collection.extend({

        model: ProjectModel,

        zeega: null

    });

});
