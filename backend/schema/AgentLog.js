const mongoose = require('mongoose');

const agentLogSchema = new mongoose.Schema({
    agentName: { type: String, required: true },
    action: { type: String, required: true },
    decision: { type: String, required: true },
    relatedOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AgentLog', agentLogSchema);
