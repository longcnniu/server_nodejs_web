//DB models
const CategoryModule = require('../models/category')
const PostsModule = require('../models/post')

const arrayEndDate = []
const arrayEndDateTitile = []

const myTimeout = setInterval(function () {
    checkEnddate()
    checkLockDate()
}, 60000);

const checkEnddate = async () => {
    const d = new Date()
    const UTCnow = d.getUTCFullYear() + '-' + ("0" + (d.getUTCMonth() + 1)).slice(-2) + '-' + ("0" + (d.getUTCDate())).slice(-2) + 'T' + ("0" + (d.getUTCHours())).slice(-2) + ':' + ("0" + (d.getUTCMinutes())).slice(-2)

    try {
        const dataEndDate = await CategoryModule.find({ $and: [{ endDate: { $gte: UTCnow }, ischeckEndDate: false }] }).sort({ endDate: 1 })

        if (dataEndDate.length != 0) {
            //Get endDate

            arrayEndDate.length = 0
            dataEndDate.map(data => {
                const dd = new Date(data.endDate)
                const UTCendDate = dd.getUTCFullYear() + '-' + ("0" + (dd.getUTCMonth() + 1)).slice(-2) + '-' + ("0" + (dd.getUTCDate())).slice(-2) + 'T' + ("0" + (dd.getUTCHours())).slice(-2) + ':' + ("0" + (dd.getUTCMinutes())).slice(-2)
                //sau khi formart xong date 
                arrayEndDate.push(UTCendDate)
                arrayEndDateTitile.push(data.title)
            })

            for (let index = 0; index < arrayEndDate.length; index++) {
                if (arrayEndDate[index] <= UTCnow) {
                    //Nếu đúng endDate in Post thành false => true
                    await PostsModule.find({ category: arrayEndDateTitile[index] }).updateMany({ endTime1: true })
                    await CategoryModule.find({ title: arrayEndDateTitile[index] }).updateOne({ ischeckEndDate: true })
                }
            }
        }
    } catch (error) {
        console.log('500 loi he thong check Time');
    }
}

const checkLockDate = async () => {
    const arrayLockDate = []
    const arrayLockDateTitle = []

    const d = new Date()
    const UTCnow = d.getUTCFullYear() + '-' + ("0" + (d.getUTCMonth() + 1)).slice(-2) + '-' + ("0" + (d.getUTCDate())).slice(-2) + 'T' + ("0" + (d.getUTCHours())).slice(-2) + ':' + ("0" + (d.getUTCMinutes())).slice(-2)

    try {
        const dataLockDate = await CategoryModule.find({ $and: [{ lockDate: { $gte: UTCnow }, ischecklLockDate: false }] }).sort({ lockDate: 1 })

        if (dataLockDate != 0) {
            //get lockDate
            arrayLockDate.length = 0
            dataLockDate.map(data => {
                const ddd = new Date(data.lockDate)
                const UTClockDate = ddd.getUTCFullYear() + '-' + ("0" + (ddd.getUTCMonth() + 1)).slice(-2) + '-' + ("0" + (ddd.getUTCDate())).slice(-2) + 'T' + ("0" + (ddd.getUTCHours())).slice(-2) + ':' + ("0" + (ddd.getUTCMinutes())).slice(-2)
                arrayLockDate.push(UTClockDate)
                arrayLockDateTitle.push(data.title)
            })

            for (let index = 0; index < arrayLockDate.length; index++) {
                if (arrayLockDate[index] <= UTCnow) {
                    //Nếu đúng endDate in Post thành false => true
                    await PostsModule.find({ category: arrayLockDateTitle[index] }).updateMany({ lockPost: true })
                    await CategoryModule.find({ title: arrayEndDateTitile[index] }).updateOne({ ischecklLockDate: true })
                }
            }
        }
    } catch (error) {

    }
}
