var mongoose = require("mongoose")
var User = require("./models/User")
var Cart = require("./models/Cart")
var Product = require("./models/Product")
const Order = require("./models/Order")

var seedDB = () => {
    User.remove({}, (err)=>{
        if(err){
            console.log(err)
        }
        console.log("users cleared")
    })
    Cart.remove({}, (err) => {
        if (err) {
            console.log(err)
        }
        console.log("chats cleared")
    })
    Order.remove({}, (err)=>{
        if(err){
            console.log(err)
        }
        console.log("countries cleared")
    })
    Product.remove({}, (err)=>{
        if(err){
            console.log(err)
        }
        console.log("universities cleared")
    })
}

module.exports = seedDB