const express = require('express')
const middlewareCntroller = require('../controllers/middlewareController')

var router = express.Router()

//=========================================================
router.get('/',middlewareCntroller.verifyToken, (req, res, next) => {
    res.json('Home')
})



module.exports = router