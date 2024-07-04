const express = require('express');
const {register, login, verify, resend, forgetpassword,resetpassword_check} = require('../controllers/authcontroller')
const router = express.Router()

router.post('/register', register)

router.post('/login', login)

router.get('/:id/verify/:token',verify )

router.post('/resend', resend)

router.post('/forgetpassword',forgetpassword)

router.get('/:id/resetpassword/:token',resetpassword_check)

module.exports = router;