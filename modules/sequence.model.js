define([
    "app"
],

function( Zeega ) {

    return Zeega.Backbone.Model.extend({

        defaults: {
            advance_to: null,
            attr: {},
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
            this.on("change:frames", this.onFrameSort, this );
        },

        onFrameSort: function() {
            console.log( this.get("frames"), this.frames, this )
            _.each( this.get("frames"), function( frameID, i ) {
                console.log('frameid', frameID )
                this.frames.get( frameID ).set("_order", i );
            }, this );
            this.frames.sort();
        }

    });

});