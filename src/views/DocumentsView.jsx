import React, { useState, useRef } from 'react';
import { FolderLock, FileText, Upload, Plus } from 'lucide-react';
import { uploadDocumentFile, removeDocumentFile } from '../services/storageService';
import { formatDate } from '../services/firestoreService';

export default function DocumentsView({ documents = [], clients = [], showToast }) {
  const [filter, setFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Contract');
  const [selectedClient, setSelectedClient] = useState('');
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadDocumentFile(file, selectedCategory, selectedClient);
      showToast(`Document "${file.name}" uploaded to Storage vault!`, 'success');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Storage upload error:', err);
      showToast(err.message || 'Storage upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docRecord) => {
    if (!window.confirm(`Delete document "${docRecord.name}" from vault?`)) return;
    try {
      await removeDocumentFile(docRecord);
      showToast('Document removed from vault', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to remove document', 'error');
    }
  };

  const filteredDocs = documents.filter((d) => {
    if (filter === 'all') return true;
    return (d.category || '').toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="view-section">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Document Vault</h1>
          <p className="page-header-subtitle">
            Secure cloud storage for client contracts, SRS blueprints, NDAs, and delivery deliverables
          </p>
        </div>
        <div className="page-header-actions">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <button
            className="btn btn-lime btn-sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Upload size={14} />
            <span>{uploading ? 'Uploading to Storage...' : 'Upload Document'}</span>
          </button>
        </div>
      </div>

      {/* Upload Settings Bar */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          background: 'var(--brand-navy-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Upload Tagging:
          </span>
          <select
            className="form-control"
            style={{ width: '160px', height: '34px', fontSize: '0.82rem' }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="Contract">Contract / NDA</option>
            <option value="Brief">Project Brief / SRS</option>
            <option value="SLA">SLA Support Agreement</option>
            <option value="Invoice">Signed Invoice</option>
            <option value="Deliverable">Final Asset / Archive</option>
          </select>

          <select
            className="form-control"
            style={{ width: '180px', height: '34px', fontSize: '0.82rem' }}
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
          >
            <option value="">Studio General Internal</option>
            {clients.map((c) => (
              <option key={c.id} value={c.name}>{c.name} ({c.company})</option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
          Direct Firebase Storage bucket upload • Max 20MB per file
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Documents ({documents.length})
          </button>
          <button
            className={`filter-tab ${filter === 'contract' ? 'active' : ''}`}
            onClick={() => setFilter('contract')}
          >
            Contracts &amp; NDAs
          </button>
          <button
            className={`filter-tab ${filter === 'brief' ? 'active' : ''}`}
            onClick={() => setFilter('brief')}
          >
            SRS Blueprints
          </button>
          <button
            className={`filter-tab ${filter === 'deliverable' ? 'active' : ''}`}
            onClick={() => setFilter('deliverable')}
          >
            Deliverables
          </button>
        </div>
      </div>

      {/* Documents Table */}
      <div className="card">
        {filteredDocs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon-wrap">
              <FolderLock size={22} />
            </div>
            <div className="empty-state-title">No documents in vault</div>
            <p className="empty-state-desc">
              Upload master agreements, technical architecture diagrams, or client briefs to store them securely.
            </p>
            <button
              className="btn btn-lime btn-sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} />
              <span>Upload First File</span>
            </button>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>Category</th>
                  <th>Client / Account</th>
                  <th>File Size</th>
                  <th>Uploaded Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map((docRecord) => (
                  <tr key={docRecord.id}>
                    <td>
                      <div className="td-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={15} style={{ color: 'var(--brand-lime)', flexShrink: 0 }} />
                        <span>{docRecord.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-discovery" style={{ fontSize: '0.72rem' }}>
                        {docRecord.category || 'General'}
                      </span>
                    </td>
                    <td>{docRecord.clientName || 'Studio General'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{formatFileSize(docRecord.sizeBytes)}</td>
                    <td>{formatDate(docRecord.createdAt)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {docRecord.downloadUrl && (
                          <a
                            href={docRecord.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-navy btn-sm"
                            style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                          >
                            <span>Download</span>
                            <span>↗</span>
                          </a>
                        )}
                        <button
                          className="btn btn-danger-outline btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                          onClick={() => handleDelete(docRecord)}
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
    </div>
  );
}
