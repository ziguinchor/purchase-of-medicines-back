const mongoose = require('mongoose')
const Schema = mongoose.Schema
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw Error('Email not valid')
            }
        }
    },
    password: {
        type: String,
        trim: true,
        required: true,
        validate(value) {
            if (!value.toLowerCase().match()) {
                throw Error('Password not valid')
            }
        }
    },
    phone: {
        type: String,
        validate(value) {
            if (!value.toLowerCase().match()) {
                throw Error('Phone number not valid')
            }
        }
    },
    address: {
        type: String,
        trim: true,
        lowercase: true
    },
    avatar: {
        type: Buffer
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    orders: [{
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order'
        }
    }],
    favourite: [{
        book: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book'
        }
    }],
    tokens: [{
        token: {
            type: String,
            required: true,
        }
    }]
},{
    timestamps: true
})

// To make a reference between user=>book (Note: this ref not stored in database)
userSchema.virtual('books', {
    ref: 'Book',
    localField: '_id',
    foreignField: 'owners'
})

// To make a reference between user=>comment
userSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'owener'
})

// Middle ware will run before saving or updating user


// Response some data and delete hide private data 
userSchema.methods.toJSON = function ()  {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateRandomPassword = async function(length = 8){
        const randomPass = Math.random().toString(16).substr(2, length);
        const hashedPass = await bcrypt.hash(randomPass, 8)

        return hashedPass
}

userSchema.statics.checkExist = async function(email){
    try{
        const user = await User.findOne({email})
        if(!user){
            return false
        }else{
            return true
        }
    } catch (e){
        throw Error(`Can't create user`)
    }
    
}

// 1- generate token ==> methods access instance
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'PASSWORD_KEY')

    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

//2- find user by credintioals ==> statics access model 
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw Error('Unable to login')
    }

    return user
}

//3- hash password before saving
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next();
})

const User = mongoose.model('User', userSchema)

module.exports = User