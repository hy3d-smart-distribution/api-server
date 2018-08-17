/**
 * Created by chou6 on 2018-08-14.
 */
let express = require('express');
let multer = require('multer');
let path = require('path');
let mkdir = require('mkdirp');
let router = express.Router();
let env = 'development';
let config = require('../config')[env];
let upload = multer({ storage: multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + '/../public/gallery/'+ req.params.userid + "/");
    },
    filename: function (req, file, cb) {
        console.log(file);
        cb(null, file.originalname);
    }
}),});
router.post('/:userid',upload.single('img'), function(req, res, next) {
    mkdir('C:/Users/chou6/Desktop/storage/a', function (err) {
        if (err) console.error(err);
    });
    mkdir('C:/Users/chou6/Desktop/storage/a', function (err) {
        if (err) console.error(err);
    });
    res.status(201).json({message: "done"});

 });

module.exports = router;
