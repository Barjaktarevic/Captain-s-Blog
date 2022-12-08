const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: {
        type: String
    },
    image: {
        type: String
    },
    location: {
        type: String
    },
    description: {
        type: String
    },
    equipment: {
        type: String
    },
    health: {
        type: String
    },
    engagedUsers: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    }],
    galaxy: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Galaxy'
    },
    blogEntries: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Blog'
    }]
})

const Event = mongoose.model('Event', eventSchema)

module.exports = Event
const User = require('./user')
const Blog = require('./blog')
const Galaxy = require('./galaxy')