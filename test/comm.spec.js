// import
var expect = require('expect.js');
var comm = require('src/comm.js');

// common vars
var config;
 
describe('comm', function() {
  var api;

  beforeEach(function(done){
    // reset config
    config = {
      version: 'v0',
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

  describe('the decode function', function() {
    var post_data;

    beforeEach(function(done){
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

      done();
    });

    it('should decode test/string messages', function(done){
      // create msg
      comm.hex2a

      // send request
      request(api).post('/raw/tlm')
        .send(post_data)
        .expect(401, done);
    });
  });

});
