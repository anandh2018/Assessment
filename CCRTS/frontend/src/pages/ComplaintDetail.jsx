import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getComplaint, updateComplaint } from '../services/api';
import { getStatusBadgeClass, getPriorityBadgeClass, formatDate } from '../components/ComplaintCard';

const STATUSES = [
  'Open', 'Assigned', 'In Progress', 'Pending Customer Response',
  'Escalated', 'Resolved', 'Closed'
];

function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [updateForm, setUpdateForm] = useState({
    status: '',
    assigned_to: '',
    resolution_notes: '',
    comments: '',
    updated_by: '',
  });
  const [updateErrors, setUpdateErrors] = useState({});
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadComplaint();
  }, [id]);

  const loadComplaint = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getComplaint(id);
      setComplaint(data);
      setUpdateForm({
        status: data.status,
        assigned_to: data.assigned_to || '',
        resolution_notes: data.resolution_notes || '',
        comments: '',
        updated_by: '',
      });
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Complaint not found.');
      } else {
        setError('Failed to load complaint details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm(prev => ({ ...prev, [name]: value }));
    if (updateErrors[name]) setUpdateErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateUpdate = () => {
    const errs = {};
    if (!updateForm.status) errs.status = 'Status is required.';
    return errs;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const errs = validateUpdate();
    if (Object.keys(errs).length > 0) {
      setUpdateErrors(errs);
      return;
    }
    setUpdating(true);
    setError('');
    try {
      const payload = {
        status: updateForm.status,
        assigned_to: updateForm.assigned_to || null,
        resolution_notes: updateForm.resolution_notes || null,
        comments: updateForm.comments || null,
        updated_by: updateForm.updated_by || 'Agent',
      };
      const updated = await updateComplaint(id, payload);
      setComplaint(updated);
      setUpdateForm(prev => ({ ...prev, comments: '', updated_by: '' }));
      setSuccessMsg('Complaint updated successfully.');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch {
      setError('Failed to update complaint.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span>Loading complaint details...</span>
      </div>
    );
  }

  if (error && !complaint) {
    return (
      <div>
        <div className="alert alert-error">{error}</div>
        <button className="btn btn-secondary" onClick={() => navigate('/complaints')}>
          &#8592; Back to List
        </button>
      </div>
    );
  }

  const history = complaint?.history || [];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div className="page-title" style={{ margin: 0 }}>
              {complaint.complaint_number}
            </div>
            <span className={`badge ${getStatusBadgeClass(complaint.status)}`}>
              {complaint.status}
            </span>
            <span className={`badge ${getPriorityBadgeClass(complaint.priority)}`}>
              {complaint.priority}
            </span>
          </div>
          <div className="page-subtitle">{complaint.customer_name} &mdash; {complaint.category}</div>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/complaints')}>
          &#8592; Back to List
        </button>
      </div>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="detail-grid">
        {/* Left: Details */}
        <div>
          {/* Complaint Info Card */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="section-title">Complaint Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
              <div className="detail-field">
                <div className="detail-field-label">Complaint Number</div>
                <div className="detail-field-value font-mono" style={{ color: '#c0392b' }}>
                  {complaint.complaint_number}
                </div>
              </div>
              <div className="detail-field">
                <div className="detail-field-label">Status</div>
                <div className="detail-field-value">
                  <span className={`badge ${getStatusBadgeClass(complaint.status)}`}>
                    {complaint.status}
                  </span>
                </div>
              </div>
              <div className="detail-field">
                <div className="detail-field-label">Customer Name</div>
                <div className="detail-field-value">{complaint.customer_name}</div>
              </div>
              <div className="detail-field">
                <div className="detail-field-label">Priority</div>
                <div className="detail-field-value">
                  <span className={`badge ${getPriorityBadgeClass(complaint.priority)}`}>
                    {complaint.priority}
                  </span>
                </div>
              </div>
              <div className="detail-field">
                <div className="detail-field-label">Contact Email</div>
                <div className="detail-field-value">{complaint.contact_email || '—'}</div>
              </div>
              <div className="detail-field">
                <div className="detail-field-label">Contact Phone</div>
                <div className="detail-field-value">{complaint.contact_phone || '—'}</div>
              </div>
              <div className="detail-field">
                <div className="detail-field-label">Category</div>
                <div className="detail-field-value">{complaint.category}</div>
              </div>
              <div className="detail-field">
                <div className="detail-field-label">Assigned To</div>
                <div className="detail-field-value">{complaint.assigned_to || '—'}</div>
              </div>
              <div className="detail-field">
                <div className="detail-field-label">Registered On</div>
                <div className="detail-field-value">{formatDate(complaint.created_at)}</div>
              </div>
              <div className="detail-field">
                <div className="detail-field-label">Last Updated</div>
                <div className="detail-field-value">{formatDate(complaint.updated_at)}</div>
              </div>
            </div>

            <div className="detail-field" style={{ marginTop: '8px' }}>
              <div className="detail-field-label">Description</div>
              <div
                className="detail-field-value"
                style={{
                  background: '#f9fafb',
                  padding: '12px 14px',
                  borderRadius: '6px',
                  border: '1px solid #dce1e7',
                  lineHeight: '1.7',
                  marginTop: '4px'
                }}
              >
                {complaint.description}
              </div>
            </div>

            {complaint.resolution_notes && (
              <div className="detail-field" style={{ marginTop: '8px' }}>
                <div className="detail-field-label">Resolution Notes</div>
                <div
                  className="detail-field-value"
                  style={{
                    background: '#eafaf1',
                    padding: '12px 14px',
                    borderRadius: '6px',
                    border: '1px solid #a9dfbf',
                    lineHeight: '1.7',
                    marginTop: '4px'
                  }}
                >
                  {complaint.resolution_notes}
                </div>
              </div>
            )}
          </div>

          {/* Status History Timeline */}
          <div className="card">
            <div className="section-title">Status History</div>
            {history.length === 0 ? (
              <div className="text-muted" style={{ fontSize: '0.88rem' }}>No history entries yet.</div>
            ) : (
              <div className="timeline">
                {history.map(h => (
                  <div className="timeline-item" key={h.history_id}>
                    <div className="timeline-dot" />
                    <div className="timeline-date">{formatDate(h.updated_at)}</div>
                    <div className="timeline-content">
                      <div className="timeline-status-change">
                        {h.old_status ? (
                          <>
                            <span className={`badge ${getStatusBadgeClass(h.old_status)}`}>
                              {h.old_status}
                            </span>
                            <span className="timeline-arrow">&#8594;</span>
                            <span className={`badge ${getStatusBadgeClass(h.new_status)}`}>
                              {h.new_status}
                            </span>
                          </>
                        ) : (
                          <span className={`badge ${getStatusBadgeClass(h.new_status)}`}>
                            {h.new_status}
                          </span>
                        )}
                      </div>
                      {h.comments && (
                        <div className="timeline-comment">{h.comments}</div>
                      )}
                      {h.updated_by && (
                        <div className="timeline-by">By: {h.updated_by}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Update Panel */}
        <div>
          <div className="card" style={{ position: 'sticky', top: '84px' }}>
            <div className="section-title">Update Complaint</div>
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label className="form-label">
                  Status <span className="required">*</span>
                </label>
                <select
                  name="status"
                  value={updateForm.status}
                  onChange={handleUpdateChange}
                  className={`form-control ${updateErrors.status ? 'error' : ''}`}
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {updateErrors.status && <div className="form-error">{updateErrors.status}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Assigned To</label>
                <input
                  type="text"
                  name="assigned_to"
                  value={updateForm.assigned_to}
                  onChange={handleUpdateChange}
                  className="form-control"
                  placeholder="Agent or team name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Resolution Notes</label>
                <textarea
                  name="resolution_notes"
                  value={updateForm.resolution_notes}
                  onChange={handleUpdateChange}
                  className="form-control"
                  placeholder="Describe the resolution..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Comments (for history)</label>
                <textarea
                  name="comments"
                  value={updateForm.comments}
                  onChange={handleUpdateChange}
                  className="form-control"
                  placeholder="Add a comment about this update..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Updated By</label>
                <input
                  type="text"
                  name="updated_by"
                  value={updateForm.updated_by}
                  onChange={handleUpdateChange}
                  className="form-control"
                  placeholder="Your name or ID"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={updating}
              >
                {updating ? 'Updating...' : 'Update Complaint'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComplaintDetail;
