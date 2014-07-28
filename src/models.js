'use strict';
/* jslint node: true */

// import
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
mongoose.models = {};
mongoose.modelSchemas = {};

var models = {};

models.RawTlm = mongoose.model('RawTlm', new Schema({
  _date:  {type: Date, default: Date.now(), required: true},
  _ip:    {type: String, required: true},
  imei:   {type: String, required: true},
  data:   {type: String, required: true},
}, { strict: false }));

models.RawCmd = mongoose.model('RawCmd', new Schema({
}));

models.Tlm = mongoose.model('Tlm', new Schema({
}));

models.Cmd = mongoose.model('Cmd', new Schema({
}));

// actual module export
module.exports = models;
