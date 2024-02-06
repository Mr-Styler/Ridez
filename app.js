const path = require('path');

var express     = require("express")
var app         = express()
var bodyParser  = require("body-parser");
var mongoose    = require("mongoose");
const session    = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require('csurf');
const seedDB = require("./seeds");
const multer = require('multer');

var errorController = require("./controllers/error");
const passport = require("passport");

const driversRoute = require('./routes/drivers');
const authRoute = require('./routes/auth');
const shopRoute = require('./routes/shop');
const adminRoute = require('./routes/admin');

const store = new MongoDBStore({
    uri: "mongodb://localhost/Ridez",
    collection: 'sessions'
})

const csrfProtection = csrf();


app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(__dirname + "/public"))


const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public');
    },
    filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `images/product/${file.fieldname}-${Date.now()}.${ext}`)
}
  });

  const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Not an image'), false);
    }
  };

  const upload = multer({
    storage: fileStorage,
    fileFilter: fileFilter
})

app.use(upload.single('image'))

// seedDB()

mongoose.connect("mongodb://localhost/Ridez").then(()=> console.log("DB connection successfull")).catch((err)=>{console.log(err)});




app.use(session({
    secret: "Ridez the way",
    resave: false,
    saveUninitialized: false,
    store: store,
}))

app.use(csrfProtection);


app.use(passport.initialize());
app.use(passport.session());

app.use("/admin", adminRoute)
app.use("/driver", driversRoute)
app.use(authRoute)
app.use(shopRoute)

// ROUTES
app.get("/repairs", (req, res)=>{
    res.render('repairs', {currentUser: req.user,csrfToken: req.csrfToken() })        
})
app.get("/drivers", (req, res)=>{
    res.render("drivers", {currentUser: req.user,csrfToken: req.csrfToken() })
})
app.get("/contact", (req, res)=>{
    res.render('contact', {currentUser: req.user,csrfToken: req.csrfToken() })        
})
app.get("/about", (req, res)=>{
    res.render('about', {currentUser: req.user,csrfToken: req.csrfToken() })        
})
// app.post("/chat", (req, res)=>{
//     var message = req.body.chat
//     Chat.create({
//         text: message
//     }, (err, message)=>{
//         if (err){
//             console.log(err)
//         } else{
//             console.log('newly messaged');
//             console.log(message)
//         }
//     })
//     res.redirect("chat")
// })




app.use(errorController.get404Page)

// app.use((error, req, res, next) => {
//     res.status(500).render("500", { currentUser: req.user, PageTitle: "An Error occurred", Path: "/500",  csrfToken: req.csrfToken() })
// })

app.listen(2000, ()=>{
    console.log("Just started the chatting app...")
})