const router = require("express").Router();
var shopController = require("../controllers/shop");
var AuthController = require("../controllers/auth");

router.get("/", AuthController.isLoggedIn, shopController.getIndex)

router.get("/products", AuthController.isLoggedIn, shopController.getProducts)

router.get("/product/:productId", AuthController.isLoggedIn, shopController.getShowProduct)

router.get("/cart", AuthController.isLoggedIn, shopController.getCart)

router.post("/cart", AuthController.isLoggedIn, shopController.postAddCart)

router.post("/cart/:id/delete", AuthController.isLoggedIn, shopController.postDeleteCart)

router.get("/order", AuthController.isLoggedIn, shopController.getOrder)

router.post("/order", AuthController.isLoggedIn, shopController.postOrder)

router.get("/order/:orderId", AuthController.isLoggedIn, shopController.getInvoice)

router.get("/checkout", AuthController.isLoggedIn, shopController.getCheckout)

module.exports = router