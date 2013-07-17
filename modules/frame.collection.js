// frame.js
define([
    "app",
    "engine/modules/frame.model",
    "engine/modules/layer.collection"
],

function( app, FrameModel, LayerCollection ) {

    return app.Backbone.Collection.extend({
        model: FrameModel,

        mode: "editor",
        remixPageMax: 5,

        setMode: function( mode ) {
            this.mode = mode;
            if ( mode == "editor") this.initEditor();
        },

        initEditor: function() {
            this.on("add", this.onFrameAdd, this );
            this.on("remove", this.onFrameRemove, this );
        },

        initLayers: function( layerCollection, options ) {

            this.each(function( frame ) {
                var frameLayers = layerCollection.filter(function( layer ) {
                    var invalidLink, index;

                    invalidLink = layer.get("type") == "Link" && layer.get("attr").to_frame == frame.id;
                    index = _.indexOf( frame.get("layers"), layer.id );

                    if ( invalidLink ) {
                        // remove invalid link ids from frames. this kind of sucks
                        // have filipe rm these from the data??
                        frame.put("layers", _.without( frame.get("layers"), layer.id ) );
                        return false;
                    } else if ( index > -1 ) {
                        layer.order[ frame.id ] = index;
                        return true;
                    }
                    return false;
                });

                frame.layers = new LayerCollection( frameLayers );
                frame.layers.frame = frame;
                frame.layers.sort({ silent: true });
                // update the layer collection attribute
                frame.layers.each(function( layer ) {
                    layer.addCollection( frame.layers );
                    layer.pluginsPath = options.pluginsPath;
                });
                frame.listenToLayers();
            });
        },

        // add frame at a specified index.
        // omit index to append frame
        addFrame: function( index, skipTo ) {

            if ( app.project.get("remix").remix && this.length < this.remixPageMax ) {
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
                alert("too many pages!")
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
