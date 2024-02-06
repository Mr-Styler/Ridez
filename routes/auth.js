const router = require("express").Router();
var AuthController = require("../controllers/auth");
const { check, body } = require('express-validator/check')
const User = require('../models/User')


//SIGN UP
router.get("/signUp", AuthController.getSignUp)

router.post("/signUp", [
     check('email', 'Please enter a valid email.').isEmail().normalizeEmail().custom((value, {req}) => {
        return User.findOne({email: value}).then(user => {
            if (user) {
                return Promise.reject('Email already exists, pick a different one.')
            }
        })
     }),
     body('password', 'Please enter a password of at least 6 characters').isLength({min: 6, max: 20}).trim(),
     body('Rpassword').trim().custom((value, {req}) => {
         if (value !== req.body.password) {
             throw new Error('Passwords do not match')
         }
         return true
     })
     ], AuthController.postSignUp)

router.get("/login", AuthController.getLogin)

router.post("/login", [
    check('username').custom((value, {req}) => {
       return User.findOne({username: value}).then(user => {
           if (!user) {
               return Promise.reject('Please enter a valid username.')
           }
       })
    })
    ], AuthController.postLogin)

router.get("/reset", AuthController.getReset)

router.post("/reset", AuthController.postReset)

router.get("/reset/:token", AuthController.getNewPwd)

router.post("/new-Pwd", AuthController.postNewPwd)

router.post("/logout", AuthController.postLogout)

module.exports = router