let express = require('express');
let router = express.Router();
let multer = require('multer');
let path = require('path');
let mkdir = require('mkdirp');
let mysql = require('mysql');
let env = 'development';
let config = require('../config')[env];
const crypto = require('crypto');
let passport = require('passport');
let env = 'development';
let config = require('../config')[env];
let connection = mysql.createConnection({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.dbname
});
router.get('/:hash', function(req, res, next) {

  //var file = __dirname + '/../public/models/' + req.params.name;
  //res.download(file);
});
module.exports = router;
