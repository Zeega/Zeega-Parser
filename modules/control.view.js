// layer.js
define([
    "app",
    "jqueryUI"
],

function( app ) {

    return app.Backbone.View.extend({

        propertyName: "",
        $visual: null,
        $visualContainer: null,
        $workspace: null,

        className: function() {
            return "control control-" + this.propertyName;
        },

        initialize: function() {
            console.log('init:', this.propertyName )
            this.off( "change:" + this.propertyName );
            this.model.on("change:" + this.propertyName , this.onPropertyUpdate, this );
            this.init();
        },

        afterRender: function() {
            this.$visual = this.model.visual.$el.find(".visual-target");
            this.$visualContainer = this.model.visual.$el;
            this.$workspace = this.model.visual.$el.closest(".ZEEGA-workspace");

            this.create();
        },

        init: function() {},
        create: function() {},
        destroy: function() {},

        update: function( attributes ) {
            var attr = _.extend({}, this.model.get("attr"), attributes );

            this.model.trigger("change:" + this.propertyName, this.model, attributes[ this.propertyName ] );
            this.model.save("attr", attr );
        },

        lazyUpdate: _.debounce(function( value ) {
            var attr = {};
            
            attr[ this.propertyName ] = value;
            this.update( attr );
        }, 500 ),

        updateVisual: function( value ) {
            this.$visual.css( this.propertyName, value );
        },

        // convenience fxn
        getAttr: function( key ) {
            return this.model.get("attr")[key];
        },

        serialize: function() {
            return this.model.toJSON();
        },

        fetch: function( path ) {
            // Initialize done for use in async-mode
            var done;
            // Concatenate the file extension.
            path = app.parserPath + "plugins/controls/" + path + ".html";
            // remove app/templates/ via regexp // hacky? yes. probably.
            path = path.replace("app/templates/","");

            // If cached, use the compiled template.
            if ( JST[ path ] ) {
                return JST[ path ];
            } else {
                // Put fetch into `async-mode`.
                done = this.async();
                // Seek out the template asynchronously.
                return app.$.ajax({ url: app.root + path }).then(function( contents ) {
                    done(
                      JST[ path ] = _.template( contents )
                    );
                });
            }
        }

    });

});
