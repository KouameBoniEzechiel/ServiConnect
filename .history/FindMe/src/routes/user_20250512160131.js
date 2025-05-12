const express = require('express');
const { User } = require('../models/user');
const {createUser, getUserByCriteria, updateUser, deleteUser, loginUser, userInfos, userLogout, userLogoutAll} = require('../controllers/user')
const router = new express.Router();
const bcrypt = require('bcrypt');
const { authentification } = require('../middlewares/authentification')

router.post("/user/create", createUser);

router.get("/user/getByCriteria", authentification, getUserByCriteria);

router.patch("/user/update", authentification, updateUser);

router.delete("/user/delete", authentification, deleteUser);

router.post("/user/login", loginUser);

router.get("/user/me", authentification, userInfos);

router.post("/user/logout", authentification, userLogout);

router.post("/user/logout/all", authentification, userLogoutAll);

module.exports = router;

