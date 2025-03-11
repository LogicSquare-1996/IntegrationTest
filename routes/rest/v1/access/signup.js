const _ = require("lodash")
const crypto = require("crypto")
const asyncHandler = require("../../../../lib/core/asyncHandler")
const UserRepo = require("../../../../database/mongoose/repositories/UserRepo")
const { assignTokens } = require("../../../../lib/core/tokenManagement")
const { SuccessResponse } = require("../../../../lib/core/apiResponse")
const { BadRequestError } = require("../../../../lib/core/apiError")
const { signupMail } = require("../../../../lib/core/mail")
const { frontEndLogin } = require("../../../../config")


const signup = asyncHandler(async (req, res) => {
  const {
    email, phone, name, password
  } = req.body

  const isExistUser = await UserRepo.findByEmail(req.body.email)
  if (isExistUser) throw BadRequestError("User already registered")

  const accessTokenKey = crypto.randomBytes(64).toString("hex")
  const refreshTokenKey = crypto.randomBytes(64).toString("hex")

  const { user: createdUser, keystore } = await UserRepo.create({
    email,
    phone,
    password,
    name
  }, "USER", accessTokenKey, refreshTokenKey)

  // token
  const { tokens } = await assignTokens(
    createdUser,
    keystore.primaryKey,
    keystore.secondaryKey
  )
  // send email
  // signupMail(createdUser.email, {
  //   _id: createdUser._id,
  //   email: createdUser.email,
  //   name: createdUser.name,
  //   password,
  //   loginPath: frontEndLogin
  // })
  return SuccessResponse(res, "Signup Successful", {
    user: _.pick(createdUser, ["_id", "name", "email", "roles", "profilePicUrl"]),
    tokens
  })
})

module.exports = signup
