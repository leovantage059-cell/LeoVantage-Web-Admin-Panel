import React, { useState } from 'react';
import { Building2, Plus } from 'lucide-react';
import Modal from '../components/Modal';
import { saveClient, deleteClient, formatINR } from '../services/firestoreService';

export default function ClientsView({ clients = [], showToast, modalOpen, setModalOpen }) {
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState(getInitialForm());
  const [saving, setSaving] = useState(false);

  function getInitialForm() {
    return {
      id: '',
      name: '',
      company: '',
      email: '',
      phone: '',
      status: 'Active',
      tier: 'Growth',
      totalBilled: 0,
      outstanding: 0,
      projectsCount: 1,
      notes: ''
    };
  }

  const handleOpenCreate = () => {
    setEditingClient(null);
    setFormData(getInitialForm());
    setModalOpen(true);
  };

  const handleOpenEdit = (client) => {
    setEditingClient(client);
    setFormData({
      id: client.id || '',
      name: client.name || '',
      company: client.company || '',
      email: client.email || '',
      phone: client.phone || '',
      status: client.status || 'Active',
      tier: client.tier || 'Growth',
      totalBilled: client.totalBilled || 0,
      outstanding: client.outstanding || 0,
      projectsCount: client.projectsCount || 1,
      notes: client.notes || ''
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Client contact name is required.', 'error');
      return;
    }

    setSaving(true);
    try {
      await saveClient(formData);
      showToast(`Client "${formData.name}" saved successfully.`, 'success');
      setModalOpen(false);
    } catch (err) {
      console.error('Error saving client:', err);
      showToast(err.message || 'Failed to save client.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (client) => {
    if (!window.confirm(`Delete client record for "${client.name}" (${client.company})?`)) return;
    try {
      await deleteClient(client.id);
      showToast('Client record deleted.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete client.', 'error');
    }
  };

  return (
    <div className="view-section">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Clients Directory</h1>
          <p className="page-header-subtitle">
            Enterprise and growth partners • Accounts, contracts, and lifetime billing history
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-lime btn-sm" onClick={handleOpenCreate} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={14} />
            <span>Add Client</span>
          </button>
        </div>
      </div>

      <div className="card">
        {clients.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon-wrap">
              <Building2 size={22} />
            </div>
            <div className="empty-state-title">No client accounts yet</div>
            <p className="empty-state-desc">Convert website inquiries to clients or register new partners here.</p>
            <button className="btn btn-lime btn-sm" onClick={handleOpenCreate} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={14} />
              <span>Create First Client</span>
            </button>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client &amp; Organization</th>
                  <th>Contact Email / Phone</th>
                  <th>Tier</th>
                  <th>Active Projects</th>
                  <th>Total Billed</th>
                  <th>Outstanding</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="td-primary">{c.name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{c.company || 'Private Client'}</div>
                    </td>
                    <td>
                      <div>{c.email || '—'}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{c.phone || ''}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.78rem', color: 'var(--status-blue)', fontWeight: 600 }}>
                        {c.tier || 'Growth'}
                      </span>
                    </td>
                    <td>{c.projectsCount || 1}</td>
                    <td style={{ color: 'var(--brand-lime)', fontWeight: 600 }}>
                      {formatINR(c.totalBilled)}
                    </td>
                    <td style={{ color: c.outstanding > 0 ? 'var(--status-amber)' : 'var(--text-muted)' }}>
                      {formatINR(c.outstanding)}
                    </td>
                    <td>
                      <span className={`badge badge-${(c.status || 'active').toLowerCase()}`}>
                        {c.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn btn-navy btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                          onClick={() => handleOpenEdit(c)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger-outline btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                          onClick={() => handleDelete(c)}
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

      {/* Client Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingClient ? `Edit Client: ${editingClient.name}` : 'Register New Studio Client'}
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-lime btn-sm"
              onClick={handleSave}
              disabled={saving}
            >
              <span>{saving ? 'Saving...' : 'Save Client Account'}</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="clientName">Primary Contact Name *</label>
              <input
                type="text"
                id="clientName"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Anand Kapoor"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="company">Company / Institution</label>
              <input
                type="text"
                id="company"
                name="company"
                className="form-control"
                value={formData.company}
                onChange={handleChange}
                placeholder="e.g. PID Academy"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="clientEmail">Email Address</label>
              <input
                type="email"
                id="clientEmail"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                placeholder="anand@pidacademy.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="clientPhone">Phone / WhatsApp</label>
              <input
                type="tel"
                id="clientPhone"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label" htmlFor="clientTier">Account Tier</label>
              <select
                id="clientTier"
                name="tier"
                className="form-control"
                value={formData.tier}
                onChange={handleChange}
              >
                <option value="Growth">Growth / App</option>
                <option value="Starter">Starter</option>
                <option value="Enterprise">Enterprise ERP</option>
                <option value="Retainer">Monthly Retainer</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="clientStatus">Account Status</label>
              <select
                id="clientStatus"
                name="status"
                className="form-control"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Onboarding">Onboarding</option>
                <option value="Completed">Completed</option>
                <option value="Paused">Paused</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="projectsCount">Active Projects</label>
              <input
                type="number"
                id="projectsCount"
                name="projectsCount"
                className="form-control"
                value={formData.projectsCount}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="totalBilled">Total Billed to Date (INR)</label>
              <input
                type="number"
                id="totalBilled"
                name="totalBilled"
                className="form-control"
                value={formData.totalBilled}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="outstanding">Outstanding Balance (INR)</label>
              <input
                type="number"
                id="outstanding"
                name="outstanding"
                className="form-control"
                value={formData.outstanding}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="notes">Account Scope &amp; Notes</label>
            <textarea
              id="notes"
              name="notes"
              className="form-control"
              rows="2"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Key agreements, tech stack requirements, payment terms..."
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
