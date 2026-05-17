import React from 'react';
import { useNavigate } from 'react-router-dom';

function getStatusBadgeClass(status) {
  const map = {
    'Open': 'badge-status-open',
    'Assigned': 'badge-status-assigned',
    'In Progress': 'badge-status-in-progress',
    'Pending Customer Response': 'badge-status-pending-customer-response',
    'Escalated': 'badge-status-escalated',
    'Resolved': 'badge-status-resolved',
    'Closed': 'badge-status-closed',
  };
  return map[status] || 'badge-status-open';
}

function getPriorityBadgeClass(priority) {
  const map = {
    'Low': 'badge-priority-low',
    'Medium': 'badge-priority-medium',
    'High': 'badge-priority-high',
    'Critical': 'badge-priority-critical',
  };
  return map[priority] || 'badge-priority-medium';
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function ComplaintCard({ complaint }) {
  const navigate = useNavigate();

  return (
    <div
      className="complaint-card"
      style={{ cursor: 'pointer' }}
      onClick={() => navigate(`/complaints/${complaint.complaint_id}`)}
    >
      <div className="complaint-card-header">
        <div>
          <div className="complaint-number font-mono">{complaint.complaint_number}</div>
          <div className="complaint-customer">{complaint.customer_name}</div>
          <div className="complaint-category">{complaint.category}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className={`badge ${getPriorityBadgeClass(complaint.priority)}`}>
            {complaint.priority}
          </span>
        </div>
      </div>
      <div className="complaint-card-badges">
        <span className={`badge ${getStatusBadgeClass(complaint.status)}`}>
          {complaint.status}
        </span>
      </div>
      <div className="complaint-card-meta">
        Registered: {formatDate(complaint.created_at)}
      </div>
    </div>
  );
}

export { getStatusBadgeClass, getPriorityBadgeClass, formatDate };
export default ComplaintCard;
