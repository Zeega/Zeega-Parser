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
        }

    });

});