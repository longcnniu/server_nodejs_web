const express = require('express')

var router = express.Router()
const checklogin = require('../function/checklogin')



const path = require('path')


//=========================================================
router.get('/home/',checklogin, (req, res, next) => {
    res.sendFile(path.join(__dirname, '../public/view/home.html'))
})



module.exports = router