const validator = require("validator");
const mongoose = require("mongoose");

const booking_statusesSchema = new mongoose.Schema({
    label: { type: String, required: true },
    description: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    deletedBy: { type: String, default: null },
    deleteAt: { type: Date, default: null },
    updatedBy: { type: String, default: null },
    updatedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
});

const Booking_statuses = mongoose.models.Booking_statuses || mongoose.model("Booking_statuses", booking_statusesSchema);

module.exports = {
    Booking_statuses
};
