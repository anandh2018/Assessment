import { useState, useEffect } from 'react';
import API from '../api';
import { getLMSAnalyticsSummary, getLMSPopularBooks, getLMSCategoryStats, getLMSMonthlyTrends, runLMSETL } from '../api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const [lmsAnalytics, setLmsAnalytics] = useState(null);
  const [popularBooks, setPopularBooks] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [etlLoading, setEtlLoading] = useState(false);
  const [etlMsg, setEtlMsg] = useState('');

  useEffect(() => {
    API.get('/dashboard')
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load dashboard data. Make sure the backend is running.'));
  }, []);

  useEffect(() => {
    Promise.all([getLMSAnalyticsSummary(), getLMSPopularBooks(), getLMSCategoryStats(), getLMSMonthlyTrends()])
      .then(([s, b, c, m]) => { setLmsAnalytics(s); setPopularBooks(b); setCategoryStats(c); setMonthlyTrends(m); })
      .catch(() => {});
  }, []);

  const handleRunETL = () => {
    setEtlLoading(true);
    setEtlMsg('');
    runLMSETL()
      .then(res => {
        setEtlMsg(`ETL complete: ${res.records_processed} records processed.`);
        return Promise.all([getLMSAnalyticsSummary(), getLMSPopularBooks(), getLMSCategoryStats(), getLMSMonthlyTrends()]);
      })
      .then(([s, b, c, m]) => { setLmsAnalytics(s); setPopularBooks(b); setCategoryStats(c); setMonthlyTrends(m); })
      .catch(() => setEtlMsg('ETL failed. Ensure backend is running.'))
      .finally(() => setEtlLoading(false));
  };

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

      {/* ETL Analytics */}
      <div style={{ background: '#fff', borderRadius: '10px', padding: '20px', marginTop: '24px', border: '2px solid #6c757d', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, color: '#2c3e50' }}>ETL Analytics Pipeline</h3>
          <button onClick={handleRunETL} disabled={etlLoading} style={{ background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 18px', cursor: 'pointer', fontWeight: 600 }}>
            {etlLoading ? 'Running...' : 'Run ETL'}
          </button>
        </div>
        {etlMsg && <div style={{ padding: '8px 12px', background: '#f0f0f0', borderRadius: '6px', color: '#2c3e50', marginBottom: '12px', fontSize: '14px' }}>{etlMsg}</div>}
        {lmsAnalytics && lmsAnalytics.total_transactions > 0 ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'Total Transactions', value: lmsAnalytics.total_transactions, color: '#6c757d' },
                { label: 'Overdue Books', value: lmsAnalytics.overdue_count, color: '#dc3545' },
                { label: 'Returned', value: lmsAnalytics.returned_count, color: '#28a745' },
              ].map(s => (
                <div key={s.label} style={{ background: '#f8f9fa', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{s.label}</div>
                </div>
              ))}
            </div>
            {popularBooks.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 600, marginBottom: '10px', color: '#2c3e50' }}>Top 10 Most Borrowed Books</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #eee', background: '#f8f9fa' }}>
                      <th style={{ textAlign: 'left', padding: '6px 8px' }}>Title</th>
                      <th style={{ textAlign: 'left', padding: '6px 8px' }}>Author</th>
                      <th style={{ textAlign: 'left', padding: '6px 8px' }}>Category</th>
                      <th style={{ textAlign: 'center', padding: '6px 8px' }}>Times Borrowed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {popularBooks.map((b, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '6px 8px', fontWeight: 500 }}>{b.book_title}</td>
                        <td style={{ padding: '6px 8px', color: '#555' }}>{b.author}</td>
                        <td style={{ padding: '6px 8px' }}><span style={{ background: '#e9ecef', borderRadius: '4px', padding: '2px 6px', fontSize: '12px' }}>{b.category}</span></td>
                        <td style={{ textAlign: 'center', padding: '6px 8px', fontWeight: 700, color: '#6c757d' }}>{b.borrow_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {monthlyTrends.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 600, marginBottom: '10px', color: '#2c3e50' }}>Monthly Borrowing Trends</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '80px' }}>
                  {monthlyTrends.map(m => {
                    const maxCount = Math.max(...monthlyTrends.map(t => t.borrow_count), 1);
                    return (
                      <div key={m.year_month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 600 }}>{m.borrow_count}</div>
                        <div style={{ width: '100%', background: '#6c757d', height: `${Math.max((m.borrow_count / maxCount) * 60, 4)}px`, borderRadius: '3px 3px 0 0' }} />
                        <div style={{ fontSize: '9px', color: '#666', transform: 'rotate(-30deg)', transformOrigin: 'center', marginTop: '2px' }}>{m.year_month.slice(5)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {categoryStats.length > 0 && (
              <div>
                <div style={{ fontWeight: 600, marginBottom: '10px', color: '#2c3e50' }}>Category-wise Borrowing</div>
                {categoryStats.map(c => (
                  <div key={c.category} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                    <div style={{ width: '130px', fontSize: '12px', color: '#555' }}>{c.category}</div>
                    <div style={{ flex: 1, background: '#eee', borderRadius: '4px', height: '16px' }}>
                      <div style={{ width: `${Math.min((c.borrow_count / 40) * 100, 100)}%`, background: '#6c757d', height: '100%', borderRadius: '4px' }} />
                    </div>
                    <div style={{ width: '28px', fontSize: '12px', fontWeight: 600, textAlign: 'right' }}>{c.borrow_count}</div>
                    {c.overdue_count > 0 && <div style={{ fontSize: '11px', color: '#dc3545' }}>{c.overdue_count} overdue</div>}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', color: '#999', padding: '20px', fontSize: '14px' }}>
            No ETL data loaded. Click "Run ETL" to process the library transactions dataset.
          </div>
        )}
      </div>
    </div>
  );
}
