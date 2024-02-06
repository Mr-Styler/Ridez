var mongoose = require('mongoose')

var productSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true},
    description: { type: String, required: true},
    image: { type: String, required: true},
    categories: { type: Array},
    quantity: { type: Number, required: true},
    color: { type: String, required: true},
    price: { type: Number, required: true},
    userId: { type: String, required: true}
    },
    { timestamps: true}, 
)
module.exports = mongoose.model("Product", productSchema)
