define([
    "app",
    "backbone",
    "engine/modules/layer.collection",
    "engine/plugins/layers/_all"
],

function( app, Backbone, LayerCollection, Layers ) {

    return app.Backbone.Model.extend({

        zeega: null,
        layers: null,
        // waiting, loading, ready, destroyed
        state: "waiting",
        modelType: "frame",

        defaults: {
            _order: 0,
            attr: {},
            id: null,
            layers: [],
            thumbnail_url: null
        },

        url: function() {
            if( this.isNew() ) {
                return app.getApi() + 'projects/' + app.zeega.getCurrentProject().id +'/sequences/'+ app.zeega.getCurrentProject().sequence.id +'/frames';
            } else {
                return app.getApi() + 'projects/' + app.zeega.getCurrentProject().id + '/frames/'+ this.id;
            }
        },

        initialize: function() {
            if ( this.zeega.get("mode") == "editor" ) {
                // this.initEditorListeners();
            } else if ( this.zeega.get("mode") == "player" ) {
                this.initPlayerListeners();
            }

            this.lazySave = _.debounce(function() {
                this.save();
            }.bind( this ), 1000 );

        },

        initPlayerListeners: function() {
            this.on("focus", this.play, this );
            this.on("blur", this.exit, this );
        },

        initEditorListeners: function() {
            this.stopListening( this.layers );
            this.layers.on("sort", this.onLayerSort, this );
            this.layers.on("add", this.onLayerAdd, this );
            this.layers.on("remove", this.onLayerRemove, this );
        },

        loadLayers: function( layers ) {
            var pageLayers, classedLayers;

            // filter to only layers on page
            pageLayers = _.filter( layers, function( layer ) {
                return _.contains( this.get("layers"), layer.id );
            }.bind(this));

            // make layer type array
            classedLayers = _.map( pageLayers, function( layer, i ) {
                var classedLayer = new Layers[ layer.type ]( _.extend( layer, {
                    type: layer.type,
                    _order: _.indexOf( this.get("layers"), layer.id )
                }));

                this.addLayerVisual( classedLayer );

                return classedLayer;
            }.bind(this));

            this.layers = new LayerCollection( classedLayers );
            this.layers.page = this;

            if ( this.zeega.get("mode") == "editor" ) {
                this.initEditorListeners();
            }
            
            this.layers.afterInit();
        },

        addLayerVisual: function( layer ) {
            layer.visual = new Layers[ layer.get("type") ].Visual({
                model: layer,
                attributes: {
                    "data-id": layer.id
                }
            });

            return layer;
        },

        preload: function() {
            // only try to preload if preload has not been attempted yet
            if ( this.state == "waiting" ) {

                if ( this.layers.length === 0 ) {
                    this.onLayersReady( this.layers );
                } else {
                    this.state = "loading";
                    this.once("layers:ready", this.onLayersReady, this );
                    this.layers.preload();
                }
            }
        },

        onLayersReady: function( layers ) {
            this.state = "ready";
            this.zeega.emit("page page:ready page:ready-" + this.id, this );

            if ( this.zeega.get("currentPage").id == this.id ) this.play();
        },

        play: function() {
            this.zeega.emit("page page:play", this );
            if ( this.state != "ready") app.spin();
            else app.spinStop();
            this.layers.play();
        },

        pause: function() {
            this.layers.each(function( layer ) {
                layer.pause();
            });
        },

        exit: function( newID ) {
            app.spinStop();
            this.layers.each(function( layer ) {
                layer.exit();
            });
        },

        getNextPage: function() {
            return this.zeega.getNextPage( this );
        },

        getPrevPage: function() {
            return this.zeega.getPreviousPage( this );
        },

        // editor
        onLayerAdd: function() {
            this.onLayerSort();
            this.updateThumbUrl();
        },

        onLayerRemove: function( layer ) {
            this.once("sync", function() {
                layer.destroy();
            });
            this.onLayerSort();
            this.updateThumbUrl();
        },

        onLayerSort: function() {
            this.set("layers", this.layers.pluck("id") );
            this.lazySave();
            this.updateThumbUrl();
        },

        addLayerType: function( type ) {
            var newLayer = new Layers[ type ]({
                type: type,
                _order: this.layers.length
            });

            newLayer.collection = this.layers;
            this.addLayerVisual( newLayer );

            this.set("attr", this.defaults.attr );

            // set image layer opacity to 0.5 for layers on top of other layers
            if ( this.layers.length && newLayer.get("type") != "TextV2") {
                newLayer.setAttr({ opacity: 0.5 });
            }

            app.emit("layer_added_start", newLayer );
            newLayer
                .save()
                .success(function( response ) {
                    this.layers.add( newLayer );
                    app.zeega.setCurrentLayer( newLayer );
                    app.emit("layer_added_success", newLayer );
                }.bind( this ));
            newLayer.afterInit();
        },

        addLayerByItem: function( item, eventData ) {
            var newLayer = new Layers[ item.get("layer_type") ]({
                type: item.get("layer_type"),
                attr: _.extend({}, item.toJSON() ),
                _order: this.layers.length
            });

            newLayer.collection = this.layers;
            this.addLayerVisual( newLayer );

            // set image layer opacity to 0.5 for layers on top of other layers
            if ( this.layers.length && newLayer.get("type") != "TextV2") {
                newLayer.setAttr({ opacity: 0.5 });
            }

            newLayer.eventData = eventData;
            app.emit("layer_added_start", newLayer );

            newLayer.save()
                .success(function( response ) {
                    this.layers.add( newLayer );
                    app.zeega.setCurrentLayer( newLayer );
                    app.emit("layer_added_success", newLayer );
                }.bind( this ));
            
            newLayer.afterInit();
        },

        pasteLayer: function( layer ) {
            var newLayer = new Layers[ layer.get("type") ]( _.extend({}, layer.toJSON(), { id: null } ) );

            newLayer.collection = this.layers;
            this.addLayerVisual( newLayer );
            app.emit("layer_added_start", newLayer );

            newLayer.save().success(function( response ) {
                this.layers.add( newLayer );
                app.zeega.setCurrentLayer( newLayer );
                app.emit("layer_added_success", newLayer );
            }.bind( this ));
            newLayer.afterInit();
        },

        //update the frame thumbnail
        updateThumbUrl: function() {
            var url;

            this.layers.each(function( layer ) {
                if ( layer.get("type") == "Image" ) {
                    this.set("thumbnail_url", layer.getAttr("thumbnail_url"));
                    this.lazySave();
                }
            }, this );
        },

        saveAttr: function( attrObj ) {
            var attr = this.get("attr");

            if ( _.isArray( attr ) ) {
                attr = {};
            }

            this.set("attr", _.extend( attr, attrObj ) );
            this.lazySave();
        },

        finish: function() {
            this.layers.each(function( layer ) {
                layer.finish();
            });
            this.state = "destroyed";
        }

    });
});
