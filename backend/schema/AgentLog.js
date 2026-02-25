const mongoose = require('mongoose');

const agentLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    agentName: { type: String, default: 'ConversationalAgent' },
    userMessage: { type: String },
    agentResponse: { type: String },
    intent: { type: String },
    confidence: { type: Number },
    workflowStatus: { type: String },
    action: { type: String }, // For system actions
    decision: { type: String }, // For internal AI reasoning
    relatedOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AgentLog', agentLogSchema);
