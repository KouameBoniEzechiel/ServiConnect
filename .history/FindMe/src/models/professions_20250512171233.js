const validator = require("validator");
const mongoose = require("mongoose");

const professionsSchema = new mongoose.Schema({
    label: { type: String, required: true },
    description: { type: renderToString },
    isDeleted: { type: Boolean, default: false },
    deletedBy: { type: String, default: null },
    deleteAt: { type: Date, default: null },
    updatedBy: { type: String, default: null },
    updatedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
});

const Professions = mongoose.models.Professions || mongoose.model("Professions", professionsSchema);

module.exports = {
    Professions
};
