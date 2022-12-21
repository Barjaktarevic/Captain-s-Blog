const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    comment: {
        type: String,
        require: true,
    },
    createdAt: {
        type: String,
        default: new Date()
    },
    blog: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Event'
    },
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