const express = require('express');
const router = new express.Router();
const { createServices, getServicesByCriteria, getServiceById, updateServices, deleteServices } = require('../controllers/services');

router.post("/services/create", createServices);

router.get("/services/getByCriteria", getServicesByCriteria);

router.get("/services/getByCriteria", getServicesByCriteria);

router.patch("/services/update", updateServices);

router.delete("/services/delete", deleteServices);

module.exports = router;
