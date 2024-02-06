const User = require("../models/User")
const Cart = require("../models/Cart")
const passport = require("passport");
const localStrategy = require("passport-local");
const crypto = require("crypto");
const { validationResult } = require('express-validator/check')

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


exports.getSignUp = (req, res, next) => {
    res.render("auth/signup", { csrfToken: req.csrfToken(), errorMsg: 'error',
    oldInput: { username: req.body.username, email: req.body.email, password: req.body.password, Rpassword: req.body.Rpassword}, validationErrors: [] })
}

exports.postSignUp = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array())
        return res.status(422).render("auth/signup", { csrfToken: req.csrfToken(), errorMsg: errors.array()[0].msg,
             oldInput: { username: req.body.username, email: req.body.email, password: req.body.password, Rpassword: req.body.Rpassword}, validationErrors: errors.array() })
    }
    var newUser = new User({ username: req.body.username, email: req.body.email,})
    console.log(newUser)
    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            return res.status(422).render("auth/signup", { csrfToken: req.csrfToken(),
                oldInput: { username: req.body.username, email: req.body.email, password: req.body.password, Rpassword: req.body.Rpassword}, validationErrors: errors.array() })
        }
        var userCart = new Cart({ userId: newUser._id})
        userCart.save();
        
        passport.authenticate("local")(req, res, () => {
        res.redirect("/")
        })
    })
}

exports.authenticatingUser = passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
})

exports.getLogin = (req, res, next) => {
    res.status(422).render("auth/login", { csrfToken: req.csrfToken(), errorMsg: [],
                oldInput: { username: req.body.username, password: req.body.password }, validationErrors: [] })
}

exports.postLogin = (req, res, next) => {
    var username = req.body.username;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array())
        return res.status(422).render("auth/login", { csrfToken: req.csrfToken(), errorMsg: errors.array()[0].msg,
             oldInput: { username: req.body.username, password: req.body.password }, validationErrors: errors.array() })
    }
    User.findOne({username: username}).then(user =>{
        if (!user) {
            return res.status(422).render("auth/login", { csrfToken: req.csrfToken(), errorMsg: errors.array()[0].msg,
                oldInput: { username: req.body.username, password: req.body.password }, validationErrors: errors.array() })
        }
    }).then(() => {
        passport.authenticate("local")(req, res, (err, result) => {
            console.log(result)
            res.redirect("/")
        })
    }).catch((err)=>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error)
    })
}

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err)
    })
    res.redirect("/login")
}

exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect("/login")
}

exports.isAdminLoggedIn = (req, res, next) => {
    if (req.isAuthenticated() && req.user.isAdmin) {
        return next()
    }
    req.flash('error', 'invalid username or password')
    res.redirect("/login")
}

exports.getReset = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    }
    res.render('auth/reset', { csrfToken: req.csrfToken(), errorMsg: req.flash('error') })
}

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err)
            return res.redirect(reset);
        }
        const token = buffer.toString('hex');
        User.findOne({ email : req.body.email}).then(user => {
            if (!user) {
                req.flash('error', 'No account with that email found');
                return res.redirect('/reset');
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            return user.save()
        }).then(result => {
            res.redirect('/reset/' + token)
        }
        ).catch((err)=>{
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error)
        })

    })
}

exports.getNewPwd = (req, res, next) => {
    const token = req.params.token;
    User.findOne({resetToken : token, resetTokenExpiration : {$gt: Date.now()}}).then(user => {
        res.render('auth/new-Pwd', { csrfToken: req.csrfToken(), errorMsg: req.flash('error'), username: user.username, userId: user._id.toString(), pwdToken: token })
    }).catch((err)=>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error)
    })
}

exports.postNewPwd = (req, res, next) => {
    const newPwd = req.body.newPwd;
    const pwdToken = req.body.pwdToken;
    const userId = req.body.userId;
    console.log(newPwd)
    
    User.findOne({resetToken : pwdToken, resetTokenExpiration : {$gt: Date.now()}, _id: userId, username: req.body.username}).then(user =>{
        user.setPassword(newPwd, (err, users) => {
            User.updateOne({_id: users._id},{hash : users.hash, salt : users.salt}, (err, result) => {
                if (err) {
                    return console.log(err)
                }
                console.log(result)
                console.log(user)
                
            })
        })
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        user.save()
        res.redirect("/")
    }).catch((err)=>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error)
    })
}
