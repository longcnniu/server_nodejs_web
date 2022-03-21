const express = require('express')
const middlewareCntroller = require('../controllers/middlewareController')

var router = express.Router()


//DB models
const PostsModule = require('../models/post')
const CommentModule = require('../models/comment')
const VotesModule = require('../models/vote')
const ViewsModule = require('../models/view')

//=========================================================
router.get('/', middlewareCntroller.verifyToken, (req, res, next) => {
    return res.status(200).json({ success: true, role: req.user.role })
})

//=========================================================
//get Post kiểm tra
router.get('/post', middlewareCntroller.verifyToken, (req, res) => {
    return res.status(200).json({ success: true, role: req.user.role })
})

//get all bost
router.get('/all-post', middlewareCntroller.verifyToken, async (req, res) => {
    try {
        const dataPost = await PostsModule.find()

        if (!dataPost) {
            return res.status(400).json({ success: false, message: 'khong co bia viet nao' })
        }

        return res.status(200).json({ success: true, dataPost: dataPost })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'loi server' })
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
router.post('/post/:id', middlewareCntroller.verifyToken, (req, res) => {

})

//Del bai
router.delete('/post/:id', (req, res) => {

})

//Xem chi tiết Post
router.get('/post/:id', middlewareCntroller.verifyToken, async (req, res) => {
    const id = req.params.id
    try {
        const dataPost = await PostsModule.findById(id)
        if (!dataPost) {
            return res.status(400).json({ success: false, message: 'khong co bia viet nao' })
        }

        return res.status(200).json({ success: true, dataPost: dataPost })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'loi server' })
    }
})

////=========================================================
//Get comment post
router.get('/post-comment/:id', middlewareCntroller.verifyToken, async (req, res) => {

    const id = req.params.id
    const role = req.user.role
    const idUser = req.user.userId

    try {
        if (role == 'admin' || role == 'qa-manager') {
            const commentData = await CommentModule.find({ idPost: id })
            return res.status(200).json({ success: true, message: commentData })
        } else if (role == 'staff') {
            const dataPost = await PostsModule.findById(id)
            //check có phải chủ bài không để show full comment
            if (dataPost.UserId == idUser) {
                const commentData = await CommentModule.find({ idPost: id })
                return res.status(200).json({ success: true, message: commentData })
            } else {
                const commentData = await CommentModule.find({ $and: [{ idPost: id }, { idUser: idUser }] })
                return res.status(200).json({ success: true, message: commentData })
            }
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: 'loi server' })
    }
})

//comment Post
router.post('/post-comment/:id', middlewareCntroller.verifyToken, async (req, res) => {

    const id = req.params.id
    const idUser = req.user.userId
    const comment = req.body.comment
    const name = req.user.name

    if (!comment) {
        return res.status(401).json({ message: 'thieu noi dung binh luan' })
    }

    try {
        const commentData = await CommentModule({ comment, idUser, idPost: id, name })
        await commentData.save()

        return res.status(200).json({ success: true, message: 'comment thanh cong' })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'loi server' })
    }
})

//=========================================================
//Get vote for a post
router.get('/post-vote/:id', middlewareCntroller.verifyToken, async (req, res) => {

    const id = req.params.id
    const idUser = req.user.userId

    try {
        const VoteData = await VotesModule.find({ UserId: idUser, PostId: id })

        return res.json(VoteData)
    } catch (error) {
        return res.status(500).json({ success: false, message: 'loi server' })
    }
})

//POST vote
router.post('/post-vote/:id', middlewareCntroller.verifyToken, async (req, res) => {

    const id = req.params.id
    const idUser = req.user.userId
    const name = req.user.name

    try {
        const CheckData = await VotesModule.find({ UserId: idUser, PostId: id })

        if (CheckData.length != 0) {
            await VotesModule.findOneAndDelete({ UserId: idUser, PostId: id })
            //Trừ -1 vote
            const dataPost = await PostsModule.find({ _id: id })
            const numbervote = dataPost[0].numberVote - 1
            await PostsModule.findOneAndUpdate({ _id: id }, { numberVote: numbervote })

            return res.status(200).json({ success: true, message: 'Bạn đã hủy Vote' })
        }

        const dataVote = await VotesModule({ UserId: idUser, PostId: id, name: name })
        await dataVote.save()
        //cộng 1 vote
        const dataPost = await PostsModule.find({ _id: id })
        const numbervote = dataPost[0].numberVote + 1
        await PostsModule.findOneAndUpdate({ _id: id }, { numberVote: numbervote })

        return res.status(200).json({ success: true, message: 'vote thanh cong' })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'loi server' })
    }
})
//=========================================================
//POST views
router.post('/post-view/:id', middlewareCntroller.verifyToken, async (req, res) => {
    const id = req.params.id
    const idUser = req.user.userId
    const name = req.user.name

    try {
        const CheckData = await ViewsModule.find({ UserId: idUser, PostId: id })

        if (CheckData.length != 0) {
            return res.status(200).json({ success: true, message: 'Bạn đã view' })
        }

        const dataVote = await ViewsModule({ UserId: idUser, PostId: id, name: name })
        await dataVote.save()
        //cộng 1 view
        const dataPost = await PostsModule.find({ _id: id })
        const numbervote = dataPost[0].numberView + 1
        await PostsModule.findOneAndUpdate({ _id: id }, { numberView: numbervote })

        return res.status(200).json({ success: true, message: 'view thanh cong' })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'loi server' })
    }
})

module.exports = router