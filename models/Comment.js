const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({
    body: {
        type: String
    },
    pictureUrl: {
        type: String
    },
    post_id: {
        type: String,
        required: true
    },
    user_id: {
        type: String,
        requires: true
    },
    likes: Array,
    comments: Array
}, {
    timestamps: true
})

module.exports = mongoose.model('Comment', CommentSchema)