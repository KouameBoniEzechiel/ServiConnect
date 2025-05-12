const validator = require("validator");
const mongoose = require("mongoose");

const providers_statusesSchema = new mongoose.Schema({
    name: { type: String, required: true },
    label: { type: String, required: true },
    description: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    deletedBy: { type: String, default: null },
    deleteAt: { type: Date, default: null },
    updatedBy: { type: String, default: null },
    updatedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
});

const Providers_statuses = mongoose.models.Providers_statuses || mongoose.model("Providers_statuses", providers_statusesSchema);

module.exports = {
    Providers_statuses
};
