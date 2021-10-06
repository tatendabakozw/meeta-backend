const { response } = require('express')
const express = require('express')
const { requireSignIn } = require('../middleware')
const Story = require('../models/Story')
const router = express.Router()

//create a post that deltes itself after minute
router.post('/create_story', requireSignIn, async (req, res, next) => {
    const _user = req.user
    try {
        const { text, pictureUrl } = req.body
        const new_story = new Story({
            text,
            pictureUrl,
            user_id: _user._id
        })

        const saved_story = await new_story.save()

        if (saved_story) {
            res.status(200).json({ story: saved_story })
        }

    } catch (error) {
        next(error)
    }
})

module.exports = router