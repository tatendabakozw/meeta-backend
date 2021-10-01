const express = require('express')
const { sendAMEssage, get_All_Messages, get_Chat_Rooms } = require('../controllers/chatController')
const { requireSignIn } = require('../middleware')
const router = express.Router()

// send a message
// post request
// /api/v1/chat/send_message/:id
router.post('/send_message/:id', requireSignIn, sendAMEssage)

//get all caht rooms
// get request
// /api/v1/chat/rooms/all
router.get('/rooms/all', requireSignIn, get_Chat_Rooms)

// get all chat messages
//get request
// /ap/v1/chat/messages/:id1/:id2
router.get('/messages/:id/:id2', requireSignIn, get_All_Messages)

module.exports = router