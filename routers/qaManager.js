const express = require('express')
const middlewareCntroller = require('../controllers/middlewareController')

var router = express.Router()

//=========================================================
router.get('/manager',middlewareCntroller.verifyTokenAndQAAuth, (req, res, next) => {
    return res.status(200).json({ success: true})
})

//===================================================================================================


module.exports = router