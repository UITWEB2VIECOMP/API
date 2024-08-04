const express = require('express');
const {addContest, getCorpManageInfo, contestPage, 
    changeContestImage, changeContestName, changeContestDescription, changePrizeDescription, changeDate, deleteContest} = require('../controllers/contestController')
const {checkAuth} = require('../../middleware/checkAuth')
const router = express.Router()
const {joinContest, getQuestions, submitContest, getParticipantContest, getSubmitted, grading} = require('../controllers/contestParti.controller')
const {uploadImg, multerErrorHandling, uploadFiles}=require('../../middleware/multer')
router.use(checkAuth)

/**
 * @api {post} /api/contest/add-contest Add a new contest
* @apiVersion 1.0.0
 * @apiName AddContest
 * @apiGroup Contest
 * @apiPermission Authenticated Corporations
 * 
 * @apiDescription Add or Create new contest by Corporation 
 * 
 * @apiHeader {String} user_id User's unique ID.
 * @apiHeader {String} role User's role (must be 'corporation').
 * 
 *  
 * @apiParam (Body) {String} contest_name Name of the contest.
 * @apiParam (Body) {String} contest_description Description of the contest.
 * @apiParam (Body) {String} start_date Start date of the contest (YYYY-MM-DD).
 * @apiParam (Body) {String} end_date End date of the contest (YYYY-MM-DD).
 * @apiParam (Body) {String} prizes_description Description of the prizes.
 * @apiParam (Body) {Object[]} questions Array of questions for the contest.
 * @apiParam (Body) {String} questions[].type Type of question (e.g., 'multiple_choice', 'essay').
 * @apiParam (Body) {String} questions[].description Question text.
 * @apiParam (Body) {String} questions[].multple_choice_option 
 * @apiParam (Body) {File} image Contest Image to be uploaded.
 * 
 * @apiSuccess {String} status Status and message of the operation.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        status: 'success',
 *       message: 'Add contest successfully'
 *      } * 
 *
 * @apiError QuestionsNotExist Questions field is unfound.
 * @apiError NotHavePermission Other role that not Corporation try to create contest.
 * @apiError RequiredFieldUnfound Image or Prize or name or date fields is unfound.
 * @apiError UserNotLoggedIn The user is not logged in.
 * @apiError UserNotExist The user does not exist.
 *     
 * @apiErrorExample Error-Response:
 *      HTTP/1.1 401 Bad Request
 *      { 
 *          status: "error", 
 *          message: 'question is required' 
 *      }
 *      HTTP/1.1 401 Bad Request
 *      { 
 *          status: "error", 
 *          message: 'You not have permission to do this' 
 *      }
 *      HTTP/1.1 401 Bad Request
 *      { 
 *          status: 'error', 
 *          message: 'image, prize, name, date is required'
 *      }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "User is not login"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "user is not exist"
 *     }
 */
router.post('/add-contest', uploadImg, addContest)

/**
 * @api {get} /api/contest/get-manage-info Get information for contest management page of corporation
* @apiVersion 1.0.0
 * @apiName getCorpManageInfo
 * @apiGroup Contest
 * @apiPermission Authenticated Corporations
 * 
 * @apiDescription Get information for contest management page of corporation
 * 
 * @apiHeader {String} user_id User's unique ID.
 * @apiHeader {String} role User's role (must be 'corporation').
 * 
 * 
 * @apiSuccess {String} status Status of the operation.
 * @apiSuccess {Array} data List of contest object in each of object contain contest_participant_id and lastest submissiondate and also a list of submitted participant.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        status: 'success',
 *        data: [
 *                   {
 *                       "contestName": "contest0",
 *                       "contest_id": 7,
 *                       "submitted_participant": [
 *                           {
 *                               "contest_participant_id": 4,
 *                               "latest_submission_date": "2024-07-31T20:00:04.000Z"
 *                           }
 *                       ]
 *                   },
 *                   {
 *                       "contestName": "contest1",
 *                       "contest_id": 14,
 *                       "submitted_participant": []
 *                   }
 *               ]
 *      } * 
 *
 * @apiError NotHavePermission Other role that not Corporation try to create contest.
 * @apiError UserNotLoggedIn The user is not logged in.
 * @apiError UserNotExist The user does not exist.
 *     
 * @apiErrorExample Error-Response:
 *      HTTP/1.1 401 Bad Request
 *      { 
 *          status: "error", 
 *          message: 'You not have permission to do this' 
 *      }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "User is not login"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "user is not exist"
 *     }
 */
router.get('/get-manage-info',getCorpManageInfo)

/**
 * @api {get} /api/contest/get-contest/:contest_id Get data for contest page
* @apiVersion 1.0.0
 * @apiName contestPage
 * @apiGroup Contest
 * @apiPermission Authenticated Users
 * 
 * @apiDescription Get data for contest page
 * 
 * @apiHeader {String} user_id User's unique ID.
 * @apiHeader {String} role User's role 
 * @apiQuery {Number} contest_id Contest unique ID
 * 
 * @apiSuccess {String} status Status of the operation.
 * @apiSuccess {Object} data Json file of contest data for contest page
 * @apiSuccess {Boolean} hosted True if corporation is hosted that contest else False (corporation)
 * @apiSuccess {Boolean} participated True if Participant joined that contest else False (participant)
 * @apiSuccess {String} submitted if participant joined and do submitt to that contest then value = "submitted" else if joined and not submitt then status is "not submitted" else if not join yet value is NULL (participant)
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *  {
 *       "status": "success",
 *       "data": {
 *           "contest_id": 7,
 *           "corporation_id": 1,
 *           "contest_name":"name",
 *           "contest_description": description,
 *           "start_date": "2024-07-30T17:00:00.000Z",
 *           "end_date": "2024-08-06T17:00:00.000Z",
 *           "prizes_description": "$15000",
 *           "contest_image": url,
 *           "corp_name": "name",
 *           "avatar": url,
 *           "total_participants": 1,
 *           "submitted_participants": "1"
 *       },
 *       "hosted": true
 *   }
 *      HTTP/1.1 200 OK
 *  {
 *       "status": "success",
 *       "data": {
 *           "contest_id": 7,
 *           "corporation_id": 1,
 *           "contest_name": "This is contest name",
 *           "contest_description": "This is a test description for THIS IS A CONTEST NAME competiton",
 *            "start_date": "2024-07-30T17:00:00.000Z",
 *          "end_date": "2024-08-06T17:00:00.000Z",
 *           "prizes_description": "$15000",
 *           "contest_image": "url",
 *           "corp_name": "Google",
 *           "avatar": "url",
 *           "total_participants": 1,
 *           "submitted_participants": "1"
 *       },
 *       "participated": true,
 *       "submitted": "submitted"
 *   }
 *
 * @apiError UserNotLoggedIn The user is not logged in.
 * @apiError UserNotExist The user does not exist.
 *     
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "User is not login"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "user is not exist"
 *     }
 */
router.get('/get-contest/:contest_id',contestPage)

/**
 * @api {post} /api/contest/change-name/:contest_id Change contest name 
* @apiVersion 1.0.0
 * @apiName changeContestName
 * @apiGroup Contest
 * @apiPermission Created Corporation
 * 
 * @apiDescription Change name of a contest 
 * 
 * @apiHeader {String} user_id User's unique ID.
 * @apiHeader {String} role User's role 
 * @apiParams {String} contest_name Contest name
 * @apiQuery  {Number} contest_id Contest unique ID
 * 
 * @apiSuccess {String} status Status of the operation.
 * @apiSuccess {String} message Message of the response
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *   {
 *       "status": "success",
 *       "message": "Name change successfully!"
 *   }
 * 
 * @apiError MissingValue Missing value provided
 * @apiError NoPermission User have no permission(Only corporation who created this contest can do this)
 * @apiError UserNotLoggedIn The user is not logged in.
 * @apiError UserNotExist The user does not exist.
 *     
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "Missing value provided"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "No permission"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "User is not login"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "user is not exist"
 *     }
 */
router.post('/change-name/:contest_id',changeContestName)

/**
 * @api {post} /api/contest/change-image/:contest_id Change contest image 
* @apiVersion 1.0.0
 * @apiName changeContestImage
 * @apiGroup Contest
 * @apiPermission Created Corporation
 * 
 * @apiDescription Change image of a contest 
 * 
 * @apiHeader {String} user_id User's unique ID.
 * @apiHeader {String} role User's role 
 * @apiQuery {Number} contest_id Contest unique ID
 * @apiParams {File} file Contest image
 * 
 * @apiSuccess {String} status Status of the operation.
 * @apiSuccess {String} message Message of the response
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *   {
 *       "status": "success",
 *       "message": "avatar is updated successfully"
 *   }
 * 
 * @apiError MissingFile No file provided
 * @apiError NoPermission User have no permission(Only corporation who created this contest can do this)
 * @apiError UserNotLoggedIn The user is not logged in.
 * @apiError UserNotExist The user does not exist.
 *     
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "No file provided"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "No permission"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "User is not login"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "user is not exist"
 *     }
 */
router.post('/change-image/:contest_id', uploadImg,changeContestImage)

/**
 * @api {post} /api/contest/change-description/:contest_id Change contest description 
* @apiVersion 1.0.0
 * @apiName changeContestDescription
 * @apiGroup Contest
 * @apiPermission Created Corporation
 * 
 * @apiDescription Change description of a contest 
 * 
 * @apiHeader {String} user_id User's unique ID.
 * @apiHeader {String} role User's role 
 * @apiQuery {Number} contest_id Contest unique ID
 * @apiParams {String} contest_description Contest description
 * 
 * @apiSuccess {String} status Status of the operation.
 * @apiSuccess {String} message Message of the response
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *   {
 *       "status": "success",
 *       "message": "Description change successfully!"
 *   }
 * 
 * @apiError MissingValue Missing Value provided
 * @apiError NoPermission User have no permission(Only corporation who created this contest can do this)
 * @apiError UserNotLoggedIn The user is not logged in.
 * @apiError UserNotExist The user does not exist.
 *     
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message":'Missing value provided'
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "No permission"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "User is not login"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "user is not exist"
 *     }
 */
router.post('/change-description/:contest_id',changeContestDescription)

/**
 * @api {post} /api/contest/change-prize/:contest_id Change contest prize 
* @apiVersion 1.0.0
 * @apiName changePrizeDescription
 * @apiGroup Contest
 * @apiPermission Created Corporation
 * 
 * @apiDescription Change prize of a contest 
 * 
 * @apiHeader {String} user_id User's unique ID.
 * @apiHeader {String} role User's role 
 * @apiQuery {Number} contest_id Contest unique ID
 * @apiParams {String} prizes_description Contest prize
 * 
 * @apiSuccess {String} status Status of the operation.
 * @apiSuccess {String} message Message of the response
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *   {
 *       "status": "success",
 *       "message": "Prize change successfully!"
 *   }
 * 
 * @apiError MissingValue Missing Value provided
 * @apiError NoPermission User have no permission(Only corporation who created this contest can do this)
 * @apiError UserNotLoggedIn The user is not logged in.
 * @apiError UserNotExist The user does not exist.
 *     
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message":'Missing value provided'
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "No permission"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "User is not login"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "user is not exist"
 *     }
 */
router.post('/change-prize/:contest_id',changePrizeDescription)

/**
 * @api {post} /api/contest/change-date/:contest_id Change contest duration 
* @apiVersion 1.0.0
 * @apiName changeDate
 * @apiGroup Contest
 * @apiPermission Created Corporation
 * 
 * @apiDescription Change duration of a contest 
 * 
 * @apiHeader {String} user_id User's unique ID.
 * @apiHeader {String} role User's role 
 * @apiQuery {Number} contest_id Contest unique ID
 * @apiParams {String} start_date Starting date of the contest
 * @apiParams {String} end_date Ending date of the contest
 * 
 * @apiSuccess {String} status Status of the operation.
 * @apiSuccess {String} message Message of the response
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *   {
 *       "status": "success",
 *       "message": "Date change successfully!"
 *   }
 * 
 * @apiError MissingValue Missing Value provided
 * @apiError NoPermission User have no permission(Only corporation who created this contest can do this)
 * @apiError UserNotLoggedIn The user is not logged in.
 * @apiError UserNotExist The user does not exist.
 *     
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message":'Missing value provided'
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "No permission"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "User is not login"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "user is not exist"
 *     }
 */
router.post('/change-date/:contest_id',changeDate)

/**
 * @api {post} /api/contest/delete/:contest_id Delete contest  
* @apiVersion 1.0.0
 * @apiName deleteContest
 * @apiGroup Contest
 * @apiPermission Created Corporation
 * 
 * @apiDescription Delete the contest 
 * 
 * @apiHeader {String} user_id User's unique ID.
 * @apiHeader {String} role User's role 
 * @apiQuery {Number} contest_id Contest unique ID
 * 
 * @apiSuccess {String} status Status of the operation.
 * @apiSuccess {String} message Message of the response
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *   {
 *       "status": "success",
 *       "message": "Delete successfully!"
 *   }
 * 
 * @apiError NoPermission User have no permission(Only corporation who created this contest can do this)
 * @apiError UserNotLoggedIn The user is not logged in.
 * @apiError UserNotExist The user does not exist.
 *     
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "No permission"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "User is not login"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "user is not exist"
 *     }
 */
router.post('/delete/:contest_id',deleteContest)

/**
 * @api {post} /api/contest/join-contest/:contest_id Join the contest  
* @apiVersion 1.0.0
 * @apiName joinContest
 * @apiGroup Contest
 * @apiPermission Participants
 * 
 * @apiDescription Join the contest 
 * 
 * @apiHeader {String} user_id User's unique ID.
 * @apiHeader {String} role User's role 
 * @apiQuery {Number} contest_id Contest unique ID
 * 
 * @apiSuccess {String} status Status of the operation.
 * @apiSuccess {String} message Message of the response
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *   {
 *       "status": "success",
 *       "message": "join successfully!"
 *   }
 * 
 * @apiError NoPermission User have no permission(Only participants can do this)
 * @apiError AlreadyJoin User already join this contest cannot join again
 * @apiError UserNotLoggedIn The user is not logged in.
 * @apiError UserNotExist The user does not exist.
 *     
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "No permission"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "You have already joined"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "User is not login"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "user is not exist"
 *     }
 */
router.post('/join-contest/:contest_id',joinContest)

/**
 * @api {get} /api/contest/do-contest/:contest_id Get question for doing contest  
* @apiVersion 1.0.0
 * @apiName getQuestions
 * @apiGroup Contest
 * @apiPermission Participants
 * 
 * @apiDescription Get questions for doing contest page for the contest 
 * 
 * @apiHeader {String} user_id User's unique ID.
 * @apiHeader {String} role User's role 
 * @apiQuery {Number} contest_id Contest unique ID
 * 
 * @apiSuccess {String} status Status of the operation.
 * @apiSuccess {Array} data Array of questions
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *   {
 *       "status": "success",
 *       "data": [
 *           {
 *               "question_id": 391,
 *               "contest_id": 7,
 *               "question_type_id": 1,
 *               "question_text": "eqweqw",
 *               "question_image": null,
 *               "option_multiple_choice": "{\"qa\":\"das\",\"qb\":\"ad\",\"qc\":\"fwe\",\"qd\":\"eqw\"}",
 *               "type_name": "multiple choice"
 *           },
 *           {
 *               "question_id": 392,
 *               "contest_id": 7,
 *               "question_type_id": 2,
 *               "question_text": "eqwewqe",
 *               "question_image": null,
 *               "option_multiple_choice": null,
 *               "type_name": "essay"
 *           },
 *           {
 *               "question_id": 393,
 *               "contest_id": 7,
 *               "question_type_id": 3,
 *               "question_text": "eqwewq",
 *               "question_image": null,
 *               "option_multiple_choice": null,
 *               "type_name": "file"
 *           }
 *       ]
 *   }
 * 
 * @apiError NoPermission User have no permission(Only participants can do this)
 * @apiError NotJoin User haven't joined this contest yet
 * @apiError Submitted User have submiited
 * @apiError InvalidDate Contest have not started or expired
 * @apiError UserNotLoggedIn The user is not logged in.
 * @apiError UserNotExist The user does not exist.
 *     
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "No permission"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "You havent joined the contest"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "You submitted"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": 'Contest havenot started yet or expired'
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "User is not login"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "user is not exist"
 *     }
 */
router.get('/do-contest/:contest_id',getQuestions)
router.get('/get-submitted/:contest_id/:contest_participant_id',getSubmitted)

/**
 * @api {post} /api/contest/submission Submit answers
* @apiVersion 1.0.0
 * @apiName submitContest
 * @apiGroup Contest
 * @apiPermission Participants
 * 
 * @apiDescription Submitt answers or solution for the contest
 * 
 * @apiHeader {String} user_id User's unique ID.
 * @apiHeader {String} role User's role 
 * @apiParams {Number} contest_id Contest unique ID
 * @apiParams {Object} answers JSON object with key is question_id and value is answer of that question
 * @apiParams {File} files Multiple file upon the question require file submit(Optional) 
 *
 * @apiSuccess {String} status Status of the operation.
 * @apiSuccess {String} message Response message
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *   {
 *       "status": "success",
 *       "message": "Submit successfully"
 *   }
 * 
 * @apiError NoPermission User have no permission(Only participants can do this)
 * @apiError NotJoin User haven't joined this contest yet
 * @apiError Submitted User have submiited
 * @apiError UserNotLoggedIn The user is not logged in.
 * @apiError UserNotExist The user does not exist.
 *     
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "No permission"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "You havent joined the contest"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "You submitted"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "User is not login"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "user is not exist"
 *     }
 */
router.post('/submission',uploadFiles, submitContest)

/**
 * @api {get} /api/contest/get-your-contest Get data for participants's Your Contest Page
* @apiVersion 1.0.0
 * @apiName getParticipantContest
 * @apiGroup Contest
 * @apiPermission Participants
 * 
 * @apiDescription Get data for participants's Your Contest Page
 * 
 * @apiHeader {String} user_id User's unique ID.
 * @apiHeader {String} role User's role 
 * 
 *  
 * @apiSuccess {String} status Status of the operation.
 * @apiSuccess {Array} data Participant's contest and its information
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *   {
 *       "status": "success",
 *       "data": [
 *           {
 *               "contest_participant_id": 4,
 *               "contest_id": 7,
 *               "participant_id": 1,
 *               "submission_status": "not submitted",
 *               "grade": null,
 *               "contest_name": "This is chang contest name",
 *               "start_date": "2024-07-30T17:00:00.000Z",
 *               "end_date": "2024-08-06T17:00:00.000Z"
 *           },
 *           {
 *               "contest_participant_id": 5,
 *               "contest_id": 14,
 *               "participant_id": 1,
 *               "submission_status": "not submitted",
 *               "grade": null,
 *               "contest_name": "ewqwq",
 *               "start_date": "2024-08-20T17:00:00.000Z",
 *               "end_date": "2024-08-29T17:00:00.000Z"
 *           }
 *       ]
 *   }
 * 
 * @apiError NoPermission User have no permission(Only participants can do this)
 * @apiError UserNotLoggedIn The user is not logged in.
 * @apiError UserNotExist The user does not exist.
 *     
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "No permission"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "User is not login"
 *     }
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": "error",
 *       "message": "user is not exist"
 *     }
 */
router.get('/get-your-contest',getParticipantContest)

router.post('/grading',grading)


router.use(multerErrorHandling)

module.exports = router;