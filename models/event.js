const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: {
        type: String
    },
    image: {
        type: [String]
    },
    description: {
        type: String
    },
    galaxy: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Galaxy'
    },
    blogEntries: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Blog'
    }]
})

const Event = mongoose.model('Event', eventSchema)

module.exports = Event
const Blog = require('./blog')
const Galaxy = require('./galaxy')