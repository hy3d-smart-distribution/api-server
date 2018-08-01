var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var env = 'development';
var config = require('../config')[env];
var connection = mysql.createConnection({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.dbname
});
connection.connect();
/* GET users listing. */
router.get('/join', function(req, res, next) {
    res.render('join');
});
router.post('/join',function (req, res, next) {
    let body = req.body;
    let email = body.email;
    let name = body.name;
    let passwd = body.password;


});
router.get('/getusers', function(req, res, next) {
    let sql = 'select count(*) as count from product';
    connection.query(sql, function (err, results) {
        if (err) console.log(err);
        res.json(results);
    });
});
module.exports = router;
