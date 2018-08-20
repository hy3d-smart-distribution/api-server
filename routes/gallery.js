/**
 * Created by chou6 on 2018-08-14.
 */
let express = require('express');
let multer = require('multer');
let path = require('path');
let mkdir = require('mkdirp');
let mysql = require('mysql');
const crypto = require('crypto');
let router = express.Router();
let env = 'development';
let config = require('../config')[env];
const sha256 = x => crypto.createHash('sha256').update(x, 'utf8').digest('hex');
let upload = multer({ storage: multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(new Date().valueOf());
        let hash = sha256(file.originalname + new Date().valueOf());
        console.log(hash);
        let fir = hash.substring(0,2);
        let sec = hash.substring(2,4);
        let trd = hash.substring(4,6);
        let save_path = "/" + fir + "/" + sec + "/" + trd + "/";
        let diskpath;
        let body = req.body;
        let register_file_member = connection.query('insert into gallery(member_id, file_name, lat, lng)',[body.id, ],
            function (err, rows) {

        });

        let insert_before_upload = connection.query('insert into file_info(hash,file_name) values(?,?)',
            [hash,file.originalname],function (err,rows) {
            if(err)
                console.log(err);
            let find_save_path = connection.query('select hash,path from file_info ' +
                'join disk on disk_id = disk.id where hash = ?',[hash], function (err, rows) {
                if(err)
                    console.log(err);
                diskpath = rows[0].path;
                let finalpath = diskpath + save_path;
                mkdir(diskpath + save_path, function (err) {
                    if (err) console.error(err);
                    cb(null, diskpath + save_path);
                });

            });

        });

    },
    filename: function (req, file, cb) {
        console.log("filename");
        cb(null, file.originalname);
    }
}),});
let connection = mysql.createConnection({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.dbname
});
router.post('/:userid',upload.single('img'), function(req, res, next) {


    mkdir('C:/Users/chou6/Desktop/storage', function (err) {
        if (err) console.error(err);

    });
    mkdir('C:/Users/chou6/Desktop/storage', function (err) {
        if (err) console.error(err);

    });
    res.status(201).json({message: "done"});

 });

module.exports = router;
