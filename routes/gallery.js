/**
 * Created by chou6 on 2018-08-14.
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
                            let register_gallery = connection.query('insert into gallery(member_id, file_id, lat, lng) values(?,?,?,?)',
                                [body.id, fileId, 52.482, 192.424],
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
let connection = mysql.createConnection({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.dbname
});
router.post('/', function (req, res, next) {
    passport.authenticate('local-jwt', (err, token) => {
        if (err) return next(err);
        if (!token) return res.status(403).json("failed");
        req.login(token, {session: false}, (err) => {
            if (err) {
                res.status(500).json(err);
                return;
            }else{
                if(token.privilege == 1){
                    let store = upload.single('img');
                    store(req, res, function (err) {
                        if (err) {
                            return  res.status(500).json({message: "error occured"});;
                        }
                        return res.status(200).json({message: "success"});
                    });
                }else{
                    return res.status(400).json({message: "no privilege"});
                }
            }

        });

    })(req, res, next);



});
router.get('/:userid', function (req, res, next) {


});
module.exports = router;
