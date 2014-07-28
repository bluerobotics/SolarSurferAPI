'use strict';
/* jslint node: true */

var dns = require('dns');

module.exports = function(api) {
  var controllers = {};

  var domain_auth_check = function(req, res, callback) {
    // make sure this is from RockSeven...
    if(api.config.auth_enabled !== false) {
      if(req._remoteAddress === undefined) res.json(401, {});
      else {
        dns.reverse(req._remoteAddress, function(err, domains){
          if(api.config.logging) console.log('Request from:', domains);
          if(domains.length < 1 || api.config.auth_whitelist.indexOf(domains[0]) >= 0)
            res.json(401, {});
          else callback();
        });
      }
    }
    else {
      // config says don't check dns, probably for testing
      callback();
    }
  };

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

  controllers.get_list = function(Model) {
    return function(req, res) {

      Model.find(function(err, documents) {
        if(err) {
          if(api.config.debug) console.error(err);
          res.json(400, {});
        }
        else res.json(documents);
      });

    };
  };

  controllers.post = function(Model, success_code) {
    return function(req, res) {

      // check auth
      domain_auth_check(req, res, function(){

        // make document from request payload
        var instance = new Model(req.body);

        // enforce data and IP
        instance._date = Date.now();
        instance._ip = req._remoteAddress || 'localhost';

        // save the document
        instance.save(function (err) {
          if(err) return res.json(400, err);
          Model.findById(instance, function (err, doc) {
            if(err) return res.json(500, {'error': err});
            else return res.json(success_code || 201, doc);
          });
        });

      });

    };
  };

  // actual module export
  return controllers;
};
