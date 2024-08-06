const express = require('express');
const {changePassword, uploadAvatar, getUser, changeAddress, changeName, changeDOB, changeContactInfo, changeDescription} = require('../controllers/userscontroller')
const router = express.Router()
const {checkAuth} = require('../../middleware/checkAuth')
const {uploadImg, multerErrorHandling}=require('../../middleware/multer')
router.use(checkAuth)

/**
 * @api {post} /api/users/change-avatar Change Avatar
 * @apiVersion 1.0.0
 * @apiName ChangeAvatar
 * @apiGroup Users
 * @apiPermission Authenticated user
 *
 * @apiDescription Change user avatar.
 *
 * @apiHeader {String} token authentication token.
 * @apiBody {File} avatar Image file (only 1 and <= 5MB).
 *
 * @apiExample Example usage:
 * curl -i -X POST -F "avatar=@avatar.jpg" http://localhost:3000/api/users/change-avatar
 *
 * @apiSuccess {String} status Status of the request.
 * @apiSuccess {String} message Response message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "message": "Avatar updated successfully"
 *     }
 *
 * @apiError UserNotLoggedIn User is not logged in.
 * @apiError UserNotExist User does not exist.
 * @apiError FileTooLarge File is too large (>5MB).
 * @apiError FileLimitReached File limit reached.
 * @apiError WrongFileType Wrong file type.
 * @apiError TokenExpired The token has expired.
 * @apiError InvalidToken The token is invalid.
 * 
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "User is not logged in"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "User does not exist"
 *     }
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "status": "error",
 *       "message": "File is too large (>5MB)"
 *     }
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "status": "error",
 *       "message": "File limit reached"
 *     }
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "status": "error",
 *       "message": "Wrong file type"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "Token has expired"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "Invalid token"
 *     }
 */
router.post('/change-avatar', uploadImg, uploadAvatar);
/**
 * @api {post} /api/users/change-password Change Password
 * @apiVersion 1.0.0
 * @apiName ChangePassword
 * @apiGroup Users
 * @apiPermission Authenticated user
 *
 * @apiDescription Change user password.
 *
 * @apiHeader {String} token authentication token.
 * @apiBody {String} old_password Old password.
 * @apiBody {String} new_password New password.
 * @apiBody {String} c_new_password Confirm new password.
 *
 * @apiExample Example usage:
 * curl -i -X POST -d "old_password=oldpass&new_password=newpass&c_new_password=newpass" http://localhost:3000/api/users/change-password
 *
 * @apiSuccess {String} status Status of the request.
 * @apiSuccess {String} message Response message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "message": "Password changed successfully!"
 *     }
 *
 * @apiError UserNotLoggedIn User is not logged in.
 * @apiError UserNotExist User does not exist.
 * @apiError PasswordIncorrect Old password is incorrect.
 * @apiError PasswordMismatch Confirm password does not match.
 * @apiError TokenExpired The token has expired.
 * @apiError InvalidToken The token is invalid.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "User is not logged in"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "User does not exist"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "Password is incorrect"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "Confirm password does not match!"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "Token has expired"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "Invalid token"
 *     }
 */
router.post('/change-password', changePassword)
/**
 * @api {get} /api/users/get-user Get User Information
 * @apiVersion 1.0.0
 * @apiName GetUser
 * @apiGroup Users
 * @apiPermission Authenticated user
 *
 * @apiDescription Get user profile information.
 *
 * @apiHeader {String} token authentication token.
 *
 * @apiExample Example usage:
 * curl -i http://localhost:3000/api/users/get-user
 *
 * @apiSuccess {String} first_name First name of the user (student).
 * @apiSuccess {String} last_name Last name of the user (student).
 * @apiSuccess {String} email Email of the user.
 * @apiSuccess {String} dob Date of birth of the user (student).
 * @apiSuccess {String} avatar Avatar URL of the user.
 * @apiSuccess {Array} prizes List of prizes (student).
 * @apiSuccess {String} corp_name Name of the corporation (corporation).
 * @apiSuccess {String} address Address of the corporation (corporation).
 * @apiSuccess {String} contact_info Contact information of the corporation (corporation).
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "first_name": "John",
 *       "last_name": "Doe",
 *       "email": "john.doe@example.com",
 *       "dob": "1990-01-01",
 *       "avatar": "avatar_url",
 *       "prizes": []
 *     }
 *     HTTP/1.1 200 OK
 *     {
 *       "corp_name": "Corp Inc.",
 *       "email": "corp@example.com",
 *       "address": "123 Street",
 *       "avatar": "avatar_url",
 *       "contact_info": "123-456-7890"
 *     }
 *
 * @apiError UserNotLoggedIn User is not logged in.
 * @apiError UserNotExist User does not exist.
 * @apiError TokenExpired The token has expired.
 * @apiError InvalidToken The token is invalid.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "User is not logged in"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "User does not exist"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "Token has expired"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "Invalid token"
 *     }
 */
router.get('/get-user', getUser)
/**
 * @api {post} /api/users/change-name Change Name
 * @apiVersion 1.0.0
 * @apiName ChangeName
 * @apiGroup Users
 * @apiPermission Authenticated user
 *
 * @apiDescription Change user's first name and last name.
 *
 * @apiHeader {String} token authentication token.
 * @apiBody {String} first_name New first name.
 * @apiBody {String} last_name New last name.
 *
 * @apiExample Example usage:
 * curl -i -X POST -d "first_name=John&last_name=Doe" http://localhost:3000/api/users/change-name
 *
 * @apiSuccess {String} status Status of the request.
 * @apiSuccess {String} message Response message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "message": "Name changed successfully!"
 *     }
 *
 * @apiError UserNotLoggedIn User is not logged in.
 * @apiError UserNotExist User does not exist.
 * @apiError MissingValue Missing value provided.
 * @apiError TokenExpired The token has expired.
 * @apiError InvalidToken The token is invalid.
 * 
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "User is not logged in"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "User does not exist"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "Missing value provided"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "Token has expired"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "Invalid token"
 *     }
 */
router.post('/change-name', changeName)

/**
 * @api {post} /api/users/change-dob Change Date of Birth
 * @apiVersion 1.0.0
 * @apiName ChangeDOB
 * @apiGroup Users
 * @apiPermission Authenticated user
 *
 * @apiDescription Change user's date of birth (only for participants).
 *
 * @apiHeader {String} token authentication token.
 * @apiBody {String} dob New date of birth.
 *
 * @apiExample Example usage:
 * curl -i -X POST -d "dob=1990-01-01" http://localhost:3000/api/users/change-dob
 *
 * @apiSuccess {String} status Status of the request.
 * @apiSuccess {String} message Response message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "message": "DOB changed successfully!"
 *     }
 *
 * @apiError UserNotLoggedIn User is not logged in.
 * @apiError UserNotExist User does not exist.
 * @apiError MissingValue Missing value provided.
 * @apiError TokenExpired The token has expired.
 * @apiError InvalidToken The token is invalid.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "User is not logged in"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "User does not exist"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "Missing value provided"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "Token has expired"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "Invalid token"
 *     }
 */
router.post('/change-dob', changeDOB)

/**
 * @api {post} /api/users/change-address Change Address
 * @apiVersion 1.0.0
 * @apiName ChangeAddress
 * @apiGroup Users
 * @apiPermission Authenticated user
 *
 * @apiDescription Change corporation's address (only for corporations).
 *
 * @apiHeader {String} token authentication token.
 * @apiBody {String} address New address.
 *
 * @apiExample Example usage:
 * curl -i -X POST -d "address=123 Street" http://localhost:3000/api/users/change-address
 *
 * @apiSuccess {String} status Status of the request.
 * @apiSuccess {String} message Response message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "message": "Address changed successfully!"
 *     }
 *
 * @apiError UserNotLoggedIn User is not logged in.
 * @apiError UserNotExist User does not exist.
 * @apiError MissingValue Missing value provided.
 * @apiError TokenExpired The token has expired.
 * @apiError InvalidToken The token is invalid.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "User is not logged in"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "User does not exist"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "Missing value provided"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "Token has expired"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "Invalid token"
 *     }
 */
router.post('/change-address', changeAddress)

/**
 * @api {post} /api/users/change-contact Change Contact Info
 * @apiVersion 1.0.0
 * @apiName ChangeContactInfo
 * @apiGroup Users
 * @apiPermission Authenticated user
 *
 * @apiDescription Change corporation's contact information (only for corporations).
 *
 * @apiHeader {String} token authentication token.
 * @apiBody {String} contact_info New contact information.
 *
 * @apiExample Example usage:
 * curl -i -X POST -d "contact_info=123-456-7890" http://localhost:3000/api/users/change-contact
 *
 * @apiSuccess {String} status Status of the request.
 * @apiSuccess {String} message Response message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "message": "Contact info changed successfully!"
 *     }
 *
 * @apiError UserNotLoggedIn User is not logged in.
 * @apiError UserNotExist User does not exist.
 * @apiError MissingValue Missing value provided.
 * @apiError TokenExpired The token has expired.
 * @apiError InvalidToken The token is invalid.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "User is not logged in"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "User does not exist"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "Missing value provided"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "Token has expired"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "Invalid token"
 *     }
 */
router.post('/change-contact', changeContactInfo)

/**
 * @api {post} /api/users/change-description Change Description
 * @apiVersion 1.0.0
 * @apiName ChangeDescription
 * @apiGroup Users
 * @apiPermission Authenticated user
 *
 * @apiDescription Change corporation's description (only for corporations).
 *
 * @apiHeader {String} token authentication token.  
 * @apiBody {String} description New description.
 *
 * @apiExample Example usage:
 * curl -i -X POST -d "description=New Description" http://localhost:3000/api/users/change-description
 *
 * @apiSuccess {String} status Status of the request.
 * @apiSuccess {String} message Response message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "message": "Description changed successfully!"
 *     }
 *
 * @apiError UserNotLoggedIn User is not logged in.
 * @apiError UserNotExist User does not exist.
 * @apiError MissingValue Missing value provided.
 * @apiError TokenExpired The token has expired.
 * @apiError InvalidToken The token is invalid.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "User is not logged in"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "User does not exist"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "Missing value provided"
 *     }
  *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "Token has expired"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "Invalid token"
 *     }
 */
router.post('/change-description', changeDescription)


router.use(multerErrorHandling)

module.exports = router;