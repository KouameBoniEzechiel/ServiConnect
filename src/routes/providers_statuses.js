const express = require('express');
const router = new express.Router();
const { createProviders_statuses, getProviders_statusesByCriteria, updateProviders_statuses, deleteProviders_statuses } = require('../controllers/providers_statuses');

router.post("/providers_statuses/create", createProviders_statuses);

router.post("/providers_statuses/getByCriteria", getProviders_statusesByCriteria);

router.patch("/providers_statuses/update", updateProviders_statuses);

router.delete("/providers_statuses/delete", deleteProviders_statuses);

module.exports = router;
