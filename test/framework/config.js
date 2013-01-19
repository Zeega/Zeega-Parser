// Set the require.js configuration for your application.
require.config({

  // Initialize the application with the main application file and the JamJS
  // generated configuration file.
  deps: ["main"],

  paths: {
    // Put paths here.
    plugins: "dummies",
    libs: "dummies",
    "vendor/popcorn": "dummies",
    zeega: "dummies/zeega",
    zeega_parser: "../..",



    jquery:     "libs/jquery",
    lodash:     "libs/lodash",
    backbone:   "libs/backbone"

  },

  shim: {
    // Put shims here.
    backbone: {
        deps: [ "lodash", "jquery" ],
        exports: "Backbone"
    },
  }

});
