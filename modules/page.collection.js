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

        loadLayers: function( layers ) {
            this.each(function( page ) {
                page.loadLayers( layers );
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
            this.on("add", this.onFrameAdd, this );
            this.on("remove", this.onFrameRemove, this );
        },


        // add frame at a specified index.
        // omit index to append frame
        addFrame: function( index, skipTo ) {

            if ( !app.project.get("remix").remix || ( app.project.get("remix").remix && this.length < this.remixPageMax )) {
                var newFrame, continuingLayers = [];

                skipTo = !_.isUndefined( skipTo ) ? skipTo : true;
                index = index == "auto" ? undefined : index;

                newFrame = new FrameModel({
                    _order: index
                });

                newFrame.status = app.status;
                newFrame.layers = new LayerCollection( _.compact( continuingLayers ) );
                newFrame.layers.frame = newFrame;
                newFrame.listenToLayers();
                newFrame.editorAdvanceToPage = skipTo;

                newFrame.save().success(function() {
                    app.project.addFrameToKey( newFrame.id, this.sequence.id );

                    if ( _.isUndefined( index ) ) {
                        this.push( newFrame );
                    } else {
                        this.add( newFrame, { at: index });
                    }

                    this.each(function( frame, i ) {
                        frame.set("_order", i );
                    });

                    app.trigger("frame_add", newFrame );
                }.bind( this ));

                return newFrame;
            } else {
                // too many pages. do nothing
            }
        },

        onFrameAdd: function( frame ) {
            this.sequence.save("frames", this.pluck("id") );
        },

        onFrameRemove: function( frameModel ) {
            var frameID = frameModel.id;

            app.trigger("frame_remove", frameModel );
            frameModel.destroy();
            this.sort();

            // remove link layers targeting the deleted frame
            app.project.sequences.each(function( sequence ) {
                sequence.frames.each(function( frame ) {
                    frame.layers.each( function( layer ) {
                        if ( layer.get("type") == "Link" && layer.get("attr").to_frame == frameID ) {
                            layer.collection.remove( layer );
                        }
                    });
                });
            });

            if ( this.length === 0 ) {
                this.addFrame();
            } else {
                this.sequence.save("frames", this.pluck("id") );
            }
        },

        comparator: function( frame ) {
            return frame.get("_order");
        }
    });

});
