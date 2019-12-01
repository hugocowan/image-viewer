const router = require('express').Router();
const images = require('../controllers/images');
const auth = require('../controllers/auth');

router.get('/images', images.index);
router.post('/upload', images.upload);
router.post('/delete', images.delete);

router.post('/auth', auth.login);


module.exports = router;