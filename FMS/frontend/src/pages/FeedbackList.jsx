import { useState, useEffect } from 'react';
import API from '../api';

const RATING_LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };

function RatingBadge({ rating }) {
  return (
    <span className={`rating-badge rating-${rating}`}>
      {'⭐'.repeat(rating)} {rating}/5
    </span>
  );
}

function EditModal({ feedback, onClose, onSave }) {
  const [form, setForm] = useState({
    participant_name: feedback.participant_name,
    program_name: feedback.program_name,
    rating: feedback.rating,
    comments: feedback.comments || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'rating' ? parseInt(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.participant_name.trim()) { setError('Participant name is required.'); return; }
    if (!form.program_name.trim()) { setError('Program name is required.'); return; }
    if (form.rating < 1 || form.rating > 5) { setError('Rating must be 1–5.'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await API.put(`/feedback/${feedback.feedback_id}`, form);
      onSave(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update feedback.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Feedback #{feedback.feedback_id}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Participant Name *</label>
            <input name="participant_name" value={form.participant_name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Program Name *</label>
            <input name="program_name" value={form.program_name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Rating *</label>
            <div className="rating-options">
              {[1, 2, 3, 4, 5].map((r) => (
                <label key={r} className={`rating-option ${form.rating === r ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="rating"
                    value={r}
                    checked={form.rating === r}
                    onChange={handleChange}
                  />
                  {r} ⭐ {RATING_LABELS[r]}
                </label>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Comments</label>
            <textarea name="comments" value={form.comments} onChange={handleChange} rows={3} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editTarget, setEditTarget] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await API.get('/feedback');
      setFeedbacks(res.data);
    } catch {
      setError('Failed to load feedback. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleteLoading(true);
    try {
      await API.delete(`/feedback/${id}`);
      setFeedbacks((prev) => prev.filter((f) => f.feedback_id !== id));
      setSuccessMsg('Feedback deleted successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setError('Failed to delete feedback.');
    } finally {
      setDeleteLoading(false);
      setDeleteConfirm(null);
    }
  };

  const handleSave = (updated) => {
    setFeedbacks((prev) => prev.map((f) => f.feedback_id === updated.feedback_id ? updated : f));
    setEditTarget(null);
    setSuccessMsg('Feedback updated successfully.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  if (loading) return <div className="loading">Loading feedback...</div>;

  return (
    <div>
      <h1 className="page-title">All Feedback</h1>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {feedbacks.length === 0 ? (
        <div className="no-results">No feedback found. Be the first to submit!</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Participant</th>
                <th>Program</th>
                <th>Rating</th>
                <th>Comments</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((fb) => (
                <tr key={fb.feedback_id}>
                  <td style={{ color: '#999', fontSize: '0.8rem' }}>#{fb.feedback_id}</td>
                  <td style={{ fontWeight: 600 }}>{fb.participant_name}</td>
                  <td>{fb.program_name}</td>
                  <td><span className={`rating-badge rating-${fb.rating}`}>{'⭐'.repeat(fb.rating)} {fb.rating}/5</span></td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {fb.comments || <span style={{ color: '#bbb' }}>—</span>}
                  </td>
                  <td>{formatDate(fb.submitted_at)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => setEditTarget(fb)}
                      >
                        Edit
                      </button>
                      {deleteConfirm === fb.feedback_id ? (
                        <>
                          <button
                            className="btn btn-danger btn-sm"
                            disabled={deleteLoading}
                            onClick={() => handleDelete(fb.feedback_id)}
                          >
                            {deleteLoading ? '...' : 'Confirm'}
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setDeleteConfirm(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteConfirm(fb.feedback_id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editTarget && (
        <EditModal
          feedback={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
