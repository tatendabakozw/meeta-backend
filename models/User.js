const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    displayName: {
        type: String,
        required: true,
        default: '',
        unique: true
    },
    email: {
        type: String,
        required: true,
        default: '',
        unique: true
    },
    password: {
        type: String,
        required: true,
        min: 6
    },
    gender: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: ''
    },
    verified: {
        type: Boolean,
        default: false
    },
    uid: {
        type: String,
        default: ''
    },
    photoURL: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    yearOfBirth: {
        type: String,
        default: ''
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    phoneNumber: {
        type: String,
        default: ''
    },
    posts: Array,
    followers: Array,
    chatrooms: Array,
    following: Array,
    requests: Array,
    liked_posts: Array,
    messaged: Array,
    pictures: [{
        url: String,
        id: String
    }]
}, {
    timestamps: true
})

module.exports = mongoose.model('User', UserSchema)