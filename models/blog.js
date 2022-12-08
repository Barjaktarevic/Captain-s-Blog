const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    likes: {
        type: Number
    },
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        require: true,
    },
    createdAt: {
        type: String,
        default: new Date()
    },
    event: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Event'
    },
})

const Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog
const User = require('./user')
const Event = require('./event')