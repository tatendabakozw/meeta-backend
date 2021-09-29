const express = require('express')
const { getSinglePost, getAllPosts, createA_Post, likeA_Post } = require('../controllers/postController')
const { requireSignIn } = require('../middleware')
const router = express.Router()

// get all posts
// get request
// api/v1/get/all
router.get('/all', requireSignIn, getAllPosts)

//get single post
//get request
// /api/v1/posts/:id
router.get('/:id', requireSignIn, getSinglePost)

// create a post
//post request
// api/v1/create
router.post('/create', requireSignIn, createA_Post)

//like a post
// patch requert
// api/v1/like/:id
router.patch('/like/:id', requireSignIn, likeA_Post)

module.exports = router