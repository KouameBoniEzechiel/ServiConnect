const validator = require("validator");
const mongoose = require("mongoose");

const user_activity_logsSchema = new mongoose.Schema({
    name: { type: String, required: true },
    user_id: { type: String, required: true },
    role: { type: String, required: true },
    action_type: { type: String, required: true },
    description: { type: String, required: true },
    target_id: { type: String, required: true },
    ip_adress: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    deletedBy: { type: String, default: null },
    deleteAt: { type: Date, default: null },
    updatedBy: { type: String, default: null },
    updatedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
});

const User_activity_logs = mongoose.models.User_activity_logs || mongoose.model("User_activity_logs", user_activity_logsSchema);

module.exports = {
    User_activity_logs
};
