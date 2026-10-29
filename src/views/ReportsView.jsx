import React from 'react';
import { Target, BarChart3, Building2, Zap } from 'lucide-react';
import StatCard from '../components/StatCard';
import { formatINR } from '../services/firestoreService';

export default function ReportsView({ inquiries = [], clients = [], invoices = [], deliveryProjects = [], tasks = [] }) {
  // Real computed numbers from stored records
  const totalInquiries = inquiries.length;
  const convertedInquiries = inquiries.filter((i) => i.status === 'Converted').length;
  const conversionRate = totalInquiries > 0 ? Math.round((convertedInquiries / totalInquiries) * 100) : 0;

  const totalInvoiced = invoices.reduce((acc, inv) => acc + (inv.totalAmount || inv.amount || 0), 0);
  const avgDealSize = invoices.length > 0 ? Math.round(totalInvoiced / invoices.length) : 0;

  const completedTasks = tasks.filter((t) => t.status === 'Done').length;
  const taskVelocity = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  // Breakdown by Service
  const serviceCounts = inquiries.reduce((acc, inq) => {
    const srv = inq.service || 'Custom Web Dev';
    acc[srv] = (acc[srv] || 0) + 1;
    return acc;
  }, {});

  // Invoice status counts
  const invoiceStatusMap = invoices.reduce((acc, inv) => {
    const st = inv.status || 'Draft';
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="view-section">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Performance &amp; Studio Analytics</h1>
          <p className="page-header-subtitle">
            All analytics and KPI figures are dynamically aggregated from active database records
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <StatCard
          label="INQUIRY CONVERSION RATE"
          value={`${conversionRate}%`}
          icon={Target}
          delta={`${convertedInquiries} of ${totalInquiries} converted`}
          deltaType={conversionRate > 0 ? 'up' : 'neutral'}
          accent="lime"
        />
        <StatCard
          label="AVERAGE DEAL VALUE (INR)"
          value={formatINR(avgDealSize)}
          icon={BarChart3}
          delta={avgDealSize > 0 ? 'Average invoice milestone' : 'No invoices billed yet'}
          deltaType={avgDealSize > 0 ? 'up' : 'neutral'}
          accent="blue"
        />
        <StatCard
          label="ACTIVE MANAGED CLIENTS"
          value={clients.length}
          icon={Building2}
          delta={clients.length > 0 ? 'Registered partner accounts' : 'No partner accounts yet'}
          deltaType={clients.length > 0 ? 'up' : 'neutral'}
          accent="purple"
        />
        <StatCard
          label="SPRINT TASK EFFICIENCY"
          value={`${taskVelocity}%`}
          icon={Zap}
          delta={`${completedTasks} of ${tasks.length} closed`}
          deltaType={taskVelocity > 0 ? 'up' : 'neutral'}
          accent="lime"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        
        {/* Service Demand Breakdown */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Inquiry Demand by Service</h2>
              <span className="card-subtitle">Aggregated from prospective client brief submissions</span>
            </div>
          </div>

          {Object.keys(serviceCounts).length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No inquiry data recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {Object.entries(serviceCounts).map(([srv, count]) => {
                const pct = Math.round((count / totalInquiries) * 100);
                return (
                  <div key={srv}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{srv}</span>
                      <span style={{ color: 'var(--brand-lime)', fontWeight: 700 }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--brand-lime)', borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Invoice Settlement Health */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Invoice Lifecycle Status</h2>
              <span className="card-subtitle">Distribution of milestone billing vouchers</span>
            </div>
          </div>

          {invoices.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No invoices issued yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {Object.entries(invoiceStatusMap).map(([status, count]) => {
                const pct = Math.round((count / invoices.length) * 100);
                return (
                  <div key={status}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{status}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${pct}%`, 
                          height: '100%', 
                          background: status === 'Paid' ? 'var(--brand-lime)' : status === 'Sent' ? 'var(--status-blue)' : 'var(--status-amber)', 
                          borderRadius: '3px' 
                        }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
