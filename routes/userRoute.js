const express = require('express')
const { get_single_user, edit_dingle_user, delete_single_user, toggle_follow, exploreAll_Users } = require('../controllers/userController')
const { requireSignIn } = require('../middleware')
const User = require('../models/User')
const router = express.Router()


//explore users
//get request
// /api/v1/user/explore
router.get('/explore', requireSignIn, exploreAll_Users)

//get single user
//get request
// /api/v1/:id
router.get('/:id',requireSignIn, get_single_user)

//edit single user
//patch request
// /api/v1/edit/:id
router.patch('/edit/:id', requireSignIn, edit_dingle_user)

//delete single user
//delete request
// /api/v1/delete/:id
router.delete('/delete/:id', requireSignIn, delete_single_user)

//follow / unfollow user
// patch request
// /api/v1/follow/:id
router.patch('/follow/:id', requireSignIn, toggle_follow)

module.exports = router