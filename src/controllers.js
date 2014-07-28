'use strict';
/* jslint node: true */

var dns = require('dns');

module.exports = function(api) {
  var controllers = {};

  controllers.index = function(req, res) {
    res.json([
      '/cmd',
      '/raw',
      '/tlm'
    ]);
  };

  controllers.raw = function(req, res) {
    res.json([
      '/raw/cmd',
      '/raw/tlm'
    ]);
  };

  controllers.get_list = function(collection) {
    return function(req, res) {
      res.json({'hello': 'world'});
    };
  };

  controllers.post_raw_tlm = function(req, res) {
    if(api.config.debug) console.log(req.body);

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
    if(api.config.auth_enabled !== false) {
      if(req._remoteAddress === undefined) res.json(401, {});
      else {
        dns.reverse(req._remoteAddress, function(err, domains){
          if(domains.length < 1 || config.auth_whitelist.indexOf(domains[0]) >= 0)
            res.json(401, {});
          else dns_callback();
        });
      }
    }
    else {
      // config says don't check dns, probably for testing
      dns_callback();
    }
  };

  controllers.post_cmd = function(req, res) {
    res.json(200, {});
  };

  // actual module export
  return controllers;
};
