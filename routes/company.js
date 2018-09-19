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

router.get('/list',function (req, res, next) {
    passport.authenticate('local-jwt', (err, token) => {
        if (err) return next(err);
        if (!token) return res.status(403).json({result:"token_not_valid"});
        req.login(token, {session: false}, (err) => {
            if (err) {
                res.status(500).json(err);
                return;
            }else{
                let show_company = connection.query('select id, name from company',function (err, rows) {
                    if (err) {
                        res.status(500).json(err);
                    }else if(rows.length===0){
                        res.status(500).json({result: "error", description: "empty_list"});
                    }else{
                        res.status(200).json({result: "success", description: "success", company: rows});
                    }
                });
            }

        });
    })(req, res, next);
});
router.post('/add',function (req, res, next) {

    passport.authenticate('local-jwt', (err, token) => {
        if (err) return next(err);
        if (!token) return res.status(403).json({result:"token_not_valid"});
        req.login(token, {session: false}, (err) => {
            if(req.body.company===undefined){
                return res.status(403).json({result: 'no_companyName'});
            }
            if (err) {
                res.status(500).json(err);
                return;
            }else{
                let get_privilege = connection.query('select privilege from member where email = ?',[token.email],
                    function (err, rows) {
                        if(rows[0].privilege === 0){
                            res.status(403).json({result: "no_privilege"});
                        }else{
                            let new_company = connection.query('insert into company(name) values(?)',
                                [req.body.company],function (err, rows) {
                                if (err) {
                                    res.status(500).json(err);
                                }else{
                                    res.status(200).json({result: "success"});
                                }
                            });
                        }
                });


            }

        });
    })(req, res, next);
});
router.delete('remove',function (req, res, next) {
    passport.authenticate('local-jwt', (err, token) => {
        if (err) return next(err);
        if (!token) return res.status(403).json({result:"token_not_valid"});
        req.login(token, {session: false}, (err) => {
            if(req.body.companyid===undefined) {
                res.status(400).json({result: "no_companyid_found"});
            }
            else if (err) {
                res.status(500).json(err);
                return;
            }else{
                let delete_company = connection.query('delete from company where id = ?',[req.body.companyid],function (err, rows) {
                    if (err) {
                        res.status(500).json(err);
                    }else{
                        res.status(200).json({result: "success"});
                    }
                });
            }
        });
    })(req, res, next);
});

module.exports = router;