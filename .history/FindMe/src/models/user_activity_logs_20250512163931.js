const validator = require("validator");
const mongoose = require("mongoose");

const user_activity_logsSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Roles' },
    action_type: { type: String },
    description: { type: String },
    target_id:  mongoose.Schema.Types.ObjectId,
    ip_adress: { type: String },
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
