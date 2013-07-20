// parser.js
define([
    "engine/modules/zeega",
    "engine/parser"
],

function( Zeega, Parser ) {

    var Engine = {};

    Engine.generateZeega = function( data, options ) {
        var parsed = Parser( data, options );

        if ( parsed !== undefined ) {
            return new Zeega( options, {
                    projects: [ parsed ]
                });
        } else {
            throw new Error("Valid parser not found");
        }
    };

    return Engine;
});
