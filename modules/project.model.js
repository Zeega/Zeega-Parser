define([
    "app",
    "engine/modules/page.collection"
],

function( app, PageCollection ) {

    return app.Backbone.Model.extend({

        pages: null,
        zeega: null,

////

        updated: false,
        frameKey: {},
        modelType: "project",

        defaults: {
            id: null,
            user: {
                id: null,
                display_name: "",
                username: "",
                thumbnail_url: ""
            },
            title: "",
            date_created: null,
            date_updated: null,
            date_published: null,
            tags: [],
            authors: "",
            cover_image: "",
            enabled: true,
            estimated_time: "",
            description: "",
            location: "",
            item_id: null,
            mobile: true,
            published: true,
            views: 0,
            editable: true,
            favorite: false,
            favorite_count: 0,
            
            sequences: [],
            frames: [],
            layers: [],

            remix: {
                remix: false
            }
        },

        defaultOptions: {
            // preloadRadius: 2,
            // attach: {}, // ?
            // aspect_ratio: 0.751174, // ?
            // mode: "editor" // ?
        },

        url : function() {
            return app.api +'projects/' + this.id;
        },

        initialize: function( data, options ) {
            this.pages = new PageCollection( this.get("frames") );
            this.pages.loadLayers( this.get("layers") );
            this.pages.setPageOrder( this.get("sequences")[0] )

            this.initSaveEvents();
        },




        ///////




        getProjectJSON: function() {
            var frames = [], layers = [];

            this.sequences.each(function( sequence ) {
                frames = frames.concat( sequence.frames.toJSON() );
                sequence.frames.each(function( frame ) {
                    layers = layers.concat( frame.layers.toJSON() );
                });
                if ( sequence.soundtrackModel ) {
                    layers = layers.concat( [ sequence.soundtrackModel.toJSON() ] );
                }
            });

            return _.extend({}, this.toJSON(), {
                sequences: this.sequences.toJSON(),
                frames: frames,
                layers: _.uniq( layers )
            });
        },

        getFrame: function( frameID ) {
            
        },

        // TODO keep a central repo of layers!
        // this is not the best. cache these somewhere in a big collection?
        getLayer: function( layerID ) {
            
        },

        /* editor */

        publishProject: function() {

            if ( this.get("date_updated") != this.get("date_published") || this.updated ) {
                this.updated = false;
                this.once("sync", this.onProjectPublish, this);

                if ( !this.get("published") ) {
                     this.set({ published: true });
                }
                this.save({
                    publish_update: 1,
                    mobile: true
                });
                console.log("already published. published again");
            } else {
                this.trigger("update_buttons");
            }
        },

        onProjectPublish: function( model, response ) {
            this.set({ publish_update: 0 });
        }

    });

});