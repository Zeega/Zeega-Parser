define([
    "engine/data-parsers/_all"
],

function( DataParsers ) {

    return function( data, options ) {
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

});
