import React, { useState } from 'react';
import { Star, Plus } from 'lucide-react';
import Modal from '../components/Modal';
import { saveReview, deleteReview } from '../services/firestoreService';

export default function ReviewsView({ reviews = [], showToast }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [formData, setFormData] = useState(getInitialForm());
  const [saving, setSaving] = useState(false);

  function getInitialForm() {
    return {
      id: '',
      name: '',
      role: '',
      initials: '',
      project: '',
      stars: 5,
      quote: '',
      status: 'Published'
    };
  }

  const handleOpenCreate = () => {
    setEditingReview(null);
    setFormData(getInitialForm());
    setModalOpen(true);
  };

  const handleOpenEdit = (r) => {
    setEditingReview(r);
    setFormData({
      id: r.id || '',
      name: r.name || '',
      role: r.role || '',
      initials: r.initials || '',
      project: r.project || '',
      stars: r.stars || 5,
      quote: r.quote || '',
      status: r.status || 'Published'
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.quote.trim()) {
      showToast('Client name and review quote are required.', 'error');
      return;
    }

    setSaving(true);
    try {
      await saveReview({
        id: formData.id || undefined,
        name: formData.name.trim(),
        role: formData.role.trim(),
        initials: formData.initials || formData.name.slice(0, 2).toUpperCase(),
        project: formData.project.trim().toUpperCase(),
        stars: parseInt(formData.stars, 10) || 5,
        quote: formData.quote.trim(),
        status: formData.status
      });

      showToast(`Review from "${formData.name}" saved.`, 'success');
      setModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Failed to save review.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (r) => {
    if (!window.confirm(`Delete review from "${r.name}"?`)) return;
    try {
      await deleteReview(r.id);
      showToast('Review deleted.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete review.', 'error');
    }
  };

  return (
    <div className="view-section">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Client Reviews &amp; Testimonials</h1>
          <p className="page-header-subtitle">
            Manage verified client ratings, quotes, and project attribution shown on the public site
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-lime btn-sm" onClick={handleOpenCreate} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={14} />
            <span>Add Client Review</span>
          </button>
        </div>
      </div>

      <div className="card">
        {reviews.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon-wrap">
              <Star size={22} />
            </div>
            <div className="empty-state-title">No client reviews registered</div>
            <p className="empty-state-desc">Publish verified client quotes and star feedback.</p>
            <button className="btn btn-lime btn-sm" onClick={handleOpenCreate} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={14} />
              <span>Add First Review</span>
            </button>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Designation / Organization</th>
                  <th>Associated Project</th>
                  <th>Rating</th>
                  <th>Quote Snippet</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="td-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="admin-avatar" style={{ border: '1px solid var(--border-medium)', color: 'var(--brand-lime)' }}>
                          {r.initials || 'C'}
                        </div>
                        <span>{r.name}</span>
                      </div>
                    </td>
                    <td>{r.role}</td>
                    <td>
                      <span style={{ fontSize: '0.78rem', color: 'var(--brand-lime)', fontWeight: 600 }}>
                        {r.project}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            fill={i < (r.stars || 5) ? 'var(--status-amber)' : 'none'}
                            color={i < (r.stars || 5) ? 'var(--status-amber)' : 'var(--text-muted)'}
                            strokeWidth={1.5}
                          />
                        ))}
                        <span style={{ fontSize: '0.74rem', marginLeft: '4px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                          {r.stars || 5}.0
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ maxWidth: '280px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {r.quote?.slice(0, 80)}...
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${(r.status || 'published').toLowerCase()}`}>
                        {r.status || 'Published'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn btn-navy btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                          onClick={() => handleOpenEdit(r)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger-outline btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                          onClick={() => handleDelete(r)}
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

      {/* Review Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingReview ? `Edit Review: ${editingReview.name}` : 'Add Client Review'}
        maxWidth="600px"
        footer={
          <>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-lime btn-sm" onClick={handleSave} disabled={saving}>
              <span>{saving ? 'Saving...' : 'Save Review'}</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="revName">Client Contact Name *</label>
              <input
                type="text"
                id="revName"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Anand Kapoor"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="revRole">Role &amp; Company</label>
              <input
                type="text"
                id="revRole"
                className="form-control"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Director, PID Academy"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="revProject">Associated Project Name</label>
              <input
                type="text"
                id="revProject"
                className="form-control"
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                placeholder="e.g. PID EDUCATION ERP"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="revStars">Star Rating (1–5)</label>
              <select
                id="revStars"
                className="form-control"
                value={formData.stars}
                onChange={(e) => setFormData({ ...formData, stars: e.target.value })}
              >
                <option value="5">5 Stars (Exceptional)</option>
                <option value="4">4 Stars (Very Good)</option>
                <option value="3">3 Stars (Good)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="revQuote">Client Testimonial Quote *</label>
            <textarea
              id="revQuote"
              className="form-control"
              rows="4"
              value={formData.quote}
              onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
              placeholder='"LeoVantage transformed our school entire digital ecosystem..."'
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="revStatus">Publication Status</label>
            <select
              id="revStatus"
              className="form-control"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
