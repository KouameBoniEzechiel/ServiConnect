const validator = require("validator");
const mongoose = require("mongoose");

const reviewsSchema = new mongoose.Schema({
    name: { type: String, required: true },
    client_id: { type: String, required: true },
    provider_id: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    deletedBy: { type: String, default: null },
    deleteAt: { type: Date, default: null },
    updatedBy: { type: String, default: null },
    updatedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
});

const Reviews = mongoose.models.Reviews || mongoose.model("Reviews", reviewsSchema);

module.exports = {
    Reviews
};
