const path = require("path");
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');

function indexRoute(req, res, next) {

    const files = fs.readdirSync('./src/assets').reduce((files, file) => {
        if (/\.(png|jpe?g|gif)$/.test(file)) files.push(file);
        return files;
    }, []);

    res.json({ message: 'API calls are working!', files });
}


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './src/assets/');
    },
    filename: function(req, file, cb) {
        cb(null, path.basename(file.originalname));
    }
});

const upload = multer({ storage }).array('imageData');

function uploadRoute(req, res, next) {
    
    upload(req, res, (err) => {

        req.files.forEach(file =>
            sharp(file.path)
                .resize({ width: 100 })
                .toFile('./src/assets/thumbnails/' + path.basename(file.originalname)))

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