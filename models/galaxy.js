const mongoose = require('mongoose');

const galaxySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    event: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Event'
    },
})

const Galaxy = mongoose.model('Galaxy', galaxySchema)

module.exports = Galaxy
const Event = require('./event')