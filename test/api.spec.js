// import
var request = require('supertest');
var expect = require('expect.js');
var create_api = require('src/api.js');

// common vars
var config;
var ver = '/v0';
 
describe('api', function() {
  var api;

  beforeEach(function(done){
    // reset config
    config = {
      port: 0,
      debug: false,
      logging: false,
      raw_post_protected: false,
      raw_post_domain: 'rock7mobile.com'
    };

    // make app
    api = create_api(config);

    done();
  });

  describe('the /raw endpoint', function() {
    var post_data;

    beforeEach(function(done){
      // reset post_data
      post_data = {
        imei: '000000000000000',
        device_type: 'ROCKBLOCK',
        serial: '8513',
        momsn: '0',
        transmit_time: '14-06-23 02:23:50',
        iridium_latitude: '33.8612',
        iridium_longitude: '-118.3447',
        iridium_cep: '3',
        data: '48656c6c6f2c20776f726c6421'
      };

      done();
    });

    it('should block POST requests from a bad source', function(done){
      // create a server with raw_post_protected on
      config.raw_post_protected = true;
      api = create_api(config);

      // send request
      request(api).post(ver+'/raw')
        .send(post_data)
        .expect(401, done);
    });

    it('should block POST requests with a bad request format', function(done){
      // mess up the request data
      delete post_data.imei;

      // send request
      request(api).post(ver+'/raw')
        .send(post_data)
        .expect(400, done);
    });

    it('should accept POST requests with a good request format', function(done){
      // send request
      request(api).post(ver+'/raw')
        .send(post_data)
        .expect(200, done);
    });
  });

  describe('the /telem endpoint', function() {
    it('should work', function(done){
      request(api).get(ver+'/telem')
        .expect(200, done);
    });
  });

});
