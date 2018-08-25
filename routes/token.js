
let express = require('express');
let router = express.Router();
let mysql = require('mysql');
let env = 'development';
let config = require('../config')[env];
let passport = require('passport');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
let mkdir = require('mkdirp');
let connection = mysql.createConnection({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.dbname
});
const sha256 = x => crypto.createHash('sha256').update(x, 'utf8').digest('hex');
connection.connect();
/* GET users listing. */

router.post('/join', function (req, res, next) {
    passport.authenticate('local-join',{session: false},function(err,user,info){
        if(err) res.status(500).json(err);
        else if(!user){
            return res.status(401).json({result: "error", description: info.description});
        }
        else{
            req.logIn(user, function (err) {
                if (err) {
                    console.log(err);
                    return res.status(400).json({message: "error"});
                }

                return res.json({result: "success", description: "success"});
            })
        }

    })(req,res,next);
});


router.post('/login', function (req, res, next) {
    const {username, password} = req.body;
    passport.authenticate('local-login', {session: false}, (err, user, info) => {
        if (err || !user) {
            if(err){
                return res.status(400).json(err);
            }else{
                return res.status(400).json({result: "error", description: info.description });
            }
        }
        req.login(user, {session: false}, (err) => {
            if (err) {
                res.send(err);
            }
            let info = user;
            let policy = {expiresIn: 300};
            jwt.sign(info, req.app.get('jwt-secret'),policy, (err, token) => {
                if (err) console.log(err);
                return res.json({result: "success",description: "success" ,token,user});
            });
        });
    })(req, res);

});

router.get('/auth',function (req, res, next) {
    passport.authenticate('local-jwt', (err, token) => {
        if (err) return next(err);
        if (!token) return res.status(403).json({result:"errror"});
        req.login(token, {session: false}, (err) => {
            if (err) {
                res.status(500).json(err);
            }
            console.log(token);
            res.status(200).json({result : "success"})
        ;
    });

    })(req, res, next);
});
router.post('/google-auth',function (req, res, next) {
    passport.authenticate('google-auth', (err, data) => {
        if (err) return next(err);
        if (!data) return res.status(403).json("no data");
        req.login(data, {session: false}, (err) => {
            if (err) {
                res.status(500).json(err);
            }
            console.log(data);
            let a =
            res.status(200).json({message : sha256('banana')});
        });


    })(req, res, next);
});


router.get('/refresh', function (req, res,next) {
    passport.authenticate('local-jwt', (err, token) => {
        if (err) return next(err);
        if (!token) return res.status(403).json("failed");
        req.login(token, {session: false}, (err) => {
            if (err) {
                res.status(500).json(err);
            }
            let policy = {expiresIn: 300};
            let info = {
                email : token.email,
                id : token.id,
                company_id : token.company_id
            };
            jwt.sign(info, req.app.get('jwt-secret'),policy, (err, newtoken) => {
                if (err) console.log(err);
                return res.status(200).json({token: newtoken});
            });
        });

    })(req, res, next);
});
module.exports = router;

