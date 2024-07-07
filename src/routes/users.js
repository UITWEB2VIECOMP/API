const express = require('express');
const {changePassword} = require('../controllers/userscontroller')
const router = express.Router()

router.post('/change-password', changePassword)


module.exports = router;