const express = require('express');
const router = express.Router();
const agentController = require('../controller/agentController');
const { verifyToken } = require('../middleware/auth');

router.post('/chat', verifyToken, agentController.chat);
router.get('/logs', verifyToken, agentController.getLogs);

module.exports = router;
