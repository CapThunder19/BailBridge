import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FormPages.css';

export default function UndertrialPrisoner() {
  const [form, setForm] = useState({
    name: '', caseNumber: '', sections: '', age: '', dateOfArrest: '', timeServedDays: '', previousRejections: false, courtStage: 'investigation', healthIssues: ''
  });
  const [result, setResult] = useState(null);
  const nav = useNavigate();

  function update(k, v) { setForm(s => ({ ...s, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    try {
      const payload = { ...form, timeServedDays: Number(form.timeServedDays), age: Number(form.age) };
      const response = await axios.post('http://localhost:5000/api/prisoners', payload);
     
      const summaryText = response.data.summary?.candidates?.[0]?.content?.parts?.[0]?.text || 'No summary';
      const eligible = summaryText.toLowerCase().includes('eligible');
      setResult({
        message: 'Details saved!',
        notes: [
          `Case ID: ${response.data.caseId}`,
          `Name: ${response.data.prisoner.name}`,
          `Age: ${response.data.prisoner.age}`,
          `Sections: ${response.data.prisoner.sections}`,
          `Time served: ${response.data.prisoner.timeServedDays} days`
        ],
        summary: summaryText,
        eligible
      });
    } catch (err) {
      setResult({ message: 'Failed to save prisoner details.', notes: [], summary: '', eligible: false });
    }
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    nav('/login-undertrial');
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="form-page">
      <h2>Undertrial Prisoner — Apply / Check Eligibility</h2>
      <button className="btn-ghost" style={{ float: 'right', marginBottom: 8 }} onClick={logout}>Logout</button>
      <div style={{ marginBottom: 16 }}>
        <Link to="/login-undertrial" className="btn-primary" style={{ marginRight: 8 }}>Login</Link>
        <Link to="/signup-undertrial" className="btn-ghost">Sign up</Link>
      </div>
      <form onSubmit={submit} className="case-form">
        <input value={form.caseNumber} onChange={e => update('caseNumber', e.target.value)} placeholder="Case number / FIR" />
        <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Full name" />
        <input type="number" value={form.age} onChange={e => update('age', e.target.value)} placeholder="Age" />
        <input value={form.sections} onChange={e => update('sections', e.target.value)} placeholder="Sections charged (comma separated)" />
        <div className="row">
          <input type="date" value={form.dateOfArrest} onChange={e => update('dateOfArrest', e.target.value)} />
          <input type="number" value={form.timeServedDays} onChange={e => update('timeServedDays', e.target.value)} placeholder="Time served (days)" />
        </div>
        <select value={form.courtStage} onChange={e => update('courtStage', e.target.value)}>
          <option value="investigation">Investigation</option>
          <option value="charges">Charges framed</option>
          <option value="trial">Trial</option>
        </select>
        <input value={form.healthIssues} onChange={e => update('healthIssues', e.target.value)} placeholder="Health / dependents (optional)" />
        <label className="checkbox"><input type="checkbox" checked={form.previousRejections} onChange={e => update('previousRejections', e.target.checked)} /> Any previous bail rejections?</label>

        <div className="form-actions">
          <button className="btn-primary" type="submit">Submit</button>
        </div>
      </form>

      {result && (
        <div className={`result ${result.eligible === true ? 'ok' : result.eligible === false ? 'no' : ''}`}>
          <h3>{result.message}</h3>
          <ul>{result.notes.map((n,i)=><li key={i}>{n}</li>)}</ul>
          <div className="gemini-summary">
  <b>Gemini Summary:</b>
  {result.summary
    .split(/\n\s*\n/)
    .map((para, idx) => (
      <p key={idx}>{para.trim()}</p>
    ))}
  <p>
    <b>Bail Eligibility:</b>{' '}
    {result.eligible
      ? <span className="eligible">Eligible for bail</span>
      : <span className="not-eligible">Not eligible for bail</span>}
  </p>
</div>
        </div>
      )}
    </motion.div>
  );
}