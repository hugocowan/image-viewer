const path = require("path");
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');

function indexRoute(req, res, next) {

    res.json({ message: 'Oh hey there!' });
}


const storageMain = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './src/assets/');
    },
    filename: function(req, file, cb) {
        cb(null, path.basename(file.originalname));
    }
});

const uploadMain = multer({
    storage: storageMain,
    limits: {
        fileSize: 1000000
    },
}).single('imageData');


function uploadRoute(req, res, next) {
        
        uploadMain(req, res, err => {
            
            sharp(req.file.path)
                .resize({ width: 100 })
                .toFile('./src/assets/thumbnails/' + path.basename(req.file.originalname));

            if (err) { 
                res.json({ message: err });
                return;
            }
    
            res.json({ message: 'Success!' });
        });
}

function deleteRoute(req, res, next) {

    fs.unlinkSync(`./src/assets/${req.body.filename}`);
    fs.unlinkSync(`./src/assets/thumbnails/${req.body.filename}`);

    res.json({ message: 'Image deleted' });
}

module.exports = {
    index: indexRoute,
    upload: uploadRoute,
    delete: deleteRoute,
};