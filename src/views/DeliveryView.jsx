import React, { useState } from 'react';
import { Milestone, Plus } from 'lucide-react';
import Modal from '../components/Modal';
import { saveDeliveryProject, deleteDeliveryProject, formatINR, formatDate } from '../services/firestoreService';

export default function DeliveryView({ deliveryProjects = [], clients = [], showToast, modalOpen, setModalOpen }) {
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState(getInitialForm());
  const [saving, setSaving] = useState(false);

  function getInitialForm() {
    return {
      id: '',
      name: '',
      clientName: clients[0]?.name || '',
      clientId: clients[0]?.id || '',
      stage: 'Sprint 1',
      progress: 30,
      targetDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      budget: 125000,
      techStackInput: 'React Native, Expo, Node.js'
    };
  }

  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormData(getInitialForm());
    setModalOpen(true);
  };

  const handleOpenEdit = (proj) => {
    setEditingProject(proj);
    setFormData({
      id: proj.id || '',
      name: proj.name || '',
      clientName: proj.clientName || '',
      clientId: proj.clientId || '',
      stage: proj.stage || 'Sprint 1',
      progress: proj.progress || 0,
      targetDate: proj.targetDate || '',
      budget: proj.budget || 0,
      techStackInput: Array.isArray(proj.techStack) ? proj.techStack.join(', ') : ''
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Project delivery name is required.', 'error');
      return;
    }

    setSaving(true);
    try {
      const techStack = formData.techStackInput
        ? formData.techStackInput.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      await saveDeliveryProject({
        ...formData,
        techStack
      });

      showToast(`Delivery project "${formData.name}" saved.`, 'success');
      setModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Failed to save delivery project.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleStageChange = async (proj, newStage) => {
    try {
      await saveDeliveryProject({
        ...proj,
        stage: newStage,
        progress: newStage === 'Launched' ? 100 : proj.progress
      });
      showToast(`Milestone updated to ${newStage}`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update stage', 'error');
    }
  };

  const handleDelete = async (proj) => {
    if (!window.confirm(`Delete delivery project "${proj.name}"?`)) return;
    try {
      await deleteDeliveryProject(proj.id);
      showToast('Project removed.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete project', 'error');
    }
  };

  return (
    <div className="view-section">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Delivery &amp; Sprint Milestones</h1>
          <p className="page-header-subtitle">
            Client project roadmaps, sprint phase tracking, velocity, and launch readiness
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-lime btn-sm" onClick={handleOpenCreate} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={14} />
            <span>Add Delivery Project</span>
          </button>
        </div>
      </div>

      <div className="card">
        {deliveryProjects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon-wrap">
              <Milestone size={22} />
            </div>
            <div className="empty-state-title">No client deliveries in flight</div>
            <p className="empty-state-desc">Create delivery sprints for confirmed client contracts.</p>
            <button className="btn btn-lime btn-sm" onClick={handleOpenCreate} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={14} />
              <span>Add First Delivery Project</span>
            </button>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product / Project</th>
                  <th>Client</th>
                  <th>Stage</th>
                  <th style={{ minWidth: '160px' }}>Progress</th>
                  <th>Target Launch</th>
                  <th>Contract Value</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deliveryProjects.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="td-primary">{p.name}</div>
                      <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                        {(p.techStack || []).slice(0, 3).map((t) => (
                          <span key={t} style={{ fontSize: '0.68rem', background: 'var(--card-bg-nested)', padding: '1px 5px', borderRadius: '3px' }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{p.clientName || 'Studio Account'}</td>
                    <td>
                      <select
                        value={p.stage || 'Sprint 1'}
                        onChange={(e) => handleStageChange(p, e.target.value)}
                        className="badge badge-in-progress"
                        style={{ cursor: 'pointer', outline: 'none' }}
                      >
                        <option value="Sprint 1">Sprint 1 (Architecture)</option>
                        <option value="Sprint 2">Sprint 2 (Development)</option>
                        <option value="QA">QA &amp; Hardening</option>
                        <option value="Review">Client Staging Review</option>
                        <option value="Launched">Launched (Production)</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1, height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${p.progress || 0}%`, height: '100%', background: 'var(--brand-lime)', borderRadius: '3px' }} />
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-main)', minWidth: '35px' }}>
                          {p.progress || 0}%
                        </span>
                      </div>
                    </td>
                    <td>{formatDate(p.targetDate)}</td>
                    <td style={{ color: 'var(--brand-lime)', fontWeight: 600 }}>
                      {formatINR(p.budget)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn btn-navy btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                          onClick={() => handleOpenEdit(p)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger-outline btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                          onClick={() => handleDelete(p)}
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

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProject ? `Edit Sprint: ${editingProject.name}` : 'Create Client Delivery Project'}
        maxWidth="640px"
        footer={
          <>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-lime btn-sm" onClick={handleSave} disabled={saving}>
              <span>{saving ? 'Saving...' : 'Save Milestone'}</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="delName">Project Name *</label>
              <input
                type="text"
                id="delName"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. PID Education Suite"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="delClient">Client Account</label>
              <select
                id="delClient"
                className="form-control"
                value={formData.clientName}
                onChange={(e) => {
                  const selClient = clients.find((c) => c.name === e.target.value);
                  setFormData({
                    ...formData,
                    clientName: e.target.value,
                    clientId: selClient?.id || ''
                  });
                }}
              >
                <option value="">Select client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.name}>{c.name} ({c.company})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="delStage">Delivery Stage</label>
              <select
                id="delStage"
                className="form-control"
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              >
                <option value="Sprint 1">Sprint 1 (Architecture &amp; Wireframes)</option>
                <option value="Sprint 2">Sprint 2 (Development &amp; APIs)</option>
                <option value="QA">QA &amp; Accessibility Verification</option>
                <option value="Review">Client Staging Review</option>
                <option value="Launched">Launched &amp; Handed Over</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="delProgress">Progress: {formData.progress}%</label>
              <input
                type="range"
                id="delProgress"
                min="0"
                max="100"
                style={{ width: '100%', height: '36px', accentColor: '#C7F36B' }}
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="delTarget">Target Launch Date</label>
              <input
                type="date"
                id="delTarget"
                className="form-control"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="delBudget">Contract Value (INR)</label>
              <input
                type="number"
                id="delBudget"
                className="form-control"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="delTech">Tech Stack (Comma separated)</label>
            <input
              type="text"
              id="delTech"
              className="form-control"
              value={formData.techStackInput}
              onChange={(e) => setFormData({ ...formData, techStackInput: e.target.value })}
              placeholder="React, Next.js, Node.js, Supabase"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
