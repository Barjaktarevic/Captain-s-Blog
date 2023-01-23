const mongoose = require('mongoose')
const Blog = require('../models/blog')
const User = require('../models/user')
const Event = require('../models/event')
const Galaxy = require('../models/galaxy')
const Comment = require('../models/comment')
const wrapAsync = require('../utils/wrapAsync')


// Render titlepage
exports.get_titlepage = (req, res) => {
    res.render('titlepage')
}

// Render homepage
exports.get_homepage = wrapAsync(async (req, res, next) => {
    if (await Blog.findOne({})) {
        const blog = await Blog.aggregate([{ $match: {} }, { $sample: { size: 1 } }])
        const author = await User.findOne({ _id: blog[0].author._id }).select(['username', 'rank', 'image'])
        const event = await Event.findOne({ _id: blog[0].event._id }).select('name').populate({ path: 'galaxy', select: 'name' })

        res.render('home', { blog, author, event })
    } else {
        res.render('home', { blog: 'blog', author: 'author', event: 'event' })
    }
})

// Render a random blog on the home view page using the fetch API
exports.get_random_blog = wrapAsync(async (req, res, next) => {
    const blog = await Blog.aggregate([{ $match: {} }, { $sample: { size: 1 } }])
    const author = await User.findOne({ _id: blog[0].author._id }).select(['username', 'rank', 'image'])
    const event = await Event.findOne({ _id: blog[0].event._id }).select('name').populate({ path: 'galaxy', select: 'name' })

    const randomBlogInfo = { blog, author, event }
    res.send(randomBlogInfo)
})

// Render individual blog route
exports.get_blog = wrapAsync(async (req, res, next) => {
    const blog = await Blog.findOne({ _id: req.params.id })
        .populate({ path: 'event', select: 'name', populate: { path: 'galaxy', select: 'name' } })
        .populate({ path: 'author', select: ['image', 'rank', 'username'] })
        .populate({ path: 'comments', select: ['creator', 'comment', 'createdAt', 'rating'], populate: { path: 'creator' } })
    // console.log(req.user)
    // console.log(blog.comments)
    res.render('show-log', { blog })
})

// Delete individual blog route
exports.delete_blog = wrapAsync(async (req, res, next) => {
    const direction = await Blog.findByIdAndDelete({ _id: req.params.id })
        .populate({ path: 'event', select: 'name', populate: { path: 'galaxy', select: 'name' } })

    req.flash('success', 'Entry successfully deleted.')
    res.redirect(`/jump/${direction.event.galaxy.name}/`)
})

// Post comments route on individual blog viewpage
exports.post_comment = wrapAsync(async (req, res, next) => {
    const { rating, comment } = req.body
    const user = await User.findOne({ username: req.user.username }).populate('comments')
    const blog = await Blog.findOne({ _id: req.params.id }).populate({ path: 'comments', populate: { path: 'creator' } })

    blog.comments.forEach(async (comment) => {
        if (comment.creator.id == req.user.id) {
            console.log('You have already written a comment for this blog!')
            const commentId = comment.id
            console.log(comment.comment)
            commentForDeletion = await Comment.findOneAndDelete({ comment: comment.comment })
        }
    })

    const newComment = new Comment({ rating, comment, creator: user._id, blog: blog._id })
    await newComment.save()

    await blog.comments.push(newComment)
    await blog.save()

    await user.comments.push(newComment)
    await user.save()

    req.flash('success', 'Successfully posted!')
    res.redirect(`/logs/${req.params.id}`)
})

// Delete comment route
exports.delete_comment = wrapAsync(async (req, res, next) => {
    const deletedComment = await Comment.findByIdAndDelete(req.params.id)
    req.flash('success', 'Review expunged from archives.')
    res.redirect(`/logs/${deletedComment.blog._id}`)
})

// Either go to logs compose route for one event or show all logs for one event route
exports.compose_and_show_logs = wrapAsync(async (req, res, next) => {
    const intent = req.query.intent
    if (intent === 'compose') {
        const event = await Event.findOne({ name: req.params.event })
        const galaxy = await Galaxy.findOne({ name: req.params.galaxy })
        const user = await User.findOne({ _id: req.user._id })
        let draft = {}

        user.drafts && user.drafts.forEach(singleDraft => {
            if (singleDraft.event === event.name) {
                draft = { title: singleDraft.title, body: singleDraft.body }
            }
        })
        res.render('log-compose', { event, galaxy, draft })
    } else {
        const event = await Event.findOne({ name: req.params.event }).populate('galaxy')
        const blogs = await Blog.find({ event: event.id }).populate('author').sort({ createdAt: 1 })
        res.render('logs', { event, blogs })
    }
})

// Post complete blog route && save draft before posting (this is in a post middleware on the blog model)
exports.post_blog = wrapAsync(async (req, res, next) => {
    const { title, body } = req.body
    const user = await User.findOne({ username: req.user.username })
        .populate({ path: 'blogEntries', populate: { path: 'event' } }) // added this first

    const foundEvent = await Event.findOne({ name: req.params.event })
    const galaxy = req.params.galaxy

    let alreadyWrittenBlog
    let writtenBlogId
    let draft = { event: foundEvent.name, title: title, body: body }

    user.blogEntries && user.blogEntries.forEach(async (blogEntry) => {
        if (blogEntry.event.name === req.params.event) {
            console.log("You've already written a blog for this event.")
            alreadyWrittenBlog = true
            writtenBlogId = blogEntry._id
        }
        return
    }) // this block is to check whether the user has already written a log for this event and to find the log's ID

    if (alreadyWrittenBlog === true) {
        const newBlog = await Blog.findOneAndUpdate({ _id: writtenBlogId }, { title: title, body: body })
        await User.findOneAndUpdate({ _id: req.user._id }, { $pull: { drafts: { event: foundEvent.name } } }, { runValidators: true })
        // console.log(draft) // need to add user.save here as well in all likelihood because it could fail otherwise
        await user.drafts.push(draft)
        await user.save()
        req.flash('success', 'Successfully updated log entry')
        res.redirect(`/jump/${galaxy}/logs/${foundEvent.name}`)
    } else {
        const blog = new Blog({ title, body, author: user.id, event: foundEvent.id })
        await blog.save()
        // need to update draft here as well!
        foundEvent.blogEntries.push(blog)
        await foundEvent.save()

        user.blogEntries.push(blog)
        await user.save()

        req.flash('success', 'Successfully posted a log entry')
        res.redirect(`/jump/${galaxy}/logs/${foundEvent.name}`)
    }
})


// Save and update drafts route 
exports.update_draft = wrapAsync(async (req, res, next) => {
    const user = await User.findOne({ _id: req.user._id })
    const { title, body } = req.body
    const event = req.params.event
    let draft = { event: event, title: title, body: body }

    user.drafts && user.drafts.forEach(async (singleDraft) => {
        if (singleDraft.event === event) {
            await User.findOneAndUpdate({ _id: req.user._id }, { $pull: { drafts: { event: event } } }, { runValidators: true })
        }
    })
    await user.save()

    user.drafts.push(draft)
    await user.save()

    req.flash('success', 'Draft successfully saved.')
    res.redirect('back')
})

// Render all galaxies
exports.get_galaxies = wrapAsync(async (req, res, next) => {
    let galaxies = await Galaxy.find()
    res.render('jump', { galaxies })
})

// See all events for one galaxy route
exports.get_events = wrapAsync(async (req, res, next) => {
    let galaxy = await Galaxy.findOne({ name: req.params.galaxy }).populate('event')
    res.render('galaxy', { galaxy })
})

// Render contact page
exports.get_contact = (req, res) => {
    res.render('contact')
}

// Render about page
exports.get_about = (req, res) => {
    res.render('about')
}