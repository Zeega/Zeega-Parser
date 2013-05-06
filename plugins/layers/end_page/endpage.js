define([
    "app",
    "zeega_parser/modules/layer.model",
    "zeega_parser/modules/layer.visual.view"
],

function( app, Layer, Visual ){

    var L = {};

    L.EndPageLayer = Layer.extend({

        layerType: "EndPage",

        attr: {
            title: "End Page Layer",
            left: 0,
            top: 0,
            height: 100,
            width: 100,
            width: null,
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

        serialize: function() {

            return _.extend({},
                this.model.toJSON(),
                app.status.get("project").project.toJSON(),
                app.metadata
            );
        },

        onPlay: function() {
            app.status.emit("endpage_enter");
        },

        onExit: function() {
            app.status.emit("endpage_exit");
        }
    });

    return L;
});
