const express = require('express')
const middlewareCntroller = require('../controllers/middlewareController')

var router = express.Router()

//=========================================================
router.get('/',middlewareCntroller.verifyToken, (req, res, next) => {
    return res.status(200).json({ success: true})
})

//=========================================================
//get bai
router.get('/post', (req, res) => {

})

//post bai
router.post('/post', (req, res) => {

})

//put bai
router.post('/post/:id', (req, res) => {
    
})

//Del bai
router.post('/post/:id', (req, res) => {
    
})




module.exports = router