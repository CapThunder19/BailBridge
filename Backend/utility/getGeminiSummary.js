const axios = require('axios');

async function getGeminiSummary(prisoner, ipcSections) {
  const prompt = `
Prisoner Details:
Name: ${prisoner.name}
Case Number: ${prisoner.caseNumber}
Sections: ${prisoner.sections}
Date of Arrest: ${prisoner.dateOfArrest}
Time Served (days): ${prisoner.timeServedDays}
Previous Rejections: ${prisoner.previousRejections}
Court Stage: ${prisoner.courtStage}
Health Issues: ${prisoner.healthIssues}

IPC Section Info:
${JSON.stringify(ipcSections, null, 2)}

Based on the above, provide a summary of the case and state if the prisoner is eligible for bail, and if not, when they might be eligible.
`;

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
  return response.data;
}

module.exports = { getGeminiSummary };