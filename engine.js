// parser.js
define([
    "engine/modules/zeega",
    "engine/data-parsers/_all"
],

function( Zeega, DataParsers ) {

    var Engine = {};

    Engine.parse = function( data, options ) {
        var parsed;

        // determine which parser to use
        _.each( DataParsers, function( p ) {
            if ( p.validate( data ) ) {

                if ( options.debugEvents ) console.log( "parsed using: " + p.name );

                options.parser = p.name;
                // parse the data
                parsed = p.parse( data, options );
                return false;
            }
        }, this );

        return parsed;
    }

    Engine.generateZeega = function( data, options ) {
        var parsed = Engine.parse( data, options );

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
