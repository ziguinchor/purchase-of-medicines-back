const jwt = require('jsonwebtoken')
const User = require('../models/user')



const auth = async (req, res, next) => {
    try{
        const {authorization} = req.headers
        const token = authorization.replace('Bearer ', '')
        // const token = authorization.split(' ')[1]
        const decode = jwt.verify(token, 'PASSWORD_KEY') 
        const user = await User.findOne({_id: decode._id, 'tokens.token' : token},{ avatar: 0})

        // Now we can send user in the req
        req.user = user
        next()
    } catch (e) {
        res.status(401).json({error: 'pleas authenticate first.'})
    }
}

const verifyTokenAndAuthorization = (req, res, next) => {
    (req.user.id == req.params.id || user.isAdmin) ? next() : res.statis.json('You are not allowed to do that..')
}

module.exports = auth