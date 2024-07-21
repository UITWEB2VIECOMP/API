const express = require('express');
const {changePassword, uploadAvatar, getUser, changeAddress, changeName, changeDOB, changeContactInfo, changeDescription} = require('../controllers/userscontroller')
const router = express.Router()
const {checkAuth} = require('../../middleware/checkAuth')
const {uploadImg, multerErrorHandling}=require('../../middleware/multer')
router.use(checkAuth)

router.post('/change-avatar', uploadImg, uploadAvatar);
router.post('/change-password', changePassword)
router.get('/get-user', getUser)
router.post('/change-name', changeName)
router.post('/change-dob', changeDOB)
router.post('/change-address', changeAddress)
router.post('/change-contact', changeContactInfo)
router.post('/change-description', changeDescription)


router.use(multerErrorHandling)

module.exports = router;