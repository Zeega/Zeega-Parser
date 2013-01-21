define([
    "zeega_parser/modules/project.model"
],

function( ProjectModel ) {
    var type = "zeega-project-model",
        Parser = {};

    Parser[ type ] = { name: type };

    Parser[ type ].validate = function( response ) {

        if ( response.sequences && ( response instanceof ProjectModel ) ) {
            return true;
        }
        return false;
    };

    // no op. projects are already formatted
    Parser[type].parse = function( response, opts ) {
        return response;
    };

    return Parser;
});
