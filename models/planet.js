const mongoose = require('mongoose');

const planetSchema = new mongoose.Schema({
    system: {
        type: String,
        required: true
    },
    prompt: {
        type: String,
        required: true
    },
    visitors: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    }],
    blogEntries: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Blog'
    }]
})

const Planet = mongoose.model('Planet', planetSchema)

module.exports = Planet
const User = require('./user')
const Blog = require('./blog')