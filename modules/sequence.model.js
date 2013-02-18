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
        }

    });

});