define([


    ],

function() {
    var type = "zeega-project",
        Parser = {};

    Parser[ type ] = { name: type };

    Parser[ type ].validate = function( response ) {
        var project = response.project;

        if ( project.sequences && project.frames && project.layers ) {
            return true;
        }
        return false;
    };

    var removeDupeSoundtrack = function( project ) {
        
        if ( project.sequences[0].attr.soundtrack ) {
            _.each( project.frames, function( frame ) {
                frame.layers = _.without( frame.layers, project.sequences[0].attr.soundtrack );
            });
        }
    };

    // no op. projects are already formatted
    Parser[type].parse = function( response, opts ) {
        
        var project = response.project;


        removeDupeSoundtrack( project );
        
        if ( opts.endPage ) {
            var endId, lastPageId, lastPage, endPage, endLayers;

            endId = -1;
            lastPageId = project.sequences[0].frames[ project.sequences[0].frames.length - 1 ];
            lastPage = _.find( project.frames, function( frame ) {
                return frame.id == lastPageId;
            });
            endPage = _.extend({}, lastPage );

            // only allow images, color layers
            endLayers = _.filter(project.layers, function( layer ) {
                return _.include(["Image", "Rectangle"], layer.type ) && _.include( endPage.layers, layer.id );
            });

            endPage.layers = _.pluck( endLayers, "id");
            endPage.layers.push( endId );

            // add layer to layer array
            project.layers.push({
                id: endId,
                type: "EndPageLayer"
            });
            
            endPage.id = endId;
            project.frames.push( endPage );
            project.sequences[0].frames.push( endId );
        }

        return project;
    };

    return Parser;
});
