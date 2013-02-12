// layer.js
define([
    "app"
],

function( Zeega ) {

    return Zeega.Backbone.View.extend({

        className: "visual-control",
        template: "",

        fetch: function( path ) {
            // Initialize done for use in async-mode
            var done;
            // Concatenate the file extension.
            path = Zeega.parserPath + "plugins/controls/" + path + ".html";
            // remove app/templates/ via regexp // hacky? yes. probably.
            path = path.replace("app/templates/","");

            // If cached, use the compiled template.
            if ( JST[ path ] ) {
                return JST[ path ];
            } else {
                // Put fetch into `async-mode`.
                done = this.async();
                // Seek out the template asynchronously.
                return Zeega.$.ajax({ url: Zeega.root + path }).then(function( contents ) {
                    done(
                      JST[ path ] = _.template( contents )
                    );
                });
            }
        },

        serialize: function() {
            return this.model.toJSON();
        }

    });

});
