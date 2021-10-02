const Comment = require("../models/Comment")
const Posts = require("../models/Posts")
const User = require("../models/User")

//get single post
//get request
// /api/v1/posts/:id
exports.getSinglePost = async (req, res, next) => {
    const { id } = req.params
    const _user = req.user
    try {
        Posts.findOne({ _id: id }).then(async post => {
            const comments_array = post.comments

            const comments = await Comment.find().where('_id').in(comments_array).exec();
            let all_comments = []
            for (let i = 0; i < comments.length; i++) {
                User.findOne({ _id: comments[i].user_id }).then(resp => {
                    all_comments.push({
                        comment_body: comments[i].body,
                        comments_id: comments[i]._id,
                        comment_likes: comments[i].likes,
                        comment_picture: comments[i].pictureUrl,
                        comment_comments: comments[i].comments,
                        comment_post: comments[i].post_id,
                        comment_owner: resp._id,
                        comment_owner_picture: resp.photoURL,
                        comment_owner_name: resp.displayName,
                        comment_owner_verified: resp.verified
                    })
                })
            }

            User.findOne({ _id: post.owner }).then(post_owner => {
                return res.status(200).json({
                    post,
                    comments: all_comments,
                    post_owner: {
                        displayName: post_owner.displayName,
                        photoURL: post_owner.photoURL,
                        _id: post_owner._id,
                        verified: post_owner.verified,
                        liked_post: post.likes.find(element => element === _user._id) ? true : false
                    }
                })
            }).catch(err => {
                return res.status(500).json({ error: err.message })
            })
        }).catch(error => {
            return res.status(500).json({ error: error.message })
        })

    } catch (error) {
        next(error)
    }
}

// get all posts
// get request
// api/v1/get/all
exports.getAllPosts = async (req, res, next) => {
    const _user = req.user
    try {
        const posts = await Posts.find({}) // all posts
        const all_posts = []

        // getiing the use for each post
        for (let i = 0; i < posts.length; i++) {
            const post_user = await User.findOne({ _id: posts[i].owner })
            const new_post = ({
                post_owner_pic: post_user.photoURL,
                post_owner_username: post_user.displayName,
                post_owner_id: post_user._id,
                post_owner_verified: post_user.verified,
                pictureUrl: posts[i].pictureUrl,
                post_comments_length: posts[i].comments.length,
                post_liked_length: posts[i].likes.length,
                createdAt: posts[i].createdAt,
                post_body: posts[i].body,
                liked_post: posts[i].likes.find(element => element === _user._id) ? true : false,
                _id: posts[i]._id,
                post_owner: post_user._id
            })
            all_posts.push(new_post)
        }

        return res.status(200).json(all_posts)

    } catch (error) {
        next(error)
    }
}

// create a post
//post request
// api/v1/create
exports.createA_Post = async (req, res, next) => {
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
}

//like a post
// patch requert
// api/v1/like/:id
exports.likeA_Post = async (req, res, next) => {
    const _user = req.user
    const { id } = req.params
    try {

        // fond if user has already liked the post
        const user_doc = await User.findOne({ _id: _user._id })
        let _liked = user_doc.liked_posts.find(element => element === id);
        console.log(_liked)

        if (!_liked) {
            Posts.findOneAndUpdate({ _id: id }, { $push: { likes: _user._id } }).then(response => {
                User.findOneAndUpdate({ _id: _user._id }, { $push: { liked_posts: id } }).then((ssd) => {
                    Posts.findOne({ _id: id }).then(respo => {
                        global.io.sockets.emit('like-done', {likes: respo.likes.length, user_liked: true} )
                    }).catch(error => {
                        next(error)
                    })
                    return res.status(200).json({ message: 'Liked' })
                }).catch(err => {
                    return res.status(200).json({ error: err })
                })
            }).catch(err => {
                return res.status(200).json({ error: err })
            })
        } else {
            Posts.findOneAndUpdate({ _id: id }, { $pull: { likes: _user._id } }).then(response => {
                User.findOneAndUpdate({ _id: _user._id }, { $pull: { liked_posts: id } }).then(() => {
                    Posts.findOne({ _id: id }).then(respo => {
                        global.io.sockets.emit('like-done', {likes: respo.likes.length, user_liked: false })
                    }).catch(error => {
                        next(error)
                    })
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
}