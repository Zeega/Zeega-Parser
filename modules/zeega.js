define([
    "app",
    "engine/parser",

    "engine/modules/project.collection",
    "engine/modules/project.model",
    "engine/modules/page.collection",
    "engine/modules/page.model",
    "engine/modules/layer.collection",
    "engine/modules/layer.model"
],

function( app, Parser, ProjectCollection, ProjectModel, PageCollection, PageModel, LayerCollection, LayerModel ) {

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

            copiedLayer: null
        },

        initialize: function( models, options ) {
            this.injectZeega();

            if ( options.projects ) this.projects = new ProjectCollection( options.projects );

            this.projects.each(function( project ) {
                project._loadProject();
            });

            this._initCurrentState();
        },

        injectZeega: function() {
            ProjectCollection.prototype.zeega =
            ProjectModel.prototype.zeega =
            PageCollection.prototype.zeega =
            PageModel.prototype.zeega =
            LayerCollection.prototype.zeega =
            LayerModel.prototype.zeega = this;
        },

        focusPage: function( page ) {
            if ( this.getCurrentProject().id != page.project.id ) {
                this.set("currentProject", page.project );
            }

            this.blurPage( this.get("currentPage") );
            this.set("currentPage", page );
            page.trigger("focus");
            this.emit("page page:focus", page );
        },

        blurPage: function( page ) {
            this.set("previousPage", page );
            page.trigger("blur");
            this.emit("page page:blur", page );
        },

        getFirstPage: function() {
            return this.projects.at(0).pages.at(0);
        },

        getNextPage: function( page ) {
            var p = page || this.getCurrentPage();
            var nextPage = false;

            if ( p.get("_order") + 1 < this.getCurrentProject().pages.length ) {
                nextPage = this.getCurrentProject().pages.at( p.get("_order") + 1 );
            } else if ( this.getNextProject() ) {
                nextPage = this.getNextProject().pages.at(0);
            }

            return nextPage;
        },

        getPreviousPage: function( page ) {
            var p = page || this.getCurrentPage();
            var previousPage = false;

            if ( p.get("_order") > 0 ) {
                previousPage = this.getCurrentProject().pages.at( p.get("_order") - 1 );
            } else if ( this.getPreviousProject() ) {
                previousPage = this.getPreviousProject().pages.at( this.getPreviousProject().pages.length - 1 );
            }

            return previousPage;
        },

        getCurrentProject: function() {
            return this.get("currentProject");
        },

        getNextProject: function() {
            var index = this.projects.indexOf( this.getCurrentProject() );

            return this.projects.at( index + 1 );
        },

        getPreviousProject: function() {
            var index = this.projects.indexOf( this.getCurrentProject() );

            return this.projects.at( index - 1 );
        },

        getCurrentPage: function() {
            return this.get("currentPage");
        },

        setCurrentPage: function( page ) {
            var oldPage = this.get("currentPage");

            this.setCurrentLayer( null );

            if ( oldPage && page ) {
                oldPage.trigger("blur");
            }

            if ( page ) {
                this.set("currentPage", page );
                page.trigger("focus");
            } else if ( page === null ) { // should this be allowed?
                this.set("currentPage", null);
            }
        },

        getPages: function() {
            var pagesArray = [];
            
            this.projects.each(function( project ) {
                project.pages.each(function( page ) {
                    pagesArray.push( page )
                });
            });

            return pagesArray;
        },

        getPage: function( pageID ) {

        },

        getCurrentLayer: function() {
            return this.get("currentLayer");
        },

        setCurrentLayer: function( layer ) {
            var oldLayer = this.get("currentLayer");

            if ( oldLayer && layer ) {
                oldLayer.trigger("blur");
            }

            if ( layer ) {
                this.set("currentLayer", layer );
                layer.trigger("focus")
            } else if ( layer === null ) {
                this.set("currentLayer", null );
            }
        },

        getSoundtrack: function() {
            return this.projects.at(0).soundtrack;
        },

        isRemix: function() {
            return this.getCurrentProject().get("remix").remix;
        },

        preloadNextZeega: function() {
            var remixData = this.getCurrentProject().getRemixData();

            this.waiting = true;
            // only preload if the project does not already exist
            if ( remixData.remix && !this.projects.get( remixData.parent.id ) && this.waiting ) {
                var projectUrl = "http:" + app.metadata.hostname + app.metadata.directory +'api/projects/' + remixData.parent.id;

                $.getJSON( projectUrl, function( data ) {
                    this._onDataLoaded( data );
                    this.waiting = false;
                }.bind(this));

            }
        },

        _onDataLoaded: function( data ) {
            var newProjectData = Parser( data,
                _.extend({},
                    this.toJSON(),
                    {
                        mode: "player"
                    })
                );
            var newProject = new ProjectModel( newProjectData);

            newProject._loadProject();

            this.projects.push( newProject );
        },

        getProjectJSON: function() {
            var pData, currentProject, layers, soundtrack;

            pData = {};
            currentProject = this.getCurrentProject();
            layers = _.flatten( currentProject.pages.map(function( page ) {
                    return page.layers.toJSON();
                }), true );
            soundtrack = currentProject.soundtrack ? currentProject.soundtrack.toJSON() : {};

            layers.push( soundtrack );

            _.extend( pData, currentProject.toJSON(), {
                sequences: [ currentProject.sequence.toJSON() ],
                frames: currentProject.pages.toJSON(),
                layers: layers
            });

            pData.sequences = [ currentProject.sequence.toJSON() ];

            return pData;
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
                currentPage = this.getFirstPage();

            this.set({
                currentProject: currentProject,
                currentPage: currentPage
            });
        },

        _setFirstPage: function() {
            this.projects.at(0);
        },

        destroy: function() {

            this.projects.each(function( project ) {
                project.destroy();
            });
        }
    });

});
