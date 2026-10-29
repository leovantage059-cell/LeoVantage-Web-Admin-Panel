import React, { useState } from 'react';
import { Inbox, Sparkles } from 'lucide-react';
import Drawer from '../components/Drawer';
import { 
  updateInquiryStatus, 
  addInquiryNote, 
  deleteInquiry, 
  convertInquiryToClient,
  formatDate 
} from '../services/firestoreService';

export default function InquiriesView({ inquiries = [], showToast, setCurrentView }) {
  const [filter, setFilter] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [converting, setConverting] = useState(false);

  const handleOpenDrawer = (inq) => {
    setSelectedInquiry(inq);
    setDrawerOpen(true);
  };

  const handleStatusChange = async (inquiryId, newStatus) => {
    try {
      await updateInquiryStatus(inquiryId, newStatus);
      showToast(`Inquiry status updated to ${newStatus}`, 'success');
      if (selectedInquiry && selectedInquiry.id === inquiryId) {
        setSelectedInquiry((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteInput.trim() || !selectedInquiry) return;

    try {
      await addInquiryNote(selectedInquiry.id, noteInput.trim(), 'Admin');
      const newNote = {
        text: noteInput.trim(),
        author: 'Admin',
        createdAt: new Date().toISOString()
      };
      setSelectedInquiry((prev) => ({
        ...prev,
        notes: [...(prev.notes || []), newNote]
      }));
      setNoteInput('');
      showToast('Internal note recorded', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save note', 'error');
    }
  };

  const handleConvertClient = async () => {
    if (!selectedInquiry) return;
    setConverting(true);
    try {
      const clientId = await convertInquiryToClient(selectedInquiry);
      showToast(`Inquiry converted to active client account (${clientId})!`, 'success');
      setSelectedInquiry((prev) => ({ ...prev, status: 'Converted' }));
      setDrawerOpen(false);
      setCurrentView('clients');
    } catch (err) {
      showToast(err.message || 'Failed to convert inquiry', 'error');
    } finally {
      setConverting(false);
    }
  };

  const handleDelete = async (inq) => {
    if (!window.confirm(`Delete inquiry from "${inq.name}"?`)) return;
    try {
      await deleteInquiry(inq.id);
      showToast('Inquiry deleted from CRM', 'success');
      if (selectedInquiry?.id === inq.id) {
        setDrawerOpen(false);
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete inquiry', 'error');
    }
  };

  const filteredInquiries = inquiries.filter((inq) => {
    if (filter === 'all') return true;
    return (inq.status || 'New').toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="view-section">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Inquiries &amp; Leads</h1>
          <p className="page-header-subtitle">
            Lead capture pipeline from the website's Project Brief form • Review submissions and convert to studio clients
          </p>
        </div>
        <div className="page-header-actions">
          <span className="badge badge-published" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
            Pipeline Synced
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-bar">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Briefs ({inquiries.length})
          </button>
          <button
            className={`filter-tab ${filter === 'new' ? 'active' : ''}`}
            onClick={() => setFilter('new')}
          >
            New Leads ({inquiries.filter((i) => (i.status || 'New') === 'New').length})
          </button>
          <button
            className={`filter-tab ${filter === 'contacted' ? 'active' : ''}`}
            onClick={() => setFilter('contacted')}
          >
            Contacted ({inquiries.filter((i) => i.status === 'Contacted').length})
          </button>
          <button
            className={`filter-tab ${filter === 'qualified' ? 'active' : ''}`}
            onClick={() => setFilter('qualified')}
          >
            Qualified ({inquiries.filter((i) => i.status === 'Qualified').length})
          </button>
          <button
            className={`filter-tab ${filter === 'converted' ? 'active' : ''}`}
            onClick={() => setFilter('converted')}
          >
            Converted ({inquiries.filter((i) => i.status === 'Converted').length})
          </button>
          <button
            className={`filter-tab ${filter === 'closed' ? 'active' : ''}`}
            onClick={() => setFilter('closed')}
          >
            Closed ({inquiries.filter((i) => i.status === 'Closed').length})
          </button>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="card">
        {filteredInquiries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon-wrap">
              <Inbox size={22} />
            </div>
            <div className="empty-state-title">No inquiries in this category</div>
            <p className="empty-state-desc">
              When prospective clients submit the Project Brief form on the public website, briefs appear here in real time.
            </p>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client Name &amp; Contact</th>
                  <th>Requested Service</th>
                  <th>Estimated Budget</th>
                  <th>Target Launch</th>
                  <th>Submitted At</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInquiries.map((inq) => (
                  <tr key={inq.id}>
                    <td>
                      <div className="td-primary">{inq.name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        <a href={`mailto:${inq.email}`} style={{ color: 'var(--brand-lime)' }}>{inq.email}</a>
                        {inq.phone && ` • ${inq.phone}`}
                      </div>
                    </td>
                    <td>{inq.service || 'Custom Web Dev'}</td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--brand-lime)', fontWeight: 600 }}>
                        {inq.budget || '—'}
                      </span>
                    </td>
                    <td>{inq.timeline || 'Immediate'}</td>
                    <td>{formatDate(inq.createdAt || inq.submittedAt)}</td>
                    <td>
                      <select
                        value={inq.status || 'New'}
                        onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                        className={`badge badge-${(inq.status || 'new').toLowerCase().replace(' ', '-')}`}
                        style={{ cursor: 'pointer', outline: 'none' }}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Proposal Sent">Proposal Sent</option>
                        <option value="Converted">Converted</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn btn-navy btn-sm"
                          style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                          onClick={() => handleOpenDrawer(inq)}
                        >
                          View Brief
                        </button>
                        <button
                          className="btn btn-danger-outline btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.76rem' }}
                          onClick={() => handleDelete(inq)}
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

      {/* Inspection Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedInquiry ? `Inquiry Brief: ${selectedInquiry.name}` : 'Brief Details'}
        footer={
          <>
            {selectedInquiry?.status !== 'Converted' && (
              <button
                type="button"
                className="btn btn-lime btn-sm"
                onClick={handleConvertClient}
                disabled={converting}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Sparkles size={14} />
                <span>{converting ? 'Converting...' : 'Convert to Studio Client'}</span>
              </button>
            )}
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setDrawerOpen(false)}
            >
              Close
            </button>
          </>
        }
      >
        {selectedInquiry && (
          <div>
            {/* Top Contact Card */}
            <div
              style={{
                background: 'var(--brand-navy-secondary)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '20px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {selectedInquiry.name}
                </span>
                <span className={`badge badge-${(selectedInquiry.status || 'new').toLowerCase().replace(' ', '-')}`}>
                  {selectedInquiry.status || 'New'}
                </span>
              </div>

              <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>Email: <a href={`mailto:${selectedInquiry.email}`} style={{ color: 'var(--brand-lime)' }}>{selectedInquiry.email}</a></div>
                {selectedInquiry.phone && <div>Phone: <a href={`tel:${selectedInquiry.phone}`} style={{ color: 'var(--text-main)' }}>{selectedInquiry.phone}</a></div>}
                <div>Submitted: {formatDate(selectedInquiry.createdAt || selectedInquiry.submittedAt)}</div>
              </div>
            </div>

            {/* Scope Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Service</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{selectedInquiry.service}</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Budget Range</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--brand-lime)' }}>{selectedInquiry.budget || 'Unspecified'}</div>
              </div>
            </div>

            {/* Project Overview Message */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Project Overview &amp; Goals
              </div>
              <div
                style={{
                  background: 'var(--surface-deep)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                {selectedInquiry.message || 'No additional message provided.'}
              </div>
            </div>

            {/* Internal Admin Notes Section */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
                Internal Team Notes
              </div>

              {selectedInquiry.notes && selectedInquiry.notes.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                  {selectedInquiry.notes.map((note, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.84rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: '4px' }}>
                        <span>{note.author || 'Admin'}</span>
                        <span>{formatDate(note.createdAt)}</span>
                      </div>
                      <div style={{ color: 'var(--text-main)' }}>{note.text}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  No internal notes recorded yet.
                </p>
              )}

              <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ height: '36px', fontSize: '0.82rem' }}
                  placeholder="Add quick follow-up note..."
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                />
                <button type="submit" className="btn btn-navy btn-sm" style={{ flexShrink: 0 }}>
                  Add Note
                </button>
              </form>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
