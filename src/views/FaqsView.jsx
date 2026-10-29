import React, { useState } from 'react';
import { HelpCircle, Clock, Plus } from 'lucide-react';
import Modal from '../components/Modal';
import { saveFaq, deleteFaq, saveProcessStep, deleteProcessStep } from '../services/firestoreService';

export default function FaqsView({ faqs = [], processSteps = [], showToast }) {
  const [activeTab, setActiveTab] = useState('faqs');
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [editingStep, setEditingStep] = useState(null);

  const [faqForm, setFaqForm] = useState({ id: '', question: '', answer: '', status: 'Published' });
  const [stepForm, setStepForm] = useState({ id: '', number: '01.', title: '', desc: '', duration: 'Week 1', pillsInput: '', status: 'Published' });
  const [saving, setSaving] = useState(false);

  const handleOpenEditFaq = (faq) => {
    setEditingFaq(faq);
    setFaqForm({
      id: faq.id || '',
      question: faq.question || '',
      answer: faq.answer || '',
      status: faq.status || 'Published'
    });
    setFaqModalOpen(true);
  };

  const handleSaveFaq = async (e) => {
    e.preventDefault();
    if (!faqForm.question.trim() || !faqForm.answer.trim()) {
      showToast('Question and answer are required.', 'error');
      return;
    }

    setSaving(true);
    try {
      await saveFaq({
        id: faqForm.id || undefined,
        question: faqForm.question.trim(),
        answer: faqForm.answer.trim(),
        status: faqForm.status
      });

      showToast('FAQ item saved.', 'success');
      setFaqModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Failed to save FAQ.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFaq = async (faq) => {
    if (!window.confirm('Delete this FAQ?')) return;
    try {
      await deleteFaq(faq.id);
      showToast('FAQ deleted.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete FAQ.', 'error');
    }
  };

  const handleOpenEditStep = (step) => {
    setEditingStep(step);
    setStepForm({
      id: step.id || '',
      number: step.number || '01.',
      title: step.title || '',
      desc: step.desc || '',
      duration: step.duration || '',
      pillsInput: Array.isArray(step.pills) ? step.pills.join(', ') : '',
      status: step.status || 'Published'
    });
    setStepModalOpen(true);
  };

  const handleSaveStep = async (e) => {
    e.preventDefault();
    if (!stepForm.title.trim()) {
      showToast('Step title is required.', 'error');
      return;
    }

    setSaving(true);
    try {
      const pills = stepForm.pillsInput
        ? stepForm.pillsInput.split(',').map((p) => p.trim()).filter(Boolean)
        : [];

      await saveProcessStep({
        id: stepForm.id || undefined,
        number: stepForm.number,
        title: stepForm.title.trim(),
        desc: stepForm.desc,
        duration: stepForm.duration,
        pills,
        status: stepForm.status
      });

      showToast('Process step saved.', 'success');
      setStepModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Failed to save step.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStep = async (step) => {
    if (!window.confirm(`Delete process step "${step.title}"?`)) return;
    try {
      await deleteProcessStep(step.id);
      showToast('Step deleted.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete step.', 'error');
    }
  };

  return (
    <div className="view-section">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">FAQs &amp; Process Timeline</h1>
          <p className="page-header-subtitle">
            Client education content, frequently asked questions, and the 4-stage studio development workflow
          </p>
        </div>
        <div className="page-header-actions">
          {activeTab === 'faqs' ? (
            <button
              className="btn btn-lime btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              onClick={() => {
                setEditingFaq(null);
                setFaqForm({ id: '', question: '', answer: '', status: 'Published' });
                setFaqModalOpen(true);
              }}
            >
              <Plus size={14} />
              <span>Add FAQ Item</span>
            </button>
          ) : (
            <button
              className="btn btn-lime btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              onClick={() => {
                setEditingStep(null);
                setStepForm({ id: '', number: '01.', title: '', desc: '', duration: 'Week 1', pillsInput: '', status: 'Published' });
                setStepModalOpen(true);
              }}
            >
              <Plus size={14} />
              <span>Add Process Step</span>
            </button>
          )}
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${activeTab === 'faqs' ? 'active' : ''}`}
            onClick={() => setActiveTab('faqs')}
          >
            FAQ Accordion ({faqs.length})
          </button>
          <button
            className={`filter-tab ${activeTab === 'process' ? 'active' : ''}`}
            onClick={() => setActiveTab('process')}
          >
            4-Stage Process Timeline ({processSteps.length})
          </button>
        </div>
      </div>

      {activeTab === 'faqs' ? (
        <div className="card">
          {faqs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon-wrap">
                <HelpCircle size={22} />
              </div>
              <div className="empty-state-title">No FAQs registered</div>
              <p className="empty-state-desc">Answer common client questions on timelines, IP ownership, and mobile apps.</p>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Answer Snippet</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {faqs.map((f) => (
                    <tr key={f.id}>
                      <td className="td-primary" style={{ maxWidth: '300px' }}>{f.question}</td>
                      <td>
                        <div style={{ maxWidth: '360px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {f.answer?.slice(0, 90)}...
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${(f.status || 'published').toLowerCase()}`}>
                          {f.status || 'Published'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="btn btn-navy btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                            onClick={() => handleOpenEditFaq(f)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger-outline btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                            onClick={() => handleDeleteFaq(f)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          {processSteps.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon-wrap">
                <Clock size={22} />
              </div>
              <div className="empty-state-title">No process steps registered</div>
              <p className="empty-state-desc">Define Discovery, UI/UX, Development, and Launch phases.</p>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Step #</th>
                    <th>Phase Title</th>
                    <th>Duration</th>
                    <th>Key Deliverables</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {processSteps.map((s) => (
                    <tr key={s.id}>
                      <td style={{ color: 'var(--brand-lime)', fontWeight: 700 }}>{s.number || '01.'}</td>
                      <td className="td-primary">{s.title}</td>
                      <td>{s.duration || 'Week 1'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '240px' }}>
                          {(s.pills || []).map((p) => (
                            <span key={p} style={{ fontSize: '0.68rem', background: 'rgba(255, 255, 255, 0.06)', padding: '2px 6px', borderRadius: '4px' }}>
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${(s.status || 'published').toLowerCase()}`}>
                          {s.status || 'Published'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="btn btn-navy btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                            onClick={() => handleOpenEditStep(s)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger-outline btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                            onClick={() => handleDeleteStep(s)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* FAQ Modal */}
      <Modal
        isOpen={faqModalOpen}
        onClose={() => setFaqModalOpen(false)}
        title={editingFaq ? 'Edit FAQ Item' : 'Add FAQ Item'}
        maxWidth="600px"
        footer={
          <>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setFaqModalOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-lime btn-sm" onClick={handleSaveFaq} disabled={saving}>
              <span>{saving ? 'Saving...' : 'Save FAQ'}</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveFaq}>
          <div className="form-group">
            <label className="form-label" htmlFor="faqQuestion">Question *</label>
            <input
              type="text"
              id="faqQuestion"
              className="form-control"
              value={faqForm.question}
              onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
              placeholder="e.g. How long does a typical project take from start to launch?"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="faqAnswer">Answer *</label>
            <textarea
              id="faqAnswer"
              className="form-control"
              rows="4"
              value={faqForm.answer}
              onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
              placeholder="Comprehensive studio response..."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="faqStatus">Status</label>
            <select
              id="faqStatus"
              className="form-control"
              value={faqForm.status}
              onChange={(e) => setFaqForm({ ...faqForm, status: e.target.value })}
            >
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Step Modal */}
      <Modal
        isOpen={stepModalOpen}
        onClose={() => setStepModalOpen(false)}
        title={editingStep ? `Edit Process Step: ${editingStep.title}` : 'Add Process Step'}
        maxWidth="600px"
        footer={
          <>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setStepModalOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-lime btn-sm" onClick={handleSaveStep} disabled={saving}>
              <span>{saving ? 'Saving...' : 'Save Step'}</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveStep}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="stepNum">Step Number</label>
              <input
                type="text"
                id="stepNum"
                className="form-control"
                value={stepForm.number}
                onChange={(e) => setStepForm({ ...stepForm, number: e.target.value })}
                placeholder="01."
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="stepDuration">Duration</label>
              <input
                type="text"
                id="stepDuration"
                className="form-control"
                value={stepForm.duration}
                onChange={(e) => setStepForm({ ...stepForm, duration: e.target.value })}
                placeholder="e.g. Week 1"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="stepTitle">Phase Title *</label>
            <input
              type="text"
              id="stepTitle"
              className="form-control"
              value={stepForm.title}
              onChange={(e) => setStepForm({ ...stepForm, title: e.target.value })}
              placeholder="e.g. Discovery &amp; Strategy"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="stepDesc">Description</label>
            <textarea
              id="stepDesc"
              className="form-control"
              rows="3"
              value={stepForm.desc}
              onChange={(e) => setStepForm({ ...stepForm, desc: e.target.value })}
              placeholder="Brief summary of activities in this phase..."
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="stepPills">Deliverables Pills (Comma separated)</label>
            <input
              type="text"
              id="stepPills"
              className="form-control"
              value={stepForm.pillsInput}
              onChange={(e) => setStepForm({ ...stepForm, pillsInput: e.target.value })}
              placeholder="SRS Blueprint, User Personas, Tech Stack Selection"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
