define([
    "app",
    "engine/modules/page.model",
    "engine/modules/layer.collection"
],

function( app, PageModel, LayerCollection ) {

    return app.Backbone.Collection.extend({

        model: PageModel,
        zeega: null,
        remixPageMax: 5,

        initialize: function() {
            if ( this.zeega.get("mode") == "editor" ) {
                this.initEditor();
            } else if ( this.zeega.get("mode") == "player") {

            }
        },

        initEditor: function() {
            this.on("add", this.onFrameAdd, this );
            this.on("remove", this.onPageRemove, this );
        },


        load: function( layers, project ) {
            this.each(function( page ) {
                page.loadLayers( layers );
                page.project = project;
            });
        },

        setPageOrder: function( sequence ) {
            _.each( sequence.frames, function( sequenceID, index ) {
                this.get( sequenceID ).set("_order", index );
            }, this );

            this.sort({ silent: true });
        },

        /////

        // add frame at a specified index.
        // omit index to append frame
        addPage: function( index, skipTo ) {

            if ( !app.zeega.getCurrentProject().get("remix").remix || ( app.zeega.getCurrentProject().get("remix").remix && this.length < this.remixPageMax )) {
                var newPage;

                skipTo = !_.isUndefined( skipTo ) ? skipTo : true;
                index = index == "auto" ? undefined : index;

                newPage = new PageModel({
                    _order: index
                });

//                newPage.status = app.status;
                newPage.layers = new LayerCollection();
                newPage.layers.page = newPage;
                newPage.initEditorListeners();
                newPage.editorAdvanceToPage = skipTo;

                newPage.save().success(function() {

                    if ( _.isUndefined( index ) ) {
                        this.push( newPage );
                    } else {
                        this.add( newPage, { at: index });
                    }

                    this.each(function( page, i ) {
                        page.set("_order", i );
                    });

                    app.trigger("frame_add", newPage );
                }.bind( this ));

                return newPage;
            } else {
                // too many pages. do nothing
            }
        },

        addPageByItem: function( item ) {
            $.post( app.getApi() + "projects/"+ app.zeega.getCurrentProject().id +"/sequences/"+ app.zeega.getCurrentProject().sequence.id +"/itemframes",
                item.toJSON(),
                function( pageData ) {
                    var newPage = new PageModel(_.extend( pageData, {
                        _order: this.length
                    }));

                    newPage.layers = new LayerCollection();
                    newPage.layers.page = newPage;
                    newPage.initEditorListeners();
                    newPage.editorAdvanceToPage = true;

                    newPage.addLayerByItem( item, { source: "drag-to-workspace" });
                    this.push( newPage );
                    this.each(function( page, i ) {
                        page.set("_order", i );
                    });
                }.bind(this));
        },

        onFrameAdd: function( frame ) {
            app.zeega.getCurrentProject().setPageOrder( this.pluck("id") );
        },

        onPageRemove: function( pageModel ) {
            var pageID = pageModel.id,
                index = pageModel.get("_order");

            this.sort();

            if ( this.length === 0 ) {
                this.addPage();
            } else {
                app.zeega.getCurrentProject().setPageOrder( this.pluck("id") );
                if ( app.zeega.getCurrentPage().id == pageID ) {
                    app.zeega.setCurrentPage( this.at( this.length <= index ? 0 : index ));
                }
            }

            app.trigger("frame_remove", pageModel );
            pageModel.finish();
            pageModel.destroy();
        },

        comparator: function( frame ) {
            return frame.get("_order");
        }
    });

});
