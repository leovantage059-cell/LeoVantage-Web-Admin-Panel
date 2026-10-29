import React, { useState } from 'react';
import { Layers, Tag, Plus } from 'lucide-react';
import Modal from '../components/Modal';
import { 
  saveService, 
  deleteService, 
  savePricingPackage, 
  deletePricingPackage 
} from '../services/firestoreService';

export default function ServicesView({ services = [], pricingPackages = [], showToast }) {
  const [activeTab, setActiveTab] = useState('services');
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [editingPricing, setEditingPricing] = useState(null);

  const [serviceForm, setServiceForm] = useState(getInitialServiceForm());
  const [pricingForm, setPricingForm] = useState(getInitialPricingForm());
  const [saving, setSaving] = useState(false);

  function getInitialServiceForm() {
    return {
      id: '',
      number: '01',
      title: '',
      desc: '',
      timeline: '3–6 Weeks',
      deliverablesInput: 'Sub-second speed & 95+ Core Web Vitals, Custom animations, Headless CMS integration',
      featured: true,
      status: 'Published'
    };
  }

  function getInitialPricingForm() {
    return {
      id: '',
      name: '',
      subtitle: '',
      price: '₹45,000',
      unit: '/ project',
      badge: '',
      featuresInput: 'Custom Responsive Website, Modern Figma UI, Contact Form with Alerts, 15 Days Support',
      featured: false,
      status: 'Published'
    };
  }

  const handleOpenEditService = (srv) => {
    setEditingService(srv);
    setServiceForm({
      id: srv.id || '',
      number: srv.number || '01',
      title: srv.title || '',
      desc: srv.desc || '',
      timeline: srv.timeline || '',
      deliverablesInput: Array.isArray(srv.deliverables) ? srv.deliverables.join('\n') : '',
      featured: !!srv.featured,
      status: srv.status || 'Published'
    });
    setServiceModalOpen(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!serviceForm.title.trim()) {
      showToast('Service title is required.', 'error');
      return;
    }

    setSaving(true);
    try {
      const deliverables = serviceForm.deliverablesInput
        ? serviceForm.deliverablesInput.split('\n').map((s) => s.trim()).filter(Boolean)
        : [];

      await saveService({
        id: serviceForm.id || undefined,
        number: serviceForm.number,
        title: serviceForm.title.trim(),
        desc: serviceForm.desc,
        timeline: serviceForm.timeline,
        deliverables,
        featured: serviceForm.featured,
        status: serviceForm.status
      });

      showToast(`Service "${serviceForm.title}" saved.`, 'success');
      setServiceModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Failed to save service.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async (srv) => {
    if (!window.confirm(`Delete service "${srv.title}"?`)) return;
    try {
      await deleteService(srv.id);
      showToast('Service deleted.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete service.', 'error');
    }
  };

  const handleOpenEditPricing = (pkg) => {
    setEditingPricing(pkg);
    setPricingForm({
      id: pkg.id || '',
      name: pkg.name || '',
      subtitle: pkg.subtitle || '',
      price: pkg.price || '',
      unit: pkg.unit || '/ project',
      badge: pkg.badge || '',
      featuresInput: Array.isArray(pkg.features) ? pkg.features.join('\n') : '',
      featured: !!pkg.featured,
      status: pkg.status || 'Published'
    });
    setPricingModalOpen(true);
  };

  const handleSavePricing = async (e) => {
    e.preventDefault();
    if (!pricingForm.name.trim() || !pricingForm.price.trim()) {
      showToast('Package name and price are required.', 'error');
      return;
    }

    setSaving(true);
    try {
      const features = pricingForm.featuresInput
        ? pricingForm.featuresInput.split('\n').map((s) => s.trim()).filter(Boolean)
        : [];

      await savePricingPackage({
        id: pricingForm.id || undefined,
        name: pricingForm.name.trim(),
        subtitle: pricingForm.subtitle,
        price: pricingForm.price,
        unit: pricingForm.unit,
        badge: pricingForm.badge || null,
        features,
        featured: pricingForm.featured,
        status: pricingForm.status
      });

      showToast(`Package "${pricingForm.name}" saved.`, 'success');
      setPricingModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Failed to save package.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePricing = async (pkg) => {
    if (!window.confirm(`Delete package "${pkg.name}"?`)) return;
    try {
      await deletePricingPackage(pkg.id);
      showToast('Package deleted.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete package.', 'error');
    }
  };

  return (
    <div className="view-section">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Services &amp; Pricing Packages</h1>
          <p className="page-header-subtitle">
            Configure studio service offerings, key deliverables, and pricing tiers shown on the public website
          </p>
        </div>
        <div className="page-header-actions">
          {activeTab === 'services' ? (
            <button
              className="btn btn-lime btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              onClick={() => {
                setEditingService(null);
                setServiceForm(getInitialServiceForm());
                setServiceModalOpen(true);
              }}
            >
              <Plus size={14} />
              <span>Add Service</span>
            </button>
          ) : (
            <button
              className="btn btn-lime btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              onClick={() => {
                setEditingPricing(null);
                setPricingForm(getInitialPricingForm());
                setPricingModalOpen(true);
              }}
            >
              <Plus size={14} />
              <span>Add Pricing Package</span>
            </button>
          )}
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            Studio Services ({services.length})
          </button>
          <button
            className={`filter-tab ${activeTab === 'pricing' ? 'active' : ''}`}
            onClick={() => setActiveTab('pricing')}
          >
            Pricing Packages ({pricingPackages.length})
          </button>
        </div>
      </div>

      {activeTab === 'services' ? (
        <div className="card">
          {services.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon-wrap">
                <Layers size={22} />
              </div>
              <div className="empty-state-title">No services in database</div>
              <p className="empty-state-desc">Add custom web development, mobile apps, or design services.</p>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Service Name</th>
                    <th>Timeline</th>
                    <th>Deliverables Count</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((srv) => (
                    <tr key={srv.id}>
                      <td style={{ color: 'var(--brand-lime)', fontWeight: 700 }}>{srv.number || '01'}</td>
                      <td>
                        <div className="td-primary">{srv.title}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{srv.desc?.slice(0, 75)}...</div>
                      </td>
                      <td>{srv.timeline || '3–6 Weeks'}</td>
                      <td>{(srv.deliverables || []).length} Deliverables</td>
                      <td>
                        <span className={`badge badge-${(srv.status || 'published').toLowerCase()}`}>
                          {srv.status || 'Published'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="btn btn-navy btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                            onClick={() => handleOpenEditService(srv)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger-outline btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                            onClick={() => handleDeleteService(srv)}
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
          {pricingPackages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon-wrap">
                <Tag size={22} />
              </div>
              <div className="empty-state-title">No pricing tiers defined</div>
              <p className="empty-state-desc">Configure Starter, Growth, or Enterprise ERP packages.</p>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Package Name</th>
                    <th>Price</th>
                    <th>Badge</th>
                    <th>Features</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingPackages.map((pkg) => (
                    <tr key={pkg.id}>
                      <td>
                        <div className="td-primary">{pkg.name}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{pkg.subtitle}</div>
                      </td>
                      <td style={{ color: 'var(--brand-lime)', fontWeight: 700, fontSize: '0.95rem' }}>
                        {pkg.price} <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{pkg.unit}</span>
                      </td>
                      <td>
                        {pkg.badge ? (
                          <span className="badge badge-published">{pkg.badge}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td>{(pkg.features || []).length} Included</td>
                      <td>
                        <span className={`badge badge-${(pkg.status || 'published').toLowerCase()}`}>
                          {pkg.status || 'Published'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="btn btn-navy btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                            onClick={() => handleOpenEditPricing(pkg)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger-outline btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                            onClick={() => handleDeletePricing(pkg)}
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

      {/* Service Modal */}
      <Modal
        isOpen={serviceModalOpen}
        onClose={() => setServiceModalOpen(false)}
        title={editingService ? `Edit Service: ${editingService.title}` : 'Add New Studio Service'}
        maxWidth="640px"
        footer={
          <>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setServiceModalOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-lime btn-sm" onClick={handleSaveService} disabled={saving}>
              <span>{saving ? 'Saving...' : 'Save Service'}</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveService}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="srvNum">Service Index #</label>
              <input
                type="text"
                id="srvNum"
                className="form-control"
                value={serviceForm.number}
                onChange={(e) => setServiceForm({ ...serviceForm, number: e.target.value })}
                placeholder="01"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="srvTitle">Service Title *</label>
              <input
                type="text"
                id="srvTitle"
                className="form-control"
                value={serviceForm.title}
                onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                placeholder="e.g. Custom Web Development"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="srvDesc">Description</label>
            <textarea
              id="srvDesc"
              className="form-control"
              rows="3"
              value={serviceForm.desc}
              onChange={(e) => setServiceForm({ ...serviceForm, desc: e.target.value })}
              placeholder="Brief description shown on cards and services directory..."
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="srvTimeline">Typical Sprint Timeline</label>
            <input
              type="text"
              id="srvTimeline"
              className="form-control"
              value={serviceForm.timeline}
              onChange={(e) => setServiceForm({ ...serviceForm, timeline: e.target.value })}
              placeholder="e.g. 3–6 Weeks"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="srvDeliverables">Deliverables List (One per line)</label>
            <textarea
              id="srvDeliverables"
              className="form-control"
              rows="4"
              value={serviceForm.deliverablesInput}
              onChange={(e) => setServiceForm({ ...serviceForm, deliverablesInput: e.target.value })}
              placeholder="Sub-second page speeds&#10;Bespoke Architecture&#10;REST/GraphQL APIs"
            />
          </div>
        </form>
      </Modal>

      {/* Pricing Modal */}
      <Modal
        isOpen={pricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
        title={editingPricing ? `Edit Package: ${editingPricing.name}` : 'Add Pricing Package'}
        maxWidth="600px"
        footer={
          <>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setPricingModalOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-lime btn-sm" onClick={handleSavePricing} disabled={saving}>
              <span>{saving ? 'Saving...' : 'Save Package'}</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleSavePricing}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="pkgName">Package Name *</label>
              <input
                type="text"
                id="pkgName"
                className="form-control"
                value={pricingForm.name}
                onChange={(e) => setPricingForm({ ...pricingForm, name: e.target.value })}
                placeholder="e.g. Growth / App"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="pkgPrice">Price in INR *</label>
              <input
                type="text"
                id="pkgPrice"
                className="form-control"
                value={pricingForm.price}
                onChange={(e) => setPricingForm({ ...pricingForm, price: e.target.value })}
                placeholder="e.g. ₹1,25,000"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="pkgSubtitle">Subtitle / Target Audience</label>
            <input
              type="text"
              id="pkgSubtitle"
              className="form-control"
              value={pricingForm.subtitle}
              onChange={(e) => setPricingForm({ ...pricingForm, subtitle: e.target.value })}
              placeholder="For scaling brands needing bespoke web or mobile apps."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="pkgBadge">Highlight Badge (Optional)</label>
              <input
                type="text"
                id="pkgBadge"
                className="form-control"
                value={pricingForm.badge}
                onChange={(e) => setPricingForm({ ...pricingForm, badge: e.target.value })}
                placeholder="e.g. MOST POPULAR"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="pkgUnit">Billing Unit</label>
              <input
                type="text"
                id="pkgUnit"
                className="form-control"
                value={pricingForm.unit}
                onChange={(e) => setPricingForm({ ...pricingForm, unit: e.target.value })}
                placeholder="/ project"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="pkgFeatures">Features (One per line)</label>
            <textarea
              id="pkgFeatures"
              className="form-control"
              rows="4"
              value={pricingForm.featuresInput}
              onChange={(e) => setPricingForm({ ...pricingForm, featuresInput: e.target.value })}
              placeholder="Custom Web App&#10;Complete Design System&#10;Payment Gateway & Admin"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
