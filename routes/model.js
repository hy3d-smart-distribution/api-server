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
let connection = mysql.createConnection({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.dbname
});
let upload = multer ({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            let hash = sha256(file.originalname + new Date().valueOf());
            let fir = hash.substring(0, 2);
            let sec = hash.substring(2, 4);
            let trd = hash.substring(4, 6);
            let save_path = "/" + fir + "/" + sec + "/" + trd + "/";
            let diskpath;
            let body = req.body;

            connection.beginTransaction(function (err) {
                if (err) {
                    throw err;
                }
                let insert_before_upload = connection.query('insert into file_info(hash,file_name) values(?,?)',
                    [hash, file.originalname], function (err, rows) {
                        if (err) {
                            console.log(err);
                            connection.rollback(function () {
                                console.error('rollback error');
                                throw err;
                            });
                        }
                        let find_save_path = connection.query('select file_info.id,hash,path from file_info ' +
                            'join disk on disk_id = disk.id where hash = ?', [hash], function (err, rows) {
                            if (err) {
                                console.log(err);
                                connection.rollback(function () {
                                    console.error('rollback error');
                                    throw err;
                                });
                            }
                            diskpath = rows[0].path;
                            fileId = rows[0].id;
                            let register_gallery = connection.query('insert into model(name, length, unit, file_id) values(?,?,?,?)',
                                [body.name, body.length, body.unit, body.file_id],
                                function (err, rows) {
                                    if (err) {
                                        console.log(err);
                                        connection.rollback(function () {
                                            console.error('rollback error');
                                            throw err;
                                        });
                                    }
                                    connection.commit(function (err) {
                                        if (err) {
                                            console.error(err);
                                            connection.rollback(function () {
                                                console.error('rollback error');
                                                throw err;
                                            });
                                        }// if err


                                    });
                                    let finalpath = diskpath + save_path;
                                    mkdir(diskpath + save_path, function (err) {
                                        if (err) throw(err);
                                        req.body.filename = hash;
                                        cb(null, diskpath + save_path);
                                    });
                                });


                        });

                    });


            });

        },
        filename: function (req, file, cb) {
            let fileExtension = file.originalname.split('.')[1];
            if(fileExtension === undefined){
                cb(null, req.body.filename);
            }else{
                cb(null, req.body.filename + '.' + fileExtension);
            }

        }
    }),
});

router.get('/list', function(req, res, next) {
    passport.authenticate('local-jwt', (err, token) => {
        if (err) return next(err);
        if (!token) return res.status(403).json({result: "error", description: "invlid_token"});
        req.login(token, {session: false}, (err) => {
            if (err) {
                res.status(500).json(err);
            }
            let show_model = connection.query("select hash, file_name from file_info " +
                "join avail_model on file_info.id = model.file_id where member_id = ?",[token.id],function (err,rows) {
                if (err) {
                    res.status(500).json(err);
                }else if(rows.length===0){
                    res.status(500).json({result: "error", description: "empty_list"});
                }else{
                    res.status(200).json({result: "success", description: "success", bundles: rows});
                }
            });

        });

    })(req, res, next);

});
router.get('/upload', function(req, res, next) {
    passport.authenticate('local-jwt', (err, token) => {
        if (err) return next(err);
        if (!token) return res.status(403).json({result:"error"});
        req.login(token, {session: false}, (err) => {
            if (err) {
                res.status(500).json(err);
            }
            console.log(token);

            res.status(200).json({result : "success"});

        });
    })(req, res, next);

});
module.exports = router;
