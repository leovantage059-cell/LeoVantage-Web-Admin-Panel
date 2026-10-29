import React, { useState } from 'react';
import Modal from '../components/Modal';
import { saveTeamMember, deleteTeamMember } from '../services/firestoreService';

export default function TeamView({ teamMembers = [], showToast }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState(getInitialForm());
  const [saving, setSaving] = useState(false);

  function getInitialForm() {
    return {
      id: '',
      name: '',
      role: '',
      initials: '',
      experience: '5+ Years',
      location: 'Bengaluru, India',
      quote: '',
      bio: '',
      extendedBio: '',
      skillsInput: 'React, Node.js, Architecture',
      highlightsInput: 'Designed high-concurrency systems\nMaintained 99.9% uptime',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      email: '',
      isFounder: false,
      status: 'Published'
    };
  }

  const handleOpenCreate = () => {
    setEditingMember(null);
    setFormData(getInitialForm());
    setModalOpen(true);
  };

  const handleOpenEdit = (m) => {
    setEditingMember(m);
    setFormData({
      id: m.id || '',
      name: m.name || '',
      role: m.role || '',
      initials: m.initials || '',
      experience: m.experience || '',
      location: m.location || '',
      quote: m.quote || '',
      bio: m.bio || '',
      extendedBio: m.extendedBio || '',
      skillsInput: Array.isArray(m.skills) ? m.skills.join(', ') : '',
      highlightsInput: Array.isArray(m.highlights) ? m.highlights.join('\n') : '',
      github: m.social?.github || '',
      linkedin: m.social?.linkedin || '',
      email: m.social?.email || '',
      isFounder: !!m.isFounder,
      status: m.status || 'Published'
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.role.trim()) {
      showToast('Name and role are required.', 'error');
      return;
    }

    setSaving(true);
    try {
      const skills = formData.skillsInput
        ? formData.skillsInput.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
      const highlights = formData.highlightsInput
        ? formData.highlightsInput.split('\n').map((h) => h.trim()).filter(Boolean)
        : [];

      await saveTeamMember({
        id: formData.id || undefined,
        name: formData.name.trim(),
        role: formData.role.trim(),
        initials: formData.initials || formData.name.slice(0, 2).toUpperCase(),
        experience: formData.experience,
        location: formData.location,
        quote: formData.quote,
        bio: formData.bio,
        extendedBio: formData.extendedBio,
        skills,
        highlights,
        social: {
          github: formData.github,
          linkedin: formData.linkedin,
          email: formData.email
        },
        isFounder: formData.isFounder,
        status: formData.status
      });

      showToast(`Team profile for "${formData.name}" saved.`, 'success');
      setModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Failed to save team member.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (m) => {
    if (!window.confirm(`Delete profile for "${m.name}"?`)) return;
    try {
      await deleteTeamMember(m.id);
      showToast('Profile deleted.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete member.', 'error');
    }
  };

  const founders = teamMembers.filter((m) => m.isFounder);
  const coreTeam = teamMembers.filter((m) => !m.isFounder);

  return (
    <div className="view-section">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">FOUNDERS &amp; CORE TEAM</h1>
          <p className="page-header-subtitle">
            Public profiles, skills matrix, and leadership credentials displayed on the public Team page
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-lime btn-sm" onClick={handleOpenCreate}>
            <span>+ Add Team Member</span>
          </button>
        </div>
      </div>

      {/* Founders Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">Co-Founders &amp; Leadership</h2>
            <span className="card-subtitle">Rahul, Gulesh Patel, Nitin Sinha</span>
          </div>
          <span className="badge badge-published">{founders.length} Active</span>
        </div>

        {founders.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No founders currently configured in database.</p>
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Founder</th>
                  <th>Designation</th>
                  <th>Location</th>
                  <th>Experience</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {founders.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div className="td-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="admin-avatar">{m.initials || 'F'}</div>
                        <div>
                          <div>{m.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{m.social?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{m.role}</td>
                    <td>{m.location || 'Bengaluru, India'}</td>
                    <td>{m.experience || '7+ Years'}</td>
                    <td>
                      <span className={`badge badge-${(m.status || 'published').toLowerCase()}`}>
                        {m.status || 'Published'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button className="btn btn-navy btn-sm" style={{ padding: '4px 8px', fontSize: '0.74rem' }} onClick={() => handleOpenEdit(m)}>
                          Edit
                        </button>
                        <button className="btn btn-danger-outline btn-sm" style={{ padding: '4px 8px', fontSize: '0.74rem' }} onClick={() => handleDelete(m)}>
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

      {/* Core Team Section */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Core Engineering &amp; Design Specialists</h2>
            <span className="card-subtitle">Senior designers, motion engineers, and architects</span>
          </div>
          <span className="badge badge-discovery">{coreTeam.length} Specialists</span>
        </div>

        {coreTeam.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No core team members registered.</p>
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Specialist</th>
                  <th>Role</th>
                  <th>Primary Skills</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coreTeam.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div className="td-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="admin-avatar" style={{ border: '1px solid var(--border-medium)', color: 'var(--text-secondary)' }}>
                          {m.initials || 'T'}
                        </div>
                        <span>{m.name}</span>
                      </div>
                    </td>
                    <td>{m.role}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '240px' }}>
                        {(m.skills || []).slice(0, 3).map((s) => (
                          <span key={s} style={{ fontSize: '0.68rem', background: 'rgba(255, 255, 255, 0.06)', padding: '2px 6px', borderRadius: '4px' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${(m.status || 'published').toLowerCase()}`}>
                        {m.status || 'Published'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button className="btn btn-navy btn-sm" style={{ padding: '4px 8px', fontSize: '0.74rem' }} onClick={() => handleOpenEdit(m)}>
                          Edit
                        </button>
                        <button className="btn btn-danger-outline btn-sm" style={{ padding: '4px 8px', fontSize: '0.74rem' }} onClick={() => handleDelete(m)}>
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

      {/* Member Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingMember ? `Edit Profile: ${editingMember.name}` : 'Add New Team Member'}
        maxWidth="680px"
        footer={
          <>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-lime btn-sm" onClick={handleSave} disabled={saving}>
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="memName">Full Name *</label>
              <input
                type="text"
                id="memName"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rahul"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="memRole">Role / Title *</label>
              <input
                type="text"
                id="memRole"
                className="form-control"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Co-Founder &amp; Lead Developer"
                required
              />
            </div>
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label" htmlFor="memInitials">Initials</label>
              <input
                type="text"
                id="memInitials"
                className="form-control"
                value={formData.initials}
                onChange={(e) => setFormData({ ...formData, initials: e.target.value })}
                placeholder="R"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="memExp">Experience</label>
              <input
                type="text"
                id="memExp"
                className="form-control"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="8+ Years"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="memLoc">Location</label>
              <input
                type="text"
                id="memLoc"
                className="form-control"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Bengaluru, India"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="memBio">Short Card Bio</label>
            <textarea
              id="memBio"
              className="form-control"
              rows="2"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Primary specialization and responsibilities..."
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="memQuote">Personal Philosophy Quote</label>
            <input
              type="text"
              id="memQuote"
              className="form-control"
              value={formData.quote}
              onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
              placeholder="Architecture is not just how it looks, but how effortlessly it scales..."
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="memSkills">Skills Matrix (Comma separated)</label>
            <input
              type="text"
              id="memSkills"
              className="form-control"
              value={formData.skillsInput}
              onChange={(e) => setFormData({ ...formData, skillsInput: e.target.value })}
              placeholder="Systems Arch, Node.js, PostgreSQL, Docker, WebSockets"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="memEmail">Public Email</label>
              <input
                type="email"
                id="memEmail"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="rahul@leovantage.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="memLinkedin">LinkedIn URL</label>
              <input
                type="url"
                id="memLinkedin"
                className="form-control"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                placeholder="https://linkedin.com"
              />
            </div>
          </div>

          <div className="form-row" style={{ alignItems: 'center', marginTop: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.isFounder}
                onChange={(e) => setFormData({ ...formData, isFounder: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#C7F36B' }}
              />
              <span style={{ fontSize: '0.86rem', fontWeight: 600 }}>Mark as Studio Co-Founder</span>
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label htmlFor="memStatus" style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>Status:</label>
              <select
                id="memStatus"
                className="form-control"
                style={{ width: '140px' }}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
