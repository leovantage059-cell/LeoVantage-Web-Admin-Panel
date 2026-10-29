import React, { useState, useEffect } from 'react';
import { Save, UserPlus } from 'lucide-react';
import { 
  getSiteSettings, 
  updateSiteSettings, 
  subscribeAdminAllowlist, 
  addAdminToAllowlist, 
  removeAdminFromAllowlist, 
  formatDate 
} from '../services/firestoreService';
import { useAuth } from '../context/AuthContext';

export default function SettingsView({ showToast }) {
  const { adminProfile } = useAuth();
  const [settings, setSettings] = useState({
    agencyName: 'LeoVantage Web Studio',
    tagline: 'PLAN. BUILD. LAUNCH.',
    supportEmail: 'hello@leovantage.com',
    phone: '+91 98765 43210',
    address: 'Bengaluru, Karnataka, India'
  });

  const [allowlist, setAllowlist] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('Admin');
  const [savingSettings, setSavingSettings] = useState(false);
  const [addingEmail, setAddingEmail] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getSiteSettings();
        if (data) setSettings(data);
      } catch (err) {
        console.error('Error loading settings:', err);
      }
    }
    load();

    const unsub = subscribeAdminAllowlist((list) => {
      setAllowlist(list);
    });
    return () => unsub();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await updateSiteSettings(settings);
      showToast('General studio settings updated.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    const email = newAdminEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid admin email address.', 'error');
      return;
    }

    setAddingEmail(true);
    try {
      await addAdminToAllowlist(email, newAdminRole, adminProfile?.displayName || 'Super Admin');
      showToast(`Added ${email} to admin allowlist!`, 'success');
      setNewAdminEmail('');
    } catch (err) {
      showToast(err.message || 'Failed to authorize admin', 'error');
    } finally {
      setAddingEmail(false);
    }
  };

  const handleRemoveAdmin = async (email) => {
    if (!window.confirm(`Revoke admin console access for ${email}?`)) return;
    try {
      await removeAdminFromAllowlist(email);
      showToast(`Removed ${email} from allowlist.`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to remove admin', 'error');
    }
  };

  return (
    <div className="view-section">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Settings &amp; Access Control</h1>
          <p className="page-header-subtitle">
            Global studio parameters, contact channels, and trusted admin user access control
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        
        {/* Left: General Settings */}
        <form onSubmit={handleSaveSettings} className="card">
          <h2 className="card-title" style={{ marginBottom: '16px' }}>General Studio Information</h2>

          <div className="form-group">
            <label className="form-label" htmlFor="agencyName">Studio Brand Name</label>
            <input
              type="text"
              id="agencyName"
              className="form-control"
              value={settings.agencyName || ''}
              onChange={(e) => setSettings({ ...settings, agencyName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="tagline">Official Tagline</label>
            <input
              type="text"
              id="tagline"
              className="form-control"
              value={settings.tagline || ''}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="supportEmail">Primary Studio Email</label>
              <input
                type="email"
                id="supportEmail"
                className="form-control"
                value={settings.supportEmail || ''}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone / WhatsApp Line</label>
              <input
                type="text"
                id="phone"
                className="form-control"
                value={settings.phone || ''}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="address">Physical Headquarters Address</label>
            <input
              type="text"
              id="address"
              className="form-control"
              value={settings.address || ''}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button
              type="submit"
              className="btn btn-lime btn-sm"
              disabled={savingSettings}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Save size={14} />
              <span>{savingSettings ? 'Saving...' : 'Update Settings'}</span>
            </button>
          </div>
        </form>

        {/* Right: Admin Allowlist */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Authorized Admin Allowlist</h2>
              <span className="card-subtitle">Accounts permitted to access the Admin OS and private CRM</span>
            </div>
          </div>

          <form onSubmit={handleAddAdmin} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="email"
                className="form-control"
                placeholder="developer@leovantage.com"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                required
              />
              <select
                className="form-control"
                style={{ width: '110px' }}
                value={newAdminRole}
                onChange={(e) => setNewAdminRole(e.target.value)}
              >
                <option value="Admin">Admin</option>
                <option value="Super Admin">Super Admin</option>
              </select>
            </div>
            <button
              type="submit"
              className="btn btn-navy btn-sm"
              style={{ width: '100%', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              disabled={addingEmail}
            >
              <UserPlus size={14} />
              <span>{addingEmail ? 'Authorizing...' : 'Authorize New Admin Email'}</span>
            </button>
          </form>

          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
              Currently Authorized ({allowlist.length})
            </div>

            {allowlist.length === 0 ? (
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                No explicit allowlist entries. Add authorized founder emails above.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {allowlist.map((admin) => (
                  <div
                    key={admin.email}
                    style={{
                      background: 'var(--surface-deep)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {admin.email}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Role: {admin.role || 'Admin'} • Added {formatDate(admin.addedAt)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveAdmin(admin.email)}
                      className="btn btn-danger-outline btn-sm"
                      style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                      title="Revoke access"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
