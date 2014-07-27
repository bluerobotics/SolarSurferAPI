// import
var express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  dns = require('dns');
  // mongoskin = require('mongoskin'),

// api factory function
var create_api = function(config) {
  if(config.debug) console.log('Using config:', config);

  // vars
  var app = express();
  // var db = mongoskin.db('mongodb://@localhost:27017/test', {safe:true});

  // configure express
  if(config.logging !== false) app.use(morgan('short'));
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());

  // var mongo = require('mongodb');

  // var mongoUri = process.env.MONGOLAB_URI ||
  //   process.env.MONGOHQ_URL ||
  //   'mongodb://localhost/mydb';

  // mongo.Db.connect(mongoUri, function (err, db) {
  //   db.collection('mydocs', function(er, collection) {
  //     collection.insert({'mykey': 'myvalue'}, {safe: true}, function(er,rs) {
  //     });
  //   });
  // });

  app.get('', function(req, res) {
    res.json([
      '/cmd',
      '/raw',
      '/tlm'
    ]);
  });

  app.get('/raw', function(req, res) {
    res.json([
      '/raw/cmd',
      '/raw/tlm'
    ]);
  });

  app.get('/tlm', function(req, res) {
    res.json({'hello': 'world'});
  });

  app.post('/raw/tlm', function(req, res) {
    if(config.debug) console.log(req.body);

    // dns_callback
    var dns_callback = function() {
      // check input format
      if(req.body.imei === undefined) res.json(400, {});
      else {
        // format is good, let's write to the DB
        res.json(req.body);
      }
    };
    
    // make sure this is from RockSeven...
    if(config.raw_post_protected !== false) {
      if(req._remoteAddress === undefined) res.json(401, {});
      else {
        dns.reverse(req._remoteAddress, function(err, domains){
          if(domains.length < 1 || domains[0] != config.raw_post_domain)
            res.json(401, {});
          else dns_callback();
        });
      }
    }
    else {
      // config says don't check dns, probably for testing
      dns_callback();
    }
  });

  app.post('/raw/cmd', function(req, res) {
    res.json(200, {});
  });

  return app;
};

// export the app factory for the test package
module.exports = create_api;

// serve app if we call the file directly
if (!module.parent) {
  // build app
  var config = require('./config.js');
  var api = create_api(config);
  
  // serve app
  api.listen(config.port, function () {
    if(config.debug) console.log('Server startup complete: listening on port', config.port);
  });
}
