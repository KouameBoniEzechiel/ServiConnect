const validator = require("validator");
const mongoose = require("mongoose");

const providersSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },    profession: { type: String, required: true },
    bio: { type: String, required: true },
    location: { type: String, required: true },
    rating: { type: Number, required: true },
    reviews_count: { type: Number, required: true },
    services: { type: Array },
    availability: { type: Array },
    status_id: { type: String, required: true },
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
