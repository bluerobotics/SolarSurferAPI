'use strict';
/* jslint node: true */

// import
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

// api factory function
var create_api = function(config, callback) {
  // override config with environment variables
  config.port = Number(process.env.PORT || config.port);
  config.mongo_uri = process.env.MONGOLAB_URI || config.mongo_uri;
  if(config.logging) console.log('Using config:', config);

  // set up server
  var api = express();
  if(config.logging !== false) api.use(morgan('short'));
  api.use(bodyParser.urlencoded({extended: true}));
  api.use(bodyParser.json());
  api.config = config;

  // set up database
  api.db = mongoose.connection;
  var setup_db = function() {
    mongoose.connect(config.mongo_uri);
    api.db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    api.db.once('open', function() {
      if(config.logging) console.log('MongoDB connection open');

      // import models
      var models = require('./models.js');
      api.models = models;
    
      // import controllers
      var controllers = require('./controllers.js')(api);

      // helper routes
      api.get('', controllers.index);
      api.get('/raw', controllers.raw);

      // cmd routes
      api.get('/cmd', controllers.get_list(models.Cmd));
      api.post('/cmd', controllers.post_cmd);
      api.get('/raw/cmd', controllers.get_list(models.RawCmd));

      // tlm routes
      api.get('/tlm', controllers.get_list(models.Tlm));
      api.get('/raw/tlm', controllers.get_list(models.RawTlm));
      api.post('/raw/tlm', controllers.post_raw_tlm);

      // api build is complete!
      if(callback) callback();
    });
  };

  // cleanup connector for mocha or just start a new one
  if(api.db.readyState == 1 || api.db.readyState == 2) api.db.close(setup_db);
  else setup_db();

  return api;
};

// export the api factory for the test package
module.exports = create_api;

// serve api if we call the file directly
if (!module.parent) {
  // build api
  var config = require('./config.js');
  var api = create_api(config, function() {

    // serve api
    api.listen(config.port, function () {
      if(config.debug) console.log('Server startup complete: listening on port', config.port);
    });
    
  });
}
