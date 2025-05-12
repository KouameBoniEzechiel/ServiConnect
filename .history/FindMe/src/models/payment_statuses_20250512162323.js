const validator = require("validator");
const mongoose = require("mongoose");

const payment_statusesSchema = new mongoose.Schema({
    label: { type: String, required: true, unique: true },
    description: { type: String },
    isDeleted: { type: Boolean, default: false },
    deletedBy: { type: String, default: null },
    deleteAt: { type: Date, default: null },
    updatedBy: { type: String, default: null },
    updatedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
});

const Payment_statuses = mongoose.models.Payment_statuses || mongoose.model("Payment_statuses", payment_statusesSchema);

module.exports = {
    Payment_statuses
};
