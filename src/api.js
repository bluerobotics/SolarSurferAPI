'use strict';
/* jslint node: true */

// import
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

// api factory function
var create_api = function(config) {
  // override config with environment variables
  config.port = Number(process.env.PORT || config.port);
  config.mongo_uri = process.env.MONGOLAB_URI || config.mongo_uri;
  if(config.logging) console.log('Using config:', config);

  // set up server
  var api = express();
  api.config = config;
  if(config.logging !== false) api.use(morgan('short'));
  api.use(bodyParser.urlencoded({extended: true}));
  api.use(bodyParser.json());

  // set up database
  if(mongoose.connection.readyState != 1)
    mongoose.connect(config.mongo_uri);
  mongoose.connection.on('error', console.error);
  api.mongoose = mongoose;
  
  // import controllers
  var controllers = require('./controllers.js')(api);

  // helper routes
  api.get('', controllers.index);
  api.get('/raw', controllers.raw);

  // cmd routes
  api.get('/cmd', controllers.get_list('cmd'));
  api.post('/cmd', controllers.post_cmd);

  // tlm routes
  api.get('/tlm', controllers.get_list('tlm'));
  api.post('/raw/tlm', controllers.post_raw_tlm);

  return api;
};

// export the api factory for the test package
module.exports = create_api;

// serve api if we call the file directly
if (!module.parent) {
  // build api
  var config = require('./config.js');
  var api = create_api(config);
  
  // serve api
  var port = 
  api.listen(port, function () {
    if(config.debug) console.log('Server startup complete: listening on port', port);
  });
}
