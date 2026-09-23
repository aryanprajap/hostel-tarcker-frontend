import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Send, CheckCircle2 } from 'lucide-react';
import { createComplaint } from '../api/client';
import { useToast } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const STEPS = ['Personal Info', 'Issue Details', 'Priority & Review'];

const CATEGORIES = [
  { value: 'plumbing', label: 'Plumbing', icon: '🔧', desc: 'Taps, pipes, drainage' },
  { value: 'electrical', label: 'Electrical', icon: '⚡', desc: 'Wiring, sockets, lights' },
  { value: 'civil', label: 'Civil', icon: '🏗️', desc: 'Walls, ceiling, flooring' },
  { value: 'pest', label: 'Pest Control', icon: '🐛', desc: 'Insects, rodents' },
  { value: 'hygiene', label: 'Hygiene', icon: '🧹', desc: 'Cleaning, sanitation' },
  { value: 'furniture', label: 'Furniture', icon: '🪑', desc: 'Beds, chairs, tables' },
  { value: 'internet', label: 'Internet / WiFi', icon: '📡', desc: 'Connectivity issues' },
  { value: 'security', label: 'Security', icon: '🔒', desc: 'Locks, CCTV, access' },
  { value: 'other', label: 'Other', icon: '📋', desc: 'Miscellaneous' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: '#10b981', desc: 'Not urgent, can wait', icon: '🟢' },
  { value: 'medium', label: 'Medium', color: '#f59e0b', desc: 'Should be fixed soon', icon: '🟡' },
  { value: 'high', label: 'High', color: '#f97316', desc: 'Significant impact', icon: '🟠' },
  { value: 'critical', label: 'Critical', color: '#f43f5e', desc: 'Immediate safety risk', icon: '🔴' },
];

export default function NewComplaint() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const [form, setForm] = useState({
    resident_name: user?.name || '',
    room_number: user?.room_number || '',
    phone: user?.phone || '',
    email: user?.email || '',
    category: '',
    title: '',
    description: '',
    priority: 'medium',
  });
  const [errors, setErrors] = useState({});

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  }

  function validateStep() {
    const errs = {};
    if (step === 0) {
      if (!form.resident_name.trim()) errs.resident_name = 'Name is required';
      if (!form.room_number.trim()) errs.room_number = 'Room number is required';
      if (form.phone && !/^\d{10}$/.test(form.phone)) errs.phone = 'Enter a valid 10-digit number';
    }
    if (step === 1) {
      if (!form.category) errs.category = 'Please select a category';
      if (!form.title.trim()) errs.title = 'Title is required';
      if (form.title.length < 5) errs.title = 'Title must be at least 5 characters';
      if (!form.description.trim()) errs.description = 'Description is required';
      if (form.description.length < 20) errs.description = 'Please provide at least 20 characters of detail';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function next() {
    if (validateStep()) setStep(s => s + 1);
  }

  async function submit() {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      const res = await createComplaint(form);
      setSubmitted(res.data);
      addToast(`Complaint ${res.data.complaint_number} filed successfully!`, 'success');
    } catch (e) {
      addToast('Failed to submit complaint. Please try again.', 'error');
    }
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="page-content fade-in">
        <div style={{ maxWidth: 540, margin: '60px auto', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'grid', placeItems: 'center', margin: '0 auto 20px', color: 'var(--emerald)' }}>
            <CheckCircle2 size={36} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Complaint Filed!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 6 }}>
            Your complaint has been registered successfully.
          </p>
          <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 24px', margin: '20px 0', display: 'inline-block' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Complaint Number</div>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent-light)', marginTop: 4 }}>{submitted.complaint_number}</div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
            Please note this number for tracking your complaint status.
          </p>
          <div className="flex gap-3" style={{ justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/complaints')}>View All</button>
            <button className="btn btn-primary" onClick={() => navigate(`/complaints/${submitted.id}`)}>Track Complaint</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <div>
          <h1>New Complaint</h1>
          <p>Fill in the details to file a maintenance complaint</p>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Step Progress */}
        <div className="step-progress mb-6">
          {STEPS.map((label, i) => (
            <div key={label} className={`step-item ${i < step ? 'completed' : i === step ? 'active' : ''}`}>
              <div className="step-circle">{i < step ? '✓' : i + 1}</div>
              <div className="step-label">{label}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-body" style={{ padding: 32 }}>

            {/* STEP 0: Personal Info */}
            {step === 0 && (
              <div className="fade-in-up">
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Personal Information</h3>
                <p className="text-muted mb-6">Tell us who you are and where you're staying.</p>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name <span className="form-required">*</span></label>
                    <input className="form-input" placeholder="e.g. Arjun Mehta" value={form.resident_name}
                      onChange={e => set('resident_name', e.target.value)} />
                    {errors.resident_name && <div className="form-error">{errors.resident_name}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Room Number <span className="form-required">*</span></label>
                    <input className="form-input" placeholder="e.g. A-101" value={form.room_number}
                      onChange={e => set('room_number', e.target.value)} />
                    {errors.room_number && <div className="form-error">{errors.room_number}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input className="form-input" type="tel" placeholder="10-digit mobile" value={form.phone}
                      onChange={e => set('phone', e.target.value)} maxLength={10} />
                    {errors.phone && <div className="form-error">{errors.phone}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email (optional)</label>
                    <input className="form-input" type="email" placeholder="your@email.com" value={form.email}
                      onChange={e => set('email', e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: Issue Details */}
            {step === 1 && (
              <div className="fade-in-up">
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Issue Details</h3>
                <p className="text-muted mb-6">Describe the problem you're facing.</p>

                <div className="form-group">
                  <label className="form-label">Category <span className="form-required">*</span></label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {CATEGORIES.map(cat => (
                      <div key={cat.value}
                        onClick={() => set('category', cat.value)}
                        style={{
                          padding: '12px 14px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                          border: `1px solid ${form.category === cat.value ? 'var(--accent)' : 'var(--border)'}`,
                          background: form.category === cat.value ? 'rgba(59,130,246,0.1)' : 'var(--bg-glass)',
                          transition: 'var(--transition)',
                        }}
                      >
                        <div style={{ fontSize: 20, marginBottom: 4 }}>{cat.icon}</div>
                        <div style={{ fontSize: 12.5, fontWeight: 700 }}>{cat.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{cat.desc}</div>
                      </div>
                    ))}
                  </div>
                  {errors.category && <div className="form-error">{errors.category}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Title <span className="form-required">*</span></label>
                  <input className="form-input" placeholder="Short, clear summary of the problem"
                    value={form.title} onChange={e => set('title', e.target.value)} maxLength={120} />
                  {errors.title && <div className="form-error">{errors.title}</div>}
                  <div className="form-hint">{form.title.length}/120 characters</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description <span className="form-required">*</span></label>
                  <textarea className="form-textarea" rows={5}
                    placeholder="Describe the issue in detail — when it started, how severe it is, what you've noticed…"
                    value={form.description} onChange={e => set('description', e.target.value)} />
                  {errors.description && <div className="form-error">{errors.description}</div>}
                  <div className="form-hint">{form.description.length} characters (min. 20)</div>
                </div>
              </div>
            )}

            {/* STEP 2: Priority & Review */}
            {step === 2 && (
              <div className="fade-in-up">
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Priority & Review</h3>
                <p className="text-muted mb-6">Set urgency and confirm your complaint details.</p>

                <div className="form-group">
                  <label className="form-label">Priority Level</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                    {PRIORITIES.map(p => (
                      <div key={p.value}
                        onClick={() => set('priority', p.value)}
                        style={{
                          padding: '14px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                          border: `1px solid ${form.priority === p.value ? p.color : 'var(--border)'}`,
                          background: form.priority === p.value ? `${p.color}18` : 'var(--bg-glass)',
                          transition: 'var(--transition)',
                        }}
                      >
                        <div style={{ fontSize: 20, marginBottom: 6 }}>{p.icon}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: form.priority === p.value ? p.color : 'inherit' }}>{p.label}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{p.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="divider" />
                <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px' }}>
                  <h4 style={{ fontWeight: 700, marginBottom: 14, fontSize: 14 }}>Review Your Complaint</h4>
                  <div style={{ display: 'grid', gap: 10, fontSize: 13.5 }}>
                    {[
                      ['Resident', form.resident_name],
                      ['Room', form.room_number],
                      ['Phone', form.phone || '—'],
                      ['Category', CATEGORIES.find(c => c.value === form.category)?.label || '—'],
                      ['Priority', form.priority],
                      ['Title', form.title],
                    ].map(([label, val]) => (
                      <div key={label} className="flex gap-3">
                        <span style={{ color: 'var(--text-muted)', minWidth: 90, fontSize: 12 }}>{label}</span>
                        <span style={{ fontWeight: 600 }}>{val}</span>
                      </div>
                    ))}
                    <div className="flex gap-3" style={{ alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--text-muted)', minWidth: 90, fontSize: 12 }}>Description</span>
                      <span style={{ flex: 1, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{form.description}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div style={{ padding: '0 32px 28px', display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-secondary" onClick={() => step === 0 ? navigate('/complaints') : setStep(s => s - 1)}>
              <ChevronLeft size={16} /> {step === 0 ? 'Cancel' : 'Back'}
            </button>
            {step < 2 ? (
              <button className="btn btn-primary" onClick={next}>
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button className="btn btn-primary" onClick={submit} disabled={submitting}>
                {submitting ? <><span className="loading-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Submitting…</> : <><Send size={15} /> Submit Complaint</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
