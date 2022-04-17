const express = require('express')
const middlewareCntroller = require('../controllers/middlewareController')
var path = require('path');
const fs = require('fs')

//Multre
const multer = require('multer')
// const upload = multer()

var router = express.Router()

//DB models
const PostsModule = require('../models/post')
const CommentModule = require('../models/comment')
const VotesModule = require('../models/vote')
const ViewsModule = require('../models/view')
const nodemailer = require("nodemailer");
const AccountModel = require('../models/account');
const DisLikeModule = require('../models/Dislike');
//=========================================================

//Upload File
const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./imges")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "--" + file.originalname)
    }
})

const upload = multer({ storage: fileStorageEngine })

// router.post('/upload-img', upload.single('image'), async (req, res) => {
//     // console.log(req.file.filename);
//     const NameImg = req.file.filename
//     const { title, content, category } = req.body

//     try {
//         const savePost = await PostsModule({title, content, category, NameImg })
//         await savePost.save()

//         return res.status(200).json({message: 'Create Success'})
//     } catch (error) {
//         return res.status(502).json({ message: 'Error Server' })
//     }
// })

router.get('/get-img', (req, res) => {
    const nameImg = req.query.nameImg
    res.sendFile(path.resolve(path.resolve(__dirname, '../imges/' + nameImg)));
})

router.delete('/del-img', async (req, res) => {
    const nameImg = req.body.nameImg
    let reqPath = path.join(__dirname, `../imges/${nameImg}`)

    if (reqPath === null) {
        return res.status(400).json({ message: 'Not found' })
    }

    try {
        await fs.unlinkSync(reqPath)
        //file removed
        res.json({ message: 'ok' })
    } catch (err) {
        console.error(err)
    }
})

//=========================================================
router.get('/', middlewareCntroller.verifyToken, (req, res) => {
    return res.status(200).json({ success: true, role: req.user.role, UserId: req.user.userId })
})

//=========================================================
//get Post kiểm tra
router.get('/post', middlewareCntroller.verifyToken, (req, res) => {
    return res.status(200).json({ success: true, role: req.user.role })
})


//get  Post page
router.get('/posts', middlewareCntroller.verifyToken, async (req, res) => {
    const page_size = req.query.page_size
    const page = req.query.page
    const sort = req.query.sort
    const sortty = req.query.sortty

    if (page && page > 0 && page_size != undefined) {
        try {
            var skipPost = (parseInt(page) - 1) * parseInt(page_size)

            const dataPost = await PostsModule.find({ isReview: true }).skip(skipPost).limit(page_size).sort({ [sort]: sortty })

            if (!dataPost) {
                return res.status(400).json({ success: false, message: 'There are no posts yet' })
            }

            return res.status(200).json({ success: true, dataPost: dataPost })
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Server Error ' + error })
        }
    } else if (page && page > 0 && page_size == undefined) {
        try {
            var skipPost = (parseInt(page) - 1) * parseInt(5)

            const dataPost = await PostsModule.find({ isReview: true }).skip(skipPost).limit(5).sort({ [sort]: sortty })

            if (!dataPost) {
                return res.status(400).json({ success: false, message: 'There are no posts yet' })
            }

            return res.status(200).json({ success: true, dataPost: dataPost })
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Server Error ' + error })
        }
    } else {
        try {
            const page = 1
            var skipPost = (page - 1) * 5

            const dataPost = await PostsModule.find({ isReview: true }).skip(skipPost).limit(5).sort({ [sort]: sortty })

            if (!dataPost) {
                return res.status(400).json({ success: false, message: 'There are no posts yet' })
            }

            return res.status(200).json({ success: true, dataPost: dataPost })
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Server Error ' + error })
        }
    }
})

//get  Post page chưa kiểm duyệt
router.get('/posts-review', middlewareCntroller.verifyToken, async (req, res) => {
    const page_size = req.query.page_size
    const page = req.query.page
    const sort = req.query.sort
    const sortty = req.query.sortty

    if (page && page > 0 && page_size != undefined) {
        try {
            var skipPost = (parseInt(page) - 1) * parseInt(page_size)

            const dataPost = await PostsModule.find({ isReview: false }).skip(skipPost).limit(page_size).sort({ [sort]: sortty })

            if (!dataPost) {
                return res.status(400).json({ success: false, message: 'There are no posts yet' })
            }

            return res.status(200).json({ success: true, dataPost: dataPost })
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Server Error ' + error })
        }
    } else if (page && page > 0 && page_size == undefined) {
        try {
            var skipPost = (parseInt(page) - 1) * parseInt(5)

            const dataPost = await PostsModule.find({ isReview: false }).skip(skipPost).limit(5).sort({ [sort]: sortty })

            if (!dataPost) {
                return res.status(400).json({ success: false, message: 'There are no posts yet' })
            }

            return res.status(200).json({ success: true, dataPost: dataPost })
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Server Error ' + error })
        }
    } else {
        try {
            const page = 1
            var skipPost = (page - 1) * 5

            const dataPost = await PostsModule.find({ isReview: false }).skip(skipPost).limit(5).sort({ [sort]: sortty })

            if (!dataPost) {
                return res.status(400).json({ success: false, message: 'There are no posts yet' })
            }

            return res.status(200).json({ success: true, dataPost: dataPost })
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Server Error ' + error })
        }
    }
})

//Xác nhận chấp nhận cho Post lên
router.put('/posts-approve', middlewareCntroller.verifyToken, async (req, res) => {
    const id = req.query.id

    try {
        const data = await PostsModule.findByIdAndUpdate({ _id: id }, { isReview: true })

        if (!data) {
            return res.status(401).json({ success: false, message: 'Update failed' })
        }

        res.status(200).json({ success: true, message: 'Update successful' })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error ' + error })
    }
})

//get all post
router.get('/all-posts', middlewareCntroller.verifyToken, async (req, res) => {
    try {
        const dataPost = await PostsModule.find()

        if (!dataPost) {
            return res.status(400).json({ success: false, message: 'There are no posts yet' })
        }

        return res.status(200).json({ success: true, dataPost: dataPost })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error' })
    }
})

//post bai
router.post('/post', upload.single('image'), middlewareCntroller.verifyTokenAndStaffAuth, async (req, res) => {
    const UserId = req.user.userId
    const name = req.user.name
    const Department = req.user.department
    const email = req.user.email
    const { title, content, category } = req.body
    const NameImg = req.file



    if (!title || !content) {
        return res.status(401).json({ success: false, message: 'Missing title and content' })
    }

    try {
        if (NameImg === undefined) {
            const savePost = await PostsModule({ UserId, name, title, content, category, NameImg: 'null', Department })
            await savePost.save()
        } else {
            const TyFile = NameImg.mimetype.split('/')[0];
            const savePost = await PostsModule({ UserId, name, title, content, category, NameImg: NameImg.filename, TyFile, Department })
            await savePost.save()
        }

        // const data = await AccountModel.find({ role: ['admin', 'qa-manager'] })

        // for (let i = 0; i < data.length; i++) {
        //     //send email
        //     var user = process.env.EMAIL;
        //     var pass = process.env.PASS;
        //     var EmaiTo = data[i].email;

        //     var transporter = nodemailer.createTransport({
        //         service: 'gmail',
        //         auth: {
        //             user: user,
        //             pass: pass
        //         }
        //     });

        //     var mailOptions = {
        //         from: user,
        //         to: EmaiTo,
        //         subject: 'Sending Email using Node.js',
        //         html: `Thông báo có bài đăng mới từ Name: ${name} | Email: ${email}`
        //     }

        //     transporter.sendMail(mailOptions, function (error, info) {
        //         if (error) {
        //             console.log(error);
        //         } else {
        //             return res.status(200).json({ success: true, message: 'send Email successfully' })
        //         }
        //     });
        // }

        return res.status(200).json({ success: true, message: 'Created Post successfully' })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error' })
    }
})

//put bai
router.put('/post/:id', upload.single('image'), middlewareCntroller.verifyToken, async (req, res) => {
    const id = req.params.id
    const UserId = req.user.userId
    const name = req.user.name
    const Department = req.user.department
    const email = req.user.email
    const { title, content, category } = req.body
    const NameImg = req.file

    if (!title || !content) {
        return res.status(401).json({ success: false, message: 'Missing title and content' })
    }

    try {
        if (NameImg === undefined) {
            await PostsModule.findOneAndUpdate({ _id: id }, { UserId, name, title, content, category, NameImg: 'null', Department, isReview:false})
        } else {
            const TyFile = NameImg.mimetype.split('/')[0];
            await PostsModule.findOneAndUpdate({ _id: id }, { UserId, name, title, content, category, NameImg: NameImg.filename, TyFile, Department, isReview:false})
        }

        return res.status(200).json({ success: true, message: 'The post has been updated, and will come to approve page pls wait'})
    } catch (error) {
        return res.status(500).json({ success: true, message: 'Server Error' })
    }
})
//

//Del bai
router.delete('/post/:id', middlewareCntroller.verifyToken, async (req, res) => {
    const id = req.params.id
    const role = req.user.role
    const idUser = req.user.userId

    try {

        const data = await PostsModule.findById(id)

        if (!data) {
            return res.status(400).json({ success: false, message: 'The article does not exist' })
        }

        if (idUser === data.UserId || role === 'admin' || role === 'qa-manager') {
            await PostsModule.findByIdAndDelete(id)
            //Del Like cua bai Post
            await VotesModule.deleteMany({ PostId: id })
            //Del Dislike cua Post
            await DisLikeModule.deleteMany({ PostId: id })
            //Del View cua bai Post
            await ViewsModule.deleteMany({ PostId: id })
            //Del Comment cua bai Post
            await CommentModule.deleteMany({ idPost: id });
            //all good
            return res.status(200).json({ success: true, message: 'Delete successfully' })
        }

        return res.status(400).json({ success: false, message: 'You are not authorized to delete' })

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error' })
    }
})

//Xem chi tiết Post
router.get('/post/:id', middlewareCntroller.verifyToken, async (req, res) => {
    const id = req.params.id
    try {
        const dataPost = await PostsModule.findById(id)
        if (!dataPost) {
            return res.status(400).json({ success: false, message: 'There are no posts yet' })
        }

        return res.status(200).json({ success: true, dataPost: dataPost })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error' })
    }
})

//Get Post theo category
router.get('/post-category', async (req, res) => {
    const category = req.query.category

    try {
        const data = await PostsModule.find({ category: category }, {
            "_id": 0, 'UserId': 0, "lockPost": 0,
            "endTime1": 0, "TyFile": 0, '__v': 0
        })

        return res.status(200).json({ success: true, data: data })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error' })
    }
})

////=========================================================
//Get comment post
router.get('/post-comment/:id', middlewareCntroller.verifyToken, async (req, res) => {

    const id = req.params.id
    const role = req.user.role
    const idUser = req.user.userId

    try {
        // if (role == 'admin' || role == 'qa-manager') {
        //     const commentData = await CommentModule.find({ idPost: id })
        //     return res.status(200).json({ success: true, message: commentData })
        // } else if (role == 'staff') {
        //     const dataPost = await PostsModule.findById(id)
        //     //check có phải chủ bài không để show full comment
        //     if (dataPost.UserId == idUser) {
        //         const commentData = await CommentModule.find({ idPost: id })
        //         return res.status(200).json({ success: true, message: commentData })
        //     } else {
        //         const commentData = await CommentModule.find({ $and: [{ idPost: id }, { idUser: idUser }] })
        //         return res.status(200).json({ success: true, message: commentData })
        //     }
        // }

        const commentData = await CommentModule.find({ idPost: id })
        return res.status(200).json({ success: true, message: commentData })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error' })
    }
})

router.get('/post-comment-my/:id', middlewareCntroller.verifyToken, async (req, res) => {

    const id = req.params.id
    const role = req.user.role
    const idUser = req.user.userId

    try {
        const commentData = await CommentModule.find({ $and: [{ idPost: id }, { idUser: idUser }] })
        return res.status(200).json({ success: true, message: commentData })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error' })
    }
})

//comment Post
router.post('/post-comment/:id', middlewareCntroller.verifyToken, async (req, res) => {

    const id = req.params.id
    const idUser = req.user.userId
    const comment = req.body.comment
    const Department = req.user.department
    const name = req.user.name
    const email = req.user.email

    if (!comment) {
        return res.status(401).json({ message: 'Comments are missing' })
    }

    try {
        const commentData = await CommentModule({ comment, idUser, idPost: id, name, Department })
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
                user: user, // my mail
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

        return res.status(200).json({ success: true, message: 'Successful comment' })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error' })
    }
})

//Get one Comment


//Put Comment
router.put('/updata-comment/:id', middlewareCntroller.verifyToken, async (req, res) => {
    const id = req.params.id
    const comment = req.body.comment

    try {
        const findComment = await CommentModule.findByIdAndUpdate({ _id: id }, { comment: comment })

        if (!findComment) {
            return res.status(402).json({ success: false, message: 'Comment does not exist' })
        }

        return res.status(200).json({ success: true, message: 'Update successful' })

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error' })
    }
})

//Del Comment
router.delete('/del-comment/:id', middlewareCntroller.verifyToken, async (req, res) => {
    const id = req.params.id
    const idUser = req.user.userId
    const role = req.user.role

    try {
        const findComment = await CommentModule.findOne({ _id: id })

        if (!findComment) {
            return res.status(401).json({ success: false, message: 'Comment does not exist' })
        }

        // if (idUser !== findComment.idUser) {
        //     return res.status(401).json({ success: false, message: 'comment nay khong so huu' })
        // }

        //Del comment
        await CommentModule.findByIdAndDelete(id)

        return res.status(200).json({ success: true, message: 'Comment deleted successfully' })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error' })
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
        return res.status(500).json({ success: false, message: 'Server Error' })
    }
})

//POST Like
router.post('/post-Like/:id', middlewareCntroller.verifyToken, async (req, res) => {

    const id = req.params.id
    const idUser = req.user.userId
    const name = req.user.name

    try {
        const CheckDataLike = await VotesModule.find({ UserId: idUser, PostId: id })
        const CheckDataDisLike = await DisLikeModule.find({ UserId: idUser, PostId: id })

        if (CheckDataLike.length != 0) {
            await VotesModule.findOneAndDelete({ UserId: idUser, PostId: id })
            //Trừ -1 vote
            const dataPost = await PostsModule.find({ _id: id })
            const Like = dataPost[0].Like - 1
            await PostsModule.findOneAndUpdate({ _id: id }, { Like: Like })

            return res.status(200).json({ success: true, message: 'You canceled Like' })
        }

        if (CheckDataDisLike.length != 0) {
            //Huy DisLike để chuyển Sang Like
            await DisLikeModule.findOneAndDelete({ UserId: idUser, PostId: id })
            //Trừ -1 Dislike
            const dataPost = await PostsModule.find({ _id: id })
            const DisLike = dataPost[0].DisLike - 1
            await PostsModule.findOneAndUpdate({ _id: id }, { DisLike: DisLike })
        }

        const dataVote = await VotesModule({ UserId: idUser, PostId: id, name: name })
        await dataVote.save()
        //cộng 1 vote
        const dataPost = await PostsModule.find({ _id: id })
        const Like = dataPost[0].Like + 1
        await PostsModule.findOneAndUpdate({ _id: id }, { Like: Like })

        return res.status(200).json({ success: true, message: 'Like successfully' })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error' })
    }
})

//click Dislick
router.post('/post-DisLike/:id', middlewareCntroller.verifyToken, async (req, res) => {
    const id = req.params.id
    const idUser = req.user.userId
    const name = req.user.name

    try {

        const CheckDataDisLike = await DisLikeModule.find({ UserId: idUser, PostId: id })
        const CheckDataLike = await VotesModule.find({ UserId: idUser, PostId: id })

        if (CheckDataDisLike.length != 0) {
            await DisLikeModule.findOneAndDelete({ UserId: idUser, PostId: id })
            //Trừ -1 Dislike
            const dataPost = await PostsModule.find({ _id: id })
            const DisLike = dataPost[0].DisLike - 1
            await PostsModule.findOneAndUpdate({ _id: id }, { DisLike: DisLike })

            return res.status(200).json({ success: true, message: 'You canceled Dislike' })
        }

        if (CheckDataLike.length != 0) {
            //hủy like chuyển thành Dislike
            await VotesModule.findOneAndDelete({ UserId: idUser, PostId: id })
            //Trừ -1 vote
            const dataPost = await PostsModule.find({ _id: id })
            const Like = dataPost[0].Like - 1
            await PostsModule.findOneAndUpdate({ _id: id }, { Like: Like })

        }

        const dataDisLike = await DisLikeModule({ UserId: idUser, PostId: id, name: name })
        await dataDisLike.save()
        //cộng 1 DisLike
        const dataPost = await PostsModule.find({ _id: id })
        const DisLike = dataPost[0].DisLike + 1
        await PostsModule.findOneAndUpdate({ _id: id }, { DisLike: DisLike })

        return res.status(200).json({ success: true, message: 'Dislike curved bar' })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error' })
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
            return res.status(200).json({ success: true, message: 'You have viewed' })
        }

        const dataVote = await ViewsModule({ UserId: idUser, PostId: id, name: name })
        await dataVote.save()
        //cộng 1 view
        const dataPost = await PostsModule.find({ _id: id })
        const numbervote = dataPost[0].numberView + 1
        await PostsModule.findOneAndUpdate({ _id: id }, { numberView: numbervote })

        return res.status(200).json({ success: true, message: 'successful view' })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error' })
    }
})

module.exports = router