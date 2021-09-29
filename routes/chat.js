const express = require('express')
const { requireSignIn } = require('../middleware')
const ChatRoom = require('../models/ChatRoom')
const Message = require('../models/Message')
const User = require('../models/User')
const router = express.Router()

const generateChannelID = (otherID, myid) => {
    if (myid > otherID) {
        return (otherID + myid)
    } else {
        return (myid + otherID)
    }
}

//send a message route
router.post('/send_message/:id', requireSignIn, async (req, res, next) => {
    const { body, pictureUrl } = req.body
    const _user = req.user // the user sennding the message
    const { id } = req.params //the user receiveing the message
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    try {
        const newMessage = new Message({
            body: body,
            pictureUrl: pictureUrl,
            sent_by: _user._id,
            sent_to: id,
            room_id: generateChannelID(id, _user._id)
        })

        const room_exists = await ChatRoom.findOne({ room_id: generateChannelID(id, _user._id) })

        if (!room_exists) {
            ChatRoom.findOneAndUpdate({ room_id: generateChannelID(id, _user._id) }, { $push: { users: [id, _user._id] } }, options).then(() => {
                ChatRoom.findOneAndUpdate({ room_id: generateChannelID(id, _user._id) }, { last_message: body, last_sent_by: id }).then(() => {
                    User.findOneAndUpdate({ _id: _user._id }, { $push: { chatrooms: generateChannelID(id, _user._id) } }, options).then(() => {
                        User.findByIdAndUpdate({ _id: id }, { $push: { chatrooms: generateChannelID(id, _user._id) } }, options).then(async () => {
                            const message = await newMessage.save()
                            return res.status(200).json({ message: "Message send", message: message })
                        }).catch(error => {
                            return res.status(500).json({ error })
                        })
                    }).catch(error => {
                        return res.status(500).json({ error })
                    })
                }).catch(error => {
                    return res.status(500).json({ error })
                })
            }).catch(error => {
                return res.status(500).json({ error })
            })
        }

        else {
            const message = await newMessage.save()
            ChatRoom.findOneAndUpdate({ room_id: generateChannelID(id, _user._id) }, { last_message: body, last_sent_by: id }).then(() => {
                return res.status(200).json({ message: "Message send", message: message })
            }).catch(error => {
                return res.status(500).json({ error })
            })
        }

    } catch (error) {
        next(error)
    }
})

// get all user chat rooms to display on homepage
router.get('/rooms/all', requireSignIn, async (req, res, next) => {
    const _user = req.user // current logged in user
    try {
        const user_doc = await User.findOne({ _id: _user._id })
        const all_chats_rooms = await ChatRoom.find({ room_id: { $in: user_doc.chatrooms } })
        const chats = []

        for (let i = 0; i < all_chats_rooms.length; i++) {
            const user_info = await User.findOne({ _id: all_chats_rooms[i].last_sent_by })
            const new_chat = ({
                last_message: all_chats_rooms[i].last_message,
                createdAt: all_chats_rooms[i].createdAt,
                room_id: all_chats_rooms[i].room_id,
                _id: all_chats_rooms[i]._id,
                message_username: user_info.displayName,
                user_verified: user_info.verified,
                user_picture: user_info.photoURL,
                user: all_chats_rooms[i].last_sent_by,
                chat_users: all_chats_rooms[i].users
            })
            chats.push(new_chat)
        }

        res.status(200).json(chats)

    } catch (error) {
        next(error)
    }
})

//get all chat messaged
router.get('/messages/:id/:id2', requireSignIn, async (req, res, next) => {
    const { id, id2 } = req.params
    const _user = req.user
    try {

        const messages = await Message.find({ room_id: generateChannelID(id, id2) })
        return res.status(200).json({ messages })
    } catch (error) {
        next(error)
    }
})

module.exports = router