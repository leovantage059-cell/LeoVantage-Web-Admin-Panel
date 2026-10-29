import React, { useState } from 'react';
import { Briefcase, Star, Plus } from 'lucide-react';
import Modal from '../components/Modal';
import { saveProject, deleteProject } from '../services/firestoreService';

export default function ProjectsView({ projects = [], showToast, modalOpen, setModalOpen }) {
  const [filter, setFilter] = useState('all');
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState(getInitialForm());
  const [saving, setSaving] = useState(false);

  function getInitialForm() {
    return {
      id: '',
      title: '',
      category: 'web',
      categoryLabel: 'FINTECH • WEB APPLICATION',
      tagline: '',
      year: new Date().getFullYear().toString(),
      techInput: 'React, Node.js, PostgreSQL',
      featured: false,
      status: 'Published',
      client: '',
      industry: '',
      timeline: '4 Weeks',
      role: 'Full-Stack Architecture & Design',
      problem: '',
      solution: '',
      stat1Label: 'Performance Uplift',
      stat1Value: '98%',
      stat2Label: 'Interaction Speed',
      stat2Value: '0.2s',
      mockTitle: '',
      quote: '',
      author: ''
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
      title: proj.title || '',
      category: proj.category || 'web',
      categoryLabel: proj.categoryLabel || '',
      tagline: proj.tagline || '',
      year: proj.year || new Date().getFullYear().toString(),
      techInput: Array.isArray(proj.tech) ? proj.tech.join(', ') : '',
      featured: !!proj.featured,
      status: proj.status || 'Published',
      client: proj.client || '',
      industry: proj.industry || '',
      timeline: proj.timeline || '4 Weeks',
      role: proj.role || 'Full-Stack Engineering',
      problem: proj.problem || '',
      solution: proj.solution || '',
      stat1Label: proj.stats?.[0]?.label || '',
      stat1Value: proj.stats?.[0]?.value || '',
      stat2Label: proj.stats?.[1]?.label || '',
      stat2Value: proj.stats?.[1]?.value || '',
      mockTitle: proj.mockTitle || '',
      quote: proj.quote || '',
      author: proj.author || ''
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Project title is required.', 'error');
      return;
    }

    setSaving(true);
    try {
      const tech = formData.techInput
        ? formData.techInput.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      const stats = [];
      if (formData.stat1Label && formData.stat1Value) {
        stats.push({ label: formData.stat1Label, value: formData.stat1Value });
      }
      if (formData.stat2Label && formData.stat2Value) {
        stats.push({ label: formData.stat2Label, value: formData.stat2Value });
      }

      await saveProject({
        id: formData.id || undefined,
        title: formData.title.trim(),
        category: formData.category,
        categoryLabel: formData.categoryLabel,
        tagline: formData.tagline,
        year: formData.year,
        tech,
        featured: formData.featured,
        status: formData.status,
        client: formData.client,
        industry: formData.industry,
        timeline: formData.timeline,
        role: formData.role,
        problem: formData.problem,
        solution: formData.solution,
        stats,
        mockTitle: formData.mockTitle || `${formData.title.toUpperCase()} CONSOLE`,
        quote: formData.quote,
        author: formData.author
      });

      showToast(`Project "${formData.title}" saved successfully!`, 'success');
      setModalOpen(false);
    } catch (err) {
      console.error('Error saving project:', err);
      showToast(err.message || 'Failed to save project.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (proj) => {
    try {
      const nextStatus = proj.status === 'Published' ? 'Draft' : 'Published';
      await saveProject({ ...proj, status: nextStatus });
      showToast(`Project status changed to ${nextStatus}`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleDelete = async (proj) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${proj.title}"?`)) return;
    try {
      await deleteProject(proj.id);
      showToast(`Project "${proj.title}" deleted.`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete project', 'error');
    }
  };

  const filteredProjects = projects.filter((p) => {
    if (filter === 'published') return p.status === 'Published';
    if (filter === 'draft') return p.status === 'Draft';
    if (filter === 'featured') return p.featured;
    return true;
  });

  return (
    <div className="view-section">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Projects &amp; Case Studies</h1>
          <p className="page-header-subtitle">
            Manage portfolio items, featured hero works, and deep-dive technical case studies
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-lime btn-sm" onClick={handleOpenCreate} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={14} />
            <span>Create Case Study</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-bar">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Projects ({projects.length})
          </button>
          <button
            className={`filter-tab ${filter === 'published' ? 'active' : ''}`}
            onClick={() => setFilter('published')}
          >
            Published ({projects.filter((p) => p.status === 'Published').length})
          </button>
          <button
            className={`filter-tab ${filter === 'featured' ? 'active' : ''}`}
            onClick={() => setFilter('featured')}
          >
            Featured Flagships ({projects.filter((p) => p.featured).length})
          </button>
          <button
            className={`filter-tab ${filter === 'draft' ? 'active' : ''}`}
            onClick={() => setFilter('draft')}
          >
            Drafts ({projects.filter((p) => p.status === 'Draft').length})
          </button>
        </div>
      </div>

      {/* Projects Table */}
      <div className="card">
        {filteredProjects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon-wrap">
              <Briefcase size={22} />
            </div>
            <div className="empty-state-title">No projects found</div>
            <p className="empty-state-desc">You can seed canonical projects from the website or create a new case study.</p>
            <button className="btn btn-lime btn-sm" onClick={handleOpenCreate} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={14} />
              <span>Create First Case Study</span>
            </button>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title &amp; Slug</th>
                  <th>Category</th>
                  <th>Client</th>
                  <th>Tech Stack</th>
                  <th>Featured</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="td-primary">{p.title}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>slug: {p.id}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.78rem' }}>{p.categoryLabel || p.category}</span>
                    </td>
                    <td>{p.client || 'LeoVantage Studio'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '200px' }}>
                        {(p.tech || []).slice(0, 3).map((t) => (
                          <span
                            key={t}
                            style={{
                              fontSize: '0.68rem',
                              background: 'var(--card-bg-nested)',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      {p.featured ? (
                        <span className="badge badge-published" style={{ fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Star size={11} fill="currentColor" /> Flagship
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Standard</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge badge-${(p.status || 'published').toLowerCase()}`}>
                        {p.status || 'Published'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                          onClick={() => handleTogglePublish(p)}
                          title="Toggle public visibility"
                        >
                          {p.status === 'Published' ? 'Unpublish' : 'Publish'}
                        </button>
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProject ? `Edit Case Study: ${editingProject.title}` : 'Create New Case Study Project'}
        maxWidth="740px"
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
              <span>{saving ? 'Saving...' : 'Save Case Study'}</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="title">Project Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                className="form-control"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. PID Education Platform"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="id">Slug / Identifier</label>
              <input
                type="text"
                id="id"
                name="id"
                className="form-control"
                value={formData.id}
                onChange={handleChange}
                placeholder="e.g. pid-education (leave empty to autogenerate)"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="categoryLabel">Category Tagline Label</label>
              <input
                type="text"
                id="categoryLabel"
                name="categoryLabel"
                className="form-control"
                value={formData.categoryLabel}
                onChange={handleChange}
                placeholder="e.g. EDUCATION ERP • DUAL MOBILE APPS"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="category">Filter Category</label>
              <select
                id="category"
                name="category"
                className="form-control"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="web">Web Application</option>
                <option value="mobile">Mobile App</option>
                <option value="education mobile">Education &amp; Mobile</option>
                <option value="branding web">Branding &amp; Web</option>
                <option value="branding">Branding</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="tagline">Short Hero Tagline</label>
            <textarea
              id="tagline"
              name="tagline"
              className="form-control"
              rows="2"
              value={formData.tagline}
              onChange={handleChange}
              placeholder="High-impact description summary..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="client">Client Name</label>
              <input
                type="text"
                id="client"
                name="client"
                className="form-control"
                value={formData.client}
                onChange={handleChange}
                placeholder="e.g. PID Educational Group"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="industry">Industry</label>
              <input
                type="text"
                id="industry"
                name="industry"
                className="form-control"
                value={formData.industry}
                onChange={handleChange}
                placeholder="e.g. K-12 Education &amp; Academics"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="timeline">Sprint Timeline</label>
              <input
                type="text"
                id="timeline"
                name="timeline"
                className="form-control"
                value={formData.timeline}
                onChange={handleChange}
                placeholder="e.g. 8 Weeks"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="role">Our Role</label>
              <input
                type="text"
                id="role"
                name="role"
                className="form-control"
                value={formData.role}
                onChange={handleChange}
                placeholder="e.g. Full-Stack Architecture &amp; Design"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="techInput">Technologies (Comma separated)</label>
            <input
              type="text"
              id="techInput"
              name="techInput"
              className="form-control"
              value={formData.techInput}
              onChange={handleChange}
              placeholder="React Native, Expo, Node.js, PostgreSQL"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="problem">The Problem / Challenge</label>
            <textarea
              id="problem"
              name="problem"
              className="form-control"
              rows="3"
              value={formData.problem}
              onChange={handleChange}
              placeholder="What obstacle was the client facing before partnering with LeoVantage?"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="solution">The Solution Engineered</label>
            <textarea
              id="solution"
              name="solution"
              className="form-control"
              rows="3"
              value={formData.solution}
              onChange={handleChange}
              placeholder="How did LeoVantage architect and deliver the product?"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="stat1Label">KPI Stat 1 Label</label>
              <input
                type="text"
                id="stat1Label"
                name="stat1Label"
                className="form-control"
                value={formData.stat1Label}
                onChange={handleChange}
                placeholder="e.g. Admin Time Saved"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="stat1Value">KPI Stat 1 Value</label>
              <input
                type="text"
                id="stat1Value"
                name="stat1Value"
                className="form-control"
                value={formData.stat1Value}
                onChange={handleChange}
                placeholder="e.g. 70%"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="quote">Client Testimonial Quote</label>
              <input
                type="text"
                id="quote"
                name="quote"
                className="form-control"
                value={formData.quote}
                onChange={handleChange}
                placeholder='"LeoVantage replaced three legacy systems with one unified product."'
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="author">Quote Author</label>
              <input
                type="text"
                id="author"
                name="author"
                className="form-control"
                value={formData.author}
                onChange={handleChange}
                placeholder="— Anand Kapoor, Director at PID Academy"
              />
            </div>
          </div>

          <div className="form-row" style={{ alignItems: 'center', marginTop: '14px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', accentColor: '#C7F36B' }}
              />
              <span style={{ fontSize: '0.86rem', fontWeight: 600 }}>Feature on Homepage Flagship Section</span>
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label htmlFor="status" className="form-label" style={{ marginBottom: 0 }}>Publication Status:</label>
              <select
                id="status"
                name="status"
                className="form-control"
                style={{ width: '140px' }}
                value={formData.status}
                onChange={handleChange}
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
