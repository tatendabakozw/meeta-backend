const mongoose = require('mongoose')

const storySchema = new mongoose.Schema({
    text: {
        type: String,
        default: ''
    },
    pictureUrl: {
        type: String,
        default: ''
    },
    createdAt: { 
        type: Date, 
        expires: '1440m', 
        default: Date.now 
    },
    user_id: {
        type: String,
        default: ''
    }
})

module.exports = mongoose.model('Story', storySchema)