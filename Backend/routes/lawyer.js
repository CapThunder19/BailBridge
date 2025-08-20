const express = require("express");
const router = express.Router();
const Prisoner = require("../models/Prisoner");
const bailApplication = require("../models/BailApplication");
const axios = require('axios');

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


router.post('/bail', async (req, res) => {
    const { prisonerId, lawyerName, pdf } = req.body;
    try {
        const prisoner = await Prisoner.findById(prisonerId);
        if (!prisoner) {
            return res.status(404).json({ message: "Prisoner not found" });
        }
        const bailApp = new bailApplication({
            prisonerId,
            lawyerName,
            prisonerName: prisoner.name,
            caseNumber: prisoner.caseNumber,
            pdf 
        });
        await bailApp.save();
        
        res.status(201).json({ message: "Bail application (with PDF) submitted successfully", bailApp });
    } catch (error) {
        console.error("Error creating bail application:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

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


router.post('/bail/:id/gemini-suggest', async (req, res) => {
    try {
        const bailApp = await bailApplication.findById(req.params.id);
        if (!bailApp || !bailApp.pdf) {
            return res.status(404).json({ message: "PDF not found for this application" });
        }

        
        const base64Data = bailApp.pdf.split(',')[1];
        const prompt = `Read this bail application PDF (base64 encoded) and suggest whether to approve or reject:\n${base64Data}`;

        const response = await axios.post(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
            {
                contents: [{ parts: [{ text: prompt }] }]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-goog-api-key': process.env.GEMINI_API_KEY
                }
            }
        );
        
        res.json({ suggestion: response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No suggestion received." });
    } catch (error) {
        console.error("suggestion error:", error?.response?.data || error);
        res.status(500).json({ message: "Gemini API error" });
    }
});

router.post('/add-court', async (req, res) => {
    const { prisonerId, court } = req.body;
    try {
        const prisoner = await Prisoner.findById(prisonerId);
        if (!prisoner) {
            return res.status(404).json({ message: "Prisoner not found" });
        }
        prisoner.court = court;
        await prisoner.save();
        res.json({ message: "Court updated successfully", prisoner });
    } catch (error) {
        console.error("Error updating court:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});



module.exports = router;