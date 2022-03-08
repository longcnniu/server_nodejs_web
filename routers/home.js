const express = require('express')
const middlewareCntroller = require('../controllers/middlewareController')

var router = express.Router()


//DB models
const PostsModule = require('../models/post')

//=========================================================
router.get('/', middlewareCntroller.verifyToken, (req, res, next) => {
    return res.status(200).json({ success: true , role: req.user.role})
})

//=========================================================
//get Post kiểm tra
router.get('/post', middlewareCntroller.verifyToken, (req, res) => {
    return res.status(200).json({ success: true, role: req.user.role})
})

//get all bost
router.get('/all-post', middlewareCntroller.verifyToken, async (req, res) => {
    try {
        const dataPost = await PostsModule.find()
        if(!dataPost){
            return res.status(400).json({success: false, message: 'khong co bia viet nao'})
        }

        return res.status(200).json({success: true, dataPost: dataPost})
    } catch (error) {
        return res.status(500).json({success: false, message: 'loi server'})
    }
})

//post bai
router.post('/post', middlewareCntroller.verifyTokenAndStaffAuth, async (req, res) => {
    const UserId = req.user.userId
    const name = req.user.name
    const { title, content, category } = req.body

    if (!title || !content) {
        return res.status(401).json({ success: false, message: 'thieu tieu de va noi dung' })
    }

    try {
        const savePost = await PostsModule({ UserId, name, title, content, category })
        await savePost.save()

        return res.status(200).json({ success: true, message: 'Created Post successfully' })
    } catch (error) {
        return res.status(500).json({ success: true, message: 'loi server' })
    }

})

//put bai
router.post('/post/:id', (req, res) => {

})

//Del bai
router.post('/post/:id', (req, res) => {

})

module.exports = router