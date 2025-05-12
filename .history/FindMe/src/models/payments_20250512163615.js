const validator = require("validator");
const mongoose = require("mongoose");

const paymentsSchema = new mongoose.Schema({
    booking_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Bookings' },
    amount: { type: Number },
    payment_method: { type: String },
    1: { type: String, required: true },
    4: { type: String, required: true },
    1: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    deletedBy: { type: String, default: null },
    deleteAt: { type: Date, default: null },
    updatedBy: { type: String, default: null },
    updatedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
});

const Payments = mongoose.models.Payments || mongoose.model("Payments", paymentsSchema);

module.exports = {
    Payments
};
