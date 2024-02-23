
const express =require('express')
const router =express.Router()
const { registerUser,login,forgotPassword,logout,userInfoUpdate,getUser,profile,updatePassword } =require('../controller/authController')
const { protectRoute,authorizeRoles } = require('../middleware/auth')

router.route('/auth/register',).post(registerUser)
router.route('/user/profile',).get(protectRoute,profile)
router.route('/auth/login',).post(login)
router.route('/password/forgot',).post(forgotPassword)
router.route('/auth/update/password',).post(protectRoute,updatePassword)
router.route('/logout',).get(logout)


module.exports = router
