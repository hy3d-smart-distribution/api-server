let express = require('express');
let router = express.Router();
let mysql = require('mysql');
let env = 'development';
let config = require('../config')[env];
let passport = require('passport');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
let connection = mysql.createConnection({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.dbname
});

connection.connect();
/* GET users listing. */
router.get('/info',function (req, res, next) {
    passport.authenticate('local-jwt', (err, token) => {
        if (err) return next(err);
        if (!token) return res.status(403).json("failed");
        req.login(token, {session: false}, (err) => {
            if (err) {
                res.status(500).json(err);
            }
            let query = connection.query('select name from member where id=?',[token.id],function (err, rows) {
                res.status(200).json(rows[0]);
            });
        });

    })(req, res, next);
});

module.exports = router;
