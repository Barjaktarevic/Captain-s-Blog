const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    title: {
        type: String,
        required: [true, "Your log needs to have a title."],
        unique: [true, "Log with the same title already exists. Please change the title."],
        minLength: [3, "Title must be at least three characters long."],
        maxLength: [60, "Maximum title length (100 characters) exceeded."]
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Comment'
    }],
    body: {
        type: String,
        required: [true, "Log is required and has to be at least 1000 characters long."],
        unique: [true, "Identical log already exists. Please be original."],
        minLength: [1000, "Log has to be at least 1000 characters long."],
        maxLength: [35000, "Maximum blog length (35000 characters) exceeded."]
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

    await User.findOneAndUpdate({ _id: author._id }, { $pull: { blogEntries: doc.id } })

    await User.updateMany({}, { $pull: { comments: { $in: doc.comments } } })

    await Event.findOneAndUpdate({ _id: event._id }, { $pull: { blogEntries: doc.id } })
    await Comment.deleteMany({ _id: { $in: doc.comments } })
})

const Blog = mongoose.model('Blog', blogSchema)


module.exports = Blog
const User = require('./user')
const Event = require('./event')
const Comment = require('./comment')