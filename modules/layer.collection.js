// layer.js
define([
    "zeega",
    "zeega_parser/modules/layer.model"
],

function( Zeega, LayerModel ) {

    return Zeega.Backbone.Collection.extend({
        model: LayerModel
    });
    
});
