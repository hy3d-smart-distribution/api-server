
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
passport.serializeUser(function (user, done) {
    console.log("serialize");
    done(null,user);
});
passport.deserializeUser(function (user,done) {
    console.log("deserialize");
    done(null,user);
});

passport.use('local-join', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },function (req, email, password, done) {
        let query_1 = connection.query('select email from member where email=?',[email],function (err,rows) {
            if(err) return done(err);
            if(rows.length){
                return done(null, false, {message: 'email_inuse'});
            }else{
                let query_2 = connection.query('insert into member(company_id, email, password, name) values(?, ?, ?, ?) ', sql, function (err,rows) {
                   if(err) return done(err);
                   if(rows.length)
                       return done(null,{email: email, password: password});
                });

            }
        });

    }

));
passport.use('local-jwt',new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey   : 'hy3d'
    },
    function (jwtPayload, done) {
        console.log(jwtPayload);
        return done(null,{message: "success"});

    }
));
passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },function (req, email, password, done) {
        let query_1 = connection.query('select email from member where email=?',[email],function (err,rows) {
            if(err) return done(err);
            if(rows.length==0){
                return done(null, false, {message: 'invalid_username'});
            }else{
                let query_2 = connection.query('select email from member where email=? and password = ?',[email, sha256(password)], function (err,rows) {
                    if(err) return done(err);
                    if(rows.length){
                        return done(null,{email: rows[0].email});
                    }else{

                        return done(null, false, {message: 'invalid_password'});
                    }
                });

            }
        });

    }

));

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
            return res.status(400).json({
                message: 'Something is not right',
                user   : user
            });
        }
        req.login(user, {session: false}, (err) => {
            if (err) {
                res.send(err);
            }
            let info = user;
            console.log(info);
            jwt.sign(info, 'hy3d', (err, token) => {
                if (err) console.log(err);
                tokenToReturn = token;
                return res.json({email: user.email, token});
            });
        });
    })(req, res);

});

router.get('/auth',function (req, res, next) {
    console.log(req.get('Authorization'));
    passport.authenticate('local-jwt', (err, user) => {

        if (err) return next(err); // It is null
        if (!user) return res.status(403).json("failed");
        res.status(200).json(user);

    })(req, res, next);
});
module.exports = router;

