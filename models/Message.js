const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
    body:{
        type: String
    },
    picrureUrl:{
        type: String
    },
    sent_by:{
        type: String
    },
    sent_to:{
        type: String
    },
    seen:{
        type: Boolean,
        default: false
    },
    room_id:{
        type: String
    }
},{
    timestamps: true
})

module.exports = mongoose.model('Chats', MessageSchema)