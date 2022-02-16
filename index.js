const express = require('express')
const bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
const autologin = require('./function/autologin')
const path = require('path')
const mongoose = require('mongoose');
var cors = require('cors')

//Routers
const accountRouter = require('./routers/account')
const homeRouter = require('./routers/home')

//conet DB
const connectDB = async () =>{
  try {
    await mongoose.connect('mongodb+srv://webnode:webnode123@cluster0.z8p9h.mongodb.net/myFirstDatabase?retryWrites=true&w=majority');
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
app.use('/public', express.static(path.join(__dirname, '/public')))
app.use(cookieParser())

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


const port = 5000
//================================================================
//Routers
app.get('/',autologin, (req, res, next)=>{})
app.use('/',accountRouter)
app.use('/',homeRouter)

//them port chon len heroko
app.listen(process.env.port || port, () => {
  console.log(`Example app listening on port ${port}`)
})