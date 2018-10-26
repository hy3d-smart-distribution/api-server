let express = require('express');
let router = express.Router();
let mysql = require('mysql');
let env = 'development';
let config = require('../config')[env];
let passport = require('passport');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
let mkdir = require('mkdirp');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(config.google.CLIENT_ID);

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
    passport.authenticate('local-join', {session: false}, function (err, user, info) {
        if (err) res.status(500).json(err);
        else if (!user) {
            return res.status(401).json({result: "error", description: info.description});
        }
        else {
            req.logIn(user, function (err) {
                if (err) {
                    console.log(err);
                    return res.status(400).json({message: "error"});
                }
                return res.json({result: "success", description: "success"});
            })
        }

    })(req, res, next);
});


router.post('/login', function (req, res, next) {
    const {username, password} = req.body;
    passport.authenticate('local-login', {session: false}, (err, user, info) => {
        if (err || !user) {
            if (err) {
                return res.status(400).json(err);
            } else {
                return res.status(400).json({result: "error", description: info.description});
            }
        }
        req.login(user, {session: false}, (err) => {
            if (err) {
                res.send(err);
            }
            let info = user;
            let user_info = {
                email: user.email,
                name: user.name,
                company: user.company
            };
            jwt.sign(info, req.app.get('jwt-secret'), (err, token) => {
                if (err) console.log(err);
                return res.json({result: "success", description: "success", token, user: user_info});
            });
        });
    })(req, res);

});
router.get('/googleauth', function (req, res, next) {

});
router.get('/auth', function (req, res, next) {
    passport.authenticate('local-jwt', (err, token) => {
        if (err) return next(err);
        if (!token) return res.status(403).json({result: "error"});
        req.login(token, {session: false}, (err) => {
            if (err) {
                res.status(500).json(err);
            }

            res.status(200).json({result: "success"})
            ;
        });

    })(req, res, next);
});
router.post('/loginGoogle', function (req, res, next) {
    passport.authenticate('google-login', (err, user, info) => {
        if (err || !user) {
            if (err) {
                res.status(500).json(err);
            } else {
                if(info.description === "new_email"){
                    return res.status(200).json({result: "success", description: info.description});
                }else{
                    return res.status(400).json({result: "error", description: info.description});
                }
            }
        } else {
            let info = user;
            let user_info = {
                email: user.email,
                name: user.name,
                company: user.company
            };
            jwt.sign(info, req.app.get('jwt-secret'), (err, token) => {
                if (err) console.log(err);
                return res.status(200).json({result: "success", description: "success", token, user: user_info});
            });
        }

    })(req, res, next);
});
router.post('/joinGoogle', function (req, res, next) {
    passport.authenticate('google-join', (err, data, info) => {
        if (err) return next(err);
        if (!data) return res.status(403).json({result: "error", description: info.description});
        req.login(data, {session: false}, (err) => {
            if (err) {
                res.status(500).json(err);
            } else {
                res.status(200).json({result: "success"});
            }

        });
    })(req, res, next);
});


router.get('/refresh', function (req, res, next) {
    passport.authenticate('local-jwt', (err, token) => {
        if (err) return next(err);
        if (!token) return res.status(403).json({result: "error"});
        req.login(token, {session: false}, (err) => {
            if (err) {
                res.status(500).json(err);
            }
            let info = {
                user_id: token.id,
                company_id: token.company_id,
                email: token.email,
                name: token.name,
                company: token.company
            };
            jwt.sign(info, req.app.get('jwt-secret'), (err, newtoken) => {
                if (err) console.log(err);
                return res.status(200).json({result: "success", token: newtoken});
            });
        });

    })(req, res, next);
});
async function verify(token, CLIENT_ID) {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        return {"result": "success"};
    }
    catch (err) {
        throw Error(err);
    }

}
module.exports = router;

