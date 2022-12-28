const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    title: {
        type: String,
        required: [true, "Your log needs to have a title."],
        unique: [true, "Log with the same title already exists. Please change the title."]
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Comment'
    }],
    body: {
        type: String,
        required: [true, "Log is required and has to be at least 1000 characters long."],
        unique: [true, "Identical log already exists. Please be original."],
        min: [1000, "Log has to be at least 1000 characters long."]
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
    const author = doc.author
    const event = doc.event
   
    await User.findOneAndUpdate({_id: author._id}, {$pull: {blogEntries: doc.id}})

    await User.updateMany({}, {$pull: {comments: {$in: doc.comments}}})

    await Event.findOneAndUpdate({_id: event._id}, {$pull: {blogEntries: doc.id}})
    await Comment.deleteMany({ _id: {$in: doc.comments}})
})

const Blog = mongoose.model('Blog', blogSchema)


module.exports = Blog
const User = require('./user')
const Event = require('./event')
const Comment = require('./comment')