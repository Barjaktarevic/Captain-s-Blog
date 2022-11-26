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
        min: [18, 'You have to be 18 or older to join.'],
        max: [90, 'You have to be 90 or younger to join.']
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    joinedAt: {
        type: Date,
        default: new Date()
        },
    shipName: {
        type: String,
        default: 'Enterprise'
    },
    image: {
        type: String,
        default: '/images/default-profile-image-1.svg'
    },
    rank: {
        type: String,
        enum: ['Midshipman', 'Ensing', 'Liutenant', 'Commander', 'Captain', 'Fleet Captain', 'Commodore', 'Rear Admiral', 'Vice Admiral', 'Admiral', 'Fleet Admiral', 'Admiral of Starfleet'],
        default: 'Midshipman'
    },
    blogEntries: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Blog'
    }],
    planetsVisited: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Planet'
    }]
})

userSchema.plugin(passportLocalMongoose)
const User = mongoose.model('User', userSchema)


module.exports = User