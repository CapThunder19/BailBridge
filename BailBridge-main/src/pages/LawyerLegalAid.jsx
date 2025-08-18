import React, { useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import './LawyerCaseLookup.css';

export default function LawyerCaseLookup() {
  const [name, setName] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [lawyerName, setLawyerName] = useState('');
  const [caseDetails, setCaseDetails] = useState(null);
  const [error, setError] = useState('');
  const [bailStatus, setBailStatus] = useState('');

  async function fetchCaseDetails(e) {
    e.preventDefault();
    setError('');
    setCaseDetails(null);
    setBailStatus('');
    try {
      const res = await axios.get('https://bailbridge-7.onrender.com/api/lawyer', {
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
        const doc = new jsPDF();
        doc.text('Bail Application', 10, 10);
        doc.text(`Lawyer Name: ${lawyerName}`, 10, 20);
        doc.text(`Prisoner Name: ${caseDetails.name}`, 10, 30);
        doc.text(`Case Number: ${caseDetails.caseNumber}`, 10, 40);
        doc.text(`Offense: ${caseDetails.offense || ''}`, 10, 50);
        doc.text(`Status: ${caseDetails.status || ''}`, 10, 60);
        pdfBase64 = doc.output('datauristring');
      }

      const res = await axios.post('https://bailbridge-7.onrender.com/api/lawyer/bail', {
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
    const doc = new jsPDF();
    doc.text('Bail Application', 10, 10);
    doc.text(`Lawyer Name: ${lawyerName}`, 10, 20);
    doc.text(`Prisoner Name: ${caseDetails.name}`, 10, 30);
    doc.text(`Case Number: ${caseDetails.caseNumber}`, 10, 40);
    doc.text(`Offense: ${caseDetails.offense || ''}`, 10, 50);
    doc.text(`Status: ${caseDetails.status || ''}`, 10, 60);
    doc.save('bail_application.pdf');
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
          placeholder="Case Number"
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