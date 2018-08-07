
let express = require('express');
let router = express.Router();
let mysql = require('mysql');
let env = 'development';
let config = require('../config')[env];
let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
const passportJWT = require("passport-jwt");
const JWTStrategy   = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
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
    passport.authenticate('local-join',function(err,user,info){
        if(err) res.status(500).json(err);
        if(!user) return res.status(401).json(info.message);
        req.logIn(user, function (err) {

            if (err) {
                return next(err);}
            return res.json("success");
        })
    })(req,res,next);
});


router.post('/login', function (req, res, next) {
    const {username, password} = req.body;
    passport.authenticate('local-login', {session: false}, (err, user, info) => {
        if (err || !user) {
            if(err){
                return res.status(400).json(info);
            }else{
                return res.status(400).json(info);
            }
        }
        req.login(user, {session: false}, (err) => {
            if (err) {
                res.send(err);
            }
            let info = user;
            let policy = {expiresIn: 120};
            jwt.sign(info, req.app.get('jwt-secret'),policy, (err, token) => {
                if (err) console.log(err);
                tokenToReturn = token;
                return res.json({email: user.email, token});
            });
        });
    })(req, res);

});

router.get('/auth',function (req, res, next) {
    passport.authenticate('local-jwt', (err, user) => {

        if (err) return next(err); // It is null
        if (!user) return res.status(403).json("failed");
        res.status(200).json(user);

    })(req, res, next);
});
module.exports = router;

