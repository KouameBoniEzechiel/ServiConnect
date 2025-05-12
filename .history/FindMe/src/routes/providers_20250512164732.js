const express = require('express');
const router = new express.Router();
const { createProviders, getProvidersByCriteria, getProviderById, updateProviders, deleteProviders } = require('../controllers/providers');

router.post("/providers/create", createProviders);

router.get("/providers/getByCriteria", getProvidersByCriteria);

router.get("/providers/getByCriteria", getProvidersByCriteria);

router.patch("/providers/update", updateProviders);

router.delete("/providers/delete", deleteProviders);

module.exports = router;
