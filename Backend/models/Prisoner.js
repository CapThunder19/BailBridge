const mongoose = require('mongoose');

const PrisonerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  caseNumber: { type: String, required: true },
  sections: { type: String, required: true },
  dateOfArrest: { type: Date, required: true },
  timeServedDays: { type: Number, required: true },
  previousRejections: { type: Boolean, default: false },
  courtStage: { type: String, required: true },
  healthIssues: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Prisoner', PrisonerSchema);