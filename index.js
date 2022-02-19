const express = require('express')
const bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
const mongoose = require('mongoose');
const dotenv = require('dotenv')
var cors = require('cors')

//Routers
const accountRouter = require('./routers/account')
const homeRouter = require('./routers/home')

dotenv.config()

//conet DB
const connectDB = async () =>{
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('MongoDB connected');
  } catch (error) {
    console.log(error.message);
    process.exit(1)
  }
}

connectDB()
//===============================================================
const app = express()
app.use(cors())
app.use(cookieParser())

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


const PORT = 5000
//================================================================
//Router
app.get('/',(req, res, next)=>{
  res.json('Hello')
})
app.use('/',accountRouter)
app.use('/',homeRouter)

//them port chon len heroko
app.listen(process.env.PORT || PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT} vs ${PORT}`)
})