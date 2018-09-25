let express = require('express');
let router = express.Router();
let multer = require('multer');
let path = require('path');
let mkdir = require('mkdirp');
let mysql = require('mysql');
let env = 'development';
let fs = require('fs');

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
let saveStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        let hash = sha256(file.originalname + new Date().valueOf());
        let fir = hash.substring(0, 2);
        let sec = hash.substring(2, 4);
        let trd = hash.substring(4, 6);
        let save_path = "/" + fir + "/" + sec + "/" + trd + "/";
        let diskpath;
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
                        let register_bundle = connection.query('insert into bundle(file_id) values(?)',
                            [fileId],
                            function (err, rows) {
                                if (err) {
                                    console.log(err);
                                    connection.rollback(function () {
                                        console.error('rollback error');
                                        throw err;
                                    });
                                } else if (rows) {
                                    let get_bundle_id = connection.query('select id from bundle where file_id = ?', [fileId],
                                        function (err, rows) {
                                        if (err) {
                                            console.log(err);
                                            connection.rollback(function () {
                                                console.error('rollback error');
                                                throw err;
                                            });
                                        } else if (rows) {
                                            connection.commit(function (err) {
                                                if (err) {
                                                    console.error(err);
                                                    connection.rollback(function () {
                                                        console.error('rollback error');
                                                        throw err;
                                                    });
                                                }// if err
                                                let finalpath = diskpath + save_path;
                                                mkdir(diskpath + save_path, function (err) {
                                                    if (err) throw(err);
                                                    req.body.filename = hash;
                                                    cb(null, diskpath + save_path);
                                                });

                                            });
                                        }
                                        else {
                                            connection.rollback(function () {
                                                console.error('rollback error');
                                                throw err;
                                            });
                                        }
                                    });
                                }


                            });


                    });

                });


        });

    },
    filename: function (req, file, cb) {
        let fileExtension = file.originalname.split('.')[1];
        if (fileExtension === undefined) {
            cb(null, req.body.filename);
        } else {
            cb(null, req.body.filename + '.' + fileExtension);
        }

    }
});
let upload = multer({
    storage: saveStorage,
});

router.get('/list', function (req, res, next) {
    passport.authenticate('local-jwt', (err, token) => {
        if (err) return next(err);
        if (!token) return res.status(403).json({result: "error", description: "invlid_token"});
        req.login(token, {session: false}, (err) => {
            if (err) {
                res.status(500).json(err);
            }
            let show_bundle = connection.query("select bundle.id as id, hash, file_name from file_info " +
                "join bundle on file_info.id = bundle.file_id", function (err, rows) {
                if (err) {
                    res.status(500).json(err);
                } else if (rows.length === 0) {
                    res.status(500).json({result: "error", description: "empty_list"});
                } else {
                    res.status(200).json({result: "success", description: "success", bundles: rows});
                }
            });

        });

    })(req, res, next);

});
router.get('/used_list/:companyId', function (req, res, next) {
    passport.authenticate('local-jwt', (err, token) => {
        if (err) return next(err);
        if (!token) return res.status(403).json({result: "error", description: "invlid_token"});
        req.login(token, {session: false}, (err) => {
            if (err) {
            res.status(500).json(err);
        }
        let show_bundle = connection.query("select bundle.id as id, purchase, hash, file_name from file_info " +
            "join bundle on file_info.id = bundle.file_id " +
            "join avail_bundle on bundle.id = avail_bundle.bundle_id where company_id = ?", [req.params.companyId], function (err, rows) {
                if (err) {
                    res.status(500).json(err);
                } else if (rows.length === 0) {
                    res.status(404).json({result: "error", description: "empty_list"});
                } else {
                    res.status(200).json({result: "success", description: "success", bundles: rows});
                }
            });

        });

    })(req, res, next);

});
router.put('/used_list/update',function (req,res,next) {
    passport.authenticate('local-jwt', (err, token) => {
        if (err) return next(err);
        if (!token) return res.status(403).json({result: "token_not_valid"});
        req.login(token, {session: false}, (err) => {
            if (err) {
                res.status(500).json(err);
                return;
            } else {
                let update_purchase = connection.query('update avail_bundle set purchase = ? ' +
                    'where bundle_id = ? and company_id = ?',[req.query.purchase, req.query.bundleId, req.query.companyId],
                    function (err, rows) {
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
router.delete('/used_list/remove',function (req,res,next) {
    passport.authenticate('local-jwt', (err, token) => {
        if (err) return next(err);
        if (!token) return res.status(403).json({result: "error", description: "invalid_token"});
        req.login(token, {session: false}, (err) => {
            if (err) {
                res.status(500).json(err);
            }
            let delete_avail_bundle = connection.query('delete from avail_bundle ' +
                'where company_id = ? and bundle_id = ?',[req.query.companyId,req.query.bundleId],function (err,rows) {
                if(err){
                    res.status(500).json(err);
                }else{
                    res.status(200).json({result: "success", description: "success"});
                }
            });


        });

    })(req, res, next);
});
router.get('/available_list/:companyId', function (req, res, next) {
    passport.authenticate('local-jwt', (err, token) => {
        if (err) return next(err);
        if (!token) return res.status(403).json({result: "error", description: "invlid_token"});
        req.login(token, {session: false}, (err) => {
            if (err) {
                res.status(500).json(err);
            }
            let find_avail_bundle
                = connection.query("select bundle_id from avail_bundle where company_id = ?", [req.params.companyId], function (err, rows) {
                if (err) {
                    res.status(500).json(err);
                } else if (rows.length === 0) {

                    let show_all_bundle = connection.query("select bundle.id as id, hash, file_name from file_info " +
                    "join bundle on file_info.id = bundle.file_id"
                        , [req.params.companyId], function (err, rows) {
                            if (err) {
                                res.status(500).json(err);
                            } else if (rows.length === 0) {
                                res.status(404).json({result: "error", description: "empty_list"});
                            } else {
                                res.status(200).json({result: "success", description: "success", bundles: rows});
                            }
                        });

                } else {

                    let bundle_list = [];

                    for (let i = 0; i < rows.length; i++) {
                        let bundle_id = rows[i].bundle_id;
                        bundle_list.push(bundle_id);
                    }
                    let not_in_avail_bundle = connection.query("select bundle.id, hash,file_name from file_info " +
                        "join bundle on file_info.id = bundle.file_id " +
                        "where bundle.id not in (?)"
                        , [ bundle_list], function (err, rows) {
                            res.status(200).json({result: "success", description: "success", bundles: rows});
                        });

                }
            });

        });

    })(req, res, next);
});

router.post('/available_list/add', function (req, res, next) {
    passport.authenticate('local-jwt', (err, token) => {
        if (err) return next(err);
        if (!token) return res.status(403).json({result: "error", description: "invalid_token"});
        req.login(token, {session: false}, (err) => {
            if (err) {
                res.status(500).json(err);
            }
            let find_avail_bundle = connection.query('select bundle_id from avail_bundle ' +
                'where company_id = ? and bundle_id = ?',[req.body.companyId,req.body.bundleId],function (err,rows) {
                if(err){
                    res.status(500).json(err);
                }else if(rows.length===0){
                    let insert_bundle_to_company = connection.query('insert into avail_bundle(company_id,bundle_id) values(?,?)',
                        [req.body.companyId, req.body.bundleId], function (err, rows) {
                        if (err) {
                            res.status(500).json(err);
                        } else {
                            res.status(200).json({result: "success"});
                        }

                    });

                }else{
                    res.status(404).json({result: "error", description: "already_exists"});
                }
            });


        });

    })(req, res, next);

});


router.post('/upload', function (req, res, next) {
    passport.authenticate('local-jwt', (err, token) => {
        if (err) return next(err);
        if (!token) return res.status(403).json({result: "token_not_valid"});
        req.login(token, {session: false}, (err) => {
            if (err) {
                res.status(500).json(err);
                return;
            } else {
                var store = upload.single('bundle');
                store(req, res, function (err) {

                    if (err) {
                        console.log(err);
                        return res.status(500).json({result: "error"});
                    }
                    return res.status(200).json({result: "success"});
                });
            }

        });
    })(req, res, next);

});
router.delete('/remove',function (req,res,next) {
    passport.authenticate('local-jwt', (err, token) => {
        if (err) return next(err);
        if (!token) return res.status(403).json({result: "token_not_valid"});
        req.login(token, {session: false}, (err) => {
            if (err) {

                return res.status(500).json(err);
            } else {
                let hash = req.query.hash;

                let find_path = connection.query('select file_name, path from file_info join disk on disk_id = disk.id where hash = ?'
                    ,[hash],function (err,rows) {
                    if(rows.length===0){
                        res.status(400).json({result: "error",description: "no_file_exists" });

                    }else{
                        let diskpath = rows[0].path;
                        let ext = rows[0].file_name.split('.')[1];

                        let fir = hash.substring(0, 2);
                        let sec = hash.substring(2, 4);
                        let trd = hash.substring(4, 6);
                        let save_path = "/" + fir + "/" + sec + "/" + trd + "/";
                        let target = "";
                        if(ext===undefined){
                            target = diskpath + save_path + hash;
                        }else{
                            target = diskpath + save_path + hash +'.'+ ext;
                        }
                        fs.unlink(target,function (err) {
                            if(err) throw err;
                            else{
                                let delete_hash = connection.query('delete from file_info where hash = ?',[hash], function (err, rows) {
                                    if(err){
                                        throw err;
                                    }else{
                                        return res.status(200).json({result: "success",description:"success"});
                                    }
                                });

                            }
                        });

                    }
                });


            }

        });
    })(req, res, next);
});


router.get('/get/:hash', function (req, res, next) {

    passport.authenticate('local-jwt', (err, token) => {
        if (err) return next(err);
        if (!token) return res.status(403).json({result: "token_not_vaild"});
        req.login(token, {session: false}, (err) => {
            if (err) {
                res.status(500).json(err);
            }
            var hash = req.params.hash;
            var find_file_hash = connection.query('select path, file_name from file_info join disk on file_info.id = disk.id', function (err, rows) {
                if (err) {
                    throw err;
                } else if (rows.length === 0) {
                    res.status(400).json({result: "no_file_exists"});
                } else {
                    let diskpath = rows[0].path;
                    let file_name = rows[0].name;
                    let fir = hash.substring(0, 2);
                    let sec = hash.substring(2, 4);
                    let trd = hash.substring(4, 6);
                    let save_path = "/" + fir + "/" + sec + "/" + trd + "/";
                    let finalpath = diskpath + save_path + file_name;
                    res.download(finalpath, file_name);
                }
            });


        });
    })(req, res, next);
});
module.exports = router;
