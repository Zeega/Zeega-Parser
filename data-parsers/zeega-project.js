define(["lodash"],

function() {
    return {
        name: "zeega-project",
        
        validate: function( response ) {

            if ( response.sequences && response.frames && response.layers ) {
                return true;
            }
            return false;
        },
        
        parse: function( response, opts ) {
            return response;
        }
    };
});
