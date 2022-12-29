const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    title: {
        type: String,
        required: [true, "Your log needs to have a title."],
        unique: [true, "Log with the same title already exists. Please change the title."],
        minlength: [3, "Title must be at least three characters long."],
        maxlength: [40, "Maximum title length (40 characters) exceeded."]
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Comment'
    }],
    body: {
        type: String,
        required: [true, "Log is required and has to be at least 1000 characters long."],
        unique: [true, "Identical log already exists. Please be original."],
        // min: [1000, "Log has to be at least 1000 characters long."],
        maxlength: [35000, "Maximum blog length (35000 characters) exceeded."]
    },
    createdAt: {
        type: String,
        default: new Date()
    },
    event: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Event'
    },
})

blogSchema.post('save', async function (doc) {
    console.log(doc)
    const event = await Event.findOne({ _id: doc.event._id})
    const user = await User.findOne({ _id: doc.author._id})
    let draft = { event: event.name, title: doc.title, body: doc.body}

    user.drafts && user.drafts.forEach(async(singleDraft) => {
        if (singleDraft.event === event.name) {
            await User.findOneAndUpdate({ _id: doc.author._id}, {$pull: { drafts: { event: event.name}}}, {runValidators: true})
        }
    })

    await user.drafts.push(draft)
    await user.save()
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