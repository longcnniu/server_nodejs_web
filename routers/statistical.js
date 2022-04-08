const express = require('express')

var router = express.Router()
//=========================================================

//DB models
const PostsModule = require('../models/post')
const CommentModule = require('../models/comment')

router.get('/statistical/ideas', async (req, res) => {
    try {
        const dataIT = await PostsModule.find({Department: 'IT'}).count()
        const dataBU = await PostsModule.find({Department: 'Business'}).count()
        const dataDe = await PostsModule.find({Department: 'Design'}).count()
        const dataMa = await PostsModule.find({Department: 'Marketing'}).count()

        return res.status(200).json({ success: true,  dataIT, dataBU, dataDe, dataMa})
    } catch (error) {
        return res.status(500).json({ success: false, message:  'Server Error' })
    }
})

router.get('/statistical/Percent', async (req, res) => {
    try {
        const dataTo = await PostsModule.find().count()
        const dataIT = await PostsModule.find({Department: 'IT'}).count()/dataTo*100
        const dataBU = await PostsModule.find({Department: 'Business'}).count()/dataTo*100
        const dataDe = await PostsModule.find({Department: 'Design'}).count()/dataTo*100
        const dataMa = await PostsModule.find({Department: 'Marketing'}).count()/dataTo*100

        return res.status(200).json({ success: true,  dataIT, dataBU, dataDe, dataMa})
    } catch (error) {
        return res.status(500).json({ success: false, message:  'Server Error' })
    }
})

router.get('/statistical/comment', async (req, res) => {
    try {
        const dataIT = await CommentModule.find({Department: 'IT'}).count()
        const dataBU = await CommentModule.find({Department: 'Business'}).count()
        const dataDe = await CommentModule.find({Department: 'Design'}).count()
        const dataMa = await CommentModule.find({Department: 'Marketing'}).count()

        return res.status(200).json({ success: true,  dataIT, dataBU, dataDe, dataMa})
    } catch (error) {
        return res.status(500).json({ success: false, message:  'Server Error' })
    }
})

module.exports = router