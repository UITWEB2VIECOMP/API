const express = require('express');
const {getOngoing, getUpcoming} = require('../controllers/homepageController')
const {checkAuth} = require('../../middleware/checkAuth')
const router = express.Router()
router.use(checkAuth)

router.get('/get-ongoing', getOngoing)
router.get('/get-upcoming', getUpcoming)


module.exports = router;