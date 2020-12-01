const router = require('express').Router();
const images = require('../controllers/images');
const settings = require('../controllers/settings');
const auth = require('../controllers/auth');

router.get('/images', images.index);
router.post('/upload', images.upload);
router.post('/delete', images.delete);

router.post('/auth/login', auth.login);
router.post('/auth/register', auth.register);

router.post('/settings/get', settings.get);
router.post('/settings/set', settings.set);

module.exports = router;