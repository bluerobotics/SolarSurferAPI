var request = require('supertest');
var expect = require('expect.js');
var api = require('src/api.js').api();
 
describe('api', function() {

  describe('the raw/ endpoint', function() {
    var good_imei = '';

    it('should accept POST requests from RockSeven', function(done){
      request(api).post('/v0/')
        .send({ name: 'John', email: 'john@rpjs.co'})
        .expect(200)
        .end(function(err, res){
          // console.log(res.body)
          // expect(e).to.eql(null)
          // expect(res.body.length).to.eql(1)
          // expect(res.body[0]._id.length).to.eql(24)
          // id = res.body[0]._id
          done();
        });
    });

    it('should block POST requests incorrect with a bad imei', function(done){
      request(api).post('/v0/')
        .send({ name: 'John', email: 'john@rpjs.co'})
        .expect(401, done);
    });
  });

});
