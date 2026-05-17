import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket } from '../services/api';

const CATEGORIES = [
  'VPN Issue',
  'Password Reset',
  'Software Installation',
  'Laptop Issue',
  'Email Access',
  'Network Connectivity',
  'Hardware Request',
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const initialForm = {
  employee_name: '',
  department: '',
  issue_category: '',
  description: '',
  priority: '',
};

function FormField({ label, required, error, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{
        display: 'block', marginBottom: '6px',
        fontSize: '13px', fontWeight: '600', color: '#374151',
      }}>
        {label} {required && <span style={{ color: '#e53e3e' }}>*</span>}
      </label>
      {children}
      {error && (
        <div style={{ marginTop: '4px', fontSize: '12px', color: '#e53e3e' }}>{error}</div>
      )}
    </div>
  );
}

const inputStyle = (hasError) => ({
  width: '100%',
  padding: '9px 12px',
  border: `1px solid ${hasError ? '#e53e3e' : '#d1d5db'}`,
  borderRadius: '7px',
  fontSize: '14px',
  color: '#1a202c',
  backgroundColor: '#fff',
  outline: 'none',
  transition: 'border-color 0.15s',
});

function CreateTicket() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const errs = {};
    if (!form.employee_name.trim()) errs.employee_name = 'Employee name is required';
    if (!form.department.trim()) errs.department = 'Department is required';
    if (!form.issue_category) errs.issue_category = 'Please select a category';
    if (!form.description.trim()) errs.description = 'Description is required';
    else if (form.description.trim().length < 10) errs.description = 'Description must be at least 10 characters';
    if (!form.priority) errs.priority = 'Please select a priority';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    setServerError('');
    try {
      await createTicket(form);
      navigate('/tickets');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const styles = {
    container: { maxWidth: '680px', margin: '0 auto' },
    header: { marginBottom: '24px' },
    title: { fontSize: '22px', fontWeight: '700', color: '#1a202c' },
    subtitle: { fontSize: '13px', color: '#6b7280', marginTop: '4px' },
    card: {
      backgroundColor: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '32px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    },
    row: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
    },
    actions: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      borderTop: '1px solid #f0f4f8',
      paddingTop: '20px',
      marginTop: '8px',
    },
    btnCancel: {
      padding: '9px 20px', fontSize: '14px', fontWeight: '500',
      backgroundColor: '#fff', color: '#374151',
      border: '1px solid #d1d5db', borderRadius: '7px',
    },
    btnSubmit: {
      padding: '9px 24px', fontSize: '14px', fontWeight: '600',
      backgroundColor: submitting ? '#93c5fd' : '#1a56db',
      color: '#fff', border: 'none', borderRadius: '7px',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>Create New Ticket</div>
        <div style={styles.subtitle}>Submit a new IT support request</div>
      </div>

      {serverError && (
        <div style={{
          backgroundColor: '#fee2e2', border: '1px solid #fca5a5',
          color: '#991b1b', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px',
        }}>
          {serverError}
        </div>
      )}

      <div style={styles.card}>
        <form onSubmit={handleSubmit} noValidate>
          <div style={styles.row}>
            <FormField label="Employee Name" required error={errors.employee_name}>
              <input
                type="text"
                name="employee_name"
                value={form.employee_name}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                style={inputStyle(!!errors.employee_name)}
                onFocus={(e) => e.target.style.borderColor = '#3182ce'}
                onBlur={(e) => e.target.style.borderColor = errors.employee_name ? '#e53e3e' : '#d1d5db'}
              />
            </FormField>
            <FormField label="Department" required error={errors.department}>
              <input
                type="text"
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="e.g. Engineering"
                style={inputStyle(!!errors.department)}
                onFocus={(e) => e.target.style.borderColor = '#3182ce'}
                onBlur={(e) => e.target.style.borderColor = errors.department ? '#e53e3e' : '#d1d5db'}
              />
            </FormField>
          </div>

          <div style={styles.row}>
            <FormField label="Issue Category" required error={errors.issue_category}>
              <select
                name="issue_category"
                value={form.issue_category}
                onChange={handleChange}
                style={{ ...inputStyle(!!errors.issue_category), cursor: 'pointer' }}
              >
                <option value="">-- Select Category --</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Priority" required error={errors.priority}>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                style={{ ...inputStyle(!!errors.priority), cursor: 'pointer' }}
              >
                <option value="">-- Select Priority --</option>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Description" required error={errors.description}>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the issue in detail (minimum 10 characters)..."
              rows={5}
              style={{
                ...inputStyle(!!errors.description),
                resize: 'vertical',
                minHeight: '100px',
              }}
              onFocus={(e) => e.target.style.borderColor = '#3182ce'}
              onBlur={(e) => e.target.style.borderColor = errors.description ? '#e53e3e' : '#d1d5db'}
            />
          </FormField>

          <div style={styles.actions}>
            <button
              type="button"
              style={styles.btnCancel}
              onClick={() => navigate('/tickets')}
            >
              Cancel
            </button>
            <button type="submit" style={styles.btnSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTicket;
