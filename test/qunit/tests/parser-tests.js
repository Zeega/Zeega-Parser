/*
    parser tests

    TODO

    - make new parser instance for each(?) test. at least some tests
    - test parser with different preloadRadius values

*/

var allFrames = [],
    allLayers = [];

var loadAllFrames = function() {
    if ( allFrames.length === 0 ) {
        window.Parsed.sequences.each(function( sequence ) {
            allFrames.push( sequence.frames.models );
        });
        allFrames = _.flatten( allFrames );
    }
}

var loadAllLayers = function() {
    if ( allLayers.length === 0 ) {
        loadAllFrames();
        _.each( allFrames, function( frame ) {
            allLayers.push( frame.layers.models );
        });
        allLayers = _.flatten( allLayers );
    }
}

var isInt = function( n ) {
   return typeof n === 'number' && n % 1 == 0;
}

module("Project");

asyncTest("Returns object", function() {
  var test;

  expect(1);

  test = function() {
    ok( typeof window.Parsed == "object", "Parser output is actually an object!");
    start();
  };

  if ( window.Parsed ) {
    test();
  } else {
    $(window).bind("parsed", test );
  }

});

asyncTest("Has at least one sequence", function() {
  var test;

  expect(1);

  test = function() {
    ok( window.Parsed.sequences.length , "Project contains " + window.Parsed.sequences.length + " sequences");
    start();
  };

  if ( window.Parsed ) {
    test();
  } else {
    $(window).bind("parsed", test );
  }
});

asyncTest("Project has expected shape", function() {
    var test, shape, compare;

    expect(1);

    test = function() {
        shape = Object.keys( window.Parsed.defaults ).sort();
        compare = Object.keys( window.Parsed.toJSON() ).sort();

        deepEqual( compare, shape, "Project has expected attribute shape");
        start();
    };

    if ( window.Parsed ) {
        test();
    } else {
        $(window).bind("parsed", test );
    }

});

module("Sequence");

asyncTest("Each sequence has at least one frame", function() {
    var test = function() {
        expect( window.Parsed.sequences.length );

        window.Parsed.sequences.each(function( sequence ) {
            ok( sequence.frames.length, "Sequence " + sequence.id + " has " + sequence.frames.length + " frames.");
        });
        start();
    };

    if ( window.Parsed ) {
        test();
    } else {
        $(window).bind("parsed", test );
    }
});

asyncTest("Sequences have expected shape", function() {
    var test = function() {
        expect( window.Parsed.sequences.length );

        window.Parsed.sequences.each(function( sequence ) {
            var shape, compare;

            shape = Object.keys( sequence.defaults ).sort();
            compare = Object.keys( sequence.toJSON() ).sort();

            deepEqual( compare, shape, "Project has expected attribute shape");
        });

        start();
    };

    if ( window.Parsed ) {
        test();
    } else {
        $(window).bind("parsed", test );
    }
});

asyncTest("Sequences have integer ids", function() {
    var test = function() {
        expect( window.Parsed.sequences.length );

        window.Parsed.sequences.each(function( sequence ) {
            ok( isInt( sequence.id ), "Sequence ID: " + sequence.id + " is an integer");
        });

        start();
    };

    if ( window.Parsed ) {
        test();
    } else {
        $(window).bind("parsed", test );
    }
});

module("Frame");


asyncTest("Frames have expected shape", function() {
    var test = function() {
        var defaults, seqFrames;

        loadAllFrames();

        expect( allFrames.length );

        _.each( allFrames, function( frame ) {
            var shape, compare;

            shape = Object.keys( frame.defaults ).sort();
            compare = Object.keys( frame.toJSON() ).sort();

            deepEqual( compare, shape, "Frame has expected attribute shape");
        });

        start();
    };

    if ( window.Parsed ) {
        test();
    } else {
        $(window).bind("parsed", test );
    }
});

asyncTest("Frames have integer ids", function() {
    var test = function() {
        loadAllFrames();
        expect( allFrames.length );
        _.each( allFrames, function( frame ) {
            ok( isInt( frame.id ), "frame ID: "+ frame.id + " is an integer" );
        });

        start();
    };

    if ( window.Parsed ) {
        test();
    } else {
        $(window).bind("parsed", test );
    }
});

asyncTest("Frames have valid `advance` value", function() {
    var test = function() {
        var defaults, seqFrames;

        loadAllFrames();
        expect( allFrames.length );
        _.each( allFrames, function( frame ) {
            ok( typeof frame.get("attr").advance == "number" && frame.get("attr").advance >= 0, "frame has valid advance valid of: " + frame.get("attr").advance );
        });

        start();
    };

    if ( window.Parsed ) {
        test();
    } else {
        $(window).bind("parsed", test );
    }
});

module("Layers");

asyncTest("Layers have expected shape", function() {
    var test = function() {
        var defaults, seqFrames;

        loadAllLayers();
        expect( allLayers.length );
        _.each( allLayers, function( layer ) {
            var shape, compare;

            shape = Object.keys( layer.defaults ).sort();
            compare = Object.keys( layer.toJSON() ).sort();
            deepEqual( compare, shape, "Layer has expected attribute shape");
        });
        start();
    };

    if ( window.Parsed ) {
        test();
    } else {
        $(window).bind("parsed", test );
    }
});

asyncTest("Layers have integer IDs", function() {
    var test = function() {

        loadAllLayers();
        expect( allLayers.length );
        _.each( allLayers, function( layer ) {
            ok( isInt( layer.id ), "Layer ID: " + layer.id + " is an integer");
        });
        start();
    };

    if ( window.Parsed ) {
        test();
    } else {
        $(window).bind("parsed", test );
    }
});

