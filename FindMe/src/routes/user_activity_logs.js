const express = require('express');
const router = new express.Router();
const { createUser_activity_logs, getUser_activity_logsByCriteria, updateUser_activity_logs, deleteUser_activity_logs } = require('../controllers/user_activity_logs');

router.post("/user_activity_logs/create", createUser_activity_logs);

router.get("/user_activity_logs/getByCriteria", getUser_activity_logsByCriteria);

router.patch("/user_activity_logs/update", updateUser_activity_logs);

router.delete("/user_activity_logs/delete", deleteUser_activity_logs);

module.exports = router;
