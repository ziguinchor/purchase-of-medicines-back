const router = require('express').Router()
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')

const upload = multer({
    limits: {
        fileSize: 3000000 // 3 MG
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload only image'))
        }
        cb(undefined, true)
    }
})

// ************* Test ************


router.post('/register', upload.single('avatar') ,async (req, res) => {
    const user = new User(req.body)
    if(req.file){
        const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
        user.avatar = buffer
    }
    
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).json({ user, token })
    } catch (e) {
        return res.status(400).json(e)
    }
})





// router.post('/register', async (req, res) => {
//     const user = new User(req.body)
//     try {
//         await user.save()
//         const token = await user.generateAuthToken()
//         res.status(201).json({ user, token })
//     } catch (e) {
//         return res.status(400).json(e)
//     }
// })


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findByCredentials(email, password)
        const token = await user.generateAuthToken()
        res.status(200).json({ user, token })
    } catch (e) {
        res.status(400).json(e)
    }
})


router.post('/oauthsignup', async (req, res) => {
    const { name, email } = req.body
    try {
        const ifExist = await User.checkExist(email)
        if (!ifExist) {

            try {
                const newUser = await new User({ name, email, password: 'randompass' })
                // const password = await newUser.generateRandomPassword()
                const token = await newUser.generateAuthToken()
                res.json({ user: newUser, token })
            } catch (e) {
                res.status(500).json()
            }

        } else {
            try{
                const user = await User.findOne({ email })
                const token = await user.generateAuthToken()
                res.send({ user, token })
            } catch (e) {
                res.status(500).json()
            }
        }

    } catch (e) {
        res.status(500).json(`Can't create an account`)
    }

})

module.exports = router