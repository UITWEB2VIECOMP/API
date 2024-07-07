const express = require('express');
const {changePassword, uploadAvatar} = require('../controllers/userscontroller')
const router = express.Router()
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); 

router.post('/upload-avatar', upload.single('file'), uploadAvatar);
router.post('/change-password', changePassword)


module.exports = router;