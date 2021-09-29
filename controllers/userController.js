const User = require("../models/User")

//get single user
//get request
// /api/v1/:id
exports.get_single_user = async (req, res, next) => {
    const { id } = req.params // user to get
    const logged_in_user = req.user // current logged in user
    try {
        const _user = await User.findOne({ _id: id })
        const logged_in_user_doc = await User.findOne({ _id: logged_in_user._id })
        let iam_following_user = []
        let user_follows_me = []
        if (_user) {

            //checking if current loggedd in user is following the other user
            logged_in_user_doc.following.filter(value => {
                iam_following_user = value === logged_in_user._id
            })
            //checking if the other user is following the current logged in user
            _user.following.filter(value => {
                user_follows_me = value === id
            })

            return res.status(200).json({
                user: {
                    address: _user.address,
                    displayName: _user.displayName,
                    createdAt: _user.createdAt,
                    email: _user.email,
                    gender: _user.gender,
                    liked_posts: _user.liked_posts,
                    phoneNumber: _user.phoneNumber,
                    pictures: _user.pictures,
                    posts: _user.posts,
                    verified: _user.verified,
                    photoURL: _user.photoURL,
                    followers: _user.followers,
                    following: _user.following,
                    iam_following_user: iam_following_user.length < 1 ? false : true,
                    user_follows_me: user_follows_me.length < 1 ? false : true,
                    bio: _user.bio,
                    _id: _user._id
                }
            })

        } else {
            return res.status(404).json({ error: "User not found" })
        }
    } catch (error) {
        next(error)
    }
}

//edit single user
//patch request
// /api/v1/edit/:id
exports.edit_dingle_user = async (req, res, next) => {
    try {
        const updateQuery = req.body
        const _new_user = await User.updateOne(
            { _id: req.params.id },
            { $set: updateQuery }
        );
        return res.status(200).json({ message: "User updated successfully", new_user: _new_user })
    } catch (error) {
        next(error)
    }
}

//delete single user
//delete request
// /api/v1/delete/:id
exports.delete_single_user = async (req, res, next) => {
    try {
        const { id } = req.params
        const _deleted = await User.deleteOne({ _id: id })
        return res.status(200).json({ message: "Account deleted", _deleted })
    } catch (error) {
        next(error)
    }
}

//follow / unfollow user
// patch request
// /api/v1/follow/:id
exports.toggle_follow = async (req, res, next) => {
    const { id } = req.params //the user to follow
    const _user = req.user // the current logged in user
    try {

        const following = await User.find({ following: _user._id }) //check user is already a follower
        if (following.length < 1) {

            if (id === _user._id) {
                return res.status(402).json({ error: "You cannot follow youself" })
            } else {
                User.findByIdAndUpdate({ _id: _user._id }, { $push: { following: id } }).then(() => {
                    User.findByIdAndUpdate({ _id: id }, { $push: { followers: _user._id } }).then(() => {
                        return res.status(200).json({ message: 'Followed' })
                    }).catch(error => {
                        return res.status(500).json({ error: "Failed to follow", err: error })
                    })
                }).catch(error => {
                    return res.status(500).json({ error: "Failed to follow", err: error })
                })
            }

        } else {

            if (id === _user._id) {
                return res.status(402).json({ error: "You cannot un-follow youself" })
            } else {
                User.findByIdAndUpdate({ _id: _user._id }, { $pull: { following: id } }).then(() => {
                    User.findByIdAndUpdate({ _id: id }, { $pull: { followers: _user._id } }).then(() => {
                        return res.status(200).json({ message: 'Un-Followed' })
                    }).catch(error => {
                        return res.status(500).json({ error: "Failed to un-follow", err: error })
                    })
                }).catch(error => {
                    return res.status(500).json({ error: "Failed to un-follow", err: error })
                })
            }
        }

    } catch (error) {
        next(error)
    }
}