const express = require('express')
const middlewareCntroller = require('../controllers/middlewareController')

var router = express.Router()

//DB models
const CategoryModule = require('../models/category')

//=========================================================
router.get('/category', middlewareCntroller.verifyTokenAndQAAuth, (req, res) => {
    return res.status(200).json({ success: true, role: req.user.role })
})

//category Post
router.post('/category', middlewareCntroller.verifyTokenAndQAAuth, async (req, res) => {
    const title = req.body.title
    const endDate = req.body.endDate
    const lockDate = req.body.lockDate

    if (!title || !endDate || !lockDate) {
        res.status(401).json({ success: false, message: 'Missing title or expired day' })
    }

    try {
        //check ex in db
        const category = await CategoryModule.findOne({title: title})
        if(category) {
            return res.status(401).json({ success: false, message: 'Category already exist' })
        }

        const saveCategory = await CategoryModule({ title, endDate, lockDate })
        await saveCategory.save()

        //all ok
        return res.status(200).json({ success: true, message: 'Save category success '+endDate })
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Server error' })
    }
})

//Get All Category
router.get('/all-category', middlewareCntroller.verifyTokenAndQAAuth, async (req, res) => {

    try {
        const categorys = await CategoryModule.find()

        if (categorys == '') {
            return res.status(200).json({ message: 'No Category yet', success: false })
        }

        res.status(200).json({ dataCategorys: categorys, success: true })

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' + error })
    }
})

//Get All Catrgory còn hạn
router.get('/all-category/exp', middlewareCntroller.verifyToken, async (req, res) => {

    try {
        const categorys = await CategoryModule.find({endDate: {$gt: Date.now()}})

        if (categorys == '') {
            return res.status(200).json({ message: 'Category does not exist', success: false })
        }

        res.status(200).json({ dataCategorys: categorys, success: true })

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error server' + error })
    }
})

//Get one category
router.get('/category/:id', middlewareCntroller.verifyTokenAndQAAuth,async (req, res) => {
    const id = req.params.id
  
    try {
        const data = await CategoryModule.findById({ _id: id })
  
        if (!data) {
            return res.status(401).json({ success: false, message: 'Category does not exist' })
        }
  
        return res.status(200).json({ success: true, data})
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' + error })
    }
  
  })

//Edit Category
router.put('/category/:id', middlewareCntroller.verifyTokenAndQAAuth, async (req, res) => {
    const id = req.params.id
    const title = req.body.title
    const endDate = req.body.endDate
    const lockDate = req.body.lockDate
    try {
        const data = await CategoryModule.findByIdAndUpdate({ _id: `${id}` }, {title, endDate, lockDate})
  
        if (!data) {
            return res.status(401).json({ success: false, message: 'Account does not exist' })
        }
  
        return res.status(200).json({ success: true, message: 'Update Successfull' })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' + error })
    }
  })

// Del Category
router.delete('/category/:id', middlewareCntroller.verifyTokenAndQAAuth, async (req, res) => {
    const id = req.params.id
    try {
        const data = await CategoryModule.findByIdAndDelete({ _id: `${id}` })

        if (!data) {
            return res.status(401).json({ success: false, message: 'Category does not exist' })
        }

        return res.status(200).json({ success: true, message: 'Delete' })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' + error })
    }
})

module.exports = router