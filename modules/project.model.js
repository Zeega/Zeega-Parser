define([
    "app",
    "zeega_parser/modules/sequence.collection"
],

function( app, SequenceCollection ) {

    return app.Backbone.Model.extend({

        updated: false,
        frameKey: {},

        defaults: {
            authors: null,
            cover_image: "",
            date_created: null,
            date_published: null,
            date_updated: null,
            description: null,
            enabled: true,
            estimated_time: null,
            frames: [],
            id: null,
            item_id: null,
            layers: [],
            location: null,
            published: true,
            sequences: [],
            tags: "",
            title: "Untitled",
            user_id: null
        },

        defaultCoverImages: [
            "http://giphy.com/gifs/VxbP9tLeKzazm",
            "http://giphy.com/gifs/4lLVnnMbawnss",
            "http://giphy.com/gifs/bq6gi8shRqgyA",
            "http://giphy.com/gifs/BDqInV6xYl1Ju",
            "http://giphy.com/gifs/k0ywWCPu4IlEs",
            "http://giphy.com/gifs/Mi6gE0Qjw2dWM",
            "http://www.musicobsessed.com/wp-content/gallery/sfmo/tv-set-funky-cuteo.gif",
            "http://24.media.tumblr.com/tumblr_m8582nac7y1r0k830o1_500.gif",
            "http://24.media.tumblr.com/tumblr_lnxkb8K8u61qjvkx9o1_500.gif",
            "http://25.media.tumblr.com/tumblr_mbjwlvwO5R1reeolao1_500.gif",
            "http://reignandpour.com/home_files/tv.gif",
            "http://s8.favim.com/orig/72/gif-animated-gif-tv-static-glitch-Favim.com-687367.gif",
            "http://alaingiffard.files.wordpress.com/2007/12/applaudissements-001_1173713587.gif",
            "http://www.poly.edu/sites/polyproto.poly.edu/files/cinemaNOISE.gif"
        ],

        defaultOptions: {
            preloadRadius: 2,
            attach: {}
        },

        url : function() {
            return app.api +'projects/' + this.id;
        },

        initialize: function( data, options ) {
            // if ( this.get("cover_image") == "" ) {
            //     this.set("cover_image", this.defaultCoverImages[ Math.floor( Math.random() * this.defaultCoverImages.length ) ])
            // }
            this.options = _.defaults( options, this.defaultOptions );
            this.parser = options.parser;
            this.parseSequences();
        },

        parseSequences: function() {
            this.sequences = new SequenceCollection( this.get("sequences") );

            this.sequences.initFrames( this.get("frames"), this.get("layers"), this.options );

            this._generateFrameSequenceKey();
            this._setInnerSequenceConnections();
            this._setLinkConnections();
            this._setFramePreloadArrays();
            this._setFrameCommonLayers();
            this._attach();
        },

        // potentially not needed if there is only one sequence
        _generateFrameSequenceKey: function() {
            this.sequences.each(function( sequence ) {
                sequence.frames.each(function( frame ) {
                    this.frameKey[ frame.id ] = sequence.id;
                }, this );
            }, this );
        },

        addFrameToKey: function( frameId, sequenceId ) {
            this.frameKey[ frameId ] = sequenceId;
        },

        // [ _last ] [ current ] [ _next ]
        _setInnerSequenceConnections: function() {
            this.sequences.each(function( sequence, i ) {
                var frames = sequence.frames;

                if ( frames.length > 1 ) {
                    frames.each(function( frame, j ) {
                        frame.put({
                            _next: frame.get("attr").advance && frames.at( j + 1 ) ? frames.at( j + 1 ).id : null,
                            _last: frames.at( j - 1 ) ? frames.at( j - 1 ).id : null
                        });
                    });
                }
            });
        },

        _setLinkConnections: function() {
            this.sequences.each(function( sequence ) {
                sequence.frames.each(function( frame ) {
                    var linksTo = [];

                    frame.layers.each(function( layer ) {
                        if ( layer.get("type") == "Link" && layer.get("attr").to_frame != frame.id ) {
                            var targetFrameID, targetFrame, linksFrom;

                            targetFrameID = parseInt( layer.get("attr").to_frame, 10 );
                            targetFrame = this.getFrame( targetFrameID );

                            if ( targetFrame ) {
                                linksFrom = [].concat( targetFrame.get("linksFrom") );

                                linksTo.push( targetFrameID );
                                linksFrom.push( frame.id );

                                targetFrame.put("linksFrom", linksFrom );
                            }
                        }
                    }, this );

                    frame.put( "linksTo", linksTo );
                }, this );
            }, this );
        },

        _setFramePreloadArrays: function() {
            this.sequences.each(function( sequence ) {
                var nextSequence = sequence.get("advance_to") || false;

                sequence.frames.each(function( frame ) {
                    var nextFrame = frame.get("_next"),
                        prevFrame = frame.get("_prev"),
                        preloadTargets = [ frame.id, nextFrame, prevFrame ];

                    for ( var i = 0; i < this.options.preloadRadius - 1; i++ ) {
                        nextFrame = nextFrame ? this.getFrame( nextFrame ).get("_next") : null;
                        prevFrame = prevFrame ? this.getFrame( prevFrame ).get("_prev") : null;

                        if ( !nextFrame && !prevFrame ) {
                            break;
                        }
                        preloadTargets.push( nextFrame, prevFrame );
                    }

                    if( nextSequence ) {
                        preloadTargets.push( this.sequences.get( nextSequence ).get("frames")[0] );
                    }

                    preloadTargets = preloadTargets.filter( Boolean );

                    this._setConnections( frame );

                    frame.put( "preload_frames",
                        _.union(
                            preloadTargets, frame.get("linksTo"), frame.get("linksFrom")
                        )
                    );

                }, this );
            }, this );

        },

        _setConnections: function( frame ) {
            var prev, next;

            prev = frame.get("_prev"),
            next = frame.get("_next");

            frame.put( "_connections",
                frame.get("attr").advance && prev && next ? "lr" :
                frame.get("attr").advance && !prev && next ? "r" :
                !frame.get("attr").advance && prev && next ? "l" :
                !frame.get("attr").advance && !prev && next ? "none" :
                !frame.get("attr").advance && prev && !next ? "l" :
                "none"
            );
        },

        _setFrameCommonLayers: function() {
            this.sequences.each(function( sequence ) {
                sequence.frames.each(function( frame ) {
                    var commonLayers = {},
                        linkedFrames = [ "_prev", "_last", "_next", "linksTo", "linksFrom" ].map(function( value ) {
                        return frame.get( value );
                    });

                    linkedFrames = _.compact( _.flatten( linkedFrames ) );

                    _.each( _.uniq( linkedFrames ), function( frameID ) {
                        var targetFrame = this.getFrame( frameID );
                        
                        commonLayers[ frameID ] = _.intersection( targetFrame.get("layers"), frame.get("layers") );
                    }, this );
                    frame.put("common_layers", commonLayers );
                }, this );
            }, this );
        },

        _attach: function() {
            this.sequences.each(function( sequence ) {
                _.extend( sequence, this.options.attach );
                sequence.frames.each(function( frame ) {
                    _.extend( frame, this.options.attach );
                    frame.layers.each(function( layer ) {
                        _.extend( layer, this.options.attach );
                    }, this );
                }, this );
            }, this );
        },

        getProjectJSON: function() {
            var frames = [], layers = [];

            this.sequences.each(function( sequence ) {
                frames = frames.concat( sequence.frames.toJSON() );
                sequence.frames.each(function( frame ) {
                    layers = layers.concat( frame.layers.toJSON() );
                });
                if ( sequence.soundtrackModel ) {
                    layers = layers.concat( [ sequence.soundtrackModel.toJSON() ] );
                }
            });

            return _.extend({}, this.toJSON(), {
                sequences: this.sequences.toJSON(),
                frames: frames,
                layers: _.uniq( layers )
            });
        },

        getFrame: function( frameID ) {
            var sequence = this.sequences.get( this.frameKey[ frameID ] );

            if ( sequence ) {
                return this.sequences.get( this.frameKey[ frameID ] ).frames.get( frameID );
            } else {
                return false;
            }
        },

        // TODO keep a central repo of layers!
        // this is not the best. cache these somewhere in a big collection?
        getLayer: function( layerID ) {
            var layerModel;

            this.sequences.each(function( sequence ) {
                sequence.frames.each(function( frame ) {
                    var layer = frame.layers.get( layerID );

                    if ( layer ) {
                        layerModel = layer;
                        return false;
                    }
                });
            });

            return layerModel;
        },

        /* editor */

        publishProject: function() {

            if ( this.get("date_updated") != this.get("date_published") || this.updated ) {
                this.updated = false;
                this.once("sync", this.onProjectPublish, this);

                if ( !this.get("published") ) {
                     this.set({ published: true });
                }
                this.save({
                    publish_update: 1,
                    mobile: true
                });
                console.log("already published. published again");
            } else {
                this.trigger("update_buttons");
            }
        },

        onProjectPublish: function( model, response ) {
            this.set({ publish_update: 0 });
        }

    });

});