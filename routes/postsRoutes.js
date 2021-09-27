const consola = require('consola')
const express = require('express')
const { requireSignIn } = require('../middleware')
const Posts = require('../models/Posts')
const User = require('../models/User')
const router = express.Router()

//get single post
router.get('/:id', async (req, res, next) => {
    const { id } = req.params
    try {
        Posts.findOne({ _id: id }).then(post => {
            User.findOne({ _id: post.owner }).then(post_owner => {
                return res.status(200).json({
                    post, post_owner: {
                        displayName: post_owner.displayName,
                        photoURL: post_owner.photoURL,
                        _id: post_owner._id,
                        verified: post_owner.verified
                    }
                })
            }).catch(err => {
                return res.status(200).json({ error: err })
            })
        }).catch(error => {
            return res.status(200).json({ error: error })
        })

    } catch (error) {
        next(error)
    }
})

//create a post
router.post('/create', requireSignIn, async (req, res, next) => {
    const _user = req.user
    const { body, title, pictureUrl, location } = req.body
    try {
        const newPost = new Posts({
            body: body,
            title: title,
            pictureUrl: pictureUrl,
            owner: _user._id,
            location: location
        })

        if (pictureUrl) {
            newPost.save().then(post => {
                User.findOneAndUpdate({ _id: _user._id }, { $push: { posts: post._id, pictures: { url: pictureUrl, id: post._id } } }).then(response => {
                    return res.status(200).json({ message: 'Post created', post: response })
                }).catch(error => {
                    return res.status(500).json({ error: 'Error creating post' - { error } })
                })
            }).catch(err => {
                return res.status(500).json({ error: 'Error creating post' - { err } })
            })
        }
        else {
            newPost.save().then(post => {
                User.findOneAndUpdate({ _id: _user._id }, { $push: { posts: post._id } }).then(response => {
                    return res.status(200).json({ message: 'Post created', post: response })
                }).catch(error => {
                    return res.status(500).json({ error: 'Error creating post' - { error } })
                })
            }).catch(err => {
                return res.status(500).json({ error: 'Error creating post' - { err } })
            })
        }

    } catch (error) {
        next(error)
    }
})

//like a post
router.patch('/like/:id', requireSignIn, async (req, res, next) => {
    const _user = req.user
    const { id } = req.params
    try {

        // fond if user has already liked the post
        const _liked = await User.find({ liked_posts: id })

        if (_liked.length < 1) {
            Posts.updateOne({ _id: id }, { $push: { likes: _user._id } }).then(response => {
                User.updateOne({ _id: _user._id }, { $push: { liked_posts: id } }).then(() => {
                    return res.status(200).json({ message: 'Liked' })
                }).catch(err => {
                    return res.status(200).json({ error: err })
                })
            }).catch(err => {
                return res.status(200).json({ error: err })
            })
        } else {
            Posts.updateOne({ _id: id }, { $pull: { likes: _user._id } }).then(response => {
                User.updateOne({ _id: _user._id }, { $pull: { liked_posts: id } }).then(() => {
                    return res.status(200).json({ message: 'Un-Liked' })
                }).catch(err => {
                    return res.status(200).json({ error: err })
                })
            }).catch(err => {
                return res.status(200).json({ error: err })
            })
        }

    } catch (error) {
        next(error)
    }
})

module.exports = router