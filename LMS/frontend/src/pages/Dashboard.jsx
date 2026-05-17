import { useState, useEffect } from 'react';
import API from '../api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/dashboard')
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load dashboard data. Make sure the backend is running.'));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {data && (
        <>
          <div className="cards-row">
            <div className="stat-card">
              <h3>Total Books</h3>
              <div className="stat-value">{data.total_books}</div>
            </div>
            <div className="stat-card available">
              <h3>Available</h3>
              <div className="stat-value">{data.available_books}</div>
            </div>
            <div className="stat-card borrowed">
              <h3>Borrowed</h3>
              <div className="stat-value">{data.borrowed_books}</div>
            </div>
          </div>

          <div className="section-box">
            <h2>Recent Transactions</h2>
            {data.recent_transactions.length === 0 ? (
              <div className="empty-state">No transactions yet.</div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Book</th>
                      <th>Borrower</th>
                      <th>Borrowed On</th>
                      <th>Returned On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_transactions.map(t => (
                      <tr key={t.transaction_id}>
                        <td>{t.transaction_id}</td>
                        <td>{t.book_title || t.book_id}</td>
                        <td>{t.borrower_name || t.borrower_id}</td>
                        <td>{t.borrow_date ? new Date(t.borrow_date).toLocaleDateString() : '—'}</td>
                        <td>
                          {t.return_date
                            ? new Date(t.return_date).toLocaleDateString()
                            : <span className="badge badge-borrowed">Active</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
