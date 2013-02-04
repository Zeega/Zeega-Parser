define(["lodash"],

function() {

    return {
        name: "zeega-project-published",

        validate: function( response ) {
            if ( response.items && response.items[0].media_type == "project"&& response.items.length==1) {
                return true;
            }
            return false;
        },

        parse: function( response, opts ) {
            return response.items[0].text;
        }
    };
});
