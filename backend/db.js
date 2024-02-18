const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://hrafid001:Rafid.001@cluster0.i1uwuih.mongodb.net/");

const userSchema = mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String
})

const bankSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
})

const Account = mongoose.model("Account", bankSchema)
const User = mongoose.model("User", userSchema);

module.exports = {
    User,
    Account
}