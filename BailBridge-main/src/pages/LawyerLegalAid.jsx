import React, { useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import './LawyerCaseLookup.css';
import { generateStyledPdf } from '../components/Doc';
import { generateBail } from '../components/Doc2';


export default function LawyerCaseLookup() {
  const [name, setName] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [lawyerName, setLawyerName] = useState('');
  const [caseDetails, setCaseDetails] = useState(null);
  const [error, setError] = useState('');
  const [bailStatus, setBailStatus] = useState('');
  const [courtName, setCourtName] = useState('');
  const [courtStatus, setCourtStatus] = useState('');

  async function fetchCaseDetails(e) {
    e.preventDefault();
    setError('');
    setCaseDetails(null);
    setBailStatus('');
    try {
      const res = await axios.get('https://bailbridge-8.onrender.com/api/lawyer', {
        params: { id: caseNumber, name }
      });
      setCaseDetails(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Case not found');
    }
  }

  async function generateBailApplication(sendPdf = false) {
    setBailStatus('');
    try {
     
      let pdfBase64 = null;
      if (sendPdf && caseDetails) {
        const eligible =
        caseDetails.eligible === true ||
        caseDetails.eligible === "true" ||
        caseDetails.eligible === 1;

const doc = await generateBail(caseDetails, lawyerName, eligible, true);
        doc.save("bail_application.pdf");

        pdfBase64 = doc.output('datauristring');
      }

      const res = await axios.post('https://bailbridge-8.onrender.com/api/lawyer/bail', {
        prisonerId: caseDetails._id,
        lawyerName: lawyerName,
        pdf: pdfBase64
      });
      setBailStatus('✅ Bail application (with PDF) submitted!');
    } catch (err) {
      setBailStatus(err.response?.data?.message || '❌ Failed to submit bail application');
    }
  }

function downloadPdf() {
  if (!caseDetails) return;
  const eligible =
    caseDetails.eligible === true ||
    caseDetails.eligible === "true" ||
    caseDetails.eligible === 1;
  const doc = generateStyledPdf(caseDetails, lawyerName, eligible);
  doc.save("bail_application.pdf");
}

  async function handleAddCourt() {
    setCourtStatus('');
    try {
      const res = await axios.post('https://bailbridge-8.onrender.com/api/lawyer/add-court', {
        prisonerId: caseDetails._id,
        court: courtName
      });
      setCourtStatus('✅ Court updated!');
      
      setCaseDetails({ ...caseDetails, court: courtName });
    } catch (err) {
      setCourtStatus(err.response?.data?.message || '❌ Failed to update court');
    }
  }

  return (
    <div className="lawyer-case-container">
      <h2>Lookup Case Details</h2>
      <form onSubmit={fetchCaseDetails}>
        <input
          type="text"
          placeholder="Prisoner Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Case ID"
          value={caseNumber}
          onChange={e => setCaseNumber(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Lawyer Name"
          value={lawyerName}
          onChange={e => setLawyerName(e.target.value)}
          required
        />
        <button type="submit">Get Details</button>
      </form>

      {error && <p className="error-message">{error}</p>}

      {caseDetails && (
        <div className="case-details">
          <h3>Case Details</h3>
          <div className="detail-row">
            <span className="label">Prisoner Name:</span>
            <span className="value">{caseDetails.name}</span>
          </div>
          <div className="detail-row">
            <span className="label">Case Number:</span>
            <span className="value">{caseDetails.caseNumber}</span>
          </div>
          <div className="detail-row">
            <span className="label">Offense:</span>
            <span className="value">{caseDetails.offense}</span>
          </div>
          <div className="detail-row">
            <span className="label">Status:</span>
            <span className="value">{caseDetails.status}</span>
          </div>
          {caseDetails.courtStage !== "investigation" && (
           <div style={{ marginBottom: 12 }}>
              <input
                type="text"
                placeholder="Enter Court Name"
                value={courtName}
                onChange={e => setCourtName(e.target.value)}
                style={{ marginRight: 8 }}
              />
              <button className="bail-btn" onClick={handleAddCourt}>
                Add Court
              </button>
              {courtStatus && <span style={{ marginLeft: 8 }}>{courtStatus}</span>}
            </div>
          )}
          <button onClick={downloadPdf} className="bail-btn">
            Download Bail Application PDF
          </button>
          <button onClick={() => generateBailApplication(true)} className="bail-btn">
            Generate Bail Application & Send PDF to Judge
          </button>
          {bailStatus && <p className="status-message">{bailStatus}</p>}
        </div>
      )}
    </div>
  );
}