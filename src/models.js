'use strict';
/* jslint node: true */

// import
var mongoose = require('mongoose');
mongoose.models = {};
mongoose.modelSchemas = {};

var models = {};

models.Tlm = mongoose.model('RawTlm', new mongoose.Schema({
  imei: 'string',
  data: 'string',
  ip: 'string'
}));

models.Cmd = mongoose.model('RawCmd', new mongoose.Schema({
  name: 'string',
  size: 'string'
}));

models.Tlm = mongoose.model('Tlm', new mongoose.Schema({
  name: 'string',
  size: 'string'
}));

models.Cmd = mongoose.model('Cmd', new mongoose.Schema({
  name: 'string',
  size: 'string'
}));

// actual module export
module.exports = models;
