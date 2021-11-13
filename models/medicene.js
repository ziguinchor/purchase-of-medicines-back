const mongoose = require('mongoose')
const Schema = mongoose.Schema

const medicneSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    description: {
        type: String,
        trim: true,
        lowercase: true,
        min: [10, 'Minimum length is 10 characters']
    },
    image: {
        type: Buffer,
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    companyName: {
        type:String
    },
    exData: {
        type: String
    }
}, {
    timestamps: true
})

const Book = mongoose.model('Book', medicneSchema)



// Response some data and delete hide private data 
medicneSchema.methods.toJSON = function ()  {
    const book = this
    const bookObject = book.toObject()

    delete bookObject.avatar
    return bookObject
}

medicneSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'bookId'
})

module.exports = Book
