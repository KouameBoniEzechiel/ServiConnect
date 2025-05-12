const validator = require("validator");
const mongoose = require("mongoose");

const user_statusesSchema = new mongoose.Schema({
    label: { type: String, required: true, unique },
    description: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    deletedBy: { type: String, default: null },
    deleteAt: { type: Date, default: null },
    updatedBy: { type: String, default: null },
    updatedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
});

const User_statuses = mongoose.models.User_statuses || mongoose.model("User_statuses", user_statusesSchema);

module.exports = {
    User_statuses
};
