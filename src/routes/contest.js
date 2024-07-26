const express = require('express');
const {addContest, getCorpManageInfo, contestPage, 
    changeContestImage, changeContestName, changeContestDescription, changePrizeDescription, changeDate} = require('../controllers/contestController')
const {checkAuth} = require('../../middleware/checkAuth')
const router = express.Router()
const {uploadImg, multerErrorHandling}=require('../../middleware/multer')
router.use(checkAuth)

router.post('/add-contest', uploadImg, addContest)
router.get('/get-manage-info',getCorpManageInfo)
router.get('/get-contest/:contest_id',contestPage)
router.post('/change-name/:contest_id',changeContestName)
router.post('/change-image/:contest_id', uploadImg,changeContestImage)
router.post('/change-description/:contest_id',changeContestDescription)
router.post('/change-prize/:contest_id',changePrizeDescription)
router.post('/change-date/:contest_id',changeDate)


router.use(multerErrorHandling)

module.exports = router;