const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "You have to provide an email."],
        unique: true,
    },
    age: {
        type: Number,
        min: [18, 'You have to be 18 or older to join.'],
        max: [90, 'You have to be 90 or younger to join.']
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    joinedAt: {
        type: Date,
        default: new Date()
        },
    shipName: {
        type: String,
        default: 'Enterprise'
    },
    image: {
        type: String,
        default: '/images/avatar1.jpg'
    },
    rank: {
        type: String,
        enum: ['midshipman', 'ensing', 'liutenant', 'commander', 'captain', 'fleet captain', 'commodore', 'rear admiral', 'vice admiral', 'admiral', 'fleet admiral', 'admiral of starfleet'],
        default: 'midshipman'
    },
    blogEntries: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Blog'
    }],
    events: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Event'
    }]
})

userSchema.plugin(passportLocalMongoose)
const User = mongoose.model('User', userSchema)

module.exports = User
const Blog = require('./blog')
const Event = require('./event')