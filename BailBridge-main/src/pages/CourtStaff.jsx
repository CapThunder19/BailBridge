import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './JudgeBailReview.css';


export default function JudgeBailReview() {
  const [applications, setApplications] = useState([]);
  const [response, setResponse] = useState({});
  const [decision, setDecision] = useState({});
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    async function fetchApplications() {
      const res = await axios.get('http://localhost:5000/api/lawyer/bail-applications');
      setApplications(res.data);
    }
    fetchApplications();
  }, [statusMsg]);

  async function handleResponse(id) {
    try {
      await axios.post(`http://localhost:5000/api/lawyer/bail/${id}/response`, {
        judgeResponse: response[id] || '',
        decision: decision[id]
      });
      setStatusMsg('Decision submitted!');
    } catch (err) {
      setStatusMsg('Error submitting decision');
    }
  }

  return (
    <div className="judge-page">
      <h2>Judge Bail Applications</h2>
      {applications.map(app => (
        <div key={app._id} className="application-card">
          <p><b>Prisoner:</b> {app.prisonerId?.name}</p>
          <p><b>Lawyer:</b> {app.lawyerName || app.Lawyername}</p>
          <p><b>Status:</b> {app.status}</p>
          <p><b>Judge Response:</b> {app.judgeResponse || '-'}</p>
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
        </div>
      ))}
      {statusMsg && <p className={`status-msg ${statusMsg.includes('Error') ? 'error' : 'success'}`}>{statusMsg}</p>}
    </div>
  );
}