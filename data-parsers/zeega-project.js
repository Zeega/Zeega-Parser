define(["lodash"],

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


    Parser[type].parse = function( response, opts ) {
        
        return response.project;


    };

    return Parser;
});