define([
    "app",
    "engine/modules/layer.model",
    "engine/modules/layer.visual.view"
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

        afterRender: function(){
            
            if( /iPhone|iPod/i.test(navigator.userAgent) ) {
                this.$(".youtube-player").addClass( "mobile" );
            } else if( /iPad/i.test(navigator.userAgent) ) {
                this.$(".youtube-player").addClass( "ipad" );
            }

            if (Zeega.mode == "editor" ){
                this.$el.addClass("editor");
                this.$el.css({"top": "46%", "left": "46%", "width": "16%", "height": "16%"});
            }

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
            var currentSequence;

            if( this.model.status.get("current_sequence_model")){
                currentSequence = this.model.status.get("current_sequence_model");
            } else {
                currentSequence = this.model.status.get("currentSequence");
            }

            if( currentSequence.get("attr").soundtrack && /iPad/i.test(navigator.userAgent) && e.data ==2 && this.ignoreFirst ) {
                this.ignoreFirst = false;
                this.ytPlayer.playVideo();
            } else if (e.data == 2 || e.data == 5){
                if( /iPad/i.test(navigator.userAgent) ) {
                    this.$(".ipad-cover").removeClass("visible");
                }
                if( Zeega.mode == "player"){
                    this.model.status.get("project").play();
                } else if (Zeega.mode == "editor" ){
                    this.$el.addClass("editor");
                    this.$el.css({"top": "46%", "left": "46%", "width": "16%", "height": "16%"});
                }

                this.$(".youtube-player").removeClass("active");
                this.$(".play-button").fadeIn("fast");
                
            } else if ( e.data == 1 ){
                if( Zeega.mode == "player"){
                    this.model.status.get("project").suspend();
                }
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

            if( Zeega.mode == "player"){
                this.model.status.get("project").suspend();
            } else if ( Zeega.mode == "editor" ){
                this.$el.removeClass("editor");
                this.$el.css({"top": "0", "left": "0", "width": "100%", "height": "100%"}, 1000);
            }

            this.$(".play-button").fadeOut("fast");
            this.$(".youtube-player").addClass("active");
            this.ytPlayer.playVideo();
        },

        onExit: function(){
            this.ytPlayer.pauseVideo();
            if( Zeega.mode == "player"){
                this.model.status.get("project").play();
            }
        }

    });

    return Layer;
});