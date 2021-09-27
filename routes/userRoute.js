const express = require('express')
const { get_single_user, edit_dingle_user, delete_single_user, toggle_follow } = require('../controllers/userController')
const { requireSignIn } = require('../middleware')
const User = require('../models/User')
const router = express.Router()


//explore users
//get request
// /api/v1/user/explore
router.get('/explore', requireSignIn, async (req, res, next) => {
    const _user = req.user
    try {
        const users_array = []
        await User.find({ _id: { $ne: _user._id } }).then(users => {
            users.forEach(user => {
                users_array.push({
                    displayName: user.displayName,
                    email: user.email,
                    yearOfBirth: user.yearOfBirth,
                    address: user.address,
                    bio: user.bio,
                    gender: user.gender,
                    photoURL: user.photoURL,
                    verified: user.verified,
                    phoneNumber: user.phoneNumber,
                    posts: user.posts,
                    followers: user.followers,
                    following: user.following,
                    createdAt: user.createdAt,
                    _id: user._id
                })
            })
            return res.status(200).json({ users: users_array })
        }).catch(error => {
            return res.send(500).json(error)
        })
    } catch (error) {
        next(error)
    }
})

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