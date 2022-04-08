const express = require('express')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const dotenv = require('dotenv')
var cors = require('cors')

//Routers
const accountRouter = require('./routers/account')
const homeRouter = require('./routers/home')
const loginRouter = require('./routers/login')
const adminRouter = require('./routers/admin')
const QaManagerRouter = require('./routers/qaManager')
const CategorysRouter = require('./routers/category')
const statisticalRouter = require('./routers/statistical')

//models
const Time = require('./function/timeUp')

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

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


const PORT = 5000

//================================================================
//chong DOS DDOS
const limiter = rateLimit({
  // 15 minutes
    windowMs: 1 * 60 * 1000,
  // limit each IP to 100 requests per windowMs
    max: 1000,
    message: {
      message: "Too many requests from this IP, please try again in 1 minutes"
    }
  });
  app.use(limiter);
//================================================================
//gồm 14 middleware nhỏ ở trong giúp xử lý, lọc các HTTP header độc hại (nhằm khai thác lỗ hổng XSS hay clickjacking, …).
app.use(helmet())
//================================================================
//Router
app.use('/',accountRouter)
app.use('/',homeRouter)
app.use('/',loginRouter)
app.use('/',adminRouter)
app.use('/',QaManagerRouter)
app.use('/',CategorysRouter)
app.use('/',statisticalRouter)

Time
//them port chon len heroko
app.listen(process.env.PORT || PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT} vs ${PORT}`)
})

