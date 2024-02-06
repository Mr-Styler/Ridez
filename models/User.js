var mongoose = require('mongoose')
var passportLocalMongoose = require("passport-local-mongoose")

var userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    image: String,
    resetToken: String,
    resetTokenExpiration: Date,
    password: String,
    isAdmin: { type: Boolean, default: false },
    
},
    { timestamps: true },
)

userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", userSchema)