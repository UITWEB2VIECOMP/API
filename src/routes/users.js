const express = require('express');
const {changePassword, uploadAvatar, getUser} = require('../controllers/userscontroller')
const router = express.Router()
const multer = require('multer');
const {uploadImg}=require('../../middleware/multer')

router.post('/upload-avatar', uploadImg, uploadAvatar);
router.post('/change-password', changePassword)
router.get('/get-user', getUser)

module.exports = router;