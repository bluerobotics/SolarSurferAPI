'use strict';
/* jslint node: true */

var request = require('request');
var _ = require('lodash');

module.exports = function(api) {
  var controllers = {};

  var check_auth = function(req, res, callback) {
    if(api.config.auth_token === false || api.config.auth_token === undefined) {
      // config says don't check auth, probably for testing
      callback();
    }
    else if(req.query.token === api.config.auth_token) {
      // auth success...let 'em through
      callback();
    }
    else {
      // failed auth check...denied!
      res.json(401, {});
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
          res.status(400).json(err);
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
              res.status(400).json(err);
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

  controllers.get_item = function(Model) {
    return function(req, res) {
      var where = {};
      try {
        where = JSON.parse(req.query.where);
      }
      catch(e) {}
      where._id = req.params._id;
      var fields = req.query.fields || null;
      var options = {
        sort: req.query.sort || '_date'
      };

      // pull the document
      Model.findOne(where, fields, options, function(err, document) {
        if(err) {
          console.error(err);
          res.status(400).json(err);
        }
        else res.json(document);
      });

    };
  };

  controllers.post = function(Model, success_code_override) {
    return function(req, res) {

      // check auth
      check_auth(req, res, function(){

        // make document from request payload
        var instance = new Model(req.body);

        // enforce data and IP
        instance._date = Date.now();
        instance._ip = req._remoteAddress || 'localhost';

        // save the document
        instance.save(function(err, doc) {
          if(err) {
            console.error(err);
            return res.status(400).json(err);
          }
          else return res.json(success_code_override || 201, doc);
        });

      });

    };
  };

  controllers.put = function(Model) {
    return function(req, res) {

      // check auth
      check_auth(req, res, function(){

        // search for previous document
        if(req.body._id !== undefined) delete req.body._id;
        Model.findOneAndUpdate({_id: req.params._id}, req.body, function (err, doc) {
          if(err) {
            console.error(err);
            return res.status(400).json(err);
          }
          else return res.json(200, doc);
        });

      });

    };
  };

  controllers.post_cmd = function(Model) {
    return function(req, res) {

      // check auth
      check_auth(req, res, function(){

        // 1: make document from request payload
        var instance = new Model(req.body);
        instance._date = Date.now();
        instance._ip = req._remoteAddress || 'localhost';

        // 2: verify that we have a payload
        if(instance.data === undefined || typeof instance.data != 'object')
          return res.status(400).json({errors: 'data must be defined and be an object'});

        // 3: look up the mission to get the imei
        api.models.Mission.findOne({_id: instance.mission}, function(err, mission){
          if(mission === undefined || mission === null)
            return res.status(400).json({errors: 'could not find mission'});
          else {
            api.models.Vehicle.findOne({_id: mission.vehicle}, function(err, vehicle){
              if(vehicle === undefined || vehicle === null)
                return res.status(400).json({errors: 'could not find vehicle'});
              else {
                instance.imei = vehicle.imei;

                // 4: try to encode the command
                try {
                  instance.raw = api.Message.encode(instance.data);
                }
                catch(e) {
                  // oh well, I guess we can't encode it...
                  return res.status(400).json({errors: ['Message encode error', e]});
                }

                // 6: save the document
                var save = function() {
                  instance.save(function(err, doc) {
                    if(err) {
                      console.error(err);
                      return res.status(400).json(err);
                    }
                    else return res.status(201).json(doc);
                  });
                };

                // 5: try to POST the command to RockSeven
                // var data = ;
                if(api.config.rockseven_url !== undefined) {
                  request({
                    uri: api.config.rockseven_url,
                    method: 'POST',
                    form: {
                      imei: instance.imei,
                      username: api.config.rockseven_user,
                      password: api.config.rockseven_pass,
                      // data: instance.raw
                    }
                  }, function(err, resp, body){
                    if(resp.status == 200) save();
                    else res.status(400).json({
                      errors: [err, resp, body]
                    });
                  });
                }
                else save();
              }
            });
          }
        }); // end of mission lookup

      }); // end of check_auth

    };
  };

  // actual module export
  return controllers;
};
