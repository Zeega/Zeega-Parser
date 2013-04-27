define([
    "app",
    "zeega_parser/modules/layer.model",
    "zeega_parser/modules/layer.visual.view"
],

function( Zeega, LayerModel, Visual ) {


    window.onYouTubeIframeAPIReady = function() {

        jQuery(".youtube-player").trigger("api-ready");
    };

    var Layer = Zeega.module();

    Layer.Youtube = LayerModel.extend({

        layerType: "Youtube",

        attr: {
            title: "Youtube Layer",
            url: "none",
            left: 0,
            top: 0,
            height: 100,
            width: 100,
            citation: true
        },
        controls: [
        ]
    });

    Layer.Youtube.Visual = Visual.extend({

        template: "youtube/youtube",
        init: function(){

        },
        ytInit: function(){
            
            this.$(".youtube-player" ).on("api-ready", jQuery.proxy( this.onApiReady, this) );
            if ( _.isUndefined( window.YT ) ){
                var tag = document.createElement('script');
                tag.src = "//www.youtube.com/iframe_api";
                var firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            }
            
        },

        onApiReady: function(){

            var onPlayerReady = jQuery.proxy( this.onPlayerReady, this );
            var onPlayerStateChange = jQuery.proxy( this.onPlayerStateChange, this );


            function getFrameID(id){
                var elem = document.getElementById(id);
                if (elem) {
                    if(/^iframe$/i.test(elem.tagName)) return id; //Frame, OK
                    // else: Look for frame
                    var elems = elem.getElementsByTagName("iframe");
                    if (!elems.length) return null; //No iframe found, FAILURE
                    for (var i=0; i<elems.length; i++) {
                       if (/^https?:\/\/(?:www\.)?youtube(?:-nocookie)?\.com(\/|$)/i.test(elems[i].src)) break;
                    }
                    elem = elems[i]; //The only, or the best iFrame
                    if (elem.id) return elem.id; //Existing ID, return it
                    // else: Create a new ID
                    do { //Keep postfixing `-frame` until the ID is unique
                        id += "-frame";
                    } while (document.getElementById(id));
                    elem.id = id;
                    return id;
                }
                // If no element, return null.
                return null;
            }


            var frameID = getFrameID("yt-player-" + this.model.id);

            this.ytPlayer = new YT.Player("yt-player-" + this.model.id + "-frame", {
                events: {
                'onReady': onPlayerReady
              }
            });
            
            
        },

        onPlayerReady: function(){
            this.model.trigger( "visual_ready", this.model.id );
        },

        afterRender: function(){
            this.ytInit();
        },

        playPause: function() {
                
        },

        onPlay: function() {

        },

        onPause: function() {
            this.ytPlayer.pauseVideo();
        },

        onExit: function(){
            this.ytPlayer.stopVideo();
        }

    });

    return Layer;
});