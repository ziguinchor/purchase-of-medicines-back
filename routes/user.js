const router = require('express').Router()
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middlewares/auth')

const upload = multer({
    limits: {
        fileSize: 3000000 // 3 MG
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Please upload only image'))
        }
        cb(undefined, true)
    }
})


// Upload images and handle error
router.post('/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    // Change format before store it 
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

// Delete image file 
router.delete('/me/avatar', auth, async (req, res) => {
    try{
        req.user.avatar = undefined
        await req.user.save()
        res.send()

    }catch (e) {
        throw Error("You don't have an image")
    }
})

// Get image file 
router.get('/me/:id/avatar', async(req, res)=>{
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }
        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)
    }catch(e){
        res.status(404).send()
    }
})


// Carts page
router.get('/me/books', auth, async (req, res) => {
    try {
        const { id } = req.user
        const user = await User.findById(id)
        await user.populate('books')
        res.json(user.books)
    } catch (e) {
        res.status(500).json()
    }
})

router.get('/me', auth, async (req, res) => {
    res.json(req.user)
})

router.get('', async (req, res) => {
    try {
        const users = await User.find()
        res.status(200).json(users)
    } catch (e) {
        res.status(500).json(e)
    }
})

router.put('/me', auth, async (req, res) => {

    // To check if value in valid values for updates
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'phone', 'address', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).json({ error: 'error value for updates' })
    }

    const { user } = req
    try {
        updates.forEach(update => user[update] = req.body[update])
        await user.save()
        res.status(200).json(user)
    } catch (e) {
        res.status(400).json(e)
    }
})

router.delete('/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.json(req.user)
    } catch (e) {
        res.status(400).json(e)
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const {id} = req.params
        const user = User.findByIdAndRemove(id)
        await user.remove()
        res.json(req.user)
    } catch (e) {
        res.status(400).json(e)
    }
})


module.exports = router