define(["lodash"],

function() {
    var type = "zeega-project-published",
        Parser = {};

    Parser[ type ] = { name: type };

    Parser[ type ].validate = function( response ) {

        if ( response.items && response.items[0].media_type == "project"&& response.items.length==1) {
            return true;
        }
        return false;
    };

    // no op. projects are already formatted
    Parser[type].parse = function( response, opts ) {
        var response = response.items[0].text;

        if ( opts.endPage ) {
            var endId, lastPageId, lastPage, endPage, endLayers;

            endId = -1;
            lastPageId = response.sequences[0].frames[ response.sequences[0].frames.length - 1 ];
            lastPage = _.find( response.frames, function( frame ) {
                return frame.id == lastPageId;
            });
            endPage = _.extend({}, lastPage );

            // only allow images, color layers
            endLayers = _.filter(response.layers, function( layer ) {
                return _.include(["Image", "Rectangle"], layer.type ) && _.include( endPage.layers, layer.id );
            });

            endPage.layers = _.pluck( endLayers, "id");
            endPage.layers.push( endId );

            // add layer to layer array
            response.layers.push({
                id: endId,
                type: "EndPageLayer"
            });
            
            endPage.id = endId;
            response.frames.push( endPage );
            response.sequences[0].frames.push( endId )
            console.log( endPage );
        }

        return response;
    };

    return Parser;
});
