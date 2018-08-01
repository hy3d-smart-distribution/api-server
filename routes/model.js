var express = require('express');
var path = require('path');
var router = express.Router();
var app = express();


router.get('/', function(req, res, next) {

  var file = __dirname + '/../public/models/asd.bundle';
  res.download(file);
});

module.exports = router;
