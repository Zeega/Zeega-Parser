define([
    "app"
],

function( app ) {

    return app.Backbone.View.extend({

        selectedFrame: null,

        template: "link/frame-chooser",
        serialize: function() {
            return this.model.toJSON();
        },
        className: "frame-chooser overlay-dimmer modal",

        events: {
            "click .close": "closeThis",
            "click .submit": "submit",
            "click .frame" : "selectFrame",
            "click .link-new-frame": "linkToNewFrame"
        },

        closeThis: function() {
            this.$el.fadeOut(function() {
                this.remove();
            }.bind( this ));
        },

        submit: function() {
            if ( this.selectedFrame !== null ) {
                this.model.saveAttr({ link_to: this.selectedFrame });
            }
            this.closeThis();
        },

        selectFrame: function( e ) {
            var $frameLI = $(e.target).closest("li");

            if ( !$frameLI.hasClass("inactive") ) {
                this.$(".frame-chooser-list li.active").removeClass("active");
                $frameLI.addClass("active");
                this.selectedFrame = $frameLI.data("id");
            }
        },

        linkToNewFrame: function() {
            var newFrame = app.status.get("currentSequence").frames.addFrame();

            newFrame.once("sync", this.onNewFrameSave, this );
            this.closeThis();
        },

        onNewFrameSave: function( newFrame ) {
            this.model.saveAttr({ link_to: newFrame.id });
        },

        afterRender: function() {
            this.$(".frame-chooser-list").empty();
            app.status.get("currentSequence").frames.each(function( frame ) {
                var fv = $("<li>");

                fv.addClass("frame")
                    .data("id", frame.id )
                    .css({
                        background: frame.get("thumbnail_url")
                    });

                if ( app.status.get("currentFrame").id == frame.id ) {
                    fv.addClass("inactive");
                }

                if ( this.model.getAttr("link_to") ) {
                    fv.addClass("active");
                }

                this.$('.frame-chooser-list').append( fv );
            }, this );
        },

        fetch: function( path ) {
            // Initialize done for use in async-mode
            var done;
            // Concatenate the file extension.
            path = app.parserPath + "plugins/layers/" + path + ".html";
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