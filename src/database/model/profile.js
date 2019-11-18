const mongoose = require("mongoose")


const profileSchema = new mongoose.Schema({
    profileName: {
        type: String,
        required: false,
        default: "username"
    },
    profileImg: {
        type: String,
        require: false,
        default: "https://cloudinary.com"
    },
    gender: {
        type: String,
        require: false,
        default: "unknown"
    },
    company: {
        type: String,
        default: "Company Name"
    },
    work: {
        type: String,
        default: "Job Title"
    },
    owner: {
        type: String,
        required: true
    }

})

const profile = mongoose.model("profile", profileSchema)

module.exports = profile