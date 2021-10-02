const Comment = require("../models/Comment")
const Posts = require("../models/Posts")
const User = require("../models/User")

exports.createComment = async (req, res, next) => {
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
                User.findOne({ _id: comment.user_id }).then(user => {
                    global.io.sockets.emit('commented', {
                        comment: {
                            displayName: user.displayName,
                            photoURL: user.photoURL,
                            createdAt: comment.createdAt,
                            body: comment.body,
                            user_id: comment.user_id,
                            verified: user.verified,
                            length: comment.length
                        }
                    })
                })
                return res.status(200).json({ message: 'Comment sent', comment: response })
            }).catch(error => {
                return res.status(500).json({ error: 'Error commenting post' - { error } })
            })
        })

    } catch (error) {

    }
}

//get all comments for a post
exports.get_Post_comments = async (req, res, next) => {
    const { id } = req.params
    try {
        const comments = await Comment.find({ post_id: id }).sort({_id: -1})
        let all_comments = []
        for (let i = 0; i < comments.length; i++) {
            const user = await User.findOne({ _id: comments[i].user_id })
            // console.log(user)
            all_comments.push({
                displayName: user.displayName,
                photoURL: user.photoURL,
                createdAt: comments[i].createdAt,
                body: comments[i].body,
                user_id: comments[i].user_id,
                verified: user.verified,
                length: comments.length
            })
            // all_comments.push(new_user)
        }
        return res.status(200).json({ comments: all_comments })
    } catch (error) {
        next(error)
    }
}