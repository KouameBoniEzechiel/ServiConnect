const validator = require("validator");
const mongoose = require("mongoose");

const servicesSchema = new mongoose.Schema({
    title: { type: String },
    description: { type: String },
    price: { type: Number, required: true },
    duration_minutes: { type: Number, required: true },
    provider_id: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    deletedBy: { type: String, default: null },
    deleteAt: { type: Date, default: null },
    updatedBy: { type: String, default: null },
    updatedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
});

const Services = mongoose.models.Services || mongoose.model("Services", servicesSchema);

module.exports = {
    Services
};
