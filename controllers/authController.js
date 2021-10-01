const express = require('express')
const User = require("../models/User")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

//register user 
//post request
// /api/v1/auth/register
exports.register_user = async (req, res, next) => {
    const { email, username, password } = req.body
    try {
        const _user = await User.findOne({ $or: [{ email: email }, { displayName: username }] })
        if (_user) {
            return res.status(422).json({ error: "Account already exists" })
        }
        if (password.length < 6) {
            return res.status(400).json({ error: "Password too short" })
        } else {

            const hash = await bcrypt.hash(password, 10)
            if (hash) {
                const user = new User({
                    displayName: username,
                    email,
                    password: hash,
                })
                user.save().then(res => {
                    global.io.sockets.emit('register-success', 'sucessfully registered')
                    return res.status(200).json({ message: "Account Created!", user: res })
                }).catch(err => {
                    console.log(err)
                })

            }

            else {
                return res.status(500).json({ error: "Password Not Hashed" })
            }
        }
    } catch (error) {
        next(error)
    }
}

//register user 
//post request
// /api/v1/auth/login
exports.login_user = async (req, res, next) => {
    const { email, password } = req.body
    try {
        if (!password) {
            return res.status(400).json({ error: "Enter All Fields" })
        } else {
            const _user = await User.findOne({ email: email })
            if (!_user) {
                return res.status(404).json({ error: 'Account does not exist' })
            } else {
                const password_correct = await bcrypt.compare(password, _user.password)
                if (password_correct) {
                    const token = await jwt.sign({
                        displayName: _user.displayName,
                        photoURL: _user.photoURL,
                        email: _user.email,
                        gender: _user.gender,
                        bio: _user.bio,
                        verified: _user.verified,
                        posts: _user.post,
                        address: _user.address,
                        yearOfBirth: _user.yearOfBirth,
                        friends: _user.friends,
                        chats: _user.chats,
                        posts: _user.posts,
                        _id: _user._id
                    }, process.env.JWT_SECRET)
                    if (token) {
                        global.io.sockets.emit('login-success', 'sucessfully logged in')
                        return res.status(200).json({
                            message: 'login successful',
                            token: token,
                            user: {
                                displayName: _user.displayName,
                                photoURL: _user.photoURL,
                                email: _user.email,
                                gender: _user.gender,
                                bio: _user.bio,
                                verified: _user.verified,
                                posts: _user.post,
                                address: _user.address,
                                yearOfBirth: _user.yearOfBirth,
                                friends: _user.friends,
                                chats: _user.chats,
                                posts: _user.posts,
                                _id: _user._id
                            }
                        })
                    } else {
                        return res.status(422).json({ error: 'Failed to login, Wrong password!' })
                    }
                } else {
                    return res.status(400).json({ error: 'Wrong login details' })
                }
            }
        }
    } catch (error) {
        next(error)
    }
}

//logout user
//post request 
// /api/v1/auth/logout
exports.logout_user = async (req, res, next) => {
    try {
        global.io.sockets.emit('logout-success', 'sucessfully logged out')
        return res.status(200).json({ user: null, token: null })
    } catch (error) {
        next(error)
    }
}