const validator = require("validator");
const mongoose = require("mongoose");

const admin_logsSchema = new mongoose.Schema({
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String },
    target_id: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    deletedBy: { type: String, default: null },
    deleteAt: { type: Date, default: null },
    updatedBy: { type: String, default: null },
    updatedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
});

const Admin_logs = mongoose.models.Admin_logs || mongoose.model("Admin_logs", admin_logsSchema);

module.exports = {
    Admin_logs
};
