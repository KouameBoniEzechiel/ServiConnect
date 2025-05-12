const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    isDeleted: { type: Boolean, default: false },
    authTokens: [{ authToken: String }],
}, { timestamps: true });

userSchema.methods.generateTokenAndSaveUser = async function () {
    const token = jwt.sign({ _id: this._id.toString() }, "secretkey");
    this.authTokens.push({ authToken: token });
    await this.save();
    return token;
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = { User };
