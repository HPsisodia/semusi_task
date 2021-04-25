const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('./../controllers/authcontroller');
const { picUpload } = require('./../controllers/uploadpic');

const multerStorage = multer.diskStorage({
    destination: (req,file, cb) => {
        cb(null, './public/user_images')
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        const name = `user-${req.user.email}-profile.${ext}`
        cb(null, name);
        req.user.picName = name;
    }
});

const upload  = multer({
    storage: multerStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
          cb(null, true);
        } else {
          cb(null, false);
          req.user.upload = false;
        }
      }
});


router.get('/dashboard', protect, (req,res) =>{
    
    res.render('dashboard', {
        post: {
            name: req.user.first_name + " "+ req.user.last_name,
            pic: req.user.pic
        }
    });
    
});

router.post('/changepic', protect, upload.single("file") , picUpload );


module.exports = router;