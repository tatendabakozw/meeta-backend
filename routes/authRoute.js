const express = require('express')
const router = express.Router()
const { register_user, login_user } = require('../controllers/authController')
const { requireSignIn } = require('../middleware')

//default route
router.get('/', requireSignIn, (req, res) => {
    // res.send('authenntucation route.. choose either login or register')
    res.status(200).json({user: req.user})
})

//register user 
//post request
// /api/v1/auth/register
router.post('/register', register_user)

//register user 
//post request
// /api/v1/auth/login
router.post('/login', login_user)

module.exports = router