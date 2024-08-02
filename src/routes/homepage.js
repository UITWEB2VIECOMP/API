const express = require('express');
const { getOngoing, getUpcoming, getParticipating, getHomeInfo } = require('../controllers/homepageController');
const { checkAuth } = require('../../middleware/checkAuth');

const router = express.Router();
router.use(checkAuth);

/**
 * @api {get} /api/homepage/get-ongoing Get Ongoing Contests
 * @apiVersion 1.0.0
 * @apiName GetOngoing
 * @apiGroup Homepage
 * @apiPermission Authenticated Users
 *
 * @apiDescription Get the list of ongoing contests for the authenticated user.
 *
 * @apiHeader {String} user_id User's unique ID.
 *
 * @apiExample Example usage:
 * curl -i http://localhost:3000/api/homepage/get-ongoing -H "user_id: 123"
 *
 * @apiSuccess {String} status Status of the request.
 * @apiSuccess {Object[]} data List of ongoing contests.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "data": [ ... ] // List of ongoing contests
 *     }
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
router.get('/get-ongoing', getOngoing);

/**
 * @api {get} /api/homepage/get-upcoming Get Upcoming Contests
 * @apiVersion 1.0.0
 * @apiName GetUpcoming
 * @apiGroup Homepage
 * @apiPermission Authenticated Users
 *
 * @apiDescription Get the list of upcoming contests for the authenticated user.
 *
 * @apiHeader {String} user_id User's unique ID.
 *
 * @apiExample Example usage:
 * curl -i http://localhost:3000/api/homepage/get-upcoming -H "user_id: 123"
 *
 * @apiSuccess {String} status Status of the request.
 * @apiSuccess {Object[]} data List of upcoming contests.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "data": [ ... ] // List of upcoming contests
 *     }
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
router.get('/get-upcoming', getUpcoming);

/**
 * @api {get} /api/homepage/home-info Get Home Info
 * @apiVersion 1.0.0
 * @apiName GetHomeInfo
 * @apiGroup Homepage
 * @apiPermission Authenticated Users
 *
 * @apiDescription Get the home info for the authenticated user.
 *
 * @apiHeader {String} user_id User's unique ID.
 *
 * @apiExample Example usage:
 * curl -i http://localhost:3000/api/homepage/home-info -H "user_id: 123"
 *
 * @apiSuccess {String} status Status of the request.
 * @apiSuccess {Object} data User's home info.
 * @apiSuccess {Number} data.prizes Number of prizes won by the user (for students).
 * @apiSuccess {Number} data.avggrade Average grade of the user (for students).
 * @apiSuccess {Number} data.participated Number of contests participated by the user (for students).
 * @apiSuccess {Number} data.hosted Number of contests hosted by the user (for hosts).
 *
 * @apiSuccessExample Success-Response (Student):
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "data": {
 *         "prizes": 5,
 *         "avggrade": 85,
 *         "participated": 10
 *       }
 *     }
 *
 * @apiSuccessExample Success-Response (Host):
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "data": {
 *         "hosted": 3
 *       }
 *     }
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
router.get('/home-info', getHomeInfo);

/**
 * @api {get} /api/homepage/get-participating Get Participating Contests
 * @apiVersion 1.0.0
 * @apiName GetParticipating
 * @apiGroup Homepage
 * @apiPermission Authenticated Users
 *
 * @apiDescription Get the list of contests the user is participating in.
 *
 * @apiHeader {String} user_id User's unique ID.
 *
 * @apiExample Example usage:
 * curl -i http://localhost:3000/api/homepage/get-participating -H "user_id: 123"
 *
 * @apiSuccess {String} status Status of the request.
 * @apiSuccess {Object[]} data List of contests the user is participating in.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "data": [ ... ] // List of participating contests
 *     }
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
router.get('/get-participating', getParticipating);

module.exports = router;
