/**
 * Created by chou6 on 2018-08-31.
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

router.get('',function (req, res, next) {
    passport.authenticate('local-jwt', (err, token) => {
        if (err) return next(err);
        if (!token) return res.status(403).json({result:"token_not_valid"});
        req.login(token, {session: false}, (err) => {
            if (err) {
                res.status(500).json(err);
                return;
            }else{
                let show_company = connection.query('',function (err, rows) {
                    
                });
            }

        });
    })(req, res, next);
});

module.exports = router;