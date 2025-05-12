const validator = require("validator");
const mongoose = require("mongoose");

const bookingsSchema = new mongoose.Schema({
    client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    provider_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Providers' },
    service_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Services' },
    date: { type: Date },
    time: { type: String },
    notes: { type: String },
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
