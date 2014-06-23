// import
var express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser');
  // mongoskin = require('mongoskin'),

module.exports = {
  api: function () {
    // vars
    var app = express();
    var ver = '/v0';
    // var db = mongoskin.db('mongodb://@localhost:27017/test', {safe:true});

    // configure express
    app.use(morgan('[:date] :method :url :status - :remote-addr - :response-time ms'));
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());

    // app.param('collectionName', function(req, res, next, collectionName){
    //   req.collection = db.collection(collectionName);
    //   return next();
    // });

    app.get(ver+'/', function(req, res, next) {
      res.send('hello world');
    });

    app.post(ver+'/', function(req, res, next) {
      res.send(req.body);
      console.log(req.body);
    });

    return app;
  }
};
