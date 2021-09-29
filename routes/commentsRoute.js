const express = require('express')
const { requireSignIn } = require('../middleware')
const Comment = require('../models/Comment')
const Posts = require('../models/Posts')
const router = express.Router()

//create a comment
router.post('/create/:id', requireSignIn, async (req, res, next) => {
    const { id } = req.params //id of the post to be commented in
    const _user = req.user // the user to comment
    try {
        const { body, pictureUrl } = req.body
        const new_comment = new Comment({
            body: body,
            pictureUrl: pictureUrl,
            user_id: _user._id,
            post_id: id
        })

        new_comment.save().then(comment => {
            Posts.findOneAndUpdate({ _id: id }, { $push: { comments: comment._id } }).then(response => {
                return res.status(200).json({ message: 'Comment sent', comment: response })
            }).catch(error => {
                return res.status(500).json({ error: 'Error commenting post' - { error } })
            })
        })

    } catch (error) {

    }
})

module.exports = router