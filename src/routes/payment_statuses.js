const express = require('express');
const router = new express.Router();
const { createPayment_statuses, getPayment_statusesByCriteria, updatePayment_statuses, deletePayment_statuses } = require('../controllers/payment_statuses');

router.post("/payment_statuses/create", createPayment_statuses);

router.get("/payment_statuses/getByCriteria", getPayment_statusesByCriteria);

router.patch("/payment_statuses/update", updatePayment_statuses);

router.delete("/payment_statuses/delete", deletePayment_statuses);

module.exports = router;
