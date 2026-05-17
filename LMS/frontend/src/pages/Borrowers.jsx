import { useState, useEffect } from 'react';
import API from '../api';

const EMPTY_FORM = { borrower_name: '', email: '', phone: '' };

export default function Borrowers() {
  const [borrowers, setBorrowers] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editBorrower, setEditBorrower] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchBorrowers = () => {
    API.get('/borrowers')
      .then(res => setBorrowers(res.data))
      .catch(() => setError('Failed to load borrowers.'));
  };

  useEffect(() => { fetchBorrowers(); }, []);

  const openAdd = () => {
    setEditBorrower(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (b) => {
    setEditBorrower(b);
    setForm({ borrower_name: b.borrower_name, email: b.email || '', phone: b.phone || '' });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const req = editBorrower
      ? API.put(`/borrowers/${editBorrower.borrower_id}`, form)
      : API.post('/borrowers', form);
    req
      .then(() => { setShowModal(false); fetchBorrowers(); })
      .catch(() => setError('Failed to save borrower.'));
  };

  const handleDelete = (b) => {
    if (!window.confirm(`Delete borrower "${b.borrower_name}"?`)) return;
    API.delete(`/borrowers/${b.borrower_id}`)
      .then(() => fetchBorrowers())
      .catch(() => setError('Failed to delete borrower.'));
  };

  return (
    <div>
      <div className="page-header">
        <h1>Borrowers</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Borrower</button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {borrowers.length === 0 ? (
              <tr><td colSpan={5} className="empty-state">No borrowers found.</td></tr>
            ) : borrowers.map(b => (
              <tr key={b.borrower_id}>
                <td>{b.borrower_id}</td>
                <td>{b.borrower_name}</td>
                <td>{b.email || '—'}</td>
                <td>{b.phone || '—'}</td>
                <td>
                  <button className="btn btn-warning btn-sm" onClick={() => openEdit(b)} style={{marginRight: 6}}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editBorrower ? 'Edit Borrower' : 'Add New Borrower'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name *</label>
                <input required value={form.borrower_name} onChange={e => setForm({...form, borrower_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn" style={{background:'#eee'}} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editBorrower ? 'Save Changes' : 'Add Borrower'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
