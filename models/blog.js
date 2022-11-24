const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    likes: {
        type: Number
    },
    planet: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Planet'
    },
})

const Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog
const User = require('./user')
const Planet = require('./planet')