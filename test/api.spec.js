'use strict';
/* jslint node: true */
/* global describe, beforeEach, afterEach, it */

// import
var async = require('async');
var request = require('supertest');
var chai = require('chai');
var expect = chai.expect;
var _ = require('lodash');
var create_api = require('../src/api.js');
var standard_config = require('../src/config.js');

// common vars
var config;

// shared testing functions
var verify_count = function(model, expected_count) {
  return function(callback) {
    model.count({}, function(err, count){
      expect(count).to.equal(expected_count);
      callback();
    });
  };
};
 
describe('api', function() {
  var api;
  var valid_raw_tlm_data;

  beforeEach(function(done) {
    // reset testing config
    config = _.clone(standard_config, true);
    config.debug = false;
    config.logging = false;
    config.auth_token = undefined;

    // reusable ata chunks
    valid_raw_tlm_data = {
      imei: '000000000000000',
      device_type: 'ROCKBLOCK',
      serial: '0000',
      momsn: '0',
      transmit_time: '14-06-23 02:23:50',
      iridium_latitude: '33.8612',
      iridium_longitude: '-118.3447',
      iridium_cep: '3',
      data: '010054686520536f6c617253757266657220697320676f696e6720746f204861776169692120486f706566756c6c792ef785'
    };

    // make app
    api = create_api(config, done);
  });

  afterEach(function() {
    // clear the database
    var doNothing = function() {};
    for(var i in api.db.collections) {
      api.db.collections[i].remove(doNothing);
    }
  });

  describe('GET to the / endpoint', function() {
    it('should list child endpoints', function(done){
      request(api).get('/')
        .expect(200, done);
    });
  });

  describe('POST to the /command endpoint', function() {
    // it('should block requests with a bad request format', function(){
    // });

    // it('should add document to /command', function(){
    // });

    // it('should add the encoded document to /raw/command', function(){
    // });

    // it('should forward an encoded message to RockSeven', function(){
    // });

    // it('should return the response code from RockSeven forwarding', function(done){
    //   // send request
    //   request(api).post('/command')
    //     .send({})
    //     .expect(201, done);
    // });

    // describe('with auth enabled', function() {
    //   beforeEach(function(done){
    //     // create a server with raw_post_protected on
    //     config.auth_token = 'token';
    //     api = create_api(config, done);
    //   });

    //   it('should block requests from a bad source', function(){
    //     // // send request
    //     // request(api).post('/raw/command')
    //     //   .send({})
    //     //   .expect(400, done);
    //   });
    // });
  });

  describe('GET to the /raw endpoint', function() {
    it('should list child endpoints', function(done){
      request(api).get('/raw')
        .expect(200, done);
    });
  });

  describe('POST to the /raw/telemetry endpoint', function() {
    it('should block requests with a bad request format', function(done){
      // mess up the request data
      delete valid_raw_tlm_data.data;

      // send request
      request(api).post('/raw/telemetry')
        .send(valid_raw_tlm_data)
        .expect(400, done);
    });

    it('should add document to /raw/telemetry', function(done){
      async.series([

        // verify that the db is empty
        function(callback){
          api.models.RawTlm.count({}, function(err, count){
            expect(count).to.equal(0);
            callback();
          });
        },
        
        // send request
        function(callback){
          request(api).post('/raw/telemetry')
            .send(valid_raw_tlm_data)
            .expect(200, callback);
        },

        // verify that a document has been added to the database
        function(callback){
          api.models.RawTlm.count({}, function(err, count){
            expect(count).to.equal(1);
            callback();
          });
        },

      ], done);
    });

    it('should use an existing Vehicle if it exists', function(done){
      async.series([
        
        // create vehicle
        function(callback){
          var vehicle = new api.models.Vehicle({imei: valid_raw_tlm_data.imei});
          vehicle.save(function(err, vehicle) {
            callback();
          });
        },

        // verify that the db is empty
        verify_count(api.models.Vehicle, 1),
        verify_count(api.models.RawTlm, 0),
        
        // send request
        function(callback){
          request(api).post('/raw/telemetry')
            .send(valid_raw_tlm_data)
            .expect(200, callback);
        },

        // verify that a document and a vehicle has been added to the database
        verify_count(api.models.Vehicle, 1),
        verify_count(api.models.RawTlm, 1),

      ], done);
    });

    it('should create a new Vehicle if needed', function(done){
      async.series([

        // verify that the db is empty
        verify_count(api.models.Vehicle, 0),
        verify_count(api.models.RawTlm, 0),
        
        // send request
        function(callback){
          request(api).post('/raw/telemetry')
            .send(valid_raw_tlm_data)
            .expect(200, callback);
        },

        // verify that a document and a vehicle has been added to the database
        verify_count(api.models.Vehicle, 1),
        verify_count(api.models.RawTlm, 1),

      ], done);
    });

    it('should use an existing Mission if it exists', function(done){
      async.series([
        
        // create vehicle and mission
        function(callback){
          // create vehicle
          var vehicle = new api.models.Vehicle({imei: valid_raw_tlm_data.imei});
          vehicle.save(function(err, vehicle) {
            // create mission
            var mission = new api.models.Mission({vehicle: vehicle._id});
            mission.save(function(err, mission) {
              // create pointer to mission in vehicle
              vehicle.current_mission = mission._id;
              vehicle.save(function(err, mission) {
                // move on!
                callback();
              });
            });
          });
        },

        // verify that the db is empty
        verify_count(api.models.Mission, 1),
        verify_count(api.models.RawTlm, 0),
        
        // send request
        function(callback){
          request(api).post('/raw/telemetry')
            .send(valid_raw_tlm_data)
            .expect(200, callback);
        },

        // verify that a document and a mission has been added to the database
        verify_count(api.models.Mission, 1),
        verify_count(api.models.RawTlm, 1),

      ], done);
    });

    it('should create a new Mission if needed', function(done){
      async.series([

        // verify that the db is empty
        verify_count(api.models.Mission, 0),
        verify_count(api.models.RawTlm, 0),
        
        // send request
        function(callback){
          request(api).post('/raw/telemetry')
            .send(valid_raw_tlm_data)
            .expect(200, callback);
        },

        // verify that a document and a mission has been added to the database
        verify_count(api.models.Mission, 1),
        verify_count(api.models.RawTlm, 1),

      ], done);
    });

    it('should add the decoded document to /telemetry', function(done){
      async.series([

        // verify that the db is empty
        function(callback){
          api.models.Tlm.count({}, function(err, count){
            expect(count).to.equal(0);
            callback();
          });
        },
        
        // send request
        function(callback){
          request(api).post('/raw/telemetry')
            .send(valid_raw_tlm_data)
            .expect(200, callback);
        },

        // verify that a document has been added to the database
        function(callback){
          api.models.Tlm.count({}, function(err, count){
            expect(count).to.equal(1);
            callback();
          });
        },

      ], done);
    });

    it('should respond with a 200 on success', function(done){
      // RockBlock doesn't know (or care) that we are creating a resource (would normally be a 201), it just wants a 200

      // send request
      request(api).post('/raw/telemetry')
        .send(valid_raw_tlm_data)
        .expect(200, done);
    });

    it('should respond with a 200 even with an invalid Message', function(done){
      // if we don't do this, RockBlock will continuously try to resend
      valid_raw_tlm_data.data = '48656c6c6f2c20776f726c6421'; // bare string, "hello world"
      async.series([

        // verify that the db is empty
        function(callback){
          api.models.Tlm.count({}, function(err, count){
            expect(count).to.equal(0);
            callback();
          });
        },
        
        // send request
        function(callback){
          request(api).post('/raw/telemetry')
            .send(valid_raw_tlm_data)
            .expect(200, callback);
        },

        // verify that a document has been added to the database
        function(callback){
          api.models.Tlm.count({}, function(err, count){
            expect(count).to.equal(0);
            callback();
          });
        },

      ], done);
    });

    describe('with auth enabled', function() {
      beforeEach(function(done){
        // create a server with raw_post_protected on
        config.auth_token = 'token';
        api = create_api(config, done);
      });

      it('should block requests from a bad source', function(done){
        // send request
        request(api).post('/raw/telemetry')
          .send(valid_raw_tlm_data)
          .expect(401, done);
      });
    });
  });

  describe('GET to the /raw/telemetry endpoint', function() {
    it('should work', function(done){
      request(api).get('/telemetry')
        .expect(200, done);
    });
  });

  describe('GET to the /telemetry endpoint', function() {
    it('should work', function(done){
      request(api).get('/telemetry')
        .expect(200, done);
    });
  });

  describe('GET to the /vehicle endpoint', function() {
    it('should work', function(done){
      request(api).get('/vehicle')
        .expect(200, done);
    });
  });

  describe('POST to the /vehicle endpoint', function() {
    it('should work', function(done){
      request(api).post('/vehicle')
        .send({imei: 'imei'})
        .expect(201, done);
    });
  });

  describe('GET to the /mission endpoint', function() {
    it('should work', function(done){
      request(api).get('/mission')
        .expect(200, done);
    });
  });

  describe('POST to the /mission endpoint', function() {
    // it('should work', function(done){
      // todo: make vehicle first
    //   request(api).post('/mission')
    //     .send({imei: 'imei'})
    //     .expect(201, done);
    // });
  });

  describe('GET to a collection endpoint', function() {
    // this covers the shared functionality across all collection endpoints

    beforeEach(function(done){
      // create some data on the server
      async.series([
        function(callback){
          request(api).post('/raw/telemetry')
            .send(valid_raw_tlm_data)
            .expect(200, callback);
        },

        function(callback){
          valid_raw_tlm_data.data = '01004920616d206120646966666572656e7420737472696e6720666f72204861776169692120486f706566756c6c792ef971';
          valid_raw_tlm_data.serial = '0001';
          request(api).post('/raw/telemetry')
            .send(valid_raw_tlm_data)
            .expect(200, callback);
        },
      ], done);
    });

    it('should include a list of documents', function(done){
      request(api).get('/raw/telemetry')
        .expect(200)
        .expect(function(res){
          expect(res.body.items.length).to.equal(2);
        })
        .end(done);
    });

    it('should include meta attributes', function(done){
      request(api).get('/raw/telemetry')
        .expect(200)
        .expect(function(res){
          expect(res.body.meta).to.deep.equal({count:2,skip:0,limit:20,sort:'_date'});
        })
        .end(done);
    });

    it('should support a where parameter', function(done){
      async.series([
        // make sure that are two documents in the DB
        function(callback){
          request(api).get('/telemetry?where={}')
            .expect(200)
            .expect(function(res){
              expect(res.body.items.length).to.equal(2);
            })
            .end(callback);
        },

        // make sure that filtering returns the correct subset
        function(callback){
          request(api).get('/telemetry?where={"serial":"0001"}')
            .expect(200)
            .expect(function(res){
              expect(res.body.items.length).to.equal(1);
            })
            .end(callback);
        },
      ], done);
    });

    it('should support a fields parameter', function(done){
      async.series([
        // make sure that all fields are included by default
        function(callback){
          request(api).get('/telemetry')
            .expect(200)
            .expect(function(res){
              expect(res.body.items.length).to.equal(2);
              expect(res.body.items[0].mission).to.not.equal(undefined);
            })
            .end(callback);
        },

        // verify that a subset of fields have been returned
        function(callback){
          request(api).get('/telemetry?fields={"serial":1}')
            .expect(200)
            .expect(function(res){
              expect(res.body.items.length).to.equal(2);
              expect(res.body.items[0].mission).to.equal(undefined);
            })
            .end(callback);
        },
      ], done);
    });

    it('should support a sort parameter', function(done){
      async.series([
        // sort one way
        function(callback){
          request(api).get('/telemetry?sort=+serial')
            .expect(200)
            .expect(function(res){
              expect(res.body.items.length).to.equal(2);
              expect(res.body.items[0].serial).to.equal('0000');
            })
            .end(callback);
        },

        // sort the other way
        function(callback){
          request(api).get('/telemetry?sort=-serial')
            .expect(200)
            .expect(function(res){
              expect(res.body.items.length).to.equal(2);
              expect(res.body.items[0].serial).to.equal('0001');
            })
            .end(callback);
        },
      ], done);
    });

    it('should support a limit parameter', function(done){
      async.series([
        // return many documents by default
        function(callback){
          request(api).get('/telemetry')
            .expect(200)
            .expect(function(res){
              expect(res.body.items.length).to.equal(2);
            })
            .end(callback);
        },

        // make sure that filtering returns the correct subset
        function(callback){
          request(api).get('/telemetry?limit=1')
            .expect(200)
            .expect(function(res){
              expect(res.body.items.length).to.equal(1);
            })
            .end(callback);
        },
      ], done);
    });

    it('should support a skip parameter', function(done){
      async.series([
        // return many documents by default
        function(callback){
          request(api).get('/telemetry')
            .expect(200)
            .expect(function(res){
              expect(res.body.items.length).to.equal(2);
            })
            .end(callback);
        },

        // make sure that filtering returns the correct subset
        function(callback){
          request(api).get('/telemetry?skip=1')
            .expect(200)
            .expect(function(res){
              expect(res.body.items.length).to.equal(1);
            })
            .end(callback);
        },
      ], done);
    });
  });

});
