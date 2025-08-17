import React, { useState } from 'react';
import axios from 'axios';
import './LawyerCaseLookup.css';

export default function LawyerCaseLookup() {
  const [name, setName] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [caseDetails, setCaseDetails] = useState(null);
  const [error, setError] = useState('');
  const [bailStatus, setBailStatus] = useState('');

  async function fetchCaseDetails(e) {
    e.preventDefault();
    setError('');
    setCaseDetails(null);
    setBailStatus('');
    try {
      const res = await axios.get('http://localhost:5000/api/lawyer', {
        params: { id: caseNumber, name }
      });
      setCaseDetails(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Case not found');
    }
  }

  async function generateBailApplication() {
    setBailStatus('');
    try {
      await axios.post('http://localhost:5000/api/lawyer/bail', {
        prisonerId: caseDetails._id,
        lawyerName: name
      });
      setBailStatus('✅ Bail application submitted!');
    } catch (err) {
      setBailStatus(err.response?.data?.message || '❌ Failed to submit bail application');
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
          placeholder="Case Number"
          value={caseNumber}
          onChange={e => setCaseNumber(e.target.value)}
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
          <div className="detail-row">
            <span className="label">Lawyer Assigned:</span>
            <span className="value">{caseDetails.lawyer || 'Not Assigned'}</span>
          </div>

          <button onClick={generateBailApplication} className="bail-btn">
            Generate Bail Application
          </button>

          {bailStatus && <p className="status-message">{bailStatus}</p>}
        </div>
      )}
    </div>
  );
}
