import { useState, useEffect } from 'react';
import API from '../api';

export default function Transactions() {
  const [books, setBooks] = useState([]);
  const [borrowers, setBorrowers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Borrow form
  const [borrowBookId, setBorrowBookId] = useState('');
  const [borrowBorrowerId, setBorrowBorrowerId] = useState('');

  // Return form
  const [returnTransactionId, setReturnTransactionId] = useState('');

  const fetchAll = () => {
    API.get('/books').then(r => setBooks(r.data)).catch(() => {});
    API.get('/borrowers').then(r => setBorrowers(r.data)).catch(() => {});
    API.get('/transactions').then(r => setTransactions(r.data)).catch(() => {});
  };

  useEffect(() => { fetchAll(); }, []);

  const availableBooks = books.filter(b => b.availability_status === 'available');
  const activeTransactions = transactions.filter(t => !t.return_date);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleBorrow = (e) => {
    e.preventDefault();
    setError('');
    API.post('/borrow', { book_id: parseInt(borrowBookId), borrower_id: parseInt(borrowBorrowerId) })
      .then(() => {
        setBorrowBookId('');
        setBorrowBorrowerId('');
        showSuccess('Book borrowed successfully!');
        fetchAll();
      })
      .catch(err => setError(err.response?.data?.detail || 'Failed to borrow book.'));
  };

  const handleReturn = (e) => {
    e.preventDefault();
    setError('');
    API.post('/return', { transaction_id: parseInt(returnTransactionId) })
      .then(() => {
        setReturnTransactionId('');
        showSuccess('Book returned successfully!');
        fetchAll();
      })
      .catch(err => setError(err.response?.data?.detail || 'Failed to return book.'));
  };

  return (
    <div>
      <div className="page-header">
        <h1>Borrow / Return</h1>
      </div>

      {error && <div className="error-msg">{error}</div>}
      {successMsg && (
        <div className="error-msg" style={{ background: '#d4edda', color: '#155724' }}>{successMsg}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Borrow Section */}
        <div className="section-box">
          <h2>Borrow a Book</h2>
          <form onSubmit={handleBorrow}>
            <div className="form-group">
              <label>Select Available Book</label>
              <select required value={borrowBookId} onChange={e => setBorrowBookId(e.target.value)}>
                <option value="">-- Choose a book --</option>
                {availableBooks.map(b => (
                  <option key={b.book_id} value={b.book_id}>
                    {b.title} — {b.author}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Select Borrower</label>
              <select required value={borrowBorrowerId} onChange={e => setBorrowBorrowerId(e.target.value)}>
                <option value="">-- Choose a borrower --</option>
                {borrowers.map(b => (
                  <option key={b.borrower_id} value={b.borrower_id}>
                    {b.borrower_name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-success" style={{ marginTop: 8 }}>Borrow Book</button>
          </form>
        </div>

        {/* Return Section */}
        <div className="section-box">
          <h2>Return a Book</h2>
          <form onSubmit={handleReturn}>
            <div className="form-group">
              <label>Select Active Borrow Transaction</label>
              <select required value={returnTransactionId} onChange={e => setReturnTransactionId(e.target.value)}>
                <option value="">-- Choose a transaction --</option>
                {activeTransactions.map(t => (
                  <option key={t.transaction_id} value={t.transaction_id}>
                    #{t.transaction_id} — {t.book_title} (by {t.borrower_name})
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-warning" style={{ marginTop: 8 }}>Return Book</button>
          </form>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="section-box">
        <h2>All Transactions</h2>
        <div className="table-wrapper" style={{ boxShadow: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Book</th>
                <th>Borrower</th>
                <th>Borrowed On</th>
                <th>Returned On</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr><td colSpan={6} className="empty-state">No transactions yet.</td></tr>
              ) : transactions.map(t => (
                <tr key={t.transaction_id}>
                  <td>{t.transaction_id}</td>
                  <td>{t.book_title || t.book_id}</td>
                  <td>{t.borrower_name || t.borrower_id}</td>
                  <td>{t.borrow_date ? new Date(t.borrow_date).toLocaleDateString() : '—'}</td>
                  <td>{t.return_date ? new Date(t.return_date).toLocaleDateString() : '—'}</td>
                  <td>
                    {t.return_date
                      ? <span className="badge badge-available">Returned</span>
                      : <span className="badge badge-borrowed">Active</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
