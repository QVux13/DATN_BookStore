const mongoose = require('mongoose')

const Schema = mongoose.Schema

const publisherSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Publisher', publisherSchema)
