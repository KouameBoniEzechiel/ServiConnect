const express = require('express');
const router = new express.Router();
const { createUser_statuses, getUser_statusesByCriteria, updateUser_statuses, deleteUser_statuses } = require('../controllers/user_statuses');

router.post("/user_statuses/create", createUser_statuses);

router.get("/user_statuses/getByCriteria", getUser_statusesByCriteria);

router.patch("/user_statuses/update", updateUser_statuses);

router.delete("/user_statuses/delete", deleteUser_statuses);

module.exports = router;
