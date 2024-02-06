var mongoose = require('mongoose')
var orderSchema = new mongoose.Schema({
    products: [
        {
            product: { type: Object, required: true },
            quantity: { type: Number, required: true, }
        }
    ],
    // amount: { type: Number, required: true },
    user: {
        name: {
            type: String, required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'
        }
    },
    // address: { type: Object, required: true },
    status: { type: String, default: "pending"}
},
    { timestamps: true}, 
)
module.exports = mongoose.model("Order", orderSchema)

