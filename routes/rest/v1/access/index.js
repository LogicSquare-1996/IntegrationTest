// import
const express = require("express")
const signup = require("./signup")
const login = require("./login")
const logout = require("./logout")
const refreshToken = require("./refreshToken")
const { issueForgetPassword, resetForgotPassword, changePassword } = require("./password")
const {createTodo,getTodos,getTodo} = require("./todo")
// const schema = require("../../../../lib/auth/schema")
const schema = require("./schema")
const { validator, ValidationSource } = require("../../../../lib/helper/validation")

//----------------------------------------------------
//  A U T H E N T I C A T E D    M I D D L E W A R E
//----------------------------------------------------
const authenticated = require("../../../../lib/auth/authentication")

//----------------------------------------------------
//                                M I D D L E W A R E
//----------------------------------------------------
const hasAuthSchema = validator(schema.auth, ValidationSource.HEADER)
const hasRefreshSchema = validator(schema.refreshToken)
const hasSignupSchema = validator(schema.signup)
const hasLoginSchema = validator(schema.userCredential)
const hasForgetPasswordSchema = validator(schema.forgetPassword)
const resetPasswordSchema = validator(schema.resetPassword)

//----------------------------------------------------
//                                      R O U T E S
//----------------------------------------------------
const router = express.Router()

// Test Route is reachable or not
router.get("/", (req, res) => res.status(200).json({ error: false, message: "Unauthorized API(s) are accessible : x-api-key accepted" }))


//-------------------------------------------------------
//                              Unauthenticated Routes
//-------------------------------------------------------

/**
 * @swagger
 * /v1/auth/signup:
 *   post:
 *     summary: User registration
 *     description: API endpoint for registering a new user.
 *     operationId: userRegistration
 *     tags:
 *       - Auth
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       description: User registration details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: sankarbiswas07@gmail.com
 *               phone:
 *                 type: string
 *                 example: "+91891766682"
 *               name:
 *                 type: object
 *                 properties:
 *                   first:
 *                     type: string
 *                     example: sankar
 *                   last:
 *                     type: string
 *                     example: prasad biswas
 *                 required:
 *                   - first
 *                   - last
 *               password:
 *                 type: string
 *                 format: password
 *                 example: changeIt
 *             required:
 *               - email
 *               - phone
 *               - name
 *               - password
 *     responses:
 *       '200':
 *         description: Signup Successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: string
 *                   example: "10000"
 *                 message:
 *                   type: string
 *                   example: Signup Successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 5ed6856f27c3b633f92bc28e
 *                         name:
 *                           type: object
 *                           properties:
 *                             first:
 *                               type: string
 *                               example: sankar
 *                             last:
 *                               type: string
 *                               example: prasad biswas
 *                             full:
 *                               type: string
 *                               example: sankar prasad biswas
 *                         email:
 *                           type: string
 *                           format: email
 *                           example: sankarbiswas07@gmail.com
 *                         roles:
 *                           type: array
 *                           items:
 *                             type: string
 *                             example: 5ec023317f06787780f9e52a
 *                     tokens:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                           example: eyJhbGc.payload.eQfR2xd
 *                         refreshToken:
 *                           type: string
 *                           example: eyJhbGc.payload.eQfR2xd
 */

router.post("/signup", hasSignupSchema, signup)
router.post("/login", hasLoginSchema, login)
router.post("/refresh", hasAuthSchema, hasRefreshSchema, refreshToken)
router.post("/forgetPassword", hasForgetPasswordSchema, issueForgetPassword) // request to get change password link in email
router.post("/resetPassword", resetPasswordSchema, resetForgotPassword) // force reset password without password > forget password link

//-------------------------------------------------------------------------
//                                                  Authenticated routes
router.use(authenticated)
//-------------------------------------------------------------------------

router.post("/logout/:fromAllDevices?", logout) // Logout requested device or logout from all devices
router.post("/changePassword", changePassword) // Authenticated user to change password

//-------------------------------------------------------------------------
//                                                  Integration Testing

router.post("/todo", createTodo)
router.get("/todos", getTodos)
router.get("/todo/:id", getTodo)

//-------------------------------------------------------------------------

// const auth = router
module.exports = router
