const mongoose = require("mongoose")


const profileSchema = new mongoose.Schema({
    profileName: {
        type: String,
        required: true
    },
    profileImg: {
        type: String,
        require: true
    },
    gender: {
        type: String,
        require: false
    },
    company: {
        type: String
    },
    work: {
        type: String
    },

})

const profile = mongoose.model("profile", profileSchema)

module.exports = profile