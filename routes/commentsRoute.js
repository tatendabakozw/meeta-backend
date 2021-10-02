const express = require('express')
const { createComment, get_Post_comments } = require('../controllers/commentController')
const { requireSignIn } = require('../middleware')
const router = express.Router()

//create a comment
router.post('/create/:id', requireSignIn, createComment)

//get all comments for a post
router.get('/all/:id', get_Post_comments)

module.exports = router