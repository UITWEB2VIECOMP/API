const express = require('express');
const {addContest, getCorpManageInfo, contestPage, 
    changeContestImage, changeContestName, changeContestDescription, changePrizeDescription, changeDate, deleteContest} = require('../controllers/contestController')
const {checkAuth} = require('../../middleware/checkAuth')
const router = express.Router()
const {joinContest, getQuestions, submitContest} = require('../controllers/contestParti.controller')
const {uploadImg, multerErrorHandling, uploadFiles}=require('../../middleware/multer')
router.use(checkAuth)

router.post('/add-contest', uploadImg, addContest)
router.get('/get-manage-info',getCorpManageInfo)
router.get('/get-contest/:contest_id',contestPage)
router.post('/change-name/:contest_id',changeContestName)
router.post('/change-image/:contest_id', uploadImg,changeContestImage)
router.post('/change-description/:contest_id',changeContestDescription)
router.post('/change-prize/:contest_id',changePrizeDescription)
router.post('/change-date/:contest_id',changeDate)
router.post('/delete/:contest_id',deleteContest)
router.post('/join-contest/:contest_id',joinContest)
router.get('/do-contest/:contest_id',getQuestions)
router.post('/submission',uploadFiles, submitContest)

router.use(multerErrorHandling)

module.exports = router;