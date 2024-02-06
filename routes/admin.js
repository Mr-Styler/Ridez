const router = require("express").Router();
const AdminController = require("../controllers/admin");
const AuthController = require("../controllers/auth");
const { check, body } = require('express-validator/check')

router.get("/dashboard", AuthController.isAdminLoggedIn, AdminController.getDashboard)

router.get("/products", AuthController.isAdminLoggedIn, AdminController.getAdminProducts)

router.get("/carts", AuthController.isAdminLoggedIn, AdminController.getCarts)

router.get("/users", AuthController.isAdminLoggedIn, AdminController.getUsers)

router.get("/orders", AuthController.isAdminLoggedIn, AdminController.getOrders)

router.get("/drivers", AuthController.isAdminLoggedIn, AdminController.getDrivers)

router.get("/products/new", AuthController.isAdminLoggedIn, AdminController.getNewProduct)

router.post("/products/new", [
    body('title').isString().isLength({min: 3}).trim(),
    body('price').isFloat(),
    body('description').isLength({min: 12, max: 100}).trim(),
    body('quantity').isNumeric(),
], AuthController.isAdminLoggedIn, AdminController.postNewProduct)

router.get("/products/:id/edit", AuthController.isAdminLoggedIn, AdminController.getEditProduct)

router.post("/products/:id/edit", [
    body('title').isString().isLength({min: 3}).trim(),
    body('price').isFloat(),
    body('description').isLength({min: 12, max: 100}).trim(),
    body('quantity').isNumeric(),
], AuthController.isAdminLoggedIn, AdminController.postEditProduct)


router.delete("/products/:id", AuthController.isAdminLoggedIn, AdminController.deleteProduct)

module.exports = router