'use strict';
/* jslint node: true */

// import
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cors = require('cors');

// api factory function
var create_api = function(config, callback) {
  // override config with environment variables
  config.port = Number(process.env.PORT || config.port);
  config.mongo_uri = process.env.MONGOLAB_URI || config.mongo_uri;
  config.auth_token = process.env.AUTH_TOKEN || config.auth_token;
  config.rockseven_url = process.env.ROCKSEVEN_URL || config.rockseven_url;
  config.rockseven_user = process.env.ROCKSEVEN_USER || config.rockseven_user;
  config.rockseven_pass = process.env.ROCKSEVEN_PASS || config.rockseven_pass;
  if(config.logging) console.log('Using config:', config);

  // set up server
  var api = express();
  if(config.logging !== false) api.use(morgan('short'));
  api.use(bodyParser.urlencoded({extended: true}));
  api.use(bodyParser.json());
  api.use(cors());
  api.config = config;

  // set up database
  api.db = mongoose.connection;
  var setup_db = function() {
    mongoose.connect(config.mongo_uri);
    api.db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    api.db.once('open', function() {
      if(config.logging) console.log('MongoDB connection open');

      // prep Message class
      var Message = require('SolarSurferMessage');
      Message.loadConfigFile();
      console.log('Message format version:', Message.version);
      api.Message = Message;

      // import models
      var models = require('./models.js');
      api.models = models;
    
      // import controllers
      var controllers = require('./controllers.js')(api);

      // helper routes
      api.get('', controllers.index);
      api.get('/raw', controllers.raw);

      // mission routes
      api.get('/mission', controllers.get_list(models.Mission));
      api.post('/mission', controllers.post(models.Mission));
      api.get('/mission/:_id', controllers.get_item(models.Mission));
      api.put('/mission/:_id', controllers.put(models.Mission));
      api.get('/vehicle', controllers.get_list(models.Vehicle));
      api.post('/vehicle', controllers.post(models.Vehicle));
      api.get('/vehicle/:_id', controllers.get_item(models.Vehicle));
      api.put('/vehicle/:_id', controllers.put(models.Vehicle));

      // cmd routes
      api.get('/command', controllers.get_list(models.Cmd));
      api.post('/command', controllers.post_cmd(models.Cmd));

      // tlm routes
      api.get('/telemetry', controllers.get_list(models.Tlm));
      api.get('/raw/telemetry', controllers.get_list(models.RawTlm));
      api.post('/raw/telemetry', controllers.post(models.RawTlm, 200));

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
