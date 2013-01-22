/*
    parser tests

    TODO

*/


var getFrames = function( project ) {
    var allFrames = [];

    project.sequences.each(function( sequence ) {
        allFrames.push( sequence.frames.models );
    });
    allFrames = _.flatten( allFrames );

    return allFrames;
};

var getLayers = function( project ) {
    var allLayers = [],
        frames = getFrames( project );

    _.each( frames, function( frame ) {
        allLayers.push( frame.layers.models );
    });
    allLayers = _.flatten( allLayers );

    return allLayers;
};

var isInt = function( n ) {
    return typeof n === 'number' && n % 1 === 0;
};

module("Project");

asyncTest("Returns object", function() {
    var test;
    expect(1);

    test = function() {
        var project = new window.ZeegaParser.parse( window.projectJSON, {
            preloadRadius: 2,
            attach: {}
        });
        ok( typeof project == "object", "Parser output is actually an object!");
        start();
    };

    if ( window.parserReady ) {
        test();
    } else {
        $(window).bind("parser_ready", test );
    }

});

asyncTest("Has at least one sequence", function() {
    var test;

    expect(1);

    test = function() {
        var project = new window.ZeegaParser.parse( window.projectJSON, {
            preloadRadius: 2,
            attach: {}
        });

        ok( project.sequences.length , "Project contains " + project.sequences.length + " sequences");
        start();
    };

    if ( window.parserReady ) {
        test();
    } else {
        $(window).bind("parser_ready", test );
    }
});

asyncTest("Project has expected shape", function() {
    var test;

    expect(1);

    test = function() {
        var shape, compare,
            project = new window.ZeegaParser.parse( window.projectJSON, {
                preloadRadius: 2,
                attach: {}
            });

        shape = Object.keys( project.defaults ).sort();
        compare = Object.keys( project.toJSON() ).sort();

        deepEqual( compare, shape, "Project has expected attribute shape");
        start();
    };

    if ( window.parserReady ) {
        test();
    } else {
        $(window).bind("parser_ready", test );
    }
});

asyncTest("Preload radius is effective", function() {
    var test;

    expect(1);

    test = function() {
        var a, b, aFrames, bFrames;

        a = new window.ZeegaParser.parse( window.projectJSON, {
            preloadRadius: 2,
            attach: {}
        });
        b = new window.ZeegaParser.parse( window.projectJSON, {
            preloadRadius: 3,
            attach: {}
        });

        aFrames = getFrames( a );
        bFrames = getFrames( b );

        // aFrames and bFrames should be the same length but different preloadFrames
        var diff = _.find( aFrames, function( frame, i ) {
            return frame.get("preload_frames").length != bFrames[i].get("preload_frames").length;
        });

        ok( diff, "preload radius results in different reload outcomes");
        start();
    };

    if ( window.parserReady ) {
        test();
    } else {
        $(window).bind("parser_ready", test );
    }
});

module("Sequence");

asyncTest("Each sequence has at least one frame", function() {
    var test = function() {
        var project = new window.ZeegaParser.parse( window.projectJSON, {
            preloadRadius: 2,
            attach: {}
        });

        expect( project.sequences.length );

        project.sequences.each(function( sequence ) {
            ok( sequence.frames.length, "Sequence " + sequence.id + " has " + sequence.frames.length + " frames.");
        });
        start();
    };

    if ( window.parserReady ) {
        test();
    } else {
        $(window).bind("parser_ready", test );
    }
});


asyncTest("Sequences have expected shape", function() {
    var test = function() {
        var project = new window.ZeegaParser.parse( window.projectJSON, {
            preloadRadius: 2,
            attach: {}
        });

        expect( project.sequences.length );

        project.sequences.each(function( sequence ) {
            var shape, compare;

            shape = Object.keys( sequence.defaults ).sort();
            compare = Object.keys( sequence.toJSON() ).sort();

            deepEqual( compare, shape, "Project has expected attribute shape");
        });

        start();
    };

    if ( window.parserReady ) {
        test();
    } else {
        $(window).bind("parser_ready", test );
    }
});


asyncTest("Sequences have integer ids", function() {
    var test = function() {
        var project = new window.ZeegaParser.parse( window.projectJSON, {
            preloadRadius: 2,
            attach: {}
        });

        expect( project.sequences.length );

        project.sequences.each(function( sequence ) {
            ok( isInt( sequence.id ), "Sequence ID: " + sequence.id + " is an integer");
        });

        start();
    };

    if ( window.parserReady ) {
        test();
    } else {
        $(window).bind("parser_ready", test );
    }
});

module("Frame");


asyncTest("Frames have expected shape", function() {
    var test = function() {
        var defaults, seqFrames, frames,
            project = new window.ZeegaParser.parse( window.projectJSON, {
                preloadRadius: 2,
                attach: {}
            });

        frames = getFrames( project );

        expect( frames.length );

        _.each( frames, function( frame ) {
            var shape, compare;

            shape = Object.keys( frame.defaults ).sort();
            compare = Object.keys( frame.toJSON() ).sort();

            deepEqual( compare, shape, "Frame has expected attribute shape");
        });

        start();
    };

    if ( window.parserReady ) {
        test();
    } else {
        $(window).bind("parser_ready", test );
    }
});

asyncTest("Frames have integer ids", function() {
    var test = function() {
        var frames,
            project = new window.ZeegaParser.parse( window.projectJSON, {
                preloadRadius: 2,
                attach: {}
            });

        frames = getFrames( project );
        expect( frames.length );
        _.each( frames, function( frame ) {
            ok( isInt( frame.id ), "frame ID: "+ frame.id + " is an integer" );
        });

        start();
    };

    if ( window.parserReady ) {
        test();
    } else {
        $(window).bind("parser_ready", test );
    }
});

asyncTest("Frames have valid `advance` value", function() {
    var test = function() {
        var defaults, seqFrames, frames,
            project = new window.ZeegaParser.parse( window.projectJSON, {
                preloadRadius: 2,
                attach: {}
            });

        frames = getFrames( project );

        expect( frames.length );
        _.each( frames, function( frame ) {
            ok( typeof frame.get("attr").advance == "number" && frame.get("attr").advance >= 0, "frame has valid advance valid of: " + frame.get("attr").advance );
        });

        start();
    };

    if ( window.parserReady ) {
        test();
    } else {
        $(window).bind("parser_ready", test );
    }
});

module("Layers");

asyncTest("Layers have expected shape", function() {
    var test = function() {
        var defaults, seqFrames, layers,
            project = new window.ZeegaParser.parse( window.projectJSON, {
                preloadRadius: 2,
                attach: {}
            });

        layers = getLayers( project );
        expect( layers.length );
        _.each( layers, function( layer ) {
            var shape, compare;

            shape = Object.keys( layer.defaults ).sort();
            compare = Object.keys( layer.toJSON() ).sort();
            deepEqual( compare, shape, "Layer has expected attribute shape");
        });
        start();
    };

    if ( window.parserReady ) {
        test();
    } else {
        $(window).bind("parser_ready", test );
    }
});

asyncTest("Layers have integer IDs", function() {
    var test = function() {
        var layers,
            project = new window.ZeegaParser.parse( window.projectJSON, {
                preloadRadius: 2,
                attach: {}
            });

        layers = getLayers( project );
        expect( layers.length );
        _.each( layers, function( layer ) {
            ok( isInt( layer.id ), "Layer ID: " + layer.id + " is an integer");
        });
        start();
    };

    if ( window.parserReady ) {
        test();
    } else {
        $(window).bind("parser_ready", test );
    }
});

