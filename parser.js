// parser.js
define([
    "app",
    "lodash",

    "zeega_parser/modules/project.model",
    "zeega_parser/data-parsers/_all"
],

function( Zeega, _, ProjectModel, DataParser ) {

    var ZeegaParser = {};

    ZeegaParser.parse = function( data, options ) {
        var parsed;

        // determine which parser to use
        _.each( DataParser, function( p ) {
            if ( p.validate( data ) ) {
                if ( options.debugEvents ) {
                    console.log( "parsed using: " + p.name );
                }
                options.parser = p.name;

                // parse the data
                parsed = p.parse( data, options );
                return false;
            }
        }, this );

        if ( parsed !== undefined ) {
            return new ProjectModel( parsed, options );
        } else {
            throw new Error("Valid parser not found");
        }
    };

    return ZeegaParser;
});
