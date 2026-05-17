import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createComplaint } from '../services/api';

const CATEGORIES = [
  'Billing Issues',
  'Service Disruption',
  'Product Defects',
  'Technical Problems',
  'Delivery Delays',
  'Account Issues',
  'Customer Service Complaints',
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const INITIAL_FORM = {
  customer_name: '',
  contact_email: '',
  contact_phone: '',
  category: '',
  priority: '',
  description: '',
};

function RegisterComplaint() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const errs = {};
    if (!form.customer_name.trim()) errs.customer_name = 'Customer name is required.';
    if (form.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email)) {
      errs.contact_email = 'Enter a valid email address.';
    }
    if (!form.category) errs.category = 'Please select a category.';
    if (!form.priority) errs.priority = 'Please select a priority.';
    if (!form.description.trim()) errs.description = 'Description is required.';
    else if (form.description.trim().length < 10) errs.description = 'Description must be at least 10 characters.';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    setApiError('');
    try {
      await createComplaint(form);
      navigate('/complaints');
    } catch (err) {
      setApiError(
        err.response?.data?.detail || 'Failed to register complaint. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Register Complaint</div>
          <div className="page-subtitle">Submit a new customer complaint for tracking</div>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/complaints')}>
          &#8592; Back to List
        </button>
      </div>

      <div className="card" style={{ maxWidth: '780px' }}>
        {apiError && <div className="alert alert-error">{apiError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {/* Customer Info */}
          <div className="section-title">Customer Information</div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Customer Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="customer_name"
                value={form.customer_name}
                onChange={handleChange}
                className={`form-control ${errors.customer_name ? 'error' : ''}`}
                placeholder="Enter full name"
              />
              {errors.customer_name && <div className="form-error">{errors.customer_name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Contact Email</label>
              <input
                type="email"
                name="contact_email"
                value={form.contact_email}
                onChange={handleChange}
                className={`form-control ${errors.contact_email ? 'error' : ''}`}
                placeholder="email@example.com"
              />
              {errors.contact_email && <div className="form-error">{errors.contact_email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="tel"
                name="contact_phone"
                value={form.contact_phone}
                onChange={handleChange}
                className="form-control"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <hr className="divider" />

          {/* Complaint Details */}
          <div className="section-title">Complaint Details</div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Category <span className="required">*</span>
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className={`form-control ${errors.category ? 'error' : ''}`}
              >
                <option value="">-- Select Category --</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.category && <div className="form-error">{errors.category}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Priority <span className="required">*</span>
              </label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className={`form-control ${errors.priority ? 'error' : ''}`}
              >
                <option value="">-- Select Priority --</option>
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              {errors.priority && <div className="form-error">{errors.priority}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Description <span className="required">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className={`form-control ${errors.description ? 'error' : ''}`}
              placeholder="Describe the complaint in detail..."
              rows={5}
            />
            {errors.description && <div className="form-error">{errors.description}</div>}
          </div>

          <div className="d-flex gap-2" style={{ marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => { setForm(INITIAL_FORM); setErrors({}); setApiError(''); }}
              disabled={submitting}
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterComplaint;
