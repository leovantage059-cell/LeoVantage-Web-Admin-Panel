import React, { useState } from 'react';
import { FileText, PhoneCall, Plus, X } from 'lucide-react';
import Modal from '../components/Modal';
import { saveNote, deleteNote, saveCallRecord, deleteCallRecord, formatDate } from '../services/firestoreService';

export default function NotesCallsView({ notes = [], callRecords = [], showToast }) {
  const [activeTab, setActiveTab] = useState('notes');
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [callModalOpen, setCallModalOpen] = useState(false);

  const [noteForm, setNoteForm] = useState({ id: '', title: '', content: '', tags: 'Architecture', pinned: false });
  const [callForm, setCallForm] = useState({ id: '', contactName: '', contactEmail: '', callType: 'Discovery', durationMinutes: 20, summary: '', actionItems: '' });
  const [saving, setSaving] = useState(false);

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!noteForm.title.trim()) return;
    setSaving(true);
    try {
      await saveNote(noteForm);
      showToast('Studio note pinned.', 'success');
      setNoteModalOpen(false);
      setNoteForm({ id: '', title: '', content: '', tags: 'Architecture', pinned: false });
    } catch (err) {
      showToast(err.message || 'Failed to save note', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (n) => {
    if (!window.confirm(`Delete note "${n.title}"?`)) return;
    try {
      await deleteNote(n.id);
      showToast('Note deleted', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete note', 'error');
    }
  };

  const handleSaveCall = async (e) => {
    e.preventDefault();
    if (!callForm.contactName.trim()) return;
    setSaving(true);
    try {
      await saveCallRecord(callForm);
      showToast('Call record registered.', 'success');
      setCallModalOpen(false);
      setCallForm({ id: '', contactName: '', contactEmail: '', callType: 'Discovery', durationMinutes: 20, summary: '', actionItems: '' });
    } catch (err) {
      showToast(err.message || 'Failed to save call log', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCall = async (c) => {
    if (!window.confirm(`Delete call record for "${c.contactName}"?`)) return;
    try {
      await deleteCallRecord(c.id);
      showToast('Call log deleted', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete call log', 'error');
    }
  };

  return (
    <div className="view-section">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Notes &amp; Call Archive</h1>
          <p className="page-header-subtitle">
            Internal meeting debriefs, client calls, architecture decisions, and action items
          </p>
        </div>
        <div className="page-header-actions">
          {activeTab === 'notes' ? (
            <button className="btn btn-lime btn-sm" onClick={() => setNoteModalOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={14} />
              <span>Create Note</span>
            </button>
          ) : (
            <button className="btn btn-lime btn-sm" onClick={() => setCallModalOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={14} />
              <span>Log Meeting Call</span>
            </button>
          )}
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            Studio Notes Wall ({notes.length})
          </button>
          <button
            className={`filter-tab ${activeTab === 'calls' ? 'active' : ''}`}
            onClick={() => setActiveTab('calls')}
          >
            Call Register ({callRecords.length})
          </button>
        </div>
      </div>

      {activeTab === 'notes' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {notes.length === 0 ? (
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <div className="empty-state">
                <div className="empty-state-icon-wrap">
                  <FileText size={22} />
                </div>
                <div className="empty-state-title">No notes recorded</div>
                <p className="empty-state-desc">Pin technical architecture notes, contract clauses, or sprint ideas.</p>
                <button className="btn btn-lime btn-sm" onClick={() => setNoteModalOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={14} />
                  <span>Pin First Note</span>
                </button>
              </div>
            </div>
          ) : (
            notes.map((n) => (
              <div
                key={n.id}
                style={{
                  background: 'var(--surface-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>{n.title}</h3>
                  <button
                    onClick={() => handleDeleteNote(n)}
                    style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none', padding: 0, display: 'inline-flex', alignItems: 'center' }}
                    aria-label="Delete note"
                  >
                    <X size={13} />
                  </button>
                </div>

                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.5', flex: 1, whiteSpace: 'pre-wrap' }}>
                  {n.content}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span className="badge badge-discovery">{n.tags || 'General'}</span>
                  <span>{formatDate(n.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="card">
          {callRecords.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon-wrap">
                <PhoneCall size={22} />
              </div>
              <div className="empty-state-title">No meeting calls logged</div>
              <p className="empty-state-desc">Record discovery strategy sessions, sprint reviews, and follow-up action items.</p>
              <button className="btn btn-lime btn-sm" onClick={() => setCallModalOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={14} />
                <span>Log Meeting Call</span>
              </button>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Participant</th>
                    <th>Type</th>
                    <th>Duration</th>
                    <th>Summary</th>
                    <th>Action Items</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {callRecords.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className="td-primary">{c.contactName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.contactEmail}</div>
                      </td>
                      <td>
                        <span className="badge badge-contacted">{c.callType}</span>
                      </td>
                      <td>{c.durationMinutes} mins</td>
                      <td style={{ maxWidth: '260px', fontSize: '0.8rem' }}>{c.summary}</td>
                      <td style={{ maxWidth: '200px', fontSize: '0.8rem', color: 'var(--brand-lime)' }}>{c.actionItems || '—'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-danger-outline btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                          onClick={() => handleDeleteCall(c)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Note Modal */}
      <Modal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        title="Pin Studio Note"
        maxWidth="500px"
        footer={
          <>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setNoteModalOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-lime btn-sm" onClick={handleSaveNote} disabled={saving}>
              <span>{saving ? 'Pinning...' : 'Save Note'}</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveNote}>
          <div className="form-group">
            <label className="form-label" htmlFor="noteTitle">Note Title *</label>
            <input
              type="text"
              id="noteTitle"
              className="form-control"
              value={noteForm.title}
              onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
              placeholder="e.g. Supabase vs Firebase latency benchmarks"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="noteContent">Content *</label>
            <textarea
              id="noteContent"
              className="form-control"
              rows="4"
              value={noteForm.content}
              onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
              placeholder="Key thoughts, architecture choices, decision log..."
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="noteTags">Category Tag</label>
            <input
              type="text"
              id="noteTags"
              className="form-control"
              value={noteForm.tags}
              onChange={(e) => setNoteForm({ ...noteForm, tags: e.target.value })}
              placeholder="Architecture, Legal, Sales, Sprints"
            />
          </div>
        </form>
      </Modal>

      {/* Call Modal */}
      <Modal
        isOpen={callModalOpen}
        onClose={() => setCallModalOpen(false)}
        title="Log Meeting Call"
        maxWidth="560px"
        footer={
          <>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setCallModalOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-lime btn-sm" onClick={handleSaveCall} disabled={saving}>
              <span>{saving ? 'Saving...' : 'Record Call Log'}</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveCall}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="callContact">Client / Contact Name *</label>
              <input
                type="text"
                id="callContact"
                className="form-control"
                value={callForm.contactName}
                onChange={(e) => setCallForm({ ...callForm, contactName: e.target.value })}
                placeholder="e.g. Anand Kapoor"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="callEmail">Contact Email</label>
              <input
                type="email"
                id="callEmail"
                className="form-control"
                value={callForm.contactEmail}
                onChange={(e) => setCallForm({ ...callForm, contactEmail: e.target.value })}
                placeholder="anand@company.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="callType">Call Type</label>
              <select
                id="callType"
                className="form-control"
                value={callForm.callType}
                onChange={(e) => setCallForm({ ...callForm, callType: e.target.value })}
              >
                <option value="Discovery">Initial Discovery Strategy</option>
                <option value="Sprint Review">Bi-Weekly Sprint Demo</option>
                <option value="Tech Deepdive">Technical Architecture Deepdive</option>
                <option value="Commercials">Contract &amp; Commercials</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="callDuration">Duration (Minutes)</label>
              <input
                type="number"
                id="callDuration"
                className="form-control"
                value={callForm.durationMinutes}
                onChange={(e) => setCallForm({ ...callForm, durationMinutes: e.target.value })}
                min="5"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="callSummary">Discussion Summary</label>
            <textarea
              id="callSummary"
              className="form-control"
              rows="3"
              value={callForm.summary}
              onChange={(e) => setCallForm({ ...callForm, summary: e.target.value })}
              placeholder="Key decisions, feature scope discussions..."
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="callActions">Action Items &amp; Next Steps</label>
            <input
              type="text"
              id="callActions"
              className="form-control"
              value={callForm.actionItems}
              onChange={(e) => setCallForm({ ...callForm, actionItems: e.target.value })}
              placeholder="Send SRS blueprint by Friday, schedule Figma walkthrough"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
