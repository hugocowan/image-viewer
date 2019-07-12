const router = require('express').Router();
const images = require('../controllers/images');

router.get('/images', images.index);
router.post('/upload', images.upload);
router.post('/delete', images.delete);

module.exports = router;