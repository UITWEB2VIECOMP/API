const express = require('express');
const {register, login, verify, 
       resend, forgetpassword,
       resetpassword_check, resetpassword, registerCorp} = require('../controllers/authcontroller')
const router = express.Router()
/**
 * @api {post} /api/auth/register Register User
 * @apiVersion 1.0.0
 * @apiName Register
 * @apiGroup Auth
 * @apiPermission Public
 *
 * @apiDescription Register a new user.
 *
 * @apiBody {String} firstname User's first name.
 * @apiBody {String} lastname User's last name.
 * @apiBody {String} DOB User's date of birth.
 * @apiBody {String} email User's email.
 * @apiBody {String} password User's password.
 * @apiBody {String} passwordConfirm Confirmation of the user's password.
 *
 * @apiExample Example usage:
 * curl -i http://localhost:3000/api/auth/register
 *
 * @apiSuccess {String} status Status of the request.
 * @apiSuccess {String} message Response message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "message": "An email send to your account please verify"
 *     }
 *
 * @apiError EmailInUse The email is already in use.
 * @apiError PasswordMismatch The passwords do not match.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "email in use"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "password do not match"
 *     }
 */
router.post('/register', register)

/**
 * @api {post} /api/auth/register-corp Register Corporation
 * @apiVersion 1.0.0
 * @apiName RegisterCorp
 * @apiGroup Auth
 * @apiPermission Public
 *
 * @apiDescription Register a new corporation.
 *
 * @apiBody {String} corpname Corporation name.
 * @apiBody {String} email Corporation email.
 * @apiBody {String} password Corporation password.
 *
 * @apiExample Example usage:
 * curl -i http://localhost:3000/api/auth/register-corp
 *
 * @apiSuccess {String} status Status of the request.
 * @apiSuccess {String} message Response message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "message": "Corporation registered successfully"
 *     }
 *
 * @apiError EmailInUse The email is already in use.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "email in use"
 *     }
 */
router.post('/register-corp', registerCorp)
/**
 * @api {post} /api/auth/login Login User
 * @apiVersion 1.0.0
 * @apiName Login
 * @apiGroup Auth
 * @apiPermission Public
 *
 * @apiDescription Login a user.
 *
 * @apiBody {String} email User's email.
 * @apiBody {String} password User's password.
 *
 * @apiExample Example usage:
 * curl -i http://localhost:3000/api/auth/login
 *
 * @apiSuccess {String} status Status of the request.
 * @apiSuccess {Object} data User data.
 * @apiSuccess {String} data.token authentication token.
 * @apiSuccess {String} data.role User role.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "data": {
 *         "token": "token",
 *         "role": "user"
 *       }
 *     }
 *
 * @apiError EmailOrPasswordIncorrect The email or password is incorrect.
 * @apiError NotVerified The email is not verified.
 * @apiError MissingEmailOrPassword The email or password is missing.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "email or password is incorrect"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "An email is sent to your account please check"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "Please enter your email and password"
 *     }
 */
router.post('/login', login)
/**
 * @api {get} /api/auth/:id/verify/:token Verify Email
 * @apiVersion 1.0.0
 * @apiName Verify
 * @apiGroup Auth
 * @apiPermission Public
 *
 * @apiDescription Verify a user's email.
 *
 * @apiParam {Number} id User ID.
 * @apiQuery {String} token Verification token.
 *
 * @apiExample Example usage:
 * curl -i http://localhost:3000/api/auth/123/verify/abcd1234
 *
 * @apiSuccess {String} status Status of the request.
 * @apiSuccess {String} message Response message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "message": "email verified successfully"
 *     }
 *
 * @apiError InvalidLink The verification link is invalid.
 * @apiError LinkExpired The verification link has expired.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "Invalid link"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "Invalid link or link is expired"
 *     }
 */
router.get('/:id/verify/:token',verify )
/**
 * @api {post} /api/auth/resend Resend Email Verification
 * @apiVersion 1.0.0
 * @apiName Resend
 * @apiGroup Auth
 * @apiPermission Public
 *
 * @apiDescription Resend email verification.
 *
 * @apiBody {String} email User's email.
 *
 * @apiExample Example usage:
 * curl -i http://localhost:3000/api/auth/resend
 *
 * @apiSuccess {String} status Status of the request.
 * @apiSuccess {String} message Response message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "message": "Verification email resent"
 *     }
 *
 * @apiError UserNotFound The user is not found.
 * @apiError EmailAlreadyVerified The email is already verified.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "User not found"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "Email is already verified"
 *     }
 */
router.post('/resend', resend)
/**
 * @api {post} /api/auth/forgetpassword Forget Password
 * @apiVersion 1.0.0
 * @apiName ForgetPassword
 * @apiGroup Auth
 * @apiPermission Public
 *
 * @apiDescription Request a password reset.
 *
 * @apiBody {String} email User's email.
 *
 * @apiExample Example usage:
 * curl -i http://localhost:3000/api/auth/forgetpassword
 *
 * @apiSuccess {String} status Status of the request.
 * @apiSuccess {String} msg Response message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "msg": "reset password link is send to your mail"
 *     }
 *
 * @apiError EmailNotExist The email does not exist.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "email is not exist"
 *     }
 */
router.post('/forgetpassword',forgetpassword)
/**
 * @api {get} /api/auth/:id/resetpassword/:token Reset Password Check
 * @apiVersion 1.0.0
 * @apiName ResetPasswordCheck
 * @apiGroup Auth
 * @apiPermission Public
 *
 * @apiDescription Check the validity of a password reset link.
 *
 * @apiParam {String} id User ID.
 * @apiParam {String} token Reset token.
 *
 * @apiExample Example usage:
 * curl -i http://localhost:3000/api/auth/123/resetpassword/abcd1234
 *
 * @apiSuccess {String} status Status of the request.
 * @apiSuccess {String} message Response message.
 * @apiSuccess {Object} data Response data.
 * @apiSuccess {String} data.id User ID.
 * @apiSuccess {String} data.token Reset token.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "message": "Link is valid",
 *       "data": {
 *         "id": "123",
 *         "token": "abcd1234"
 *       }
 *     }
 *
 * @apiError UserNotFound The user is not found.
 * @apiError LinkInvalidOrExpired The link is invalid or expired.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "User is not found"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "Link is invalid or expired"
 *     }
 */
router.get('/:id/resetpassword/:token',resetpassword_check)
/**
 * @api {post} /api/auth/:id/resetpassword/:token Reset Password
 * @apiVersion 1.0.0
 * @apiName ResetPassword
 * @apiGroup Auth
 * @apiPermission Public
 *
 * @apiDescription Reset the user's password.
 *
 * @apiParam {String} id User ID.
 * @apiParam {String} token Reset token.
 * @apiBody {String} password New password.
 * @apiBody {String} passwordConfirm Confirmation of the new password.
 *
 * @apiExample Example usage:
 * curl -i -X POST -d "password=newpassword&passwordConfirm=newpassword" http://localhost:3000/api/auth/123/resetpassword/abcd1234
 *
 * @apiSuccess {String} status Status of the request.
 * @apiSuccess {String} message Response message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "message": "Password has been reset successfully"
 *     }
 *
 * @apiError UserNotFound The user is not found.
 * @apiError LinkInvalidOrExpired The link is invalid or expired.
 * @apiError PasswordMismatch The passwords do not match.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "User is not found"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "Link is invalid or expired"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "Passwords do not match"
 *     }
 */
router.post('/:id/resetpassword/:token',resetpassword)

module.exports = router;