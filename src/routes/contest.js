const express = require('express');
const {addContest, test, getCorpManageInfo, contestPage} = require('../controllers/contestController')
const {checkAuth} = require('../../middleware/checkAuth')
const router = express.Router()
const {uploadImg, multerErrorHandling}=require('../../middleware/multer')
router.use(checkAuth)

router.post('/add-contest', uploadImg, addContest)
router.get('/get-manage-info',getCorpManageInfo)
router.get('/get-contest/:contest_id',contestPage)
router.use(multerErrorHandling)

module.exports = router;