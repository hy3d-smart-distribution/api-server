let mysql = require('mysql');
let LocalStrategy = require('passport-local').Strategy;
let CustomStrategy = require('passport-custom');
let passportJWT = require("passport-jwt");
let JWTStrategy = passportJWT.Strategy;
let ExtractJWT = passportJWT.ExtractJwt;
let env = 'development';
let config = require('./config')[env];
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const {OAuth2Client} = require('google-auth-library');

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
        done(null, user);
    });
    passport.deserializeUser(function (user, done) {
        console.log("deserialize");
        done(null, user);
    });
    passport.use('google-auth', new CustomStrategy(
        function (req, done) {
            let body = req.body;
            console.log(body);
            done(null, {id: "1"});

        }
    ));
    passport.use('local-join', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        }, function (req, email, password, done) {
            let body = req.body;
            let query_1 = connection.query('select email from member where email=?', [email], function (err, rows) {
                if (err) return done(err);
                if (rows.length) {
                    return done(null, false, {description: 'email_inuse'});
                } else {
                    let query_2 = connection.query('insert into member(company_id, email, password, name) values(?, ?, ?, ?) ', [body.company_id, email, sha256(password), body.name], function (err, rows) {
                        if (err) {
                            return done(err);
                        }
                        let query_3 = connection.query('select id from member where email = ?', [email], function (err, rows) {
                            if (err) return done(err);
                            if (rows.length) {
                                return done(null, {id: rows[0].id});
                            }
                        });

                    });

                }
            });

        }
    ));
    passport.use('local-jwt', new JWTStrategy({
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.secret
        },
        function (jwtPayload, done) {
            return done(null, jwtPayload);

        }
    ));

    passport.use('local-login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        }, function (req, email, password, done) {
            let find_user = connection.query('select email from member where email=?', [email], function (err, rows) {
                if (err) return done(err);
                if (rows.length == 0) {
                    return done(null, false, {description: 'invalid_username'});
                } else {
                    let query_2 = connection.query('select email, member.name as name, company.name as company ' +
                        'from member join company on company.id = company_id where email= ? and password = ?', [email, sha256(password)],
                        function (err, rows) {
                            if (err) return done(err);
                            if (rows.length) {
                                return done(null, {
                                    email: rows[0].email, name: rows[0].name, company: rows[0].company,
                                });
                            } else {

                                return done(null, false, {description: 'invalid_password'});
                            }
                        });

                }
            });

        }
    ));
};

