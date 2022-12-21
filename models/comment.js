const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: true
    },
    comment: {
        type: String,
        required: true,
    },
    createdAt: {
        type: String,
        default: new Date()
    },
    rating: {
        type: Number,
        required: true
    },
    blog: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Event',
        required: true
    }
})

// commentSchema.post('findOneAndDelete', async function (doc) {
//     const author = doc.author
//     const event = doc.event
//     await User.findOneAndUpdate({_id: author._id}, {$pull: {blogEntries: doc.id}})
// })

const Comment = mongoose.model('Comment', commentSchema)


module.exports = Comment
const User = require('./user')
const Blog = require('./blog')