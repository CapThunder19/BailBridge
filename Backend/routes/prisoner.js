const express = require("express");
const router = express.Router();
const Prisoner = require("../models/Prisoner");
const { getGeminiSummary } = require('../utility/getGeminiSummary');
const { getIPCSections } = require('../utility/getIPCSections');

router.post('/', async (req, res) => {
  try {
    console.log(req.body);
    const prisoner = new Prisoner(req.body);
    await prisoner.save();

    const ipcSections = await getIPCSections();
    const relevantSections = ipcSections.filter(
      s => prisoner.sections.split(',').map(sec => sec.trim()).includes(s.Section.replace('IPC_', ''))
    );

    const geminiResult = await getGeminiSummary(prisoner, relevantSections);

    
    const summaryText = geminiResult?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    let eligible = false;
    if (summaryText.toLowerCase().includes('not eligible')) {
     eligible = false;
     } 
     
     else if (summaryText.toLowerCase().includes('eligible')) {
       eligible = true;
     } else {
       eligible = false; 
     }
     prisoner.eligible = eligible;
    await prisoner.save();

    res.status(201).json({
      caseId: prisoner._id,
      prisoner,
      summary: geminiResult
    });
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
});

module.exports = router;