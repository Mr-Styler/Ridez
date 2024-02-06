const Product = require("../models/Product")
const User = require("../models/Product")
const Cart = require("../models/Cart")
const Order = require("../models/Order")
const { validationResult } = require('express-validator/check')
const fileHelper = require('../util/file')

exports.getDashboard = (req, res, next) =>{
    res.render("admin/dashboard", { currentUser: req.user, csrfToken: req.csrfToken(), })
}

exports.getAdminProducts = (req, res, next) =>{
    const Items_Per_Page = 1;
    const page = Number(req.query.page) || 1;
    let totalItems;

    Product.find().countDocuments().then(numOfProds => {
        totalItems = numOfProds;
        return Product.find({ userId: req.user._id }).skip((page - 1) * Items_Per_Page).limit(Items_Per_Page)
    }).then(product => {
        res.render('admin/products', {
             currentUser: req.user,
             PageTitle: "Products",
             Path: "/admin/products",
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
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error)
    })
}

exports.getCarts = (req, res, next) =>{
    Cart.find({}).then(cart => {
        res.render("admin/carts", { currentUser: req.user, PageTitle: "Carts", Path: "/admin/products", Carts: cart, csrfToken: req.csrfToken() })
    }).catch((err)=>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error)
    })
}

exports.getUsers = (req, res, next) =>{
    User.find({}).then(user => {
        res.render("admin/users", { currentUser: req.user, PageTitle: "Products", Path: "/admin/products", Users: user, csrfToken: req.csrfToken() })
    }).catch((err)=>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error)
    })
}

exports.getDrivers = (req, res, next) =>{
    User.find({}).then(driver => {
        res.render("admin/drivers", { currentUser: req.user, PageTitle: "Products", Path: "/admin/products", DRivers: driver, csrfToken: req.csrfToken() })
    }).catch((err)=>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error)
    })
}

exports.getOrders = (req, res, next) =>{
    Order.find({}).then(order => {
        res.render("admin/orders", { currentUser: req.user, PageTitle: "Products", Path: "/admin/products", Orders: order, csrfToken: req.csrfToken() })
    }).catch((err)=>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error)
    })
}

exports.getNewProduct = (req, res, next) =>{
    res.render("admin/add-product", { currentUser: req.user, csrfToken: req.csrfToken(), errorMsg: [], validationErrors: [],  })
}

exports.postNewProduct = (req, res, next) =>{
    const image = req.file.path
    console.log(req.file)

    if (!image) {
        return res.status(422).render("admin/add-product", { currentUser: req.user, csrfToken: req.csrfToken(), errorMsg: 'Attached file is not an image.',
            oldInput: { title: req.body.title,
               quantity: req.body.quantity,
               price: req.body.price,
               description: req.body.description,
               userId: req.user._id,}, validationErrors: [] })
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array())
        return res.status(422).render("admin/add-product", { currentUser: req.user, csrfToken: req.csrfToken(), errorMsg: errors.array()[0].msg,
             oldInput: { title: req.body.title,
                quantity: req.body.quantity,
                price: req.body.price,
                description: req.body.description,
                userId: req.user._id,}, validationErrors: errors.array() })
    }

    const imageUrl = image.split('public')[1]
    console.log(imageUrl)

    Product.create({
        title: req.body.title,
        image: imageUrl,
        quantity: req.body.quantity,
        price: req.body.price,
        description: req.body.description,
        userId: req.user._id,
        color: 'black'
    }).then(product => {
        console.log("created product", product)
        res.redirect("/admin/products")
    }).catch((err)=>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error)
    })
}

exports.getEditProduct = (req, res, next) =>{
    Product.findOne({ userId: req.user._id, _id: req.params.id }).then(product => {
        res.render("admin/edit-product", { currentUser: req.user, csrfToken: req.csrfToken(), Product: product, errorMsg: [], validationErrors: [] })
    }).catch((err)=>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error)
    })
}

exports.postEditProduct = (req, res, next) =>{
    const image = req.file.path

    console.log(req.file)
    
    const imageUrl = image.split('public')[1]
    console.log(imageUrl)

    const productId = req.params.id;
    const updatedTitle = req.body.title;
    const updatedImage = imageUrl;
    const updatedQty = req.body.quantity;
    const updatedPrice = req.body.price;
    const updatedDesc = req.body.description;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return Product.findOne({ userId: req.user._id, _id: req.params.id }).then(product => {
            console.log(errors.array())
        return res.status(422).render("admin/edit-product", { currentUser: req.user, csrfToken: req.csrfToken(), errorMsg: errors.array()[0].msg,
             oldInput: { title: req.body.title,
                quantity: req.body.quantity,
                price: req.body.price,
                description: req.body.description,
                userId: req.params.id,}, validationErrors: errors.array(), Product: product })
    })
}
    Product.findOne({userId: req.user._id, _id: productId}).then(product => {
        product.title = updatedTitle;
        if (image) {
            fileHelper.deleteFile(product.image)
            product.image = updatedImage;
        }
        product.quantity = updatedQty;
        product.price = updatedPrice;
        product.description = updatedDesc;
        product.save().then(result => {
            res.redirect('/admin/products')
        });
    }).catch((err)=>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error)
    })
}

exports.deleteProduct = (req, res, next) =>{
    const productId = req.params.id;

    Product.findOne({userId: req.user._id, _id: productId}).then(product => {
        if (!product) {
            return next(new Error('Product not found.'))
        }
        fileHelper.deleteFile(product.image)

        return Product.deleteOne({userId: req.user._id, _id: productId}).then(product => {
            console.log('Product deleted')
        })
    }).then(result => {
        res.status(200).json({ message: 'Success!' });
    }).catch((err)=>{
        res.status(500).json({ message: 'Deleting product failed' })
    })

    
}
