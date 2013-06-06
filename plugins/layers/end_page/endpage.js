define([
    "player/app",
    "engine/modules/layer.model",
    "engine/modules/layer.visual.view"
],

function( app, Layer, Visual ){

    var L = {};

    L.EndPageLayer = Layer.extend({

        layerType: "EndPage",

        attr: {
            title: "End Page Layer",
            height: 112.67,
            width: 236.72,
            top: -6.57277,
            left: -68.4375,
            opacity: 1,
            aspectRatio: null,
            dissolve: true
        }

    });

    L.EndPageLayer.Visual = Visual.extend({

        template: "end_page/endpage",

        visualProperties: [
            "height",
            "width",
            "opacity"
        ],

        onPlay: function() {
            app.status.emit("endpage_enter");
        },

        onExit: function() {
            app.status.emit("endpage_exit");
        }
    });

    return L;
});
