const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: [true, "This username is already registered!"],
        required: true,
    },

    email: {
        type: String,
        unique: [true, "An account with this email already exists!"],
        required: true,
    },

    password: {
        type: String,
        required: true
    }
});

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
