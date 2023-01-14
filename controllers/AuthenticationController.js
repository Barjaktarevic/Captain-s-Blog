const mongoose = require('mongoose')
const User = require('../models/user')
const wrapAsync = require('../utils/wrapAsync')
const passport = require('passport');

// Show signup view page route
exports.get_signup = (req, res) => {
    res.render('signup')
}

// Route that allows users to sign up
exports.post_signup = wrapAsync(async (req, res, next) => {
    const { email, username, password, age, shipName, rank } = req.body
    const user = new User({ email, username, age, shipName, rank })
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, err => {
        if (err) {
            return next(err)
        } else {
            req.flash('success', 'Safe travels, starseeker.')
            res.redirect('/home')
        }
    })
})

// Show login view page route
exports.get_login = (req, res) => {
    res.render('login')
}

// Route that allows users to log in
exports.post_login = passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {

    req.flash('success', 'Welcome back!')
    res.redirect('/home')
}

// Route that allows users to log out
exports.post_logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        req.flash('success', 'Goodbye!')
        res.redirect('/home');
    });
};

// View individual users route
exports.get_user = wrapAsync(async (req, res, next) => {
    const user = await User.findOne({ username: req.params.username }).populate({ path: 'blogEntries', populate: { path: 'event' } })
    if (user) {
        res.render('userpage', { user })
    } else {
        req.flash('error', "That user doesn't exist")
        res.redirect('/home')
    }
})

// Update individual user route
exports.update_user = wrapAsync(async (req, res, next) => {
    const { email, age, shipName, rank } = req.body
    const user = await User.findOneAndUpdate({ username: req.user.username }, { email, age, shipName, rank }, { runValidators: true })
    await user.save()
    req.flash('success', 'Successfully updated your information.')
    res.redirect(`/users/${user.rank}-${user.username}`)
})

// Update user avatar route
exports.update_user_avatar = wrapAsync(async (req, res, next) => {
    const user = await User.findOneAndUpdate({ username: req.params.username }, { image: req.body.avatar })
    await user.save()
    req.flash('success', 'Successfully changed your avatar.')
    res.redirect(`/users/${user.rank}-${user.username}`)
})