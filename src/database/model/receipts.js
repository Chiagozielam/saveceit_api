const mongoose = require("mongoose")


const receiptSchema = new mongoose.Schema({
    receiptName: {
        type: String,
        required: true
    },
    receiptImg: {
        type: Array,
        required: true
    },
    date: {
        type: String,
        default: Date.now(),
        require: true
    },
    owner: {
        type: String,
        required: true,
    }
})

const receipt = mongoose.model("receipt", receiptSchema)

module.exports = receipt