const express = require('express');
const router = new express.Router();
const { createProviders, getProvidersByCriteria, getProviderById, updateProviders, deleteProviders } = require('../controllers/providers');

router.post("/providers/create", createProviders);

router.post("/providers/getByCriteria", getProvidersByCriteria);

router.get("/providers/getProviderById", getProviderById);

router.patch("/providers/update", updateProviders);

router.delete("/providers/delete", deleteProviders);

module.exports = router;
