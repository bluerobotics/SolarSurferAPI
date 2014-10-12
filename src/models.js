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

// Command
models.Cmd = mongoose.model('Cmd', new Schema({
  _date:    {type: Date, default: Date.now(), required: true},
  _ip:      {type: String, required: true},
  mission:  {type: Schema.Types.ObjectId, ref: 'Mission', required: true},
  data:     {type: Schema.Types.Mixed, required: true},
  raw:      {type: String, required: true},
}, schemaOptions).plugin(idvalidator));

// Vehicle
models.Vehicle = mongoose.model('Vehicle', new Schema({
  _date:    {type: Date, default: Date.now(), required: true},
  _ip:      {type: String, required: true},
  name:     {type: String, default: 'Vehicle', required: true},
  imei:     {type: String, required: true}, // International Mobile Equipment Identity
  current_mission: {type: Schema.Types.ObjectId, ref: 'Mission'},
}, schemaOptions).plugin(idvalidator));

// Mission
models.Mission = mongoose.model('Mission', new Schema({
  _date:    {type: Date, default: Date.now(), required: true},
  _ip:      {type: String, required: true},
  name:     {type: String, default: 'Mission', required: true},
  vehicle:  {type: Schema.Types.ObjectId, ref: 'Vehicle', required: true},
}, schemaOptions).plugin(idvalidator));

// Tlm
var TlmSchema = new Schema({
  _date:    {type: Date, default: Date.now(), required: true},
  _ip:      {type: String, required: true},
  imei:     {type: String, required: true}, // International Mobile Equipment Identity
  mission:  {type: Schema.Types.ObjectId, ref: 'Mission', required: true},
  data:     {type: Schema.Types.Mixed, required: true},
  raw:      {type: String, required: true},
}, schemaOptions).plugin(idvalidator);
TlmSchema.pre('validate', function (next) {
  var tlm = this;

  // RockSeven posts "data" but we want to call this "raw"
  tlm.raw = tlm.data;
  tlm.data = {};

  // 1: need imei to continue, validation with throw an error later if needed
  if(tlm.imei === undefined) next();

  // determine which mission this telemetry belongs to
  else {
    // 4: try to decode the data
    var decode_data = function(tlm) {
      console.log('Decoding: ', tlm.raw);
      try {
        tlm.data = Message.decode(tlm.raw);
      }
      catch(e) {
        // oh well, I guess we can't decode it...
        console.log('Message decode error:', e);
      }

      // 5: ready to move on, regardless of if decoding worked or not
      next();
    };

    // 3: once we have the vehicle, do this
    var vehicle_callback = function(vehicle) {
      if(vehicle.current_mission !== undefined) {
        // great! we've already established a current mission
        tlm.mission = vehicle.current_mission;
        decode_data(tlm);
      }
      else {
        // looks like we need to create a mission
        var mission = new models.Mission({
          _date: tlm._date,
          _ip: tlm._ip,
          vehicle: vehicle._id
        });
        mission.save(function(err, doc) {
          if(err) {
            console.error('Unable to auto-create mission', err);
            next();
          }
          else {
            // make sure we save this new mission back at the vehicle
            tlm.mission = doc._id;
            vehicle.current_mission = doc._id;
            vehicle.save(function(err, doc) {
              if(err) console.error('Unable to add current_mission to vehicle', err);

              // next step!
              decode_data(tlm);
            });
          }
        });
      }
    };

    // 2: look up or create vehicle
    models.Vehicle.findOne({imei: tlm.imei}, function(err, vehicle){
      if(vehicle !== undefined && vehicle !== null) vehicle_callback(vehicle);
      else {
        // looks like we need to create a vehicle
        vehicle = new models.Vehicle({
          _date: tlm._date,
          _ip: tlm._ip,
          name: tlm.imei,
          imei: tlm.imei
        });
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
models.Tlm = mongoose.model('Tlm', TlmSchema);

// actual module export
module.exports = models;
