const express = require('express');
const {register, login, verify, resend} = require('../controllers/authcontroller')
const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/:id/verify/:token',verify )
router.post('/resend', resend)

module.exports = router;