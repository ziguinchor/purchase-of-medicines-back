const express = require('express')
const router = express.Router()
const multer = require('multer')
const sharp = require('sharp')
const auth = require('../middlewares/auth')
const Medicne = require('../models/medicen')
const User = require('../models/user')


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


router.post('/', upload.single('avatar'), async (req, res) => {
    const medicne = new Medicne(req.body)
    if (req.file) {
        const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
        medicne.avatar = buffer
    }

    try {
        await medicne.save()

        res.status(201).json(medicne)
    } catch (e) {
        res.status(500).json(e)
    }
})


router.get('/me', auth, async (req, res) => {
    const { _id } = req.user
    try {
        const medicnes = await Medicne.find({ 'owners.owner': _id }, { avatar: 0 })
        res.json(medicnes)
    } catch (e) {
        res.status(500).json()
    }
})

// Get Medicnes Image
router.get('/:id/avatar', async(req, res)=>{
    try{
        const medicne = await Medicne.findById(req.params.id)
        if(!medicne || !medicne.avatar){
            throw new Error()
        }
        res.set('Content-Type', 'image/jpg')
        res.send(medicne.avatar)
    }catch(e){
        res.status(404).send()
    }
})

router.get('/:id', auth, async (req, res) => {
    const { id } = req.params
    try {
        const medicne = await Medicne.findOne({ _id: id }, { avatar: 0 })
        await medicne.populate('comments')
        if (!medicne) {
            return res.status(400).json('No Medicnes found')
        }
        res.json({data: Medicne, comments:Medicne.comments})
    } catch (e) {
        res.status(500).json()
    }
})

// Edit in Medicnes 
router.put('/update/:id', auth, async (req, res) => {

    // To check if value in valid values for updates
    const updates = Object.keys(req.body)
    const allowedUpdates = ['title', 'author', 'description', 'rate', 'price', 'amount', 'description']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).json({ error: 'error value for updates' })
    }
    const { id } = req.params
    const medicne = await Medicne.findOne({ _id: id}, {avatar: 0})
    try {
        updates.forEach(update => medicne[update] = req.body[update])
        await medicne.save()
        res.status(200).json(medicne)
    } catch (e) {
        res.status(400).json(e)
    }
})

router.put('/update/admin/:id', async (req, res) => {

    // To check if value in valid values for updates
    const updates = Object.keys(req.body)
    const allowedUpdates = ['title', 'author', 'description', 'rate', 'price', 'amount', 'description']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).json({ error: 'error value for updates' })
    }
    const { id } = req.params
    const medicne = await Medicne.findOne({ _id: id}, {avatar: 0})
    try {
        updates.forEach(update => medicne[update] = req.body[update])
        await medicne.save()
        res.status(200).json(medicne)
    } catch (e) {
        res.status(400).json(e)
    }
})



router.get('',  async (req, res) => {
    try {
        // To Ignore Avatar 
        const medicnes = await Medicne.find({}, { avatar: 0 }).limit(20)
        res.json(medicnes)
    } catch (e) {
        res.status(500).json()
    }
})

module.exports = router