const express = require('express')
const middlewareCntroller = require('../controllers/middlewareController')

var router = express.Router()


//DB models
const PostsModule = require('../models/post')
const CommentModule = require('../models/comment')
const VotesModule = require('../models/vote')
const ViewsModule = require('../models/view')
const nodemailer = require("nodemailer");
const AccountModel = require('../models/account')

//=========================================================
router.get('/', middlewareCntroller.verifyToken, (req, res, next) => {
    return res.status(200).json({success: true, role: req.user.role, UserId: req.user.userId})
})

//=========================================================
//get Post kiểm tra
router.get('/post', middlewareCntroller.verifyToken, (req, res) => {
    return res.status(200).json({success: true, role: req.user.role})
})


//get  Post page
router.get('/posts', middlewareCntroller.verifyToken, async (req, res) => {
    const page_size = req.query.page_size
    const page = req.query.page

    if (page && page > 0 && page_size != undefined) {
        try {
            var skipPost = (parseInt(page) - 1) * parseInt(page_size)

            const dataPost = await PostsModule.find().skip(skipPost).limit(page_size)

            if (!dataPost) {
                return res.status(400).json({success: false, message: 'khong co bia viet nao'})
            }

            return res.status(200).json({success: true, dataPost: dataPost})
        } catch (error) {
            return res.status(500).json({success: false, message: 'loi server ' + error})
        }
    } else if (page && page > 0 && page_size == undefined) {
        try {
            var skipPost = (parseInt(page) - 1) * parseInt(5)

            const dataPost = await PostsModule.find().skip(skipPost).limit(5)

            if (!dataPost) {
                return res.status(400).json({success: false, message: 'khong co bia viet nao'})
            }

            return res.status(200).json({success: true, dataPost: dataPost})
        } catch (error) {
            return res.status(500).json({success: false, message: 'loi server ' + error})
        }
    } else {
        try {
            const page = 1
            var skipPost = (page - 1) * 5

            const dataPost = await PostsModule.find().skip(skipPost).limit(5)

            if (!dataPost) {
                return res.status(400).json({success: false, message: 'khong co bia viet nao'})
            }

            return res.status(200).json({success: true, dataPost: dataPost})
        } catch (error) {
            return res.status(500).json({success: false, message: 'loi server ' + error})
        }
    }
})

//get all post
router.get('/all-posts', middlewareCntroller.verifyToken, async (req, res) => {
    try {
        const dataPost = await PostsModule.find()

        if (!dataPost) {
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
    const email = req.user.email
    const {title, content, category} = req.body

    if (!title || !content) {
        return res.status(401).json({success: false, message: 'thieu tieu de va noi dung'})
    }

    try {
        const savePost = await PostsModule({UserId, name, title, content, category})
        await savePost.save()

        const data = await AccountModel.find({ role: ['admin', 'qa-manager'] })

        for (let i = 0; i < data.length; i++) {
            //send email
            var user = process.env.EMAIL;
            var pass = process.env.PASS;
            var EmaiTo = data[i].email;

            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: user,
                    pass: pass
                }
            });

            var mailOptions = {
                from: user,
                to: EmaiTo,
                subject: 'Sending Email using Node.js',
                html: `Thông báo có bài đăng mới từ Name: ${name} | Email: ${email}`
            }

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    return res.status(200).json({ success: true, message: 'send Email successfully' })
                }
            });
        }

        return res.status(200).json({success: true, message: 'Created Post successfully'})
    } catch (error) {
        return res.status(500).json({success: true, message: 'loi server'})
    }

})

//put bai
router.put('/post/:id', middlewareCntroller.verifyToken, async (req, res) => {
    const id = req.params.id
    const UserId = req.user.userId
    const name = req.user.name
    const {title, content, category} = req.body

    if (!title || !content) {
        return res.status(401).json({success: false, message: 'thieu tieu de va noi dung'})
    }

    try {
        const findPost = await PostsModule.findById(id)

        if (!findPost) {
            return res.status(400).json({success: false, message: 'Không tìm thấy bài viết'})
        }

        if (findPost.UserId !== UserId) {
            return res.status(400).json({success: false, message: 'Không có quyền Updata'})
        }

        const updataPost = await PostsModule.findByIdAndUpdate({_id: id}, {UserId, name, title, content, category})

        if (!updataPost) {
            return res.status(400).json({success: false, message: 'Updata Post error'})
        }

        return res.status(200).json({success: true, message: 'Updata Post successfully'})
    } catch (error) {
        return res.status(500).json({success: true, message: 'loi server'})
    }
})

//Del bai
router.delete('/post/:id', middlewareCntroller.verifyToken, async (req, res) => {
    const id = req.params.id
    const role = req.user.role
    const idUser = req.user.userId

    try {

        const data = await PostsModule.findById(id)

        if (!data) {
            return res.status(400).json({success: false, message: 'Bai viet khong ton tai'})
        }

        if (idUser === data.UserId || role === 'admin' || role === 'qa-manager') {
            await PostsModule.findByIdAndDelete(id)

            //Del Vote cua bai Post
            await VotesModule.deleteMany({PostId: id})
            //Del View cua bai Post
            await ViewsModule.deleteMany({PostId: id})
            //Del Comment cua bai Post
            await CommentModule.deleteMany({idPost: id});
            //all good
            return res.status(200).json({success: true, message: 'xoa thanh cong'})
        }

        return res.status(400).json({success: false, message: 'Bạn không đủ quyền để xóa'})

    } catch (error) {
        return res.status(500).json({success: false, message: 'loi server'})
    }
})

//Xem chi tiết Post
router.get('/post/:id', middlewareCntroller.verifyToken, async (req, res) => {
    const id = req.params.id
    try {
        const dataPost = await PostsModule.findById(id)
        if (!dataPost) {
            return res.status(400).json({success: false, message: 'khong co bia viet nao'})
        }

        return res.status(200).json({success: true, dataPost: dataPost})
    } catch (error) {
        return res.status(500).json({success: false, message: 'loi server'})
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
            const commentData = await CommentModule.find({idPost: id})
            return res.status(200).json({success: true, message: commentData})
        } else if (role == 'staff') {
            const dataPost = await PostsModule.findById(id)
            //check có phải chủ bài không để show full comment
            if (dataPost.UserId == idUser) {
                const commentData = await CommentModule.find({idPost: id})
                return res.status(200).json({success: true, message: commentData})
            } else {
                const commentData = await CommentModule.find({$and: [{idPost: id}, {idUser: idUser}]})
                return res.status(200).json({success: true, message: commentData})
            }
        }
    } catch (error) {
        return res.status(500).json({success: false, message: 'loi server'})
    }
})

//comment Post
router.post('/post-comment/:id', middlewareCntroller.verifyToken, async (req, res) => {

    const id = req.params.id
    const idUser = req.user.userId
    const comment = req.body.comment
    const name = req.user.name
    const email = req.user.email

    if (!comment) {
        return res.status(401).json({message: 'thieu noi dung binh luan'})
    }

    try {
        const commentData = await CommentModule({comment, idUser, idPost: id, name})
        await commentData.save()

        //Tra Chu bai Post
        const dataPost = await PostsModule.findById(id)
        const dataUser = await AccountModel.findById(dataPost.UserId)
        //send email
        var user = process.env.EMAIL;
        var pass = process.env.PASS;
        var EmaiTo = dataUser.email;

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: user,
                pass: pass
            }
        });

        var mailOptions = {
            from: user,
            to: EmaiTo,
            subject: 'Sending Email using Node.js',
            html: `Thông báo bài đăng có người bình luật từ Name: ${name}| Email: ${email} | nội dung là: ${comment}`
        }

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                return res.status(200).json({ success: true, message: 'send Email successfully' })
            }
        });

        return res.status(200).json({success: true, message: 'comment thanh cong'})
    } catch (error) {
        return res.status(500).json({success: false, message: 'loi server'})
    }
})

//Del Comment
router.delete('/del-comment/:id', middlewareCntroller.verifyToken, async (req, res) => {
    const id = req.params.id
    const idUser = req.user.userId

    try {
        const findComment = await CommentModule.findOne({_id: id})

        if (!findComment) {
            return res.status(401).json({success: false, message: 'comment khong ton tai'})
        }

        if (idUser !== findComment.idUser) {
            return res.status(401).json({success: false, message: 'comment nay khong so huu'})
        }

        //Del comment
        await CommentModule.findByIdAndDelete(id)

        return res.status(200).json({success: true, message: 'del comment success'})
    } catch (error) {

    }
})

//=========================================================
//Get vote for a post
router.get('/post-vote/:id', middlewareCntroller.verifyToken, async (req, res) => {

    const id = req.params.id
    const idUser = req.user.userId

    try {
        const VoteData = await VotesModule.find({UserId: idUser, PostId: id})

        return res.json(VoteData)
    } catch (error) {
        return res.status(500).json({success: false, message: 'loi server'})
    }
})

//POST vote
router.post('/post-vote/:id', middlewareCntroller.verifyToken, async (req, res) => {

    const id = req.params.id
    const idUser = req.user.userId
    const name = req.user.name

    try {
        const CheckData = await VotesModule.find({UserId: idUser, PostId: id})

        if (CheckData.length != 0) {
            await VotesModule.findOneAndDelete({UserId: idUser, PostId: id})
            //Trừ -1 vote
            const dataPost = await PostsModule.find({_id: id})
            const numbervote = dataPost[0].numberVote - 1
            await PostsModule.findOneAndUpdate({_id: id}, {numberVote: numbervote})

            return res.status(200).json({success: true, message: 'Bạn đã hủy Vote'})
        }

        const dataVote = await VotesModule({UserId: idUser, PostId: id, name: name})
        await dataVote.save()
        //cộng 1 vote
        const dataPost = await PostsModule.find({_id: id})
        const numbervote = dataPost[0].numberVote + 1
        await PostsModule.findOneAndUpdate({_id: id}, {numberVote: numbervote})

        return res.status(200).json({success: true, message: 'vote thanh cong'})
    } catch (error) {
        return res.status(500).json({success: false, message: 'loi server'})
    }
})
//=========================================================
//POST views
router.post('/post-view/:id', middlewareCntroller.verifyToken, async (req, res) => {
    const id = req.params.id
    const idUser = req.user.userId
    const name = req.user.name

    try {
        const CheckData = await ViewsModule.find({UserId: idUser, PostId: id})

        if (CheckData.length != 0) {
            return res.status(200).json({success: true, message: 'Bạn đã view'})
        }

        const dataVote = await ViewsModule({UserId: idUser, PostId: id, name: name})
        await dataVote.save()
        //cộng 1 view
        const dataPost = await PostsModule.find({_id: id})
        const numbervote = dataPost[0].numberView + 1
        await PostsModule.findOneAndUpdate({_id: id}, {numberView: numbervote})

        return res.status(200).json({success: true, message: 'view thanh cong'})
    } catch (error) {
        return res.status(500).json({success: false, message: 'loi server'})
    }
})

module.exports = router