const express = require('express');
const {getOngoing, getUpcoming, getParticipating} = require('../controllers/homepageController')
const {checkAuth} = require('../../middleware/checkAuth')
const router = express.Router()
router.use(checkAuth)

router.get('/get-ongoing', getOngoing)
router.get('/get-upcoming', getUpcoming)
router.get('/get-participating', getParticipating)


module.exports = router;