let express = require('express');
let path = require('path');
let router = express.Router();
let app = express();

let env = 'development';
let config = require('../config')[env];

router.get('/', function(req, res, next) {
  var file = __dirname + '/../public/models/asd.bundle';
  res.download(file);
});

module.exports = router;
