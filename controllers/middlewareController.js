//jwt
var jwt = require('jsonwebtoken')

const middlewareCntroller = {

    //verifyToken
    verifyToken: async (req, res, next) => {
        const token = req.headers.token
        if(!token){
            return res.status(401).json({ success: false, message: "You're not authenticated"})
        }
        //Bearer
        const accessToken = token.split(" ")[1]
        jwt.verify(accessToken, process.env.ACCESSTOKEN_MK,(err, user)=>{
            if(err){
                return res.status(403).json({ success: false, message: "Token is not valid"})
            }
            req.user = user
            next()
        })      
    },

    verifyTokenAndAdminAuth: (req, res, next)=> {
        middlewareCntroller.verifyToken(req,res, ()=>{
            if(req.user.role == 'admin'){
                next()
            }
            else{
                return res.status(403).json({ success: false, message: "You're not allowed"})
            }
        })
    }
}

module.exports = middlewareCntroller