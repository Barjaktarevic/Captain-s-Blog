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
    galaxy: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Galaxy'
    },
    blogEntries: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Blog'
    }]
})

const Event = mongoose.model('Event', eventSchema)

eventSchema.post('findOneAndDelete', async function (doc) {
    console.log(doc)
    // const blogsArray = [...doc.blogEntries]
    // blogsArray.forEach(async (blogEntry) => {
    //     await Event.findOneAndUpdate({_id: owner._id}, {$pull: {games: doc.id}})
    // })
})


module.exports = Event
const Blog = require('./blog')
const Galaxy = require('./galaxy')