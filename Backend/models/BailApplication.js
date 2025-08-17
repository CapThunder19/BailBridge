const mongoose = require("mongoose");

const bailApplicationSchema = new mongoose.Schema({
    lawyerName: { type: String, required: true },
    prisonerId: { type: mongoose.Schema.Types.ObjectId, ref: "Prisoner", required: true },
    prisonerName: { type: String, required: true },
    caseNumber: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    createdAt: { type: Date, default: Date.now },
    judgeResponse: { type: String, enum: ["approved", "rejected"], default: null }
});

module.exports = mongoose.model("BailApplication", bailApplicationSchema);
