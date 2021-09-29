const mongoose = require('mongoose')

const ChatroomSchema = new mongoose.Schema({
    users: Array,
    room_id: {
        type: String
    },
    last_message:{
        type: String
    },
    last_sent_by:{
        type: String
    }
},{
    timestamps: true
})

module.exports = mongoose.model('Chatroom', ChatroomSchema)