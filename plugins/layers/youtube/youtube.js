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
        ignoreFirst: true,
        init: function(){
            if( /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent) ) {
                this.model.set("browserType","mobile");
            } else if( /iPad/i.test(navigator.userAgent) ) {
                this.model.set("browserType","ipad");
            } else {
                this.model.set("browserType","desktop");
            }
        },
        afterRender: function(){
            this.$(".youtube-player").addClass( this.model.get("browserType") );
            this.ytInit();
        },
        events: {
            "click .play-button": "playVideo",
            "tap .play-button": "playVideo"

        },

        ytInit: function(){
            
            window.jQuery(this.$(".youtube-player" )).on("api-ready", jQuery.proxy( this.onApiReady, this) );
            if ( _.isUndefined( window.YT ) ){
                var tag = document.createElement('script');
                tag.src = "//www.youtube.com/iframe_api";
                var firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            } else {
                this.onApiReady();
            }

            
        },

        onPlayerReady: function(e){
            this.model.trigger( "visual_ready", this.model.id );
        },

        onStateChange: function(e){
            if( /iPad/i.test(navigator.userAgent) && e.data ==2 && this.ignoreFirst ) {
                this.ignoreFirst = false;
                this.ytPlayer.playVideo();
            }
            else if(e.data == 2 || e.data == 5){
                if( /iPad/i.test(navigator.userAgent) ) {
                    this.$(".ipad-cover").removeClass("visible");
                }
                this.model.status.get("project").play();
                this.$(".youtube-player").removeClass("active");
                this.$(".play-button").fadeIn("fast");
                
            } else if (e.data == 1 ){
                
                this.$(".play-button").fadeOut("fast");
                this.$(".youtube-player").addClass("active");
               
                if( /iPad/i.test(navigator.userAgent) ) {
                    this.$(".ipad-cover").addClass("visible");
                }
            }
        },

        onApiReady: function(){



            var onPlayerReady = jQuery.proxy( this.onPlayerReady, this),
                onStateChange = jQuery.proxy( this.onStateChange, this);


            this.$("#yt-player-" + this.model.id).attr("id", "yt-player-" + this.model.id + "-" + this.model.cid );

            this.ytPlayer = new YT.Player("yt-player-" + this.model.id + "-" + this.model.cid, {
                    events:{
                        'onReady': onPlayerReady,
                        'onStateChange': onStateChange
                    }
                });
            
            
        },

        playVideo: function(){
            this.model.status.get("project").suspend();
            this.$(".play-button").fadeOut("fast");
            this.$(".youtube-player").addClass("active");
            this.ytPlayer.playVideo();
            window.ytPlayer = this.ytPlayer;
        },

        onExit: function(){
            this.ytPlayer.pauseVideo();
        }

    });

    return Layer;
});