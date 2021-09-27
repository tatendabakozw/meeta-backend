const mongoose = require('mongoose')

const PostsSchema = new mongoose.Schema({
    body:{type: String, required: true},
    title: {type: String, default: ''},
    pictureUrl: {type: String, default: ''},
    url: {type: String, default: ''},
    owner: {type: mongoose.Types.ObjectId, ref: 'User'},
    date: Date,
    likes: Array,
    comments: Array
},{
    timestamps: true
})

module.exports = mongoose.model('Posts', PostsSchema)