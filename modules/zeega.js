define([
    "app",
    "engine/engine",

    "engine/modules/project.collection",
    "engine/modules/project.model",
    "engine/modules/page.collection",
    "engine/modules/page.model",
    "engine/modules/layer.collection",
    "engine/modules/layer.model"
],

function( app, Engine, ProjectCollection, ProjectModel, PageCollection, PageModel, LayerCollection, LayerModel ) {

    return app.Backbone.Model.extend({

        projects: null,

        defaults: {
            mode: "editor",
            
            currentProject: null,
            currentPage: null,
            currentLayer: null,

            // do I need these?
            previousProject: null,
            previousPage: null,
            previousLayer: null,
        },

        initialize: function( models, options ) {
            this.injectZeega();

            if ( options.projects ) this.projects = new ProjectCollection( options.projects );

            this._initCurrentState();
            
            console.log( "ZEEGA", this )
        },

        injectZeega: function() {
            ProjectCollection.prototype.zeega =
            ProjectModel.prototype.zeega =
            PageCollection.prototype.zeega =
            PageModel.prototype.zeega =
            LayerCollection.prototype.zeega =
            LayerModel.prototype.zeega = this;
        },

        gotoNextPage: function() {
            var nextPage = this.getCurrentPage()

            this.emit("page_change:next")
        },

        gotoPreviousPage: function() {

            this.emit("page_change:prev")
        },

        getNextPage: function( page ) {
            return this.getCurrentProject().pages.at( page.get("_order") + 1 ) || false;
        },

        getPreviousPage: function( page ) {
            return this.getCurrentProject().pages.at( page.get("_order") - 1 ) || false;
        },

        getCurrentProject: function() {
            return this.get("currentProject");
        },

        getCurrentPage: function() {
            return this.get("currentPage");
        },

        getPage: function( pageID ) {

        },

        getCurrentLayer: function() {

        },

        getSoundtrack: function() {

        },

        addProject: function( project ) {

        },

        removeProject: function( projectID ) {

        },

        emit: function( event, attributes ) {
            this.trigger( event, attributes );
        },

        // can be updated to use the startFrame property. good for now
        _initCurrentState: function() {
            var currentProject = this.projects.at(0),
                currentPage = currentProject.pages.at(0);

            this.set({
                currentProject: currentProject,
                currentPage: currentPage
            });
        },

        _setFirstPage: function() {
            this.projects.at(0)
        }
    });

});
