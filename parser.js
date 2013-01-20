// parser.js
define([
    "zeega",
    "lodash",
    // modules
    "zeega_parser/modules/project"
],

function( Zeega, _, Project ) {

    return function( data, options ) {
        var project;
        
        // console.log(options);
        // dump project data in to project model
        project = new Project( data, options );
        return project;
    };

});
