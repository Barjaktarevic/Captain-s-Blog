const express = require('express')
const app = express()
const mongoose = require('mongoose');
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport');
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const methodOverride = require('method-override')
const AppError = require('./utils/AppError')
const authRouter = require('./routes/AuthenticationRoutes')
const viewsRouter = require('./routes/ViewsRoutes')
const cors = require('cors');

const MemoryStore = require('memorystore')(session)

require('dotenv').config()
const PORT = process.env.PORT
const MONGO_URI = process.env.MONGO_URI
const MONGO_ATLAS_URI = process.env.MONGO_ATLAS_URI

mongoose.connect(MONGO_ATLAS_URI)
    .then(console.log('Successfully connected to the database.'))
    .then(app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}!`)
    }))
    .catch(err => console.log(err));

// VIEW ENGINE //
app.set('views', 'views')
app.set('view engine', 'ejs')
// STATICS AND PARSING POST DATA
app.use(express.static('public'))
app.use('/images', express.static('images'));

app.use(express.urlencoded({ extended: true }))
// CORS
app.use(cors({ origin: true, credentials: true }));


// ============================== MIDDLEWARE START ==============================
app.use(session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
    }),
    resave: false,
    saveUninitialized: true,
    secret: 'keyboard cat'
}))

app.use(methodOverride('_method'))

app.use(passport.initialize());
app.use(passport.session());


app.use(flash())

app.use((req, res, next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use(function (req, res, next) {
    res.locals.login = req.user; //req.user is how we access the logged-in user on the backend
    next();
});

app.use(authRouter)
app.use(viewsRouter)

// ============================== MIDDLEWARE END ==============================

// This route in the routes folder is currently bugged as per the Stack Overflow post, so it has to be here rather than in the AuthRouter
app.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'Welcome back!')
    res.redirect('/home')
})

// Catch-all 404 route
app.use('*', (req, res) => {
    res.render('404')
})

// First error handler to differentiate between different errors based on name
app.use((err, req, res, next) => {
    if (err.message === "Cannot read properties of undefined (reading 'username')") {
        next(new AppError(500, "You need to be logged in to do that."))
    } else if (err.message.includes("Maximum title length (100 characters) exceeded.")) {
        next(new AppError(500, "Maximum title length (100 characters) exceeded."))
    } else if (err.message.includes("Title must be at least three characters long.")) {
        next(new AppError(500, "Title must be at least three characters long."))
    } else if (err.message === "Comment validation failed: comment: Review field cannot be left empty.") {
        next(new AppError(500, "Review field cannot be left empty."))
    } else if (err.message.includes("age")) {
        next(new AppError(500, "Age is required and must be between 18 and 90."))
    } else {
        next(err)
    }
})

// Second error handler that redirects back and displays the error message in the form of a flash message
app.use((err, req, res, next) => {
    console.log(err.message)
    req.flash('error', `${err.message}`)
    res.redirect('back')
})