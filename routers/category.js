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

    if (!title) {
        res.status(401).json({ success: false, message: 'thieu tieu de' })
    }

    try {
        const saveCategory = await CategoryModule({ title })
        await saveCategory.save()

        //all ok
        return res.status(200).json({ success: true, message: 'Save category success' })
    } catch (error) {
        return res.status(401).json({ success: false, message: 'erro server' })
    }
})

//Get All Category
router.get('/all-category', middlewareCntroller.verifyTokenAndQAAuth, async (req, res) => {

    try {
        const categorys = await CategoryModule.find()

        if (categorys == '') {
            return res.status(200).json({ message: 'Chua co category', success: false })
        }

        res.status(200).json({ dataCategorys: categorys, success: true })

    } catch (error) {
        return res.status(500).json({ success: false, message: 'loi server' + error })
    }
})

module.exports = router