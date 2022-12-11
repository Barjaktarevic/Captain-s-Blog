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

blogSchema.post('findOneAndDelete', async function (doc) {
    console.log(doc)
    const author = doc.author
    const event = doc.event
    await User.findOneAndUpdate({_id: author._id}, {$pull: {blogEntries: doc.id}})
    await Event.findOneAndUpdate({_id: event._id}, {$pull: {blogEntries: doc.id}})
})

const Blog = mongoose.model('Blog', blogSchema)


module.exports = Blog
const User = require('./user')
const Event = require('./event')