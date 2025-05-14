const express = require('express');
const router = new express.Router();
const { createProfessions, getProfessionsByCriteria, updateProfessions, deleteProfessions } = require('../controllers/professions');

router.post("/professions/create", createProfessions);

router.post("/professions/getByCriteria", getProfessionsByCriteria);

router.patch("/professions/update", updateProfessions);

router.delete("/professions/delete", deleteProfessions);

module.exports = router;
