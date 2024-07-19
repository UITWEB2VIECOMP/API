const express = require('express');
const {register, login, verify, 
       resend, forgetpassword,
       resetpassword_check, resetpassword, registerCorp} = require('../controllers/authcontroller')
const router = express.Router()

router.post('/register', register)

router.post('/register-corp', registerCorp)

router.post('/login', login)

router.get('/:id/verify/:token',verify )

router.post('/resend', resend)

router.post('/forgetpassword',forgetpassword)

router.get('/:id/resetpassword/:token',resetpassword_check)

router.post('/:id/resetpassword/:token',resetpassword)

module.exports = router;