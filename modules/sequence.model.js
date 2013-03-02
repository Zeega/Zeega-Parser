define([
    "app",
    "zeega_parser/plugins/layers/_all"
],

function( app, Layers ) {

    return app.Backbone.Model.extend({

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
                return app.api +'sequences/' + this.id;
            }
        },

        initialize: function() {
            // this.on("change:frames", this.onFrameSort, this );
        },

        onFrameSort: function() {
            _.each( this.get("frames"), function( frameID, i ) {
                this.frames.get( frameID ).set("_order", i );
            }, this );
            this.frames.sort();
        },

        setSoundtrack: function( item, view ) {
            var newLayer;
console.log("set sndtrack", this.get("attr").soundtrack, this );
            if ( this.get("attr").soundtrack ) {
                var layer = app.project.getLayer( this.get("attr").soundtrack );

                console.log("rm sndtrack", this.get("attr").soundtrack, layer );
                this.removeSoundtrack( layer, false ); // does not work
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

                attr.soundtrack = newLayer.id;
                this.set("attr", attr ); //save
                this.persistLayer( newLayer );
                view.setSoundtrackLayer( newLayer );
            }.bind( this ));
        },

        removeSoundtrack: function( layer, save ) {
            var attr = this.get("attr");

            attr.soundtrack = false;

            this.set("attr", attr );
            if ( save ) {
                this.save();
            }
            this.unpersistLayer( layer );
        },

        persistLayer: function( layer ) {
            if ( !_.contains( layer.id, this.get("persistent_layers") ) ) {
                var pLayers = this.get("persistent_layers");

                pLayers.push( layer.id );
                this.set("persistent_layers", pLayers ); //save
                this.frames.each(function( frame ) {
                    layer.order[ frame.id ] = frame.layers.length;
                    frame.layers.add( layer );
                });
            }
        },

        unpersistLayer: function( layer ) {
            if ( _.contains( this.get("persistent_layers"), layer.id ) ) {
                var pLayers = _.without( this.get("persistent_layers"), layer.id );

                this.set("persistent_layers", pLayers ); //save
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