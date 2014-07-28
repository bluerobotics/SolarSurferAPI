'use strict';
/* jslint node: true */

module.exports = function(api) {
  var db = api.db;

  var models = {};

  models.Tlm = db.model('Tlm', new db.Schema({
    name: 'string',
    size: 'string'
  }));

  models.Cmd = db.model('Cmd', new db.Schema({
    name: 'string',
    size: 'string'
  }));

  // actual module export
  return models;
};
