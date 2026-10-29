import React, { useState } from 'react';
import { User, Calendar, X, Plus, ArrowRight } from 'lucide-react';
import Modal from '../components/Modal';
import { saveTask, updateTaskStatus, deleteTask, formatDate } from '../services/firestoreService';

export default function TasksView({ tasks = [], clients = [], showToast, modalOpen, setModalOpen }) {
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState(getInitialForm());
  const [saving, setSaving] = useState(false);

  function getInitialForm() {
    return {
      id: '',
      title: '',
      assignee: 'Rahul',
      priority: 'High',
      status: 'To Do',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      relatedTo: clients[0]?.company || 'LeoVantage Internal'
    };
  }

  const columns = [
    { key: 'To Do', label: 'To Do', badgeClass: 'badge-draft' },
    { key: 'In Progress', label: 'In Progress', badgeClass: 'badge-in-progress' },
    { key: 'In Review', label: 'In Review', badgeClass: 'badge-review' },
    { key: 'Done', label: 'Completed', badgeClass: 'badge-completed' }
  ];

  const handleOpenCreate = () => {
    setEditingTask(null);
    setFormData(getInitialForm());
    setModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditingTask(t);
    setFormData({
      id: t.id || '',
      title: t.title || '',
      assignee: t.assignee || 'Rahul',
      priority: t.priority || 'Medium',
      status: t.status || 'To Do',
      dueDate: t.dueDate || '',
      relatedTo: t.relatedTo || ''
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Task title is required.', 'error');
      return;
    }

    setSaving(true);
    try {
      await saveTask(formData);
      showToast(`Task "${formData.title}" saved.`, 'success');
      setModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Failed to save task.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAdvanceStatus = async (task) => {
    const statusOrder = ['To Do', 'In Progress', 'In Review', 'Done'];
    const curIdx = statusOrder.indexOf(task.status || 'To Do');
    if (curIdx < statusOrder.length - 1) {
      const nextStatus = statusOrder[curIdx + 1];
      try {
        await updateTaskStatus(task.id, nextStatus);
        showToast(`Task moved to ${nextStatus}`, 'success');
      } catch (err) {
        showToast(err.message || 'Failed to advance status', 'error');
      }
    }
  };

  const handleDelete = async (t) => {
    if (!window.confirm(`Delete task "${t.title}"?`)) return;
    try {
      await deleteTask(t.id);
      showToast('Task deleted.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete task', 'error');
    }
  };

  return (
    <div className="view-section">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Tasks &amp; Sprint Backlog</h1>
          <p className="page-header-subtitle">
            Agile engineering cards, assignment matrix, and milestone deliverables
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-lime btn-sm" onClick={handleOpenCreate} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={14} />
            <span>Create Sprint Task</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => (t.status || 'To Do') === col.key);
          return (
            <div
              key={col.key}
              style={{
                background: 'var(--surface-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '400px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-main)' }}>
                  {col.label}
                </span>
                <span className={`badge ${col.badgeClass}`} style={{ fontSize: '0.72rem' }}>
                  {colTasks.length}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                {colTasks.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      background: 'var(--brand-navy-secondary)',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)', flex: 1 }}>
                        {t.title}
                      </span>
                      <span
                        className="badge"
                        style={{
                          fontSize: '0.65rem',
                          background: t.priority === 'High' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: t.priority === 'High' ? 'var(--status-red)' : 'var(--status-amber)'
                        }}
                      >
                        {t.priority}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Account: {t.relatedTo || 'Studio General'}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '0.74rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--brand-lime)', fontWeight: 600 }}>
                        <User size={12} />
                        {t.assignee}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                        <Calendar size={12} />
                        {formatDate(t.dueDate)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          onClick={() => handleOpenEdit(t)}
                          style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(t)}
                          style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.72rem', color: 'var(--status-red)', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                          aria-label="Delete task"
                        >
                          <X size={12} />
                        </button>
                      </div>

                      {col.key !== 'Done' && (
                        <button
                          onClick={() => handleAdvanceStatus(t)}
                          className="btn btn-lime btn-sm"
                          style={{ padding: '2px 8px', fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                        >
                          <span>Next</span>
                          <ArrowRight size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTask ? `Edit Task: ${editingTask.title}` : 'Create Sprint Task'}
        maxWidth="540px"
        footer={
          <>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-lime btn-sm" onClick={handleSave} disabled={saving}>
              <span>{saving ? 'Saving...' : 'Save Task'}</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label" htmlFor="taskTitle">Task Summary *</label>
            <input
              type="text"
              id="taskTitle"
              className="form-control"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Implement offline SQLite sync bridge for Hisaab mobile app"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="taskAssignee">Assignee</label>
              <select
                id="taskAssignee"
                className="form-control"
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              >
                <option value="Rahul">Rahul (Co-Founder &amp; Tech Lead)</option>
                <option value="Gulesh Patel">Gulesh Patel (Co-Founder &amp; Creative Dir)</option>
                <option value="Nitin Sinha">Nitin Sinha (Co-Founder &amp; Product Head)</option>
                <option value="Aarav Kapoor">Aarav Kapoor (Senior UI/UX)</option>
                <option value="Pooja Sharma">Pooja Sharma (Frontend Motion)</option>
                <option value="Varun Rao">Varun Rao (Mobile Architect)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="taskPriority">Priority</label>
              <select
                id="taskPriority"
                className="form-control"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="taskStatus">Initial Status</label>
              <select
                id="taskStatus"
                className="form-control"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="In Review">In Review</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="taskDue">Due Date</label>
              <input
                type="date"
                id="taskDue"
                className="form-control"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="taskRelated">Associated Client / Account</label>
            <input
              type="text"
              id="taskRelated"
              className="form-control"
              value={formData.relatedTo}
              onChange={(e) => setFormData({ ...formData, relatedTo: e.target.value })}
              placeholder="e.g. PID Academy / Hisaab Labs"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
