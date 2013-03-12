define([
    "app",
    "zeega_parser/modules/layer.model",
    "zeega_parser/modules/layer.visual.view"
],
function( Zeega, _Layer, Visual ) {

    var Layer = Zeega.module();

    Layer.Text = _Layer.extend({
        // TODO: is the redundant naming necessary? If this program knows
        // this is a Layer, wouldn't "type" be sufficient?
        layerType: "Text",

        attr: {
            citation: false,
            color: "#F0F",
            content: "text",
            fontSize: 500,
            default_controls: true,
            left: 30,
            opacity: 1,
            title: "Text Layer",
            top: 40,
            width: 25
        },

        controls: [
            {
                type: "resize",
                options: {
                    aspectRatio: false,
                    handles: "e"
                }
            },
            "rotate",
            {
                type: "checkbox",
                options: {
                    title: "fade in",
                    propertyName: "dissolve"
                }
            },
            { type: "slider",
                options: {
                    title: "<i class='icon-eye-open icon-white'></i>",
                    propertyName: "opacity",
                    min: 0,
                    max: 1,
                    step: 0.001,
                    css: true
                }
            },
            { type: "color",
                options: {
                    title: "color",
                    propertyName: "color"
                }
            },
            "textbar"
        ]
    });

    Layer.Text.Visual = Visual.extend({

        template: "text/text",

        visualProperties: [
            "top",
            "left",
            "width",
            "opacity"
        ],

        serialize: function() {
            return this.model.toJSON();
        },

        saveContent: null,

        init: function() {
            this.saveContent = _.debounce(function() {
                this.model.saveAttr({
                    title: this.$(".visual-target").text(),
                    content: this.$(".visual-target").html()
                });
            }.bind( this ), 1000);
        },

        afterEditorRender: function() {
            this.$el.css({
                color: this.model.get("attr").color,
                fontSize: this.model.get("attr").fontSize + "%"
            });

            this.$(".visual-target").attr("contenteditable", "true");

            this.$el.append(
                "<a class='drag-handle drag-handle-nw'><span class='icon-area'><i class='icon-move'></i></span></a>" +
                "<a class='drag-handle drag-handle-ne'><span class='icon-area'><i class='icon-move'></i></span></a>" +
                "<a class='drag-handle drag-handle-se'><span class='icon-area'><i class='icon-move'></i></span></a>" +
                "<a class='drag-handle drag-handle-sw'><span class='icon-area'><i class='icon-move'></i></span></a>"
            );
            this.makeDraggable();
            this.listen();
        },

        makeDraggable: function() {
            this.$el.draggable({
                handle: ".drag-handle",
                stop: function( e, ui ) {
                    var top, left, workspace;

                    workspace = this.$el.closest(".ZEEGA-workspace");
                    top = ui.position.top / workspace.height() * 100;
                    left = ui.position.left / workspace.width() * 100;

                    this.model.saveAttr({
                        top: top,
                        left: left
                    });

                    this.convertToPercents( top, left );
                }.bind( this )
            });
        },

        convertToPercents: function( top, left ) {
            this.$el.css({
                top: top + "%",
                left: left + "%"
            });
        },

        listen: function() {
            this.$(".visual-target")
                .keyup(function(e){
                    if ( e.which == 27 ) {
                        this.$(".visual-target").blur();
                    }
                    this.saveContent();
                }.bind( this ))

                .bind("paste", function(e){
                    _.delay(function() {
                        this.$(".visual-target").html( this.$(".visual-target").text() );
                        this.lazyUpdate({ content: this.$(".visual-target").text() });
                    }, 500);
                }.bind( this ));

            this.$(".visual-target").blur(function() {
                this.saveContent();
            }.bind( this ));
        },

        

        lazyUpdate: _.debounce(function( value ) {
            var attr = {};
            
            attr[ this.propertyName ] = value;
            this.model.saveAttr( attr );
        }, 500 )
  });

  return Layer;
});
