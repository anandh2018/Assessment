import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllComplaints, deleteComplaint, searchComplaints } from '../services/api';
import { getStatusBadgeClass, getPriorityBadgeClass, formatDate } from '../components/ComplaintCard';

const STATUSES = [
  'Open', 'Assigned', 'In Progress', 'Pending Customer Response',
  'Escalated', 'Resolved', 'Closed'
];

const CATEGORIES = [
  'Billing Issues', 'Service Disruption', 'Product Defects',
  'Technical Problems', 'Delivery Delays', 'Account Issues',
  'Customer Service Complaints',
];

function ComplaintList() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let data;
      if (searchTerm.trim()) {
        data = await searchComplaints({
          keyword: searchTerm,
          status: filterStatus || undefined,
          category: filterCategory || undefined,
          priority: filterPriority || undefined,
        });
      } else {
        data = await getAllComplaints({
          status: filterStatus || undefined,
          category: filterCategory || undefined,
          priority: filterPriority || undefined,
        });
      }
      setComplaints(data);
    } catch {
      setError('Failed to load complaints. Please check the backend connection.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterStatus, filterCategory, filterPriority]);

  useEffect(() => {
    const timer = setTimeout(fetchComplaints, searchTerm ? 350 : 0);
    return () => clearTimeout(timer);
  }, [fetchComplaints]);

  const handleDelete = async (id, number) => {
    if (!window.confirm(`Delete complaint ${number}? This action cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteComplaint(id);
      setSuccessMsg(`Complaint ${number} deleted successfully.`);
      setComplaints(prev => prev.filter(c => c.complaint_id !== id));
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setError('Failed to delete complaint.');
    } finally {
      setDeletingId(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setFilterCategory('');
    setFilterPriority('');
  };

  const hasFilters = searchTerm || filterStatus || filterCategory || filterPriority;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">All Complaints</div>
          <div className="page-subtitle">
            {loading ? 'Loading...' : `${complaints.length} complaint${complaints.length !== 1 ? 's' : ''} found`}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/complaints/register')}>
          + Register Complaint
        </button>
      </div>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Filters Bar */}
      <div className="filters-bar">
        <div className="search-input-wrap">
          <span className="search-icon">&#128269;</span>
          <input
            type="text"
            placeholder="Search by name, number, email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          className="filter-select"
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          className="filter-select"
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
        >
          <option value="">All Priorities</option>
          {['Low', 'Medium', 'High', 'Critical'].map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {hasFilters && (
          <button className="btn btn-secondary btn-sm" onClick={clearFilters}>
            Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <span>Loading complaints...</span>
          </div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">&#128196;</div>
            <div className="empty-state-title">
              {hasFilters ? 'No complaints match your filters' : 'No complaints found'}
            </div>
            <p className="text-muted" style={{ marginTop: '8px' }}>
              {hasFilters
                ? 'Try adjusting your search or filters.'
                : 'Click "Register Complaint" to add the first one.'}
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Complaint #</th>
                  <th>Customer</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c.complaint_id}>
                    <td
                      className="font-mono"
                      style={{ color: '#c0392b', fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => navigate(`/complaints/${c.complaint_id}`)}
                    >
                      {c.complaint_number}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{c.customer_name}</div>
                      {c.contact_email && (
                        <div style={{ fontSize: '0.78rem', color: '#7f8c8d' }}>{c.contact_email}</div>
                      )}
                    </td>
                    <td>{c.category}</td>
                    <td>
                      <span className={`badge ${getPriorityBadgeClass(c.priority)}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>{c.assigned_to || <span className="text-muted">—</span>}</td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                      {formatDate(c.created_at)}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/complaints/${c.complaint_id}`)}
                        >
                          View
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(c.complaint_id, c.complaint_number)}
                          disabled={deletingId === c.complaint_id}
                        >
                          {deletingId === c.complaint_id ? '...' : 'Delete'}
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

export default ComplaintList;
