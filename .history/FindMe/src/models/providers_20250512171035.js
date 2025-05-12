const validator = require("validator");
const mongoose = require("mongoose");

const providersSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
"profession_id": "ref -> professions._id"
    bio: { type: String },
    location: { type: String, required: true },
    rating: { type: Number },
    reviews_count: { type: Number },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    availability: [
        { day: String, slots: [String] }
    ],
    status_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Providers_statuses' },
    isDeleted: { type: Boolean, default: false },
    deletedBy: { type: String, default: null },
    deleteAt: { type: Date, default: null },
    updatedBy: { type: String, default: null },
    updatedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
});

const Providers = mongoose.models.Providers || mongoose.model("Providers", providersSchema);

module.exports = {
    Providers
};
