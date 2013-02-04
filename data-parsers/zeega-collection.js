define([
    "lodash",
    "zeega_parser/plugins/layers/slideshow/parser"
],
function( _, Slideshow ) {

    function parseStandardCollection( response, opts ) {
        var sequence, frames, layers;

        // layers from timebased items
        layers = generateLayerArrayFromItems( response.items );
        frames = generateFrameArrayFromItems( response.items );
        sequence = {
                id: 0,
                title: "collection",
                persistent_layers: [],
                frames: _.pluck( frames, "id" )
            };

        return _.extend(
            response.items[0],
            {
                sequences: [ sequence ],
                frames: frames,
                layers: layers
            });
    }

    function parseSlideshowCollection( response, opts ) {
        var sequence, frames, layers, slideshowLayer, timebasedLayers;

        timebasedLayers = _.filter( response.items, function( item ) {
            return item.layer_type == "Audio" || item.media_type == "Video";
        });

        slideshowLayer = Slideshow.parse( response.items, opts.layerOptions );
        // layers from timebased items
        layers = generateLayerArrayFromItems( timebasedLayers );
        
        if ( slideshowLayer ) {
            layers.push( slideshowLayer );
        }
        // frames from timebased items
        if ( timebasedLayers.length ) {
            frames = generateFrameArrayFromItems( timebasedLayers, slideshowLayer ? [ slideshowLayer.id ] : [] );
        } else {
            // create single frame if no timebased layers exist
            frames = [{
                id: 1,
                layers: [1],
                attr: { advance : 0 }
            }];
        }

        sequence = {
            id: 0,
            title: "collection",
            persistent_layers: slideshowLayer ? [ slideshowLayer.id ] : [],
            frames: _.pluck( frames, "id")
        };

        return _.extend(
            response.items[0],
            {
                sequences: [ sequence ],
                frames: frames,
                layers: layers
            });
    }

    function generateLayerArrayFromItems( itemsArray ) {
        var layerDefaults = {
            width: 100,
            top: 0,
            left: 0,
            loop: false
        };

        return _.map( itemsArray, function( item ) {
            return {
                attr: _.defaults(item,layerDefaults),
                type: item.layer_type,
                id: item.id
            };
        });
    }

    function generateFrameArrayFromItems( itemsArray, persistentLayers ) {

        return _.map( itemsArray, function( item ) {
            var layers = item.media_type == "Video" ?
                [item.id] : _.compact( [item.id].concat( persistentLayers ) );

            return {
                id: item.id,
                layers: layers,
                attr: { advance : 0 }
            };
        });
    }

    return {
        name: "zeega-collection",

        validate: function( response ) {
            // TODO: this works, but may not be valid with new API!!
            if ( response.items && response.items[0] && response.items[0].child_items ) {
                return true;
            }
            return false;
        },

        parse: function( response, opts ) {
            if ( opts.layerOptions && opts.layerOptions.slideshow && opts.layerOptions.slideshow.display && response.items.length > 0 ) {
                return parseSlideshowCollection( response, opts );
            } else {
                return parseStandardCollection( response, opts );
            }
        }
    };
});
