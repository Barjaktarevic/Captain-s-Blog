const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "You have to provide an email."],
        unique: true
    },
    age: {
        type: Number,
        min: [10, 'You have to be older than 10 to join.']
    },
    isAdmin: false,
    joinedAt: new Date(),
    rank: {
        type: String,
        enum: ['Midshipman', 'Ensing', 'Liutenant', 'Commander', 'Captain', 'Fleet Captain', 'Commodore', 'Rear Admiral', 'Vice admiral', 'Admiral', 'Fleet Admiral', 'Admiral of Starfleet'],
        default: 'Midshipman'
    },
    blogEntries: {
        type: mongoose.Schema.Types.ObjectId, ref: 'BlogEntry'
    },
    systemsVisited: {
        type: mongoose.Schema.Types.ObjectId, ref: 'System'
    }
})

const User = mongoose.model('User', userSchema)
userSchema.plugin(passportLocalMongoose)

module.exports = User