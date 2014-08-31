'use strict';
/* jslint node: true */

// import
var mongoose = require('mongoose'),
    idvalidator = require('mongoose-id-validator'),
    Schema = mongoose.Schema;
mongoose.models = {};
mongoose.modelSchemas = {};

// prep Message class
var Message = require('SolarSurferMessage');
Message.loadConfigFile();
console.log('Message format version:', Message.version);

var models = {};
var schemaOptions = { strict: false, versionKey: '_etag' };

var CmdSchema = new Schema({
  _date:    {type: Date, default: Date.now(), required: true},
  _ip:      {type: String, required: true},
  mission:  {type: Schema.Types.ObjectId, ref: 'Mission', required: true},
  data:     {type: Schema.Types.Mixed, required: true},
}, schemaOptions).plugin(idvalidator);
CmdSchema.post('save', function (doc) {
  // try to encoding this message automatically
  console.log('Encoding: ', doc.data);
  try {
    var encoded = Message.encode(doc.data);
    var rawcmd = new models.RawCmd(doc.toObject());
    rawcmd.data = encoded;
    rawcmd.imei = 'fake'
    // delete tlm._id;
    // console.log(tlm)
    rawcmd.save();
  }
  catch(e) {
    // oh well, I guess we can't encode it...
    console.log('Message encode error:', e);
  }
});
models.Cmd = mongoose.model('Cmd', CmdSchema);

models.RawCmd = mongoose.model('RawCmd', new Schema({
  _date:    {type: Date, default: Date.now(), required: true},
  _ip:      {type: String, required: true},
  imei:     {type: String, required: true}, // International Mobile Equipment Identity
  mission:  {type: Schema.Types.ObjectId, ref: 'Mission', required: true},
  data:     {type: String, required: true},
}, schemaOptions)); //.plugin(idvalidator)

// Vehicle
models.Vehicle = mongoose.model('Vehicle', new Schema({
  name:     {type: String, default: 'Vehicle', required: true},
  imei:     {type: String, required: true}, // International Mobile Equipment Identity
  current_mission: {type: Schema.Types.ObjectId, ref: 'Mission'},
}, schemaOptions).plugin(idvalidator));

// Mission
models.Mission = mongoose.model('Mission', new Schema({
  name:     {type: String, default: 'Mission', required: true},
  vehicle:  {type: Schema.Types.ObjectId, ref: 'Vehicle', required: true},
}, schemaOptions).plugin(idvalidator));

// Tlm
models.Tlm = mongoose.model('Tlm', new Schema({
  _date:    {type: Date, default: Date.now(), required: true},
  _ip:      {type: String, required: true},
  imei:     {type: String, required: true}, // International Mobile Equipment Identity
  mission:  {type: Schema.Types.ObjectId, ref: 'Mission', required: true},
  data:     {type: Schema.Types.Mixed, required: true},
}, schemaOptions)); //.plugin(idvalidator)

// Raw Tlm
var RawTlmSchema = new Schema({
  _date:    {type: Date, default: Date.now(), required: true},
  _ip:      {type: String, required: true},
  imei:     {type: String, required: true}, // International Mobile Equipment Identity
  mission:  {type: Schema.Types.ObjectId, ref: 'Mission', required: true},
  data:     {type: String, required: true},
}, schemaOptions).plugin(idvalidator);
RawTlmSchema.pre('validate', function (next) {
  var raw_tlm = this;

  // need imei to continue, validation with through an error later if needed
  if(raw_tlm.imei === undefined) next();

  // determine which mission this telemetry belongs to
  else {
    // once we have the vehicle, do this
    var vehicle_callback = function(vehicle) {
      if(vehicle.current_mission !== undefined) {
        // great! we've already established a current mission
        raw_tlm.mission = vehicle.current_mission;
        next();
      }
      else {
        // looks like we need to create a mission
        var mission = new models.Mission({vehicle: vehicle._id});
        mission.save(function(err, doc) {
          if(err) {
            console.error('Unable to auto-create mission', err);
            next();
          }
          else {
            // make sure we save this new mission back at the vehicle
            raw_tlm.mission = doc._id;
            vehicle.current_mission = doc._id;
            vehicle.save(function(err, doc) {
              if(err) console.error('Unable to add current_mission to vehicle', err);

              // we are finally ready to go
              next();
            });
          }
        });
      }
    };

    // look up or create vehicle
    models.Vehicle.findOne({imei: raw_tlm.imei}, function(err, vehicle){
      if(vehicle !== undefined && vehicle !== null) vehicle_callback(vehicle);
      else {
        // looks like we need to create a vehicle
        vehicle = new models.Vehicle({name: raw_tlm.imei, imei: raw_tlm.imei});
        vehicle.save(function(err, doc) {
          if(err) {
            console.error('Unable to auto-create vehicle', err);
            next();
          }
          else vehicle_callback(doc);
        });
      }
    });
  }
});
RawTlmSchema.post('save', function (doc) {
  // try to decode this message automatically
  console.log('Decoding: ', doc.data);
  try {
    var decoded = Message.decode(doc.data);
    var tlm = new models.Tlm(doc.toObject());
    tlm.data = decoded;
    // delete tlm._id;
    // console.log(tlm)
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
