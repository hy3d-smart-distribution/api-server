var express = require('express');
const jwt = require('jsonwebtoken');
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

router.get('/login',function (req, res, next) {
    const {username, password} = req.body;
    const secret = req.app.get('jwt-secret');
    jwt.sign(
    {
            username: username
        },
        secret,
        {
            expiresIn: 60,
            issuer: 'hy3d.com',
            subject: 'userInfo'
        }, (err, token) => {
            if (err) console.log(err);
            res.json({
                result: true,
                token: token});
        });
});

router.get('/auth',function (req, res, next) {
    const token = req.headers['x-access-token'] || req.query.token;
    const secret = req.app.get('jwt-secret');
    jwt.verify(token, req.app.get('jwt-secret'), function (err, decoded){
        if(err) return res.json(err);
        return res.json(decoded);
    });
});
router.get('/getusers', function(req, res, next) {
    let sql = 'select count(*) as count from product';
    connection.query(sql, function (err, results) {
        if (err) console.log(err);
        res.json(results);
    });
});
module.exports = router;
