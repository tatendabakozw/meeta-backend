const express = require('express')
const morgan = require('morgan')
const app = express()
const consola = require('consola')
const cors = require('cors')
const connectDB = require('./utils/database')
require('dotenv').config()
const helmet = require('helmet')
app.use(helmet())

const port = process.env.PORT || 5500

//app level middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(helmet())
app.use(morgan('common'))

//connecting database
connectDB()

//user defined routes
app.use('/api/v1/auth',require('./routes/authRoute'))
app.use('/api/v1/user', require('./routes/userRoute'))
app.use('/api/v1/posts', require('./routes/postsRoutes'))

//basic get route
app.get('/',(req,res)=>{
    res.json({message: 'meetA API by Tatenda Bako'})
})

//not found handler
app.use((req,res,next)=>{
    const error = new Error(`Not found - ${req.originalUrl}`)
    res.status(404)
    next(error)
})

//error hanling middleware
app.use((error, req,res, next)=>{
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode
    res.status(statusCode);
    console.log(error)
    res.json({
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? "you are in production" : error.stack
    })
})

//listener
app.listen(port, (err) => {
    if (err) {
        consola.error(err)
    } else {
        consola.success(`server up on port ${port}`)
    }
})