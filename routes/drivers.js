const router = require("express").Router();

router.get("/", (req, res) =>{
    res.render("drivers")
})

router.get("/signUp", (req, res) =>{
    res.render("driver/signUp")
})

router.post("/signUp", (req, res) =>{
    res.render("drivers")
})

router.get("/customers", (req, res) =>{
    res.render("drivers")
})

module.exports = router