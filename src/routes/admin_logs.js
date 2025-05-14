const express = require('express');
const router = new express.Router();
const { createAdmin_logs, getAdmin_logsByCriteria, updateAdmin_logs, deleteAdmin_logs } = require('../controllers/admin_logs');

router.post("/admin_logs/create", createAdmin_logs);

router.post("/admin_logs/getByCriteria", getAdmin_logsByCriteria);

router.patch("/admin_logs/update", updateAdmin_logs);

router.delete("/admin_logs/delete", deleteAdmin_logs);

module.exports = router;
