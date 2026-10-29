import React, { useState } from 'react';
import { FileText, CreditCard, Landmark, TrendingDown, TrendingUp, Plus, X, Receipt } from 'lucide-react';
import Modal from '../components/Modal';
import { 
  saveInvoice, 
  updateInvoiceStatus, 
  deleteInvoice, 
  saveExpense, 
  deleteExpense, 
  formatINR, 
  formatDate 
} from '../services/firestoreService';

export default function FinanceView({ invoices = [], expenses = [], clients = [], showToast, modalOpen, setModalOpen }) {
  const [activeTab, setActiveTab] = useState('invoices');
  const [invFilter, setInvFilter] = useState('all');
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  // Invoice Form State
  const [invForm, setInvForm] = useState(getInitialInvoiceForm());
  const [expenseForm, setExpenseForm] = useState({
    category: 'Software/SaaS',
    vendor: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [saving, setSaving] = useState(false);

  function getInitialInvoiceForm() {
    return {
      id: '',
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      clientName: clients[0]?.name || '',
      clientId: clients[0]?.id || '',
      status: 'Sent',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      items: [
        { desc: 'Custom Web Application Development Sprint (Milestone 1)', qty: 1, rate: 75000 }
      ]
    };
  }

  // Calculate live subtotal, GST and total
  const subtotal = (invForm.items || []).reduce((acc, item) => acc + (parseFloat(item.rate || 0) * (parseInt(item.qty, 10) || 1)), 0);
  const gstAmount = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + gstAmount;

  // Compute summary figures
  const totalInvoiced = invoices.reduce((acc, inv) => acc + (inv.totalAmount || inv.amount || 0), 0);
  const totalCollected = invoices.filter((i) => i.status === 'Paid').reduce((acc, inv) => acc + (inv.totalAmount || inv.amount || 0), 0);
  const gstCollected = invoices.filter((i) => i.status === 'Paid').reduce((acc, inv) => acc + (inv.taxAmount || 0), 0);
  const totalExpenses = expenses.reduce((acc, exp) => acc + (exp.amount || 0), 0);
  const netMargin = totalCollected - totalExpenses;

  const handleOpenCreateInvoice = () => {
    setEditingInvoice(null);
    setInvForm(getInitialInvoiceForm());
    setModalOpen(true);
  };

  const handleOpenEditInvoice = (inv) => {
    setEditingInvoice(inv);
    setInvForm({
      id: inv.id || '',
      invoiceNumber: inv.invoiceNumber || '',
      clientName: inv.clientName || '',
      clientId: inv.clientId || '',
      status: inv.status || 'Draft',
      issueDate: inv.issueDate || '',
      dueDate: inv.dueDate || '',
      items: Array.isArray(inv.items) && inv.items.length > 0 ? inv.items : [
        { desc: 'Milestone Deliverable', qty: 1, rate: inv.amount || 50000 }
      ]
    });
    setModalOpen(true);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...invForm.items];
    updated[index] = { ...updated[index], [field]: value };
    setInvForm((prev) => ({ ...prev, items: updated }));
  };

  const handleAddItem = () => {
    setInvForm((prev) => ({
      ...prev,
      items: [...prev.items, { desc: '', qty: 1, rate: 0 }]
    }));
  };

  const handleRemoveItem = (index) => {
    if (invForm.items.length <= 1) return;
    setInvForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSaveInvoice = async (e) => {
    e.preventDefault();
    if (!invForm.clientName) {
      showToast('Client name is required', 'error');
      return;
    }

    setSaving(true);
    try {
      await saveInvoice(invForm);
      showToast(`Invoice ${invForm.invoiceNumber} saved successfully.`, 'success');
      setModalOpen(false);
    } catch (err) {
      console.error('Error saving invoice:', err);
      showToast(err.message || 'Failed to save invoice.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateInvoiceStatus(id, status);
      showToast(`Invoice status updated to ${status}`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update invoice status', 'error');
    }
  };

  const handleDeleteInvoice = async (inv) => {
    if (!window.confirm(`Delete invoice ${inv.invoiceNumber}?`)) return;
    try {
      await deleteInvoice(inv.id);
      showToast('Invoice deleted', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete invoice', 'error');
    }
  };

  const handleSaveExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.description || !expenseForm.amount) {
      showToast('Expense description and amount are required', 'error');
      return;
    }

    setSaving(true);
    try {
      await saveExpense(expenseForm);
      showToast('Expense recorded successfully.', 'success');
      setExpenseModalOpen(false);
      setExpenseForm({
        category: 'Software/SaaS',
        vendor: '',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      showToast(err.message || 'Failed to log expense', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExpense = async (exp) => {
    if (!window.confirm(`Delete expense "${exp.description}"?`)) return;
    try {
      await deleteExpense(exp.id);
      showToast('Expense record removed', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to remove expense', 'error');
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (invFilter === 'all') return true;
    return (inv.status || 'draft').toLowerCase() === invFilter.toLowerCase();
  });

  return (
    <div className="view-section">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Financial Operations &amp; Billing</h1>
          <p className="page-header-subtitle">
            GST-compliant invoicing (18%), expenditure tracking, and net agency margin (INR)
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline btn-sm" onClick={() => setExpenseModalOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={14} />
            <span>Log Expense</span>
          </button>
          <button className="btn btn-lime btn-sm" onClick={handleOpenCreateInvoice} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={14} />
            <span>Generate Invoice (18% GST)</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="kpi-grid">
        <div className="kpi-card accent-lime">
          <div className="kpi-top">
            <span className="kpi-label">TOTAL BILLED (INCL. GST)</span>
            <span className="kpi-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={16} />
            </span>
          </div>
          <div className="kpi-value">{formatINR(totalInvoiced)}</div>
          <div className="kpi-delta delta-neutral">Cumulative milestone invoices</div>
        </div>

        <div className="kpi-card accent-lime">
          <div className="kpi-top">
            <span className="kpi-label">COLLECTED REVENUE</span>
            <span className="kpi-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={16} />
            </span>
          </div>
          <div className="kpi-value">{formatINR(totalCollected)}</div>
          <div className="kpi-delta delta-neutral">Cleared in studio bank</div>
        </div>

        <div className="kpi-card accent-blue">
          <div className="kpi-top">
            <span className="kpi-label">GST 18% COLLECTED</span>
            <span className="kpi-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Landmark size={16} />
            </span>
          </div>
          <div className="kpi-value">{formatINR(gstCollected)}</div>
          <div className="kpi-delta delta-neutral">Remittable to tax authorities</div>
        </div>

        <div className="kpi-card accent-red">
          <div className="kpi-top">
            <span className="kpi-label">OPERATING EXPENSES</span>
            <span className="kpi-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown size={16} />
            </span>
          </div>
          <div className="kpi-value">{formatINR(totalExpenses)}</div>
          <div className="kpi-delta delta-neutral">SaaS, cloud, tooling &amp; payroll</div>
        </div>

        <div className="kpi-card accent-purple">
          <div className="kpi-top">
            <span className="kpi-label">NET REALIZED MARGIN</span>
            <span className="kpi-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} />
            </span>
          </div>
          <div className="kpi-value">{formatINR(netMargin)}</div>
          <div className="kpi-delta delta-neutral">Studio operating surplus</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="filter-bar">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${activeTab === 'invoices' ? 'active' : ''}`}
            onClick={() => setActiveTab('invoices')}
          >
            Invoices Vault ({invoices.length})
          </button>
          <button
            className={`filter-tab ${activeTab === 'expenses' ? 'active' : ''}`}
            onClick={() => setActiveTab('expenses')}
          >
            Operating Expenses ({expenses.length})
          </button>
        </div>

        {activeTab === 'invoices' && (
          <div style={{ display: 'flex', gap: '6px' }}>
            {['all', 'paid', 'sent', 'draft', 'overdue'].map((st) => (
              <button
                key={st}
                className={`filter-tab ${invFilter === st ? 'active' : ''}`}
                style={{ fontSize: '0.74rem', padding: '4px 10px' }}
                onClick={() => setInvFilter(st)}
              >
                {st.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Tab Views */}
      {activeTab === 'invoices' ? (
        <div className="card">
          {filteredInvoices.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon-wrap">
                <Receipt size={22} />
              </div>
              <div className="empty-state-title">No invoices found</div>
              <p className="empty-state-desc">Generate client milestone invoices with automatic 18% GST calculation.</p>
              <button className="btn btn-lime btn-sm" onClick={handleOpenCreateInvoice} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={14} />
                <span>Generate First Invoice</span>
              </button>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Client Name</th>
                    <th>Taxable Subtotal</th>
                    <th>GST (18%)</th>
                    <th>Total INR</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="td-primary">{inv.invoiceNumber}</td>
                      <td>{inv.clientName}</td>
                      <td>{formatINR(inv.amount)}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{formatINR(inv.taxAmount)}</td>
                      <td style={{ color: 'var(--brand-lime)', fontWeight: 700 }}>
                        {formatINR(inv.totalAmount || inv.amount)}
                      </td>
                      <td>{formatDate(inv.dueDate)}</td>
                      <td>
                        <select
                          value={inv.status || 'Draft'}
                          onChange={(e) => handleStatusChange(inv.id, e.target.value)}
                          className={`badge badge-${(inv.status || 'draft').toLowerCase()}`}
                          style={{ cursor: 'pointer', outline: 'none' }}
                        >
                          <option value="Draft">Draft</option>
                          <option value="Sent">Sent</option>
                          <option value="Paid">Paid</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="btn btn-navy btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                            onClick={() => handleOpenEditInvoice(inv)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger-outline btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                            onClick={() => handleDeleteInvoice(inv)}
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
          {expenses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon-wrap">
                <TrendingDown size={22} />
              </div>
              <div className="empty-state-title">No expenses logged yet</div>
              <p className="empty-state-desc">Track software licenses, cloud servers, hardware, and marketing costs.</p>
              <button className="btn btn-lime btn-sm" onClick={() => setExpenseModalOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={14} />
                <span>Log First Expense</span>
              </button>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Vendor</th>
                    <th>Description</th>
                    <th>Amount (INR)</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp) => (
                    <tr key={exp.id}>
                      <td>
                        <span className="badge badge-discovery" style={{ fontSize: '0.72rem' }}>
                          {exp.category}
                        </span>
                      </td>
                      <td className="td-primary">{exp.vendor || '—'}</td>
                      <td>{exp.description}</td>
                      <td style={{ color: 'var(--status-red)', fontWeight: 600 }}>
                        {formatINR(exp.amount)}
                      </td>
                      <td>{formatDate(exp.date)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-danger-outline btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                          onClick={() => handleDeleteExpense(exp)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Invoice Generator Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingInvoice ? `Edit Invoice: ${editingInvoice.invoiceNumber}` : 'Generate Client Invoice (GST 18%)'}
        maxWidth="720px"
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
              onClick={handleSaveInvoice}
              disabled={saving}
            >
              <span>{saving ? 'Saving...' : 'Save & Issue Invoice'}</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveInvoice}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="invNumber">Invoice Reference #</label>
              <input
                type="text"
                id="invNumber"
                className="form-control"
                value={invForm.invoiceNumber}
                onChange={(e) => setInvForm({ ...invForm, invoiceNumber: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="invClient">Client Account</label>
              <select
                id="invClient"
                className="form-control"
                value={invForm.clientName}
                onChange={(e) => {
                  const selClient = clients.find((c) => c.name === e.target.value);
                  setInvForm({
                    ...invForm,
                    clientName: e.target.value,
                    clientId: selClient?.id || ''
                  });
                }}
                required
              >
                <option value="">Select or type client name...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.name}>{c.name} ({c.company})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="issueDate">Issue Date</label>
              <input
                type="date"
                id="issueDate"
                className="form-control"
                value={invForm.issueDate}
                onChange={(e) => setInvForm({ ...invForm, issueDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="dueDate">Due Date</label>
              <input
                type="date"
                id="dueDate"
                className="form-control"
                value={invForm.dueDate}
                onChange={(e) => setInvForm({ ...invForm, dueDate: e.target.value })}
              />
            </div>
          </div>

          {/* Line items table */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Deliverable Line Items</label>
              <button
                type="button"
                className="btn btn-navy btn-sm"
                style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                onClick={handleAddItem}
              >
                + Add Item
              </button>
            </div>

            {invForm.items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 80px 140px 30px',
                  gap: '8px',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}
              >
                <input
                  type="text"
                  className="form-control"
                  placeholder="Deliverable description..."
                  value={item.desc}
                  onChange={(e) => handleItemChange(idx, 'desc', e.target.value)}
                  required
                />
                <input
                  type="number"
                  className="form-control"
                  placeholder="Qty"
                  value={item.qty}
                  min="1"
                  onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                  required
                />
                <input
                  type="number"
                  className="form-control"
                  placeholder="Rate (INR)"
                  value={item.rate}
                  min="0"
                  onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  style={{ color: 'var(--status-red)', cursor: 'pointer', textAlign: 'center', background: 'none', border: 'none', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Remove item"
                  aria-label="Remove item"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Tax Calculation Box */}
          <div
            style={{
              background: 'var(--surface-deep)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              <span>Taxable Subtotal:</span>
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{formatINR(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              <span>Integrated GST (18.00%):</span>
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{formatINR(gstAmount)}</span>
            </div>
            <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800 }}>
              <span style={{ color: 'var(--text-main)' }}>Total Payable (INR):</span>
              <span style={{ color: 'var(--brand-lime)' }}>{formatINR(grandTotal)}</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="invStatus">Invoice Status</label>
            <select
              id="invStatus"
              className="form-control"
              value={invForm.status}
              onChange={(e) => setInvForm({ ...invForm, status: e.target.value })}
            >
              <option value="Draft">Draft</option>
              <option value="Sent">Sent to Client</option>
              <option value="Paid">Paid / Settled</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Expense Modal */}
      <Modal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        title="Log Operational Expenditure"
        maxWidth="520px"
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setExpenseModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-lime btn-sm"
              onClick={handleSaveExpense}
              disabled={saving}
            >
              <span>{saving ? 'Logging...' : 'Record Expense'}</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveExpense}>
          <div className="form-group">
            <label className="form-label" htmlFor="expCategory">Category</label>
            <select
              id="expCategory"
              className="form-control"
              value={expenseForm.category}
              onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
            >
              <option value="Software/SaaS">Software / SaaS (Figma, GitHub, Vercel, Firebase)</option>
              <option value="Contractors">Contractors &amp; Freelance Engineers</option>
              <option value="Office/Utilities">Office &amp; High-Speed Internet</option>
              <option value="Hardware">Hardware &amp; Apple Workstations</option>
              <option value="Marketing">Marketing, SEO &amp; Ads</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="expVendor">Vendor / Service Provider</label>
              <input
                type="text"
                id="expVendor"
                className="form-control"
                placeholder="e.g. Google Cloud / Figma"
                value={expenseForm.vendor}
                onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="expAmount">Amount (INR) *</label>
              <input
                type="number"
                id="expAmount"
                className="form-control"
                placeholder="e.g. 12500"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="expDesc">Description *</label>
            <input
              type="text"
              id="expDesc"
              className="form-control"
              placeholder="e.g. Monthly Enterprise Figma organization license"
              value={expenseForm.description}
              onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="expDate">Expense Date</label>
            <input
              type="date"
              id="expDate"
              className="form-control"
              value={expenseForm.date}
              onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
