const express = require('express');
const router = new express.Router();
const { createRoles, getRolesByCriteria, updateRoles, deleteRoles } = require('../controllers/roles');

router.post("/roles/create", createRoles);

router.post("/roles/getByCriteria", getRolesByCriteria);

router.patch("/roles/update", updateRoles);

router.delete("/roles/delete", deleteRoles);

module.exports = router;
