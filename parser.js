// parser.js
define([
    "zeega",
    "lodash",
    // modules
    "zeega_parser/modules/project",
    "zeega_parser/data-parsers/_all"
],

function( Zeega, _, Project, DataParser ) {

    return function( response, options ) {
        var parsed;
console.log(options)
        // determine which parser to use
        _.each( DataParser, function( p ) {
            if ( p.validate( response ) ) {
                if ( options.debugEvents ) {
                    console.log( "parsed using: " + p.name );
                }
                // parse the response
                options.parser = p.name;
                parsed = p.parse( response, options );
                return false;
            }
        }.bind( this ));

        if ( parsed !== undefined ) {
            return new Project( parsed, options );
        } else {
            throw new Error("Valid parser not found");
        }
        
    };

});
