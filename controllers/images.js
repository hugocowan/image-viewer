const path = require("path");
const multer = require('multer');
const sharp = require('sharp');
const gifResize = require('@gumlet/gif-resize');
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

        req.files.forEach(file => {

            if (file.mimetype.includes('gif')) {

                const buf = fs.readFileSync(file.path);
                gifResize({
                    width: 100
                })(buf).then(data => {
                    const stream = fs.createWriteStream(`./src/assets/thumbnails/live-${path.basename(file.originalname)}`);
                    stream.write(data);
                    stream.end();
                })
                .catch(err => console.log('error resizing gif:', err));

            }

            sharp(file.path)
            .resize({ width: 100 })
            .toFile('./src/assets/thumbnails/' + path.basename(file.originalname))
            .catch(err => console.log('error resizing image:', err));
            
        });

        if (err) {
            res.json({ message: err });
            return;
        }

        res.json({ message: 'Success!' });
    });
}

function deleteRoute(req, res, next) {

    try {
        
        req.body.filenames.forEach(filename => {
        
            fs.unlinkSync(`./src/assets/${filename}`);
            fs.unlinkSync(`./src/assets/thumbnails/${filename}`);
            fs.unlinkSync(`./src/assets/thumbnails/live-${filename}`);
        });

        res.json({ message: 'Image(s) deleted' });

    } catch (err) {
        
        console.log('error in deleteRoute:', err);
        res.json({ message: err });
    }


}

module.exports = {
    index: indexRoute,
    upload: uploadRoute,
    delete: deleteRoute,
};