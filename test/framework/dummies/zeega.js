// layer.js
define([
    "backbone"
],

function( Backbone ) {

    Backbone.LayoutView = Backbone.View;

    Backbone.Model.prototype.put = function() {
        var args = [].slice.call( arguments ).concat([ { silent: true } ]);
        return this.set.apply( this, args );
    };

    var Zeega = {
        Backbone: Backbone,

        module: function() {
            return {};
        }
    };

    return Zeega;
});
