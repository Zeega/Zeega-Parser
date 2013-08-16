define([
    "app",
    "engine/plugins/layers/_all"
],

function( app, Layers ) {

    return app.Backbone.Model.extend({

        defaults: {
            attr: {
                soundtrack: false
            },
            frames: [],
            id: null
        },

        url : function() {
            if ( this.isNew() ) {
                return app.getApi() + 'projects/'+ app.zeega.getCurrentProject().id +'/sequences';
            } else {
                return app.getApi() + 'projects/'+ app.zeega.getCurrentProject().id +'/sequences/' + this.id;
            }
        },

        lazySave: null,

        initialize: function() {
            this.lazySave = _.debounce(function() {
                this.save();
            }.bind( this ), 1000 );
            this.initSaveEvents();
        },

        onFrameSort: function() {
            _.each( this.get("frames"), function( frameID, i ) {
                this.frames.get( frameID ).set("_order", i );
            }, this );
            this.frames.sort();
        },

        setSoundtrack: function( item, view, eventData ) {
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

            newLayer.eventData = eventData;
            newLayer.save().success(function( response ) {
                var attr = this.get("attr");

                if ( _.isArray( attr ) ) {
                    attr = {};
                }
                app.emit("soundtrack_added_success", newLayer);
                this.soundtrackModel = newLayer;
                attr.soundtrack = newLayer.id;
                this.set("attr", attr );
                view.setSoundtrackLayer( newLayer );
                this.lazySave();

            }.bind( this ));
        },

        removeSoundtrack: function( layer ) {
            var attr = this.get("attr");
            
            app.emit("soundtrack_delete", layer);
            layer.destroy();
            attr.soundtrack = false;
            this.set("attr", attr );
        },

        continueLayerToNextFrame: function( layer ) {
            var currentIndex = _.indexOf( _.toArray( this.frames ), this.status.get("currentFrame") );

            if ( currentIndex != -1 && this.frames.length > currentIndex + 1 ) {
                this.frames.at( currentIndex + 1 ).layers.push( layer );
            }
        }

    });

});