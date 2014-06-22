// import
var express = require('express'),
  morgan = require('morgan');
  // mongoskin = require('mongoskin'),
  // bodyParser = require('body-parser');

// vars
var app = express();
var ver = '/v0';
// app.use(bodyParser());

// var db = mongoskin.db('mongodb://@localhost:27017/test', {safe:true});

app.use(morgan('[:date] :method :url :status - :remote-addr - :response-time ms'));

// app.param('collectionName', function(req, res, next, collectionName){
//   req.collection = db.collection(collectionName);
//   return next();
// });

app.get(ver+'/', function(req, res, next) {
  console.log('');

  res.send('hello world');
});

app.listen(7873); // SURF
