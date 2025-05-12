const validator = require("validator");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require("dotenv").config();

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true,
        validate(v) {
            if (!validator.isEmail(v)) throw new Error("Email non valide");
        },
        phone: {
            type: String,
            required: true,
            validate(v) {
                if (!validator.isLength(v, { min: 10, max: 10 })) {
                    throw new Error("Le numéro entré n'est pas correct");
                }
            }
        }
        
    },
    password: {
        type: String,
        required: true,
        validate(v) {
            if (!validator.isLength(v, { min: 4, max: 200 })) throw new Error("Mot de passe doit être entre 4 et 200 caractères");
        }
    },
    role_id: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Roles',
        re
    },
    status_id: {
         type: mongoose.Schema.Types.ObjectId, 
        ref: 'User_statuses'
     },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    deletedBy: {
        type: String,
        default: null,
    },
    deleteAt: {
        type: Date,
        default: null
    },
    updatedBy: {
        type: String,
        default: null,
    },
    updatedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    authTokens: [{
        authToken: {
            type: String,
            required: true
        }
    }]
});

userSchema.methods.generateTokenAndSaveUser = async function () {
    const authToken = jwt.sign({ _id: this._id.toString() }, process.env.secret_key);
    this.authTokens.push({ authToken });
    await this.save();
    return authToken;
}

userSchema.pre('save', async function () {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
})

const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = {
    User
}
