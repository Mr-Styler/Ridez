var mongoose = require('mongoose');
const Product = require('./Product');
var cartSchema = new mongoose.Schema({
    userId: { type: String, required: true, },
    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true }
        },
    ],
    amount: { type: Number, required: true, default: 0 },
    status: { type: String, default: "pending"}
},
    { timestamps: true}, 
)

cartSchema.methods.addToCart = function (product) {
    const cartProductIndex = this.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString()
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.items];

    if (cartProductIndex >= 0) {
        newQuantity = this.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({
            productId: product._id,
            quantity: newQuantity
        });
    }
    
    this.items = updatedCartItems
    
    return this.save();
}


cartSchema.methods.removeFromCart = function (productId) {
    const updatedCartItems = this.items.filter(item => {
        return item.productId.toString() !== productId.toString();  
    });
    this.items = updatedCartItems;
    console.log(updatedCartItems);
    return this.save();
}

cartSchema.methods.clearCart = function () {
    this.items = [];
    return this.save();
}

module.exports = mongoose.model("Cart", cartSchema)
