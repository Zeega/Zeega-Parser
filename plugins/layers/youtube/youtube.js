define([
    "app",
    "zeega_parser/modules/layer.model",
    "zeega_parser/modules/layer.visual.view"
],

function( Zeega, LayerModel, Visual ) {


    window.onYouTubeIframeAPIReady = function() {

        window.jQuery(".youtube-player").trigger("api-ready");
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
        afterRender: function(){
            this.ytInit();
        },
        ytInit: function(){
            
            window.jQuery(this.$(".youtube-player" )).on("api-ready", jQuery.proxy( this.onApiReady, this) );
            if ( _.isUndefined( window.YT ) ){
                var tag = document.createElement('script');
                tag.src = "//www.youtube.com/iframe_api";
                var firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            }
            
        },

        onApiReady: function(){

            this.ytPlayer = new YT.Player("yt-player-" + this.model.id, { });

            if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
                this.$(".mobile-cover").show();
            }

            this.model.trigger( "visual_ready", this.model.id );
            
        },

        onExit: function(){
            this.ytPlayer.stopVideo();
        }

    });

    return Layer;
});