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
            default_controls: true,
            left: 30,
            opacity: 1,
            title: "Text Layer",
            top: 40,
            width: 25
        },

        controls: [
            // "position",
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
            }
        ]
    });

    Layer.Text.Visual = Visual.extend({

        template: "text/text",

        serialize: function() {
            return this.model.toJSON();
        },

        afterEditorRender: function() {
            console.log('AR text', this)
            // using jquery because it provides a few vendor prefix styles
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
                handle: ".drag-handle"
            });
        },

        listen: function() {
            this.$('.visual-target').keyup(function(e){
                if ( e.which == 27 ) {
                    this.$('.visual-target').blur();
                }
                this.lazyUpdate({ content: this.$('.visual-target').text() });
            }.bind( this ))
            .bind('paste', function(e){
                console.log('something was pasted!');
                _.delay(function() {
                    this.$('.visual-target').html( this.$('.visual-target').text() );
                    this.lazyUpdate({ content: this.$('.visual-target').text() });
                }, 500);
            }.bind( this ));
        },

        lazyUpdate: _.debounce(function( value ) {
            var attr = {};
            
            attr[ this.propertyName ] = value;
            this.model.saveAttr( attr );
        }, 500 ),
  });

  return Layer;
});
