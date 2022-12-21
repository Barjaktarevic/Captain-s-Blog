const express = require('express')
const app = express()
const mongoose = require('mongoose');
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport');
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const Event = require('./models/event')
const Galaxy = require('./models/galaxy')
const Blog = require('./models/blog')
const Comment = require('./models/comment')
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
    const blog = await Blog.aggregate([{$match: {}}, {$sample: {size: 1}}])
    const author = await User.findOne({ _id: blog[0].author._id }).select(['username', 'rank', 'image'])
    const event = await Event.findOne({ _id: blog[0].event._id }).select('name').populate({ path: 'galaxy', select: 'name'})
    
    res.render('home', { blog, author, event })
})

app.get('/randomblog', async(req, res) => {
    const blog = await Blog.aggregate([{$match: {}}, {$sample: {size: 1}}])
    const author = await User.findOne({ _id: blog[0].author._id }).select(['username', 'rank', 'image'])
    const event = await Event.findOne({ _id: blog[0].event._id }).select('name').populate({ path: 'galaxy', select: 'name'})
    
    const randomBlogInfo = { blog, author, event }
    res.send( randomBlogInfo )
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

app.get('/logs/:id', async(req, res) => {
    const blog = await Blog.findOne({ _id: req.params.id })
        .populate({ path: 'event', select: 'name', populate: { path: 'galaxy', select: 'name' }})
        .populate({ path: 'author', select: ['image', 'rank', 'username']})
        .populate({ path: 'comments', select: ['creator', 'comment', 'createdAt', 'rating'], populate: { path: 'creator'}})
        console.log(blog)
         res.render('showBlog', { blog })
})

app.delete('/logs/:id', async(req, res) => {    
    const direction = await Blog.findByIdAndDelete({ _id : req.params.id })
        .populate({ path: 'event', select: 'name', populate: { path: 'galaxy', select: 'name' }})

    req.flash('success', 'Entry successfully deleted.')
    res.redirect(`/jump/${direction.event.galaxy.name}/`)
})

app.post('/logs/:id', async(req, res) => {
    const { rating, comment, creator } = req.body
    const user = await User.findOne({ username: creator })
    const blog = await Blog.findOne({ _id: req.params.id})
    console.log(user)
    console.log(blog)
    const newComment = new Comment({rating, comment, creator: user._id, blog: blog._id })
    await newComment.save()
    console.log(newComment)
    blog.comments.push(newComment)
    await blog.save()

    user.comments.push(blog)
    await user.save()

    req.flash('success', 'Successfully posted a log entry')
    res.redirect(`/logs/${req.params.id}`)

})

app.get('/jump/:galaxy/logs/:event', async(req, res) => {
    const intent = req.query.intent
    if (intent === 'compose') {
        const event = await Event.findOne({ name: req.params.event })
        const galaxy = await Galaxy.findOne({ name: req.params.galaxy})
        res.render('logsCompose', { event, galaxy })
    } else {
        const event = await Event.findOne({ name: req.params.event }).populate('galaxy')
        const blogs = await Blog.find({ event: event.id}).populate('author').sort({ createdAt: 1})
        res.render('logs', { event, blogs })
    }
})

app.post('/jump/:galaxy/logs/:event', async(req, res) => {
    const { title, body, author } = req.body
    const user = await User.findOne({ username: author })
    
    const foundEvent = await Event.findOne({ name: req.params.event})
    const galaxy = req.params.galaxy

    const blog = new Blog({ title, body, author: user.id, event: foundEvent.id })
    await blog.save()

    foundEvent.blogEntries.push(blog)
    await foundEvent.save()

    user.blogEntries.push(blog)
    await user.save()

    req.flash('success', 'Successfully posted a log entry')
    res.redirect(`/jump/${galaxy}/logs/${foundEvent.name}`)
})

app.get('/jump', async function(req, res) {
    try {
        let galaxies = await Galaxy.find()
        res.render('jump', {galaxies})
    } catch(err) {
        console.log(err)
        req.flash('error', "An unexpected error has occurred")
        res.redirect('/home')
    }  
})

app.get('/jump/:galaxy', async function(req, res) {
    try {
        let galaxy = await Galaxy.findOne({name: req.params.galaxy}).populate('event')
        res.render('galaxy', {galaxy} )
    } catch(err) {
        console.log(err)
    }
})

app.get('/users/:rank-:username', async (req, res) => {
    const user = await User.findOne({ username: req.params.username}).populate({ path: 'blogEntries', populate: { path: 'event'} })
    if (user) {
        res.render('userpage', { user })
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

  app.put('/users/:rank-:username/avatar', async (req, res) => {
    try {
    const user = await User.findOneAndUpdate({ username: req.params.username}, { image: req.body.avatar } )
    await user.save()  
    req.flash('success', 'Successfully changed your avatar.')
    res.redirect(`/users/${user.rank}-${user.username}`)
    } catch(err) {
        console.log(err)
        req.flash('error', 'An unexpected error has occurred.')
        res.redirect('back')
    }
  }) 

app.use('*', (req, res) => {
    res.render('404')
})

