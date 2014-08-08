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
      '/command',
      '/mission',
      '/raw',
      '/telemetry',
      '/vehicle'
    ]);
  };

  controllers.raw = function(req, res) {
    res.json([
      '/raw/command',
      '/raw/telemetry'
    ]);
  };

  controllers.get_list = function(Model) {
    return function(req, res) {
      var where = {};
      try {
        where = JSON.parse(req.query.where);
      }
      catch(e) {}

      // first count the documents
      Model.count(where, function(err, count) {
        if(err) {
          console.error(err);
          res.json(400, err);
        }
        else {
          var fields = req.query.fields || null;
          var options = {
            skip: req.query.skip || 0,
            limit: req.query.limit || 20,
            sort: req.query.sort || '_date'
          };

          // then pull the documents
          Model.find(where, fields, options, function(err, documents) {
            if(err) {
              console.error(err);
              res.json(400, err);
            }
            else res.json({
              items: documents,
              meta: { skip: options.skip, limit: options.limit, sort: options.sort, count: count }
            });
          });
        }
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
        instance.save(function(err, doc) {
          if(err) {
            console.error(err);
            return res.json(400, err);
          }
          else return res.json(success_code || 201, doc);
        });

      });

    };
  };

  // actual module export
  return controllers;
};
