define([],

function() {
    var type = "zeega-project",
        Parser = {};

    Parser[ type ] = { name: type };

    Parser[ type ].validate = function( response ) {
        if ( response.project && response.project.sequences && response.project.frames && response.project.layers ) {
            return true;
        }
        return false;
    };

    var getSoundtrackID = function( response ) {
        return response.sequences[0].attr.soundtrack || false;
    }

    var removeDupeSoundtrack = function( response ) {
        var soundtrackID = getSoundtrackID( response );

        if ( soundtrackID ) {
            _.each( response.frames, function( frame ) {
                frame.layers = _.without( frame.layers, soundtrackID );
            });
        }
    };

    var getSoundtrackLayer = function( response ) {
        var soundtrackID = getSoundtrackID( response );

        if ( soundtrackID ) {
            var soundtrackLayer = _.find( response.layers, function( layer ) {
                return layer.id == soundtrackID;
            });

            return soundtrackLayer || false;
        }
        return false;
    }

    // no op. projects are already formatted
    Parser[type].parse = function( response, opts ) {
        removeDupeSoundtrack( response.project );
        response.project._soundtrack = getSoundtrackLayer( response.project );

        if ( opts.endPage ) {
            var endId, lastPageId, lastPage, endPage, endLayers;

            endId = -1;
            lastPageId = response.project.sequences[0].frames[ response.project.sequences[0].frames.length - 1 ];
            lastPage = _.find( response.project.frames, function( frame ) {
                return frame.id == lastPageId;
            });
            endPage = _.extend({}, lastPage );

            // only allow images, color layers
            endLayers = _.filter(response.project.layers, function( layer ) {
                return _.include(["Image", "Rectangle"], layer.type ) && _.include( endPage.layers, layer.id );
            });

            endPage.layers = _.pluck( endLayers, "id");
            endPage.layers.push( endId );

            // add layer to layer array
            response.project.layers.push({
                id: endId,
                type: "EndPageLayer"
            });
            
            endPage.id = endId;
            response.project.frames.push( endPage );
            response.project.sequences[0].frames.push( endId );
        }

        return response.project;
    };

    return Parser;
});