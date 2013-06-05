define(["lodash"],

function() {
    return {
        name: "zeega-project",
        
        validate: function( response ) {
            var project = response.project;

            if ( project.sequences && project.frames && project.layers ) {
                return true;
            }
            return false;
        },
        
        parse: function( response, opts ) {
            return response.project;
        }
    };
});
