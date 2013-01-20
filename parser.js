// parser.js
define([
    "zeega",
    "lodash",
    // modules
    "zeega_parser/modules/project"
],

function( Zeega, _, Project ) {

    return function( data, options ) {
        return new Project( data, options );
    };

});
