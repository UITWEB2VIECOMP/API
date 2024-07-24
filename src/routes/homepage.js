const express = require('express');
const {getOngoing, getUpcoming, getParticipating, getHomeInfo} = require('../controllers/homepageController')
const {checkAuth} = require('../../middleware/checkAuth')

const router = express.Router()
router.use(checkAuth)


router.get('/get-ongoing', getOngoing)
router.get('/get-upcoming', getUpcoming)
router.get('/home-info', getHomeInfo)
router.get('/get-participating', getParticipating)


module.exports = router;