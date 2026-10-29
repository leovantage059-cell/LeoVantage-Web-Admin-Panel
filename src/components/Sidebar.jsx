import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Sparkles,
  Briefcase,
  Layers,
  Users,
  Star,
  HelpCircle,
  Settings,
  Inbox,
  Building2,
  FolderLock,
  PhoneCall,
  CreditCard,
  BarChart3,
  Milestone,
  LogOut,
  X
} from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView, counts = {}, mobileOpen, setMobileOpen }) {
  const { adminProfile, logout } = useAuth();
  const { theme } = useTheme();

  const handleNav = (viewKey) => {
    setCurrentView(viewKey);
    if (setMobileOpen) setMobileOpen(false);
  };

  const navGroups = [
    {
      title: 'CORE STUDIO',
      items: [
        { key: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
        { key: 'tasks', label: 'Tasks & Sprints', icon: CheckSquare, count: counts.tasks },
        { key: 'calendar', label: 'Editorial & Delivery', icon: Calendar },
      ]
    },
    {
      title: 'PUBLIC WEBSITE',
      items: [
        { key: 'hero', label: 'Hero & Studio Banner', icon: Sparkles },
        { key: 'projects', label: 'Projects & Case Studies', icon: Briefcase, count: counts.projects },
        { key: 'services', label: 'Services & Pricing', icon: Layers, count: counts.services },
        { key: 'team', label: 'Team & Founders', icon: Users },
        { key: 'reviews', label: 'Client Reviews', icon: Star, count: counts.reviews },
        { key: 'faqs', label: 'FAQs & Process Steps', icon: HelpCircle },
        { key: 'settings', label: 'Site Settings & Access', icon: Settings },
      ]
    },
    {
      title: 'STUDIO CRM & OPS',
      items: [
        { key: 'inquiries', label: 'Inquiries CRM', icon: Inbox, count: counts.newInquiries, highlight: true },
        { key: 'clients', label: 'Clients Directory', icon: Building2, count: counts.clients },
        { key: 'delivery', label: 'Delivery Milestones', icon: Milestone, count: counts.activeProjects },
        { key: 'documents', label: 'Document Vault', icon: FolderLock, count: counts.documents },
        { key: 'notes_calls', label: 'Notes & Call Logs', icon: PhoneCall },
      ]
    },
    {
      title: 'FINANCIALS & REPORTING',
      items: [
        { key: 'finance', label: 'Invoices & Expenses', icon: CreditCard, count: counts.pendingInvoices },
        { key: 'reports', label: 'Performance Analytics', icon: BarChart3 },
      ]
    }
  ];

  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="brand-logo-wrap" onClick={() => handleNav('dashboard')}>
          <Logo variant="horizontal" height={28} theme="dark" subtitle="STUDIO CONSOLE" />
        </div>
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="icon-btn"
            style={{ width: '28px', height: '28px' }}
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="sidebar-nav-scroll">
        {navGroups.map((group) => (
          <div key={group.title} className="nav-group">
            <div className="nav-group-title">{group.title}</div>
            {group.items.map((item) => {
              const isActive = currentView === item.key;
              const IconComponent = item.icon;
              return (
                <button
                  key={item.key}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleNav(item.key)}
                >
                  <div className="nav-item-left">
                    <IconComponent className="nav-icon" />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count !== null && (
                    <span 
                      className="nav-badge" 
                      style={item.highlight && item.count > 0 ? { background: 'var(--brand-lime)', color: '#0F172A', borderColor: 'transparent' } : {}}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-status-box">
          <div className="sidebar-status-pill">
            <span className="pulse-dot" />
            <span>Workspace Online</span>
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>v2.0</span>
        </div>

        {/* Authenticated User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div className="admin-profile-pill" style={{ flex: 1, overflow: 'hidden' }}>
            <div className="admin-avatar">
              {adminProfile?.displayName ? adminProfile.displayName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              <div className="admin-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {adminProfile?.displayName || 'Studio Admin'}
              </div>
              <div className="admin-role">
                {adminProfile?.role || 'Super Admin'}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="theme-toggle-btn"
            style={{ width: '32px', height: '32px', flexShrink: 0 }}
            title="Sign out of console"
            aria-label="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
