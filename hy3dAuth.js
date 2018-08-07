
let mysql = require('mysql');
let LocalStrategy = require('passport-local').Strategy;
let passportJWT = require("passport-jwt");
let JWTStrategy   = passportJWT.Strategy;
let ExtractJWT = passportJWT.ExtractJwt;
let env = 'development';
let config = require('./config')[env];
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
module.exports = function (passport) {
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
            secretOrKey   : config.secret
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
};

