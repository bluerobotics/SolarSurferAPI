'use strict';
/* jslint node: true */
/* global describe, beforeEach, afterEach, it */

// import
var async = require('async');
var request = require('supertest');
var expect = require('expect.js');
var _ = require('lodash');
var create_api = require('src/api.js');
var standard_config = require('src/config.js');

// common vars
var config;
 
describe('api', function() {
  var api;
    var valid_raw_tlm_data;

  beforeEach(function(done) {
    // reset testing config
    config = _.clone(standard_config, true);
    config.debug = false;
    config.logging = false;
    config.auth_enabled = false;

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
      data: '48656c6c6f2c20776f726c6421'
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

  describe('POST to the /cmd endpoint', function() {
    it('should block requests with a bad request format', function(){
    });

    it('should add document to /cmd', function(){
    });

    it('should add the encoded document to /raw/cmd', function(){
    });

    it('should forward an encoded message to RockSeven', function(){
    });

    it('should return the response code from RockSeven forwarding', function(done){
      // send request
      request(api).post('/cmd')
        .send({})
        .expect(201, done);
    });

    describe('with auth enabled', function() {
      beforeEach(function(done){
        // create a server with raw_post_protected on
        config.auth_enabled = true;
        api = create_api(config, done);
      });

      it('should block requests from a bad source', function(){
        // // send request
        // request(api).post('/raw/cmd')
        //   .send({})
        //   .expect(400, done);
      });
    });
  });

  describe('GET to the /raw endpoint', function() {
    it('should list child endpoints', function(done){
      request(api).get('/raw')
        .expect(200, done);
    });
  });

  describe('POST to the /raw/tlm endpoint', function() {
    it('should block requests with a bad request format', function(done){
      // mess up the request data
      delete valid_raw_tlm_data.imei;

      // send request
      request(api).post('/raw/tlm')
        .send(valid_raw_tlm_data)
        .expect(400, done);
    });

    it('should add document to /raw/tlm', function(done){
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
          request(api).post('/raw/tlm')
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

    it('should add the decoded document to /tlm', function(){
    });

    it('should respond with a 200 on success', function(done){
      // RockBlock doesn't know (or care) that we are creating a resource (would normally be a 201), it just wants a 200

      // send request
      request(api).post('/raw/tlm')
        .send(valid_raw_tlm_data)
        .expect(200, done);
    });

    it('should respond with a 200 even with an invalid Message', function(){
      // if we don't do this, RockBlock will continuously try to resend
    });

    describe('with auth enabled', function() {
      beforeEach(function(done){
        // create a server with raw_post_protected on
        config.auth_enabled = true;
        api = create_api(config, done);
      });

      it('should block requests from a bad source', function(done){
        // send request
        request(api).post('/raw/tlm')
          .send(valid_raw_tlm_data)
          .expect(401, done);
      });
    });
  });

  describe('GET to the /raw/tlm endpoint', function() {
    it('should work', function(done){
      request(api).get('/tlm')
        .expect(200, done);
    });
  });

  describe('GET to the /tlm endpoint', function() {
    it('should work', function(done){
      request(api).get('/tlm')
        .expect(200, done);
    });
  });

  describe('GET to a collection endpoint', function() {
    // this covers the shared functionality across all collection endpoints

    it('should include an items attribute and a meta attribute', function(done){
      request(api).get('/raw/tlm')
        .expect(200)
        .expect({items:[],meta:{count:0,skip:0,limit:20}}, done);
    });

    it('should return a list of documents', function(done){
      async.series([

        function(callback){
          request(api).post('/raw/tlm')
            .send(valid_raw_tlm_data)
            .expect(200, callback);
        },

        // verify that a document is returned to us
        function(callback){
          request(api).get('/raw/tlm')
            .expect(200)
            .expect(function(res){
              expect(res.body.items.length).to.equal(1);
            })
            .end(callback);
        },

      ], done);
    });

    // it('should support a where parameter', function(done){
    //   request(api).get('/tlm')
    //     .expect(200)
    //     .expect({items:[],meta:{count:0}}, done);
    // });

    // it('should support a limit parameter', function(done){
    //   request(api).get('/tlm')
    //     .expect(200)
    //     .expect({items:[],meta:{count:0}}, done);
    // });
  });

});
