const consola = require('consola')
const mongoose = require('mongoose')

const connectDB = () => {
    mongoose.connect(process.env.PROD_DB, {})
    // mongoose.connection.on('connected', (err) => {
    //     if (err) {
    //         consola.error(err)
    //     } else {
    //         consola.success(`Database Connected Successfully`)
    //     }
    // })
    mongoose.connection.on('connected', () => {
        consola.success('Mongo has connected succesfully')
    })
    mongoose.connection.on('reconnected', () => {
        consola.info('Mongo has reconnected')
    })
    mongoose.connection.on('error', error => {
        consola.error('Mongo connection has an error', error)
        mongoose.disconnect()
    })
    mongoose.connection.on('disconnected', () => {
        consola.error('Mongo connection is disconnected')
    })
}

module.exports = connectDB