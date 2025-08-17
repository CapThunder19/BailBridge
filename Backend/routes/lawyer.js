const express = require("express");
const router = express.Router();
const Prisoner = require("../models/Prisoner");
const bailApplication = require("../models/BailApplication");

router.get('/', async (req, res) => {
    const { id, name } = req.query;
    console.log("Fetching case details for:", { id, name });
    try {
        const caseDetails = await Prisoner.findById(id);
        if (!caseDetails) {
            return res.status(404).json({ message: "Case not found by id" });
        }
        if (caseDetails.name.trim().toLowerCase() !== name.trim().toLowerCase()) {
            return res.status(404).json({ message: "Name does not match" });
        }
        res.json(caseDetails);
    } catch (error) {
        console.error("Error fetching case details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Create bail application
router.post('/bail', async (req, res) => {
    const { prisonerId, lawyerName } = req.body;
    try {
        const prisoner = await Prisoner.findById(prisonerId);
        if (!prisoner) {
            return res.status(404).json({ message: "Prisoner not found" });
        }
        const bailApp = new bailApplication({
            prisonerId,
            lawyerName,
            prisonerName: prisoner.name,
            caseNumber: prisoner.caseNumber
        });
        await bailApp.save();
        res.status(201).json({ message: "Bail application submitted successfully", bailApp });
    } catch (error) {
        console.error("Error creating bail application:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get a single bail application
router.get('/bail/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const bailApp = await bailApplication.findById(id);
        if (!bailApp) {
            return res.status(404).json({ message: "Bail application not found" });
        }
        res.json(bailApp);
    } catch (error) {
        console.error("Error fetching bail application:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get all bail applications (for judge)
router.get('/bail-applications', async (req, res) => {
    try {
        const applications = await bailApplication.find().populate("prisonerId");
        res.json(applications);
    } catch (error) {
        console.error("Error fetching bail applications:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


router.post('/bail/:id/response', async (req, res) => {
    const { id } = req.params;
    const { judgeResponse, decision } = req.body;
    try {
        const bailApp = await bailApplication.findById(id);
        if (!bailApp) {
            return res.status(404).json({ message: "Bail application not found" });
        }
       
        if (judgeResponse && ["approved", "rejected"].includes(judgeResponse)) {
            bailApp.judgeResponse = judgeResponse;
        }
        if (decision && ["approved", "rejected"].includes(decision)) {
            bailApp.status = decision;
        }
        await bailApp.save();
        res.json({ message: "Bail application response updated successfully", bailApp });
    } catch (error) {
        console.error("Error updating bail application response:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


module.exports = router;