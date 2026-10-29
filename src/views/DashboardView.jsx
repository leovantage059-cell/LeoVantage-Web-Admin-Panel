import React from 'react';
import StatCard from '../components/StatCard';
import { formatINR, formatDate } from '../services/firestoreService';
import { 
  Inbox, 
  Milestone, 
  CreditCard, 
  Clock, 
  CheckSquare, 
  BarChart2, 
  Plus, 
  ArrowUpRight, 
  Receipt,
  Building2
} from 'lucide-react';

export default function DashboardView({ 
  inquiries = [], 
  clients = [], 
  projects = [], 
  deliveryProjects = [], 
  invoices = [], 
  tasks = [], 
  setCurrentView,
  onQuickAdd
}) {
  // Compute dynamic stats from actual stored records
  const totalInquiries = inquiries.length;
  const newInquiries = inquiries.filter((i) => i.status === 'New').length;

  const activeDeliveries = deliveryProjects.filter((d) => d.stage !== 'Launched').length;

  const totalBilled = invoices
    .filter((inv) => inv.status === 'Paid')
    .reduce((acc, inv) => acc + (inv.totalAmount || inv.amount || 0), 0);

  const pendingReceivables = invoices
    .filter((inv) => inv.status === 'Sent' || inv.status === 'Overdue')
    .reduce((acc, inv) => acc + (inv.totalAmount || inv.amount || 0), 0);

  const completedTasks = tasks.filter((t) => t.status === 'Done').length;
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="view-section">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Studio Dashboard</h1>
          <p className="page-header-subtitle">
            Executive workbench • Real-time database metrics &amp; client operations
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-navy btn-sm" onClick={() => setCurrentView('reports')}>
            <BarChart2 size={14} />
            <span>Detailed Analytics</span>
          </button>
          <button className="btn btn-lime btn-sm" onClick={() => onQuickAdd('invoice')}>
            <Plus size={14} />
            <span>New Invoice</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <StatCard
          label="Website Inquiries"
          value={newInquiries}
          icon={Inbox}
          delta={totalInquiries > 0 ? `${totalInquiries} total in pipeline` : 'No leads logged yet'}
          deltaType={newInquiries > 0 ? 'up' : 'neutral'}
          accent="lime"
        />
        <StatCard
          label="Active Deliveries"
          value={activeDeliveries}
          icon={Milestone}
          delta={deliveryProjects.length > 0 ? `${deliveryProjects.length} managed accounts` : 'No active client sprints'}
          deltaType={activeDeliveries > 0 ? 'up' : 'neutral'}
          accent="blue"
        />
        <StatCard
          label="Collected Revenue"
          value={formatINR(totalBilled)}
          icon={CreditCard}
          delta={totalBilled > 0 ? 'Settled milestone invoices' : 'No settled invoices'}
          deltaType={totalBilled > 0 ? 'up' : 'neutral'}
          accent="emerald"
        />
        <StatCard
          label="Pending Receivables"
          value={formatINR(pendingReceivables)}
          icon={Clock}
          delta={pendingReceivables > 0 ? 'Awaiting client settlement' : 'Zero outstanding balance'}
          deltaType={pendingReceivables > 0 ? 'warning' : 'neutral'}
          accent="amber"
        />
        <StatCard
          label="Task Velocity"
          value={`${taskCompletionRate}%`}
          icon={CheckSquare}
          delta={tasks.length > 0 ? `${completedTasks} of ${tasks.length} closed` : 'No sprint tasks logged'}
          deltaType={completedTasks > 0 ? 'up' : 'neutral'}
          accent="purple"
        />
      </div>

      {/* Two Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '22px' }}>
        
        {/* Left: Recent Inquiries */}
        <div className="card card-crm">
          <div className="card-header">
            <div>
              <span className="section-pill section-pill-blue">CRM Pipeline</span>
              <h2 className="card-title">Recent Inquiries</h2>
              <span className="card-subtitle">Website briefs submitted by prospective clients</span>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => setCurrentView('inquiries')}>
              <span>View All</span>
              <span style={{ opacity: 0.6 }}>({inquiries.length})</span>
            </button>
          </div>

          {inquiries.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon-wrap">
                <Inbox size={22} strokeWidth={1.75} />
              </div>
              <div className="empty-state-title">No inquiries yet</div>
              <p className="empty-state-desc">When visitors submit the contact form on your public website, inquiries will appear here in real time.</p>
              <button className="btn btn-navy btn-sm" onClick={() => setCurrentView('inquiries')}>
                <Inbox size={13} />
                <span>Open CRM Pipeline</span>
              </button>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Prospective Client</th>
                    <th>Requested Service</th>
                    <th>Budget</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.slice(0, 5).map((inq) => (
                    <tr 
                      key={inq.id} 
                      onClick={() => setCurrentView('inquiries')}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <div className="td-primary">{inq.name}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{inq.email}</div>
                      </td>
                      <td>{inq.service || 'Custom Web Dev'}</td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: 'var(--brand-lime)', fontWeight: 600 }}>
                          {inq.budget || '—'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${(inq.status || 'new').toLowerCase().replace(' ', '-')}`}>
                          {inq.status || 'New'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Active Delivery Projects */}
        <div className="card card-delivery">
          <div className="card-header">
            <div>
              <span className="section-pill section-pill-purple">Sprint Engine</span>
              <h2 className="card-title">Active Sprints &amp; Delivery</h2>
              <span className="card-subtitle">Milestones and stage progress</span>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => setCurrentView('delivery')}>
              <span>Manage</span>
              <span style={{ opacity: 0.6 }}>({deliveryProjects.length})</span>
            </button>
          </div>

          {deliveryProjects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon-wrap">
                <Milestone size={22} strokeWidth={1.75} />
              </div>
              <div className="empty-state-title">No active sprints</div>
              <p className="empty-state-desc">Track client sprint milestones, delivery stages, and progress bars.</p>
              <button className="btn btn-navy btn-sm" onClick={() => onQuickAdd('client')}>
                <Plus size={13} />
                <span>Add Client Project</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {deliveryProjects.slice(0, 4).map((proj) => (
                <div 
                  key={proj.id} 
                  style={{
                    background: 'var(--bg-elevated)',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                      {proj.name}
                    </span>
                    <span className="badge badge-in-progress" style={{ fontSize: '0.68rem' }}>
                      {proj.stage || 'Sprint 1'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    <span>Client: {proj.clientName || 'Studio Account'}</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>{proj.progress || 0}% Complete</span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ width: '100%', height: '4px', background: 'var(--border-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${proj.progress || 0}%`, 
                        height: '100%', 
                        background: 'var(--brand-lime)', 
                        borderRadius: '2px',
                        transition: 'width 0.3s ease'
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Recent Invoices */}
      <div className="card card-finance">
        <div className="card-header">
          <div>
            <span className="section-pill section-pill-green">Financial Vault</span>
            <h2 className="card-title">Recent Invoices (INR + 18% GST)</h2>
            <span className="card-subtitle">Tax-compliant billing log for client milestone settlements</span>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => setCurrentView('finance')}>
            <span>Open Finance Vault</span>
            <ArrowUpRight size={13} />
          </button>
        </div>

        {invoices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon-wrap">
              <Receipt size={22} strokeWidth={1.75} />
            </div>
            <div className="empty-state-title">No invoices recorded</div>
            <p className="empty-state-desc">Generate client invoices with automatic 18% GST calculation and INR formatting.</p>
            <button className="btn btn-navy btn-sm" onClick={() => onQuickAdd('invoice')}>
              <Plus size={13} />
              <span>Create First Invoice</span>
            </button>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Client Name</th>
                  <th>Subtotal</th>
                  <th>GST (18%)</th>
                  <th>Total Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.slice(0, 5).map((inv) => (
                  <tr key={inv.id}>
                    <td className="td-primary">{inv.invoiceNumber}</td>
                    <td>{inv.clientName}</td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>{formatINR(inv.amount)}</td>
                    <td style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{formatINR(inv.taxAmount)}</td>
                    <td style={{ color: 'var(--text-main)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                      {formatINR(inv.totalAmount || inv.amount)}
                    </td>
                    <td>{formatDate(inv.dueDate)}</td>
                    <td>
                      <span className={`badge badge-${(inv.status || 'draft').toLowerCase()}`}>
                        {inv.status || 'Draft'}
                      </span>
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
