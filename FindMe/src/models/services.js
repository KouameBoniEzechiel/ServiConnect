const validator = require("validator");
const mongoose = require("mongoose");

const servicesSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number },
    duration_minutes: { type: Number },
    provider_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Providers' },
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
