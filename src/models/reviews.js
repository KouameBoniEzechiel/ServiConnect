const validator = require("validator");
const mongoose = require("mongoose");

const reviewsSchema = new mongoose.Schema({
    client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    provider_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Providers' },
    rating: { type: Number },
    comment: { type: String },
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
