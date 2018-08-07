let express = require('express');
let router = express.Router();
let mysql = require('mysql');
let env = 'development';
let config = require('../config')[env];
let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
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
        console.log(f);
        let query = connection.query('select email from member where email=?',[email],function (err,rows) {
            if(err) return done(err);
            if(rows.length){
               return done(null, false, {message: 'inuse'});
            }else{
                console.log();
                return done(null,{email: 'email', id: 4});
            }
        });

    }

));
/*
router.post('/join', passport.authenticate('local-join',{
    successRedirect: '/main',
    passwordField: '/join',
    failureFlash: true
}));
 */
router.post('/join', function (req, res, next) {
    console.log("request");
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
/*
router.post('/join', function (req, res, next) {

    let body = req.body;
    let email = body.email;
    let name = body.name;
    let companyid = body.company;
    let password = sha256(body.password + "");
    let push = 1; // 푸시알림여부
    let popup = 1; // 팝업여부

    let sql = [companyid, email, password, name];
    let query = connection.query('insert into member(company_id, email, password, name) values(?, ?, ?, ?) ', sql, function (err, row) {

        if (err) throw err;
        else res.json("success");
    });

});
*/
router.get('/login', function (req, res, next) {
    const {username, password} = req.body;
    let info = {username: username};
    const secret = req.app.get('jwt-secret');
    let policy = {
        expiresIn: 60,
        issuer: 'hy3d.com',
        subject: 'userInfo'
    };
    jwt.sign(info, secret, policy, (err, token) => {
        if (err) console.log(err);
        res.json({
            result: true,
            token: token
        });
    });
});

router.post('/auth', function (req, res, next) {
    passport.authenticate('local', {session: false}, (err, user, info) => {
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
            // generate a signed son web token with the contents of user object and return it in the response
            const token = jwt.sign(user, 'your_jwt_secret');
            return res.json({user, token});
        });
    })(req, res);
});



module.exports = router;
