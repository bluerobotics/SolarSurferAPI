'use strict';
/* jslint node: true */
/* global describe, beforeEach, afterEach, it */

// import
var request = require('supertest');
var expect = require('expect.js');
var _ = require('lodash');
var create_api = require('src/api.js');
var standard_config = require('src/config.js');

// common vars
var config;
 
describe('api', function() {
  var api;

  beforeEach(function(){
    // reset testing config
    config = _.clone(standard_config, true);
    config.debug = false;
    config.logging = false;
    config.auth_enabled = false;

    // make app
    api = create_api(config);
  });

  afterEach(function() {
    // clear the database
    var doNothing = function() {};
    for(var i in api.db.collections) {
      api.db.collections[i].remove(doNothing);
    }
  });

  describe('the / endpoint', function() {
    it('should list child endpoints', function(done){
      request(api).get('/')
        .expect(200, done);
    });
  });

  describe('the /tlm endpoint', function() {
    it('should work', function(done){
      request(api).get('/tlm')
        .expect(200, done);
    });
  });

  describe('the /raw endpoint', function() {
    it('should list child endpoints', function(done){
      request(api).get('/raw')
        .expect(200, done);
    });
  });

  describe('the /raw/tlm endpoint', function() {
    var post_data;

    beforeEach(function(){
      // reset post_data
      post_data = {
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
    });

    it('should block POST requests from a bad source', function(done){
      // create a server with raw_post_protected on
      config.auth_enabled = true;
      api = create_api(config);

      // send request
      request(api).post('/raw/tlm')
        .send(post_data)
        .expect(401, done);
    });

    it('should block POST requests with a bad request format', function(done){
      // mess up the request data
      delete post_data.imei;

      // send request
      request(api).post('/raw/tlm')
        .send(post_data)
        .expect(400, done);
    });

    it('should accept POST requests with a good request format', function(done){
      // send request
      request(api).post('/raw/tlm')
        .send(post_data)
        .expect(200, done);
    });

    it('should insert a document into the raw_tlm collection', function(done){
      done();
    });
  });

  describe('the /cmd endpoint', function() {
    // it('should block POST that fail RockSeven forwarding', function(done){
    //   // create a server with raw_post_protected on
    //   config.auth_enabled = true;
    //   api = create_api(config);

    //   // send request
    //   request(api).post('/raw/cmd')
    //     .send({})
    //     .expect(400, done);
    // });

    it('should accept POST requests that are accepted by RockSeven', function(done){
      // send request
      request(api).post('/cmd')
        .send({})
        .expect(200, done);
    });
  });

});
