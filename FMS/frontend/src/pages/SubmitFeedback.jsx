import { useState } from 'react';
import API from '../api';

const RATING_LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };

const INITIAL_FORM = {
  participant_name: '',
  program_name: '',
  rating: 0,
  comments: '',
};

export default function SubmitFeedback() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!form.participant_name.trim()) errors.participant_name = 'Participant name is required.';
    if (!form.program_name.trim()) errors.program_name = 'Program name is required.';
    if (!form.rating || form.rating < 1 || form.rating > 5) errors.rating = 'Please select a rating from 1 to 5.';
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'rating' ? parseInt(value) : value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await API.post('/feedback', {
        participant_name: form.participant_name.trim(),
        program_name: form.program_name.trim(),
        rating: form.rating,
        comments: form.comments.trim() || null,
      });
      setSuccess('Feedback submitted successfully! Thank you for your response.');
      setForm(INITIAL_FORM);
      setFieldErrors({});
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((d) => d.msg).join(', '));
      } else {
        setError(detail || 'Failed to submit feedback. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Submit Feedback</h1>

      <div className="form-container">
        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="participant_name">Participant Name *</label>
            <input
              id="participant_name"
              name="participant_name"
              type="text"
              value={form.participant_name}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
            {fieldErrors.participant_name && (
              <span style={{ color: '#c62828', fontSize: '0.8rem', marginTop: '0.2rem', display: 'block' }}>
                {fieldErrors.participant_name}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="program_name">Training / Program Name *</label>
            <input
              id="program_name"
              name="program_name"
              type="text"
              value={form.program_name}
              onChange={handleChange}
              placeholder="e.g. React for Beginners, Python Bootcamp"
            />
            {fieldErrors.program_name && (
              <span style={{ color: '#c62828', fontSize: '0.8rem', marginTop: '0.2rem', display: 'block' }}>
                {fieldErrors.program_name}
              </span>
            )}
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
                  {r} ⭐ <span style={{ fontSize: '0.8rem', color: '#666' }}>{RATING_LABELS[r]}</span>
                </label>
              ))}
            </div>
            {fieldErrors.rating && (
              <span style={{ color: '#c62828', fontSize: '0.8rem', marginTop: '0.4rem', display: 'block' }}>
                {fieldErrors.rating}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="comments">Comments</label>
            <textarea
              id="comments"
              name="comments"
              value={form.comments}
              onChange={handleChange}
              placeholder="Share your thoughts about the training program..."
              rows={4}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', padding: '0.75rem' }}>
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}
