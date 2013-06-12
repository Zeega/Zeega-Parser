define([
    "app",
    "engine/plugins/layers/_all"
],

function( app, Layers ) {

    return app.Backbone.Model.extend({

        soundtrackModel: null,

        defaults: {
            advance_to: null,
            attr: {
                soundtrack: false
            },
            description: null,
            frames: [],
            id: null,
            persistent_layers: [],
            title: ""
        },

        url : function() {
            if ( this.isNew() ) {
                return app.api + 'projects/'+ app.project.id +'/sequences';
            } else {
                return app.api + 'projects/'+ app.project.id +'/sequences/' + this.id;
            }
        },

        lazySave: null,

        initialize: function() {
            this.lazySave = _.debounce(function() {
                this.save();
            }.bind( this ), 1000 );
        },

        initSoundtrackModel: function( layers ) {
            if ( this.get("attr").soundtrack ) {
                this.soundtrackModel = app.soundtrack = layers.get( this.get("attr").soundtrack );
                this.soundtrackModel.status = app.player ? app.player.status : app.state;
            }
        },

        onFrameSort: function() {
            _.each( this.get("frames"), function( frameID, i ) {
                this.frames.get( frameID ).set("_order", i );
            }, this );
            this.frames.sort();
        },

        setSoundtrack: function( item, view ) {
            var newLayer, oldlayer;

            oldLayer = app.project.getLayer( this.get("attr").soundtrack );
            if ( this.get("attr").soundtrack && oldLayer ) {
                this.removeSoundtrack( oldLayer );
            }

            newLayer = new Layers[ item.get("layer_type") ]({
                type: item.get("layer_type")
            });

            newLayer.set( "attr", _.extend({},
                newLayer.get("attr"),
                {
                    loop: true,
                    soundtrack: true
                },
                item.toJSON())
            );


            newLayer.save().success(function( response ) {
                var attr = this.get("attr");

                if ( _.isArray( attr ) ) {
                    attr = {};
                }

                this.soundtrackModel = newLayer;
                attr.soundtrack = newLayer.id;
                this.set("attr", attr );
                view.setSoundtrackLayer( newLayer );

                this.lazySave();
            }.bind( this ));
        },

        removeSoundtrack: function( layer ) {
            var attr = this.get("attr");

            layer.destroy();
            attr.soundtrack = false;
            this.set("attr", attr );
        },

        persistLayer: function( layer ) {
            var persistentLayers = this.get("persistent_layers");

            if ( !_.isArray(persistentLayers) ) {
                persistentLayers = [];
            }

            if ( _.isEmpty(persistentLayers) || !_.contains( layer.id, persistentLayers ) ) {
                persistentLayers.push( layer.id );
                this.set("persistent_layers", persistentLayers );
                this.frames.each(function( frame ) {
                    layer.order[ frame.id ] = frame.layers.length;
                    frame.layers.add( layer );
                });
            }
        },

        unpersistLayer: function( layer ) {
            if ( _.contains( this.get("persistent_layers"), layer.id ) ) {
                var pLayers = _.without( this.get("persistent_layers"), layer.id );

                this.set("persistent_layers", pLayers );
                this.frames.each(function( frame ) {
                    frame.layers.remove( layer );
                });
            }
        },

        togglePersistance: function( layer ) {
            var isPersistant = _.contains( this.get("persistent_layers"), layer.id );

            if( isPersistant ) {
                this.unpersistLayer( layer );
            } else {
                this.persistLayer( layer );
            }
        },

        continueLayerToNextFrame: function( layer ) {
            var currentIndex = _.indexOf( _.toArray( this.frames ), this.status.get("currentFrame") );

            if ( currentIndex != -1 && this.frames.length > currentIndex + 1 ) {
                this.frames.at( currentIndex + 1 ).layers.push( layer );
            }
        }

    });

});