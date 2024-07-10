const express = require('express');
const {changePassword, uploadAvatar, getUser} = require('../controllers/userscontroller')
const router = express.Router()
const {checkAuth} = require('../../middleware/checkAuth')
const {uploadImg, multerErrorHandling}=require('../../middleware/multer')
router.use(checkAuth)

router.post('/upload-avatar', uploadImg, uploadAvatar);
router.post('/change-password', changePassword)
router.get('/get-user', getUser)

router.use(multerErrorHandling)

module.exports = router;