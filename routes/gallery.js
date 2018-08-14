/**
 * Created by chou6 on 2018-08-14.
 */
let express = require('express');
let multer = require('multer');
let path = require('path');
let router = express.Router();
let app = express();
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
    res.status(201).json({message: "done"});

 });

module.exports = router;
