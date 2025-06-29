const express = require('express');
const { getUser, upsertUser } = require('../controllers/authController');
const router = express.Router();

router.get('/user/:clerkId', getUser);
router.post('/user', upsertUser);

module.exports = router;
