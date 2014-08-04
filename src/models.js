'use strict';
/* jslint node: true */

// import
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
mongoose.models = {};
mongoose.modelSchemas = {};

// prep Message class
var Message = require('SolarSurferMessage');
Message.loadConfigFile();
console.log('Message format version:', Message.version);

var models = {};

models.RawCmd = mongoose.model('RawCmd', new Schema({
}));

models.Tlm = mongoose.model('Tlm', new Schema({
  _date:  {type: Date, default: Date.now(), required: true},
  _ip:    {type: String, required: true},
  imei:   {type: String, required: true},
  data:   {type: String, required: true},
}, { strict: false }));

models.Cmd = mongoose.model('Cmd', new Schema({
}));

// Raw Tlm
var RawTlmSchema = new Schema({
  _date:  {type: Date, default: Date.now(), required: true},
  _ip:    {type: String, required: true},
  imei:   {type: String, required: true},
  data:   {type: String, required: true},
}, { strict: false });
RawTlmSchema.post('save', function (doc) {
  // try to decode this message automatically
  console.log('Decoding: ', doc.data);
  try {
    var decoded = Message.decode(doc.data);
    var tlm = new models.Tlm(doc.toObject());
    tlm.data = decoded;
    tlm.save();
  }
  catch(e) {
    // oh well, I guess we can't decode it...
    console.log('Message decode error:', e);
  }
});
models.RawTlm = mongoose.model('RawTlm', RawTlmSchema);

// actual module export
module.exports = models;
