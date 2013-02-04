define([
    "zeega_parser/modules/project.model"
],

function( ProjectModel ) {

    return {

        name: "zeega-project-model",
        
        validate: function( response ) {
            if ( response.sequences && ( response instanceof ProjectModel ) ) {
                return true;
            }
            return false;
        },

        parse: function( response, opts ) {
            return response;
        }
    };

});
