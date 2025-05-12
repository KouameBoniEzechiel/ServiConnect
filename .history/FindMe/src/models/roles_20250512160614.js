const validator = require("validator");
const mongoose = require("mongoose");

const rolesSchema = new mongoose.Schema({
    label: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    deletedBy: { type: String, default: null },
    deleteAt: { type: Date, default: null },
    updatedBy: { type: String, default: null },
    updatedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
});

const Roles = mongoose.models.Roles || mongoose.model("Roles", rolesSchema);

module.exports = {
    Roles
};
