// frame.js
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
            if ( app.mode == "editor" ) {
                this.initEditor()
            } else if ( app.mode == "player") {

            }
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

        initEditor: function() {
            console.log("init editor!!!!")
            this.on("add", this.onFrameAdd, this );
            this.on("remove", this.onPageRemove, this );
        },

        // add frame at a specified index.
        // omit index to append frame
        addPage: function( index, skipTo ) {

            if ( !app.zeega.getCurrentProject().get("remix").remix || ( app.zeega.getCurrentProject().get("remix").remix && this.length < this.remixPageMax )) {
                var newPage, continuingLayers = [];

                skipTo = !_.isUndefined( skipTo ) ? skipTo : true;
                index = index == "auto" ? undefined : index;

                newPage = new PageModel({
                    _order: index
                });

//                newPage.status = app.status;
                newPage.layers = new LayerCollection( _.compact( continuingLayers ) );
                newPage.layers.frame = newPage;
                newPage.initEditorListeners();
                newPage.editorAdvanceToPage = skipTo;

                newPage.save().success(function() {
                    // app.zeega.getCurrentProject().addFrameToKey( newPage.id, this.sequence.id );

                    if ( _.isUndefined( index ) ) {
                        this.push( newPage );
                    } else {
                        this.add( newPage, { at: index });
                    }

                    this.each(function( frame, i ) {
                        frame.set("_order", i );
                    });

                    app.trigger("frame_add", newPage );
                }.bind( this ));

                return newPage;
            } else {
                // too many pages. do nothing
            }
        },

        onFrameAdd: function( frame ) {
            this.sequence.save("frames", this.pluck("id") );
        },

        onPageRemove: function( pageModel ) {
            var pageID = pageModel.id;

            app.trigger("frame_remove", pageModel );
            pageModel.destroy();
            this.sort();

            if ( this.length === 0 ) {
                this.addPage();
            } else {
                app.zeega.getCurrentProject().setPageOrder( this.pluck("id") );
            }
        },

        comparator: function( frame ) {
            return frame.get("_order");
        }
    });

});
