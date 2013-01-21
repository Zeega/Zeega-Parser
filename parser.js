// parser.js
define([
    "zeega",
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

                // is the data already a zeega project model? if so, then just pass it through
                if ( p.name == "zeega-project-model" ) {
                    return false;
                } else {
                    // parse the data
                    parsed = p.parse( data, options );
                }
                return false;
            }
        }, this );

        // pass the data model through.
        // TODO: what to do about adding or modifying options?
        if ( options.parser = "zeega-project-model" ) {
            return data;
        } else if ( parsed !== undefined ) {
            return new ProjectModel( parsed, options );
        } else {
            throw new Error("Valid parser not found");
        }
    };

    return ZeegaParser;
});
