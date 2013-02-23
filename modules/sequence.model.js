define([
    "app",
    "zeega_parser/plugins/layers/_all"
],

function( Zeega, Layers ) {

    return Zeega.Backbone.Model.extend({

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
                return Zeega.api + 'projects/'+ Zeega.project.id +'/sequences';
            } else {
                return Zeega.api +'sequences/' + this.id;
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

            if ( this.get("attr").soundtrack ) {
                this.removeSoundtrack(); // does not work
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

                attr.soundtrack = newLayer.id
                this.set("attr", attr ); //save
                this.persistLayer( newLayer );
                view.setSoundtrackLayer( newLayer );
            }.bind( this ));
        },

        removeSoundtrack: function( layer ) {
            var attr = this.get("attr");

            attr.soundtrack = false;
            this.set("attr", attr ); //save
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

                this.save("persistent_layers", pLayers ); //save
                this.frames.each(function( frame ) {
                    frame.layers.remove( layer );
                });
            }
        }

    });

});