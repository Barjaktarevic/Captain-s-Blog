const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "You have to provide an email."],
        unique: [true, "This email is already in use."]
    },
    age: {
        type: Number,
        min: [18, 'Age is required and must be between 18 and 90.'],
        max: [90, 'Age is required and must be between 18 and 90.'],
        required: [true, "You have to specify your age"]
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
    comments: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Comment'
    }],
    drafts: [{
        event: {
            type: String
        },
        title: {
            type: String
        },
        body: {
            type: String
        }
    }]
})

userSchema.plugin(passportLocalMongoose)
const User = mongoose.model('User', userSchema)

module.exports = User
const Blog = require('./blog')
const Comment = require('./comment')
// const Event = require('./event')