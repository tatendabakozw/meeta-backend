const consola  = require('consola')
const mongoose = require('mongoose')

const LOCAL_DB = `mongodb://localhost:27017/meetA_DB`

const connectDB = () =>{
    mongoose.connect(LOCAL_DB, {})
    mongoose.connection.once('open',(err)=>{
        if(err){
            consola.error(err)
        }else{
            consola.success(`Database Connected Successfully`)
        }
    })
}

module.exports= connectDB