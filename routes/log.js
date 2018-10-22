/**
 * Created by chou6 on 2018-10-22.
 */
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

const sha256 = x => crypto.createHash('sha256').update(x, 'utf8').digest('hex');
let connection = mysql.createConnection({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.dbname
});
router.post('/', function (req, res, next) {
    let body = req.body;
    let insert_log = connection.query('insert into templog(dept, user_name ,place ,log) values(?, ?, ?, ?) ', [body.dept, body.email,  body.place, body.message], function (err, rows) {
        if(err){
            console.log(err);
            return res.status(500).json({result: "error"});
        }else{
            return res.status(200).json({result: "success"});
        }

    });
});
module.exports = router;