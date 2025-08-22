import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './JudgeBailReview.css';

export default function JudgeBailReview() {
  const [applications, setApplications] = useState([]);
  const [response, setResponse] = useState({});
  const [decision, setDecision] = useState({});
  const [statusMsg, setStatusMsg] = useState('');
  const [geminiSuggestion, setGeminiSuggestion] = useState({});
  const [pdfText, setPdfText] = useState({});

  useEffect(() => {
    async function fetchApplications() {
      const res = await axios.get('https://bailbridge-8.onrender.com/api/lawyer/bail-applications');
      setApplications(res.data);
    }
    fetchApplications();
  }, [statusMsg]);

  async function handleResponse(id) {
    try {
      await axios.post(`https://bailbridge-8.onrender.com/api/lawyer/bail/${id}/response`, {
        judgeResponse: response[id] || '',
        decision: decision[id]
      });
      setStatusMsg('Decision submitted!');
    } catch (err) {
      setStatusMsg('Error submitting decision');
    }
  }

  async function getGeminiSuggestion(id) {
    setGeminiSuggestion(prev => ({ ...prev, [id]: "Loading suggestion..." }));
    try {
      const res = await axios.post(`https://bailbridge-8.onrender.com/api/lawyer/bail/${id}/gemini-suggest`);
      setGeminiSuggestion(prev => ({ ...prev, [id]: res.data.suggestion }));
      if (res.data.pdfText) {
        setPdfText(prev => ({ ...prev, [id]: res.data.pdfText }));
      }
    } catch {
      setGeminiSuggestion(prev => ({ ...prev, [id]: "Error getting suggestion" }));
    }
  }

  // Separate applications by status
  const pendingApps = applications.filter(app => app.status === "pending");
  const approvedApps = applications.filter(app => app.status === "approved");
  const rejectedApps = applications.filter(app => app.status === "rejected");

  function renderApplication(app) {
    return (
      <div key={app._id} className="application-card">
        <p><b>Prisoner:</b> {app.prisonerId?.name}</p>
        <p><b>Lawyer:</b> {app.lawyerName || app.Lawyername}</p>
        <p><b>Status:</b> {app.status}</p>
        <p><b>Judge Response:</b> {app.judgeResponse || '-'}</p>
        {app.pdf && (
          <a
            href={app.pdf}
            download={`bail_application_${app._id}.pdf`}
            rel="noopener noreferrer"
            className="button-secondary"
            style={{ display: 'inline-block', marginBottom: '8px' }}
          >
            Download Bail Application PDF
          </a>
        )}
        <button onClick={() => getGeminiSuggestion(app._id)}>
          Get Suggestion
        </button>
        {pdfText[app._id] && (
          <div className="pdf-text">
            <b>PDF Extracted Text:</b>
            <pre>{pdfText[app._id]}</pre>
          </div>
        )}
        {geminiSuggestion[app._id] && (
          <div className="gemini-suggestion" style={{
            background: "#f7fafd",
            border: "1px solid #dbeafe",
            borderRadius: "8px",
            padding: "12px",
            margin: "8px 0"
          }}>
            <b style={{ color: "#2563eb" }}>Gemini Suggestion:</b>
            {geminiSuggestion[app._id]
              .split(/\n\s*\n/)
              .map((para, idx) => (
                <p key={idx} style={{ margin: "8px 0", lineHeight: 1.6 }}>{para.trim()}</p>
              ))}
          </div>
        )}
        {app.status === "pending" && (
          <>
            <textarea
              placeholder="Judge response"
              value={response[app._id] || ''}
              onChange={e => setResponse({ ...response, [app._id]: e.target.value })}
            />
            <select
              value={decision[app._id] || ''}
              onChange={e => setDecision({ ...decision, [app._id]: e.target.value })}>
              <option value="">Select Decision</option>
              <option value="approved">Approve</option>
              <option value="rejected">Reject</option>
            </select>
            <button onClick={() => handleResponse(app._id)}>Submit Decision</button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="judge-page">
      <h2>Judge Bail Applications</h2>
      <div style={{
        display: 'flex',
        gap: '24px',
        alignItems: 'flex-start',
        marginTop: '24px'
      }}>
        <div style={{ flex: 1 }}>
          <h3>Pending Applications</h3>
          {pendingApps.length === 0 && <p>No pending applications.</p>}
          {pendingApps.map(renderApplication)}
        </div>
        <div style={{ flex: 1 }}>
          <h3>Approved Applications</h3>
          {approvedApps.length === 0 && <p>No approved applications.</p>}
          {approvedApps.map(renderApplication)}
        </div>
        <div style={{ flex: 1 }}>
          <h3>Rejected Applications</h3>
          {rejectedApps.length === 0 && <p>No rejected applications.</p>}
          {rejectedApps.map(renderApplication)}
        </div>
      </div>
      {statusMsg && <p className={`status-msg ${statusMsg.includes('Error') ? 'error' : 'success'}`}>{statusMsg}</p>}
    </div>
  );
}