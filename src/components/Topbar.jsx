import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Menu, 
  Search, 
  X, 
  Sun, 
  Moon, 
  ExternalLink, 
  Plus, 
  Briefcase, 
  Building2, 
  Receipt, 
  CheckSquare 
} from 'lucide-react';

export default function Topbar({ 
  currentView, 
  searchTerm, 
  setSearchTerm, 
  setMobileOpen, 
  onQuickAdd 
}) {
  const { theme, toggleTheme, isDark } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const viewTitles = {
    dashboard: 'Studio Overview & KPIs',
    tasks: 'Sprint Tasks & Backlog',
    calendar: 'Delivery Calendar',
    hero: 'Website Hero & Banner',
    projects: 'Projects & Case Studies',
    services: 'Services & Pricing Tiers',
    team: 'Founders & Core Team',
    reviews: 'Client Testimonials',
    faqs: 'FAQs & Development Process',
    settings: 'Site Settings & Access',
    inquiries: 'Website Inquiries CRM',
    clients: 'Clients Directory',
    delivery: 'Delivery Milestones & Stages',
    documents: 'Document Vault',
    notes_calls: 'Notes & Call Log Archive',
    finance: 'Financial Operations & Invoices',
    reports: 'Business Performance Reports'
  };

  const currentTitle = viewTitles[currentView] || 'Console';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="menu-toggle-btn"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
        >
          <Menu size={18} />
        </button>

        <div className="breadcrumbs">
          <span style={{ fontWeight: 500 }}>LeoVantage</span>
          <span className="breadcrumbs-sep">/</span>
          <span className="breadcrumbs-current">{currentTitle}</span>
        </div>
      </div>

      <div className="topbar-search-wrap">
        <Search className="search-icon-left" />
        <input
          type="text"
          className="topbar-search-input"
          placeholder="Search records, clients, projects, or inquiries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            aria-label="Clear search"
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="topbar-right">
        {/* Light / Dark Mode Toggle */}
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Public Website Link */}
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-site-shortcut"
          title="Open live website in a new tab"
        >
          <span>View Live Site</span>
          <ExternalLink size={13} />
        </a>

        {/* Quick Add Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            className="quick-add-btn"
            title="Create new record"
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-expanded={dropdownOpen}
            aria-label="Quick create record"
          >
            <Plus size={18} />
          </button>

          {dropdownOpen && (
            <div className="dropdown-menu active">
              <div
                className="dropdown-item"
                onClick={() => {
                  setDropdownOpen(false);
                  onQuickAdd('project');
                }}
              >
                <Briefcase size={15} color="var(--brand-lime)" />
                <span>New Case Study Project</span>
              </div>
              <div
                className="dropdown-item"
                onClick={() => {
                  setDropdownOpen(false);
                  onQuickAdd('client');
                }}
              >
                <Building2 size={15} color="var(--status-blue)" />
                <span>New Studio Client</span>
              </div>
              <div
                className="dropdown-item"
                onClick={() => {
                  setDropdownOpen(false);
                  onQuickAdd('invoice');
                }}
              >
                <Receipt size={15} color="var(--status-amber)" />
                <span>New Client Invoice (GST 18%)</span>
              </div>
              <div
                className="dropdown-item"
                onClick={() => {
                  setDropdownOpen(false);
                  onQuickAdd('task');
                }}
              >
                <CheckSquare size={15} color="var(--status-green)" />
                <span>New Sprint Task</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
