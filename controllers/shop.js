const fs = require('fs')
const path = require('path')
const PDFDocument = require('pdfkit')

var Product = require("../models/Product")
var Cart = require("../models/Cart")
var Order = require("../models/Order")
var mongoose = require("mongoose")

exports.getIndex = (req, res) => {
    res.render('shop/index', { currentUser: req.user,  csrfToken: req.csrfToken() })
}

exports.getProducts = (req, res, next) => {
    const Items_Per_Page = 1;
    const page = Number(req.query.page) || 1;
    let totalItems;

    Product.find().countDocuments().then(numOfProds => {
        totalItems = numOfProds;
        return Product.find({}).skip((page - 1) * Items_Per_Page).limit(Items_Per_Page)
    }).then(product => {
        res.render('shop/products', {
             currentUser: req.user,
             PageTitle: "Products",
             Path: "/products",
             Products: product,
             csrfToken: req.csrfToken(),
             currentPage: page,
             hasNext: Items_Per_Page * page < totalItems,
             hasPrev: page > 1,
             nextPage: page + 1,
             prevPage: page - 1,
             lastPage: Math.ceil(totalItems / Items_Per_Page)
        })
    }).catch(err => {
        next(err)
    })
}

exports.getShowProduct = (req, res) => {
    Product.findById(req.params.productId, (err, product)=> {
        if(err) {
            console.log(err)
        } else {
            res.render('shop/show', { currentUser: req.user,Product: product, csrfToken: req.csrfToken()}) 
        }
    })
}

exports.getCart = (req, res) => {
    Cart.findOne({ userId: req.user._id }).populate('items.productId')
        .then(cart => {
            res.render("shop/cart", { currentUser: req.user,Cart: cart, csrfToken: req.csrfToken() })
        });
}

exports.postAddCart = (req, res) => {
    Cart.findOne({ userId: req.user._id }, (err, cart) => {
        if (err) {
            console.log(err);
        } else {
            Product.findById(req.body.productId).then(product => {
                cart.addToCart(product);  
            }).then(result => {
                res.redirect('/cart');
            }).catch(err => {
                console.log(err)
            })
        }
    })
}

exports.postDeleteCart = (req, res) => {
    Cart.findOne({ userId: req.user._id }, (err, cart) => {
        if (err) {
            console.log(err);
        } else {
            console.log(req.body.productId)
            cart.removeFromCart(req.body.productId);
            res.redirect('/cart');
        }
    })
}

exports.getOrder = (req, res) => {
    res.render("shop/order", { currentUser: req.user,csrfToken: req.csrfToken() })  
}

exports.postOrder = (req, res) => {
    Cart.findOne({ userId: req.user._id }).populate('items.productId').then(cart => {
        Product.findById(req.body.productId, (err, product) => {
            if (err) {
                console.log(err)
            } else {
                Order.create({
                    user: {
                        name: req.user.username,
                        userId: req.user
                    },
                    products: cart.items.map(i => {
                        return {quantity: i.quantity, product: { ...i.productId._doc} };
                    })
                    }, (err, order)=> {
                        if(err){
                            console.log("order error");
                            console.log(err);
                        } else {
                            order.save();
                            cart.clearCart();
                            res.redirect('/');
                        }
                    })
        }
    })
})
}

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;

    Order.findById(orderId).then(order => {
        if (!order) {
            return next(new Error('No order found.'))
        }
        if (order.user.userId.toString() !== req.user._id.toString()) {
            return next(new Error('Unauthorized user'))
        }
        const invoiceName = 'invoice-' + orderId + '.pdf'
        const invoicePath = path.join( 'public','data','invoices', invoiceName)
        
        const pdfDoc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Desposition', 'inlline; filename: "' + invoiceName + '"');
        pdfDoc.pipe(fs.createWriteStream(invoicePath));
        pdfDoc.pipe(res)
        
        pdfDoc.fontSize(26).text('Invoice', {
            underline: true,
        });
        pdfDoc.fontSize(14).text('-------------------------------------')
        let totalPrice = 0
        order.products.forEach(prod => {
            totalPrice += prod.quantity * prod.product.price
            pdfDoc.fontSize(17).text(`${prod.product.title} - ${prod.quantity} x \$${prod.product.price}`)
        });
        pdfDoc.fontSize(14).text('-------------------------------------')
        pdfDoc.fontSize(14).text(`Total Price: \$${totalPrice}`)
        pdfDoc.end();
        // fs.readFile(invoicePath, (err, data) => {
        //     if (err) {
        //         return next(err)
        //     }
        //     res.setHeader('Content-Type', 'application/pdf');
        //     res.setHeader('Content-Desposition', 'inline ; filename: "' + invoiceName + '"');

        //     res.send(data)
        // })
    }).catch( err => {
        next(err)
    })
}

exports.getCheckout = (req, res) => {
    res.render("shop/checkout", { currentUser: req.user,csrfToken: req.csrfToken() })
}

