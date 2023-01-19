const express = require("express");
const mongoose=require("mongoose");
const router = express.Router();
const{
    findUser,
    signUp,
    login,
    updateUserProfile,
    logoutUser,
    userForgetPassword,
    resetForgetPassword,
    userPasswordChange,
    getUserByUserId
}=require('../controller/user.js');
const {
    isAuth
} = require('../middleware/authMiddleware');

// AUTH Route
// Unprotected
// s
router.post('/auth/register',signUp)
router.post('/auth/login',login)
router.post('/auth/userForgetPassword',userForgetPassword)
router.post('/auth/resetForgetPassword',resetForgetPassword)
// Protected
router.get('/getusers',findUser)
router.get('/auth/logout', isAuth, logoutUser)
// USERS Route
// Protected Route
// router.get('/users', isAuth, profileCache(10), getUserByUserId)
router.put('/users/update', isAuth, updateUserProfile)
router.put("/users/changepassword", isAuth, userPasswordChange);
module.exports=router;