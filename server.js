const express = require('express')
const app = express()
const mongoose = require('mongoose');
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport');
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const Planet = require('./models/planet')
const Blog = require('./models/blog')
const methodOverride = require('method-override')

mongoose.connect('mongodb://localhost:27017/captains-blog')
    .then(console.log('Successfully connected to the database.'))
    .catch(err => console.log(err));

// VIEW ENGINE //
app.set('views', 'views')
app.set('view engine', 'ejs')
// STATICS AND PARSING POST DATA
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))

// MIDDLEWARE START
app.use(session({
    secret: 'test123',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
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

const isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.flash('error', 'You must be logged in to do that.')
        res.redirect('/login')
    } else {
        next()
    }
}

app.use(function (req, res, next) {
    res.locals.login = req.user;
    next();
});
// MIDDLEWARE END


app.listen(3000, () => {
    console.log('Listening on port 3000!')
})

app.get('/', (req, res) => {
    res.render('titlepage')
})

app.get('/home', async (req, res) => {
    res.render('home')
})

app.get('/signup', (req, res) => {
    res.render('signup')
})

app.post('/signup', async (req, res) => {
    try {
        const { email, username, password, age, shipName, rank } = req.body
        const user = new User({ email, username, age, shipName, rank})
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
         if(err) {
        return next(err)
         }  else {
            req.flash('success', 'Safe travels, starseeker.')
            res.redirect('/home') 
            }
        })  
    } catch (err) {
        if (err.message = "A user with the given username is already registered") {
            req.flash('error', 'A user with the given username or address is already registered')
            res.redirect('/signup')
        }
    }   
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req, res) => {
    req.flash('success', 'Welcome back!')
    res.redirect('/home')
})

app.post('/logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash('success', 'Goodbye!')
      res.redirect('/home');
    });
  });

app.get('/users/:rank-:username', async (req, res) => {
    const user = await User.findOne({ username: req.params.username})
    if (user) {
        res.render('userpage', {user})
    } else {
        req.flash('error', "That user doesn't exist")
        res.redirect('/home')
    }
  })

  app.put('/users/:rank-:username', async (req, res) => {
    try {
    const { email, age, shipName, rank } = req.body
    const user = await User.findOneAndUpdate({ username: req.params.username}, {email, age, shipName, rank} )
    await user.save()  
    req.flash('success', 'Successfully updated your information.')
    res.redirect(`/users/${user.rank}-${user.username}`)
    } catch(err) {
        if (err.code === 11000) {
        req.flash('error', 'That email address already exists.')
        return res.redirect('back')
        }
    }
  }) 

app.use('*', (req, res) => {
    res.render('404')
})



