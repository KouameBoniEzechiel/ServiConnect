const validator = require("validator");
const mongoose = require("mongoose");

const bookingsSchema = new mongoose.Schema({
    client_id: { type: String, required: true },
    provider_id: { type: String, required: true },
    service_id: { type: String, required: true },
    date: { type: Date },
    time: { type: String, required: true },
    notes: { type: String, required: true },
    status_id: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    deletedBy: { type: String, default: null },
    deleteAt: { type: Date, default: null },
    updatedBy: { type: String, default: null },
    updatedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
});

const Bookings = mongoose.models.Bookings || mongoose.model("Bookings", bookingsSchema);

module.exports = {
    Bookings
};
