const ChatRoom = require("../models/ChatRoom");
const Message = require("../models/Message");
const User = require("../models/User");

const generateChannelID = (otherID, myid) => {
    if (myid > otherID) {
        return (otherID + myid)
    } else {
        return (myid + otherID)
    }
}

// send a message
// post request
// /api/v1/chat/send_message/:id
exports.sendAMEssage = async (req, res, next) => {
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
            //pushing new users to chat room
            ChatRoom.findOneAndUpdate({ room_id: generateChannelID(id, _user._id) }, { $push: { users: [id, _user._id] } }, options).then(() => {
                // updateting chat room object to show on home screen
                ChatRoom.findOneAndUpdate({ room_id: generateChannelID(id, _user._id) }, { last_message: body, last_sent_by: id, last_sent_to: _user._id }, options).then(() => {
                    // adding chat room to the new users
                    User.findOneAndUpdate({ _id: _user._id }, { $push: { chatrooms: generateChannelID(id, _user._id) }}, options).then(() => {
                        User.findOneAndUpdate({ _id: id }, { $push: { chatrooms: generateChannelID(id, _user._id) } }).then(async () => {
                            newMessage.save().then(message=>{
                                global.io.sockets.emit('message', message)
                                return res.status(200).json({ message: "Message send", message: message.body })
                            })
                        }).catch(error => {
                            console.log(error)
                            return res.status(500).json({ error })
                        })
                    }).catch(error => {
                        console.log(error)
                        return res.status(500).json({ error })
                    })
                }).catch(error => {
                    console.log(error)
                    return res.status(500).json({ error })
                })
            }).catch(error => {
                console.log(error)
                return res.status(500).json({ error })
            })
        }

        else {
            ChatRoom.findOneAndUpdate({ room_id: generateChannelID(id, _user._id) }, { last_message: body, last_sent_by: id, last_sent_to: _user._id, createdAt: new Date }).then(async() => {
                const message = await newMessage.save()
                global.io.sockets.emit('message', message)
                return res.status(200).json({ message: "Message send", message: message })
            }).catch(error => {
                return res.status(500).json({ error })
            })
        }

    } catch (error) {
        console.log(error)
        next(error)
    }
}

//get all caht rooms
// get request
// /api/v1/chat/rooms/all
exports.get_Chat_Rooms = async (req, res, next) => {
    const _user = req.user // current logged in user
    try {
        const user_doc = await User.findOne({ _id: _user._id })
        const all_chats_rooms = await ChatRoom.find({ room_id: { $in: user_doc.chatrooms } })
        const chats = []
        let user_info
        let sent_by_you

        for (let i = 0; i < all_chats_rooms.length; i++) {
            if (all_chats_rooms[i].last_sent_by === _user._id) {
                user_info = await User.findOne({ _id: all_chats_rooms[i].last_sent_to })
                sent_by_you = true
            } else {
                user_info = await User.findOne({ _id: all_chats_rooms[i].last_sent_by })
                sent_by_you = false
            }
            const new_chat = ({
                last_message: all_chats_rooms[i].last_message,
                createdAt: all_chats_rooms[i].createdAt,
                room_id: all_chats_rooms[i].room_id,
                _id: all_chats_rooms[i]._id,
                message_username: user_info.displayName,
                user_verified: user_info.verified,
                user_picture: user_info.photoURL,
                user: all_chats_rooms[i].last_sent_by,
                chat_users: all_chats_rooms[i].users,
                sent_by_you: sent_by_you
            })
            chats.push(new_chat)
        }

        res.status(200).json(chats)

    } catch (error) {
        next(error)
    }
}

// get all chat messages
//get request
// /ap/v1/chat/messages/:id1/:id2
exports.get_All_Messages = async (req, res, next) => {
    const { id, id2 } = req.params
    const _user = req.user
    try {
        Message.find({ room_id: generateChannelID(id, id2) }).then(messages=>{

            return res.status(200).json({ messages })
        }).catch(err=>{
            console.log(err)
        })
    } catch (error) {
        next(error)
    }
}